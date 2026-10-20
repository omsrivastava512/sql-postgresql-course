# Lab 12 — Match the result shape to the question

Read [the article](../../articles/12-query-shapes.md), then run [setup.sql](setup.sql) through [the lab guide](../README.md). It resets only course_shape. Run intended errors separately outside a transaction.

## Scalar or multiple rows?

Inspect contacts by account_id, id. Predict a scalar address lookup for accounts 3,2,1: NULL, bo, then error 21000. Select both id and address inside the scalar lookup for account 2: expect 42601.

Repair the multiple-address query according to the stated policy “highest contact ID is newest.” Expect beta for account 1. Add a fourth contact for account 1 with address gamma; expect gamma. Do not silently invent this selection rule in a real application. Reset afterward.

## Existence without extra parent rows

Write accounts with any paid order: IDs 1,2. Write accounts with no orders: ID 3. Compare the latter with NOT IN over all order account IDs: it returns no rows because of the guest order's NULL.

Insert another paid order for account 1. The existence query must still return 1,2 once each. A join can return repeated account rows; explain when that is the wanted shape and when it is not. Reset afterward.

## Overlapping sets

Use online and store. Predict all five expressions in the article's table before running them. Preserve all five source occurrences with UNION ALL; retain only three distinct customers with UNION. An extra online occurrence of customer 2 must increase UNION ALL's result but not UNION's.

Try UNION with one column on the left and two on the right. Expect 42601. Repair column shape instead of adding arbitrary columns just to silence the error.

## Inspect a named step

Build totals first: account 1/300, account 2/50 and NULL/25. Then join it to accounts to obtain 1/300,2/50,3/0. Explain why the 25 guest cents are absent from an account-only report.

Rewrite the named CTE as a derived table and compare complete results. Neither spelling is inherently a performance improvement. Change the requirement to accounts with totals at least 100: only 1 remains.

## Independent transfer

Each workspace should be listed once if it has no successful event. Events may be failed or may have no workspace. Expected workspace IDs: 2,3. Workspace 2 has a failed event; workspace 3 has no events.

Change the question to workspaces with no events of any kind: only 3. Add a successful event for workspace 2; the original absence query must now return only 3. Repeating successful events for workspace 1 must not duplicate workspace IDs.

## Hints and solution

Conceptual hint: “one selected value,” “any matching row” and “a set of rows” are different contracts. Intermediate check: correlate on the outer key inside NOT EXISTS and put the success condition inside that test.

Reset before [solution.sql](solution.sql). It includes the original-domain queries and the original transfer. The changed transfer removes the status predicate from the absence test. Accept equivalent SQL when multiplicity, NULL handling and order match.

Return later: does replacing a scalar lookup with MAX(address) implement “newest”? Answer: no; it chooses a value under text ordering, which is a different requirement.
