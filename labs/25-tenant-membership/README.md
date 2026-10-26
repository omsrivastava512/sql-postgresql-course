# Lab 25 — Membership is an authorization fact

Read [the article](../../articles/25-tenant-membership.md), then run [setup.sql](setup.sql) in the [disposable local cluster](../README.md#access-control-labs). It resets course_tenant, creates three course_tenant_ roles, grants bounded operations and enables RLS with no initial policies. Restricted reads initially return no rows.

## Inspect the facts as administrator

Alpha workspace 1 has project 10 and tasks 11/12. Beta workspace 2 has project 20 and task 21. Alice can read/write Alpha. Bob can read Alpha and read/write Beta. Outsider belongs to neither.

Record the actual database role separately from the workspace selected by a query. None of these callers may change the membership table.

## Build visibility before writes

Start with the article's task-read example. Add a self-membership SELECT policy so the policy's lookup is both permitted and bounded. Add workspace/project visibility using the same membership condition.

Predict and check exact task IDs: Alice 11/12; Bob 11/12/21; outsider none. Alice must see only her own membership row. The membership policy should not recursively query memberships to decide whether its own row is visible.

## Add write rights

INSERT requires a matching membership with can_write. UPDATE checks this for both the existing and proposed workspace. DELETE checks it for the existing workspace.

| Attempt | Expected result |
|---|---|
| Alice inserts task 13 in workspace 1/project 10 | Success |
| Alice inserts a task in workspace 2/project 20 | Policy error 42501 |
| Alice moves task 11 to workspace 2/project 20 | 42501; original pair preserved |
| Bob edits task 11 in read-only Alpha | Zero returned rows |
| Bob inserts a task in Alpha | 42501 |
| Bob edits task 21 in Beta | Success |
| Outsider reads tasks | Empty set |
| Outsider inserts into Alpha | 42501 |
| Alice adds a membership or Bob edits can_write | Permission denied |

Query with RETURNING id for writes and inspect the forbidden target as administrator afterward. Do not merely count successful calls.

## A valid tenant can still have the wrong parent

As Alice, insert a task with workspace_id 1 and project_id 20. Membership passes, but the pair is invalid and the composite FK rejects it with 23503. Confirm no task was stored.

Explain why a project-only FK would miss this mismatch. This experiment distinguishes relation integrity from access control; it is not a promise that constraint errors disclose no hidden information.

## Attempt to substitute an identity

As Alice, SET course.actor = 'course_tenant_bob'; and repeat the read. Results stay within Alpha because policies use current_user, not that caller-writable setting. RESET course.actor afterward.

The real-login checker additionally requires SET ROLE course_tenant_bob to fail. The administrator's ability to switch roles during a guided exercise does not belong to the restricted caller.

## Revoke membership with a snapshot still open

Use two persistent connections to the disposable cluster, both opened as its administrator. Call them A (the learner) and B (the administrator). End earlier transactions and RESET ROLE in both, then run setup.sql and solution.sql in B. Never reset while another session's transaction is open.

Setup creates Alice as NOLOGIN, so this guided exercise does not ask you to log in as Alice or change her credentials. In A, switch the effective role and inspect the identities:

```sql
SET ROLE course_tenant_alice;
SELECT session_user, current_user;
```

session_user remains the administrator; current_user is course_tenant_alice, which the policies use. Finish that execution before starting the next block. Sending the identity query and BEGIN ISOLATION LEVEL together as one multi-statement request can establish an implicit transaction before the isolation change and fail with 25001. If that happens, ROLLBACK and repeat the two blocks separately.

Now establish the snapshot in A:

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT id FROM course_tenant.tasks ORDER BY id;
```

The task read returns 11 and 12 and establishes the snapshot. Keep A's transaction open.

In B, revoke the membership and commit:

```sql
BEGIN;
DELETE FROM course_tenant.memberships
WHERE workspace_id = 1 AND actor = 'course_tenant_alice';
COMMIT;
```

Return to A. Predict the two query results before running:

```sql
SELECT id FROM course_tenant.tasks ORDER BY id;
COMMIT;
SELECT id FROM course_tenant.tasks ORDER BY id;
```

The first still returns 11 and 12: the membership lookup sees the old snapshot. The second returns no tasks because the transaction ended and the new statement sees the committed revocation. SET ROLE remains active across COMMIT. Now run this separately in A, outside an explicit transaction:

```sql
INSERT INTO course_tenant.tasks (id, workspace_id, project_id, title)
VALUES (13, 1, 10, 'After revocation');
```

Expect 42501 and no inserted task. In B, confirm that tasks 11, 12 and 21 are unchanged and no Alice membership remains. Finish A with RESET ROLE.

These two administrator-controlled connections demonstrate snapshot behaviour under Alice's effective role. They do not prove login isolation: their administrator session identity can switch roles. The existing node tests/verify-access.mjs --lab=25 checker separately tests actual restricted logins, prohibited role switches and the snapshot sequence; its temporary credentials are not needed for this guided exercise.

This is a demonstrated limit of the chosen snapshot model, not an instruction to keep long transactions open. Revocation cannot retrieve information already returned. For a stricter requirement, identify the additional request/session control needed.

## Independent clinic transfer

branch_staff grants Alice edit rights in branch 1 and Bob read-only rights in branch 2. visits contains 101 in branch 1 and 201 in branch 2. Write the policies without copying task IDs. Alice may edit 101 but not move it into branch 2; Bob may read but not edit 201; outsider sees neither. Keep membership writes forbidden.

Hint: “can read the row” and “can change the row” need not have the same condition. [solution.sql](solution.sql) provides the complete reference after your attempt.

## Deliver and clean up

Keep the access matrix, exact results, rejected writes, original values and snapshot trace. Run node tests/verify-access.mjs --lab=25 for actual-login evidence. The ordinary checker covers role-switched statements; it cannot establish the snapshot experiment by itself.

End transactions, close clients and run [cleanup.sql](cleanup.sql) as administrator. It removes only this schema and three named roles. Record learner time/help only after an attempt.

Return later: what must be trusted before a session variable may safely represent an authenticated application's user?
