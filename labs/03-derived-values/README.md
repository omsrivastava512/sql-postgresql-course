# Lab 03 — Follow the supplied value

Run [setup.sql](setup.sql). Predict the owner returned by each INSERT before running it.

```sql
INSERT INTO course_derive.notes (id, patient_id, owner_id, body)
VALUES (100, 10, 2, 'Follow-up recorded')
RETURNING *;
```

```sql
INSERT INTO course_derive.notes (id, patient_id, body)
VALUES (101, 10, 'Second note')
RETURNING *;
```

Both store owner 1. The first overwrites a supplied 2; the second fills an omitted value.

## The missing patient

Run separately:

```sql
INSERT INTO course_derive.notes (id, patient_id, body)
VALUES (102, 999, 'Missing patient');
```

Expect 23502 here. The lookup finds no owner, assigns NULL, and the owner NOT NULL rule rejects the row. Although the patient FK would also be unsatisfied, do not assume it will be the error reported first.

## A later change

```sql
UPDATE course_derive.patients SET owner_id = 2 WHERE id = 10;
SELECT id, owner_id FROM course_derive.notes ORDER BY id;
```

The notes still show 1. Now update one note:

```sql
UPDATE course_derive.notes SET body = 'Edited' WHERE id = 100
RETURNING owner_id;
```

That note now shows 2 because its trigger runs again. Note 101 still shows 1.

Explain why this would be a problem if every note were required to always match the patient's current owner.

## Hint and solution

Look for the event in CREATE TRIGGER and the assignment to NEW.owner_id. Reset before running [solution.sql](solution.sql); it demonstrates the first two writes and the stale-copy observation.

Transfer: would a shipping address on an old order be a historical snapshot or a copy that must follow the customer's current address? That policy determines whether automatic synchronization is desirable.

