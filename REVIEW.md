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
| A count query emits one row. Did its scan examine one row? | [Plans](articles/18-query-plans.md): inspect child nodes and loops; output grain does not establish consumed work. |
| A sequential scan remains after adding an index. Is that necessarily a defect? | [Plans](articles/18-query-plans.md#test-the-counterexample): a broad query can reasonably read the table sequentially; measure the actual workload. |
| INCLUDE covers every selected column. Must heap fetches be zero? | [Index decisions](articles/19-index-decisions.md#match-filtering-and-ordering): visibility can still require heap access; inspect the observed plan. |
| A partial unique index permits many inactive subscriptions. What does it guarantee about active ones? | [Lab 19](labs/19-index-decisions/README.md#an-index-can-enforce-a-scoped-rule): at most one per customer, not that one exists. |
| A cursor stores only a timestamp shared by three events. What can the next page lose? | [Deep pages](articles/20-deep-pages.md#keep-ties-then-change-the-direction): remaining ties; retain the unique tie-breaker and matching comparison direction. |
| The indexed SELECT got faster. What belongs in the decision before keeping the index? | [Index decisions](articles/19-index-decisions.md#pay-for-the-index): equal results, broader reads, repeated observations, write work and storage cost. |
| ANALYZE corrected the estimate. Has it cleaned every old row version? | [Maintenance](articles/21-statistics-maintenance.md#cleanup-answers-another-question): statistics and eligible-version cleanup serve different purposes. |
| DELETE committed but an old snapshot still reads those rows. Can vacuum discard all their versions? | [Lab 21](labs/21-statistics-maintenance/README.md#cleanup-with-an-old-snapshot): retain needed versions; compare the vacuum report after that snapshot ends. |
| One query takes little time, but a page calls it once per customer. What is missing from that measurement? | [Request work](articles/22-request-work.md): total calls, row volume and end-to-end operation duration. |
| A pool has a pending checkout while its one backend is idle. Is PostgreSQL necessarily blocking a SQL statement? | [Lab 22](labs/22-request-work/README.md#observe-a-connection-wait): the caller can be waiting before SQL reaches the server; distinguish pool occupancy from a lock wait. |
| The profile says admin but the ticket query is denied. Which role controls the database check? | [Database roles](articles/23-database-roles.md): inspect current_user and grants; a stored application label grants nothing by itself. |
| INSERT is granted but the serial default is denied. What else is involved? | [Lab 23](labs/23-database-roles/README.md#repair-the-access-contract): sequence use is a separate privilege in this fixture. |
| An ALL policy has USING(owner_role = current_user) and no WITH CHECK. Can the caller automatically reassign ownership? | [Row policies](articles/24-row-policies.md#separate-the-old-row-from-its-replacement): no; the omitted check uses USING. Test the actual policy and command. |
| An ownership policy exists. Why can a second SELECT policy expose other people's rows? | [Lab 24](labs/24-row-policies/README.md#break-a-policy-combination): permissive policies combine with OR; inspect the whole applicable set. |
| Bob can read Alpha but cannot edit it. What must he also be forbidden to change? | [Membership](articles/25-tenant-membership.md): the can_write authorization fact and who belongs to the workspace. |
| Alice may write workspace 1. Does that make its task's reference to workspace 2's project valid? | [Lab 25](labs/25-tenant-membership/README.md#a-valid-tenant-can-still-have-the-wrong-parent): no; the composite FK checks the workspace/project pair separately. |
| Membership was deleted. Why can an already established Repeatable Read transaction still see its tasks? | [Lab 25](labs/25-tenant-membership/README.md#revoke-membership-with-a-snapshot-still-open): it retains the old snapshot; retest after the transaction ends. |
| SECURITY DEFINER returns zero rows for one owner and all rows for another. Is the keyword alone a bypass guarantee? | [Privileged code](articles/26-privileged-code.md#follow-the-execution-identity): inspect ownership, grants and BYPASSRLS; FORCE does not constrain a superuser. |
| A helper explicitly names only a trusted schema in search_path. Can a temporary relation still mask its unqualified table? | [Lab 26](labs/26-privileged-code/README.md#reproduce-name-shadowing): yes; pg_temp is implicitly searched first for relation names unless positioned explicitly. |
| Alice can SELECT the invoker view but lacks its base-table SELECT. Should the read succeed? | [Privileged code](articles/26-privileged-code.md#keep-ordinary-reads-with-the-caller): no; the invoker's underlying privileges and policies still apply. |
| A note refers to profile 2. Profile 2 exists but is a receptionist. What does a plain FK know? | [Foreign keys](articles/01-foreign-keys.md): it knows the referenced key exists, not whether the role is appropriate. |
| The patient trigger accepted an admin yesterday. Today that profile is changed to receptionist. Does writing profiles rerun the patient trigger? | [Business rules](articles/02-business-rules.md): no; enforcement must cover the operations that can violate the rule. |
| A note INSERT supplied owner 2 but stored owner 1. Where could the change have happened? | [Derived values](articles/03-derived-values.md): its BEFORE trigger assigns NEW.owner_id before storage. |
| You delete a parent with a referencing row under NO ACTION. What changes when the statement fails? | [Deletion](articles/04-deleting-related-rows.md): the failed statement's deletion is rolled back; the existing rows remain. |
| A deferred transaction deletes a parent and never repairs the reference. What happens at COMMIT? | [Deferred checks](articles/05-deferred-checks.md): commit fails; the transaction cannot persist the broken reference. |
| A failed invoice increments an ordinary table counter in its trigger. Does that increment survive the failed statement? | [Transactions](articles/06-transaction-boundaries.md): no, it shares the statement's transaction. |
| A visit was committed yesterday. Today's invoice transaction fails. Does yesterday's visit disappear? | [Transactions](articles/06-transaction-boundaries.md): no, it lies outside today's transaction. |
| The request times out after commit. Is a rollback guaranteed? | [Transactions](articles/06-transaction-boundaries.md): no; response delivery does not determine committed state. |

## Revisit the catalog

| When | Try from memory | Check your reasoning |
|---|---|---|
| Next session | Tea and biscuits both weigh 50 g. Which single-column key does that disprove, and what business promise makes the two-column key work? | [Lab 27](labs/27-product-variants/README.md#choose-the-keys-and-repair-the-rows) |
| About a week later | Two stores use code 17 and only one has the tea. Draw the rows a report needs to distinguish a missing offer from zero stock. | [Lab 28](labs/28-store-offers/README.md#distinguish-no-stock-from-no-listing) |
| About a month later | East raises its workshop fee after a booking. Design the write and the two reads that show which fee changed. Try it before looking at the hints. | [Independent brief](labs/29-order-snapshots/README.md#independent-transfer) |

## Revisit reliable writes

| When | Predict before reading the answer | Check |
|---|---|---|
| Next session | North's price went from ₹20 to ₹22 and back to ₹20. Should an editor still holding revision 1 be allowed to save? | [Check the revision](articles/30-conflicting-edits.md#what-did-the-editor-see) |
| About a week later | If a reverse transfer locks bin 1 first, which bin should it debit? | [Separate lock order from movement](articles/31-lock-order.md#find-the-order-hidden-in-the-data) |
| About a month later | Two calls have the same store, SKU and quantity. Which fact distinguishes a retry from a second purchase? | [Recover a booking](labs/32-request-replay/README.md#independent-transfer) |

## Revisit authenticated access

| When | Predict before reading the answer | Check |
|---|---|---|
| Next session | Alice's sign-in works but her profile is missing. Which existing fact could still let her see North? | [Three independent facts](articles/33-request-identity.md#three-records-three-independent-facts) |
| About a week later | A PATCH returns an empty array. What distinguishes a hidden target from a rejected new row, and how would you check stored state? | [Write boundary](labs/34-authorized-requests/README.md#predict-the-write-boundary) |
| About a month later | A booking was accepted before placement permission was removed. Which operation can recover it, and why does another person's same-text key not help? | [Workshop transfer](labs/35-authorized-replay/README.md#independent-transfer) |

These are draft learning tasks. Their SQL mechanisms have bounded execution evidence; live requests and unaided reader attempts remain pending.

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
| Further transactions and concurrency | An expected row error interrupts a batch in an explicit transaction. Which changes could survive recovery to a savepoint? | Identify the savepoint and trace only the writes after it. |
| Authenticated application access | A browser and SQL editor return different rows for the same query. Which identities and access paths must be traced? | Verify the token/request boundary, execution role, grants, policies and any privileged helper; local database-role tests alone do not establish this integration. |
| Deeper data history | Reconstruct which accounts were active at the end of an old month. | A current active flag is insufficient; historical state needs its own representation. |
| Further performance and recovery | Production latency rises while local plans look similar, and an accidental deletion also occurs. Which evidence answers each problem? | Investigate deployed workload/connection timing; prove fresh-target restoration separately from rollback. |
| Further evolution and integration | Replace and eventually remove an old field while deployed callers overlap. | Extend the additive lab to read/write transitions, removal evidence and an API recovery path. |

## Transfer problem

A library stores members, loans and fines. A loan must refer to a member; only active members may borrow; a fine number is allocated when a fine is inserted.

Explain which parts resemble the clinic labs. Identify one rule a foreign key can enforce, one that needs more than an ID reference, and one operation that needs a transaction boundary. Then describe a later update that might invalidate a rule you checked only at insertion.

Suggested answer: membership existence is an FK concern; active status needs additional modeling or enforcement; fine creation plus its table counter can share a transaction. Deactivating an existing member may violate a stronger "all current loans belong to active members" rule, depending on the chosen business policy. Do not confuse permission at borrowing time with a rule that must remain true forever.

