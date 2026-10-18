# Lab 02 — A rule with a boundary

Run [setup.sql](setup.sql). It defines the trigger shown in [the article](../../articles/02-business-rules.md).

## Predict and run

```sql
INSERT INTO course_rules.patients VALUES (10, 'Riya', 1);
```

This succeeds. Now run each of these separately:

```sql
INSERT INTO course_rules.patients VALUES (20, 'Sam', 2);
```

```sql
UPDATE course_rules.patients SET owner_id = 2 WHERE id = 10;
```

Both fail with the trigger's message and SQLSTATE P0001. Riya's owner remains 1.

Now change the profile:

```sql
UPDATE course_rules.profiles SET role = 'receptionist' WHERE id = 1;
SELECT p.id, p.owner_id, r.role
FROM course_rules.patients p
JOIN course_rules.profiles r ON r.id = p.owner_id;
```

The update succeeds, leaving patient 10 pointing to a receptionist. This is the intended observation, not a bug in the lab.

## Explain

Which table has the trigger? Which table did the last UPDATE write?

The patient trigger runs for patient writes. It doesn't run simply because a profile changed. A correct long-lived rule would need to address that write, and concurrent changes, according to the intended policy.

## Transfer

A loan is accepted only for an active library member. Must deactivating the member be blocked while a loan exists, or is activity required only when borrowing? Choose one policy and identify the writes it needs to cover.

## Solution

Reset and run [solution.sql](solution.sql) to reproduce the successful write followed by the unguarded role change. This is a demonstration of the validator's limits, not a recommended final ownership design.

