# Authenticated access: implementation decisions and lifecycle research

13 November 2026, Asia/Kolkata. Follow-up to the [first research memo](Authenticated%20access%20-%20research%20and%20batch%20recommendation.md). This investigation addresses the remaining implementation choices and gives the broader identity lifecycle a concrete teaching route. It does not implement lessons 33–35 or certify an Auth integration.

## What this investigation changes

Keep the connected sign-in → permitted request → accepted order → receipt-recovery journey. Strengthen the next batch in three ways:

1. Develop a separate receipt-reading operation within lesson 35's changed-requirement exercise, with a reference implementation and tests. Keep the command's existing placement-permission rule explicit.
2. Specify a shared membership lock for order admission, so duplicate requests can reach request-key arbitration concurrently. Distinguish that from an exclusive lock and from an insufficient key-share lock.
3. Use local Supabase for repeatable development and a separate hosted project for the hosted evidence gate. These are complementary environments, not interchangeable proofs.

The full identity lifecycle now has nine named chapter briefs below. They are proposed authoring work, independent of the author's personal learning pace. No fixed word count or three-lesson cap restricts their depth. Final lesson numbers beyond 35 remain unallocated.

## Current repository and environment evidence

The permissions research has since been committed as `fbd34f7ccfb7550085d9a689ff88dad3342aa6fa`. Its commit explicitly preserves the focused-identity scope: simulated sessions and trusted actor inputs, with live authentication and recovery unverified. Its source report records a fresh 133-check PostgreSQL/SpiceDB run; that suite was not rerun here.

Live GitHub metadata still identifies non-fork `omsrivastava512/sql-postgresql-course`, default branch `main`, at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Comparing that live SHA with local HEAD yields **12 ahead, zero behind**. All-state PR and issue collections remain empty; remote commit history contains no equivalent lesson batch. Tracked files and index are clean; only `learning/` is untracked. No update, commit or push is needed for this research.

The shell's live Git lookup failed on network resolution; the connected GitHub API supplied the authoritative remote evidence. Node and gh are on PATH; Docker, Supabase CLI and psql are not. The standard Docker executable path was absent and the Docker Desktop service lookup returned no service. This does not rule out a differently installed container runtime. No provider project was selected, no credentials were retrieved, and no services were started.

## 1. Separate command retries from reading a receipt

This is a proposed fictional business policy, not a property supplied by PostgreSQL or Supabase.

An order command answers: “May Alice cause this sale, or repeat this command to recover its result?” Receipt reading answers: “May Alice see the accepted result of her earlier sale?” Combining both questions into one permission is legitimate but less expressive. Teach the simple command first, then change the requirement visibly.

Use these proposed interfaces in lesson 35:

| Operation | Caller supplies | Trusted identity and authority | Result |
| --- | --- | --- | --- |
| `place_order` | Store, request key, SKU, quantity | Actor from verified request context; active membership with placement permission | New accepted receipt or the matching saved receipt |
| `read_own_receipt` | Store and request key | Actor from verified context; active membership with receipt-read permission | That actor's saved receipt, or an unavailable result |

Neither operation accepts an actor override, an accepted price or a caller-authored receipt. Both derive the actor even when running with an elevated function owner's privileges. Both locate the request by `(store, actor, key)`. Use the same receipt structure as the existing order example; do not invent a second response representation for the read operation.

The base fixture's placer has placement and receipt-read permissions. A downgrade removes placement while retaining receipt-read. Removal disables both. Define receipt visibility as personal within the store; a colleague's receipt is not automatically visible. Team-wide receipt visibility is a later explicit policy change.

| Alice's current state | New command | Matching command retry | Read own accepted receipt |
| --- | --- | --- | --- |
| Active placer | Allowed | Original receipt | Allowed |
| Active reader after downgrade | Denied | Denied | Allowed |
| Removed member | Denied | Denied | Denied |
| Rejoined with placement and receipt-read | Allowed for a new key | Original receipt for old key | Allowed |

A denied retry does not establish that the original operation rolled back. The caller must retain its original key and attempt the separately authorized read when permitted. If both actions are denied, report an unresolved outcome to the caller and use a separately authorized reconciliation process. Do not automatically create a new key or delete the accepted request.

An authorized receipt lookup finds only the caller's own request. A missing request and another person's same key produce the same unavailable shape. A caller lacking permission is denied before lookup. Do not disclose another person's SKU, order ID or payload-conflict details. Keep this policy deterministic across both functions.

Keep accepted request records until lab reset. Receipt reading must never reserve a key, create an order, update accepted prices or extend a retention deadline. Do not cascade account deletion into accepted order history. Deletion and retention receive a distinct future design exercise.

## 2. Coordinate revocation without hiding the duplicate-request race

The first memo deliberately left the membership lock mode unspecified. A naive `FOR UPDATE` implementation would make every command for one member/store wait for the preceding command, even for different request keys. It would also make a duplicate test pass without necessarily exercising request-key contention.

PostgreSQL's lock table shows that `FOR SHARE` permits another shared lock while conflicting with updates and deletes. `FOR KEY SHARE` permits a non-key update and therefore does not protect an `active` or permission-field decision. These facts motivate the proposed protocol; they are not newly observed concurrent results. [PostgreSQL 17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)

Propose one persistent membership row per actor/store for this small fixture, with active status and the two permissions on that same row. Retain the row when removing or rejoining a member. This is intentionally different from the broader permissions report's historical membership episodes; the course must name the different policy rather than accidentally mix the schemas.

The proposed ordering is:

1. Lock the identified membership row `FOR SHARE`, then evaluate the returned active status and the operation's required permission. A missing row denies. Keep the lock to transaction end.
2. For the command only, arbitrate the unique actor/store/key and compare stored SKU and quantity. If complete, return the original receipt; otherwise write the accepted order, line and receipt atomically.
3. For receipt reading, locate the saved completed request without changing it.
4. A revocation or permission change updates the same membership row and therefore conflicts with admitted operations. All administrative fixture writers must follow this rule.

Read Committed is the selected isolation level for this protocol. Implement locking and subsequent decisions in a `VOLATILE` PL/pgSQL function. PostgreSQL documents that standard volatile functions obtain snapshots for their internal queries; stable functions retain the calling query's snapshot. Do not put a lock-and-recheck helper behind a misleading `STABLE` declaration. [Function volatility](https://www.postgresql.org/docs/17/xfunc-volatility.html)

The guarantee is an ordering between these cooperating database transactions. Revocation first means the waiting operation checks the changed row and denies. Operation first means revocation waits for its transaction, after which the accepted order remains. Neither choice retracts bytes already delivered or prevents a previously admitted response reaching the client after revocation commits. Ordinary RLS reads retain their documented snapshot behavior.

Keep lock order membership → request → order work. An administrative path that locks a request first and then the member can introduce a new deadlock. Multi-store commands, account-wide disablement and grant graphs are outside this small lock protocol and need explicit additional coordination.

### An observed interface constraint

A bounded experiment ran in a fresh in-memory PGlite 0.5.10 database, reporting PostgreSQL 18.6. It created one synthetic membership row and no persistent database files.

| Experiment | Observed result |
| --- | --- |
| `SELECT ... FOR SHARE` in a read-only transaction | SQLSTATE `25006`: cannot execute SELECT FOR SHARE in a read-only transaction |
| Same locking read inside a STABLE PL/pgSQL function | SQLSTATE `0A000`: SELECT FOR SHARE is not allowed in a non-volatile function |
| Same read inside a VOLATILE function in a read-write transaction | Returned true |
| Inspect the fixture afterward | The single row remained active and unchanged |

Therefore, if receipt reading promises this lock-coordinated revocation behavior, implement it as a **POST RPC with a VOLATILE function**, even though it changes no business records. PostgREST documents read-only GET/HEAD requests and read-write POST calls to volatile functions. A plain GET under a snapshot is a valid alternative with a different revocation contract; it is not equivalent to the proposed locked read. [PostgREST transaction modes](https://docs.postgrest.org/en/stable/references/transactions.html#access-mode-on-functions)

The experiment establishes these local function/transaction restrictions only. It does not prove the protocol under native PostgreSQL 17, real concurrent sessions, PostgREST, Auth or hosted Supabase. Those remain implementation checks.

### Additional decisive tests

Retain the original memo's full test matrix and add these distinctions:

| ID | Schedule or action | Required observation |
| --- | --- | --- |
| D1 | Two orders from one active member, different keys | Shared admission does not serialize them solely on the membership row; both correct orders commit |
| D2 | Same member and same key, two concurrent requests | Both pass admission; the second waits at request-key arbitration; commit and rollback variants produce the correct single result |
| D3 | Downgrade commits before admission | Command denies; receipt read succeeds for own accepted request |
| D4 | Removal commits before admission | Both operations deny; order and receipt remain unchanged |
| D5 | Receipt read admits before removal | Removal waits; read may finish; a subsequent read denies |
| D6 | Replace shared admission with key-share in a disposable negative control | Demonstrate that changing a non-key permission field need not wait; do not describe key-share as sufficient protection |
| D7 | Call locking receipt function through GET or mark it STABLE | Failure is attributed to transaction/function mode, not mistaken for failed authorization |
| D8 | Bob guesses Alice's key; Bob also owns an independent same-text key | No Alice payload; only Bob's own result can be returned when he has permission |

For D1/D2, use a third SQL observer and actual blocker evidence. A passing final row count alone does not identify where the wait occurred. Fixture-only synchronization must not add an exposed bypass or delay parameter to the teaching RPC.

## 3. Execution setup and implementation order

Recommend **local first, hosted second**. The local stack provides repeatable Auth, PostgREST, SQL and captured-mail fixtures. The dedicated hosted project verifies the managed configuration separately. Current Windows local setup requires a Docker-compatible runtime; the documented experimental native route is Linux/Apple-silicon macOS, not a Windows fallback. [Supabase CLI setup](https://supabase.com/docs/guides/local-development/cli/getting-started)

No installation or hosted write occurs during this research. Before implementation, identify the local runtime and a disposable hosted course project. Pin and record the CLI, service images, PostgreSQL, PostgREST, Auth and any SDK versions actually used. Do not assume the documentation's PostgREST 16 equals the hosted project's runtime.

Use the same logical fixture and request scenarios in both environments. Generate test-user IDs through Auth provisioning and retain a private alias-to-ID manifest. SQL examples use aliases in prose and actual UUID parameters at execution. Keep administrator provisioning/state verification separate from the learner caller. The learner caller uses the publishable project key and a real user access token.

Reset only the dedicated fixture. Track the specific users created by that fixture rather than deleting every Auth user or recreating managed schemas. Repeat setup and reset to prove reproducibility. Log sanitized role, subject alias, method, expected outcome, error code and before/after business records; never log passwords, tokens or recovery links.

Keep lessons 33–35's small Node request caller. Use a browser only when the learning objective actually needs one: redirect/PKCE flows, MFA UI or WebAuthn ceremonies in later chapters. No framework or Supabase SDK dependency is introduced into the course by this research.

Recommended implementation order:

1. Establish real Auth sign-in and identity observations for lesson 33, including invalid-token and absent-membership controls.
2. Verify the API privilege/policy matrix for lesson 34 under ordinary user credentials.
3. Implement the base order command and test atomicity, payload conflicts, replay and membership coordination.
4. Develop the permission-downgrade requirement into the separately authorized receipt read; run D1–D8.
5. Execute local integration, then hosted integration; preserve separate environment records. Complete independent exercises and reader walkthroughs before publication.

Passing stages 1–4 locally does not satisfy the hosted gate, and platform tests do not demonstrate learner comprehension. Keep those statuses visible rather than reducing the evidence requirement when setup is inconvenient.

## 4. A concrete full identity-lifecycle branch

These nine chapter briefs extend the master course. Each needs a worked journey, observed failure, independent transfer, explained answer and later retrieval prompt. They are not nine new implementation commitments for the current research turn.

### L1 — An account exists; why can the person still not enter?

Follow registration, email confirmation, optional profile completion and store admission as separate states. Begin with an Auth account whose profile creation failed. Repair the profile without creating another account or granting membership. Test repeated submission, an expired confirmation link and a controlled signup-trigger failure; distinguish captured local email from delivery to a hosted mailbox. Transfer to a student awaiting enrolment. Use the platform's [password/confirmation flow](https://supabase.com/docs/guides/auth/passwords) and existing course account/profile research.

### L2 — Which session survives a lost refresh response?

Follow two browser sessions, one access token's expiry, refresh rotation, a dropped refresh response, a legitimate retry and reuse of an older token. Supabase documents both a reuse interval and an active-parent exception, so a test that simply repeats the last token is not proof of replay rejection. Specify each token's generation and test clock boundary. Compare logout and membership removal with the same still-unexpired access token. Transfer to a mobile client reconnecting after being offline. [Supabase sessions](https://supabase.com/docs/guides/auth/sessions)

Randy Nasson's Auth0 account, 15 April 2020, explains the product decision to use refresh rotation and the tension between reuse detection and retrying after a lost response. It motivates the failure experiment; its token-family behavior is not assigned to Supabase without checking Supabase's contract. [Original Auth0 account](https://auth0.com/blog/securing-single-page-applications-with-refresh-token-rotation/)

### L3 — Who accepted the invitation, and what survives removal?

Add a real authenticated recipient to the existing invitation/membership model. Explain token possession and verified recipient binding separately. Race acceptance against cancellation; replay an accepted invitation; remove and reinvite the same account. The changed requirement contrasts fresh membership episodes with the stable account-owned receipts of lesson 35. Transfer to a project guest who must not regain old team grants. The committed permissions report supplies a model to adapt, not a completed email/Auth integration.

### L4 — Recover the account without restoring old authority

Follow a password-reset request through delivery, proof verification and credential change, then inspect old/new sessions and unchanged memberships. A reset-request response must not be treated as evidence that an address has an account or that mail was delivered. Test expired and reused recovery links and an allowlisted redirect failure. Recovered Alice still lacks the store membership removed before recovery. Transfer to a staff member returning after an absence. [Supabase reset flow](https://supabase.com/docs/guides/auth/passwords#resetting-a-password)

Add a second worked case for loss of an MFA device or passkey. Identify the provider-supported recovery route and its required evidence before implementing it; a password reset does not automatically justify removing another factor. Do not invent built-in recovery-code support or an unrestricted administrator bypass.

### L5 — Two sign-in methods: one account or two?

Start with a verified password account and a second OAuth identity. Explain the stable account ID, provider identity, mutable email and the authorization needed to link or unlink. Test a legitimate link, a conflicting identity and an unconfirmed-email case without inventing a custom email-based merge. Supabase documents automatic/manual linking and explicitly excludes SAML SSO accounts from those strategies. OpenID Connect identifies an end user by issuer plus subject, not email alone. Transfer to a customer who changes email but must keep purchase history. [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [OIDC claim stability](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability)

### L6 — A factor is enrolled; has this request proved it?

Follow TOTP enrolment, challenge, verification and a new request carrying the resulting assurance. Gate one synthetic sensitive operation, such as changing the store payout contact, on current verified assurance. Test an enrolled-but-unchallenged session, wrong code, successful challenge and factor removal. A frontend prompt is not the enforcement boundary. Transfer to changing a patient's account contact in a fictional example. Supabase distinguishes enrolment/challenge APIs and the `aal` claim; verify the claim actually delivered to the database. [MFA documentation](https://supabase.com/docs/guides/auth/auth-mfa)

### L7 — A passkey works here; why not on the other device?

Explain the challenge, relying party, origin, credential and account binding before SDK calls. Register and use a test credential, then test cancellation, expired challenge, the wrong origin and loss of one credential while another recovery route remains. Include a real browser walkthrough; a simulated authenticator is a different evidence tier.

As of this research, Supabase labels passkeys experimental and excludes SSO and anonymous users from registration. Pin the tested client/server combination and recheck these limits when authoring. Do not assume passkey authentication implies the same `aal` value as a TOTP challenge. [Passkey documentation](https://supabase.com/docs/guides/auth/passkeys)

Hirsch Singhal's GitHub account, 21 September 2023, describes compatibility problems found in re-registration across browser/OS/security-key combinations. Use that experience to require a compatibility/fallback experiment rather than a single happy-path screenshot. Do not generalize a 2023 device limitation to today's devices. [Original GitHub account](https://github.blog/news-insights/product-news/passkeys-are-generally-available/)

### L8 — The employer authenticates Alice; does that admit her to North?

Separate enterprise identity proof, application account resolution and current organization membership. Use a controlled SAML identity provider and test a legitimate tenant, a wrong provider and two accounts sharing an email. Supabase documents non-unique SSO emails and directs callers to UUID identity. Hosted SAML support has plan/configuration prerequisites; selecting or paying for a provider is separate setup work. Transfer to a contractor belonging to two employers. [SAML SSO documentation](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml)

For external OAuth authorization, teach authorization-code/PKCE rather than reusing lesson 33's first-party password-login fixture as a generic integration pattern. RFC 9700 rejects the resource-owner-password grant and gives refresh-token protections. The fixture is a platform login demonstration, not an endorsement of collecting an unrelated provider's credentials. [OAuth security BCP](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.4)

### L9 — The directory removed Alice; which application access stops?

Follow authenticated provisioning into scoped application membership changes. Define how the directory's account, group and administrative status map to the application's global account and organization memberships. SCIM's `active` meaning is provider-defined; deprovisioning North must not silently disable unrelated South access under the proposed multi-organization policy. [SCIM core schema](https://www.rfc-editor.org/rfc/rfc7643.html#section-4.1.1)

Test repeated removal, an older update arriving after removal, failed local application and reconciliation. Separate a local event-adapter simulation from a real SCIM endpoint/client test. If the provider supports resource versioning, use its advertised ETag/conditional-update contract; do not assume a timestamp universally orders provisioning events. Transfer to a directory rehire that needs a fresh authorization decision. [SCIM protocol](https://www.rfc-editor.org/rfc/rfc7644.html#section-3.14)

The branch's final integration exercise follows Alice from registration to factor enrolment, organizational access, accepted order, removal and recovery. A new sign-in method or recovered credential must not manufacture authorization. This capstone should revisit the same accepted order and membership history rather than start from unrelated fresh rows at every step.

## 5. Research record, reproduction and completion boundary

Primary documents were opened and relevant passages inspected on 13 November 2026. Technical references establish bounded behavior; the new interfaces, fictional policies and chapter exercises are our recommendations. Two additional firsthand accounts have explicit authors/dates above. No source was treated as evidence of private schemas or of a company breach.

| Research question | Evidence inspected | Conclusion |
| --- | --- | --- |
| Can admission allow concurrent commands and still coordinate removal? | PostgreSQL 17 row-lock conflict table | Shared admission is a candidate; native/API schedules remain necessary |
| Can the locked receipt read be an ordinary stable GET? | PostgREST transaction modes, PostgreSQL volatility, fresh embedded probe | Use POST/VOLATILE for the proposed contract; do not label this as hosted execution |
| Should placement and receipt access share one permission? | Existing memo's downgrade consequence and explicit action/ownership analysis | Teach separate operations and test the changed requirement; this is a product choice |
| Does the broader permission report already cover live identity? | `fbd34f7` and report/log | No; its committed scope states the boundary explicitly |
| What belongs in the full lifecycle? | Provider flow docs, OIDC/OAuth/SCIM standards, Auth0 and GitHub accounts | Nine connected chapter briefs with observable failures and evidence requirements |
| Which setup can verify the real journey? | Local tooling inspection and current CLI docs | Local stack first plus dedicated hosted run; neither has been set up here |

### Reproduce the bounded probe

Run this from the course root with its existing development dependencies installed. It uses an in-memory database, asserts the three outcomes and closes the engine. It does not connect to a hosted service or exercise multiple sessions.

```javascript
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
try {
  console.log((await db.query('select version() as version')).rows[0]);
  await db.exec('create table membership_probe (id integer primary key, active boolean not null); insert into membership_probe values (1, true)');
  await db.exec('begin read only');
  await assert.rejects(db.query('select * from membership_probe for share'), error => error.code === '25006');
  await db.exec('rollback');
  for (const category of ['stable', 'volatile']) {
    await db.exec(`create function probe_${category}() returns boolean language plpgsql ${category} as $$ declare v boolean; begin select active into v from membership_probe where id=1 for share; return v; end $$`);
  }
  await assert.rejects(db.query('select probe_stable()'), error => error.code === '0A000');
  assert.deepEqual((await db.query('select probe_volatile() as allowed')).rows, [{ allowed: true }]);
  assert.deepEqual((await db.query('select * from membership_probe')).rows, [{ id: 1, active: true }]);
  console.log('PASS: transaction mode, function mode and unchanged fixture');
} finally {
  await db.close();
}
```

Verification: the JavaScript block above was extracted directly from this document and executed from the course root. All assertions passed on PGlite 0.5.10 / PostgreSQL 18.6. Local Markdown links and code-fence balance passed across all three research artifacts; the follow-up contains eight distinct additional test cases and nine distinct lifecycle chapter briefs.

This follow-up completes the requested research into the remaining decisions. The broader chapter briefs are researched authoring proposals, not delivered courses. Full native races, Auth/API integration, browser ceremonies, hosted checks and reader trials remain implementation evidence to obtain. The original source register remains valid for the earlier investigation; this document records the additional sources and the one new bounded experiment.

Only this artifact and a follow-up pointer in the earlier memo are changed. Course files, the committed permission research, `learning/`, dependencies and Git history remain untouched. Before implementation, the user still needs to accept the proposed architecture and identify the authorized execution environment; no such approval is inferred from requesting research.
