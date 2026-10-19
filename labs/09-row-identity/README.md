# Lab 09 — Choose the duplicate boundary

Read [the article](../../articles/09-row-identity.md). Run [setup.sql](setup.sql), which resets only course_identity. Use the [lab guide](../README.md) for an environment. Run intentional failures separately outside an explicit transaction. Reset when directed so a previous failed insert does not confuse an ID prediction.

## Inspect the keys

Run SELECT * FROM course_identity.memberships ORDER BY workspace_id, member_id;. Explain why member 1 appears twice. Then inspect the declarations:

```sql
SELECT conrelid::regclass::text AS table_name, conname,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'course_identity'::regnamespace
  AND contype IN ('p', 'u', 'f')
ORDER BY table_name, conname;
```

This PostgreSQL catalog query displays primary, unique and foreign-key definitions. You need to read the membership rules, not memorize the catalog query. The setup is also available for inspection.

## Predict accepted and rejected memberships

Run each separately and inspect the table after each attempt:

```sql
INSERT INTO course_identity.memberships VALUES (10, 1, 'asha');
INSERT INTO course_identity.memberships VALUES (20, 2, 'sam');
INSERT INTO course_identity.memberships VALUES (20, 2, 'bo');
INSERT INTO course_identity.memberships VALUES (10, 999, 'new');
INSERT INTO course_identity.memberships VALUES (NULL, 2, 'other');
```

Expected: repeated member/workspace pair fails with 23505; handle sam already in workspace 20 fails with 23505; Bo's different handle succeeds; nonexistent member fails with 23503; missing primary-key component fails with 23502. There are four memberships afterward. The same handle in a different workspace was already permitted by the starting rows.

## Optional does not mean duplicated

Both existing external_ref values are NULL. Set Asha's reference to ext-1, then attempt to give Bo that same value. Expect 23505 and Bo's reference to remain NULL.

In strict_refs, insert NULL twice as separate statements. The first succeeds and the second fails with 23505 because this table declares UNIQUE NULLS NOT DISTINCT. Explain why that policy would not fit the original members table, where several members may lack a reference.

## At most one profile

The profiles table starts empty even though two members exist. Insert a profile for member 1. Try a second for member 1 and another for member 999. Expect 23505 and 23503 respectively. Confirm there is still no profile for member 2. No constraint here requires every member to have a profile.

## An ID generator is not the key

The deliberately incomplete identity_only table has no primary key or unique constraint. Run:

```sql
INSERT INTO course_identity.identity_only DEFAULT VALUES;
INSERT INTO course_identity.identity_only (id) OVERRIDING SYSTEM VALUE VALUES (1);
SELECT id FROM course_identity.identity_only ORDER BY id;
```

Both rows have ID 1. Now try the same explicit override for existing ID 1 in members, supplying a name. Its primary key rejects the duplicate with 23505. Without OVERRIDING SYSTEM VALUE, an explicit ID in an ALWAYS identity column is rejected with 428C9. Overrides are demonstrated here to separate the mechanisms, not recommended for ordinary inserts.

Reset. Run this complete block in one request/session:

```sql
BEGIN;
INSERT INTO course_identity.members (name) VALUES ('Temporary') RETURNING id;
ROLLBACK;
INSERT INTO course_identity.members (name) VALUES ('Kept') RETURNING id;
```

Temporary obtains 3; Kept obtains 4. Inspect members: IDs 1, 2, 4 remain. The ordinary row was rolled back; the allocated sequence value was not reclaimed. Do not generalize this into a guarantee that IDs reveal commit order or a gapless business sequence.

## UUIDs still need a constraint

Insert two uuid_records with only labels. Inspect their generated IDs. Repeat one deliberately:

```sql
INSERT INTO course_identity.uuid_records (id, label)
SELECT id, 'Repeated ID' FROM course_identity.uuid_records ORDER BY label LIMIT 1;
```

Expect 23505, with two rows remaining. This checks enforcement; it is not a statistical test of random collisions or an authorization test.

## Independent transfer

Reset. Customers and programs are supplied; enrolments is not. Build that table from this brief:

- One row means one customer's membership in one program; both referenced rows must exist.
- A customer can join several programs, but only once per program.
- Each enrolment has a required card_code. Codes are unique within a program and may repeat across programs.

Insert (customer 1, program 10, code A), (1, 20, A), and (2, 10, B). Prove those are allowed. Then test a duplicate pair with a different code, a duplicate code with a different customer, nonexistent references, missing keys and a missing card code. Do not give card_code a global uniqueness rule to make the first two probes easy.

Expected valid state is exactly those three rows. Codes are compared as supplied; case and whitespace normalization are outside this brief. Explain a second possible design using a generated enrolment ID plus explicit unique constraints, and why the generated ID alone would not reject a duplicate membership.

## Hints and solution

First hint: finish the sentence "one row represents..." before choosing a key. Second hint: the pair identifies the membership; program plus card_code controls a different duplicate boundary. Copy the relationship declaration pattern only after you can name both rules.

Reset before [solution.sql](solution.sql), which supplies one valid design and successful operations. The error probes stay separate. Equivalent constraint designs are acceptable if they reject exactly the forbidden states and permit the three valid rows. Note any assistance used.

Return later: allow a second, historical enrolment after a customer leaves. Which original rule has changed? Answer: one row can no longer mean the entire customer/program relationship if it must record separate episodes. Decide the new row meaning and active-membership policy before selecting keys.
