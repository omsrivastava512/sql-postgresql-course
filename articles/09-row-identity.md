# What identifies this row?

Asha belongs to two workspaces. She uses the handle sam in both. Another member tries to use sam in one of those same workspaces. Which duplicate should the database reject?

There are two different facts here: a person and that person's membership in a particular workspace. By the end, you should be able to choose a key for each, enforce the intended duplicate boundary, and explain what generating an ID does not guarantee.

**Scope:** general SQL keys and relationships; PostgreSQL identity generation, UUID generation and NULLS NOT DISTINCT. These are data rules, not authorization policies.

## One row, one fact

[Lab 09's setup](../labs/09-row-identity/setup.sql) supplies these memberships:

| workspace_id | member_id | handle |
|---|---|---|
| 10 | 1 | sam |
| 20 | 1 | sam |
| 10 | 2 | bo |

One membership row means one member's membership in one workspace. Neither workspace_id nor member_id is unique alone. Their pair is:

```sql
CREATE TABLE course_identity.memberships (
  workspace_id integer REFERENCES course_identity.workspaces(id),
  member_id integer REFERENCES course_identity.members(id),
  handle text NOT NULL,
  PRIMARY KEY (workspace_id, member_id),
  UNIQUE (workspace_id, handle)
);
```

The primary key rejects a repeated pair and requires both values. The second rule reserves a handle within a workspace. Changing sam to a globally unique column would reject Asha's valid second membership. This is a many-to-many relationship represented by a junction table; handle is an attribute of the membership.

The REFERENCES clauses reject nonexistent workspace/member IDs. Read the [foreign-key article](01-foreign-keys.md) if the direction is unfamiliar. A member can have zero memberships; nothing here requires creating one. A workspace can contain many members, and a member can join many workspaces.

## Generation and uniqueness are separate

The members table generates a local numeric identifier:

```sql
CREATE TABLE course_identity.members (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  external_ref text UNIQUE
);
```

Leave id out of a normal insert, then use RETURNING id to discover it. ALWAYS rejects an ordinary explicitly supplied ID, but PostgreSQL has an explicit override for controlled imports. The primary key is what enforces unique, non-NULL stored IDs. The lab includes a deliberately incomplete identity-only table so you can observe the distinction.

A name is not necessarily a unique business identifier. Neither is a handle globally unique merely because people call it a username. State the intended rule before declaring a key. This lab compares text exactly as stored; case folding, renames and account-merging policies need their own design decisions.

## Missing external identifiers

Both supplied members have NULL external_ref. PostgreSQL's ordinary UNIQUE permits that. It still rejects two equal non-NULL references.

If a particular optional identifier may have at most one missing value, UNIQUE NULLS NOT DISTINCT expresses that different rule. The lab compares it in a separate table; it would be the wrong rule if many new members legitimately lack an external reference.

These policies are different from a primary key, which always requires a value. A generated number does not decide the external identifier policy for you.

## At most one is not exactly one

The optional profile table uses member_id as both its primary key and a foreign key to members. A profile must belong to an existing member; a second profile for the same member is rejected. But adding a member does not create a profile. The primary key limits the number to at most one. Requiring a profile as part of onboarding is an additional workflow or modeling decision.

## A generated number is not a business sequence

PostgreSQL identity generation uses a sequence. A transaction can obtain a number and then roll back; the next insert can leave a gap. The lab makes this visible with BEGIN, INSERT, ROLLBACK and another INSERT. BEGIN starts a transaction; ROLLBACK undoes its ordinary table writes. Sequence allocation has different behaviour.

Do not use a row ID as proof of a gapless invoice numbering policy. The [transaction-boundary article](06-transaction-boundaries.md) intentionally uses an ordinary table counter, whose rollback behaviour differs. Neither example by itself proves a complete production numbering design.

## What changes with UUIDs?

The lab's uuid_records table uses id uuid DEFAULT gen_random_uuid() PRIMARY KEY. UUID is the value type, gen_random_uuid generates a random version-4 value, and PRIMARY KEY enforces the stored uniqueness rule. Random generation does not make collision probability mathematically zero. The lab deliberately repeats a generated ID to test the constraint; a sample with no collisions would not prove collisions impossible.

A hard-to-guess identifier is also not permission to read the row. Roles, privileges and tenant access remain separate topics.

## Practise and return

The [lab](../labs/09-row-identity/README.md) tests permitted and forbidden duplicates, compares generation with constraints, then asks you to model loyalty-program enrolments from a fresh brief. [Hints and a solution](../labs/09-row-identity/README.md#hints-and-solution) are available.

After a gap, explain why (workspace_id, member_id) and (workspace_id, handle) answer different questions. Then change the requirement so a member can leave and rejoin with separately recorded history. Explain why the current one-row-per-membership model would need reconsideration before adding another ID automatically.

**Requires:** [stored values](07-stored-values.md), [selecting rows](08-selecting-rows.md) and the narrow [foreign-key guarantee](01-foreign-keys.md).
**Related:** [deleting related rows](04-deleting-related-rows.md) asks what happens when one of these facts is removed.
**Revisited in:** [planned modeling and reporting](../COURSE_MAP.md#the-wider-course), where row meaning determines joins and totals.

**References:** PostgreSQL [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html), [identity columns](https://www.postgresql.org/docs/17/ddl-identity-columns.html), [sequences](https://www.postgresql.org/docs/17/functions-sequence.html) and [UUID functions](https://www.postgresql.org/docs/17/functions-uuid.html).
