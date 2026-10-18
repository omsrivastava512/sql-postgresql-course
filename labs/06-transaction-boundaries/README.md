# Lab 06 — Locate the rollback boundary

Run [setup.sql](setup.sql). The clinic counter starts at 42 and visit 10 already exists.

## Four failure points

Run these separately, checking the counter and invoices after each attempt:

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 999, 10, 500);
```

P0001: the trigger cannot find the clinic.

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 999, 500);
```

23503: the visit does not exist.

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 10, -1);
```

23514: the amount violates CHECK.

After all three, the counter is still 42 and there are no invoices.

For a uniqueness collision, create an invoice and deliberately rewind the teaching counter:

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 10, 500);
UPDATE course_tx.clinics SET invoice_counter = 42 WHERE id = 1;
```

Then, separately:

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (101, 1, 10, 500);
```

23505: number 43 already exists for clinic 1. The attempted increment is rolled back; the artificially rewound counter remains 42. This rewinding is deliberate fault injection, not advice for a real counter.

## Earlier commit

Reset. Run this as one completed execution in autocommit mode:

```sql
INSERT INTO course_tx.visits VALUES (20, 'Sam');
```

In a separate execution:

```sql
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 20, -1);
```

It fails. Visit 20 still exists.

## One shared transaction

Reset. In a persistent session, run:

```sql
BEGIN;
INSERT INTO course_tx.visits VALUES (20, 'Sam');
INSERT INTO course_tx.invoices (id, clinic_id, visit_id, amount)
VALUES (100, 1, 20, -1);
```

After the error run ROLLBACK. In the SQL Editor, execute the complete failing block together; do not try to continue it in another request. Inspect afterward in a fresh execution.

Visit 20 is absent and the counter is 42. The visit and trigger update belonged to the same failed transaction.

## Solution and limit

Reset and run [solution.sql](solution.sql). It creates one invoice, then a second visit and invoice together. Final numbers: 43 and 44; counter 44.

Now explain a different failure: commit succeeds but the network response is lost. Which of these rollback tests reproduces that? None. That needs a request/retry experiment. [The article](../../articles/06-transaction-boundaries.md) explains the distinction and links to Stripe's account.

