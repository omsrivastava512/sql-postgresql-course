import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import pg from 'pg';

if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to a disposable database.');
const clients = ['a', 'b', 'observer'].map(name => new pg.Client({
  connectionString: process.env.COURSE_DATABASE_URL,
  connectionTimeoutMillis: 10000,
  application_name: 'course-session-check-' + name
}));
const [a, b, observer] = clients;
const connected = new Set();
const read = (lab, file) => readFile(new URL('../labs/' + lab + '/' + file, import.meta.url), 'utf8');
let checks = 0;
let pids;

function equal(actual, expected) {
  assert.deepEqual(actual, expected);
  checks++;
}

async function rows(client, sql, expected) {
  equal((await client.query(sql)).rows, expected);
}

async function fails(operation, code) {
  let failure;
  try { await operation; } catch (error) { failure = error; }
  assert.ok(failure, 'Expected SQLSTATE ' + code);
  equal(failure.code, code);
}

function pending(client, sql) {
  return client.query(sql).then(result => ({ result }), error => ({ error }));
}

async function finish(operation) {
  const outcome = await operation;
  if (outcome.error) throw outcome.error;
  return outcome.result;
}

async function blocked() {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const result = await observer.query(
      'SELECT pg_blocking_pids($1) AS blockers, wait_event_type FROM pg_stat_activity WHERE pid = $1',
      [pids[1]]
    );
    if (result.rows[0]?.blockers.includes(pids[0])) {
      equal(result.rows[0].wait_event_type, 'Lock');
      return;
    }
    await setTimeout(20);
  }
  throw new Error('B was not observed blocked by A.');
}

async function reset(lab) {
  await a.query('ROLLBACK; RESET lock_timeout');
  await b.query('ROLLBACK; RESET lock_timeout');
  await observer.query(await read(lab, 'setup.sql'));
}

function claim(id, insertedQuantity = 1) {
  return 'WITH claimed AS (UPDATE course_race.stock SET available = available - 1 ' +
    'WHERE item_id = 1 AND available >= 1 RETURNING item_id) ' +
    'INSERT INTO course_race.reservations (id, item_id, quantity) SELECT ' +
    id + ', item_id, ' + insertedQuantity + ' FROM claimed RETURNING id';
}

async function stock(available, reservations) {
  await rows(observer, 'SELECT available FROM course_race.stock WHERE item_id = 1', [{ available }]);
  await rows(observer, 'SELECT id, quantity FROM course_race.reservations ORDER BY id', reservations);
}

async function competingClaims() {
  const lab = '16-competing-claims';
  await reset(lab);
  await reset(lab);
  for (const client of [a, b]) {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    await rows(client, 'SELECT available FROM course_race.stock WHERE item_id = 1', [{ available: 1 }]);
  }
  await a.query('UPDATE course_race.stock SET available = 0 WHERE item_id = 1; INSERT INTO course_race.reservations VALUES (101, 1, 1); COMMIT');
  await b.query('UPDATE course_race.stock SET available = 0 WHERE item_id = 1; INSERT INTO course_race.reservations VALUES (102, 1, 1); COMMIT');
  await stock(0, [{ id: 101, quantity: 1 }, { id: 102, quantity: 1 }]);

  for (const ending of ['COMMIT', 'ROLLBACK']) {
    await reset(lab);
    await a.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    await rows(a, claim(101), [{ id: 101 }]);
    await b.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    const contender = pending(b, claim(102));
    await blocked();
    await stock(1, []);
    await a.query(ending);
    equal((await finish(contender)).rows, ending === 'COMMIT' ? [] : [{ id: 102 }]);
    await b.query('COMMIT');
    await stock(0, [{ id: ending === 'COMMIT' ? 101 : 102, quantity: 1 }]);
  }

  await reset(lab);
  await a.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  await rows(a, 'SELECT available FROM course_race.stock WHERE item_id = 1 FOR UPDATE', [{ available: 1 }]);
  await b.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  const lockingRead = pending(b, 'SELECT available FROM course_race.stock WHERE item_id = 1 FOR UPDATE');
  await blocked();
  await rows(a, claim(101), [{ id: 101 }]);
  await a.query('COMMIT');
  equal((await finish(lockingRead)).rows, [{ available: 0 }]);
  await b.query('COMMIT');
  await stock(0, [{ id: 101, quantity: 1 }]);

  await reset(lab);
  await fails(a.query(claim(101, -1)), '23514');
  await stock(1, []);

  await reset(lab);
  for (const client of [a, b]) {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
    await rows(client, 'SELECT available FROM course_race.stock WHERE item_id = 1', [{ available: 1 }]);
  }
  await rows(a, claim(101), [{ id: 101 }]);
  await a.query('COMMIT');
  await fails(b.query(claim(102)), '40001');
  await b.query('ROLLBACK; BEGIN ISOLATION LEVEL REPEATABLE READ');
  await rows(b, 'SELECT available FROM course_race.stock WHERE item_id = 1', [{ available: 0 }]);
  await rows(b, claim(102), []);
  await b.query('COMMIT');
  await stock(0, [{ id: 101, quantity: 1 }]);

  await reset(lab);
  await a.query('BEGIN');
  await a.query(claim(101));
  await b.query("BEGIN; SET LOCAL lock_timeout = '200ms'");
  const timedClaim = pending(b, claim(102));
  await blocked();
  const timedOutcome = await timedClaim;
  equal(timedOutcome.error?.code, '55P03');
  await fails(b.query('SELECT 1'), '25P02');
  await b.query('ROLLBACK');
  await a.query('ROLLBACK');
  await stock(1, []);
  await rows(b, claim(102), [{ id: 102 }]);
  await stock(0, [{ id: 102, quantity: 1 }]);

  await reset(lab);
  const seats = (id, quantity) => 'WITH claimed AS (UPDATE course_race.sessions ' +
    'SET remaining_seats = remaining_seats - ' + quantity +
    ' WHERE id = 1 AND remaining_seats >= ' + quantity + ' RETURNING id) ' +
    'INSERT INTO course_race.registrations (id, session_id, seats) SELECT ' +
    id + ', id, ' + quantity + ' FROM claimed RETURNING id';
  await a.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  await rows(a, seats(201, 2), [{ id: 201 }]);
  await b.query('BEGIN ISOLATION LEVEL READ COMMITTED');
  const seatClaim = pending(b, seats(202, 2));
  await blocked();
  await a.query('COMMIT');
  equal((await finish(seatClaim)).rows, []);
  await b.query('COMMIT');
  await rows(observer, 'SELECT remaining_seats FROM course_race.sessions WHERE id = 1', [{ remaining_seats: 1 }]);
  await rows(observer, 'SELECT id, seats FROM course_race.registrations ORDER BY id', [{ id: 201, seats: 2 }]);
  await rows(b, seats(202, 1), [{ id: 202 }]);
  await rows(observer, 'SELECT remaining_seats FROM course_race.sessions WHERE id = 1', [{ remaining_seats: 0 }]);
  await rows(observer, 'SELECT id, seats FROM course_race.registrations ORDER BY id', [{ id: 201, seats: 2 }, { id: 202, seats: 1 }]);

  await reset(lab);
  await a.query(await read(lab, 'solution.sql'));
  await stock(0, [{ id: 101, quantity: 1 }]);
  await rows(observer, 'SELECT remaining_seats FROM course_race.sessions WHERE id = 1', [{ remaining_seats: 1 }]);
  await rows(observer, 'SELECT id, seats FROM course_race.registrations ORDER BY id', [{ id: 201, seats: 2 }]);
  console.log('PASS ' + lab + ': stale decision, commit/rollback waits, locking read, failed claim, 40001 retry, timeout and seat transfer.');
}

async function compatibleChange() {
  const lab = '17-compatible-change';
  const expand = await read(lab, '01-expand.sql');
  const backfill = await read(lab, '02-backfill.sql');
  const requireValue = await read(lab, '03-require.sql');
  const values = 'SELECT id, reminder_minutes FROM course_change.bookings ORDER BY id';
  const column = "SELECT attnotnull FROM pg_attribute WHERE attrelid = 'course_change.bookings'::regclass AND attname = 'reminder_minutes' AND NOT attisdropped";
  const history = 'SELECT version FROM course_change.migration_history ORDER BY version';
  const constraint = "SELECT conname, convalidated FROM pg_constraint WHERE conrelid = 'course_change.bookings'::regclass AND conname IN ('reminder_range', 'reminder_present') ORDER BY conname";
  const originals = 'SELECT id, room, starts_at FROM course_change.bookings WHERE id <= 4 ORDER BY id';
  const batchRows = result => result.find(step => step.command === 'UPDATE').rows.sort((left, right) => left.id - right.id);

  await reset(lab);
  await reset(lab);
  const before = (await a.query(originals)).rows;
  await fails(a.query('ALTER TABLE course_change.bookings ADD COLUMN reminder_minutes integer NOT NULL'), '23502');
  await rows(a, column, []);
  await a.query(expand);
  await rows(a, values, [1, 2, 3, 4].map(id => ({ id, reminder_minutes: null })));
  await rows(a, history, [{ version: '001_expand' }]);
  await rows(a, constraint, [{ conname: 'reminder_range', convalidated: false }]);
  await fails(a.query("INSERT INTO course_change.bookings VALUES (99, 'Blue', '2026-10-24 09:00+00', -1)"), '23514');
  await a.query('BEGIN');
  await rows(a, "INSERT INTO course_change.bookings VALUES (99, 'Blue', '2026-10-24 09:00+00', NULL) RETURNING reminder_minutes", [{ reminder_minutes: null }]);
  await a.query('ROLLBACK');
  await fails(a.query(expand), '42701');
  await a.query('ROLLBACK');
  await rows(a, history, [{ version: '001_expand' }]);
  equal(batchRows(await a.query(backfill)), [{ id: 1, reminder_minutes: 30 }, { id: 2, reminder_minutes: 30 }]);
  await fails(a.query(requireValue), '23514');
  await a.query('ROLLBACK');
  await rows(a, column, [{ attnotnull: false }]);
  await rows(a, constraint, [{ conname: 'reminder_range', convalidated: false }]);
  await rows(a, history, [{ version: '001_expand' }]);
  await a.query("INSERT INTO course_change.bookings (id, room, starts_at) VALUES (6, 'Blue', '2026-10-23 09:00+00'); INSERT INTO course_change.bookings VALUES (5, 'Green', '2026-10-23 10:00+00', 0); UPDATE course_change.bookings SET reminder_minutes = 120 WHERE id = 3");
  equal(batchRows(await a.query(backfill)), [{ id: 4, reminder_minutes: 30 }]);
  equal(batchRows(await a.query(backfill)), []);
  const expected = [30, 30, 120, 30, 0, 30].map((reminder_minutes, index) => ({ id: index + 1, reminder_minutes }));
  await rows(a, values, expected);
  await rows(a, originals, before);
  await a.query(requireValue);
  await rows(a, history, [{ version: '001_expand' }, { version: '003_require' }]);
  await rows(a, column, [{ attnotnull: true }]);
  await rows(a, constraint, [{ conname: 'reminder_range', convalidated: true }]);
  await a.query('BEGIN');
  await rows(a, "INSERT INTO course_change.bookings (id, room, starts_at) VALUES (99, 'Blue', '2026-10-24 09:00+00') RETURNING reminder_minutes", [{ reminder_minutes: 30 }]);
  await a.query('ROLLBACK');
  for (const [value, code] of [['NULL', '23502'], ['-1', '23514']]) {
    await a.query('BEGIN');
    await fails(a.query("INSERT INTO course_change.bookings VALUES (99, 'Blue', '2026-10-24 09:00+00', " + value + ')'), code);
    await a.query('ROLLBACK');
  }
  equal(batchRows(await a.query(backfill)), []);
  await rows(a, values, expected);
  await rows(a, originals, before);

  await reset(lab);
  await a.query(expand);
  await a.query(backfill);
  await a.query('BEGIN; UPDATE course_change.bookings SET reminder_minutes = 120 WHERE id = 3');
  const overlappingBatch = pending(b, backfill);
  await blocked();
  await a.query('COMMIT');
  equal(batchRows(await finish(overlappingBatch)), [{ id: 4, reminder_minutes: 30 }]);
  await rows(observer, values, [30, 30, 120, 30].map((reminder_minutes, index) => ({ id: index + 1, reminder_minutes })));

  await reset(lab);
  await a.query('BEGIN; SELECT * FROM course_change.bookings');
  const timedMigration = pending(b, expand);
  await blocked();
  equal((await timedMigration).error?.code, '55P03');
  await b.query('ROLLBACK');
  await rows(observer, column, []);
  await rows(observer, history, []);
  await a.query('COMMIT');
  await b.query(expand);
  await rows(observer, column, [{ attnotnull: false }]);
  await rows(observer, history, [{ version: '001_expand' }]);

  await reset(lab);
  await a.query(await read(lab, 'solution.sql'));
  await rows(a, values, [1, 2, 3, 4].map(id => ({ id, reminder_minutes: 30 })));
  await rows(a, history, [{ version: '001_expand' }, { version: '003_require' }]);
  await rows(a, 'SELECT * FROM course_change.jobs ORDER BY id', [{ id: 1, queue: 'email', attempt_limit: 3 }, { id: 2, queue: 'sms', attempt_limit: 3 }]);
  await rows(a, "INSERT INTO course_change.jobs (id, queue) VALUES (3, 'email') RETURNING attempt_limit", [{ attempt_limit: 5 }]);
  await a.query("INSERT INTO course_change.jobs VALUES (4, 'sms', 2)");
  equal((await a.query('UPDATE course_change.jobs SET attempt_limit = 3 WHERE attempt_limit IS NULL')).rowCount, 0);
  await rows(a, 'SELECT id, attempt_limit FROM course_change.jobs ORDER BY id', [3, 3, 5, 2].map((attempt_limit, index) => ({ id: index + 1, attempt_limit })));
  await fails(a.query("INSERT INTO course_change.jobs VALUES (5, 'email', NULL)"), '23502');
  await fails(a.query("INSERT INTO course_change.jobs VALUES (5, 'email', 11)"), '23514');
  console.log('PASS ' + lab + ': interrupted backfill, old/new callers, validation rollback, overlapping update, DDL timeout and job transfer.');
}

try {
  for (const client of clients) {
    await client.connect();
    connected.add(client);
    await client.query("SET statement_timeout = '10s'; SET idle_in_transaction_session_timeout = '60s'; SET TIME ZONE 'UTC'");
  }
  pids = [];
  for (const client of clients) pids.push((await client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid);
  equal(new Set(pids).size, 3);
  console.log((await observer.query('SELECT version() AS version')).rows[0].version);
  const suites = [['16', competingClaims], ['17', compatibleChange]];
  if (process.argv.includes('--reverse')) suites.reverse();
  const selected = process.argv.find(argument => argument.startsWith('--lab='));
  if (selected && !['--lab=16', '--lab=17'].includes(selected)) throw new Error('Choose --lab=16 or --lab=17.');
  for (const [number, run] of suites) {
    if (!selected || selected === '--lab=' + number) await run();
  }
  console.log('PASS ' + checks + ' live-session assertions on three distinct PostgreSQL connections.');
} finally {
  for (const client of clients) {
    if (connected.has(client)) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    try { await client.end(); } catch {}
  }
}
