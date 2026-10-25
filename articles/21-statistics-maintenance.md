# Why did yesterday's plan stop fitting today's data?

Yesterday only forty tasks were open. Today twenty thousand are. The query text has not changed, but the distribution it searches has.

By the end, distinguish planner statistics from row cleanup, observe estimates before and after ANALYZE, and show why an old transaction can delay cleanup.

**Scope:** PostgreSQL statistics and ordinary VACUUM in a disposable fixture. This is not a database administration or autovacuum tuning course.

## Compare an estimate with the current facts

[Lab 21](../labs/21-statistics-maintenance/README.md) begins with 40,000 tasks: forty open and 39,960 closed. It temporarily disables autovacuum on its two named fixture tables so background work does not race the demonstration. Restore their normal settings at the end.

Run EXPLAIN ANALYZE for open tasks. Change IDs 41–20000 to open without running ANALYZE. The actual result now contains 20,000 rows. Record the plan's estimated rows; do not replace them with a hand-written example.

```sql
ANALYZE course_maintenance.tasks;
```

Run the same query again. Compare estimate error, not only elapsed time. ANALYZE collects statistics used by the planner. It does not change which rows satisfy WHERE. Estimates can remain imperfect, especially with correlations or distributions not represented well by the collected statistics. [Planner statistics](https://www.postgresql.org/docs/17/planner-stats.html)

## Cleanup answers another question

UPDATE and DELETE can leave older row versions behind. Ordinary VACUUM can make space reusable when those versions are no longer needed; it also performs other maintenance such as visibility-map work. It normally does not shrink the table file just because rows were deleted. Entirely empty pages at the file's end are an exception: they can sometimes be returned to the operating system.

ANALYZE updates planning statistics. VACUUM cleans eligible old versions. VACUUM ANALYZE asks for both. One operation is not a substitute for diagnosing the other's responsibility. [Routine vacuuming](https://www.postgresql.org/docs/17/routine-vacuuming.html)

The lab runs VACUUM as a separate command outside an explicit transaction. Pasting it into a driver call that implicitly groups several commands can fail too. The supplied vacuum.sql contains only that one command. [VACUUM reference](https://www.postgresql.org/docs/17/sql-vacuum.html)

## Keep an old snapshot open

Reset the fixture. Session A begins a Repeatable Read transaction and reads all 40,000 tasks. Session B deletes IDs above 10000 and commits.

A still sees its 40,000-row snapshot; a new transaction sees 10,000. Run VACUUM VERBOSE from an observer and retain its report. Those old versions cannot all disappear while A still needs them.

End A, run VACUUM again, and compare the reports. Both new reads still return 10,000. The maintenance difference did not require changing the application's query or adding an index.

Statistics views are observations with their own update timing and estimates. Use their dead-row counts alongside the vacuum report and transaction state; do not treat one sampled counter as exact physical inspection. Do not kill unrelated production transactions to reproduce this exercise.

## Practise and transfer

The independent mailbox has 4,000 rows, initially twenty queued. Change the distribution to 1,000 queued, inspect the estimate, then refresh statistics and compare again.

Deliver the exact live row counts, estimates, maintenance observations and a diagnosis separating query work, stale statistics and an old snapshot. Keep autovacuum enabled in normal applications unless a measured operational reason justifies a reviewed change.

**Requires:** [execution plans](18-query-plans.md) and [transaction snapshots](16-competing-claims.md).
**Next:** [How much database work does one request cause?](22-request-work.md).
**Return:** after DELETE, why can a larger-than-expected table file and a wrong row estimate require different investigations?
