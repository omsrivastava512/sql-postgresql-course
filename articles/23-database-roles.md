# I connected successfully. Why is this query denied?

The support reader has an application profile whose app_role says admin. PostgreSQL still rejects the reader's query. A value in a table and the identity executing SQL are different things.

By the end, identify the execution role, grant only the operations a task needs, and test what remains forbidden.

**Scope:** PostgreSQL 17 roles and privileges. These labs use database identities directly. Website login, JWT validation and Supabase request identity are later integration work.

## Identify who is asking

Authentication establishes an identity at a boundary; authorization decides what that identity may do. A successful database login does not imply permission to read every table.

```sql
SELECT session_user, current_user;
```

In our ordinary fresh connection, both identify the login role. An authorized SET ROLE changes current_user for privilege checks. In the lab's administrator session, SET ROLE course_priv_reader permits a controlled comparison, but RESET ROLE returns to the administrator. Giving that administrator connection to an application would defeat the test's intended boundary.

The separate native checker therefore also logs in as each restricted role. It requires a wrong password to fail and verifies that the reader cannot switch to the writer or administrator. [SET ROLE reference](https://www.postgresql.org/docs/17/sql-set-role.html)

## A profile is data

[Lab 23](../labs/23-database-roles/README.md) contains:

| Database role | Application profile value | Required ticket access |
|---|---|---|
| course_priv_reader | admin | Read ID and subject only |
| course_priv_writer | staff | Read tickets, insert one, update its subject |

The deliberately surprising labels expose the distinction. Neither string causes PostgreSQL to grant a privilege. An application could interpret app_role, but then that interpretation and who can change the value need their own authorization design.

## Grant the required operation

Schema USAGE permits resolving objects in that schema; it is not table SELECT permission or schema CREATE permission. Column grants can make a narrower read possible:

```sql
GRANT USAGE ON SCHEMA course_priv TO course_priv_reader;
GRANT SELECT (id, subject) ON course_priv.tickets TO course_priv_reader;
```

As the reader, selecting id and subject returns tickets 1 and 2. SELECT * still fails because internal_note was not granted. That failure is useful feedback, not a reason to grant everything.

The writer receives UPDATE(subject), not UPDATE on every column. Changing the subject succeeds; changing internal_note fails and preserves the original note. DELETE and TRUNCATE remain forbidden.

The fixture deliberately uses serial so its default calls a separate sequence. Table INSERT alone does not authorize using that sequence. Grant its required USAGE and repeat the insert. This is a serial/sequence experiment, not a claim that every generated-key mechanism has identical permission checks. [Privileges](https://www.postgresql.org/docs/17/ddl-priv.html)

## Test the boundary in both directions

For each role, write down allowed and denied operations, run both, then inspect the resulting rows. A denied operation must not leave the forbidden change behind. Revoke the reader's column grant and confirm a new query on the same connection fails.

Ownership, inherited role memberships and PUBLIC grants can provide permissions through other paths. Inspect them before concluding a REVOKE removed all access. PUBLIC means every role, not the schema named public. These fixtures start with dedicated roles without inherited memberships.

Column grants do not distinguish Alice's row from Bob's row. A reader with SELECT(subject) can read that column on every ticket unless another mechanism narrows the rows. That is the next lesson's question.

## Practise and transfer

The [lab](../labs/23-database-roles/README.md) asks you to grant a dispatcher access to tracking/status, and permission to update status, while protecting the address and tracking value from unauthorized changes.

**Requires:** [stored values](07-stored-values.md), [selected reads/writes](08-selecting-rows.md).
**Next:** [Which rows may this role change?](24-row-policies.md).
**Return:** why can a profile say admin while SELECT * is correctly rejected?
