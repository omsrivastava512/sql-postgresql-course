# The invoice failed. Did its number disappear?

The clinic counter is 42. An invoice INSERT runs a trigger that increments the counter to 43. Then the invoice fails a constraint.

Is the counter still 43?

For the ordinary table counter in this lab, no. The trigger's update belongs to the same transaction as the INSERT. Failure rolls that update back too.

## A transaction is the group being accepted or undone

PostgreSQL runs statements in transactions. When your client runs one statement in autocommit mode, a successful statement commits its work. For several statements that must succeed together, you can explicitly group them:

```sql
BEGIN;
-- several database writes
COMMIT;
```

COMMIT asks to make the transaction's changes permanent. ROLLBACK abandons them. After a statement error inside an explicit transaction, the usual next step is ROLLBACK; savepoints provide finer control, which is a later topic.

## Follow the invoice

[Lab 06's setup](../labs/06-transaction-boundaries/setup.sql) creates a clinic counter, visits and invoices. The invoice's BEFORE INSERT trigger includes:

```sql
UPDATE course_tx.clinics
SET invoice_counter = invoice_counter + 1
WHERE id = NEW.clinic_id
RETURNING invoice_counter INTO NEW.invoice_number;
```

The UPDATE increments the stored value. RETURNING obtains the updated number; INTO puts it in the proposed invoice row.

Now supply a negative amount. The trigger runs, but the invoice's nonnegative-amount CHECK fails.

| Point | What this attempt has done |
|---|---|
| Before INSERT | Counter 42; no new invoice |
| Inside trigger | Counter tentatively incremented |
| Invoice constraint fails | INSERT cannot succeed |
| After rollback | Counter 42; no new invoice |

Reset, try a valid amount, and inspect again: counter 43 and invoice 43 remain.

This is an ordinary table update. PostgreSQL sequences used by identity/serial columns have different rollback behavior; do not infer gapless numbering from this example. [Sequence documentation](https://www.postgresql.org/docs/17/functions-sequence.html)

## Where can it fail?

The lab probes four places: an invalid clinic rejected in the trigger, a missing visit rejected by an FK, a negative amount rejected by CHECK, and a duplicate invoice number rejected by UNIQUE. For each, inspect the counter and invoices afterward.

A CHECK failure later in the statement can undo an earlier trigger effect. We do not need a separate "undo the counter" function.

## What about a visit saved earlier?

Imagine two separate operations:

```text
Morning: INSERT visit → commit succeeds.
Afternoon: INSERT invoice → fails and rolls back.
```

The morning visit stays. It was not part of the afternoon transaction.

If the desired operation is "create visit and invoice together," both writes must share one transaction. Lab 06 compares these arrangements using actual rows.

Being in the same screen, button handler, or sequence of API calls does not itself establish a shared database transaction.

## The database commits, but the response goes missing

A transaction cannot make a network response arrive.

In [Stripe's 2017 article](https://stripe.com/blog/idempotency), Brandur Leach discusses this uncertainty and explains how a client-supplied idempotency key can let retries refer to the same operation. The key must remain the same for that retry; generating a new one describes a different operation.

Our lab shows the database boundary, not a Stripe implementation. It doesn't implement an idempotency store, request matching, or response replay. Those need their own article and tests.

If the UI reports a timeout, you cannot conclude that the transaction rolled back. You need a reliable way to establish the operation's result or retry it safely.

## Return note

Ask "which writes were in this transaction?" A trigger shares its triggering operation's transaction. Earlier committed writes stay committed. A lost response does not undo a successful commit.

**Lab:** [Failure points and transaction boundaries](../labs/06-transaction-boundaries/README.md).
**Related:** [Deferred checks](05-deferred-checks.md) shows a failure that arrives at commit.
**Next, planned:** concurrent counter requests and safe retries in the [course map](../COURSE_MAP.md#the-wider-course).

**Reference:** [PostgreSQL transaction tutorial](https://www.postgresql.org/docs/17/tutorial-transactions.html).

