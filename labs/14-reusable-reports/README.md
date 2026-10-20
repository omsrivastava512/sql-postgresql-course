# Lab 14 — Deliver a report with a contract

Read [the article](../../articles/14-reusable-reports.md) and run [setup.sql](setup.sql) through [the lab guide](../README.md). It resets only course_report. Each money amount is in cents of the same fictional currency.

## Inspect and state the metric

Read the article's contract, inspect periods, orders, lines and refunds, and write a short restatement before querying. Verify the order-101 calculation: 1 × 1001 − 1 + 3 × 500 = 2500 cents and four units.

Explain why the current product price is not the historical sale price, why a line discount is subtracted once, and why refunds have their own date.

## Guided report

Build an order_amounts view with one row per order having lines. Then build monthly_sales using separately aggregated sales and refunds, preserving every period.

Required columns: label, order_count, units, sale_cents, refund_cents, net_cents and average_unit_cents. Compare all columns with the article's October/November/December table, not just the net figure.

Inspect the exact-boundary orders 101,102,104. Demonstrate that BETWEEN would include order 104 in October as well as November; repair it with a half-open interval. Select October and November from the same view by label. Do not create separate hard-coded report definitions for each month.

Change the session timezone to UTC, then Asia/Kolkata, querying the report each time. The report totals must agree because the boundaries are explicit instants. Restore the session setting afterward.

## Break assumptions

1. Update product 1's current price to 99999. The report must be unchanged.
2. Confirm cancelled order 103 and pending order 105 contribute neither orders nor sales.
3. Explain why November includes the 300-cent refund on October's order 101.
4. Compare October's weighted average of 700.00 cents with the unweighted average of its three discounted line-unit prices. The latter is 833.33 and is not the requested metric.
5. Rank paid orders within each month by their total. All top ties: October = 101/2500; November = 104/2000 and 106/2000.
6. Add January 2027 as another period and a January refund of 150 cents on order 101. Expect orders 0, units 0, sales 0, refunds 150, net -150 and average NULL. No report definition changes are needed.

The new-period test is an independent requirement change. Close the solution before attempting it and record any help used.

## A live view and a stored result

After a fresh setup and successful solution, run:

```sql
CREATE MATERIALIZED VIEW course_report.sales_snapshot AS
SELECT * FROM course_report.monthly_sales;
UPDATE course_report.refunds SET cents = cents + 50 WHERE id = 2;
SELECT net_cents FROM course_report.monthly_sales WHERE label = '2026-10';
SELECT net_cents FROM course_report.sales_snapshot WHERE label = '2026-10';
REFRESH MATERIALIZED VIEW course_report.sales_snapshot;
SELECT net_cents FROM course_report.sales_snapshot WHERE label = '2026-10';
```

Expect 3350 from the ordinary view, 3400 from the stored result before refresh, then 3350 after refresh. This is an isolated edit to synthetic data, not a policy for editing financial records. Reset before the next task.

## Independent transfer

Use accounts and usage with the same period boundaries. The brief is one row per period containing the count of currently active accounts, their total usage, and average usage per active account. Include active accounts with zero usage. Ignore inactive account 3 and its 99 units.

Expected: October = 2 active accounts / 12 units / 6.00 average; November = 2 / 20 / 10.00; December = 2 / 0 / 0.00. The denominator is accounts, not event rows or only accounts with events. Build a reusable monthly_usage view.

Change account 2 to inactive. Expected October = 1/12/12.00, November = 1/0/0.00 and December = 1/0/0.00. Explain that this reports current activity status; historical active-account reporting needs membership history.

## Hints and solution

Conceptual hint: write the grain, eligibility, dates and denominator before the query. Intermediate check: each period summary should contain at most one row per period; use the period table to retain empty periods. For usage, start from each period crossed with each eligible account, then attach events.

Reset before [solution.sql](solution.sql). It creates both reports and the top-tie query. Reading the transfer solution is assisted practice; attempt another denominator or period without it before recording independent success.

Deliver the reusable SQL, the metric contract, the two-period/empty-period output and a two-sentence interpretation with a limitation. Return later and explain why a report can be numerically correct yet answer the wrong business question.
