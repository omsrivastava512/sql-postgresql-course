# Lab 21 — Separate statistics from cleanup

Read [the article](../../articles/21-statistics-maintenance.md), then run [setup.sql](setup.sql) through [the shared guide](../README.md). It resets only course_maintenance.

Setup temporarily disables autovacuum on tasks and mail only, and raises each status column's statistics target so these small distributions are fully sampled. This isolates the demonstration; it is not a production configuration recommendation. Restore the settings below even if you stop early.

## A distribution changes

Count tasks by status: open 40, closed 39960. Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM course_maintenance.tasks WHERE status = 'open';

UPDATE course_maintenance.tasks SET status = 'open'
WHERE id BETWEEN 41 AND 20000;
```

Run the same plan again before ANALYZE. Actual open rows must be 20000. Record the estimate you actually see and its absolute error; the exact old estimate can vary.

Run ANALYZE course_maintenance.tasks; and compare again. The row set stays the same. Explain why improving an estimate does not itself change the required result or guarantee a faster execution.

Inspect pg_stats for the table's status distribution and pg_stat_user_tables for last_analyze. Do not confuse a timestamp or approximate catalog count with a complete benchmark.

## Cleanup with an old snapshot

Use three persistent connections as in [lab 16](../16-competing-claims/README.md). End all transactions before resetting. Reset now.

In A:

```sql
SET idle_in_transaction_session_timeout = '5min';
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM course_maintenance.tasks;
```

Expect 40000. In B, delete IDs greater than 10000 in autocommit mode. B/new observer reads now see 10000; A still sees 40000.

In observer C, run [vacuum.sql](vacuum.sql) as one standalone command. VACUUM cannot run inside BEGIN or a multi-command driver batch treated as a transaction. Save its verbose report, including versions removed and dead versions not yet removable.

Inspect:

```sql
SELECT n_live_tup, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE schemaname = 'course_maintenance' AND relname = 'tasks';
```

These counters can lag and are estimates. Compare them with the verbose report and the known open snapshot.

COMMIT A. Run vacuum.sql again in C. Expect previously needed deleted versions to become removable. New queries still return exactly 10000 live rows. Explain why ordinary VACUUM need not make the file shrink and why ANALYZE alone does not perform this cleanup.

This fixture deletes a contiguous tail, so the second vacuum can also report truncating empty end pages. That observed shrink is compatible with the rule: ordinary vacuum does not compact arbitrary holes throughout a table.

## Independent transfer

Reset. The mailbox has 4000 rows: twenty queued, 3980 sent. Change IDs 21–1000 to queued. Record actual rows and the estimate before and after ANALYZE. Final counts are queued 1000 and sent 3000.

Do not view [solution.sql](solution.sql) until attempting the diagnosis. It supplies both distribution changes and ANALYZE commands, then restores autovacuum. It deliberately omits VACUUM so the ordinary multi-command reference runner can execute it; the snapshot experiment is verified separately on a live server.

## Cleanup and evidence

End A/B transactions, then run:

```sql
ALTER TABLE course_maintenance.tasks RESET (autovacuum_enabled);
ALTER TABLE course_maintenance.mail RESET (autovacuum_enabled);
RESET idle_in_transaction_session_timeout;
```

Reset the timeout in the connection where you changed it. Close the sessions.

Hint: estimates, visible rows and removable versions answer different questions. Deliver before/after estimates, exact live counts, both vacuum reports, snapshot observations and confirmed restored settings. Do not fabricate learner time or a performance improvement.

The native author checker is node tests/verify-performance.mjs --lab=21. It preserves the vacuum messages and statistics observations in its JSON output.

Return later: what would you inspect before concluding that a growing table simply needs another index?
