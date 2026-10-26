# Whose permissions does this helper use?

Alice's direct query returns one document. A convenient view returns two. A count function also reports two. The base table still has its policy; the access path changed whose permissions apply.

By the end, inspect owners and execution modes, repair a view/function exposure, and constrain a deliberately privileged lookup.

**Scope:** PostgreSQL 17 views and functions in a disposable security lab. The starting helpers are intentionally unsafe so the difference can be observed; they are not deployment examples.

## Follow the execution identity

[Lab 26](../labs/26-privileged-code/README.md) contains Alice's document 1 and Bob's document 2. The table belongs to course_code_owner, an ordinary non-superuser role. A policy selects owner_role = current_user.

| Access path as Alice | Starting result | Why |
|---|---|---|
| Direct table read | ID 1 | Alice's privileges and row policy |
| Owner's ordinary view | IDs 1 and 2 | Underlying access uses the view owner, which normally bypasses its table's RLS |
| Owner's SECURITY DEFINER count | 2 | Function executes with its owner's privileges |
| Worker's SECURITY DEFINER count | 0 | Worker has SELECT but neither ownership nor BYPASSRLS, and owns no document rows |

SECURITY DEFINER therefore does not inherently bypass RLS. The function owner and its privileges determine the result. FORCE ROW LEVEL SECURITY makes the ordinary table owner subject to policies; it does not make superusers or BYPASSRLS roles obey them. The lab compares those cases.

## Keep ordinary reads with the caller

```sql
ALTER VIEW course_code.document_list SET (security_invoker = true);
ALTER FUNCTION course_code.document_count() SECURITY INVOKER;
```

Alice now sees one row/count and Bob sees the other. Revoking Alice's underlying table SELECT makes these reads fail: permission on the invoker view is not enough by itself.

A default view is not literally a security-definer function. For example, CURRENT_USER directly in a view still identifies the caller, while underlying relation permissions normally use the view owner. Inspect the actual rule instead of treating every convenience object alike. [CREATE VIEW](https://www.postgresql.org/docs/17/sql-createview.html)

## A narrow privileged lookup

The private labels table maps 1 to Queued and 2 to Sent. Callers may obtain a label through a function but do not receive direct table access. The function belongs to course_code_worker, which has SELECT on the lookup tables and no role-management powers.

The intentionally unsafe label_for uses an unqualified labels name with search_path = course_code. Alice creates a temporary labels table containing Fake label, grants the worker SELECT on that temporary table, and calls the function. It returns the fake value: omitting pg_temp from the explicit path did not exclude it.

```sql
ALTER FUNCTION course_code.label_for(integer)
SET search_path = pg_catalog, course_code, pg_temp;
```

With trusted schemas first and pg_temp last, the same call returns Queued despite the temporary table. The transfer function also qualifies its relation name. Callers cannot CREATE objects in course_code. Search-path control, trusted schema ownership and narrow privileges all matter. [Safe definer functions](https://www.postgresql.org/docs/17/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

## Control who may call it

New functions normally grant EXECUTE to PUBLIC. The starting outsider can call the owner's broad count even without table SELECT. The solution revokes PUBLIC execution and grants only the named intended callers, in the same transaction as its changes.

Revoking PUBLIC execution is separate from row policies and schema exposure. A helper with a fixed allowed purpose may intentionally use extra privileges; adding SECURITY DEFINER merely to silence a permission error is not a justification. If its purpose varies by application user, it needs a trustworthy caller identity and an explicit authorization check. This constant-label exercise does not implement that request boundary.

## Practise and transfer

The [lab](../labs/26-privileged-code/README.md) asks you to expose a delivery status lookup: code 5 returns Collected, 6 returns Delivered, unknown codes return NULL. Protect its underlying table, execution grant and name resolution. Explain why that lookup does not need the owner's authority over documents.

**Requires:** [roles](23-database-roles.md), [RLS](24-row-policies.md), [views](14-reusable-reports.md), and reading a supplied SQL/PL/pgSQL function from the [onramp](00-reading-the-examples.md).
**Revisited in:** [planned authenticated API work](../COURSE_MAP.md#the-wider-course).
**Return:** why might a direct table test pass while a view or helper exposes more data?
