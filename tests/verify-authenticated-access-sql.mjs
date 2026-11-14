import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { resetLab } from '../labs/auth-fixture.mjs';

const db = new PGlite();
const client = {
  query: async (sql, parameters) => parameters ? db.query(sql, parameters) : (await db.exec(sql)).at(-1) || { rows: [] }
};
const users = Object.fromEntries(['alice', 'bob', 'reader', 'outsider'].map((alias, index) => [alias, { id: '00000000-0000-0000-0000-' + String(index + 1).padStart(12, '0') }]));
let checks = 0;

function equal(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}

async function rows(sql, expected, parameters) {
  equal((await client.query(sql, parameters)).rows, expected);
}

async function denied(sql, code, parameters) {
  await assert.rejects(client.query(sql, parameters), error => error.code === code);
  checks++;
}

async function actor(alias, action) {
  await db.exec('SET ROLE ' + (alias ? 'authenticated' : 'anon'));
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [alias ? users[alias].id : '', JSON.stringify(alias ? { sub: users[alias].id, role: 'authenticated' } : {})]);
  try { return await action(); }
  finally {
    await db.exec('RESET ROLE');
    await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claims','{}',false)");
  }
}

async function reset(number) {
  await resetLab(client, number, users);
  await resetLab(client, number, users);
}

async function order(key, quantity = 3, sku = '17') {
  return (await db.query("SELECT course_auth35_api.place_order('North',$1,$2,$3) AS receipt", [key, sku, quantity])).rows[0].receipt;
}

async function receipt(key) {
  return (await db.query("SELECT course_auth35_api.read_own_receipt('North',$1) AS receipt", [key])).rows[0].receipt;
}

async function counts(expected) {
  await rows(`SELECT (SELECT count(*)::integer FROM course_auth35_private.orders) AS orders,
    (SELECT count(*)::integer FROM course_auth35_private.order_lines) AS lines,
    (SELECT count(*)::integer FROM course_auth35_private.requests) AS requests`, [{ orders: expected, lines: expected, requests: expected }]);
}

try {
  console.log('SQL-only fixture check: synthetic auth.users/auth.uid and claim context; no Auth, HTTP or concurrent-session evidence.');
  console.log((await db.query('SELECT version() AS version')).rows[0].version);
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.sub',true),''),NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
    $$;
    GRANT USAGE ON SCHEMA auth TO anon,authenticated;
    ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon,authenticated;
    ALTER DEFAULT PRIVILEGES GRANT ALL ON SEQUENCES TO anon,authenticated;
    ALTER DEFAULT PRIVILEGES GRANT EXECUTE ON FUNCTIONS TO anon,authenticated`);
  for (const user of Object.values(users)) await db.query('INSERT INTO auth.users VALUES ($1)', [user.id]);
  process.env.COURSE_AUTH_DISPOSABLE = 'yes';

  await reset(33);
  for (const [alias, store] of [['alice', 'North'], ['bob', 'South'], ['reader', 'North']]) {
    await actor(alias, async () => {
      await rows('SELECT store FROM course_auth33_api.stores', [{ store }]);
      await rows('SELECT display_name FROM course_auth33_api.profiles', [{ display_name: alias }]);
      const identity = (await db.query('SELECT course_auth33_api.request_identity() AS identity')).rows[0].identity;
      equal(identity.actor, users[alias].id);
      equal(identity.database_role, 'authenticated');
      await denied('INSERT INTO course_auth33_api.profiles VALUES ($1,$2)', '42501', [users.outsider.id, 'Pretend administrator']);
      await denied('SELECT * FROM course_auth33_private.memberships', '42501');
    });
  }
  for (const alias of ['outsider', null]) await actor(alias, async () => {
    await rows('SELECT * FROM course_auth33_api.stores', []);
    await rows('SELECT * FROM course_auth33_api.profiles', []);
  });
  await rows('SELECT auth.uid() AS actor', [{ actor: null }]);
  await db.query('DELETE FROM course_auth33_api.profiles WHERE user_id=$1', [users.alice.id]);
  await actor('alice', async () => {
    await rows('SELECT * FROM course_auth33_api.profiles', []);
    await rows('SELECT store FROM course_auth33_api.stores', [{ store: 'North' }]);
  });
  await reset(33);
  await db.exec(await readFile(new URL('../labs/33-request-identity/transfer.sql', import.meta.url), 'utf8'));
  await actor('alice', () => rows('SELECT store FROM course_auth33_api.stores ORDER BY store', [{ store: 'East Library' }, { store: 'North' }]));
  await actor('bob', () => rows('SELECT store FROM course_auth33_api.stores ORDER BY store', [{ store: 'South' }, { store: 'West Library' }]));

  await reset(34);
  await actor('alice', async () => {
    await rows('SELECT draft_id FROM course_auth34_api.draft_orders', [{ draft_id: 1 }]);
    await rows("INSERT INTO course_auth34_api.draft_orders(store,sku,quantity) VALUES('North','17',4) RETURNING actor,quantity", [{ actor: users.alice.id, quantity: 4 }]);
    await rows('UPDATE course_auth34_api.draft_orders SET quantity=5 WHERE draft_id=4 RETURNING quantity', [{ quantity: 5 }]);
    await rows('DELETE FROM course_auth34_api.draft_orders WHERE draft_id=4 RETURNING quantity', [{ quantity: 5 }]);
    await rows('UPDATE course_auth34_api.draft_orders SET quantity=99 WHERE draft_id=2 RETURNING draft_id', []);
    await rows('DELETE FROM course_auth34_api.draft_orders WHERE draft_id=2 RETURNING draft_id', []);
    await denied("UPDATE course_auth34_api.draft_orders SET store='South' WHERE draft_id=1", '42501');
    await denied('UPDATE course_auth34_api.draft_orders SET actor=$1 WHERE draft_id=1', '42501', [users.bob.id]);
    await denied("INSERT INTO course_auth34_api.draft_orders(store,sku,quantity) VALUES('South','17',1)", '42501');
    await denied('SELECT * FROM course_auth34_private.memberships', '42501');
  });
  await rows('SELECT draft_id,quantity FROM course_auth34_api.draft_orders ORDER BY draft_id', [{ draft_id: 1, quantity: 3 }, { draft_id: 2, quantity: 3 }, { draft_id: 3, quantity: 3 }]);
  await actor('reader', () => rows('UPDATE course_auth34_api.draft_orders SET quantity=9 WHERE draft_id=3 RETURNING draft_id', []));
  await db.exec(await readFile(new URL('../labs/34-authorized-requests/transfer.sql', import.meta.url), 'utf8'));
  await actor('reader', async () => {
    await rows('UPDATE course_auth34_api.draft_orders SET quantity=4 WHERE draft_id=3 RETURNING quantity', [{ quantity: 4 }]);
    await denied("UPDATE course_auth34_api.draft_orders SET store='South' WHERE draft_id=3", '42501');
  });
  await actor('alice', () => rows('UPDATE course_auth34_api.draft_orders SET quantity=99 WHERE draft_id=3 RETURNING draft_id', []));
  await db.query('UPDATE course_auth34_private.memberships SET active=false WHERE actor=$1', [users.alice.id]);
  await actor('alice', () => rows('SELECT * FROM course_auth34_api.draft_orders', []));

  await reset(35);
  const first = await actor('alice', () => order('accepted'));
  equal(first.total_paise, '6000');
  await counts(1);
  await db.exec("UPDATE course_auth35_private.offers SET unit_price_paise=2200 WHERE store='North'");
  equal(await actor('alice', () => order('accepted')), first);
  await actor('alice', async () => {
    await denied("SELECT course_auth35_api.place_order('North','accepted','17',4)", '22023');
    await denied("SELECT course_auth35_api.place_order('North','invalid','17',0)", '22023');
    await denied("SELECT course_auth35_api.place_order('North','invalid',NULL,1)", '22023');
    await denied("SELECT course_auth35_api.place_order('North','missing','none',1)", 'P0002');
    equal(await receipt('missing'), null);
    await denied('INSERT INTO course_auth35_private.requests VALUES ($1,$2,$3,$4,$5,NULL)', '42501', ['North', users.alice.id, 'bypass', '17', 1]);
  });
  await counts(1);
  await db.exec(`CREATE FUNCTION course_auth35_private.fail_save() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Controlled rollback' USING ERRCODE='23514'; END $$;
    CREATE TRIGGER fail_save BEFORE UPDATE ON course_auth35_private.requests FOR EACH ROW EXECUTE FUNCTION course_auth35_private.fail_save()`);
  await actor('alice', () => denied("SELECT course_auth35_api.place_order('North','rollback','17',3)", '23514'));
  await counts(1);
  await db.exec('DROP TRIGGER fail_save ON course_auth35_private.requests; DROP FUNCTION course_auth35_private.fail_save()');
  await db.query('UPDATE course_auth35_private.memberships SET can_place=false WHERE actor=$1', [users.alice.id]);
  await actor('alice', async () => {
    await denied("SELECT course_auth35_api.place_order('North','accepted','17',3)", '42501');
    equal(await receipt('accepted'), first);
  });
  await db.query('UPDATE course_auth35_private.memberships SET active=false WHERE actor=$1', [users.alice.id]);
  await actor('alice', () => denied("SELECT course_auth35_api.read_own_receipt('North','accepted')", '42501'));
  await db.query('UPDATE course_auth35_private.memberships SET active=true,can_place=true WHERE actor=$1', [users.alice.id]);
  equal(await actor('alice', () => order('accepted')), first);
  await db.query('INSERT INTO course_auth35_private.memberships VALUES ($1,$2,true,true,true)', ['North', users.bob.id]);
  equal(await actor('bob', () => receipt('accepted')), null);
  const bob = await actor('bob', () => order('accepted', 1));
  assert.notEqual(bob.order_id, first.order_id);
  checks++;
  equal(await actor('bob', () => receipt('accepted')), bob);
  await counts(2);
  await rows("SELECT has_function_privilege('anon','course_auth35_api.place_order(text,text,text,integer)','EXECUTE') AS allowed", [{ allowed: false }]);
  await rows("SELECT has_table_privilege('authenticated','course_auth35_private.orders','INSERT') AS allowed", [{ allowed: false }]);
  await actor('alice', async () => {
    await db.exec('BEGIN READ ONLY');
    try { await denied("SELECT course_auth35_api.read_own_receipt('North','accepted')", '25006'); }
    finally { await db.exec('ROLLBACK'); }
  });
  await db.exec('ALTER FUNCTION course_auth35_api.read_own_receipt(text,text) STABLE');
  try { await actor('alice', () => denied("SELECT course_auth35_api.read_own_receipt('North','accepted')", '0A000')); }
  finally { await db.exec('ALTER FUNCTION course_auth35_api.read_own_receipt(text,text) VOLATILE'); }
  await db.exec(await readFile(new URL('../labs/35-authorized-replay/transfer.sql', import.meta.url), 'utf8'));
  const booking = await actor('alice', () => order('workshop-1', 1, 'workshop'));
  equal(booking.total_paise, '80000');
  await db.exec("UPDATE course_auth35_private.offers SET unit_price_paise=85000 WHERE sku='workshop'");
  await db.query('UPDATE course_auth35_private.memberships SET can_place=false WHERE actor=$1', [users.alice.id]);
  equal(await actor('alice', () => receipt('workshop-1')), booking);
  equal(await actor('bob', () => receipt('workshop-1')), null);
  await counts(3);
  console.log('PASS ' + checks + ' bounded SQL assertions; live Auth/API, native races and hosted verification remain pending.');
} finally {
  await db.exec('ROLLBACK').catch(() => {});
  await db.close();
}
