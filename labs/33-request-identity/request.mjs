import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function requestConfig() {
  const url = process.env.COURSE_SUPABASE_URL;
  const key = process.env.COURSE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Set COURSE_SUPABASE_URL and COURSE_SUPABASE_PUBLISHABLE_KEY.');
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname))) {
    throw new Error('Use HTTPS or a local loopback URL.');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw new Error('Supply the project origin without credentials, paths or query parameters.');
  }
  if (!key.startsWith('sb_publishable_')) {
    let role;
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
    if (role !== 'anon') throw new Error('Use a publishable project key or the local legacy anon key, never an administrative key.');
  }
  return { url: parsed.origin, key };
}

export async function fixtureUser(alias) {
  const manifest = JSON.parse(await readFile(process.env.COURSE_AUTH_MANIFEST || '.env.auth-course.json', 'utf8'));
  if (manifest.url !== requestConfig().url) throw new Error('The fixture manifest belongs to another project.');
  const user = manifest.users[alias];
  if (!user) throw new Error('Choose an alias present in the fixture manifest.');
  return user;
}

export async function signIn(config, email, password) {
  const response = await fetch(config.url + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { apikey: config.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    redirect: 'error',
    signal: AbortSignal.timeout(20000)
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error('Sign-in rejected: HTTP ' + response.status);
    error.status = response.status;
    error.code = body.error_code || body.code;
    throw error;
  }
  if (!body.access_token || !body.user?.id) throw new Error('Auth did not return an access token and user ID.');
  return { token: body.access_token, actor: body.user.id, expiresAt: body.expires_at };
}

export async function dataRequest(config, token, schema, resource, options = {}) {
  if (!/^course_auth(33|34|35)_(api|private)$/.test(schema)) throw new Error('Choose a course fixture schema.');
  if (!/^[a-z_][a-z0-9_/?=&.,()%*+:-]*$/i.test(resource) || resource.includes('..')) throw new Error('Use a relative Data API resource.');
  const headers = { apikey: config.key, 'Accept-Profile': schema, 'Content-Profile': schema };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.representation) headers.Prefer = 'return=representation';
  const response = await fetch(config.url + '/rest/v1/' + resource, {
    method: options.method || 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    redirect: 'error', signal: options.signal || AbortSignal.timeout(20000)
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const config = requestConfig();
  const alias = process.argv[2] || 'alice';
  const user = alias === 'anon' ? null : await fixtureUser(alias);
  const session = user ? await signIn(config, user.email, user.password) : null;
  for (const resource of ['rpc/request_identity', 'profiles?select=user_id,display_name', 'stores?select=store,description&order=store']) {
    console.log(JSON.stringify({ alias, resource, ...await dataRequest(config, session?.token, 'course_auth33_api', resource) }));
  }
}
