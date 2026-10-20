# Lab 16 — Compete for the last item

Read [the article](../../articles/16-competing-claims.md). This lab needs a real PostgreSQL server and three persistent connections to the same disposable database: A, B and observer C. Use [the connection guide](../README.md). Separate SQL-editor requests or sequential embedded queries do not establish a race.

Run [setup.sql](setup.sql) in C. It resets only course_race. Before every reset, COMMIT or ROLLBACK both A and B so an old transaction cannot block the reset.

In A run SET application_name = 'course-lab-a'; in B use 'course-lab-b'. In both run SET statement_timeout = '120s'; and SET idle_in_transaction_session_timeout = '5min';. These are session-local safeguards for this manual exercise. End each transaction promptly.

Inspect all four supplied tables. Item 1 starts with one unit; item 2 has five. The independent session has three seats. Each claim uses a distinct reservation ID; this lab does not implement request idempotency.

## Reproduce the stale decision

Execute each numbered row in order, leaving both sessions open:

| Step | Session | SQL |
|---|---|---|
| 1 | A | BEGIN ISOLATION LEVEL READ COMMITTED; SELECT available FROM course_race.stock WHERE item_id = 1; |
| 2 | B | BEGIN ISOLATION LEVEL READ COMMITTED; SELECT available FROM course_race.stock WHERE item_id = 1; |
| 3 | A | UPDATE course_race.stock SET available = 0 WHERE item_id = 1; INSERT INTO course_race.reservations VALUES (101, 1, 1); COMMIT; |
| 4 | B | UPDATE course_race.stock SET available = 0 WHERE item_id = 1; INSERT INTO course_race.reservations VALUES (102, 1, 1); COMMIT; |

Both reads returned 1; each caller calculated its own replacement value 0. Inspect availability and the sum of reserved quantity. Expect 0 available and 2 reserved from an initial stock of 1. Both transactions succeeded and the nonnegative CHECK held. Explain the broken business rule.

## Repair and observe the wait

Reset. A runs BEGIN ISOLATION LEVEL READ COMMITTED; then the claim below without committing:

```sql
WITH claimed AS (
  UPDATE course_race.stock SET available = available - 1
  WHERE item_id = 1 AND available >= 1 RETURNING item_id
)
INSERT INTO course_race.reservations (id, item_id, quantity)
SELECT 101, item_id, 1 FROM claimed RETURNING id;
```

A receives 101. B starts its own Read Committed transaction and runs the same claim with reservation ID 102. B should wait. In C:

```sql
SELECT application_name, pid, state, wait_event_type, pg_blocking_pids(pid) AS blockers
FROM pg_stat_activity
WHERE application_name IN ('course-lab-a', 'course-lab-b')
ORDER BY application_name;
SELECT * FROM course_race.stock WHERE item_id = 1;
```

Identify B's blocker as A's pid. C still reads the committed availability 1. Now COMMIT A. B returns no reservation; COMMIT B. Expect only reservation 101 and availability 0.

Reset and repeat, ending A with ROLLBACK instead. B now returns 102; commit B. Expect only reservation 102 and availability 0.

A wait is established by the server's blocker information, not by assuming a slow response proves locking.

## Lock before deciding

Reset. A starts a Read Committed transaction and reads item 1 with SELECT ... FOR UPDATE. B starts a transaction and issues the same locking read; it waits.

A now runs the repaired claim with ID 101 and commits. B's locking read returns available = 0. B must decide that no claim is possible and commit without inserting a reservation.

Explain when a locking read is useful and why checking stock with an ordinary SELECT before BEGIN does not protect a later write. The conditional update remains the shorter solution for this one-row decision.

## A failed statement must leave no partial claim

Reset. In one connection, change the repaired claim's inserted quantity to -1 while leaving its decrement at 1. Expect CHECK failure 23514. In autocommit mode, inspect availability = 1 and zero reservations.

This deliberately inconsistent input is a rollback probe. In a real operation the requested quantity must be positive and must be used consistently in the condition, decrement and reservation.

## Retry a transaction, not its stale answer

Reset. Both A and B start BEGIN ISOLATION LEVEL REPEATABLE READ; and read item 1 before either changes it. A runs the repaired claim and commits.

B runs the claim with ID 102. Expect 40001. ROLLBACK B, then begin a fresh Repeatable Read transaction, read again and rerun the decision. Availability is 0; the guarded claim returns no row. Commit. There is still exactly one reservation.

Record the old read, error, rollback, new read and final result. Sending a confirmation inside a retryable transaction would require separate external-effect handling; that guarantee is not part of this lab.

## Bound a wait and recover

Reset. A starts a transaction and claims 101 without committing. B runs:

```sql
BEGIN;
SET LOCAL lock_timeout = '200ms';
UPDATE course_race.stock SET available = available - 1 WHERE item_id = 1 AND available >= 1;
```

Expect 55P03. A SELECT in B now fails with 25P02. ROLLBACK B. ROLLBACK A. Check that availability is 1 and no reservation remains. B can now retry a fresh complete claim successfully.

Do not classify every error as retryable. A sold-out result is a business outcome, and a duplicate ID or invalid quantity needs an input/policy decision.

## Independent transfer

Reset. Use sessions and registrations. Two callers each request two seats from the three-seat session. Build the equivalent conditional claim without opening the solution.

Hold A's first claim open, issue B's competing claim, observe B waiting, then commit A. B must return no registration. Final state: one registration for two seats and remaining_seats = 1.

Change B's request to one seat in a new transaction. It should succeed, leaving zero seats. The value must change in all three places: availability condition, decrement and recorded seats.

## Hints, solution and record

Conceptual hint: a prior read is an observation, not a reservation. Intermediate check: zero returned stock rows must produce zero reservation rows.

[solution.sql](solution.sql) contains the two successful claim statements and final inspection queries. Run it after a fresh setup for the single-caller reference result. It does not by itself execute the competing-session schedules above.

Deliver the failing and repaired schedules, blocker evidence, final facts, retry trace and changed-seat result. Record actual setup/task time, help used and any wrong prediction; leave learner-trial evidence blank until a person attempts it.

Restore your session settings with RESET statement_timeout; RESET idle_in_transaction_session_timeout; RESET application_name;. Close all three sessions.

Return later: which part of the claim must be repeated after 40001, and which observable result distinguishes sold out from failure?
