import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

export async function readCustomers(db, mode, pattern = 'Customer %', limit = 30, sort = 'id') {
  const sorts = {
    id: { chosen: 'id', joined: 'c.id' },
    name: { chosen: 'name, id', joined: 'c.name, c.id' }
  };
  if (!Object.hasOwn(sorts, sort)) throw new Error('Choose id or name sorting.');
  if (!['loop', 'batch', 'join'].includes(mode)) throw new Error('Choose loop, batch or join.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Limit must be an integer from 1 to 100.');
  let queryCount = 0;
  let rowCount = 0;
  let rowBytes = 0;
  const start = performance.now();
  async function query(text, values) {
    const result = await db.query(text, values);
    queryCount++;
    rowCount += result.rows.length;
    rowBytes += Buffer.byteLength(JSON.stringify(result.rows));
    return result.rows;
  }
  let customers;
  const chosen = 'SELECT id, name FROM course_request.customers WHERE active AND name LIKE $1 ORDER BY ' + sorts[sort].chosen + ' LIMIT $2';
  if (mode === 'join') {
    const joined = await query('WITH chosen AS (' + chosen + ') SELECT c.id, c.name, o.id AS order_id, o.cents FROM chosen c LEFT JOIN course_request.orders o ON o.customer_id = c.id AND o.status = \'paid\' ORDER BY ' + sorts[sort].joined + ', o.id', [pattern, limit]);
    const grouped = new Map();
    for (const row of joined) {
      if (!grouped.has(row.id)) grouped.set(row.id, { id: row.id, name: row.name, orders: [] });
      if (row.order_id !== null) grouped.get(row.id).orders.push({ id: row.order_id, cents: row.cents });
    }
    customers = [...grouped.values()];
  } else {
    customers = (await query(chosen, [pattern, limit])).map(row => ({ ...row, orders: [] }));
    if (mode === 'loop') {
      for (const customer of customers) {
        customer.orders = await query('SELECT id, cents FROM course_request.orders WHERE customer_id = $1 AND status = \'paid\' ORDER BY id', [customer.id]);
      }
    } else if (customers.length) {
      const orders = await query('SELECT id, customer_id, cents FROM course_request.orders WHERE customer_id = ANY($1::integer[]) AND status = \'paid\' ORDER BY customer_id, id', [customers.map(customer => customer.id)]);
      const grouped = new Map(customers.map(customer => [customer.id, customer.orders]));
      for (const order of orders) grouped.get(order.customer_id).push({ id: order.id, cents: order.cents });
    }
  }
  return { customers, queryCount, rowCount, rowBytes, elapsedMs: performance.now() - start };
}

export async function readProjects(db, mode) {
  if (!['loop', 'group'].includes(mode)) throw new Error('Choose loop or group.');
  let queryCount = 0;
  const start = performance.now();
  async function query(text, values) {
    queryCount++;
    return (await db.query(text, values)).rows;
  }
  let projects;
  if (mode === 'loop') {
    projects = await query('SELECT id FROM course_request.projects WHERE active ORDER BY id');
    for (const project of projects) {
      project.open_tasks = (await query('SELECT count(*)::integer AS n FROM course_request.tasks WHERE project_id = $1 AND NOT done', [project.id]))[0].n;
    }
  } else {
    projects = await query('SELECT p.id, count(t.id)::integer AS open_tasks FROM course_request.projects p LEFT JOIN course_request.tasks t ON t.project_id = p.id AND NOT t.done WHERE p.active GROUP BY p.id ORDER BY p.id');
  }
  return { projects, queryCount, elapsedMs: performance.now() - start };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  if (!process.env.COURSE_DATABASE_URL) throw new Error('Set COURSE_DATABASE_URL to a disposable database after running setup.sql.');
  const pool = new pg.Pool({ connectionString: process.env.COURSE_DATABASE_URL, max: 2, connectionTimeoutMillis: 10000, statement_timeout: 10000 });
  try {
    let expected;
    for (const mode of ['loop', 'batch', 'join']) {
      const samples = [];
      for (let run = 0; run < 6; run++) {
        const result = await readCustomers(pool, mode, process.argv[2] ?? 'Customer %');
        if (!expected) expected = result.customers;
        assert.deepEqual(result.customers, expected);
        samples.push({ queryCount: result.queryCount, rowCount: result.rowCount, rowBytes: result.rowBytes, elapsedMs: result.elapsedMs });
      }
      console.log(JSON.stringify({ mode, first: samples[0], subsequent: samples.slice(1) }));
    }
  } finally {
    await pool.end();
  }
}
