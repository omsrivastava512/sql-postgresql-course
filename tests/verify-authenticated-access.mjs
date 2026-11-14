import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { requestConfig, signIn, dataRequest } from '../labs/33-request-identity/request.mjs';
import { manifest, adminConnection, resetLab } from '../labs/auth-fixture.mjs';
import { placeOrder, readOwnReceipt } from '../labs/35-authorized-replay/request.mjs';

const config = requestConfig();
const data = await manifest();
const admin = await adminConnection();
const report = { environment: {}, cases: [] };
let checks = 0;
let sessions = {};

function equal(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}

async function run(id, action) {
  for (const [alias, session] of Object.entries(sessions)) {
    const expiry = JSON.parse(Buffer.from(session.token.split('.')[1], 'base64url').toString()).exp;
    if (expiry < Date.now() / 1000 + 30) {
      sessions[alias] = await signIn(config, data.users[alias].email, data.users[alias].password);
    }
  }
  await action();
  const ids = Array.isArray(id) ? id : [id];
  for (const value of ids) report.cases.push({ id: value, status: 'passed' });
  console.log('PASS ' + ids.join(', '));
}

async function loginAll() {
  for (const [alias, user] of Object.entries(data.users)) {
    sessions[alias] = await signIn(config, user.email, user.password);
    equal(sessions[alias].actor, user.id);
  }
}

function request(number, alias, resource, options) {
  return dataRequest(config, sessions[alias]?.token, 'course_auth' + number + '_api', resource, options);
}

async function ready(number) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const result = number === 33
      ? await request(33, 'alice', 'rpc/request_identity')
      : number === 34
        ? await request(34, 'alice', 'draft_orders?select=draft_id')
        : await readOwnReceipt(config, sessions.alice.token, 'North', 'missing');
    if (result.status === 200) return;
    if (!['PGRST202', 'PGRST205', 'PGRST106'].includes(result.body?.code)) throw new Error('Fixture readiness failed: ' + result.status + '/' + result.body?.code);
    await setTimeout(100);
  }
  throw new Error('Course schema did not become available; check exposed schemas and schema reload.');
}

async function reset(number) {
  await resetLab(admin, number, data.users);
  await resetLab(admin, number, data.users);
  await ready(number);
}

async function countOrders(expected) {
  const rows = (await admin.query(`SELECT
    (SELECT count(*)::integer FROM course_auth35_private.orders) AS orders,
    (SELECT count(*)::integer FROM course_auth35_private.order_lines) AS lines,
    (SELECT count(*)::integer FROM course_auth35_private.requests) AS requests`)).rows;
  equal(rows, [{ orders: expected, lines: expected, requests: expected }]);
}

async function waitFor(observation, description) {
  const deadline = Date.now() + 7000;
  while (Date.now() < deadline) {
    const value = await observation();
    if (value) return value;
    await setTimeout(25);
  }
  throw new Error('Did not observe ' + description);
}

function settled(promise) {
  return promise.then(value => ({ value }), error => ({ error }));
}

async function nativeActor(client, alias) {
  await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  await client.query('SET LOCAL ROLE authenticated');
  await client.query("SELECT set_config('request.jwt.claim.sub',$1,true), set_config('request.jwt.claims',$2,true)", [
    data.users[alias].id, JSON.stringify({ sub: data.users[alias].id, role: 'authenticated' })
  ]);
}

async function withConnections(action) {
  const clients = [];
  try {
    clients.push(await adminConnection());
    clients.push(await adminConnection());
    return await action(clients[0], clients[1]);
  } finally {
    for (const client of clients) {
      await client.query('ROLLBACK').catch(() => {});
      await client.query('SELECT pg_advisory_unlock_all()').catch(() => {});
      await client.end();
    }
  }
}

async function blockers(pid) {
  return (await admin.query('SELECT pg_blocking_pids($1) AS pids', [pid])).rows[0].pids;
}

async function blockedBy(pid) {
  return (await admin.query('SELECT pid FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid)) AND pid <> pg_backend_pid()', [pid])).rows;
}

async function installRaceGates(rollbackFirst = false) {
  await admin.query(`CREATE SEQUENCE course_auth35_private.race_attempts;
    CREATE FUNCTION course_auth35_private.mark_admission() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
    SET search_path=pg_catalog,pg_temp AS $$ BEGIN
      PERFORM pg_catalog.pg_advisory_xact_lock_shared(7313501);
      RETURN NEW;
    END $$;
    CREATE FUNCTION course_auth35_private.pause_request() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
    SET search_path=pg_catalog,pg_temp AS $$ BEGIN
      PERFORM pg_catalog.pg_advisory_xact_lock(7313502);
      ${rollbackFirst ? "IF nextval('course_auth35_private.race_attempts') = 1 THEN RAISE EXCEPTION 'Controlled creator rollback' USING ERRCODE='23514'; END IF;" : ''}
      RETURN NEW;
    END $$;
    REVOKE ALL ON FUNCTION course_auth35_private.mark_admission(), course_auth35_private.pause_request() FROM PUBLIC, anon, authenticated;
    CREATE TRIGGER admission_marker BEFORE INSERT ON course_auth35_private.requests FOR EACH ROW EXECUTE FUNCTION course_auth35_private.mark_admission();
    CREATE TRIGGER request_gate AFTER INSERT ON course_auth35_private.requests FOR EACH ROW EXECUTE FUNCTION course_auth35_private.pause_request()`);
}

async function gateWaiters() {
  return (await admin.query("SELECT pid FROM pg_locks WHERE locktype='advisory' AND classid=0 AND objid=7313502 AND objsubid=1 AND NOT granted ORDER BY pid")).rows.map(row => row.pid);
}

async function admittedPids() {
  return (await admin.query("SELECT pid FROM pg_locks WHERE locktype='advisory' AND classid=0 AND objid=7313501 AND objsubid=1 AND granted ORDER BY pid")).rows.map(row => row.pid);
}

async function concurrentRequests(sameKey, rollbackFirst = false, changedPayload = false) {
  await reset(35);
  await installRaceGates(rollbackFirst);
  await withConnections(async controller => {
    const pending = [];
    await controller.query('SELECT pg_advisory_lock(7313502)');
    try {
      pending.push(settled(placeOrder(config, sessions.alice.token, 'North', 'race-a', '17', 3)));
      const firstPid = await waitFor(async () => (await gateWaiters())[0], 'creator at the post-reservation gate');
      pending.push(settled(placeOrder(config, sessions.alice.token, 'North', sameKey ? 'race-a' : 'race-b', '17', changedPayload ? 4 : 3)));
      const admitted = await waitFor(async () => { const pids = await admittedPids(); return pids.length === 2 && pids; }, 'both HTTP requests past membership admission');
      const secondPid = admitted.find(pid => pid !== firstPid);
      if (sameKey) {
        await waitFor(async () => (await blockers(secondPid)).includes(firstPid), 'duplicate blocked by the creator after admission');
        equal((await admin.query('SELECT wait_event_type,wait_event FROM pg_stat_activity WHERE pid=$1', [secondPid])).rows, [{ wait_event_type: 'Lock', wait_event: 'transactionid' }]);
      } else {
        await waitFor(async () => (await gateWaiters()).length === 2, 'two independent keys at the fixture gate');
      }
      await controller.query('SELECT pg_advisory_unlock(7313502)');
      const [first, second] = await Promise.all(pending);
      if (rollbackFirst) {
        equal(first.error?.code, '23514');
        assert.ok(second.value);
        checks++;
        equal(second.value.quantity, changedPayload ? 4 : 3);
        await countOrders(1);
      } else {
        assert.ok(first.value);
        checks++;
        if (changedPayload && sameKey) equal(second.error?.code, '22023');
        else if (sameKey) equal(second.value, first.value);
        else { assert.ok(second.value && second.value.order_id !== first.value.order_id); checks++; }
        await countOrders(sameKey ? 1 : 2);
      }
    } finally {
      await controller.query('SELECT pg_advisory_unlock(7313502)');
      await Promise.all(pending);
    }
  });
}

async function permissionOrdering(operationFirst, rollbackRemoval = false) {
  await reset(35);
  await withConnections(async (writer, controller) => {
    const pending = [];
    try {
      if (operationFirst) {
        await installRaceGates();
        await controller.query('SELECT pg_advisory_lock(7313502)');
        pending.push(settled(placeOrder(config, sessions.alice.token, 'North', 'ordered', '17', 3)));
        const orderPid = await waitFor(async () => (await gateWaiters())[0], 'admitted order at the fixture gate');
        await writer.query('BEGIN');
        const writerPid = (await writer.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
        const removal = settled(writer.query('UPDATE course_auth35_private.memberships SET active=false WHERE actor=$1', [data.users.alice.id]));
        pending.push(removal);
        await waitFor(async () => (await blockers(writerPid)).includes(orderPid), 'removal waiting for the admitted HTTP order');
        await controller.query('SELECT pg_advisory_unlock(7313502)');
        const order = await pending[0];
        assert.ok(order.value);
        checks++;
        const update = await removal;
        if (update.error) throw update.error;
        await writer.query('COMMIT');
        await countOrders(1);
        equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'ordered')).body.code, '42501');
      } else {
        await writer.query('BEGIN');
        await writer.query('UPDATE course_auth35_private.memberships SET active=false WHERE actor=$1', [data.users.alice.id]);
        const writerPid = (await writer.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
        pending.push(settled(placeOrder(config, sessions.alice.token, 'North', 'ordered', '17', 3)));
        await waitFor(async () => (await blockedBy(writerPid)).length === 1, 'HTTP admission waiting for the permission writer');
        await writer.query(rollbackRemoval ? 'ROLLBACK' : 'COMMIT');
        const order = await pending[0];
        if (rollbackRemoval) { assert.ok(order.value); checks++; await countOrders(1); }
        else { equal(order.error?.code, '42501'); await countOrders(0); }
      }
    } finally {
      await controller.query('SELECT pg_advisory_unlock(7313502)');
      await writer.query('ROLLBACK').catch(() => {});
      await Promise.all(pending);
    }
  });
}

async function receiptOrdering() {
  await reset(35);
  const original = await placeOrder(config, sessions.alice.token, 'North', 'receipt-race', '17', 3);
  await withConnections(async (reader, writer) => {
    const pending = [];
    try {
      await nativeActor(reader, 'alice');
      const readerPid = (await reader.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
      equal((await reader.query("SELECT course_auth35_api.read_own_receipt('North','receipt-race') AS receipt")).rows, [{ receipt: original }]);
      const writerPid = (await writer.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
      pending.push(settled(writer.query('UPDATE course_auth35_private.memberships SET active=false WHERE actor=$1', [data.users.alice.id])));
      await waitFor(async () => (await blockers(writerPid)).includes(readerPid), 'removal waiting for the native receipt transaction');
      await reader.query('COMMIT');
      const update = await pending[0];
      if (update.error) throw update.error;
      equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'receipt-race')).body.code, '42501');
      await countOrders(1);
    } finally {
      await reader.query('ROLLBACK').catch(() => {});
      await Promise.all(pending);
    }
  });
}

async function lossRelay(afterSuccess) {
  let resolveObserved;
  let rejectObserved;
  const observed = new Promise((resolve, reject) => { resolveObserved = resolve; rejectObserved = reject; });
  observed.catch(() => {});
  const server = createServer((incoming, outgoing) => {
    (async () => {
      assert.equal(incoming.url, '/rest/v1/rpc/place_order');
      const chunks = [];
      for await (const chunk of incoming) chunks.push(chunk);
      const forwarded = fetch(config.url + incoming.url, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { apikey: config.key, Authorization: incoming.headers.authorization, 'Content-Type': 'application/json', 'Content-Profile': 'course_auth35_api' },
        body: Buffer.concat(chunks)
      });
      if (!afterSuccess) outgoing.destroy();
      const response = await forwarded;
      const body = await response.json();
      if (!response.ok) throw new Error('Relay upstream rejected the fixture: ' + response.status + '/' + body.code);
      resolveObserved(body);
      if (afterSuccess) outgoing.destroy();
    })().catch(error => { rejectObserved(error); outgoing.destroy(); });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    config: { ...config, url: 'http://127.0.0.1:' + server.address().port },
    observed,
    close: () => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); })
  };
}

try {
  report.environment = (await admin.query('SELECT version() AS database_version, current_user AS verifier_role')).rows[0];
  report.environment.origin = config.url;
  report.environment.auth_uid_definition = (await admin.query("SELECT pg_get_functiondef('auth.uid()'::regprocedure) AS definition")).rows[0].definition;
  await loginAll();
  const originalAlice = sessions.alice;
  await reset(33);
  await run('I1', async () => {
    for (const alias of ['alice', 'bob']) {
      const result = await request(33, alias, 'rpc/request_identity');
      equal(result.status, 200);
      equal(result.body.actor, data.users[alias].id);
      equal(result.body.database_role, 'authenticated');
    }
    assert.notEqual(sessions.alice.actor, sessions.bob.actor);
    checks++;
  });
  await run('I2-password-and-signature', async () => {
    await assert.rejects(signIn(config, data.users.alice.email, 'deliberately-wrong-password'), error => error.status >= 400 && error.status < 500);
    checks++;
    const pieces = originalAlice.token.split('.');
    pieces[2] = (pieces[2][0] === 'A' ? 'B' : 'A') + pieces[2].slice(1);
    const result = await dataRequest(config, pieces.join('.'), 'course_auth33_api', 'rpc/request_identity');
    equal(result.status, 401);
    assert.ok(result.body.code);
    checks++;
  });
  await run('I3', async () => {
    const result = await request(33, 'anon', 'rpc/request_identity');
    equal(result.status, 200);
    equal(result.body.actor, null);
    equal(result.body.database_role, 'anon');
    equal((await request(33, 'anon', 'profiles?select=*')).body, []);
  });
  await run('I4', async () => {
    const sql = (await admin.query('SELECT current_user AS role, auth.uid() AS actor')).rows[0];
    equal(sql.actor, null);
    assert.notEqual(sql.role, 'authenticated');
    checks++;
    equal((await request(33, 'alice', 'profiles?select=display_name')).body, [{ display_name: 'alice' }]);
  });
  await run('I5', async () => {
    equal((await request(33, 'outsider', 'rpc/request_identity')).body.actor, data.users.outsider.id);
    equal((await request(33, 'outsider', 'profiles?select=*')).body, []);
    equal((await request(33, 'outsider', 'stores?select=*')).body, []);
    await admin.query('DELETE FROM course_auth33_api.profiles WHERE user_id=$1', [data.users.alice.id]);
    equal((await request(33, 'alice', 'profiles?select=*')).body, []);
    equal((await request(33, 'alice', 'stores?select=store')).body, [{ store: 'North' }]);
  });
  report.cases.push({ id: 'I6', status: 'documentation exercise', reason: 'Anonymous sign-in is disabled; the lesson distinguishes it from a request without a user token.' });

  await loginAll();
  await reset(34);
  await run('P1', async () => {
    const result = await request(34, 'alice', 'draft_orders', { method: 'POST', representation: true, body: { store: 'North', sku: '17', quantity: 4 } });
    equal(result.status, 201);
    equal(result.body[0].actor, data.users.alice.id);
    equal(result.body[0].quantity, 4);
    equal((await admin.query('SELECT quantity FROM course_auth34_api.draft_orders WHERE draft_id=$1', [result.body[0].draft_id])).rows, [{ quantity: 4 }]);
    const resource = 'draft_orders?draft_id=eq.' + result.body[0].draft_id;
    const updated = await request(34, 'alice', resource, { method: 'PATCH', representation: true, body: { quantity: 5 } });
    equal(updated.status, 200);
    equal(updated.body.map(row => row.quantity), [5]);
    const removed = await request(34, 'alice', resource, { method: 'DELETE', representation: true });
    equal(removed.status, 200);
    equal(removed.body.map(row => row.quantity), [5]);
    equal((await admin.query('SELECT draft_id FROM course_auth34_api.draft_orders WHERE draft_id=$1', [result.body[0].draft_id])).rows, []);
  });
  await run('P2', async () => {
    equal((await request(34, 'alice', 'draft_orders?store=eq.South&select=*')).body, []);
    equal((await admin.query("SELECT quantity FROM course_auth34_api.draft_orders WHERE store='South'")).rows, [{ quantity: 3 }]);
  });
  await run('P3', async () => {
    for (const method of ['PATCH', 'DELETE']) {
      const result = await request(34, 'alice', 'draft_orders?store=eq.South', { method, representation: true, ...(method === 'PATCH' ? { body: { quantity: 99 } } : {}) });
      equal(result.status, 200);
      equal(result.body, []);
    }
    equal((await admin.query("SELECT quantity FROM course_auth34_api.draft_orders WHERE store='South'")).rows, [{ quantity: 3 }]);
  });
  await run('P4', async () => {
    const id = (await admin.query('SELECT min(draft_id) AS id FROM course_auth34_api.draft_orders WHERE actor=$1', [data.users.alice.id])).rows[0].id;
    for (const body of [{ store: 'South' }, { actor: data.users.bob.id }]) {
      const result = await request(34, 'alice', 'draft_orders?draft_id=eq.' + id, { method: 'PATCH', representation: true, body });
      equal(result.body.code, '42501');
    }
    const denied = await request(34, 'alice', 'draft_orders', { method: 'POST', body: { store: 'South', sku: '17', quantity: 1 } });
    equal(denied.body.code, '42501');
    equal((await admin.query('SELECT store,actor FROM course_auth34_api.draft_orders WHERE draft_id=$1', [id])).rows, [{ store: 'North', actor: data.users.alice.id }]);
  });
  await run('P5', async () => {
    await admin.query('REVOKE SELECT ON course_auth34_api.draft_orders FROM authenticated');
    try { equal((await request(34, 'alice', 'draft_orders?select=*')).body.code, '42501'); }
    finally { await admin.query('GRANT SELECT ON course_auth34_api.draft_orders TO authenticated'); }
    await admin.query('REVOKE EXECUTE ON FUNCTION course_auth34_api.may_use_store(text,boolean) FROM authenticated');
    try { equal((await request(34, 'alice', 'rpc/may_use_store', { method: 'POST', body: { p_store: 'North', p_write: true } })).body.code, '42501'); }
    finally { await admin.query('GRANT EXECUTE ON FUNCTION course_auth34_api.may_use_store(text,boolean) TO authenticated'); }
    equal((await dataRequest(config, sessions.alice.token, 'course_auth34_private', 'memberships?select=*')).body.code, 'PGRST106');
  });
  await run('P6', async () => {
    const expectedDrafts = { alice: [{ draft_id: 1, actor: data.users.alice.id }], bob: [{ draft_id: 2, actor: data.users.bob.id }], anon: [] };
    for (const alias of ['alice', 'bob', 'anon', 'alice']) {
      equal((await request(33, alias, 'rpc/request_identity')).body.actor, sessions[alias]?.actor || null);
      equal((await request(34, alias, 'draft_orders?select=draft_id,actor&order=draft_id')).body, expectedDrafts[alias]);
    }
    const mixed = await Promise.all(['alice', 'bob', 'anon', 'alice'].map(alias => request(33, alias, 'rpc/request_identity')));
    equal(mixed.map(result => result.body.actor), [data.users.alice.id, data.users.bob.id, null, data.users.alice.id]);
    const drafts = await Promise.all(['alice', 'bob', 'anon', 'alice'].map(alias => request(34, alias, 'draft_orders?select=draft_id,actor&order=draft_id')));
    equal(drafts.map(result => result.body), [expectedDrafts.alice, expectedDrafts.bob, [], expectedDrafts.alice]);
  });
  await run('P7', async () => {
    const result = await fetch(config.url + '/auth/v1/user', {
      method: 'PUT', redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { apikey: config.key, Authorization: 'Bearer ' + sessions.outsider.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { role: 'admin', can_place: true, store: 'North' } })
    });
    equal(result.status, 200);
    await result.arrayBuffer();
    sessions.outsider = await signIn(config, data.users.outsider.email, data.users.outsider.password);
    equal((await request(34, 'outsider', 'draft_orders?select=*')).body, []);
    equal((await request(34, 'outsider', 'draft_orders', { method: 'POST', body: { store: 'North', sku: '17', quantity: 1 } })).body.code, '42501');
  });
  await run('P8', async () => {
    const token = sessions.alice.token;
    await admin.query('UPDATE course_auth34_private.memberships SET active=false WHERE actor=$1', [data.users.alice.id]);
    equal((await request(34, 'alice', 'draft_orders?select=*')).body, []);
    equal(sessions.alice.token, token);
    equal((await request(33, 'alice', 'rpc/request_identity')).body.actor, data.users.alice.id);
  });

  await loginAll();
  await reset(35);
  let receipt;
  await run('O1', async () => {
    receipt = await placeOrder(config, sessions.alice.token, 'North', 'accepted', '17', 3);
    equal(receipt.total_paise, '6000');
    equal(receipt.accepted_description, 'Breakfast Tea 50 g');
    await countOrders(1);
    equal((await admin.query("SELECT receipt FROM course_auth35_private.requests WHERE request_key='accepted'")).rows, [{ receipt }]);
    equal((await admin.query('SELECT order_id,store,actor FROM course_auth35_private.orders')).rows, [{ order_id: receipt.order_id, store: 'North', actor: data.users.alice.id }]);
    equal((await admin.query('SELECT * FROM course_auth35_private.order_lines')).rows, [{ order_id: receipt.order_id, accepted_sku: '17', accepted_description: 'Breakfast Tea 50 g', quantity: 3, unit_price_paise: 2000 }]);
  });
  await run('O2', async () => {
    await admin.query(`CREATE FUNCTION course_auth35_private.reject_saved_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Controlled fixture failure' USING ERRCODE='23514'; END $$;
      CREATE TRIGGER reject_receipt BEFORE UPDATE ON course_auth35_private.requests FOR EACH ROW EXECUTE FUNCTION course_auth35_private.reject_saved_receipt()`);
    try { await assert.rejects(placeOrder(config, sessions.alice.token, 'North', 'rolled-back', '17', 3), error => error.code === '23514'); checks++; }
    finally { await admin.query('DROP TRIGGER reject_receipt ON course_auth35_private.requests; DROP FUNCTION course_auth35_private.reject_saved_receipt()'); }
    await countOrders(1);
    equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'rolled-back')).body, null);
  });
  await run('O5', async () => {
    await assert.rejects(placeOrder(config, sessions.alice.token, 'North', 'accepted', '17', 4), error => error.code === '22023');
    checks++;
    await countOrders(1);
  });
  await run(['O7', 'D8'], async () => {
    await admin.query('INSERT INTO course_auth35_private.memberships VALUES ($1,$2,true,true,true)', ['North', data.users.bob.id]);
    equal((await readOwnReceipt(config, sessions.bob.token, 'North', 'accepted')).body, null);
    const bob = await placeOrder(config, sessions.bob.token, 'North', 'accepted', '17', 1);
    assert.notEqual(bob.order_id, receipt.order_id);
    checks++;
    equal(bob.total_paise, '2000');
    equal((await readOwnReceipt(config, sessions.bob.token, 'North', 'accepted')).body, bob);
    await countOrders(2);
  });
  await run('D3', async () => {
    await admin.query('UPDATE course_auth35_private.memberships SET can_place=false WHERE actor=$1', [data.users.alice.id]);
    for (const key of ['accepted', 'denied-new']) {
      await assert.rejects(placeOrder(config, sessions.alice.token, 'North', key, '17', 3), error => error.code === '42501');
      checks++;
    }
    equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'accepted')).body, receipt);
    await countOrders(2);
  });
  await run(['O8', 'D4'], async () => {
    await admin.query('UPDATE course_auth35_private.memberships SET active=false WHERE actor=$1', [data.users.alice.id]);
    await assert.rejects(placeOrder(config, sessions.alice.token, 'North', 'accepted', '17', 3), error => error.code === '42501');
    checks++;
    equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'accepted')).body.code, '42501');
    equal((await admin.query("SELECT receipt FROM course_auth35_private.requests WHERE actor=$1 AND request_key='accepted'", [data.users.alice.id])).rows, [{ receipt }]);
    await countOrders(2);
  });
  await run('O10', async () => {
    const privileges = (await admin.query(`SELECT
      has_table_privilege('authenticated','course_auth35_private.requests','INSERT') AS request_write,
      has_table_privilege('authenticated','course_auth35_private.orders','INSERT') AS order_write,
      has_table_privilege('authenticated','course_auth35_private.order_lines','INSERT') AS line_write,
      has_function_privilege('anon','course_auth35_api.place_order(text,text,text,integer)','EXECUTE') AS anonymous_command,
      pg_has_role('authenticated','course_auth35_owner','MEMBER') AS owner_membership`)).rows;
    equal(privileges, [{ request_write: false, order_write: false, line_write: false, anonymous_command: false, owner_membership: false }]);
    for (const table of ['requests', 'orders', 'order_lines']) {
      equal((await dataRequest(config, sessions.bob.token, 'course_auth35_private', table, { method: 'POST', body: {} })).body.code, 'PGRST106');
    }
  });
  await run('O11', async () => {
    await admin.query('UPDATE course_auth35_private.memberships SET active=true,can_place=true WHERE actor=$1', [data.users.alice.id]);
    await admin.query("UPDATE course_auth35_private.offers SET unit_price_paise=2200 WHERE store='North'");
    equal(await placeOrder(config, sessions.alice.token, 'North', 'accepted', '17', 3), receipt);
    await countOrders(2);
  });
  for (const [id, afterSuccess] of [['O3', true], ['O4', false]]) {
    await run(id, async () => {
      await reset(35);
      const relay = await lossRelay(afterSuccess);
      try {
        await assert.rejects(placeOrder(relay.config, sessions.alice.token, 'North', 'lost-response', '17', 3), error => error.code === 'OUTCOME_UNKNOWN');
        checks++;
        const accepted = await relay.observed;
        await countOrders(1);
        await admin.query("UPDATE course_auth35_private.offers SET unit_price_paise=2400 WHERE store='North'");
        equal(await placeOrder(config, sessions.alice.token, 'North', 'lost-response', '17', 3), accepted);
        equal(accepted.total_paise, '6000');
        await countOrders(1);
      } finally { await relay.close(); }
    });
  }
  await run('D1', () => concurrentRequests(false));
  await run(['O6', 'D2'], async () => {
    await concurrentRequests(true);
    await concurrentRequests(true, false, true);
    await concurrentRequests(true, true);
    await concurrentRequests(true, true, true);
  });
  await run('O9', async () => {
    await permissionOrdering(false);
    await permissionOrdering(false, true);
    await permissionOrdering(true);
  });
  await run('D5', receiptOrdering);
  await run('D6', async () => {
    await reset(35);
    await withConnections(async (reader, writer) => {
      await reader.query('BEGIN');
      await reader.query('SELECT active,can_place FROM course_auth35_private.memberships WHERE actor=$1 FOR KEY SHARE', [data.users.alice.id]);
      await writer.query("SET statement_timeout='1500ms'");
      const changed = await writer.query('UPDATE course_auth35_private.memberships SET can_place=false WHERE actor=$1 RETURNING can_place', [data.users.alice.id]);
      equal(changed.rows, [{ can_place: false }]);
      equal((await admin.query('SELECT can_place FROM course_auth35_private.memberships WHERE actor=$1', [data.users.alice.id])).rows, [{ can_place: false }]);
      await reader.query('COMMIT');
    });
  });
  await run('D7', async () => {
    await reset(35);
    equal((await request(35, 'alice', 'rpc/read_own_receipt?p_store=North&p_key=missing')).body.code, '25006');
    await withConnections(async client => {
      await client.query('BEGIN');
      await client.query('ALTER FUNCTION course_auth35_api.read_own_receipt(text,text) STABLE');
      await client.query('SET LOCAL ROLE authenticated');
      await client.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claims',$2,true)", [data.users.alice.id, JSON.stringify({ sub: data.users.alice.id, role: 'authenticated' })]);
      await assert.rejects(client.query("SELECT course_auth35_api.read_own_receipt('North','missing')"), error => error.code === '0A000');
      checks++;
      await client.query('ROLLBACK');
    });
    equal((await admin.query("SELECT provolatile FROM pg_proc WHERE oid='course_auth35_api.read_own_receipt(text,text)'::regprocedure")).rows, [{ provolatile: 'v' }]);
    equal(await readOwnReceipt(config, sessions.alice.token, 'North', 'missing'), { status: 200, body: null });
  });
  await run('bounded-http-retries', async () => {
    await reset(35);
    await admin.query(`CREATE SEQUENCE course_auth35_private.fault_attempts;
      CREATE FUNCTION course_auth35_private.retry_fault() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
      SET search_path=pg_catalog,pg_temp AS $$ BEGIN
        PERFORM nextval('course_auth35_private.fault_attempts');
        RAISE EXCEPTION 'Controlled retry failure' USING ERRCODE='40P01';
      END $$;
      REVOKE ALL ON FUNCTION course_auth35_private.retry_fault() FROM PUBLIC,anon,authenticated;
      CREATE TRIGGER retry_fault BEFORE UPDATE ON course_auth35_private.requests FOR EACH ROW EXECUTE FUNCTION course_auth35_private.retry_fault()`);
    try {
      await assert.rejects(placeOrder(config, sessions.alice.token, 'North', 'retry-budget', '17', 3), error => error.code === '40P01');
      checks++;
      equal((await admin.query('SELECT last_value::integer FROM course_auth35_private.fault_attempts')).rows, [{ last_value: 3 }]);
      await countOrders(0);
    } finally {
      await admin.query('DROP TRIGGER retry_fault ON course_auth35_private.requests; DROP FUNCTION course_auth35_private.retry_fault(); DROP SEQUENCE course_auth35_private.fault_attempts');
    }
    equal((await placeOrder(config, sessions.alice.token, 'North', 'retry-budget', '17', 3)).total_paise, '6000');
    await countOrders(1);
  });
  await run('transfer-33', async () => {
    await reset(33);
    await admin.query(await readFile(new URL('../labs/33-request-identity/transfer.sql', import.meta.url), 'utf8'));
    equal((await request(33, 'alice', 'stores?select=store&order=store')).body, [{ store: 'East Library' }, { store: 'North' }]);
    equal((await request(33, 'bob', 'stores?select=store&order=store')).body, [{ store: 'South' }, { store: 'West Library' }]);
    equal((await request(33, 'outsider', 'stores?select=store&order=store')).body, []);
  });
  await run('transfer-34', async () => {
    await reset(34);
    await admin.query(await readFile(new URL('../labs/34-authorized-requests/transfer.sql', import.meta.url), 'utf8'));
    const resource = 'draft_orders?draft_id=eq.3';
    const allowed = await request(34, 'reader', resource, { method: 'PATCH', representation: true, body: { quantity: 4 } });
    equal(allowed.body.map(row => row.quantity), [4]);
    equal((await request(34, 'alice', resource, { method: 'PATCH', representation: true, body: { quantity: 99 } })).body, []);
    equal((await request(34, 'reader', resource, { method: 'PATCH', representation: true, body: { store: 'South' } })).body.code, '42501');
    equal((await admin.query('SELECT store,actor,quantity FROM course_auth34_api.draft_orders WHERE draft_id=3')).rows, [{ store: 'North', actor: data.users.reader.id, quantity: 4 }]);
  });
  await run('transfer-35', async () => {
    await reset(35);
    await admin.query(await readFile(new URL('../labs/35-authorized-replay/transfer.sql', import.meta.url), 'utf8'));
    const booking = await placeOrder(config, sessions.alice.token, 'North', 'workshop-1', 'workshop', 1);
    equal(booking.total_paise, '80000');
    await admin.query("UPDATE course_auth35_private.offers SET unit_price_paise=85000 WHERE store='North' AND sku='workshop'");
    await admin.query('UPDATE course_auth35_private.memberships SET can_place=false WHERE actor=$1', [data.users.alice.id]);
    for (const key of ['workshop-1', 'workshop-2']) {
      await assert.rejects(placeOrder(config, sessions.alice.token, 'North', key, 'workshop', 1), error => error.code === '42501');
      checks++;
    }
    equal((await readOwnReceipt(config, sessions.alice.token, 'North', 'workshop-1')).body, booking);
    equal((await readOwnReceipt(config, sessions.bob.token, 'North', 'workshop-1')).body.code, '42501');
    await admin.query('INSERT INTO course_auth35_private.memberships VALUES ($1,$2,true,false,true)', ['North', data.users.bob.id]);
    equal((await readOwnReceipt(config, sessions.bob.token, 'North', 'workshop-1')).body, null);
    await countOrders(1);
  });
  await run('I2', async () => {
    const expiry = JSON.parse(Buffer.from(originalAlice.token.split('.')[1], 'base64url').toString()).exp;
    assert.ok(Number.isInteger(expiry));
    checks++;
    const until = (expiry + 61) * 1000;
    if (until - Date.now() > 360000) throw new Error('Configure a disposable test-token lifetime of at most 300 seconds for the real expiry case.');
    while (Date.now() < until) {
      console.log('Waiting for the original, unmodified token to expire: ' + Math.ceil((until - Date.now()) / 1000) + ' seconds.');
      await setTimeout(Math.min(15000, until - Date.now()));
    }
    equal((await dataRequest(config, originalAlice.token, 'course_auth33_api', 'rpc/request_identity')).status, 401);
    const fresh = await signIn(config, data.users.alice.email, data.users.alice.password);
    equal((await dataRequest(config, fresh.token, 'course_auth33_api', 'rpc/request_identity')).body.actor, data.users.alice.id);
  });
  const required = [['I', 6], ['P', 8], ['O', 11], ['D', 8]].flatMap(([prefix, count]) => Array.from({ length: count }, (_, index) => prefix + (index + 1)));
  equal(required.filter(id => !report.cases.some(item => item.id === id)), []);
  report.environment.native_context_limit = 'D5/D6 and the STABLE negative control use administrative SQL sessions; real Auth/API cases are recorded separately.';
  report.environment.relay_limit = 'Controlled loopback response loss, not every possible network failure schedule.';
  console.log(JSON.stringify({ ...report, assertions: checks, complete: true }, null, 2));
} finally {
  await admin.query('ROLLBACK').catch(() => {});
  await admin.end();
}
