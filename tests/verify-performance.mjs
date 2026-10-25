import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { readCustomers, readProjects } from '../labs/22-request-work/request.mjs';

if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to a disposable database.');
const connectionString = process.env.COURSE_DATABASE_URL;
const clients = ['measure', 'snapshot', 'writer'].map(name => new pg.Client({
  connectionString, connectionTimeoutMillis: 10000, application_name: 'course-performance-' + name
}));
const [a, b, c] = clients;
const connected = new Set();
const report = { environment: {}, suites: [] };
const notices = [];
a.on('notice', notice => notices.push(notice.message));
let checks = 0;
const read = (lab, file) => readFile(new URL('../labs/' + lab + '/' + file, import.meta.url), 'utf8');

function equal(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}

async function rows(sql, expected) {
  equal((await a.query(sql)).rows, expected);
}

async function reset(lab) {
  for (const client of clients) await client.query('ROLLBACK');
  await a.query(await read(lab, 'setup.sql'));
}

async function explain(sql, write = false) {
  if (write) await a.query('BEGIN');
  try {
    return (await a.query('EXPLAIN (ANALYZE, BUFFERS, WAL, FORMAT JSON) ' + sql)).rows[0]['QUERY PLAN'][0];
  } finally {
    if (write) await a.query('ROLLBACK');
  }
}

function nodes(plan) {
  return [plan, ...(plan.Plans ?? []).flatMap(nodes)];
}

function summary(plan) {
  return {
    executionMs: plan['Execution Time'],
    sharedHits: plan.Plan['Shared Hit Blocks'] ?? 0,
    sharedReads: plan.Plan['Shared Read Blocks'] ?? 0,
    walBytes: plan.Plan['WAL Bytes'] ?? 0,
    nodes: nodes(plan.Plan).map(node => ({
      type: node['Node Type'], relation: node['Relation Name'], index: node['Index Name'],
      estimatedRows: node['Plan Rows'], actualRows: node['Actual Rows'], loops: node['Actual Loops'],
      removedByFilter: node['Rows Removed by Filter'], heapFetches: node['Heap Fetches']
    }))
  };
}

async function measure(sql, write = false) {
  const firstPlan = await explain(sql, write);
  const subsequent = [];
  for (let run = 0; run < 5; run++) subsequent.push(summary(await explain(sql, write)));
  return { sql, firstPlan, first: summary(firstPlan), subsequent };
}

async function queryPlans() {
  const lab = '18-query-plans';
  await reset(lab);
  const query = 'SELECT id, amount_cents FROM course_plan.orders WHERE customer_id = 42 ORDER BY id';
  const expected = Array.from({ length: 40 }, (_, index) => ({ id: 42 + 1000 * index, amount_cents: 142 }));
  await rows(query, expected);
  const before = await measure(query);
  const plainExplain = (await a.query('EXPLAIN (FORMAT JSON) UPDATE course_plan.orders SET amount_cents = amount_cents + 1 WHERE id = 1')).rows[0]['QUERY PLAN'][0];
  equal(Object.hasOwn(plainExplain, 'Execution Time'), false);
  await rows('SELECT amount_cents FROM course_plan.orders WHERE id = 1', [{ amount_cents: 101 }]);
  await a.query('BEGIN');
  await a.query('EXPLAIN ANALYZE UPDATE course_plan.orders SET amount_cents = amount_cents + 1 WHERE id = 1');
  await rows('SELECT amount_cents FROM course_plan.orders WHERE id = 1', [{ amount_cents: 102 }]);
  await a.query('ROLLBACK');
  await rows('SELECT amount_cents FROM course_plan.orders WHERE id = 1', [{ amount_cents: 101 }]);
  await a.query(await read(lab, 'solution.sql'));
  await rows(query, expected);
  const after = await measure(query);
  const broad = await measure('SELECT * FROM course_plan.orders');
  equal(broad.firstPlan.Plan['Actual Rows'], 40000);
  const repeatedSql = 'SELECT c.customer_id, (SELECT count(*)::integer FROM course_plan.orders o WHERE o.customer_id = c.customer_id) AS n FROM (VALUES (1), (42), (999)) c(customer_id) ORDER BY c.customer_id';
  await rows(repeatedSql, [{ customer_id: 1, n: 40 }, { customer_id: 42, n: 40 }, { customer_id: 999, n: 40 }]);
  const repeated = await measure(repeatedSql);
  assert.ok(nodes(repeated.firstPlan.Plan).some(node => node['Actual Loops'] === 3));
  checks++;
  const transfer = await measure('SELECT id, package_units FROM course_plan.deliveries WHERE route_id = 7 AND NOT delivered ORDER BY id');
  await rows('SELECT count(*)::integer AS n, sum(package_units)::integer AS units FROM course_plan.deliveries WHERE route_id = 7 AND NOT delivered', [{ n: 20, units: 80 }]);
  return { lab, before, after, broad, repeated, transfer };
}

async function indexDecisions() {
  const lab = '19-index-decisions';
  await reset(lab);
  const query = 'SELECT id, total_cents FROM course_index.orders WHERE customer_id = 42 ORDER BY placed_at DESC, id DESC LIMIT 5';
  const expected = [59042, 58042, 57042, 56042, 55042].map(id => ({ id, total_cents: 142 }));
  await rows("SELECT indexname FROM pg_indexes WHERE schemaname = 'course_index' AND tablename = 'orders'", [{ indexname: 'orders_pkey' }]);
  await rows(query, expected);
  const before = await measure(query);
  const original = (await a.query('SELECT * FROM course_index.orders ORDER BY id')).rows;
  const update = "UPDATE course_index.orders SET placed_at = placed_at + interval '1 second' WHERE id <= 1000";
  const writeBefore = await measure(update, true);
  await rows('SELECT * FROM course_index.orders ORDER BY id', original);
  await a.query('VACUUM course_index.orders');
  await a.query('CREATE INDEX orders_customer_only_idx ON course_index.orders (customer_id)');
  const single = await measure(query);
  await a.query('DROP INDEX course_index.orders_customer_only_idx');
  await a.query(await read(lab, 'solution.sql'));
  await rows(query, expected);
  const composite = await measure(query);
  const queue = await measure("SELECT id FROM course_index.orders WHERE status = 'open' ORDER BY placed_at, id LIMIT 5");
  await rows("SELECT id FROM course_index.orders WHERE status = 'open' ORDER BY placed_at, id LIMIT 5", [100, 200, 300, 400, 500].map(id => ({ id })));
  await a.query('CREATE INDEX orders_all_time_idx ON course_index.orders (placed_at, id)');
  const sizes = (await a.query("SELECT relname, pg_relation_size(oid)::integer AS bytes FROM pg_class WHERE oid IN ('course_index.orders_open_idx'::regclass, 'course_index.orders_all_time_idx'::regclass, 'course_index.orders_customer_recent_idx'::regclass) ORDER BY relname")).rows;
  assert.ok(sizes.every(item => item.bytes > 0));
  checks++;
  const closed = await measure("SELECT id FROM course_index.orders WHERE status = 'closed' ORDER BY placed_at, id LIMIT 5");
  await a.query('DROP INDEX course_index.orders_all_time_idx');
  await a.query('DROP INDEX course_index.orders_open_idx');
  const writeAfter = await measure(update, true);
  await rows('SELECT * FROM course_index.orders ORDER BY id', original);
  await a.query("CREATE INDEX orders_open_idx ON course_index.orders (placed_at, id) WHERE status = 'open'");
  const transfer = await measure('SELECT id FROM course_index.tickets WHERE project_id = 8 ORDER BY created_at DESC, id DESC LIMIT 3');
  await rows('SELECT id FROM course_index.tickets WHERE project_id = 8 ORDER BY created_at DESC, id DESC LIMIT 3', [11808, 11608, 11408].map(id => ({ id })));
  return { lab, before, single, composite, queue, closed, sizes, writeBefore, writeAfter, transfer };
}

async function deepPages() {
  const lab = '20-deep-pages';
  await reset(lab);
  await a.query(await read(lab, 'solution.sql'));
  const base = 'SELECT id FROM course_page.events WHERE workspace_id = 7';
  const shallow = await measure(base + ' ORDER BY occurred_at, id LIMIT 10');
  const deepSql = base + ' ORDER BY occurred_at, id LIMIT 10 OFFSET 9000';
  const cursorSql = base + " AND (occurred_at, id) > (timestamptz '2026-01-01 06:23:19+00', 69000) ORDER BY occurred_at, id LIMIT 10";
  await rows(deepSql, Array.from({ length: 10 }, (_, index) => ({ id: 69001 + index })));
  await rows(cursorSql, (await a.query(deepSql)).rows);
  const deep = await measure(deepSql);
  const cursor = await measure(cursorSql);
  await rows(base + " AND (occurred_at, id) > (timestamptz '2026-01-01 05:33:20+00', 60001) ORDER BY occurred_at, id LIMIT 3", [60002, 60003, 60004].map(id => ({ id })));
  await rows(base + " AND occurred_at > timestamptz '2026-01-01 05:33:20+00' ORDER BY occurred_at, id LIMIT 3", [60004, 60005, 60006].map(id => ({ id })));
  await a.query("INSERT INTO course_page.events VALUES (100001, 7, '2025-12-31 00:00+00', 'Earlier new event')");
  await rows(cursorSql, Array.from({ length: 10 }, (_, index) => ({ id: 69001 + index })));
  await a.query("UPDATE course_page.events SET occurred_at = '2025-12-31 00:00+00' WHERE id = 69005");
  await rows(cursorSql, [69001, 69002, 69003, 69004, 69006, 69007, 69008, 69009, 69010, 69011].map(id => ({ id })));
  const transferSql = "SELECT id FROM course_page.messages WHERE channel_id = 2 AND (sent_at, id) < (timestamptz '2026-01-01 00:37:29+00', 4500) ORDER BY sent_at DESC, id DESC LIMIT 5";
  await rows(transferSql, [4499, 4498, 4497, 4496, 4495].map(id => ({ id })));
  const transfer = await measure(transferSql);
  return { lab, shallow, deep, cursor, transfer, cursorAcquisition: 'Supplied previous-page key; arbitrary page-number lookup is not included.' };
}

async function statisticsMaintenance() {
  const lab = '21-statistics-maintenance';
  await reset(lab);
  const sql = "SELECT * FROM course_maintenance.tasks WHERE status = 'open'";
  const initial = await explain(sql);
  equal(initial.Plan['Actual Rows'], 40);
  await a.query("UPDATE course_maintenance.tasks SET status = 'open' WHERE id BETWEEN 41 AND 20000");
  const stale = await explain(sql);
  equal(stale.Plan['Actual Rows'], 20000);
  await a.query('ANALYZE course_maintenance.tasks');
  const refreshed = await explain(sql);
  equal(refreshed.Plan['Actual Rows'], 20000);
  assert.ok(Math.abs(refreshed.Plan['Plan Rows'] - 20000) < Math.abs(stale.Plan['Plan Rows'] - 20000), 'Expected refreshed estimate closer to known fixture count');
  checks++;
  await a.query("UPDATE course_maintenance.mail SET status = 'queued' WHERE id BETWEEN 21 AND 1000");
  const transferStale = await explain("SELECT * FROM course_maintenance.mail WHERE status = 'queued'");
  await a.query('ANALYZE course_maintenance.mail');
  const transferRefreshed = await explain("SELECT * FROM course_maintenance.mail WHERE status = 'queued'");
  equal(transferRefreshed.Plan['Actual Rows'], 1000);
  assert.ok(Math.abs(transferRefreshed.Plan['Plan Rows'] - 1000) < Math.abs(transferStale.Plan['Plan Rows'] - 1000));
  checks++;

  await reset(lab);
  await b.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
  equal((await b.query('SELECT count(*)::integer AS n FROM course_maintenance.tasks')).rows, [{ n: 40000 }]);
  await c.query('DELETE FROM course_maintenance.tasks WHERE id > 10000');
  equal((await b.query('SELECT count(*)::integer AS n FROM course_maintenance.tasks')).rows, [{ n: 40000 }]);
  await rows('SELECT count(*)::integer AS n FROM course_maintenance.tasks', [{ n: 10000 }]);
  notices.length = 0;
  await a.query(await read(lab, 'vacuum.sql'));
  const heldSnapshotVacuum = [...notices];
  const heldStats = (await a.query("SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE schemaname = 'course_maintenance' AND relname = 'tasks'")).rows;
  await b.query('COMMIT');
  notices.length = 0;
  await a.query(await read(lab, 'vacuum.sql'));
  const releasedSnapshotVacuum = [...notices];
  const releasedStats = (await a.query("SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE schemaname = 'course_maintenance' AND relname = 'tasks'")).rows;
  const vacuumCounts = messages => {
    const message = messages.find(text => text.includes('.course_maintenance.tasks"') && text.startsWith('finished vacuuming'));
    const match = message?.match(/tuples: (\d+) removed, (\d+) remain, (\d+) are dead but not yet removable/);
    assert.ok(match, 'Expected PostgreSQL 17 task-table vacuum counters');
    return { removed: Number(match[1]), notRemovable: Number(match[3]) };
  };
  equal(vacuumCounts(heldSnapshotVacuum), { removed: 0, notRemovable: 30000 });
  equal(vacuumCounts(releasedSnapshotVacuum), { removed: 30000, notRemovable: 0 });
  await rows('SELECT count(*)::integer AS n FROM course_maintenance.tasks', [{ n: 10000 }]);
  await a.query('ALTER TABLE course_maintenance.tasks RESET (autovacuum_enabled); ALTER TABLE course_maintenance.mail RESET (autovacuum_enabled)');
  await rows("SELECT relname, reloptions FROM pg_class WHERE oid IN ('course_maintenance.tasks'::regclass, 'course_maintenance.mail'::regclass) ORDER BY relname", [{ relname: 'mail', reloptions: null }, { relname: 'tasks', reloptions: null }]);
  return { lab, initial, stale, refreshed, transferStale, transferRefreshed, heldSnapshotVacuum, heldStats, releasedSnapshotVacuum, releasedStats };
}

async function requestWork() {
  const lab = '22-request-work';
  await reset(lab);
  const samples = [];
  const expected = Array.from({ length: 30 }, (_, index) => {
    const id = index + 1;
    return { id, name: 'Customer ' + id, orders: id <= 24 ? [id, id + 48, id + 96].map(orderId => ({ id: orderId, cents: orderId * 100 })) : [] };
  });
  for (const mode of ['loop', 'batch', 'join']) {
    const runs = [];
    for (let run = 0; run < 6; run++) {
      const result = await readCustomers(a, mode);
      equal(result.customers, expected);
      equal(result.queryCount, { loop: 31, batch: 2, join: 1 }[mode]);
      const { customers, ...metrics } = result;
      runs.push(metrics);
    }
    samples.push({ mode, first: runs[0], subsequent: runs.slice(1) });
  }
  equal(expected.length, 30);
  equal(expected.filter(customer => customer.orders.length === 0).map(customer => customer.id), [25, 26, 27, 28, 29, 30]);
  equal(expected.flatMap(customer => customer.orders).length, 72);
  for (const pattern of ['No such customer', "%' OR true; DROP TABLE course_request.orders; --"]) {
    for (const mode of ['loop', 'batch', 'join']) {
      const result = await readCustomers(a, mode, pattern);
      equal(result.customers, []);
      equal(result.queryCount, 1);
    }
  }
  await rows('SELECT count(*)::integer AS n FROM course_request.orders', [{ n: 120 }]);
  for (const sort of ['id', 'name']) {
    const limited = await readCustomers(a, 'loop', 'Customer %', 3, sort);
    equal((await readCustomers(a, 'batch', 'Customer %', 3, sort)).customers, limited.customers);
    equal((await readCustomers(a, 'join', 'Customer %', 3, sort)).customers, limited.customers);
    equal(limited.customers.length, 3);
  }
  await assert.rejects(readCustomers(a, 'batch', 'Customer %', 30, 'id; DROP TABLE customers'), /Choose id or name/);
  checks++;
  await assert.rejects(readCustomers(a, 'batch', 'Customer %', 0), /Limit/);
  checks++;
  const projectLoop = await readProjects(a, 'loop');
  const projectGroup = await readProjects(a, 'group');
  equal(projectLoop.projects, [{ id: 1, open_tasks: 2 }, { id: 2, open_tasks: 0 }, { id: 3, open_tasks: 0 }]);
  equal(projectGroup.projects, projectLoop.projects);
  equal(projectLoop.queryCount, 4);
  equal(projectGroup.queryCount, 1);

  const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000, statement_timeout: 10000, application_name: 'course-performance-pool' });
  let first;
  let second;
  let checkout;
  let poolObservation;
  try {
    first = await pool.connect();
    const firstPid = (await first.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
    checkout = pool.connect().then(client => ({ client }), error => ({ error }));
    equal(pool.waitingCount, 1);
    const backend = (await a.query('SELECT state, wait_event_type FROM pg_stat_activity WHERE pid = $1', [firstPid])).rows[0];
    equal(backend.state, 'idle');
    assert.notEqual(backend.wait_event_type, 'Lock');
    checks++;
    first.release();
    first = undefined;
    const outcome = await checkout;
    if (outcome.error) throw outcome.error;
    second = outcome.client;
    const secondPid = (await second.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
    equal(secondPid, firstPid);
    equal(pool.waitingCount, 0);
    poolObservation = { queuedBeforeRelease: 1, backend, reusedBackend: secondPid === firstPid };
  } finally {
    if (first) first.release();
    if (!second && checkout) second = (await checkout).client;
    if (second) second.release();
    await pool.end();
  }
  return { lab, samples, projectLoop, projectGroup, poolObservation, rowBytesMeaning: 'UTF-8 JSON encoding of driver row objects, not PostgreSQL wire bytes.' };
}

try {
  for (const client of clients) {
    await client.connect();
    connected.add(client);
    await client.query("SET TIME ZONE 'UTC'; SET statement_timeout = '30s'; SET idle_in_transaction_session_timeout = '60s'");
  }
  report.environment = (await a.query("SELECT version() AS version, current_user AS role, current_setting('shared_buffers') AS shared_buffers, current_setting('work_mem') AS work_mem, current_setting('random_page_cost') AS random_page_cost, current_setting('effective_cache_size') AS effective_cache_size, current_setting('max_parallel_workers_per_gather') AS max_parallel_workers_per_gather")).rows[0];
  report.environment.node = process.version;
  const suites = [['18', queryPlans], ['19', indexDecisions], ['20', deepPages], ['21', statisticsMaintenance], ['22', requestWork]];
  if (process.argv.includes('--reverse')) suites.reverse();
  const selected = process.argv.find(argument => argument.startsWith('--lab='));
  if (selected && !suites.some(([number]) => selected === '--lab=' + number)) throw new Error('Choose --lab=18 through --lab=22.');
  for (const [number, run] of suites) {
    if (!selected || selected === '--lab=' + number) report.suites.push(await run());
  }
  report.assertions = checks;
  console.log(JSON.stringify(report, null, 2));
  console.log('PASS ' + checks + ' performance/correctness assertions across ' + report.suites.length + ' labs; timings are observations, not speed thresholds.');
} finally {
  for (const client of clients) {
    if (connected.has(client)) {
      try { await client.query('ROLLBACK'); } catch {}
    }
  }
  if (connected.has(a)) {
    try { await a.query('ALTER TABLE course_maintenance.tasks RESET (autovacuum_enabled); ALTER TABLE course_maintenance.mail RESET (autovacuum_enabled)'); } catch {}
  }
  for (const client of clients) {
    try { await client.end(); } catch {}
  }
}
