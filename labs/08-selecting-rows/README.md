# Lab 08 — Check the selected IDs

Read [the article](../../articles/08-selecting-rows.md). Run [setup.sql](setup.sql) in the environment from [the lab guide](../README.md). It resets only course_filter. This lab supplies complete data; no previous lab state is required.

## Inspect the starting point

Run SELECT * FROM course_filter.orders ORDER BY id;. There are seven rows. Inspect columns with information_schema.columns as in [lab 07](../07-stored-values/README.md#inspect-and-predict), changing the schema to course_filter and table to orders.

State the expected IDs before each query. Compare ordered results exactly where an order is requested; elsewhere compare the rows without inventing a hidden order requirement. Equivalent correct SQL is accepted.

## Repair a plausible query

The request is: paid or pending orders with total at least 20.

```sql
SELECT id FROM course_filter.orders
WHERE status = 'paid' OR status = 'pending' AND total >= 20
ORDER BY id;
```

It returns 101, 102, 104, 107. Explain why 107 got in, then repair the predicate. Expected: 101, 102, 104. Do not remove 107 from the source table to hide the bug.

Next select orders that are not cancelled, including unknown statuses. Expected: 101, 102, 104, 105, 106, 107. Compare with status NOT IN ('cancelled', NULL), which returns no rows here. Explain what happens to each candidate's Boolean result.

## Shape the output

1. Return only id and customer for names starting with lowercase r using LIKE. On this fixture the result is empty. Use ILIKE to make the search case-insensitive: expect 101, 103, 106, 107.
2. Return id and a queue label: review for a NULL status, closed for cancelled, open otherwise. Expect 105 to be review and 103 closed; all others open. Inspect status afterward to prove the labels did not update it.

These requirements concern result meaning. An alias or an equivalent expression is not a reason to reject an otherwise correct solution.

## Two pages and one new row

Use ordered_on descending and id descending. Predict and run page one with LIMIT 2 and page two with LIMIT 2 OFFSET 2. Expect 105/107, then 106/104. Explain why the ID tie-breaker is necessary.

Now run:

```sql
INSERT INTO course_filter.orders
VALUES (108, 'Uma', 'pending', '2026-10-03', 25);
```

Repeat the offset page. It now contains 107/106; 107 appeared on the original first page too. This is a controlled between-request change, not a concurrent-session test.

A cursor records the last pair from page one: October 2, ID 107. Complete a query selecting pairs after that boundary in descending order. Hint: either the date is earlier, or it is equal and the ID is lower. Expected: 106/104 even after the insertion. If an existing order's date changes, what further paging policy would you need? No claim of a frozen snapshot is made here.

## Select a write deliberately

Preview order 102 only if it is pending. Update it to paid with the same condition and RETURNING id, status. Expect one returned row: 102/paid. Run the update again; expect no returned rows. Inspect the remaining orders: 106 and 108 are still pending, and 105 is still NULL.

Next delete only cancelled order 103. Preview the condition, then use DELETE ... WHERE ... RETURNING id. Expect only 103, and confirm it is absent afterward. This is disposable exercise data; a production retention/deletion policy needs a separate decision.

## Independent transfer

Use the supplied subscriptions table. The request is: two active pro subscriptions with known renewal dates on or before October 31, 2026, earliest renewal first, ties ordered by ID. Return id, customer and renew_on.

Before querying, classify each row as included or excluded and explain why. Expected: 5/Eli and 6/Fay, both October 31. Bo's missing date is excluded by the stated policy, not silently treated as overdue. Asha is later, Cy has another plan and Dee is inactive.

Change the request: include missing renewal dates for review, after known dates. Write the new query without LIMIT first. Expected IDs: 5, 6, 2. Use explicit NULL ordering; do not depend on a client display convention.

## Hints and solution

First hint: write the eligibility condition separately from ordering and limiting. Second hint: parentheses group alternatives; IS NULL handles missing dates; ORDER BY renew_on ASC NULLS LAST, id makes the changed transfer order explicit.

Reset before [solution.sql](solution.sql). It runs the successful main tasks in order, including the between-page insertion and selected writes. For the changed transfer, the predicate is active AND plan = 'pro' AND (renew_on <= DATE '2026-10-31' OR renew_on IS NULL), ordered as above. Hints and equivalent correct answers are welcome; note whether help was used for your independent attempt.

Return later with a new cutoff of October 30: the original known-date request returns no rows. Explain why an empty result can be correct. Grouping, HAVING and aggregate FILTER are intentionally postponed until each output group's meaning has been taught.
