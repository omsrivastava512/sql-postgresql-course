# Who belongs to this workspace?

Alice edits Alpha. Bob can read Alpha and edit Beta. A single owner_id comparison cannot express this membership model, and a tenant ID supplied by the caller is not proof of membership.

By the end, enforce a membership and write-right matrix, protect the membership source, and preserve tenant-consistent relationships.

**Scope:** PostgreSQL 17 policies with dedicated database identities. This is a small access model, not a recommendation to create a database login for every website user.

## Write the access matrix first

[Lab 25](../labs/25-tenant-membership/README.md) supplies two workspaces, three tasks and these memberships:

| Role | Alpha (workspace 1) | Beta (workspace 2) | Visible task IDs |
|---|---|---|---|
| Alice | Read and write | None | 11, 12 |
| Bob | Read only | Read and write | 11, 12, 21 |
| Outsider | None | None | None |

The membership row is an authorization fact. Ordinary callers can read their own memberships but cannot insert one or change can_write. Allowing Bob to edit that flag would undermine every policy using it.

## Resolve membership through the caller

The membership table has its own SELECT policy, actor = current_user. Task visibility then checks for a matching membership:

```sql
CREATE POLICY task_read ON course_tenant.tasks FOR SELECT
USING (EXISTS (
  SELECT FROM course_tenant.memberships m
  WHERE m.workspace_id = tasks.workspace_id
    AND m.actor = current_user
));
```

The INSERT check additionally requires can_write. UPDATE applies that condition to both the existing row and its replacement; DELETE applies it to the existing row. Thus Bob sees Alpha's tasks but cannot edit them. Alice cannot move an Alpha task into Beta.

The caller needs permission to read relations used by the policy. Our grants and self-membership policy permit that narrow lookup. The membership policy does not recursively query its own table. [Policy expressions and privileges](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

## Visibility is not relationship integrity

Task 11 belongs to Alpha project 10. Beta has project 20. A foreign key on project_id alone would merely establish that project 20 exists; it would not require it to share the task's workspace.

The fixture instead references the pair:

```sql
FOREIGN KEY (workspace_id, project_id)
REFERENCES course_tenant.projects (workspace_id, id)
```

Alice's proposed task (workspace 1, project 20) satisfies membership but fails the composite foreign key. The policy checks who may write; the constraint checks whether the stored relationship is valid. Neither replaces the other. [Foreign keys](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK)

Integrity checks can reveal information through errors even when a row is hidden. Do not claim that RLS makes all database side channels impossible. Our tests establish the declared row-access and stored-relationship rules.

## Identity and revocation have boundaries

Setting a custom course.actor value to Bob does not change Alice's current_user or the policy result. The native test also verifies that Alice cannot SET ROLE to Bob. A caller-writable setting would be an unsafe source of identity if the policy trusted it without a protected upstream boundary.

[Nile's 2022 account](https://www.thenile.dev/blog/multi-tenant-rls) also reports testing requests that inherited a prior request's user ID through reused thread-local storage. That is a request-context lifecycle failure, distinct from a wrong membership predicate. Our direct database-role fixture avoids implementing that lifecycle. When evaluating an eventual pooled integration, require evidence for switching identities between requests as well as evidence for the membership matrix; the current lab does not establish that integration's safety.

Deleting Alice's workspace membership removes access in a new statement snapshot. It cannot erase rows already returned. An already established Repeatable Read transaction can still see the earlier membership until that transaction ends; the native lab demonstrates this. Strict immediate revocation needs a wider session/request design, not just an assumption about DELETE.

## One engineering connection

Michael Beardsley's [AWS article from 18 May 2020](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) demonstrates PostgreSQL tenant isolation and warns about connecting as the table owner. It also discusses per-tenant roles and application-supplied context.

Our fixture extends the question to a person belonging to several workspaces with different rights. We do not treat a custom session variable as authenticated identity or reproduce a customer's production architecture. The trusted request boundary and pooled context lifecycle remain later integration work.

## Practise and transfer

The [lab](../labs/25-tenant-membership/README.md) changes the setting to clinic branches. Alice can edit visit 101 in branch 1; Bob can only read visit 201 in branch 2. The patients and subjects are synthetic. Keep the permission source protected and test moving a visit between branches.

**Requires:** [row policies](24-row-policies.md), [EXISTS](12-query-shapes.md), [composite keys](09-row-identity.md), [snapshots](16-competing-claims.md).
**Next:** [Whose permissions does this helper use?](26-privileged-code.md).
**Return:** what breaks if the tenant field is valid but the referenced project belongs somewhere else?
