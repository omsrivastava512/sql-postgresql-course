# Lab 17 — Change a live caller's table

Read [the article](../../articles/17-compatible-change.md), then run [setup.sql](setup.sql) through [the lab guide](../README.md). It resets only course_change. Keep the four original booking rows for comparison. The two-connection tasks require persistent A/B sessions as in [lab 16](../16-competing-claims/README.md).

The old SQL caller names id, room and starts_at. The new caller also names reminder_minutes. There is no supplied HTTP application or real deployment in this exercise.

## Inspect before changing

List the columns and original rows. State the policy: existing missing preferences become 30; omitted new input defaults to 30; supplied values from 0 to 1440 are preserved; final NULL is forbidden.

On the fresh fixture, try ALTER TABLE course_change.bookings ADD COLUMN reminder_minutes integer NOT NULL;. Expect 23502 and no column added. Why would the same statement appearing to work on an empty database be weak migration evidence?

## Expand and inspect compatibility

Run [01-expand.sql](01-expand.sql) once. Inspect:

```sql
SELECT id, reminder_minutes FROM course_change.bookings ORDER BY id;
SELECT version FROM course_change.migration_history ORDER BY version;
SELECT conname, convalidated FROM pg_constraint
WHERE conrelid = 'course_change.bookings'::regclass AND conname = 'reminder_range';
```

Expect four NULLs, version 001_expand and convalidated = false. The old rows were not backfilled by setting the future default.

Try a new row with reminder_minutes = -1; expect 23514 even before validation. Explicit NULL remains temporarily allowed because a range CHECK alone does not require presence.

Schema steps are applied once. Re-running expansion must not be used as a general retry strategy after a known commit: the column already exists. Inspect the recorded version and actual schema. IF NOT EXISTS alone would not verify that the existing column has the intended type or constraints.

## Interrupt and resume the backfill

Run [02-backfill.sql](02-backfill.sql) once. The returned IDs are 1 and 2, each set to 30; sort returned IDs when comparing because RETURNING has no ordering contract. Stop the batch process there.

Try [03-require.sql](03-require.sql) too early. Expect 23514 while bookings 3 and 4 remain NULL. In a persistent session issue ROLLBACK after the error. Expect no 003_require record, no NOT NULL flag and no leftover reminder_present constraint from the failed transaction.

Now exercise both callers:

```sql
INSERT INTO course_change.bookings (id, room, starts_at)
VALUES (6, 'Blue', '2026-10-23 09:00:00+00');
INSERT INTO course_change.bookings (id, room, starts_at, reminder_minutes)
VALUES (5, 'Green', '2026-10-23 10:00:00+00', 0);
UPDATE course_change.bookings SET reminder_minutes = 120 WHERE id = 3;
```

Resume the backfill. Only ID 4 should change. Run it once more; zero rows change. Expected reminders ordered by ID: 30,30,120,30,0,30.

Check every original ID, room and start instant against the initial snapshot. Check that no reminder is NULL or outside the allowed range. Counts alone cannot prove that 120 and 0 survived.

## Require the value

Run 03-require.sql again. Expect version records 001_expand and 003_require, a validated range constraint and a NOT NULL column.

An old caller that omits reminder_minutes still gets 30. Explicit NULL now fails with 23502; -1 still fails with 23514. Run those probes in transactions and roll back so the six-row reconciliation stays comparable.

Re-run the backfill: zero changed rows. A rerunnable data batch is different from repeatedly applying an already-committed schema step.

## An application update races with a backfill

Reset and expand. Run one batch so only 3 and 4 remain NULL.

A begins a transaction and sets booking 3's reminder to 120 without committing. B runs 02-backfill.sql; its candidate selection encounters the locked row. Observe B's blocker using a third connection as in lab 16, then commit A.

B must preserve 120, fill only booking 4 with 30 and commit. Check the actual rows. The repeated NULL predicate and row locking are part of this lab's single-backfill-worker contract; worker distribution and SKIP LOCKED job systems remain later topics.

## A schema change waits

Finish or roll back all sessions, then reset. A runs BEGIN; SELECT * FROM course_change.bookings; and stays open.

In B run 01-expand.sql. Its one-second lock timeout should produce 55P03. ROLLBACK B. Verify that reminder_minutes is absent and migration_history is empty. End A with COMMIT, then rerun expansion successfully.

The blocker did not need to change a row. Its transaction still held a table lock. Do not terminate unrelated sessions to make a production migration pass; investigate and coordinate the blocking work.

## Independent transfer

Reset. The supplied jobs 1/email and 2/sms need attempt_limit.

Historical jobs should get 3; new callers omitting the value should get 5. Explicit values 1–10 are valid. Preserve the original IDs and queue names, support an old named-column INSERT, reject invalid values and end with NOT NULL.

Write the expansion, backfill and validation without viewing the solution. Then add a new job with an explicit limit of 2 and prove that resuming your backfill preserves it. Explain why using DEFAULT 5 as the historical repair would answer the wrong requirement.

## Hints, solution and fallback

Conceptual hint: future defaults and historical decisions are separate. Intermediate check: inspect actual NULLs, constraint validation and version records after every boundary.

[solution.sql](solution.sql) runs the supplied booking phases from fresh setup and solves the jobs transfer. It repeats the two-row booking batch twice because the fresh fixture has exactly four rows; that fixed count is not a production backfill runner.

If new application code fails before cutover, keep the compatible old caller available and preserve the additional column. A DROP COLUMN reversal loses preferences and is not a restore.

Deliver the before/after rows, caller results, interrupted/resumed batch evidence, failed and successful validation results, lock-timeout state and a fallback note. Record actual learner effort/help only after someone attempts the exercise. This lab verifies a bounded additive change; removal, rename bridges, backups and full deployment recovery remain separate.

Return later: what evidence permits the final constraint, and what evidence would be needed before removing an old representation?
