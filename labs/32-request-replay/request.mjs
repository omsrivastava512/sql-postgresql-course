import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

export async function acceptOrder(client, store, key, sku, quantity) {
  for (let attempt = 1; ; attempt++) {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    try {
      const result = await client.query(
        'SELECT course_replay.accept_order($1, $2, $3, $4) AS receipt',
        [store, key, sku, quantity]
      );
      await client.query('COMMIT');
      return result.rows[0].receipt;
    } catch (error) {
      await client.query('ROLLBACK');
      if (!['40001', '40P01'].includes(error.code)) throw error;
      if (attempt === 3) throw new Error('Transaction failed after three attempts', { cause: error });
      await setTimeout(attempt * 100 + Math.floor(Math.random() * 51));
    }
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to a disposable database.');
  const client = new pg.Client({ connectionString: process.env.COURSE_DATABASE_URL, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
  await client.connect();
  try {
    await acceptOrder(client, 'North', 'counter-1', '17', 3);
    process.stdout.write('First receipt deliberately discarded after commit.\n');
    const receipt = await acceptOrder(client, 'North', 'counter-1', '17', 3);
    process.stdout.write(JSON.stringify(receipt) + '\n');
  } finally {
    await client.end();
  }
}
