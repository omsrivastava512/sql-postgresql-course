# Lab 31 — Trace a deadlock between two bins

Read [the lesson](../../articles/31-lock-order.md). Use three persistent connections A, B and observer C to the same disposable PostgreSQL database. Use [the connection guide](../README.md). Run [setup.sql](setup.sql) in C. It resets course_bins to two bins holding five units each. In A and B set `SET statement_timeout = '120s';` and `SET idle_in_transaction_session_timeout = '5min';`. Record both backend IDs with `SELECT pg_backend_pid();`. End transactions before every reset.

## Break the source-first rule

Run the steps in order. Leave each waiting statement running while you switch sessions. Use this observer query for all quantity checks.

```sql
SELECT bin_id, units FROM course_bins.bins ORDER BY bin_id;
```

| Step | Session | SQL |
|---|---|---|
| 1 | A | `BEGIN; UPDATE course_bins.bins SET units = units - 1 WHERE bin_id = 1;` |
| 2 | B | `BEGIN; UPDATE course_bins.bins SET units = units - 1 WHERE bin_id = 2;` |
| 3 | B | `UPDATE course_bins.bins SET units = units + 1 WHERE bin_id = 1;` |
| 4 | C | `SELECT pg_blocking_pids(12345);` Substitute B's backend ID. Check the still-committed quantities. |
| 5 | A | `UPDATE course_bins.bins SET units = units + 1 WHERE bin_id = 2;` |
| 6 | Both | One update succeeds and the other reports deadlock. In psql run `\errverbose` in the losing session to see its SQLSTATE. Roll back the loser and commit the survivor. |
| 7 | C | Inspect both bins. If A lost expect (6,4), otherwise (4,6). |

Record the losing operation's direction and `40P01`. To retry it, start a new transaction in that session. Lock rows 1 and 2 in ascending order using the two locking reads below, inspect the current source quantity, then repeat **both** of its updates and commit if there is sufficient stock. Verify (5,5).

```sql
SELECT * FROM course_bins.bins WHERE bin_id = 1 FOR UPDATE;
SELECT * FROM course_bins.bins WHERE bin_id = 2 FOR UPDATE;
```

## Repair the order

Reset in C and run [solution.sql](solution.sql). Read the function and predict the first lock for each direction. The example calls leave both bins at five.

1. In A run `BEGIN; SELECT course_bins.move_stock(1, 2, 1);` and leave it open.
2. In B run `BEGIN;` and separately `SELECT course_bins.move_stock(2, 1, 1);`. Observe B waiting from C using the same blocker query.
3. Commit A. B completes its move and can commit. Inspect both rows from C.
4. In autocommit, try the calls below **separately**. Inspect both balances after each rejection. Predict the error before reading the argument list in the function.

```sql
SELECT course_bins.move_stock(1, 2, 0);
SELECT course_bins.move_stock(1, 1, 1);
SELECT course_bins.move_stock(1, 99, 1);
SELECT course_bins.move_stock(1, 2, 6);
```

The first two report invalid input (22023), the third a missing bin (P0002), and the fourth insufficient units (23514). Every pair of balances remains (5,5).

## Independent transfer

A workshop needs room 10 and projector 20. Another workshop requests them in the opposite order. Design one operation that reserves both or leaves both available to their previous owners. Now introduce a spare room with a lower ID than an already-booked projector. Prove that a failed attempt leaves this spare room free even when your operation reached it first.

<details><summary>Hint and worked answer</summary>

Use ascending resource IDs across all callers and a conditional write for an available resource. Abort the whole operation if either write finds no available row. After fresh setup, [transfer.sql](transfer.sql) reserves 10 and 20 for Workshop A. Run `SELECT course_bins.reserve_pair(5, 20, 'Workshop B');` in autocommit. Expect 23514 and an unbooked resource 5. To reproduce competition, clear the fixture bookings with `UPDATE course_bins.resources SET booking = NULL;`. In A reserve (10,20) inside BEGIN. In B reserve (20,10) in another transaction. Observe the wait, commit A, inspect B's rejection and roll back B. Only Workshop A owns the pair.

</details>

Deliver the failed schedule, victim, blocker evidence, survivor's exact balances, retry result and all three resource rows. Record hints used and close the sessions. Return later and explain why a wait on the first resource can be a successful outcome of the repair.
