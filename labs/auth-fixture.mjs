import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { requestConfig } from './33-request-identity/request.mjs';

const labs = { 33: '33-request-identity', 34: '34-authorized-requests', 35: '35-authorized-replay' };
const aliases = ['alice', 'bob', 'reader', 'outsider'];

export function requireDisposable() {
  if (process.env.COURSE_AUTH_DISPOSABLE !== 'yes') throw new Error('Set COURSE_AUTH_DISPOSABLE=yes only for the dedicated course project.');
}

export async function manifest() {
  const data = JSON.parse(await readFile(process.env.COURSE_AUTH_MANIFEST || '.env.auth-course.json', 'utf8'));
  if (data.url !== requestConfig().url) throw new Error('Fixture manifest/project mismatch.');
  if (!aliases.every(alias => data.users[alias]?.id)) throw new Error('Run fixture user provisioning to completion.');
  return data;
}

export async function provisionUsers() {
  requireDisposable();
  const config = requestConfig();
  const adminKey = process.env.COURSE_SUPABASE_ADMIN_KEY;
  if (!adminKey) throw new Error('Set COURSE_SUPABASE_ADMIN_KEY for fixture provisioning only.');
  const file = process.env.COURSE_AUTH_MANIFEST || '.env.auth-course.json';
  let data;
  try { data = JSON.parse(await readFile(file, 'utf8')); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    data = { url: config.url, run: randomBytes(8).toString('hex'), users: {} };
  }
  if (data.url !== config.url) throw new Error('Fixture manifest/project mismatch.');
  for (const alias of aliases) {
    if (!data.users[alias]) {
      data.users[alias] = { email: 'course-' + data.run + '-' + alias + '@example.test', password: randomBytes(24).toString('base64url') };
      await writeFile(file, JSON.stringify(data, null, 2), { mode: 0o600 });
    }
    const user = data.users[alias];
    if (user.id) continue;
    const response = await fetch(config.url + '/auth/v1/admin/users', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { apikey: adminKey, Authorization: 'Bearer ' + adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password, email_confirm: true })
    });
    const body = await response.json();
    if (!response.ok || !body.id) throw new Error('Provisioning ' + alias + ' did not complete: HTTP ' + response.status + '. Preserve the manifest and reconcile this account before retrying.');
    user.id = body.id;
    await writeFile(file, JSON.stringify(data, null, 2), { mode: 0o600 });
  }
  return data;
}

export async function adminConnection() {
  requireDisposable();
  if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to the same project using a persistent direct/session connection.');
  const client = new pg.Client({ connectionString: process.env.COURSE_DATABASE_URL, connectionTimeoutMillis: 10000, statement_timeout: 20000, application_name: 'course-auth-verifier' });
  await client.connect();
  return client;
}

export async function resetLab(client, number, users, solved = true) {
  requireDisposable();
  const lab = labs[number];
  if (!lab) throw new Error('Choose lesson 33, 34 or 35.');
  const ids = aliases.map(alias => users[alias].id);
  const matched = await client.query('SELECT count(*)::integer AS n FROM auth.users WHERE id = ANY($1::uuid[])', [ids]);
  if (matched.rows[0].n !== aliases.length) throw new Error('The SQL connection does not contain this fixture\'s Auth users.');
  await client.query(await readFile(new URL('./' + lab + '/setup.sql', import.meta.url), 'utf8'));
  if (solved) await client.query(await readFile(new URL('./' + lab + '/solution.sql', import.meta.url), 'utf8'));
  for (const alias of ['alice', 'bob', 'reader']) {
    const actor = users[alias].id;
    const store = alias === 'bob' ? 'South' : 'North';
    if (number === 33) {
      await client.query('INSERT INTO course_auth33_api.profiles VALUES ($1,$2)', [actor, alias]);
      await client.query('INSERT INTO course_auth33_private.memberships VALUES ($1,$2,true)', [store, actor]);
    } else if (number === 34) {
      await client.query('INSERT INTO course_auth34_private.memberships VALUES ($1,$2,true,$3)', [store, actor, alias !== 'reader']);
      await client.query("INSERT INTO course_auth34_api.draft_orders (store,actor,sku,quantity) VALUES ($1,$2,'17',3)", [store, actor]);
    } else {
      await client.query('INSERT INTO course_auth35_private.memberships VALUES ($1,$2,true,$3,true)', [store, actor, alias !== 'reader']);
    }
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const action = process.argv[2];
  if (action === 'users') {
    await provisionUsers();
    console.log('Fixture users recorded; credentials are in the private manifest.');
  } else if (action === 'reset') {
    const data = await manifest();
    const client = await adminConnection();
    try { await resetLab(client, Number(process.argv[3]), data.users, process.argv[4] !== '--unsolved'); }
    finally { await client.end(); }
    console.log('Requested lesson fixture reset.');
  } else throw new Error('Usage: auth-fixture.mjs users | reset <33|34|35> [--unsolved]');
}
