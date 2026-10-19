# Which rows did I ask for?

The shop wants paid or pending orders worth at least 20. Your query runs successfully, but it includes a paid order worth 5. There is no syntax error. The question encoded in SQL is different from the question you intended.

By the end, you should be able to predict the selected IDs, explain missing rows, order ties deliberately, and use a predicate to limit a write.

**Scope:** general SQL filtering and ordering ideas; PostgreSQL RETURNING, ILIKE and the supplied execution examples. Grouping and HAVING follow in the later reporting lessons.

## See the rows first

Run [lab 08's setup](../labs/08-selecting-rows/setup.sql). Each row is one order, not one item or one payment. Amounts here are whole currency units; exact fractional amounts and rounding belong to later money lessons.

| id | customer | status | ordered_on | total |
|---|---|---|---|---|
| 101 | Riya | paid | 2026-10-01 | 30 |
| 102 | Sam | pending | 2026-10-01 | 20 |
| 103 | Riya | cancelled | 2026-10-02 | 20 |
| 104 | Dev | paid | 2026-10-02 | 30 |
| 105 | Sam | NULL | 2026-10-03 | 50 |
| 106 | Riya | pending | 2026-10-02 | 10 |
| 107 | Rena | paid | 2026-10-02 | 5 |

## Parentheses preserve the question

```sql
SELECT id
FROM course_filter.orders
WHERE status = 'paid' OR status = 'pending' AND total >= 20
ORDER BY id;
```

AND binds more tightly than OR. This selects all paid orders, plus pending orders meeting the amount condition: 101, 102, 104 and 107. Require the amount for both statuses:

```sql
SELECT id
FROM course_filter.orders
WHERE (status = 'paid' OR status = 'pending') AND total >= 20
ORDER BY id;
```

Now the result is 101, 102 and 104. You can express the status choice as status IN ('paid', 'pending') too. The important evidence is which rows qualify and why, not which equivalent spelling you choose.

## A missing status is a policy decision

status <> 'cancelled' does not include row 105. Its comparison is unknown. If the report includes unknown statuses, say so with status <> 'cancelled' OR status IS NULL. If the report requires a known paid/pending status, the earlier IN condition is more faithful.

Putting NULL into an IN list does not make it match missing values. Likewise, NOT IN ('cancelled', NULL) does not mean "everything except cancelled and missing": the comparison against NULL prevents the expected true result. Test missingness explicitly.

The earlier [stored-values lesson](07-stored-values.md) explains this same distinction. In a business report, it changes which population your number describes.

## Sort ties before taking a page

ORDER BY ordered_on DESC puts recent dates first, but several orders share October 2. Add a unique tie-breaker:

```sql
SELECT id, ordered_on
FROM course_filter.orders
ORDER BY ordered_on DESC, id DESC
LIMIT 2;
```

The first page is 105, 107. With the same ordering and OFFSET 2, the next page is 106, 104. Without an ordering rule, LIMIT is not a promise of the first rows you happened to insert. With only a date ordering, the tied rows have no specified relative order.

An offset counts positions. If a new row arrives at the front between requests, the positions move. The lab reproduces that with a single explicit insert. It also introduces a cursor that asks for rows after the last date/ID pair. That preserves the boundary in this example; it does not freeze a changing dataset or solve every paging policy.

## Read and write with the same selection rule

Suppose order 102 is now confirmed paid. Preview the exact intended row:

```sql
SELECT id, status FROM course_filter.orders
WHERE id = 102 AND status = 'pending';
```

Then update under that same condition and inspect what changed:

```sql
UPDATE course_filter.orders
SET status = 'paid'
WHERE id = 102 AND status = 'pending'
RETURNING id, status;
```

RETURNING reports the affected row. Running this update again returns no rows because it no longer matches. Omitting WHERE would attempt to update every order. A preview is useful for understanding; it does not prevent another connection from changing data between statements. Conditional updates and concurrency need their later treatment.

## Select the output as well as the rows

Use an explicit column list when the output has a contract. A CASE expression can label a value without changing the stored row:

```sql
SELECT id,
       CASE WHEN status IS NULL THEN 'review'
            WHEN status = 'cancelled' THEN 'closed'
            ELSE 'open' END AS queue
FROM course_filter.orders
ORDER BY id;
```

Row 105 is review and 103 is closed. The others are open under this deliberately simple reporting rule. It is not a payment-state transition.

For text, customer LIKE 'R%' asks for a prefix: % matches zero or more characters, and _ matches one. PostgreSQL ILIKE offers case-insensitive matching. The [lab](../labs/08-selecting-rows/README.md) tests the distinction using a concrete search rather than treating every pattern as a literal name.

## Practise and return

Repair a wrong predicate, page tied rows, and inspect a selected update/delete. Then solve an independent subscription selection with an explicit missing-date policy. [Hints and the solution](../labs/08-selecting-rows/README.md#hints-and-solution) remain available.

After a gap, explain why a successful query can still be wrong. Name one excluded row, one accidental inclusion and one ordering ambiguity from this example.

**Requires:** [Reading the examples](00-reading-the-examples.md) and [stored values](07-stored-values.md).
**Next:** read [the foreign-key guarantee](01-foreign-keys.md), then [What identifies this row?](09-row-identity.md), which connects keys with membership relationships.
**Revisited in:** [planned joins and reporting](../COURSE_MAP.md#the-wider-course), where filtering cannot repair an accidentally multiplied total.

**References:** PostgreSQL [table expressions](https://www.postgresql.org/docs/17/queries-table-expressions.html), [sorting](https://www.postgresql.org/docs/17/queries-order.html), [LIMIT/OFFSET](https://www.postgresql.org/docs/17/queries-limit.html), [pattern matching](https://www.postgresql.org/docs/17/functions-matching.html) and [RETURNING](https://www.postgresql.org/docs/17/dml-returning.html).
