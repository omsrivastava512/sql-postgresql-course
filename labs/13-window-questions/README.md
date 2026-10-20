# Lab 13 — Make order and ties explicit

Read [the article](../../articles/13-window-questions.md), then run [setup.sql](setup.sql) through [the lab guide](../README.md). It resets only course_window. Run expected errors as separate statements.

## Frame the total

Inspect charges by account_id, charged_on, id. Compute a row-by-row running total using the article's explicit ROWS frame: IDs 1–5 give 100,300,500,450,300.

Remove the ID tie-breaker and explicit frame, ordering the window only by charged_on. Expect 100,500,500,450,300. Explain the two October-2 peers. Restore both the tie-breaker and frame; changing only the final display order does not repair the calculation.

## Pick a whole latest row

Use ROW_NUMBER inside a CTE to get 1/4/-50 and 2/5/300 for account/charge/amount. Then reproduce it with PostgreSQL DISTINCT ON and the same tie rule.

Try a window call directly in WHERE: expect 42P20. Repair by calculating it in one query level and filtering in the next.

Insert charge 6 for account 1 on October 3 with amount 75. Under the given policy, 6 is now latest and account 1's final running total is 525. Reset afterward.

## Preserve meaningful ties

For account 1, compare rank and dense rank ordered by cents descending:

| ID | Rank | Dense rank |
|---|---|---|
| 1 | 3 | 2 |
| 2 | 1 | 1 |
| 3 | 1 | 1 |
| 4 | 4 | 3 |

Return all top ties: IDs 2,3 for account 1 and 5 for account 2. Explain why putting ID in the ranking order would change the result. Use ID only to order tied output rows for display.

Compute each charge minus its preceding charge: NULL,100,0,-250,NULL. Do not replace the first NULL with zero without changing the contract.

## Independent transfer

The readings table contains cumulative meter values. Return a row for every reading with the difference from the previous reading of the same meter, ordered by date then ID. Expected differences for IDs 1–5: NULL,3,0,4,NULL. Equal readings at different IDs are separate observations, not rows to discard.

Return each meter's latest complete reading: A/17 and B/5. Then add a newer reading for A with value 2. Latest must become 2; the change is -15. State what extra business information is needed before reporting that as consumption.

## Hints and solution

Conceptual hint: separate grouping, processing order, frame and display order. Intermediate check: every output detail row should remain present until a deliberate latest/top filter is applied.

Reset before [solution.sql](solution.sql). It includes both latest-row approaches, ranking, running totals and the original meter transfer. For the reset variation, keep the observed decrease visible and flag its meaning rather than silently taking an absolute value.

Return later: if the brief changes from one latest row to all events on the latest date, ROW_NUMBER = 1 is too narrow. Use a date-based tie policy and explain the changed output grain.
