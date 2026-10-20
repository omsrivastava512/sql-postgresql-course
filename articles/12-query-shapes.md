# What shape does this query return?

A customer lookup returns two addresses. The surrounding query expected one value, so PostgreSQL rejects it. Adding LIMIT 1 makes the error disappear, but which address should it choose?

By the end, choose a subquery shape that matches the question, use existence tests without multiplying parent rows, and combine or name result sets deliberately.

**Scope:** general SQL subqueries, sets and nonrecursive CTEs, executed in PostgreSQL. No performance gain is implied by rewriting syntax.

## One value has a cardinality contract

Run [lab 12's setup](../labs/12-query-shapes/setup.sql). Account 1 has addresses alpha and beta; account 2 has bo; account 3 has none.

```sql
SELECT (SELECT address FROM course_shape.contacts WHERE account_id = 2) AS address;
```

The result is bo. With account 3 the result is NULL. With account 1 the scalar subquery fails with 21000 because it produces more than one row. Selecting two columns instead fails with 42601: the surrounding expression expects one column too.

If the business asks for the most recently recorded address, this fixture defines recency by the highest contact ID:

```sql
SELECT a.id,
       (SELECT c.address FROM course_shape.contacts c
        WHERE c.account_id = a.id
        ORDER BY c.id DESC LIMIT 1) AS newest_address
FROM course_shape.accounts a
ORDER BY a.id;
```

Expected: 1/beta, 2/bo, 3/NULL. This is a stated fixture policy, not a claim that generated IDs always reveal real-world time. An unordered LIMIT 1 hides ambiguity.

## Ask whether a match exists

To list accounts with paid orders once each:

```sql
SELECT a.id
FROM course_shape.accounts a
WHERE EXISTS (
  SELECT 1 FROM course_shape.orders o
  WHERE o.account_id = a.id AND o.status = 'paid'
)
ORDER BY a.id;
```

The result is 1,2. The inner query refers to the outer account: it is correlated. EXISTS asks whether any qualifying row exists; adding another qualifying order does not add another account row. SELECT 1 is conventional because the selected value is not the existence question.

NOT EXISTS reverses that test. Accounts with no orders are just account 3. By contrast, id NOT IN (SELECT account_id FROM orders) returns none here because the source includes a guest order with NULL account_id. The [NULL lesson](07-stored-values.md) explains the unknown comparison; writing NOT EXISTS makes the correlated absence test explicit.

## Combine rows, preserving duplicates when needed

The online source contains customer IDs 1,1,2; the store source contains 1,3.

| Expression | Sorted customer IDs |
|---|---|
| online UNION store | 1,2,3 |
| online UNION ALL store | 1,1,1,2,3 |
| online INTERSECT store | 1 |
| online EXCEPT store | 2 |
| SELECT DISTINCT from online | 1,2 |

UNION ALL preserves source multiplicity. UNION removes equal output rows; it does not decide whether two purchases were actually the same event. INTERSECT finds common output rows, and EXCEPT keeps rows from the left result absent on the right. Both use distinct results by default here.

Branches need the same number of output columns and compatible types. Apply a final ORDER BY when order is part of the requirement. Set operations combine outputs vertically; joins combine matching pairs horizontally.

## Name a step without changing its meaning

WITH gives a query step a name, called a common table expression or CTE:

```sql
WITH totals AS (
  SELECT account_id, SUM(cents) AS cents
  FROM course_shape.orders GROUP BY account_id
)
SELECT a.id, COALESCE(t.cents, 0) AS cents
FROM course_shape.accounts a
LEFT JOIN totals t ON t.account_id = a.id
ORDER BY a.id;
```

Expected: 1/300, 2/50, 3/0. The guest order is outside the account population. This is the same pattern as the previous lesson's derived table, with a name that makes its intermediate grain easier to inspect. It is not a persistent table or a guarantee that PostgreSQL materializes the result. Recursive CTEs and optimizer decisions remain later topics.

## Practise and return

The [lab](../labs/12-query-shapes/README.md) changes cardinality, repeats matches and transfers the absence question to workspace events. After a gap, decide which shape answers “newest address,” “any paid order” and “one total per account” before choosing SQL syntax.

**Requires:** [joins](10-joins.md), [grouping](11-aggregate-grain.md) and [NULL comparisons](07-stored-values.md).
**Next:** [Which row is first, and what came before it?](13-window-questions.md).
**References:** PostgreSQL [scalar subqueries](https://www.postgresql.org/docs/17/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES), [subquery predicates](https://www.postgresql.org/docs/17/functions-subquery.html), [sets](https://www.postgresql.org/docs/17/queries-union.html) and [WITH](https://www.postgresql.org/docs/17/queries-with.html).
