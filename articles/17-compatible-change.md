# Can old callers survive a required new field?

A booking application adds reminder_minutes. New callers send a chosen delay. Older callers still insert only id, room and starts_at.

Adding a required column immediately fails on existing rows. Changing every caller and every stored row in one step also makes it hard to tell what is safe to retry.

By the end, expand the schema, preserve old inserts, backfill in bounded batches, reconcile existing facts and enforce the new requirement.

**Scope:** an additive PostgreSQL migration on synthetic data, with SQL representing old and new callers. This is not a full deployment system, a zero-downtime guarantee or a backup/restore exercise.

## Inspect the inherited contract

[Lab 17's setup](../labs/17-compatible-change/setup.sql) contains four bookings and a small migration-history table. Keep every booking's ID, room and start instant.

The business policy for this exercise is explicit:

| Situation | Reminder policy |
|---|---|
| Existing booking without a preference | Assign 30 minutes |
| Older caller omits the new field | Default to 30 minutes |
| New caller supplies a preference | Preserve an integer from 0 to 1440; 0 means no advance reminder |
| Missing value after the migration is finished | Reject it |

The old caller names its columns. INSERT INTO bookings VALUES (...) without a column list has a different compatibility problem when columns are added.

A default applies to omitted input. It does not replace explicit NULL or justify choosing a historical value without a business rule.

## Expand, then populate, then require

The lab separates three operations:

1. **01-expand.sql** adds a nullable column, sets its future default and adds a range CHECK marked NOT VALID.
2. **02-backfill.sql** updates at most two rows still missing a value, then commits. Run it again to resume.
3. **03-require.sql** validates existing values and makes the column NOT NULL.

The versioned schema steps record completion in migration_history inside their own transactions. A failed step must not leave a successful version record. The batch is repeatable data work; it does not insert a new migration version each time.

A CHECK with NOT VALID still checks new or updated rows. It postpones validation of existing rows. The range expression accepts NULL, which is why presence needs its own later check. The final step validates a presence CHECK before setting NOT NULL. This can avoid a redundant presence scan; it does not remove the schema lock. [ALTER TABLE reference](https://www.postgresql.org/docs/17/sql-altertable.html)

## A small interrupted example

After expansion, existing bookings 1–4 still have NULL reminders. Setting the default afterward did not populate those rows.

Run one batch: bookings 1 and 2 become 30. Stop there. An old caller creates booking 6 and receives 30; a new caller creates booking 5 with 0 and changes booking 3 to 120.

Resume. Only booking 4 needs the backfill. Expected final reminders by ID are 30,30,120,30,0,30. Another batch changes zero rows.

The condition reminder_minutes IS NULL protects explicit choices. A blanket UPDATE ... SET reminder_minutes = 30 would destroy both 120 and 0. The lab also overlaps an application update and a backfill to check the waiting statement's result.

Before enforcing the requirement, reconcile both missing preferences and the original IDs, rooms and start times. A row count alone cannot reveal overwritten values.

## Bound the lock wait

A booking transaction can hold a lock needed by ALTER TABLE. The lab keeps that transaction open while the expansion uses SET LOCAL lock_timeout = '1s'.

Expect a server error, rollback, no new column and no completed migration record. After the blocker ends, retry the entire schema step. The timeout limits waiting for a lock; it is not a bound on the complete migration's running time. [Timeout reference](https://www.postgresql.org/docs/17/runtime-config-client.html)

Short statements can still wait behind long transactions. Choose a quiet deployment window, inspect blocking work and measure the real table before claiming that a production change is harmless.

## One engineering connection

In [Online migrations at scale](https://stripe.com/blog/online-migrations), Jacqueline Xu described Stripe's subscription migration on 2 February 2017. Their transition separated writing both representations, backfilling, changing reads and eventually removing the old representation.

Our additive-field exercise adapts the staged transition and reconciliation idea. It does not reproduce Stripe's architecture or scale, and it needs no dual-write bridge because no existing field is replaced. [GitLab's migration guidance](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/) provides a useful related check: application compatibility must be considered before column removal or renaming. Those larger changes remain later work.

## Keep a usable fallback

Before the final requirement, the old named-column caller remains usable. If the new caller is faulty, stop that deployment and retain the added data while investigating.

Dropping reminder_minutes is not recovery: it destroys the preferences already written. A reverse schema operation cannot recreate those facts. Actual restoration requires a backup and a separate restore rehearsal.

In the [lab](../labs/17-compatible-change/README.md), transfer the process to job attempt limits: historical jobs get 3, while newly omitted values default to 5. The two policies deliberately differ.

**Requires:** [defaults and NULL](07-stored-values.md), [transactions](06-transaction-boundaries.md), [CTEs](12-query-shapes.md) and [lock waits](16-competing-claims.md).
**Revisited in:** [planned restore and deployment work](../COURSE_MAP.md#the-wider-course).
**Return:** explain why a rerunnable backfill and an already-applied schema migration need different retry decisions.
