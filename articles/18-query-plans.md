# Where did this query spend its work?

The customer page returns forty orders. The table holds forty thousand. Those two counts tell us different things: how much information the caller receives, and how much work the database may do to find it.

By the end, read a small execution plan, compare estimated and actual rows, and measure a proposed change while preserving the result.

**Scope:** PostgreSQL 17 query diagnosis. These measurements describe the supplied dataset and machine, not production latency.

## Start with the answer

[Lab 18](../labs/18-query-plans/README.md) supplies 40,000 orders across 1,000 customers. Customer 42 has forty orders, totalling 5680 cents. Establish those facts before changing an index.

```sql
SELECT id, amount_cents
FROM course_plan.orders
WHERE customer_id = 42 ORDER BY id;
```

The IDs are 42, 1042, 2042, through 39042. Each amount is 142. A faster query returning only one of those rows is wrong.

## Estimate first, then execute

EXPLAIN displays the chosen plan without running this SELECT. EXPLAIN ANALYZE runs it and adds observed execution information. Adding BUFFERS shows buffer activity.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, amount_cents
FROM course_plan.orders
WHERE customer_id = 42 ORDER BY id;
```

Read from the row-producing nodes toward the final output. A scan finds rows; a sort can establish ordering; a limit can stop consumption early. Cost is a planner estimate in configured units, not milliseconds. Actual rows and time on a node with multiple loops are averages per loop. Multiplying rows by loops helps interpret repeated work.

Do not add parent and child times or buffer totals as if they were independent bills. An upper node includes work beneath it. A count query's final one row also does not mean it examined one row. [Plan-reading reference](https://www.postgresql.org/docs/17/using-explain.html)

## Change one hypothesis

Predict the effect of:

```sql
CREATE INDEX orders_customer_idx ON course_plan.orders (customer_id);
```

An index keeps an additional searchable arrangement of values and row locations. It can reduce the work needed to locate a small subset. It also occupies space and must be maintained when relevant data changes.

Run the identical query and compare the complete ordered rows. Then inspect the new plan and repeat the timing. The lab records the first execution separately and five subsequent executions; it does not describe those as controlled cold-cache measurements.

A buffer hit means PostgreSQL found a block in its buffer cache. A read does not prove a physical disk access: the operating system may also cache data. Query execution, result transfer and application work are different measurements. [EXPLAIN reference](https://www.postgresql.org/docs/17/sql-explain.html)

## Test the counterexample

Remove the customer restriction and return all orders. A sequential scan can be a sensible choice when much of a table is needed. A nested loop is likewise not automatically a defect; inspect how many times its inner operation runs and how much work each run performs.

Changing planner enable flags until an index appears is not evidence that the ordinary workload improved. Leave the planner settings at their defaults for this comparison and record the server version and relevant settings.

EXPLAIN ANALYZE also executes writes. The lab increments one ordinary amount inside BEGIN, inspects that changed value, then rolls back and confirms restoration. That protects this fixture's table change; it does not undo arbitrary external effects or consumed sequence values.

## Practise and transfer

The [lab](../labs/18-query-plans/README.md) asks you to diagnose a route's undelivered packages without copying the customer index blindly. Route 7 has twenty undelivered deliveries carrying eighty units.

Deliver the query contract, exact result comparison, before/after plans, repeated timings and a conclusion bounded by this workload. If timing noise overwhelms a difference, say so and use the plan to identify the next measurement.

**Requires:** [filtering](08-selecting-rows.md), [joins](10-joins.md) and [aggregate grain](11-aggregate-grain.md).
**Next:** [Which index earns its cost?](19-index-decisions.md).
**Return:** a query outputs one aggregate row but its scan outputs forty thousand. Which number describes the work you need to investigate?
