import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { requestConfig, fixtureUser, signIn, dataRequest } from '../33-request-identity/request.mjs';

export async function placeOrder(config, token, store, key, sku, quantity) {
  for (let attempt = 1; ; attempt++) {
    let response;
    try {
      response = await dataRequest(config, token, 'course_auth35_api', 'rpc/place_order', {
        method: 'POST', body: { p_store: store, p_key: key, p_sku: sku, p_quantity: quantity }
      });
    } catch (cause) {
      const error = new Error('Order outcome unknown; retain the same store, actor, key and payload.', { cause });
      error.code = 'OUTCOME_UNKNOWN';
      throw error;
    }
    if (response.status >= 200 && response.status < 300) return response.body;
    if (!['40001', '40P01'].includes(response.body?.code) || attempt === 3) {
      const error = new Error('Order request rejected: HTTP ' + response.status);
      error.status = response.status;
      error.code = response.body?.code;
      throw error;
    }
    await setTimeout(attempt * 100 + Math.floor(Math.random() * 51));
  }
}

export async function readOwnReceipt(config, token, store, key) {
  return dataRequest(config, token, 'course_auth35_api', 'rpc/read_own_receipt', {
    method: 'POST', body: { p_store: store, p_key: key }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const config = requestConfig();
  const alias = process.argv[2] || 'alice';
  const action = process.argv[3] || 'read';
  const key = process.argv[4];
  const store = process.argv[5] || 'North';
  const sku = process.argv[6] || '17';
  const quantity = process.argv[7] === undefined ? 3 : Number(process.argv[7]);
  if (!key || !['place', 'read'].includes(action)) throw new Error('Usage: request.mjs <alias> <place|read> <request-key> [store] [sku] [quantity]');
  const user = await fixtureUser(alias);
  const session = await signIn(config, user.email, user.password);
  const result = action === 'place'
    ? await placeOrder(config, session.token, store, key, sku, quantity)
    : await readOwnReceipt(config, session.token, store, key);
  console.log(JSON.stringify(result));
}
