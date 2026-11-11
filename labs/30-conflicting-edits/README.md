# Lab 30 — Save a price after someone else has edited it

Read [the lesson](../../articles/30-conflicting-edits.md). Open three persistent connections A, B and C to the same disposable PostgreSQL database using [the lab guide](../README.md). Run [setup.sql](setup.sql) in C. It resets only course_edit. End open transactions before resetting. Run each numbered step separately. In A and B set `SET statement_timeout = '120s';` and `SET idle_in_transaction_session_timeout = '5min';` to bound waits.

## Reproduce the overwrite

In A and B separately run `SELECT * FROM course_edit.offers ORDER BY offer_id;`. Keep both original North results. In A run `UPDATE course_edit.offers SET price_paise = 2200 WHERE offer_id = 1;`. In B run `UPDATE course_edit.offers SET price_paise = 1900 WHERE offer_id = 1;`. With autocommit on, both statements succeeded. In C inspect the rows. North now says 1900. What evidence did B send that it had seen only 2000?

## Observe the guarded save

Reset in C and have both editors read again. Keep their original version 1. Use B's backend ID from `SELECT pg_backend_pid();` in the observer step.

| Step | Session | Action |
|---|---|---|
| 1 | A | `BEGIN ISOLATION LEVEL READ COMMITTED;` |
| 2 | A | `UPDATE course_edit.offers SET price_paise = 2200, version = version + 1 WHERE offer_id = 1 AND version = 1 RETURNING *;` |
| 3 | B | `BEGIN ISOLATION LEVEL READ COMMITTED;` |
| 4 | B | `UPDATE course_edit.offers SET price_paise = 1900, version = version + 1 WHERE offer_id = 1 AND version = 1 RETURNING *;` Leave this running. |
| 5 | C | Run `SELECT pg_blocking_pids(12345);` replacing 12345 with B's actual ID. Record the blocker. |
| 6 | A | `COMMIT;` |
| 7 | B | Inspect the returned rows, then `COMMIT;` |

In C inspect both offers. Expect (North, 2200, 2) and (South, 2300, 1). The buyer now explicitly approves ₹19 after seeing ₹22. In B repeat the guarded update with expected version 2. Expect 1900 and version 3. Try the same write against offer 99. Which read distinguishes a stale edit from a missing offer? Reset, run [solution.sql](solution.sql), and compare its two returned results. The worked solution uses ₹25 for the stale proposal. Does its size affect the outcome?

## Independent transfer

East and West use workshop code 7 at ₹800 and ₹700 respectively. Two editors open East's listing. One approves ₹850 and one submits ₹820 from the previous screen. Write a guarded save and show both centres after each attempt. Change the requirement so the second editor explicitly confirms ₹820 after reloading. Deliver the original predicate, returned rows, and the three prices and versions you observed for East across the two successful edits.

<details><summary>Hint and worked answer</summary>

Use centre and code to locate the listing and its version to authorize this particular edit. From a fresh setup run [transfer.sql](transfer.sql). East finishes the stale attempt at 85000/version 2 and West at 70000/version 1. After explicit confirmation run `SELECT * FROM course_edit.save_fee('East', '7', 2, 82000);`. East moves to version 3. A predicate using only code and version could also change West.

</details>

Record your first prediction and first point of assistance. Close the three sessions when finished. Return later and explain what happens if a price goes up and then down to its original value while a form stays open.
