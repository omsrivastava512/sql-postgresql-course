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

### Follow one captured plan

This is the actual output of the command above, captured on 26 October 2026 using PostgreSQL 17.11, Windows x64, role course_author, through Node.js 24.15.0 and pg 8.16.3. It follows a fresh run of setup.sql, including its ANALYZE statements, before adding the customer index. Planner enable settings were left at their defaults; shared_buffers was 32MB and work_mem was 4MB. The table had just been loaded and read, so this is not a cold-cache measurement.

```text
Sort  (cost=1117.06..1117.16 rows=40 width=8) (actual time=2.081..2.083 rows=40 loops=1)
  Sort Key: id
  Sort Method: quicksort  Memory: 25kB
  Buffers: shared hit=616
  ->  Seq Scan on orders  (cost=0.00..1116.00 rows=40 width=8) (actual time=0.013..2.068 rows=40 loops=1)
        Filter: (customer_id = 42)
        Rows Removed by Filter: 39960
        Buffers: shared hit=616
Planning Time: 0.069 ms
Execution Time: 2.103 ms
```

Read this from the scan toward the final output:

1. **Find the matching orders.** Seq Scan visits the table and tests customer_id = 42. It emits forty rows and removes 39,960. With loops=1, those counts account for all 40,000 supplied orders. The scan's rows=40 describes rows passed onward, not rows inspected.
2. **Compare the prediction with the observation.** The rows=40 beside cost is the planner's estimate; the rows=40 beside actual time is observed output. They agree here because the estimate fits this evenly distributed fixture. That agreement is something to check, not an assumption for the next query. Cost is in planner units, not elapsed milliseconds.
3. **Order the survivors.** Sort receives those forty rows and orders them by id, using 25kB in this run. It does not filter out more orders. The query must still return 42, 1042, …, 39042 with amount 142 each. A plan's row count cannot prove the IDs or the 5680-cent total; the saved query result supplies that check.
4. **Keep nested work separate from output size.** Both nodes report 616 shared buffer hits. The upper total includes its child's work; adding them would count that activity twice. The measured execution time, 2.103 ms, is one server observation, not the time to deliver and render a customer page.

Your plan shape, estimates, buffer activity and times may differ with version, statistics, settings and cache state. Use this output to learn what to inspect, not as a required transcript or speed target. [Capture and verification record](../VERIFICATION.md#focused-editorial-revisions--2026-10-26)

This plan has no repeated node. In the lab's later three-customer lookup, inspect loops again: actual rows and node times are averages per execution, so forty rows over three loops means 120 emitted rows across those lookups. A limit can stop consumption early; an aggregate can reduce many input rows to one answer.

Node times also include work below them, so summing parent and child times overstates the total. [Plan-reading reference](https://www.postgresql.org/docs/17/using-explain.html)

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
