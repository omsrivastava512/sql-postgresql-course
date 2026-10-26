# Lab 24 — Test old rows and proposed rows

Read [the article](../../articles/24-row-policies.md), then run [setup.sql](setup.sql) in the disposable local cluster described in the [shared guide](../README.md#access-control-labs). It resets course_policy and creates the two course_policy_ roles. Setup intentionally grants table access before adding RLS so its effect is observable.

## Predict default deny

As course_policy_alice, SELECT id FROM course_policy.documents ORDER BY id returns 1, 2, 3. Reset to administrator, enable RLS with no policies, then switch back. Expect no rows. An insert for Alice also fails with 42501.

Add one ALL policy with only USING(owner_role = current_user), targeting both fixture roles. Alice now sees 1 and 3. Try reassigning document 1 to Bob. It fails: omitted WITH CHECK uses USING for this ALL policy. Inspect the owner afterward.

Reset before building the explicit per-command solution.

## Implement the full matrix

The article supplies read/update examples. Independently supply INSERT and DELETE policies, then run every row below as the stated caller. Use RETURNING id for writes so a zero-row operation is visible.

| Caller and action | Expected outcome |
|---|---|
| Alice reads documents | IDs 1, 3 |
| Bob reads documents | ID 2 |
| Alice inserts ID 4 owned by Alice | ID 4 returned |
| Alice inserts ID 5 owned by Bob | 42501; no ID 5 |
| Alice changes document 1's title | ID 1 returned; title changed |
| Alice updates or deletes Bob's ID 2 | Zero rows; Bob's document unchanged |
| Alice changes ID 1's owner to Bob | 42501; owner unchanged |
| Alice deletes archived ID 3 | Zero rows; archive preserved |
| Alice deletes her new ID 4 | ID 4 returned; row gone |

For DELETE, the rule is own AND not archived. It does not prohibit every other modification of an archived row. State that boundary instead of silently inventing an immutability rule.

## Break a policy combination

As administrator, add a second permissive SELECT policy USING(true). Alice now sees every remaining document. Remove that policy and check isolation again.

Add an AS RESTRICTIVE FOR SELECT policy USING(NOT archived). Alice's visible set becomes only ID 1. Explain how permissive OR and restrictive AND differ, and why a restrictive policy needs an applicable permissive policy.

Revoke Alice's table SELECT and repeat the read. A row policy cannot replace the missing ordinary privilege. Restore/reset when finished with this comparison.

## Independent message transfer

Apply recipient ownership to messages: Alice may read/edit message 10; Bob may read/edit message 20. Each may create only a message naming themselves and cannot reassign an existing message to the other role. Explain the USING and WITH CHECK responsibilities before testing.

Hint: an ownership predicate is evaluated against different row versions for existing-row selection and proposed-row checks. [solution.sql](solution.sql) supplies the reference after your attempt.

## Prove the boundary, then clean up

Test actual restricted logins with node tests/verify-access.mjs --lab=24. It also requires attempts to disable RLS, truncate the table and switch to Bob to fail. Setting row_security = off must not expose hidden rows; reset that setting after the expected error.

The owner/admin can inspect all stored facts to check failed changes. Do not present that administrative read as proof of what Alice may see. Deliver the role/operation matrix, exact returned IDs, errors and unchanged rows.

Close clients and run [cleanup.sql](cleanup.sql) as administrator. It removes this schema and the two named roles only. Record real learner effort/help after attempting the work.

Return later: why might the UPDATE policy look correct while a second SELECT policy makes the overall design too broad?
