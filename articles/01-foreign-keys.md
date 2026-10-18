# What a foreign key actually promises

Riya is patient 10. Her visit says `patient_id = 10`.

Now someone submits a visit for patient 999. There is no patient 999. Should the database accept the visit anyway?

With this foreign key, it refuses:

```sql
CREATE TABLE course_fk.visits (
  id integer PRIMARY KEY,
  patient_id integer NOT NULL
    REFERENCES course_fk.patients(id)
);
```

You can read the last two lines as: "Each visit must supply a patient ID, and that ID must identify a row in patients."

## Follow three attempts

Run [lab 01's setup](../labs/01-foreign-keys/setup.sql). It creates Riya and no visits.

| Attempt | Result | Reason |
|---|---|---|
| Visit 100, patient 10 | Accepted | Patient 10 exists. |
| Visit 101, patient 999 | Rejected | No patient has that ID. |
| Visit 102, patient NULL | Rejected | NOT NULL requires a value. |

The FK and NOT NULL do different jobs. If this were an optional relationship and we removed NOT NULL, a NULL value in this single-column FK would be allowed. It would mean this row does not identify a patient.

The FK does not copy the patient's name into the visit. It constrains the stored ID. Joining the tables to read a name is a separate operation.

## An existing row can still be unsuitable

Our setup also contains two profiles:

| id | name | role |
|---|---|---|
| 1 | Meera | admin |
| 2 | Dev | receptionist |

Suppose a patient has `owner_id REFERENCES profiles(id)`. If you supply 2, the FK finds profile 2. It does not inspect the English meaning of "owner" or infer that owners must be admins.

That missing rule is the subject of [the next article](02-business-rules.md).

A foreign key also doesn't grant permission. "This patient exists" and "this caller may use this patient" are different questions.

## Is REFERENCES a PostgreSQL invention?

Foreign keys are a general relational SQL feature. This PostgreSQL column form:

```sql
owner_id uuid NOT NULL REFERENCES profiles(id)
```

combines a type, a required-value rule and a reference. `uuid` is PostgreSQL's UUID type; type names and accepted declaration forms vary across database products.

The table-level form makes the relationship especially visible:

```sql
FOREIGN KEY (owner_id) REFERENCES profiles(id)
```

Use your database's documentation for its exact syntax and enforcement. SQL that resembles another database's syntax is not proof of identical behavior.

## The lab

Open [the tasks](../labs/01-foreign-keys/README.md). Predict each result, run one statement at a time, then inspect the rows. The [solution](../labs/01-foreign-keys/solution.sql) contains the successful operations.

Try changing the setting: an order refers to a customer. Does a customer FK also guarantee that the customer is allowed to buy on credit?

No. Existence and eligibility remain separate.

## A connection to real engineering

In [Notion's 2021 sharding account](https://www.notion.com/blog/sharding-postgres-at-notion), Garrett Fidalgo describes keeping related data together partly because transactions do not automatically span independent databases. The useful connection here is that relationships affect operations, not just diagrams.

Our two-table lab is a teaching example. It does not reproduce Notion's schema or argue that a small application needs sharding.

## Return note

An FK checks a relationship between stored keys. It does not automatically check a role, grant permission, copy fields, or require every patient to have a visit.

**Requires:** [Reading the examples](00-reading-the-examples.md).
**Next:** [An existing person can still be the wrong owner](02-business-rules.md).
**Related:** [Deleting related rows](04-deleting-related-rows.md) examines the relationship from the other direction.

**Reference:** [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK).

