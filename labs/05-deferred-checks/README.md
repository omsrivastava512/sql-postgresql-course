# Lab 05 — Find the moment of rejection

Run [setup.sql](setup.sql) before each experiment. Run each complete transaction block together.

## A — immediate by default

Run `DELETE FROM course_defer.patients WHERE id = 10;`.

Expect 23503 immediately. "Deferrable" did not automatically defer it.

## B — defer and repair

Run [solution.sql](solution.sql). It deletes the patient first, then the visit, then commits. Both tables end empty.

## C — defer without repairing

Reset, then run:

```sql
BEGIN;
SET CONSTRAINTS course_defer.visit_patient_fk DEFERRED;
DELETE FROM course_defer.patients WHERE id = 10;
COMMIT;
```

Expect 23503 at COMMIT. Inspect in a fresh execution: patient 10 and visit 100 remain. If your persistent client still reports a failed transaction, issue ROLLBACK before inspecting.

## D — ask for the check early

Reset, then run:

```sql
BEGIN;
SET CONSTRAINTS course_defer.visit_patient_fk DEFERRED;
DELETE FROM course_defer.patients WHERE id = 10;
SET CONSTRAINTS course_defer.visit_patient_fk IMMEDIATE;
```

The last statement fails with 23503. In a persistent connection issue ROLLBACK. In the SQL Editor, do not carry the open transaction into a later request; the failed request should be discarded, then inspect in a new execution.

## E — RESTRICT

Reset, then run:

```sql
BEGIN;
SET CONSTRAINTS course_defer.restricted_patient_fk DEFERRED;
DELETE FROM course_defer.restricted_patients WHERE id = 10;
```

The DELETE fails even though you requested deferred mode. PostgreSQL 17 reports 23503 for this case; the PostgreSQL 18 embedded test reports 23001 (restrict_violation). RESTRICT's deletion action cannot wait. Recover the connection with ROLLBACK if using a persistent client.

## Explain and transfer

For B and C, point to the statement that differs. For C and E, point to the statement that fails.

A batch import temporarily lacks some referenced rows but will supply them before commit. What would you have to declare and test? Answer: the relevant constraints must permit deferral, the writes must share a transaction, and the completed import must satisfy them. Test an import that fails to repair the references too.

