import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const embedded = process.argv.includes('--embedded');
const database = process.argv.includes('--database');
if (embedded === database) throw new Error('Choose exactly one of --embedded or --database.');
let client;
let exec;
let query;
let close;
if (embedded) {
  const { PGlite } = await import('@electric-sql/pglite');
  client = new PGlite();
  exec = sql => client.exec(sql);
  query = sql => client.query(sql);
  close = () => client.close();
} else {
  if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to a disposable database.');
  const { default: pg } = await import('pg');
  client = new pg.Client({ connectionString: process.env.COURSE_DATABASE_URL, connectionTimeoutMillis: 10000 });
  await client.connect();
  exec = sql => client.query(sql);
  query = sql => client.query(sql);
  close = () => client.end();
}
const cases = JSON.parse(await readFile(new URL('./cases.json', import.meta.url), 'utf8'));
let checks = 0;
try {
  console.log((await query('SELECT version() AS version')).rows[0].version);
  for (const item of cases) {
    const setup = await readFile(new URL('../labs/' + item.lab + '/setup.sql', import.meta.url), 'utf8');
    const solution = await readFile(new URL('../labs/' + item.lab + '/solution.sql', import.meta.url), 'utf8');
    await exec(setup);
    await exec(setup);
    for (const [index, step] of item.steps.entries()) {
      try {
        if (step.reset) { await exec(setup); continue; }
        if (step.error) {
          let failure;
          try { await exec(step.sql); } catch (error) { failure = error; }
          assert.ok(failure, 'Expected SQLSTATE ' + step.error + ', but the statement succeeded.');
          const expectedCodes = Array.isArray(step.error) ? step.error : [step.error];
          assert.ok(expectedCodes.includes(failure.code), 'Expected ' + expectedCodes.join(' or ') + ', received ' + failure.code);
          checks++;
        } else if (step.query) {
          assert.deepEqual((await query(step.query)).rows, step.rows);
          checks++;
        } else {
          await exec(step.sql);
        }
      } catch (error) {
        throw new Error(item.lab + ' step ' + (index + 1) + ': ' + error.message, { cause: error });
      }
    }
    await exec(setup);
    await exec(solution);
    for (const step of item.solution) {
      assert.deepEqual((await query(step.query)).rows, step.rows);
      checks++;
    }
    console.log('PASS ' + item.lab + ' (reset, failure/state checks, solution)');
  }
  console.log('PASS ' + checks + ' assertions across ' + cases.length + ' labs.');
} finally {
  try { await exec('ROLLBACK'); } catch {}
  await close();
}

