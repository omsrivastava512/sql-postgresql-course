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
| A LEFT JOIN report loses customers after adding WHERE order.status = 'paid'. What changed? | [Joins](articles/10-joins.md): the filter removes padded rows; preserve customers by restricting qualifying matches in ON when that matches the brief. |
| Two equal-valued lines meet three payments. Does SUM(DISTINCT amount) fix the inflated total? | [Aggregate grain](articles/11-aggregate-grain.md): it loses a legitimate equal-valued line; summarize each collection at the intended grain first. |
| One account has two addresses. Should an unordered LIMIT 1 repair its scalar lookup? | [Query shapes](articles/12-query-shapes.md): only an explicit selection policy resolves ambiguity; existence and scalar-value questions differ. |
| A NOT IN source contains NULL. Can it reliably express accounts with no matching orders? | [Query shapes](articles/12-query-shapes.md): use the correlated absence test and explain the unknown comparison. |
| Two charges share a date and a running sum jumps over both. Which window choices matter? | [Windows](articles/13-window-questions.md): peer handling, frame and a deterministic processing order; final display sorting does not repair the calculation. |
| All top ties are required. Should ID be part of RANK's ordering? | [Windows](articles/13-window-questions.md): ID would break the amount tie; use it for final display ordering instead. |
| An October order is refunded in November. Which month should change? | [Reusable reports](articles/14-reusable-reports.md): under this stated contract, November's refund total; another policy would need a different metric definition. |
| October has five units across three lines. What denominator gives average unit amount? | [Reusable reports](articles/14-reusable-reports.md): total units, not line count; an empty denominator is handled explicitly. |
| A CSV repeats the same amount under a new event key. Is it a duplicate? | [Data handoff](articles/15-data-handoff.md): equal amounts do not prove equal events; preserve event identity and compare complete payloads. |
| A replay reports four accepted source events. Did it insert four more facts? | [Data handoff](articles/15-data-handoff.md): accepted candidates and newly inserted facts differ; reconcile stored fact count and total after replay. |
| Both callers read one item and commit availability zero. Does CHECK (available >= 0) prove only one reservation exists? | [Competing claims](articles/16-competing-claims.md): inspect the reservation total; a stale replacement can pass that CHECK while overpromising. |
| A's claim is open and B is blocked. What changes if A rolls back instead of committing? | [Lab 16](labs/16-competing-claims/README.md#repair-and-observe-the-wait): after rollback B can claim; after commit the condition finds no stock. Confirm the blocker and final rows. |
| A transaction receives 40001. Can its old read be reused for the next attempt? | [Competing claims](articles/16-competing-claims.md#an-old-snapshot-can-require-a-fresh-attempt): restart the complete read/decision/write unit; external effects need separate handling. |
| A lock timeout is followed by 25P02. What must the caller do before another query? | [Lab 16](labs/16-competing-claims/README.md#bound-a-wait-and-recover): roll back the failed explicit transaction, then inspect/retry under the chosen policy. |
| A nullable column is added, then its default is set to 30. What happened to existing NULLs? | [Compatible change](articles/17-compatible-change.md): nothing; backfill historical data separately and preserve explicit choices. |
| A migration failed validation. Is a completed version record enough evidence that the new constraint exists? | [Lab 17](labs/17-compatible-change/README.md#interrupt-and-resume-the-backfill): inspect both schema and history; this lab commits the schema step and version together, so the failed step leaves neither. |
| A backfill resumes after a caller chose zero. Should it replace that value with 30? | [Lab 17](labs/17-compatible-change/README.md#interrupt-and-resume-the-backfill): no; update only missing preferences and reconcile actual values. |
| Can DROP COLUMN recover from a faulty new caller? | [Compatible change](articles/17-compatible-change.md#keep-a-usable-fallback): it destroys stored preferences; retain compatible data, and rehearse backup restoration separately. |
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
| Further query meaning | Traverse a category hierarchy that contains a cycle. | State termination and cycle policy; recursive CTEs remain planned. |
| Rules and automation | Move an eligibility check from creation to every update in a lending example. | Name all operations that can invalidate the intended rule. |
| Further transactions and concurrency | Two workflows lock the same pair of resources in opposite order. | Reproduce a deadlock, choose ordering and distinguish its retry from request replay. |
| Identity and access | Switch from workspace members to clinic staff. What changes in the identity-to-visible-row trace? | Separate authentication, grants, row policy and privileged function execution. |
| Deeper data history | Reconstruct which accounts were active at the end of an old month. | A current active flag is insufficient; historical state needs its own representation. |
| Performance and recovery | A slow query and an accidental deletion both occur. Which measurement or recovery tool answers each problem? | Use query evidence for performance; prove restoration separately from rollback. |
| Further evolution and integration | Replace and eventually remove an old field while deployed callers overlap. | Extend the additive lab to read/write transitions, removal evidence and an API recovery path. |

## Transfer problem

A library stores members, loans and fines. A loan must refer to a member; only active members may borrow; a fine number is allocated when a fine is inserted.

Explain which parts resemble the clinic labs. Identify one rule a foreign key can enforce, one that needs more than an ID reference, and one operation that needs a transaction boundary. Then describe a later update that might invalidate a rule you checked only at insertion.

Suggested answer: membership existence is an FK concern; active status needs additional modeling or enforcement; fine creation plus its table counter can share a transaction. Deactivating an existing member may violate a stronger "all current loans belong to active members" rule, depending on the chosen business policy. Do not confuse permission at borrowing time with a rule that must remain true forever.

