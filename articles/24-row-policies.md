# Which rows may this role change?

Alice can read the documents table. Without a row policy, that grant also lets her read Bob's document. Omitting a WHERE clause should not turn a personal document list into everybody's list.

At Nile, repeated tenant filters became difficult to maintain, prompting a move to RLS. Their [implementation account](https://www.thenile.dev/blog/multi-tenant-rls) also describes a deployment that used the wrong database role: the connection bypassed the policies they meant to test. Our document fixture lets you check the policy and the connection identity separately before adding workspace membership.

**Scope:** PostgreSQL 17 row-level security (RLS) using actual database roles. An owner or superuser query is not evidence of an ordinary user's access.

## Begin with three documents

[Lab 24](../labs/24-row-policies/README.md) starts with Alice's draft 1, Bob's draft 2 and Alice's archived document 3. Both roles have ordinary table privileges. Before RLS, Alice sees all three.

```sql
ALTER TABLE course_policy.documents ENABLE ROW LEVEL SECURITY;
```

With no applicable policies, Alice now sees no rows. An attempted insert fails. This default deny is separate from the table grants: removing SELECT still prevents the query even if a row policy would allow it.

For every test below, record current_user alongside the result and compare an allowed request with a denied one. “It returned my document” is incomplete evidence if the same connection also returns Bob's. This is the operational reason to keep the identity check from the previous lesson, even when the SQL appears unchanged.

## Separate the old row from its replacement

```sql
CREATE POLICY document_read ON course_policy.documents
FOR SELECT TO course_policy_alice, course_policy_bob
USING (owner_role = current_user);

CREATE POLICY document_update ON course_policy.documents
FOR UPDATE TO course_policy_alice, course_policy_bob
USING (owner_role = current_user)
WITH CHECK (owner_role = current_user);
```

USING selects existing rows the operation may act on. WITH CHECK tests the proposed new row. Alice can update document 1's title. Trying to update hidden document 2 changes zero rows; changing document 1's owner to Bob fails with a policy error.

For UPDATE or ALL policies, an omitted WITH CHECK uses the USING expression as its check. The lab executes that fallback before introducing explicit clauses. Writing both makes the two responsibilities visible; omission does not automatically permit reassignment. [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html)

SELECT policies also matter for updates that read columns or return rows. Our UPDATE ... WHERE id ... RETURNING id examples require the appropriate SELECT privileges and policy. Avoid diagnosing every zero-row update as “the ID does not exist.” It may not be visible or modifiable to this role.

## Give each command its contract

| Operation | Contract in this fixture | Alice's observation |
|---|---|---|
| SELECT | Own documents | IDs 1 and 3 |
| INSERT | New owner must be the caller | Own insert succeeds; Bob-owned insert fails |
| UPDATE | Existing and resulting owner must be the caller | Own title changes; owner reassignment fails |
| DELETE | Own and not archived | New draft can be deleted; IDs 2 and 3 remain |

The table-level UPDATE grant alone does not enforce this matrix. Neither does putting a user ID into a query parameter. The row policy is the additional database check for the execution identity used here.

## A second policy can widen access

Ordinary permissive policies combine with OR. Adding a SELECT policy with USING(true) exposes all three documents despite the original ownership condition. Remove it and retest.

A restrictive policy combines with AND and needs an applicable permissive policy to grant anything. The lab adds a restrictive no-archives read condition: Alice's IDs 1 and 3 become only 1. A restrictive policy alone is not an allow rule. [RLS reference](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

RLS does not govern every operation: TRUNCATE is controlled by its own privilege. Owners normally bypass policies; superusers and BYPASSRLS roles bypass them. The later [privileged-code lesson](26-privileged-code.md) makes those exceptions observable. Setting row_security to off is not an ordinary user's escape hatch; it can make a policy-affected query error instead.

## Practise and transfer

Apply recipient ownership to messages 10 and 20 in the [lab](../labs/24-row-policies/README.md). Preserve allowed edits and reject reassignment. Keep the full allowed/denied matrix and inspect state after failures.

**Requires:** [database roles and grants](23-database-roles.md).
**Next:** [Who belongs to this workspace?](25-tenant-membership.md).
**Return:** why are zero affected rows and a rejected proposed row different observations?
