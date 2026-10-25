# Lab 19 — Choose indexes for a workload

Read [the article](../../articles/19-index-decisions.md), then run [setup.sql](setup.sql). It resets only course_index. Use the [shared guide](../README.md).

The orders table has 60,000 rows, 1,000 customers and 600 open orders. Inspect the distribution instead of assuming it resembles every production shop.

## Inventory the current indexes

```sql
SELECT tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname = 'course_index' ORDER BY tablename, indexname;
```

Identify the order primary-key index. Confirm there is no separate customer_id index despite the foreign key. The referenced customer key and the referencing order column serve different searches.

Baseline query:

```sql
SELECT id, total_cents FROM course_index.orders
WHERE customer_id = 42 ORDER BY placed_at DESC, id DESC LIMIT 5;
```

Expect 59042, 58042, 57042, 56042, 55042, each for 142 cents. Save the result and plan.

## Compare two candidates

First create CREATE INDEX orders_customer_only_idx ON course_index.orders (customer_id);. Measure the query, then drop only that candidate with DROP INDEX course_index.orders_customer_only_idx;.

Now create the composite covering index shown in the article. Measure again. Compare ordering/sort work, visited rows, buffers and first-plus-five subsequent timings, while retaining identical results.

Inspect whether the plan reports Heap Fetches. INCLUDE makes the needed payload available; it does not guarantee zero heap work. Compare a query without the leading customer restriction and explain why the index might still be usable but less useful.

## A smaller queue index

Create the partial open-order index from the article. Its first five IDs are 100, 200, 300, 400, 500.

Create a comparison full index:

```sql
CREATE INDEX orders_all_time_idx ON course_index.orders (placed_at, id);
SELECT pg_relation_size('course_index.orders_open_idx') AS partial_bytes,
       pg_relation_size('course_index.orders_all_time_idx') AS full_bytes;
```

Measure both the open queue and a closed-order query. Explain why the partial index alone cannot supply excluded rows. Do not remove the status predicate simply to change a plan: that changes the answer.

Drop orders_all_time_idx after the comparison unless you can justify its own workload.

## An index can enforce a scoped rule

Create subscriptions_one_active_idx from the article. Customer 1 already has an active subscription.

Try adding another active subscription for customer 1: expect 23505. Try changing subscription 2 from inactive to active: expect 23505 and its original state preserved. Adding another inactive subscription is allowed.

The rule is at most one active row; it does not require any active row. Inspect the rows after each failure. Reset before rerunning solution.sql.

## Measure the write side

From a fresh setup, record the first and five subsequent executions of:

```sql
BEGIN;
EXPLAIN (ANALYZE, BUFFERS, WAL)
UPDATE course_index.orders
SET placed_at = placed_at + interval '1 second' WHERE id <= 1000;
ROLLBACK;
```

Save the original facts and confirm they remain equal. Repeat with the composite index installed. Record actual WAL, buffer and timing observations plus index bytes; do not invent a universal slowdown ratio.

Rollback restores visible facts but leaves physical/cache effects. The native checker performs a plain VACUUM between its baseline write trials and index comparisons. This bounded experiment does not measure sustained production throughput or concurrent index deployment.

## Independent transfer and feedback

For project 8, return the latest three tickets with deterministic ordering. Expect 11808, 11608, 11408. Propose and measure the index before viewing [solution.sql](solution.sql).

Hint: filtering, ordering and output payload have different roles in an index. A candidate is useful only relative to an identified query and acceptable write/storage cost.

The reference solution creates the selected customer, open-queue, partial-unique and project indexes. Run it from fresh setup. Deliver a keep/reject decision for each candidate, full result checks and repeated measurements. Record actual learner effort/help separately.

The native author checker is node tests/verify-performance.mjs --lab=19. Its JSON retains the baseline, single-column and composite plans, queue plans, sizes and write observations.

Return later: why might the index that helps the customer page not help the global open queue?
