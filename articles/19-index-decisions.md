# Which index earns its cost?

A customer needs their five latest orders. Operations needs the oldest open orders across all customers. Those are two different access patterns, even though both read the same table.

By the end, propose indexes for named queries, test a partial uniqueness rule, and compare read benefits with storage and write work.

**Scope:** PostgreSQL B-tree, composite, partial and covering indexes on a supplied workload. Specialist search indexes and production index deployment are later work.

## Inspect what already exists

[Lab 19](../labs/19-index-decisions/README.md) supplies 60,000 orders and a customer foreign key. Inspect pg_indexes: the order primary key has an index, but declaring customer_id REFERENCES did not create a referencing-side index.

That omission is a question to investigate, not an instruction to index every column. Parent deletes, joins and filtered reads can make referencing-side access important; table size, selectivity and write load still matter. [Foreign-key reference](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK)

For customer 42, the required latest IDs are 59042, 58042, 57042, 56042 and 55042.

## Match filtering and ordering

Compare a customer-only index with:

```sql
CREATE INDEX orders_customer_recent_idx
ON course_index.orders (customer_id, placed_at DESC, id DESC)
INCLUDE (total_cents);
```

The leading customer value groups a customer's entries; the following keys match the required ordering. ID resolves timestamp ties. total_cents is carried as payload, not an additional ordering key.

For a B-tree, leading equality restrictions followed by the first range restriction are particularly useful for narrowing scanned entries. A query missing a leading key can still use an index in PostgreSQL 17; it may need to scan much more of it. “Cannot use” is too strong. Test the actual plan. [Multicolumn indexes](https://www.postgresql.org/docs/17/indexes-multicolumn.html)

INCLUDE can make an index-only plan possible, but visibility checks can still require heap visits. Inspect Heap Fetches where present. A covering index is wider; it is not free or guaranteed to avoid table access. [Index-only scans](https://www.postgresql.org/docs/17/indexes-index-only-scans.html)

## Index a subset with a named purpose

Only 600 orders are open. For that queue:

```sql
CREATE INDEX orders_open_idx
ON course_index.orders (placed_at, id)
WHERE status = 'open';
```

The query must imply the index predicate. This index cannot answer the entire closed-order queue. The lab compares it with a full index of the same keys and measures their actual sizes.

A partial index can also enforce a scoped rule:

```sql
CREATE UNIQUE INDEX subscriptions_one_active_idx
ON course_index.subscriptions (customer_id) WHERE active;
```

Customer 1 may have several inactive subscriptions but at most one active one. The rule does not require an active subscription to exist. Test both insertion and changing an inactive row to active. [Partial-index reference](https://www.postgresql.org/docs/17/indexes-partial.html)

## Pay for the index

Measure the same SELECT before and after, then measure an update to placed_at with and without the proposed composite index. Record repeated observations, index bytes, buffer activity and WAL bytes where available. Roll back each ordinary update and verify the original facts.

Rollback does not erase all physical work or cache effects. These small trials expose maintenance work; they are not a sustained throughput benchmark. A read improvement alone does not justify an index that harms the application's important writes.

Do not retain every candidate simply because its individual query can use it. State which workloads justify the final set and which candidate you rejected.

## Practise and transfer

The [lab](../labs/19-index-decisions/README.md) transfers the decision to the latest tickets within a project. Project 8 should return 11808, 11608 and 11408. Defend key order and preserved sorting before inspecting the solution.

**Requires:** [execution plans](18-query-plans.md) and [row identity](09-row-identity.md).
**Next:** [Why does the later page do more work?](20-deep-pages.md).
**Return:** what additional evidence is needed after a new index makes one SELECT faster?
