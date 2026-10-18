# Returning after a gap

Choose the material you have already studied. Try explaining the answer before opening the linked solution. If you need a hint, use it; the attempt shows what to revisit.

Suggested times: next study session, roughly one week later, roughly one month later. Adjust to your schedule and difficulty. These dates are convenient defaults, not a scientific prescription.

| Prompt | Check and revisit |
|---|---|
| A note refers to profile 2. Profile 2 exists but is a receptionist. What does a plain FK know? | [Foreign keys](articles/01-foreign-keys.md): it knows the referenced key exists, not whether the role is appropriate. |
| The patient trigger accepted an admin yesterday. Today that profile is changed to receptionist. Does writing profiles rerun the patient trigger? | [Business rules](articles/02-business-rules.md): no; enforcement must cover the operations that can violate the rule. |
| A note INSERT supplied owner 2 but stored owner 1. Where could the change have happened? | [Derived values](articles/03-derived-values.md): its BEFORE trigger assigns NEW.owner_id before storage. |
| You delete a parent with a referencing row under NO ACTION. What changes when the statement fails? | [Deletion](articles/04-deleting-related-rows.md): the failed statement's deletion is rolled back; the existing rows remain. |
| A deferred transaction deletes a parent and never repairs the reference. What happens at COMMIT? | [Deferred checks](articles/05-deferred-checks.md): commit fails; the transaction cannot persist the broken reference. |
| A failed invoice increments an ordinary table counter in its trigger. Does that increment survive the failed statement? | [Transactions](articles/06-transaction-boundaries.md): no, it shares the statement's transaction. |
| A visit was committed yesterday. Today's invoice transaction fails. Does yesterday's visit disappear? | [Transactions](articles/06-transaction-boundaries.md): no, it lies outside today's transaction. |
| The request times out after commit. Is a rollback guaranteed? | [Transactions](articles/06-transaction-boundaries.md): no; response delivery does not determine committed state. |

## Transfer problem

A library stores members, loans and fines. A loan must refer to a member; only active members may borrow; a fine number is allocated when a fine is inserted.

Explain which parts resemble the clinic labs. Identify one rule a foreign key can enforce, one that needs more than an ID reference, and one operation that needs a transaction boundary. Then describe a later update that might invalidate a rule you checked only at insertion.

Suggested answer: membership existence is an FK concern; active status needs additional modeling or enforcement; fine creation plus its table counter can share a transaction. Deactivating an existing member may violate a stronger "all current loans belong to active members" rule, depending on the chosen business policy. Do not confuse permission at borrowing time with a rule that must remain true forever.

