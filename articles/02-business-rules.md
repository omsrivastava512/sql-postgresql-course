# An existing person can still be the wrong owner

The patient row says owner 2. Profile 2 exists. The foreign key is satisfied.

But profile 2 is Dev, a receptionist. Our fictional clinic's rule says the owner must be an admin.

We need to decide what "must be an admin" means. Is it checked when the patient is assigned? Or must it remain true for as long as the patient exists? That distinction will matter.

## Where the check runs

In this lab, a PostgreSQL trigger runs a function before a patient row is inserted or updated:

```sql
CREATE TRIGGER patient_owner_guard
BEFORE INSERT OR UPDATE ON course_rules.patients
FOR EACH ROW
EXECUTE FUNCTION course_rules.validate_owner();
```

The trigger is the attachment: it tells PostgreSQL **when** to call the function. The function contains the work:

```sql
CREATE FUNCTION course_rules.validate_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM course_rules.profiles
    WHERE id = NEW.owner_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'owner must be an admin';
  END IF;
  RETURN NEW;
END;
$$;
```

`NEW` is the proposed patient row. `NEW.owner_id` is the owner supplied for that row. EXISTS asks whether the query finds at least one matching profile; the value 1 is just a convenient selected constant.

If none matches, RAISE EXCEPTION stops this write. Otherwise RETURN NEW hands the row back so the operation can continue. The dollar signs delimit the function body; they are not application string interpolation.

## Watch the difference

[Lab 02](../labs/02-business-rules/README.md) gives you Meera, an admin, and Dev, a receptionist.

Assign Meera: the function finds a matching admin and permits the write.

Assign Dev: the profile exists, but the function finds no profile matching **both** the ID and the admin role. The write fails.

This is a trigger function, not a CHECK constraint. A simple CHECK is suitable for a rule about the row, such as a nonnegative amount. Looking up another table introduces other changes and concurrent activity to consider.

## Why not check on the server?

A server can check first and return a useful message before trying the write. That is valuable. But another write path, an import, or a later change can bypass that application check.

A database rule can protect multiple writers. It also has costs: more behavior lives in the database, errors need translation, and rule coverage can be subtle. There is no single pattern that every professional backend must use.

Sometimes the schema can express a rule through a separate eligibility table and foreign keys. Sometimes a transaction in a service owns the workflow. A trigger is one available tool, not automatic proof of a complete design.

## The hole you should notice

After assigning Meera, change Meera's role in `profiles`.

Does a trigger attached to `patients` run when we update `profiles`? No.

The lab deliberately lets you observe this. The patient-write validator alone does not enforce the stronger rule "every existing patient always has an admin owner." Concurrent role changes also need a deliberate policy and synchronization strategy.

Before adding more functions, decide whether demotion should be blocked, ownership transferred, or historical ownership allowed. Then cover every operation that can break that chosen rule.

## A real-world comparison

GitHub's [2021 account of partitioning relational databases](https://github.blog/engineering/infrastructure/partitioning-githubs-relational-databases-scale/) describes changing how application code accesses data across database boundaries. It is a useful counterweight to universal rules about where logic must live. Their system uses MySQL; it is not evidence for the exact PostgreSQL trigger above.

## Return note

The FK establishes existence. Our trigger checks the role on patient writes. Keeping a rule true over time requires examining other writes too.

**Lab:** [Tasks, hints and expected outcomes](../labs/02-business-rules/README.md).
**Requires:** [Foreign keys](01-foreign-keys.md).
**Next:** [Who put that owner on the note?](03-derived-values.md) shows a trigger changing a value instead of only checking it.

**References:** [PostgreSQL trigger functions](https://www.postgresql.org/docs/17/plpgsql-trigger.html), [CREATE TRIGGER](https://www.postgresql.org/docs/17/sql-createtrigger.html).

