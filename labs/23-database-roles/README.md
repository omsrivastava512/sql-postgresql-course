# Lab 23 — Grant a task, then test its limits

Read [the article](../../articles/23-database-roles.md). Run [setup.sql](setup.sql) as the administrator of a disposable local PostgreSQL cluster, using the [shared guide](../README.md#access-control-labs). It resets course_priv and creates three cluster-wide NOLOGIN roles with the course_priv_ prefix if absent. It does not replace an existing role's attributes or memberships. Use these names only for this lab; use a fresh cluster if they already belong to other work.

Run statements separately. End a failed transaction with ROLLBACK before continuing. Every SET ROLE section ends with RESET ROLE in that same connection.

## Inspect before granting

As administrator, inspect profiles, tickets, deliveries and pg_roles. Record current_user/session_user, ownership, memberships and existing grants. The reader's profile says admin; the writer's says staff. Ticket IDs are 1 and 2.

```sql
SET ROLE course_priv_reader;
SELECT session_user, current_user;
SELECT id, subject FROM course_priv.tickets;
RESET ROLE;
```

The query is denied. Grant schema USAGE as administrator and repeat: it is still denied without a table/column grant. Grant SELECT on profiles and read the reader's admin label. Confirm that this value still does not authorize the ticket query.

## Repair the access contract

Implement these requirements before opening [solution.sql](solution.sql):

| Role | Allow | Keep forbidden |
|---|---|---|
| Reader | Read profiles and ticket ID/subject | Read internal_note, insert, update or delete tickets |
| Writer | Read profiles and tickets; insert a ticket; update subject | Update internal_note; delete or truncate tickets |

The article supplies the reader's grant pattern. For the writer, first grant table INSERT without sequence USAGE and attempt an insert using the default ID. Expect 42501 and no added ticket. Then grant USAGE on tickets_id_seq and retry successfully. Do not infer a business numbering guarantee from a sequence value.

As the reader, SELECT id, subject returns both original tickets; SELECT * fails. As the writer, change ticket 1's subject to Resolved. A forbidden internal_note update must leave Customer called twice unchanged. Inspect state as administrator after each rejection.

## Revoke and retest

Revoke the reader's SELECT(id, subject) grant as administrator. On the same reader connection, a new query fails. If it does not, inspect alternate grants and inherited memberships rather than assuming REVOKE is broken.

RESET ROLE in an administrator-controlled session returns to the administrator. This exercise is convenient for learning, but is not a login-isolation test. The native checker uses separately authenticated restricted connections and rejects attempted switches to stronger roles.

## Independent transfer

course_priv_dispatch must read delivery id, tracking and status, update status, and neither read private_address nor change tracking. Delivery 10 begins queued and delivery 20 begins sent. Implement the grant set, change delivery 10 to sent, and verify the forbidden operations fail without changing the address/tracking facts.

Hint: schema access, column reads and column updates are separate permissions. A broad table grant can make a narrower column restriction ineffective.

## Evidence and cleanup

Deliver your grant matrix, actual role identifiers, allowed results, SQLSTATEs and unchanged forbidden fields. The solution contains only grants; execute it after fresh setup. Setup twice must restore the original rows and object grants.

The ordinary reference suite checks role-switched SQL. For real login evidence run node tests/verify-access.mjs --lab=23 using the administrator URL and password-authenticated local host configuration described in the shared guide. No hosted authentication claim follows from this test.

When finished, close restricted clients and run [cleanup.sql](cleanup.sql) as administrator. It removes only this lab's schema and named roles. Roles are cluster-wide; the script will fail rather than cascade away unrelated role dependencies.

Return later: which permission would you inspect when INSERT is allowed but the serial default fails?
