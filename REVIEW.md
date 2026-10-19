# Returning after a gap

Choose the material you have already studied. Try explaining the answer before opening the linked solution. If you need a hint, use it; the attempt shows what to revisit.

Suggested times: next study session, roughly one week later, roughly one month later. Adjust to your schedule and difficulty. These dates are convenient defaults, not a scientific prescription.

| Prompt | Check and revisit |
|---|---|
| A product omits stock; another explicitly supplies NULL; a third supplies zero. Which receives the default? | [Stored values](articles/07-stored-values.md): omission uses the default; explicit NULL stays NULL when allowed; zero is a value. |
| CHECK (stock > 0) is present without NOT NULL. Is NULL rejected? | [Stored values](articles/07-stored-values.md): no; unknown passes CHECK. Zero fails this particular check. |
| A display uses COALESCE(contact, 'missing'). Has the stored contact changed? | [Stored values](articles/07-stored-values.md): no; the expression changes the query result. |
| A query says paid OR pending AND customer = 'Sam'. Which part does the customer condition restrict? | [Selecting rows](articles/08-selecting-rows.md): only the pending branch; parentheses are needed to restrict both statuses. |
| Two orders share a date. Is ORDER BY date enough for a repeatable page boundary? | [Selecting rows](articles/08-selecting-rows.md): add a unique tie-breaker; changes between requests can still move offset pages. |
| A membership's handle may repeat in another workspace. Which pair must remain unique? | [Row identity](articles/09-row-identity.md): workspace and handle; the member/workspace pair identifies membership separately. |
| A rolled-back insert consumed an identity value. Must the next insert reuse it? | [Row identity](articles/09-row-identity.md): no; identity allocation can leave gaps, unlike the ordinary table counter in lab 06. |
| A note refers to profile 2. Profile 2 exists but is a receptionist. What does a plain FK know? | [Foreign keys](articles/01-foreign-keys.md): it knows the referenced key exists, not whether the role is appropriate. |
| The patient trigger accepted an admin yesterday. Today that profile is changed to receptionist. Does writing profiles rerun the patient trigger? | [Business rules](articles/02-business-rules.md): no; enforcement must cover the operations that can violate the rule. |
| A note INSERT supplied owner 2 but stored owner 1. Where could the change have happened? | [Derived values](articles/03-derived-values.md): its BEFORE trigger assigns NEW.owner_id before storage. |
| You delete a parent with a referencing row under NO ACTION. What changes when the statement fails? | [Deletion](articles/04-deleting-related-rows.md): the failed statement's deletion is rolled back; the existing rows remain. |
| A deferred transaction deletes a parent and never repairs the reference. What happens at COMMIT? | [Deferred checks](articles/05-deferred-checks.md): commit fails; the transaction cannot persist the broken reference. |
| A failed invoice increments an ordinary table counter in its trigger. Does that increment survive the failed statement? | [Transactions](articles/06-transaction-boundaries.md): no, it shares the statement's transaction. |
| A visit was committed yesterday. Today's invoice transaction fails. Does yesterday's visit disappear? | [Transactions](articles/06-transaction-boundaries.md): no, it lies outside today's transaction. |
| The request times out after commit. Is a rollback guaranteed? | [Transactions](articles/06-transaction-boundaries.md): no; response delivery does not determine committed state. |

## Another setting for the transaction boundary

A booking transaction creates a reservation and reduces the available-seat count. A constraint then rejects the reservation. Assume both writes are ordinary table writes in that same transaction. Predict which changes remain after rollback, then compare with the [invoice example](articles/06-transaction-boundaries.md).

Answer: neither write persists. Now change one detail: the seat count was committed in an earlier transaction. Rolling back the later reservation does not undo that earlier count. Finally, suppose both writes committed but the confirmation response vanished. Neither rollback conclusion applies merely because the caller saw a timeout; a retry needs a way to identify the same operation. This is a reasoning prompt, not a verified reservation SQL lab.

## Return prompts for planned routes

These become useful after their lessons are written. They are authoring commitments, not exercises with missing prerequisite lessons that readers are expected to solve now.

| Planned route | Later retrieval and transfer prompt | Feedback target |
|---|---|---|
| Wider values and identity | Choose representations for exact amounts, time zones and business document numbers in a subscriptions variant. | Apply type and lifecycle requirements; the first values/identity labs do not cover all these choices. |
| Relationships and modelling | Model a club membership after studying shop customers. Can one membership row describe two members? | State row grain, cardinality and key choices; test counterexamples. |
| Query meaning and reporting | Add a second payment and explain why a joined subscription total changed. | Account for rows before aggregation rather than patching with DISTINCT blindly. |
| Rules and automation | Move an eligibility check from creation to every update in a lending example. | Name all operations that can invalidate the intended rule. |
| Transactions and concurrency | Two callers reserve the final seat. Where can each observe or change state? | Trace interleaving and retry scope; one-session rollback is insufficient evidence. |
| Identity and access | Switch from workspace members to clinic staff. What changes in the identity-to-visible-row trace? | Separate authentication, grants, row policy and privileged function execution. |
| Data over time | Change a current catalog price after an order was paid. | Explain which value is historical and which is recomputed. |
| Performance and recovery | A slow query and an accidental deletion both occur. Which measurement or recovery tool answers each problem? | Use query evidence for performance; prove restoration separately from rollback. |
| Evolution and integration | Add a required field while an older caller is still running. | Explain compatibility, backfill, validation and the user's failure/recovery path. |

## Transfer problem

A library stores members, loans and fines. A loan must refer to a member; only active members may borrow; a fine number is allocated when a fine is inserted.

Explain which parts resemble the clinic labs. Identify one rule a foreign key can enforce, one that needs more than an ID reference, and one operation that needs a transaction boundary. Then describe a later update that might invalidate a rule you checked only at insertion.

Suggested answer: membership existence is an FK concern; active status needs additional modeling or enforcement; fine creation plus its table counter can share a transaction. Deactivating an existing member may violate a stronger "all current loans belong to active members" rule, depending on the chosen business policy. Do not confuse permission at borrowing time with a rule that must remain true forever.

