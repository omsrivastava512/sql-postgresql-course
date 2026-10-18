# Who put that owner on the note?

Meera owns Riya's patient record. Someone adds a note about Riya.

Should they have to tell the database again that Meera is the owner?

In this lab, they only need to identify Riya. A trigger looks up the patient and fills the note's owner.

## Start with actual rows

| patients.id | name | owner_id |
|---|---|---|
| 10 | Riya | 1 |

The incoming note says:

```sql
INSERT INTO course_derive.notes (id, patient_id, owner_id, body)
VALUES (100, 10, 2, 'Follow-up recorded')
RETURNING id, patient_id, owner_id;
```

Notice the supplied owner: 2. After [the setup](../labs/03-derived-values/setup.sql), the stored result is:

| id | patient_id | owner_id |
|---|---|---|
| 100 | 10 | 1 |

The database didn't decide that 2 was a typo. We explicitly programmed an assignment:

```sql
NEW.owner_id := (
  SELECT owner_id
  FROM course_derive.patients
  WHERE id = NEW.patient_id
);
```

`:=` assigns a value inside PL/pgSQL. The query reads Riya's owner. The function writes that value into the proposed note row. A BEFORE trigger lets this happen before the row is stored.

## Supplying and checking are different operations

A caller can supply owner 2. A validator could reject 2. This derivation function instead replaces it with 1.

These are different policies. If overwriting input would surprise your API's callers, you might omit the input field entirely or reject mismatches. The point is to choose and document the behavior.

The same trigger can fill owner_id when the caller omits it:

```sql
INSERT INTO course_derive.notes (id, patient_id, body)
VALUES (101, 10, 'Second note')
RETURNING owner_id;
```

Even though owner_id has NOT NULL, the trigger supplies a value before that row constraint is checked.

## Where does the patient's own owner come from?

There is no earlier patient row to consult when creating that patient. Some part of the application must decide its owner.

That could be trusted server code using the authenticated account, or a database function that receives and checks suitable context. An INSERT must eventually supply or derive the value. The table declaration by itself does not reveal which application layer makes that decision.

Our patient setup supplies owner 1 explicitly. It does not demonstrate a production authorization flow.

## A copied value can become stale

Change Riya's owner in the patients table. Existing notes do not magically update: this trigger runs when a **note** is written.

Is that wrong? It depends on whether note ownership is meant to follow the patient or record the historical owner. If it must follow, the design needs a way to keep it synchronized, or queries can obtain the owner through the patient instead of storing another copy.

That question connects to the later topics of normalization, snapshots, and audit history.

## An engineer's use of the same mechanism

In [a December 2022 article](https://brandur.org/fragments/deleted-record-insert), Brandur Leach describes using AFTER DELETE triggers to record deleted rows in a separate table. It is a firsthand example of attaching behavior to a database event.

His event and purpose differ from ours. Our example changes NEW before an insert; his captures a deleted row. The common idea is the trigger attachment.

## Return note

A BEFORE trigger can change the proposed row. Deriving a value now does not promise to keep every stored copy synchronized later.

**Lab:** [Try omission, a conflicting owner and a missing patient](../labs/03-derived-values/README.md).
**Requires:** [Trigger attachment and validation](02-business-rules.md).
**Next:** [Deletion](04-deleting-related-rows.md).
**Related:** [Transactions](06-transaction-boundaries.md) explains what happens to trigger effects when the write fails.

