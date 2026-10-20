# Which row is first, and what came before it?

Two charges arrived on the same date. A running total jumps over both together, while the screen expects one line at a time. The amounts are right; the window definition answers a different question.

By the end, keep detail rows while computing group-relative values, select a deterministic latest row and state a tie and frame policy.

**Scope:** SQL windows, with PostgreSQL DISTINCT ON as a compared alternative. The examples do not establish event ordering across concurrent systems.

## Keep the detail rows

Run [lab 13's setup](../labs/13-window-questions/setup.sql). Account 1 has charges 100,200,200,-50 cents on October 1,2,2,3. Account 2 has one 300-cent charge. Negative 50 is a synthetic refund event.

GROUP BY collapses rows to a group summary. A window computes over related rows while retaining each input row:

```sql
SELECT id,
       SUM(cents) OVER (
         PARTITION BY account_id
         ORDER BY charged_on, id
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_cents
FROM course_window.charges
ORDER BY id;
```

For IDs 1–5, expect 100,300,500,450,300. PARTITION BY separates accounts. Window ORDER BY determines processing order; the final ORDER BY determines displayed order. The frame says which rows contribute: from the partition's start through this row.

## Dates alone create peers

Try SUM(cents) OVER (PARTITION BY account_id ORDER BY charged_on). With this default ordered frame, equal dates are peers and their amounts enter the total together. Account 1's results are 100,500,500,450.

For a row-by-row total, explicitly choose ROWS and a unique tie-breaker. Choosing ROWS without resolving the order of equal dates still leaves their intermediate totals unspecified. A calendar-day total may intentionally include all peers; neither policy is universally right.

## Latest means choosing a complete row

```sql
WITH numbered AS (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY account_id ORDER BY charged_on DESC, id DESC
         ) AS position
  FROM course_window.charges
)
SELECT account_id, id, cents FROM numbered
WHERE position = 1 ORDER BY account_id;
```

Expected: account 1, ID 4, -50; account 2, ID 5, 300. A negative latest charge remains the latest event. MAX(cents) would answer a different question.

A window cannot be used directly in the same query's WHERE condition; filter its result in an outer query or CTE. PostgreSQL DISTINCT ON (account_id), ordered by account_id then the same descending date/ID keys, supplies an alternative for this single-row selection.

## One winner or all tied winners?

ROW_NUMBER assigns a separate position to every row. RANK ordered only by cents gives account 1's equal 200-cent charges rank 1, the 100-cent charge rank 3 and -50 rank 4. DENSE_RANK uses 1,1,2,3 instead.

Adding ID to the ranking order breaks the monetary tie. If the brief asks for everyone tied for highest amount, rank on amount alone, then use ID only for final display order. If it asks for exactly one winner, supply a deterministic tie-breaker.

## Compare with the previous row

LAG(cents) OVER (PARTITION BY account_id ORDER BY charged_on, id) returns the preceding row's amount. Subtract it to produce changes NULL,100,0,-250,NULL. The first row has no predecessor; a zero would assert a different baseline.

The [lab](../labs/13-window-questions/README.md) transfers this to meter readings. A decrease might mean a reset or correction rather than negative consumption; data rules need a stated policy.

**Requires:** [grouping](11-aggregate-grain.md), [CTEs and shape](12-query-shapes.md), [deterministic ordering](08-selecting-rows.md).
**Next:** [What does this monthly number mean?](14-reusable-reports.md).
**Return:** explain the difference between “one latest row,” “all top ties” and “running total through this row.”
**References:** PostgreSQL [window tutorial](https://www.postgresql.org/docs/17/tutorial-window.html), [window expressions](https://www.postgresql.org/docs/17/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS) and [SELECT/DISTINCT ON](https://www.postgresql.org/docs/17/sql-select.html).
