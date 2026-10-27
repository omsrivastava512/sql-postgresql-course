# Deleting a patient with visits

There are two rows:

| patients.id | name |
|---|---|
| 10 | Riya |

| visits.id | patient_id |
|---|---|
| 100 | 10 |

You run:

```sql
DELETE FROM course_delete.patients WHERE id = 10;
```

If PostgreSQL removed only Riya, visit 100 would point to a patient who no longer exists.

## First, run the ordinary case

[Lab 04](../labs/04-deleting-related-rows/README.md) begins with a normal foreign key whose deletion action is NO ACTION.

Predict the result. Then run the DELETE on its own.

It fails. Select both tables afterward: Riya remains and visit 100 remains. This statement didn't persist the deletion.

NO ACTION does not mean "ignore the relationship." It means PostgreSQL will not automatically delete or alter the referencing visit to make the deletion work. The reference still has to be valid when checked.

## Choose what should happen to the visit

These are alternative policies, not steps to apply together:

| Policy | What this example does |
|---|---|
| NO ACTION, ordinary non-deferrable FK | Rejects the deletion while the reference remains. |
| RESTRICT | Rejects the referenced deletion; this action cannot be postponed. |
| CASCADE | Deletes Riya and the referencing visit. |
| SET NULL | Deletes Riya and clears visits.patient_id, if that column allows NULL. |

The lab changes the FK policy between experiments so you can inspect each result.

For the first experiment, NO ACTION and RESTRICT look the same. You do not need to invent a difference in the final rows. Their important distinction appears when we explicitly allow a check to wait; [the next article](05-deferred-checks.md) demonstrates it.

CASCADE follows the direction of the relationship: deleting the referenced patient can delete visits. Deleting one visit does not automatically delete the patient.

## An action can conflict with another rule

SET NULL cannot clear a column that is declared NOT NULL. If both are configured, the attempted deletion fails instead of leaving an illegal row.

Likewise, CASCADE is not a policy decision about whether records ought to be erased. The database executes the chosen action; the application designer must decide whether that action matches the meaning of the data.

For a practice variation, replace patients and visits with teams and memberships. Does deleting a membership mean the team should disappear? Usually not. State the intended direction before choosing a cascade.

## What if we only mark the patient deleted?

An UPDATE that fills `deleted_at` leaves the row physically present. An ordinary FK can still find it.

A deletion marker also gives every reader another condition to remember. [Brandur Leach's soft-deletion essay](https://brandur.org/soft-deletion) examines that cost in ordinary queries, including direct operational queries that bypass an ORM, and the difficulty of eventually pruning related data. His alternative keeps deleted data outside the live tables. Either design still needs a plan for restoration.

Apply that trade-off to our fictional rows before choosing a deletion action:

| Desired outcome | Question the designer must answer |
|---|---|
| Keep Riya's past visits, prevent new visits | How does a new visit check active status, beyond the FK? |
| Hide Riya from ordinary lists | Which readers apply that policy, including direct reports? |
| Remove Riya and visits together | Is losing those facts actually intended before choosing CASCADE? |
| Retain removed facts elsewhere | Who may read them, and how would a restore handle changed relationships? |

Do not implement all four. Choose one brief and predict whether patient 10 and visit 100 remain, whether the reference is NULL, and whether a new visit should be accepted. The lab verifies FK actions; this decision exercise exposes what those actions do not settle. It supplies no medical retention policy.

## Return note

In this lab, NO ACTION refuses a deletion that leaves a broken reference. CASCADE removes dependents. SET NULL clears the reference if other rules permit it. None of those labels means "skip validation."

**Lab:** [Delete, inspect, reset, compare](../labs/04-deleting-related-rows/README.md).
**Requires:** [Foreign keys](01-foreign-keys.md).
**Next:** Read the short transaction introduction in [article 06](06-transaction-boundaries.md), then [deferred checks](05-deferred-checks.md).
**Reference:** [PostgreSQL foreign-key actions](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK).

