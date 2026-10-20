# Can two callers claim the last item?

There is one item left. Riya reads 1. Sam reads 1. Each application calculates 1 − 1, stores 0 and records a reservation. Both transactions commit.

The stored counter is nonnegative, yet two reservations promise the same item. A CHECK on the counter cannot compare it with the reservation history.

By the end, reproduce that schedule, repair the claim, inspect an actual lock wait and retry a transaction after its earlier decision becomes invalid.

**Scope:** PostgreSQL concurrent transactions on one database. The examples use supplied SQL callers, not an HTTP service, payment processor or idempotency store.

## State the rule before choosing a lock

[Lab 16](../labs/16-competing-claims/README.md) supplies stock and reservations. For item 1, initial stock is one. A successful claim must reduce availability and create its reservation together. Total committed quantity must not exceed that initial stock.

All writers in the repaired exercise must use the claim operation. A writer with unrestricted table access can bypass it; this is not an authorization design. Cancellation and restocking are outside this first contract.

The failing schedule preserves each transaction's atomicity. The problem is that each decision came from a read that another caller could make obsolete. Wrapping those same statements in BEGIN does not repair that decision.

## Put the condition in the write

For a claim of one unit:

```sql
WITH claimed AS (
  UPDATE course_race.stock SET available = available - 1
  WHERE item_id = 1 AND available >= 1
  RETURNING item_id
)
INSERT INTO course_race.reservations (id, item_id, quantity)
SELECT 101, item_id, 1 FROM claimed RETURNING id;
```

The named step supplies a row only when stock was claimed. The INSERT therefore records a reservation only for a successful update. Both writes belong to one statement: an invalid reservation undoes the decrement too.

After fresh setup, expect reservation 101 and availability 0. A second one-unit claim with reservation ID 102 returns no row and creates no reservation. For this known item, that means insufficient stock, not a transaction error.

At PostgreSQL Read Committed, two updates of the same row cannot overwrite it simultaneously. If another transaction holds the row, the contender waits. After the first commits, PostgreSQL checks the condition against the updated row. The lab observes this through a second connection; running these requests one after another is insufficient evidence. [Isolation reference](https://www.postgresql.org/docs/17/transaction-iso.html)

## Observe the wait and the release

Open persistent sessions A and B, plus observer C. A claims inside BEGIN and stays open. B attempts the other claim. C inspects pg_blocking_pids for B's backend ID.

Predict both branches:

| A ends with | B after the wait | Final committed state |
|---|---|---|
| COMMIT | No returned reservation | A's one reservation; availability 0 |
| ROLLBACK | B can claim | B's one reservation; availability 0 |

An ordinary SELECT by C can still see the earlier committed availability while A is open. A visible 1 is not a promise that a new claim will succeed.

A SELECT ... FOR UPDATE offers another approach: lock the stock row, read it, decide, write and commit on that same connection. It helps when the decision needs several steps, but lengthens the period holding the lock. The lab compares it with the conditional write. Do not hold that transaction open while waiting for a person or an external service. [Lock reference](https://www.postgresql.org/docs/17/explicit-locking.html)

## An old snapshot can require a fresh attempt

Now start both transactions at REPEATABLE READ and let both read the original stock before A commits a claim. B's conflicting update fails with SQLSTATE 40001.

B must roll back and restart the whole transaction, including the read and decision. In the new transaction it finds no stock and creates no reservation. Retrying only a write calculated from the earlier value preserves the mistake.

This exercise requires one deliberate retry. A real caller needs a bounded retry policy and a way to report exhaustion. External effects cannot simply be repeated with a database transaction. Request replay after a lost response is a separate, still-planned lesson. [Retry reference](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html)

## A timeout is a result to inspect

The lab gives B a short lock_timeout while A stays open. B receives 55P03; its explicit transaction then rejects further work until rollback. Inspect stored rows afterward.

This differs from a network timeout after COMMIT: here the server reports a statement failure. The earlier [transaction lesson](06-transaction-boundaries.md) explains why a missing response alone cannot establish rollback.

## Practise and transfer

In the [lab](../labs/16-competing-claims/README.md), repair the stale write, test commit and rollback branches, then compete for two seats in a three-seat session. One two-seat registration should succeed; the other should leave one seat available.

Deliver a numbered two-session schedule, returned rows/errors, final stored facts and an explanation of the invariant. Record whether you used the solution before the independent task.

**Requires:** [transactions](06-transaction-boundaries.md), [keys](09-row-identity.md) and [CTEs](12-query-shapes.md).
**Next:** [Change a table while callers still use it](17-compatible-change.md).
**Return:** a successful read showed one item, but a claim returned no row. Explain how both observations can be correct.
