# Lab 26 — Audit the path through a helper

Read [the article](../../articles/26-privileged-code.md), then run [setup.sql](setup.sql) in the [disposable local cluster](../README.md#access-control-labs). It resets course_code and creates five named course_code_ roles. Its view and functions intentionally expose unsafe starting behaviour. Do not install this starting fixture in a shared application or an exposed hosted schema.

## Inspect owners and execution mode

Record table/view owners in pg_class, function owners/prosecdef/proconfig in pg_proc, role attributes in pg_roles and execution grants. owner and worker are non-superuser NOLOGIN roles without BYPASSRLS; neither is granted to Alice or Bob.

As Alice, compare direct document IDs, document_list, document_count() and worker_count(). Expect [1], [1,2], 2 and 0. As Bob, the direct read gives [2]. Explain each owner/permission path before changing it.

As outsider, call document_count(). It returns 2 through default PUBLIC function execution despite outsider lacking document SELECT. A function's EXECUTE grant and its internal table privileges are separate checks.

## Make the owner obey a policy

As administrator, ALTER TABLE course_code.documents FORCE ROW LEVEL SECURITY; then SET ROLE course_code_owner and query the table. Expect no rows, because neither document names this owner role. RESET ROLE and read as the superuser administrator: both rows remain visible.

Restore NO FORCE ROW LEVEL SECURITY after the comparison. Explain why FORCE changes the ordinary owner's result but is not a superuser restriction. Do not grant Alice ownership as a way to make her query work.

## Reproduce name shadowing

In Alice's session, before first calling label_for:

```sql
CREATE TEMP TABLE labels (code integer, label text);
INSERT INTO labels VALUES (1, 'Fake label');
GRANT SELECT ON labels TO course_code_worker;
SELECT course_code.label_for(1);
```

Expect Fake label rather than the trusted Queued. The explicit temporary-table grant lets the function owner read the substituted relation. Without it, permission denial could hide the name-resolution problem.

The function currently sets search_path only to course_code. Explain why the implicit temporary-schema lookup still comes first. Do not change the trusted real labels table.

## Repair the access paths

Make document_list a security-invoker view and document_count an invoker function. Set the lookup function path to pg_catalog, course_code, pg_temp. Revoke PUBLIC EXECUTE, and grant the intended callers explicitly. Use one transaction for the function/grant change.

Rerun from the same Alice session while the temporary table still exists. The label must now be Queued. Alice/Bob each get only their one document and a count of 1; outsider's helper calls fail. Unknown label code 999 returns NULL under this lookup's stated contract.

Check that Alice still cannot read the private labels table or create an object in course_code. Revoke her base document SELECT as administrator; her invoker view/function reads must fail too. Restore/reset before further comparisons.

## Independent delivery lookup

Implement delivery_label_for(integer) using the existing worker's SELECT on delivery_labels. Return Collected for 5, Delivered for 6 and NULL for an unknown code. Alice/Bob may call it; outsider may not; no caller gets direct table SELECT.

Use a qualified relation and a safe path. Explain why this fixed label lookup needs neither document ownership nor user impersonation. A user-specific privileged operation would need its own trustworthy identity and authorization design.

Hint: there are three questions—who can call the helper, whose permissions run its statements, and which objects those names resolve to. [solution.sql](solution.sql) supplies the reference after your attempt.

## Evidence and cleanup

Deliver the before/after access table, owners, function settings, grants, temporary-table result and denied operations. Run node tests/verify-access.mjs --lab=26 for independent restricted-login checks; the ordinary suite also executes the controlled comparisons.

Drop Alice's temporary table or close her connection. End transactions and run [cleanup.sql](cleanup.sql) as administrator after closing restricted clients. It removes this schema and the five named roles; it does not cascade through unrelated role dependencies. Record actual learner effort/help separately.

Return later: what evidence would justify a privileged helper instead of turning an ordinary query into SECURITY DEFINER?
