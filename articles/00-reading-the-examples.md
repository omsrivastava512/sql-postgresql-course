# Reading the examples

A patient arrives. Someone records a visit. That gives us two different facts: who the patient is, and that a visit happened.

We will store those facts in two tables. Think of a table as a set of rows with named, typed columns. Each row in `patients` describes one patient. Each row in `visits` describes one visit.

This is a SQL onramp, not a complete introduction to querying.

## The few commands you need

After following the [lab setup guide](../labs/README.md), run [lab 01's setup](../labs/01-foreign-keys/setup.sql). It creates this patient:

| id | name |
|---|---|
| 10 | Riya |

To inspect it:

```sql
SELECT id, name FROM course_fk.patients;
```

`course_fk` is a schema: a namespace that groups this lab's tables. `course_fk.patients` means the patients table in that namespace. Using the full name keeps one lab separate from another.

A table definition looks like this:

```sql
CREATE TABLE example_patients (
  id integer PRIMARY KEY,
  name text NOT NULL
);
```

Read a column definition from left to right: column name, value type, rules. Here, `id` stores an integer. Its primary-key rule makes it unique and disallows NULL. `name` stores text and cannot be NULL.

NULL represents a missing or unknown value. It is different from an empty string. We will study its behavior in comparisons later.

To add a patient to the lab:

```sql
INSERT INTO course_fk.patients (id, name, owner_id)
VALUES (20, 'Sam', 1);
```

Strings use single quotes. The column list and value list correspond by position. A semicolon ends the statement.

To change just Sam's name:

```sql
UPDATE course_fk.patients
SET name = 'Samuel'
WHERE id = 20;
```

The `WHERE` clause selects the rows to change. Without it, this statement would rename every patient.

To remove that row:

```sql
DELETE FROM course_fk.patients WHERE id = 20;
```

If you run an INSERT twice with the same primary key, expect a duplicate-key error. That is the database enforcing a rule, not the server crashing.

## Predict, then inspect

Insert Sam again. Update the name to Samuel. Before selecting the table, predict whether it contains one row or two.

It contains two: Riya and Samuel. UPDATE changed Sam's existing row; it did not create a third patient.

Rerun lab 01's setup before moving on. Each setup resets only its own course schema.

## When something fails

Run the next exercise only after reading the error. Useful parts include the table, column or constraint name, and the SQLSTATE code. The code identifies the error category; exact English wording can vary by version.

In a persistent connection, if you have explicitly opened a transaction and a statement fails, run `ROLLBACK;` before continuing. [The transaction article](06-transaction-boundaries.md) explains why.

## Return note

CREATE defines a table. INSERT adds rows. SELECT reads rows. UPDATE changes matching rows. DELETE removes matching rows. A constraint is a rule the database checks.

**Next:** [What a foreign key actually promises](01-foreign-keys.md) adds a relationship between the two tables.

**Reference:** PostgreSQL's [SQL language tutorial](https://www.postgresql.org/docs/17/tutorial-sql.html).

