import { pathToFileURL } from 'node:url';
import { requestConfig, fixtureUser, signIn, dataRequest } from '../33-request-identity/request.mjs';

export async function readDrafts(config, token) {
  return dataRequest(config, token, 'course_auth34_api', 'draft_orders?select=*&order=draft_id');
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const config = requestConfig();
  const alias = process.argv[2] || 'alice';
  const user = await fixtureUser(alias);
  const session = await signIn(config, user.email, user.password);
  console.log(JSON.stringify({ alias, ...await readDrafts(config, session.token) }));
}
