# Can the database wait until I am finished?

Riya's visit points to patient 10. You intend to remove that visit and then remove Riya.

The easy ordering is to delete the visit first. But suppose a multi-step operation temporarily changes related data in an order that breaks a reference before repairing it.

Can PostgreSQL check the result after all the steps?

Sometimes, if that constraint was deliberately made deferrable.

## Watch two complete transactions

The lab starts with the same patient and visit as before. Its foreign key says:

```sql
CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id)
REFERENCES course_defer.patients(id)
ON DELETE NO ACTION
DEFERRABLE INITIALLY IMMEDIATE
```

The last line means this constraint is allowed to wait, but initially checks immediately. It does not begin deferred just because it is deferrable.

First, try an ordinary DELETE outside an explicit transaction. It fails while the visit remains.

Now run this entire block together:

```sql
BEGIN;
SET CONSTRAINTS course_defer.visit_patient_fk DEFERRED;
DELETE FROM course_defer.patients WHERE id = 10;
DELETE FROM course_defer.visits WHERE id = 100;
COMMIT;
```

After the first DELETE, this transaction temporarily contains a visit pointing to a missing patient. After the second, it doesn't. At COMMIT, the reference rule is satisfied and both deletions persist.

We chose that awkward ordering to expose the mechanism. For an ordinary two-row cleanup, deleting the dependent visit first is simpler.

## Remove the repair

Reset the lab. Run the same block without deleting the visit.

The error now arrives at COMMIT. The database still rejects the broken relationship. When you inspect afterward, the failed transaction has not permanently removed Riya.

The permission was "wait to check," not "allow invalid data forever."

You can also force the waiting check before commit with:

```sql
SET CONSTRAINTS course_defer.visit_patient_fk IMMEDIATE;
```

If there is still a broken reference, that statement fails.

## Now RESTRICT has a visible difference

The lab also creates an equivalent FK with ON DELETE RESTRICT and makes the constraint deferrable. Even after SET CONSTRAINTS DEFERRED, its referenced DELETE fails immediately.

The RESTRICT deletion action cannot be deferred. NO ACTION can participate in the deferred checking we just used.

Our example demonstrates the deletion-timing difference. Other details can matter for UPDATE operations and particular comparisons; avoid treating this one experiment as a complete account of every distinction.

## Keep the request boundary visible

Run each whole BEGIN-to-COMMIT block in one execution or a persistent connection. Clicking "Run" on BEGIN in one browser request and assuming another request continues that transaction is not a reliable setup.

A CREATE TABLE ordering problem is different again. Adding an FK with ALTER TABLE after both tables exist solves a schema-construction dependency; it does not automatically defer checking of later data changes.

## Take the idea elsewhere

Suppose a bulk import contains invoices and their line items. Which relationships need to be valid after every statement, and which may be temporarily incomplete inside the import transaction?

There is no benefit in postponing everything by default. Choose it only where the operation needs it, and test the failure at the end.

## Return note

DEFERRABLE permits postponement. INITIALLY IMMEDIATE describes the starting mode. SET CONSTRAINTS changes the mode for the current transaction. The final check still has teeth.

**Lab:** [Successful repair, failed commit, forced check, RESTRICT](../labs/05-deferred-checks/README.md).
**Requires:** [Deletion](04-deleting-related-rows.md) and [transaction boundaries](06-transaction-boundaries.md).
**Revisited in:** the planned cross-row totals and batch-import topics in the [map](../COURSE_MAP.md).
**Reference:** [PostgreSQL SET CONSTRAINTS](https://www.postgresql.org/docs/17/sql-set-constraints.html).

