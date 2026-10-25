# How much database work does one request cause?

Every order query is fast. The customer page is still slow because it issues one order query for each customer.

By the end, count database calls for a complete operation, preserve empty collections while batching, and distinguish waiting for a connection from a query waiting inside PostgreSQL.

**Scope:** a supplied Node.js/pg read-operation harness with PostgreSQL. No HTTP server, frontend framework or new dependency is required.

## State the response before optimizing

[Lab 22](../labs/22-request-work/README.md) supplies thirty active customers. Twenty-four have three paid orders each; six have none. The response must retain all thirty customers, with an empty orders array for those six. Pending orders and inactive customers stay out.

The [supplied request module](../labs/22-request-work/request.mjs) compares three implementations of that same response:

| Implementation | Calls for this fixture | Shape to preserve |
|---|---:|---|
| Customers, then one order lookup per customer | 31 | Thirty nested customer records |
| Customers, then one lookup for all their IDs | 2 | The same nested records |
| One LEFT JOIN, then group the returned rows | 1 | The same nested records |

Fewer calls do not automatically mean fewer bytes. A joined result repeats customer fields for each order. Compare call count, returned rows, approximate serialized row bytes and end-to-end function duration.

## Bind values without changing SQL structure

The batch binds the selected IDs as one array:

```sql
SELECT id, customer_id, cents FROM course_request.orders
WHERE customer_id = ANY($1::integer[]) AND status = 'paid'
ORDER BY customer_id, id;
```

The name pattern and limit are also bound values. An input containing SQL-looking text must remain a value. Sort choices map to fixed SQL fragments from an allowlist; a parameter cannot stand in for an SQL identifier.

The lab sends an adversarial-looking pattern, checks an empty result and confirms the tables survive. This is evidence for these inputs and statements, not a general security audit. [node-postgres query guidance](https://node-postgres.com/features/queries)

## Preserve the empty case

An INNER JOIN loses customers without paid orders. Moving the paid filter into WHERE can also remove the outer join's padded rows. Keep that condition in ON, then turn a NULL order ID into an empty collection rather than a fictitious order.

Both the query lesson and this performance exercise use the same correctness rule. Compare entire normalized responses, not only their lengths. A zero-customer search should avoid unnecessary follow-up calls.

The fixture is unchanged during comparisons. Multiple read statements do not inherently share a snapshot; an application requiring a consistent multi-query view needs a deliberate transaction policy.

## Observe a pool before increasing it

A pool reuses a bounded set of database connections. Borrowing a client can wait before any SQL reaches the server. By contrast, the lock wait in [lab 16](16-competing-claims.md) happened inside PostgreSQL after a statement arrived.

The live checker deliberately holds a pool's one available client, queues another checkout, observes waitingCount, then releases and verifies reuse of the same backend. This is a small diagnostic experiment, not a recommended production pool size.

Release a borrowed client in finally. Keep a transaction on one client; repeated pool.query calls do not guarantee that connection. Raising pool size can shift pressure to the database rather than solve the underlying work. [Pooling guidance](https://node-postgres.com/features/pooling)

## Practise and transfer

The [lab](../labs/22-request-work/README.md) records an initial run and five further runs for each response implementation. Local socket timings omit real deployment latency; query count and correctness remain useful evidence even when elapsed times are close.

Independently return open-task counts for all active projects, including zero counts. The expected result is project 1: two, project 2: zero, project 3: zero. Compare a per-project loop with a grouped query and count the calls.

**Requires:** [joins](10-joins.md), [aggregate grain](11-aggregate-grain.md) and [plans](18-query-plans.md).
**Revisited in:** [planned API and authorization work](../COURSE_MAP.md#the-wider-course).
**Return:** one statement is fast but the request makes 31 calls. Which measurement would an EXPLAIN of that one statement miss?
