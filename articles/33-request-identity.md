# Alice signed in. Why can she still see no store?

A new assistant has a valid account. The password is accepted, the application receives an access token, and the store list is empty. Another assistant using the same application sees North. Before changing a row policy, identify which fact is missing: the account, the profile, the membership, or the identity attached to the request.

This lesson traces a real login through the Supabase Data API to PostgreSQL. The general idea is to distinguish proof of identity from permission. The PostgreSQL part is the database role and the row policy. The Supabase part is Auth, the access token and `auth.uid()`. Bring the [role distinction](23-database-roles.md) and the [membership example](25-tenant-membership.md); the [lab](../labs/33-request-identity/README.md) supplies every table and account needed here.

## Two credentials answer different questions

The course caller sends a publishable project key in the `apikey` header. Alice and Bob use the same key. That key identifies the application component's access to the project; it does not make either person Alice. The caller separately signs in with the synthetic account's email and password, receives a user access token, and sends that token as `Authorization: Bearer ...` on a data request. Never substitute an administrative secret for either learner's ordinary request. [API-key distinctions](https://supabase.com/docs/guides/getting-started/api-keys)

In a JWT, the subject claim identifies the account. Reading the encoded subject is easy. Establishing that a trusted issuer signed those claims, and that the token satisfies the deployed validation rules, is a different operation. A client can alter encoded text; it cannot thereby make the altered token pass verification. The verifier also needs trusted configuration. A token's own statement about its issuer or signing algorithm is not sufficient authority.

Stojan Dimitrovski's July 2025 Supabase announcement explains a reason to separate signing from verification: distributing a symmetric signing secret to additional verifiers also gives those holders the ability to create signatures. The announced asymmetric-key design lets a public verification key be distributed separately from the private signing key. This is a historical product-engineering account, not a reported breach. It changes our exercise: we locate the verifier instead of treating a decoded subject as proof. We do not implement signing-key rotation in this lab. [Original account](https://supabase.com/blog/jwt-signing-keys)

## Follow one request to its database identity

The supplied caller logs in through Auth and then requests `rpc/request_identity` in `course_auth33_api`. In the deployed API path, PostgREST validates the supplied token according to its configuration, selects the database role, and exposes request claims within the request transaction. The diagnostic function returns only the current role, session role and user ID. It does not return the token or unrestricted claims. [PostgREST authentication](https://docs.postgrest.org/en/stable/references/auth.html)

Predict the difference before running Alice and Bob:

| Request | Database role to expect | Account identity to expect |
| --- | --- | --- |
| Alice's valid user token | `authenticated` | Alice's generated UUID |
| Bob's valid user token | `authenticated` | Bob's different generated UUID |
| Publishable key without a user token | `anon` | NULL |

The role is shared; the subject is personal. A policy that tests only `current_user = 'authenticated'` would therefore not distinguish Alice's rows from Bob's. The lab also records `session_user`, which identifies the connection's session identity. Record its actual value instead of treating the connection role as the application's person.

The request diagnostic uses this expression:

```sql
SELECT current_user, session_user, auth.uid();
```

`auth.uid()` reads the request subject made available to SQL. It is not itself a cryptographic verifier. The trusted API path establishes that context before the helper reads it. An administrator manually setting a request claim in a SQL session can test a policy expression, but has not demonstrated that a person signed in. Inspect the actual installed helper in the administrator connection and compare its result with the API request. [Supabase JWT guide](https://supabase.com/docs/guides/auth/jwts)

An ordinary administrator query in a SQL editor or direct connection also does not automatically acquire the identity of the person signed into the application. It can have strong database privileges while `auth.uid()` is NULL. The same text executed through those two paths can consequently return different rows for two separate reasons: role privileges and request identity. Record both before diagnosing the policy.

## Three records, three independent facts

The fixture provisions four real Auth accounts, then separately supplies profiles and memberships:

| Alias | Profile | Active membership |
| --- | --- | --- |
| Alice | Present | North |
| Bob | Present | South |
| Reader | Present | North |
| Outsider | Absent | None |

Every alias has a generated Auth UUID. The profile's `user_id` references that managed ID; the membership's actor does too. The profile contains display information. The membership is the application authority. Neither is a copy of the password.

For the profile, the row policy is deliberately small:

```sql
CREATE POLICY own_profile ON course_auth33_api.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());
```

For a store, the policy asks a narrowly owned helper whether a current active membership exists for that store and the authenticated subject. Ordinary users cannot edit the membership table. Its unexposed schema is one boundary; its lack of ordinary-user table privileges is another. The helper checks only the caller's own identity and accepts no actor override. Return to [privileged code](26-privileged-code.md) to explain its owner, safe search path and execution grant.

Predict Outsider's three responses. Sign-in succeeds. The diagnostic identifies Outsider. The profile and store queries return empty arrays. Creating a profile would make the profile query return a row; it would not authorize a store. Conversely, deleting Alice's profile leaves her existing North membership intact under this fixture's policy. Those are distinct missing-state repairs.

## An empty result is not an expired token

Compare a request without a user token, a request carrying an altered signature, and a request carrying a genuinely expired token. The first can reach the configured anonymous role. The latter two are validation failures in the API path; do not explain them as successful requests that merely found no private rows. The integration checker records status and structured error codes separately from database state. [PostgREST errors](https://docs.postgrest.org/en/stable/references/errors.html)

Inside a valid SQL request, `user_id = NULL` evaluates to unknown, not false. A policy admits a row only when its predicate is true, so neither false nor unknown admits it. This explains a missing-subject policy result; it does not explain away an earlier token-validation rejection. [PostgreSQL comparison rules](https://www.postgresql.org/docs/17/functions-comparison.html)

A further terminology trap is an anonymously signed-in Auth user. That user has an account ID and uses the authenticated role; it is different from a request with no user token. The local course configuration disables anonymous sign-in. Treat this comparison as a documentation exercise, not an executed anonymous-account experiment. [Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous)

## Apply the distinction before adding more permissions

The lab asks you to transfer the model to two library branches. A library account can be valid while a branch admission is absent. A missing display profile and a removed branch membership must produce different repairs. Write your predicted identity, profile and branch results before opening the reference answer.

**Return after a gap.** A staff member recovers a password after losing store membership. Which fact has been restored? Which fact would still deny the store query? Explain why a valid new access token does not create a membership row.

Continue to [authorized requests](34-authorized-requests.md), where the same identity must survive an actual read, insert and attempted cross-store edit. Account provisioning here uses confirmed synthetic fixtures; signup mail, recovery and invitations belong to their own later lifecycle work. Local and hosted execution records and reader checks remain separate in the course's [verification record](../VERIFICATION.md).
