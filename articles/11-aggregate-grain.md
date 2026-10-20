# Why did the total multiply?

Order 101 has two separate lines worth 1,000 cents each and three payment events. Joining lines to payments creates six rows. Summing line amounts there reports 6,000 cents for a 2,000-cent order.

By the end, state what one output row represents, distinguish row filters from group filters, and repair totals without deleting legitimate facts.

**Scope:** general SQL grouping and aggregation; PostgreSQL aggregate FILTER. All amounts in this fixture are integer minor units of one fictional currency.

## Count the source facts

Run [lab 11's setup](../labs/11-aggregate-grain/setup.sql). Its relevant rows are:

| Source | Rows for order 101 | Independent total |
|---|---|---|
| Lines | line 1: 1 × 1000; line 2: 1 × 1000 | 2000 cents |
| Payments | capture 1000; capture 1000; refund 500 | 1500 cents net |

The equal line amounts describe two legitimate lines. A refund reduces net payments; it does not erase a line.

GROUP BY makes one output row for each group of input values:

```sql
SELECT order_id, COUNT(*) AS line_count,
       SUM(quantity * unit_cents) AS line_cents
FROM course_totals.lines
GROUP BY order_id
ORDER BY order_id;
```

For 101 the result is 2 lines and 2000 cents. “One row per order” is the output's grain.

## Watch the multiplication

```sql
SELECT COUNT(*) AS joined_rows,
       SUM(l.quantity * l.unit_cents) AS wrong_line_cents,
       SUM(CASE WHEN p.kind = 'refund' THEN -p.cents ELSE p.cents END) AS wrong_net_cents
FROM course_totals.lines l
JOIN course_totals.payments p ON p.order_id = l.order_id
WHERE l.order_id = 101;
```

The result is 6, 6000 and 3000. Each line repeats three times; each payment repeats twice.

SUM(DISTINCT l.quantity * l.unit_cents) returns 1000, which is also wrong. It deduplicates amounts, not source facts. SELECT DISTINCT over a few visible columns can hide the same problem.

## Reduce each collection before combining it

Aggregate lines to one row per order, and payments to one row per order. Then join those two summaries to orders:

```sql
SELECT o.id, COALESCE(l.line_cents, 0) AS line_cents,
       COALESCE(p.net_cents, 0) AS net_cents
FROM course_totals.orders o
LEFT JOIN (
  SELECT order_id, SUM(quantity * unit_cents) AS line_cents
  FROM course_totals.lines GROUP BY order_id
) l ON l.order_id = o.id
LEFT JOIN (
  SELECT order_id,
         SUM(CASE WHEN kind = 'refund' THEN -cents ELSE cents END) AS net_cents
  FROM course_totals.payments GROUP BY order_id
) p ON p.order_id = o.id
ORDER BY o.id;
```

Each parent now matches at most one row from each summary. Order 101 returns 2000/1500; unpaid order 102 returns 500/0. An order with no lines remains visible. Zero is the chosen missing-total display here, not proof that an incomplete order is valid.

A query inside FROM is a derived table. The next lesson examines other subquery shapes and names these steps with WITH.

## Filter rows, groups or one measure

WHERE removes input rows before grouping. HAVING removes groups after their aggregates have been calculated. To find orders whose lines total at least 2000, use HAVING SUM(quantity * unit_cents) >= 2000, not WHERE around that aggregate.

FILTER restricts one aggregate without removing rows needed by another:

```sql
SELECT order_id,
       SUM(cents) FILTER (WHERE kind = 'capture') AS captured,
       SUM(cents) FILTER (WHERE kind = 'refund') AS refunded
FROM course_totals.payments
GROUP BY order_id
ORDER BY order_id;
```

Order 101 is 2000 captured and 500 refunded. An order with captures but no refund has a NULL refund sum. COALESCE can supply zero when that matches the report contract.

## Count what you mean

After a LEFT JOIN, COUNT(*) counts the padded row for an unmatched parent. COUNT(child.id) counts matched child IDs and returns zero for that parent. COUNT(expression) ignores NULL values. SUM over no input values is NULL; COUNT is zero.

Do not label any mechanically valid sum “revenue” without defining eligibility, discounts, refunds and time boundaries. [The reporting lesson](14-reusable-reports.md) supplies that business contract.

## Practise and return

The [lab](../labs/11-aggregate-grain/README.md) includes equal-valued lines, an unpaid order, a refund and missing child rows. Its independent transfer combines subscription usage with receipts.

After a gap, explain why adding one payment must not change an order's line total. Predict which intermediate row count would reveal the faulty query.

**Requires:** [joins](10-joins.md) and [CASE/row selection](08-selecting-rows.md).
**Next:** [What shape does this query return?](12-query-shapes.md).
**References:** PostgreSQL [aggregates](https://www.postgresql.org/docs/17/functions-aggregate.html), [grouping](https://www.postgresql.org/docs/17/queries-table-expressions.html) and [aggregate expressions/FILTER](https://www.postgresql.org/docs/17/sql-expressions.html#SYNTAX-AGGREGATES).
