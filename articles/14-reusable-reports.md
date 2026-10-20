# What does this monthly number mean?

October's sales report changes when someone updates today's catalog price. A refund appears in a different month from its order. The SQL can run correctly while the number means something nobody agreed to.

By the end, write a metric contract, preserve historical amounts, rerun a report for another period and distinguish a live view from a stored snapshot.

**Scope:** SQL reporting, PostgreSQL views and exact arithmetic. This fictional management report is not a prescribed accounting policy.

## Define the number before writing the query

Run [lab 14's setup](../labs/14-reusable-reports/setup.sql). Use this contract:

| Decision | Rule in this exercise |
|---|---|
| Output grain | One row per supplied reporting period, even when empty |
| Eligible orders | Currently marked paid and having at least one line; cancellations and pending orders are excluded |
| Sales date | Order placement instant, assigned to the reporting period |
| Amount | Historical line quantity × unit cents, minus the line's total discount cents |
| Refunds | Subtract refunds for currently paid orders in the period when the refund occurred |
| Time boundary | Asia/Kolkata calendar-month boundaries, supplied as explicit +05:30 instants; start inclusive, end exclusive |
| Average unit amount | Total eligible sales cents divided by total eligible units, before refunds; NULL with zero units |
| Rounding | Keep exact integer cents; divide as NUMERIC and round the final average to two decimal places in cents |

“Currently paid” means this is a live management report, not an immutable historical close. A status correction can change an old period. A business needing historical eligibility must store and query that history. The fixture does not include taxes, multiple currencies or payment settlement rules.

## Preserve the historical line amount

Order 101 contains one unit at 1001 cents with a one-cent line discount, plus three units at 500 cents. Its sales amount is 2500 cents and its unit count is four.

```sql
SELECT order_id, SUM(quantity) AS units,
       SUM(quantity::bigint * unit_cents - discount_cents) AS sale_cents
FROM course_report.lines
GROUP BY order_id
ORDER BY order_id;
```

The discount is a total for the line, not a per-unit discount. The current product prices are different; joining to them would rewrite the report's meaning. Casting quantity to bigint also avoids doing the multiplication in the narrower integer type.

A one-row-per-order view can name this calculation and include the order's date and status. CREATE VIEW stores the query definition. Reading an ordinary view reads its underlying data; it does not freeze this month's totals.

## Keep sales and refunds at the same grain

Summarize eligible orders per period, summarize refund events per period independently, then join the two period summaries. The [lab's solution](../labs/14-reusable-reports/solution.sql) uses two named steps and preserves periods with no events.

| Period | Orders | Units | Sales cents | Refund cents | Net cents | Average unit cents |
|---|---|---|---|---|---|---|
| 2026-10 | 2 | 5 | 3500 | 100 | 3400 | 700.00 |
| 2026-11 | 2 | 4 | 4000 | 300 | 3700 | 1000.00 |
| 2026-12 | 0 | 0 | 0 | 0 | 0 | NULL |

The 300-cent refund in November belongs to October's order 101. Filtering refunds only through November's newly placed orders would miss it.

Weighted average unit amount is 3500 / 5 = 700 cents in October. Averaging the three line-level unit amounts gives a different weight to each line and answers a different question. NULLIF(units, 0) returns NULL for a zero denominator, so an empty month does not cause division by zero.

## Test the boundary, not only the middle

Order 101 at September 30 18:30 UTC is exactly October 1 midnight at the supplied +05:30 boundary. It belongs to October. Order 104 at October 31 18:30 UTC belongs to November.

Use placed_at >= start_at AND placed_at < end_at. An inclusive upper bound such as BETWEEN would count the boundary order in both adjacent periods. The stored instant does not change when the session's display timezone changes. Other business calendars and daylight-saving transitions need their own tests.

## Reuse a report and decide whether it should refresh

The period table supplies October, November and December. The view returns all three without replacing date literals throughout its definition. A fourth period can be added as data and selected by label. An application can bind that label as a value; application parameter handling is taught later.

A materialized view stores a query result. Changes to source facts appear in the ordinary view but not in the materialized result until REFRESH MATERIALIZED VIEW. The lab measures that difference with a 50-cent refund correction. A stored snapshot is not automatically an audit trail: refresh replaces its contents.

For top orders, November has two orders tied at 2000 cents. A report promising all top ties must return both; a “one winner” report needs a separate tie-breaker.

## Practise, interpret and transfer

The [lab](../labs/14-reusable-reports/README.md) asks you to explain the October and November figures, add an empty or refund-only period, and independently report usage per active subscription account, including accounts with no events.

A suitable interpretation is: under the stated live policy, November has 3700 net cents after refund events, including a refund for an older order. This alone says nothing about profit, cash settlement or why sales changed.

**Requires:** [aggregate grain](11-aggregate-grain.md), [CTEs](12-query-shapes.md) and [windows](13-window-questions.md).
**Next:** [Can this imported data be trusted?](15-data-handoff.md).
**Return:** explain which source changes should alter an old report and which should not.
**References:** PostgreSQL [views](https://www.postgresql.org/docs/17/sql-createview.html), [materialized views](https://www.postgresql.org/docs/17/rules-materializedviews.html), [numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html) and [date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html).
