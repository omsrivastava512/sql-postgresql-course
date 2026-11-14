# Lab 34: trace allowed and denied requests

Use the [local setup](../../supabase/README.md) and read [the lesson](../../articles/34-authorized-requests.md). Reset independently with:

```powershell
node --env-file=.env.auth-course labs/auth-fixture.mjs reset 34
node --env-file=.env.auth-course labs/34-authorized-requests/request.mjs alice
node --env-file=.env.auth-course labs/34-authorized-requests/request.mjs bob
node --env-file=.env.auth-course labs/34-authorized-requests/request.mjs reader
```

Inspect [setup.sql](setup.sql) and [solution.sql](solution.sql). Each caller should see only their own draft: Alice's North draft 1, Bob's South draft 2, or Reader's North draft 3. Record the actual actor UUIDs. Outsider sees no drafts. All generated IDs restart when this dedicated schema is reset.

## Predict the write boundary

Before executing, predict the returned rows and the final stored rows for these attempts:

| Alice's action | Expected observation |
| --- | --- |
| Insert her own North draft | One new draft, actor filled from the request |
| Update that draft's quantity | One changed row |
| Delete that new draft | One deleted row; initial drafts remain |
| Update or delete Bob's South draft | No affected rows |
| Move her initial North draft into South | Rejected proposed row |
| Change her initial draft's actor to Bob | Rejected proposed row |

Use this PowerShell block to send a controlled forbidden edit. It signs in normally and requests a write representation:

```powershell
@'
import { requestConfig, fixtureUser, signIn, dataRequest } from './labs/33-request-identity/request.mjs';
const config = requestConfig();
const user = await fixtureUser('alice');
const { token } = await signIn(config, user.email, user.password);
const result = await dataRequest(config, token, 'course_auth34_api', 'draft_orders?draft_id=eq.2', {
  method: 'PATCH', representation: true, body: { quantity: 99 }
});
console.log(JSON.stringify(result));
'@ | node --env-file=.env.auth-course --input-type=module -
```

Expect an empty returned array. In the administrator connection, independently inspect:

```sql
SELECT draft_id, store, actor, sku, quantity
FROM course_auth34_api.draft_orders ORDER BY draft_id;
```

Draft 2 must still have quantity 3. Now target draft 1 and propose `{ store: 'South' }`. Predict a `42501` policy rejection and an unchanged North draft. Obtain Bob's real ID from the private fixture manifest or the observer query, then attempt the actor change. Use the same helper to perform the permitted insert/update/delete sequence, recording the new ID returned by INSERT instead of assuming the next sequence value.

## Separate three failures

In the administrator connection, temporarily revoke Alice's shared role's SELECT grant:

```sql
REVOKE SELECT ON course_auth34_api.draft_orders FROM authenticated;
```

Run the ordinary read command. Expect a privilege failure, not the same result as a hidden row. Restore the grant immediately:

```sql
GRANT SELECT ON course_auth34_api.draft_orders TO authenticated;
```

Next, make a request using `course_auth34_private` as the profile schema and `memberships?select=*` as the resource. It must fail because the schema is not exposed. Explain why exposing it would not itself grant ordinary users table access. Finally, revisit the North-to-South edit and locate the failed proposed-row check. Keep the three observations separate.

## Change authority while retaining identity

Use the private manifest's Alice UUID as a bound parameter in an administrator query, or first identify it from draft 1:

```sql
UPDATE course_auth34_private.memberships SET active = false
WHERE actor = (SELECT actor FROM course_auth34_api.draft_orders WHERE draft_id = 1);
```

A fresh Alice draft request should now return no rows. The integration checker repeats this with the same still-valid token and separately confirms Alice's identity. No token-refresh step is the reason the membership decision changes. Reset the lab afterward.

The checker also changes Outsider's user-editable Auth metadata to claim an admin role. Predict the unchanged permission outcome. The metadata update itself may succeed; the subsequent draft write must not. Do not confuse being allowed to edit a profile field with being allowed to edit the protected membership table.

## Independent transfer

Treat the two stores as clinic branches and the rows as booking drafts. Keep the personal ownership rule, but change Reader's North membership to permit draft writes. Alice must still be unable to change Reader's draft. Reader must be able to edit their own North draft and must still be unable to move it to South. Supply three requests and independent before/after queries that distinguish these cases.

Hint: changing the permission flag should not remove the actor equality from the policy. After your attempt, inspect [transfer.sql](transfer.sql), which makes only the administrative permission change. Run it after a fresh reset. As Reader, PATCH draft 3 to quantity 4; as Alice, PATCH draft 3 to quantity 99; as Reader, PATCH draft 3 to store South. Expect one permitted change, one zero-row edit and one rejection. The final row remains Reader/North/quantity 4.

The reference intentionally reuses the same schema to isolate the changed permission. This is a fictional transfer of the access rule, not a complete clinical scheduling model.

## Return

At the next session, distinguish the old row's eligibility from the new row's validity. Around a week later, explain why an empty write body is insufficient evidence. Around a month later, design an alternating Alice/Bob/no-token sequence that would expose a reused-identity bug. The [integration checker](../../tests/verify-authenticated-access.mjs) runs reference cases; an unaided learner attempt remains separate evidence.
