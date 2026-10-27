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

Both notes above now belong to Meera, owner 1. Suppose Riya's patient record is reassigned to Dev, owner 2. Then someone edits only the body of note 100. Follow the three stored owner values:

| After this action | Patient 10 | Note 100 | Note 101 |
|---|---:|---:|---:|
| Create both notes | 1 | 1 | 1 |
| Change the patient's owner to 2 | 2 | 1 | 1 |
| Edit only note 100's body | 2 | 2 | 1 |

Why does the second row leave both notes unchanged? The trigger is attached to INSERT OR UPDATE on **notes**, not to changes on patients. Reassigning Riya does not run it. Editing note 100 does run it, even though the edit mentions only body: the function reads Riya's current owner and overwrites NEW.owner_id again. Note 101 has not been edited, so its copy stays 1. [Run the sequence](../labs/03-derived-values/README.md#a-later-change).

Now test two possible meanings of “note owner”. If it means the patient's **current owner**, the notes fail that contract as soon as Riya is reassigned. If it means the **owner when the note was created**, changing note 100's body must not rewrite that history, but this trigger does. It produces neither consistently current ownership nor an immutable historical snapshot. Each note reflects the patient's owner at that note's most recent write.

We leave the trigger incomplete so those differences stay observable. Before choosing a repair, decide which business meaning is intended and list the writes that could break it. That question connects to the later topics of normalization, snapshots, and audit history.

## Choose the event from the fact you need

Brandur Leach describes [retaining deleted rows with AFTER DELETE triggers](https://brandur.org/fragments/deleted-record-insert). That purpose needs the deleted row, OLD, rather than a proposed replacement, NEW. Keeping the row for investigation does not by itself provide a reliable undo operation.

Use that distinction to check our attachment: filling an incoming note needs BEFORE and NEW; recording removal would need the removed row; following a patient's reassignment would require observing a different table's change. A function with the right assignment still fails if the event that matters never calls it. Our ownership trace is synthetic and intentionally incomplete; it is not his archival implementation. Before changing the trigger, name the event and whether the fact should describe the past or the present.

## Return note

A BEFORE trigger can change the proposed row. Deriving a value now does not promise to keep every stored copy synchronized later.

**Lab:** [Try omission, a conflicting owner and a missing patient](../labs/03-derived-values/README.md).
**Requires:** [Trigger attachment and validation](02-business-rules.md).
**Next:** [Deletion](04-deleting-related-rows.md).
**Related:** [Transactions](06-transaction-boundaries.md) explains what happens to trigger effects when the write fails.

