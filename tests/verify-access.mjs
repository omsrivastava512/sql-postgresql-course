import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to an administrator connection in a disposable local cluster.');
const connectionString = process.env.COURSE_DATABASE_URL;
const admin = new pg.Client({ connectionString, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
const clients = new Set();
const temporaryLogins = new Set();
const report = { environment: {}, suites: [] };
let connected = false;
let checks = 0;
const read = (lab, file) => readFile(new URL('../labs/' + lab + '/' + file, import.meta.url), 'utf8');
const ids = values => values.map(id => ({ id }));

function equal(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}

async function rows(client, sql, expected) {
  equal((await client.query(sql)).rows, expected);
}

async function denied(client, sql, code = '42501') {
  let failure;
  try { await client.query(sql); } catch (error) { failure = error; }
  assert.ok(failure, 'Expected rejection for ' + sql);
  equal(failure.code, code);
}

async function reset(lab, solved = true) {
  for (const client of clients) await client.query('ROLLBACK');
  await admin.query('RESET ROLE');
  await admin.query(await read(lab, 'setup.sql'));
  if (solved) await admin.query(await read(lab, 'solution.sql'));
}

async function login(role) {
  assert.match(role, /^course_(priv|policy|tenant|code)_[a-z]+$/);
  const attributes = (await admin.query('SELECT rolsuper, rolcreaterole, rolcreatedb, rolreplication, rolbypassrls, rolcanlogin FROM pg_roles WHERE rolname = $1', [role])).rows;
  equal(attributes, [{ rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolreplication: false, rolbypassrls: false, rolcanlogin: false }]);
  equal((await admin.query('SELECT count(*)::integer AS n FROM pg_auth_members WHERE member = (SELECT oid FROM pg_roles WHERE rolname = $1)', [role])).rows, [{ n: 0 }]);
  const password = randomBytes(32).toString('hex');
  await admin.query('ALTER ROLE ' + role + " LOGIN PASSWORD '" + password + "'");
  temporaryLogins.add(role);
  const url = new URL(connectionString);
  url.username = role;
  url.password = password;
  const wrongUrl = new URL(url);
  wrongUrl.password = randomBytes(32).toString('hex');
  const wrong = new pg.Client({ connectionString: wrongUrl.href, connectionTimeoutMillis: 10000 });
  let failure;
  try { await wrong.connect(); } catch (error) { failure = error; } finally { await wrong.end(); }
  assert.ok(failure, 'Wrong-password login succeeded; configure password authentication for the course roles, not trust.');
  equal(failure.code, '28P01');
  const client = new pg.Client({ connectionString: url.href, connectionTimeoutMillis: 10000, statement_timeout: 10000, idle_in_transaction_session_timeout: 60000, application_name: 'course-access-' + role });
  try { await client.connect(); } catch (error) { await client.end(); throw error; }
  clients.add(client);
  await rows(client, 'SELECT current_user, session_user', [{ current_user: role, session_user: role }]);
  await denied(client, 'SET ROLE ' + report.environment.admin_role);
  await client.query('RESET ROLE');
  await rows(client, 'SELECT current_user', [{ current_user: role }]);
  return client;
}

async function privileges() {
  const lab = '23-database-roles';
  await reset(lab);
  const reader = await login('course_priv_reader');
  const writer = await login('course_priv_writer');
  const dispatch = await login('course_priv_dispatch');
  await rows(reader, "SELECT app_role FROM course_priv.profiles WHERE db_role = current_user", [{ app_role: 'admin' }]);
  await rows(reader, 'SELECT id, subject FROM course_priv.tickets ORDER BY id', [{ id: 1, subject: 'Late delivery' }, { id: 2, subject: 'Missing item' }]);
  await denied(reader, 'SELECT * FROM course_priv.tickets');
  await denied(reader, "UPDATE course_priv.tickets SET subject = 'Forbidden' WHERE id = 1");
  await denied(reader, 'SET ROLE course_priv_writer');
  await admin.query('REVOKE USAGE ON SEQUENCE course_priv.tickets_id_seq FROM course_priv_writer');
  await denied(writer, "INSERT INTO course_priv.tickets (subject) VALUES ('Sequence denied')");
  await rows(admin, 'SELECT count(*)::integer AS n FROM course_priv.tickets', [{ n: 2 }]);
  await admin.query('GRANT USAGE ON SEQUENCE course_priv.tickets_id_seq TO course_priv_writer');
  await rows(writer, "INSERT INTO course_priv.tickets (subject) VALUES ('Third') RETURNING subject", [{ subject: 'Third' }]);
  await rows(writer, "UPDATE course_priv.tickets SET subject = 'Resolved' WHERE id = 1 RETURNING id", ids([1]));
  await denied(writer, "UPDATE course_priv.tickets SET internal_note = 'Forbidden' WHERE id = 1");
  await denied(writer, 'DELETE FROM course_priv.tickets WHERE id = 1');
  await rows(admin, 'SELECT id, subject, internal_note FROM course_priv.tickets WHERE id = 1', [{ id: 1, subject: 'Resolved', internal_note: 'Customer called twice' }]);
  await rows(dispatch, "UPDATE course_priv.deliveries SET status = 'sent' WHERE id = 10 RETURNING id, status", [{ id: 10, status: 'sent' }]);
  await denied(dispatch, 'SELECT private_address FROM course_priv.deliveries');
  await denied(dispatch, "UPDATE course_priv.deliveries SET tracking = 'Changed' WHERE id = 10");
  await admin.query('REVOKE SELECT (id, subject) ON course_priv.tickets FROM course_priv_reader');
  await denied(reader, 'SELECT id, subject FROM course_priv.tickets');
  return { lab, actualLogins: 3, evidence: 'Schema/table/column/sequence grants, forbidden role switching, same-connection revocation and unchanged private fields.' };
}

async function rowPolicies() {
  const lab = '24-row-policies';
  await reset(lab, false);
  const alice = await login('course_policy_alice');
  const bob = await login('course_policy_bob');
  await rows(alice, 'SELECT id FROM course_policy.documents ORDER BY id', ids([1, 2, 3]));
  await admin.query('ALTER TABLE course_policy.documents ENABLE ROW LEVEL SECURITY');
  await rows(alice, 'SELECT id FROM course_policy.documents', []);
  await denied(alice, "INSERT INTO course_policy.documents VALUES (4, current_user, 'Denied', false)");
  await admin.query(await read(lab, 'solution.sql'));
  await rows(alice, 'SELECT id FROM course_policy.documents ORDER BY id', ids([1, 3]));
  await rows(bob, 'SELECT id FROM course_policy.documents', ids([2]));
  await rows(alice, "INSERT INTO course_policy.documents VALUES (4, current_user, 'Own new', false) RETURNING id", ids([4]));
  await denied(alice, "INSERT INTO course_policy.documents VALUES (5, 'course_policy_bob', 'Cross user', false)");
  await rows(alice, "UPDATE course_policy.documents SET title = 'Revised' WHERE id = 1 RETURNING id", ids([1]));
  await rows(alice, "UPDATE course_policy.documents SET title = 'Hidden' WHERE id = 2 RETURNING id", []);
  await denied(alice, "UPDATE course_policy.documents SET owner_role = 'course_policy_bob' WHERE id = 1");
  await rows(alice, 'DELETE FROM course_policy.documents WHERE id IN (2, 3) RETURNING id', []);
  await rows(alice, 'DELETE FROM course_policy.documents WHERE id = 4 RETURNING id', ids([4]));
  await denied(alice, 'ALTER TABLE course_policy.documents DISABLE ROW LEVEL SECURITY');
  await denied(alice, 'TRUNCATE course_policy.documents');
  await denied(alice, 'SET ROLE course_policy_bob');
  await alice.query('SET row_security = off');
  await denied(alice, 'SELECT id FROM course_policy.documents');
  await alice.query('RESET row_security');
  await rows(admin, 'SELECT id, title FROM course_policy.documents ORDER BY id', [{ id: 1, title: 'Revised' }, { id: 2, title: 'Bob draft' }, { id: 3, title: 'Alice archive' }]);
  await rows(alice, 'SELECT id FROM course_policy.messages', ids([10]));
  await denied(alice, "UPDATE course_policy.messages SET recipient_role = 'course_policy_bob' WHERE id = 10");
  await rows(bob, 'SELECT id FROM course_policy.messages', ids([20]));
  return { lab, actualLogins: 2, evidence: 'Default deny, allowed/forbidden CRUD, zero-row hidden writes, rejected owner reassignment and failed bypass attempts.' };
}

async function tenantMembership() {
  const lab = '25-tenant-membership';
  await reset(lab);
  const alice = await login('course_tenant_alice');
  const bob = await login('course_tenant_bob');
  const outsider = await login('course_tenant_outsider');
  await rows(alice, 'SELECT id FROM course_tenant.tasks ORDER BY id', ids([11, 12]));
  await rows(bob, 'SELECT id FROM course_tenant.tasks ORDER BY id', ids([11, 12, 21]));
  await rows(outsider, 'SELECT id FROM course_tenant.tasks', []);
  await rows(alice, "INSERT INTO course_tenant.tasks VALUES (13, 1, 10, 'Alice new') RETURNING id", ids([13]));
  await rows(alice, 'DELETE FROM course_tenant.tasks WHERE id = 13 RETURNING id', ids([13]));
  await rows(alice, 'DELETE FROM course_tenant.tasks WHERE id = 21 RETURNING id', []);
  await rows(bob, 'DELETE FROM course_tenant.tasks WHERE id = 11 RETURNING id', []);
  await rows(outsider, 'DELETE FROM course_tenant.tasks WHERE id = 21 RETURNING id', []);
  await rows(alice, 'SELECT workspace_id, can_write FROM course_tenant.memberships ORDER BY workspace_id', [{ workspace_id: 1, can_write: true }]);
  await denied(alice, "INSERT INTO course_tenant.memberships VALUES (2, current_user, true)");
  await denied(bob, "UPDATE course_tenant.memberships SET can_write = true WHERE workspace_id = 1");
  await denied(alice, "UPDATE course_tenant.tasks SET workspace_id = 2, project_id = 20 WHERE id = 11");
  await denied(alice, "INSERT INTO course_tenant.tasks VALUES (14, 1, 20, 'Cross-tenant project')", '23503');
  await rows(bob, "UPDATE course_tenant.tasks SET title = 'No write right' WHERE id = 11 RETURNING id", []);
  await denied(bob, "INSERT INTO course_tenant.tasks VALUES (15, 1, 10, 'No write right')");
  await rows(bob, "UPDATE course_tenant.tasks SET title = 'Beta revised' WHERE id = 21 RETURNING id", ids([21]));
  await denied(outsider, "INSERT INTO course_tenant.tasks VALUES (16, 1, 10, 'Outsider')");
  await alice.query("SET course.actor = 'course_tenant_bob'");
  await rows(alice, 'SELECT id FROM course_tenant.tasks ORDER BY id', ids([11, 12]));
  await denied(alice, 'SET ROLE course_tenant_bob');
  await alice.query('RESET course.actor');
  await alice.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  await rows(alice, 'SELECT id FROM course_tenant.tasks ORDER BY id', ids([11, 12]));
  await admin.query("DELETE FROM course_tenant.memberships WHERE actor = 'course_tenant_alice'");
  await rows(alice, 'SELECT id FROM course_tenant.tasks ORDER BY id', ids([11, 12]));
  await alice.query('COMMIT');
  await rows(alice, 'SELECT id FROM course_tenant.tasks', []);
  await denied(alice, "INSERT INTO course_tenant.tasks VALUES (17, 1, 10, 'After revocation')");
  await rows(alice, 'SELECT id FROM course_tenant.visits', ids([101]));
  await rows(alice, "UPDATE course_tenant.visits SET subject = 'Changed checkup' WHERE id = 101 RETURNING id", ids([101]));
  await denied(alice, "UPDATE course_tenant.visits SET branch_id = 2 WHERE id = 101");
  await rows(bob, "UPDATE course_tenant.visits SET subject = 'Read only' WHERE id = 201 RETURNING id", []);
  await rows(outsider, 'SELECT id FROM course_tenant.visits', []);
  await rows(admin, 'SELECT id, workspace_id, project_id, title FROM course_tenant.tasks WHERE id = 21', [{ id: 21, workspace_id: 2, project_id: 20, title: 'Beta revised' }]);
  return { lab, actualLogins: 3, evidence: 'Member/nonmember/read-only matrix, protected membership writes, composite FK, spoofed setting rejected by design, revocation after snapshot end, clinic transfer.' };
}

async function privilegedCode() {
  const lab = '26-privileged-code';
  await reset(lab, false);
  const alice = await login('course_code_alice');
  const bob = await login('course_code_bob');
  const outsider = await login('course_code_outsider');
  await rows(alice, 'SELECT id FROM course_code.documents', ids([1]));
  await rows(alice, 'SELECT id FROM course_code.document_list ORDER BY id', ids([1, 2]));
  await rows(alice, 'SELECT course_code.document_count() AS n', [{ n: 2 }]);
  await rows(alice, 'SELECT course_code.worker_count() AS n', [{ n: 0 }]);
  await rows(outsider, 'SELECT course_code.document_count() AS n', [{ n: 2 }]);
  await denied(alice, 'SELECT * FROM course_code.labels');
  await denied(alice, 'SET ROLE course_code_owner');
  await admin.query('ALTER TABLE course_code.documents FORCE ROW LEVEL SECURITY; SET ROLE course_code_owner');
  await rows(admin, 'SELECT id FROM course_code.documents', []);
  await admin.query('RESET ROLE');
  await rows(admin, 'SELECT id FROM course_code.documents ORDER BY id', ids([1, 2]));
  await admin.query('ALTER TABLE course_code.documents NO FORCE ROW LEVEL SECURITY');
  await alice.query("CREATE TEMP TABLE labels (code integer, label text); INSERT INTO labels VALUES (1, 'Fake label'); GRANT SELECT ON labels TO course_code_worker");
  await rows(alice, 'SELECT course_code.label_for(1) AS label', [{ label: 'Fake label' }]);
  await admin.query(await read(lab, 'solution.sql'));
  await rows(alice, 'SELECT course_code.label_for(1) AS label', [{ label: 'Queued' }]);
  await rows(alice, 'SELECT course_code.label_for(999) AS label', [{ label: null }]);
  await rows(alice, 'SELECT id FROM course_code.document_list', ids([1]));
  await rows(bob, 'SELECT id FROM course_code.document_list', ids([2]));
  await rows(alice, 'SELECT course_code.document_count() AS n', [{ n: 1 }]);
  await rows(bob, 'SELECT course_code.document_count() AS n', [{ n: 1 }]);
  await denied(outsider, 'SELECT course_code.document_count()');
  await denied(outsider, 'SELECT course_code.label_for(1)');
  await denied(outsider, 'SELECT course_code.delivery_label_for(5)');
  await rows(alice, 'SELECT course_code.delivery_label_for(5) AS first, course_code.delivery_label_for(6) AS second, course_code.delivery_label_for(999) AS missing', [{ first: 'Collected', second: 'Delivered', missing: null }]);
  await denied(alice, 'SELECT * FROM course_code.delivery_labels');
  await denied(alice, 'CREATE TABLE course_code.spoof (id integer)');
  await admin.query('REVOKE SELECT ON course_code.documents FROM course_code_alice');
  await denied(alice, 'SELECT * FROM course_code.document_list');
  await denied(alice, 'SELECT course_code.document_count()');
  return { lab, actualLogins: 3, evidence: 'Default view/owner-function exposure, narrower definer obeys RLS, FORCE owner versus superuser, temp-table shadowing repaired, explicit EXECUTE grants, base-table privilege required.' };
}

try {
  await admin.connect();
  connected = true;
  report.environment = (await admin.query("SELECT version() AS version, current_user AS admin_role, current_setting('server_version_num') AS server_version_num, current_setting('password_encryption') AS password_encryption")).rows[0];
  assert.match(report.environment.admin_role, /^[a-z_][a-z0-9_]*$/);
  await rows(admin, 'SELECT rolsuper FROM pg_roles WHERE rolname = current_user', [{ rolsuper: true }]);
  const suites = [['23', privileges], ['24', rowPolicies], ['25', tenantMembership], ['26', privilegedCode]];
  if (process.argv.includes('--reverse')) suites.reverse();
  const selected = process.argv.find(argument => argument.startsWith('--lab='));
  if (selected && !suites.some(([number]) => selected === '--lab=' + number)) throw new Error('Choose --lab=23 through --lab=26.');
  for (const [number, run] of suites) {
    if (!selected || selected === '--lab=' + number) report.suites.push(await run());
  }
} finally {
  for (const client of clients) {
    try { await client.query('ROLLBACK'); } catch {}
    try { await client.end(); } catch {}
  }
  if (connected) {
    const cleanupErrors = [];
    try {
      await admin.query('ROLLBACK');
      await admin.query('RESET ROLE');
      for (const role of temporaryLogins) {
        try { await admin.query('ALTER ROLE ' + role + ' NOLOGIN PASSWORD NULL'); } catch (error) { cleanupErrors.push(error); }
      }
      equal((await admin.query('SELECT count(*)::integer AS n FROM pg_authid WHERE rolname = ANY($1::name[]) AND NOT rolcanlogin AND rolpassword IS NULL', [[...temporaryLogins]])).rows, [{ n: temporaryLogins.size }]);
    } finally { await admin.end(); }
    if (cleanupErrors.length) throw new AggregateError(cleanupErrors, 'Could not restore temporary login roles.');
  }
}
report.assertions = checks;
report.actualRestrictedLogins = report.suites.reduce((total, suite) => total + suite.actualLogins, 0);
report.temporaryCredentialsRemoved = true;
console.log(JSON.stringify(report, null, 2));
console.log('PASS ' + checks + ' access assertions across ' + report.suites.length + ' labs with ' + report.actualRestrictedLogins + ' actual restricted logins.');
