# Lab 04 — Inspect the rows after deletion

Run [setup.sql](setup.sql). Patient 10 and visit 100 both exist.

## NO ACTION

```sql
DELETE FROM course_delete.patients WHERE id = 10;
```

Expect 23503. In a new execution, inspect both tables: both rows remain.

## CASCADE

Replace the constraint, then repeat the DELETE:

```sql
ALTER TABLE course_delete.visits DROP CONSTRAINT visit_patient_fk;
ALTER TABLE course_delete.visits ADD CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id) REFERENCES course_delete.patients(id) ON DELETE CASCADE;
DELETE FROM course_delete.patients WHERE id = 10;
SELECT * FROM course_delete.patients;
SELECT * FROM course_delete.visits;
```

Both tables are empty.

## SET NULL

Reset with setup.sql. Replace the constraint again:

```sql
ALTER TABLE course_delete.visits DROP CONSTRAINT visit_patient_fk;
ALTER TABLE course_delete.visits ADD CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id) REFERENCES course_delete.patients(id) ON DELETE SET NULL;
DELETE FROM course_delete.patients WHERE id = 10;
SELECT * FROM course_delete.visits;
```

Visit 100 remains, but its patient_id is NULL.

## A conflicting rule

Reset. Set patient_id NOT NULL, then configure ON DELETE SET NULL as above:

```sql
ALTER TABLE course_delete.visits ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE course_delete.visits DROP CONSTRAINT visit_patient_fk;
ALTER TABLE course_delete.visits ADD CONSTRAINT visit_patient_fk
FOREIGN KEY (patient_id) REFERENCES course_delete.patients(id) ON DELETE SET NULL;
```

Run the DELETE separately. Expect 23502; both rows remain. The action cannot leave a row violating NOT NULL.

## Solution and transfer

Reset and run [solution.sql](solution.sql) for the two successful policies. It leaves visit 100 with a NULL patient_id.

A team has memberships. Describe the difference between deleting a team and deleting one membership. Which direction should a cascade follow? Explain before writing the FK.

