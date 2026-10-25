# Lab 18 — Find the work before changing the query

Read [the article](../../articles/18-query-plans.md), then run [setup.sql](setup.sql) using [the connection guide](../README.md). It resets only course_plan. The generated fixture has 40,000 orders and 12,000 deliveries; inspect counts and column meanings before measuring.

## Establish the answer

Customer IDs repeat evenly across 1,000 customers. Query customer 42's id and amount_cents, ordered by id. Expect forty rows: 42, 1042, …, 39042; every amount is 142, totalling 5680.

Save the complete result. A matching count alone would not catch a different set of forty orders.

## Read the baseline

Run EXPLAIN first, then:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, amount_cents FROM course_plan.orders
WHERE customer_id = 42 ORDER BY id;
```

Locate the scan, filter and any sort. Identify estimated rows, actual rows, loops and rows removed by the filter. Explain why estimated cost is not elapsed milliseconds. For any repeated node, distinguish per-loop rows from the total emitted across loops.

Record the server version, role, table count, query, first execution and five subsequent executions. Keep the plan and root buffer totals with the times. These runs share a recently loaded database and caches; do not call the first run a controlled cold-cache run.

## Test one candidate

Create an index on customer_id, then rerun the identical query. Compare all ordered rows before interpreting the new plan.

Record index name, scan/filter work, root buffer activity and repeated timings. Do not require a particular scan name or a fixed percentage improvement on every machine.

Now explain and run SELECT * FROM course_plan.orders. It returns all 40,000 rows. Decide whether a sequential scan would be surprising for that request. An index existing does not oblige the planner to use it.

After creating the customer index, explain this repeated lookup:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT c.customer_id,
       (SELECT count(*)::integer FROM course_plan.orders o WHERE o.customer_id = c.customer_id) AS n
FROM (VALUES (1), (42), (999)) c(customer_id) ORDER BY c.customer_id;
```

Each of the three customers has forty orders. Identify the node executed three times; distinguish forty rows per loop from 120 rows across the three lookups. The aggregate subplan emits one count each time.

## Does the measuring command write?

First run EXPLAIN without ANALYZE on the update below. Confirm amount_cents for id 1 remains 101. Then:

```sql
BEGIN;
EXPLAIN ANALYZE UPDATE course_plan.orders
SET amount_cents = amount_cents + 1 WHERE id = 1;
SELECT amount_cents FROM course_plan.orders WHERE id = 1;
ROLLBACK;
SELECT amount_cents FROM course_plan.orders WHERE id = 1;
```

Expect 102 inside the transaction and 101 afterward. Explain why the ordinary table change was undone, and why that does not authorize measuring arbitrary production writes or external-effect functions.

## Independent transfer

Find undelivered deliveries on route 7, ordered by id. There are twenty, with eighty package units. Read its baseline plan, propose an index, then preserve all returned IDs/units while measuring the change.

Change the request to all routes. Does your original justification still hold? Describe the additional workload evidence needed before retaining the index.

## Feedback and delivery

Hint: the number at an aggregate or Limit node can hide work in its children. Deeper hint: state the selective predicate before choosing the leading index column.

[solution.sql](solution.sql) creates the two reference indexes and inspects the results. Run it after fresh setup; do not recreate an index already added manually.

Deliver complete result comparisons, before/after plans, six observations per candidate and a short decision including uncertainty. No fixed millisecond target is a passing grade. Record real learner effort and assistance only after an attempt.

The native author checker is node tests/verify-performance.mjs --lab=18 with COURSE_DATABASE_URL set. Its JSON includes plans and observations; the embedded checker verifies SQL results, not native performance.

Return later: how could a query return forty rows while doing work on forty thousand?
