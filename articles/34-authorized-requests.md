# The request knows Alice. Which rows may it change?

Alice can sign in and see North. She sends an edit for Bob's South draft, and the API returns an empty array. Then she edits her own North draft to move it into South, and the API returns an error. These outcomes look inconsistent until you separate selecting an existing row from admitting the row that an edit proposes.

[Lesson 33](33-request-identity.md) established the request's identity. This lesson follows that identity through actual reads and writes. The general idea is that an authenticated person still needs authority for a particular action and resource. PostgreSQL supplies object privileges and row policies; Supabase exposes the chosen database objects through its Data API. The [lab](../labs/34-authorized-requests/README.md) uses a draft order so you can change rows without confusing them with the accepted historical order in lesson 35.

## Check the path before repairing the policy

A database object must be in an exposed schema to have a Data API route. The selected database role must then have the necessary schema and object privileges. An enabled row policy controls which existing rows qualify and which proposed rows may be stored. These are different checks, so granting a table privilege cannot repair an invalid token, and adding an exposed schema cannot repair a missing membership. [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)

The fixture deliberately exposes `course_auth34_api` and leaves `course_auth34_private` unexposed. The request helper chooses the API schema using profile headers. Its publishable project key and user token are the same kinds of credentials used in lesson 33. The private membership table also lacks ordinary-user table privileges. An unexposed schema alone would not protect a private table if some exposed privileged function returned everything from it.

Miki Pokryvailo's July 2022 Nile account describes adopting RLS after application filters became repetitive and easy to miss. It also describes practical mistakes around testing with a privileged database role and reusing identity context. Those experiences change our test procedure: exercise the ordinary caller, and alternate Alice, Bob and no-token requests. Nile's thread-local implementation is not PostgREST's implementation; its bug is a reason to test isolation, not evidence that this API has the same bug. [Original account](https://www.thenile.dev/blog/multi-tenant-rls)

## State whose draft this is

After reset, the fixture contains these logical rows. Actual actor values are Auth UUIDs:

| Draft | Store | Actor | Quantity | Actor's current permission |
| --- | --- | --- | --- | --- |
| 1 | North | Alice | 3 | Read and place |
| 2 | South | Bob | 3 | Read and place |
| 3 | North | Reader | 3 | Read only |

Our fictional policy allows an active member to read their own drafts in a store. Placement permission is additionally required to insert, update or delete a draft. Alice does not automatically see Reader's draft merely because both belong to North. Team-wide visibility would be a different business rule.

The `actor` column defaults to `auth.uid()` when the caller omits it. The default is convenient, but it is not a security boundary: a caller can explicitly supply another value. The row policy must still check that the proposed actor equals the verified subject. It must also check the proposed store against current membership.

The membership helper receives a store and whether this policy needs write authority. It derives the actor internally and reads a protected table under a narrowly privileged owner. A caller cannot supply Bob's UUID to that helper. The policy itself chooses whether write permission is needed; calling the helper with a different flag does not rewrite the INSERT policy.

## Read a row, propose a different row

For an UPDATE, both halves of the rule matter:

```sql
CREATE POLICY own_update ON course_auth34_api.draft_orders
FOR UPDATE TO authenticated
USING (
    actor = auth.uid()
    AND course_auth34_api.may_use_store(store, true)
)
WITH CHECK (
    actor = auth.uid()
    AND course_auth34_api.may_use_store(store, true)
);
```

`USING` filters the existing row. `WITH CHECK` tests the proposed new row. The same expression appears twice here because the ownership and store rule must hold both before and after the edit. The separate SELECT policy also matters for the rows the UPDATE needs to read. [PostgreSQL policy rules](https://www.postgresql.org/docs/17/sql-createpolicy.html)

When Alice targets Bob's South draft, the existing row does not qualify. With `return=representation`, the API can return an empty array because no row was updated. When Alice targets her own North draft and changes `store` to South, the old row qualifies but the proposed row fails the check. PostgreSQL rejects that statement. Changing the proposed actor to Bob must also fail.

For a permitted change, inspect the stored value as well as the response. An allowed INSERT should create one new Alice/North draft. An allowed UPDATE should change its quantity. An allowed DELETE should remove only that draft. The independent administrator query checks the final facts after each action. It is an observer, not the credential used to perform the learner's request.

## Empty bodies, empty arrays and rejected writes

PostgREST can return a minimal response body for a write unless a representation is requested. A body containing no data is not itself a count of affected rows. Our caller explicitly requests representations for write observations. An empty array under that preference still does not tell an arbitrary caller whether a hidden row exists. The lab knows the initial row exists because the independent verifier seeded and inspected it. [Return preferences](https://docs.postgrest.org/en/stable/references/api/preferences.html#return-representation)

Try three different failures: remove the table SELECT grant, request the unexposed private schema, and attempt a forbidden proposed row. Capture the structured error code and the relevant role/object or row rule. Do not group all three under “RLS failed.” Restore each deliberate fault before moving on, so the next observation has one known cause.

A frontend that hides a store selector cannot enforce these rules. The lab sends the forbidden store directly through the API. Likewise, adding an `admin` label to user-editable metadata must not create a membership or placement permission. The authority is in the protected membership row, and the policy selects that authority using the verified account identity.

## What changes when membership is removed?

Remove Alice's active membership and repeat the draft query using the same unexpired access token. Her account identity has not changed, but a fresh request no longer finds an active membership. This avoids using an old membership value copied into a token as the current authority for this fixture.

The timing claim is bounded. Ordinary reads use database snapshots. A transaction already executing with an earlier snapshot can behave differently from a fresh request after removal commits. This lesson does not promise to retract data already returned or cancel every in-flight operation. [Lesson 35](35-authorized-replay.md) adds a specific lock protocol for order admission and receipt recovery; it does not turn all RLS reads into that protocol. [PostgreSQL row-security limitations](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

## Make the rule survive a changed setting

The lab's independent task changes the personal drafts into clinic booking drafts in two branches. Its reference keeps the personal ownership rule explicit: a receptionist's presence in a branch is not permission to edit another receptionist's draft. Choose whether a proposed branch or owner change should be allowed, then prove your choice with an existing-row attempt and a proposed-row attempt.

**Return after a gap.** A manager says, “The request returned no rows, so there was nothing to protect.” Give two different reasons for an empty result and one observation that distinguishes them in a controlled fixture. Then explain why the ordinary caller should not be given the administrator's view to resolve that ambiguity.

Next, [authorized replay](35-authorized-replay.md) replaces direct accepted-order writes with a narrowly authorized operation. The draft exercise has taught which person can change a row; the next operation must also preserve one accepted outcome across retries and changing permissions.
