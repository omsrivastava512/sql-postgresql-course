# Authenticated access: source register and research audit

Read on 13 November 2026, Asia/Kolkata (12 November UTC). Companion: [research and batch recommendation](Authenticated%20access%20-%20research%20and%20batch%20recommendation.md).

## Method and evidence levels

Inspected the live repository, relevant course files, personal master curriculum, referenced chats and the new untracked permissions report. Searched for primary engineering accounts and opened originals. Checked mechanism claims against Supabase, PostgREST and PostgreSQL documentation; inspected a pinned Auth helper migration and the Auth API specification.

No dedicated Deep Research service was exposed by the available tools. This investigation used direct web research, the GitHub connector and read-only local inspection. It was completed in this chat; no background research job is pending.

**Repository-observed:** file contents, Git state, inventory gaps and runtime commands on PATH. **Source-supported:** documented or source-code behavior within its stated scope. **Proposed:** lesson design, fictional policy, protocol and future test outcomes. **Not established:** live Auth behavior in a course environment, the proposed RPC, human comprehension or publication readiness.

Search results only identified candidates. Third-party summaries, forum advice and unsupported issue comments were not used as mechanism authorities. No quotations or full source reproductions are included in the deliverables.

## Firsthand accounts

| ID | Author, date, type and original | Inspected location and useful finding | Use and limitation |
| --- | --- | --- | --- |
| E1 | Stojan Dimitrovski, Supabase, 2025-07-14; [Introducing JWT Signing Keys](https://supabase.com/blog/jwt-signing-keys), product engineering announcement | Sections on symmetric-key trade-offs and asymmetric verification | Changes lesson 33's question from decoding a string to locating the verifier and signing authority. Not a reported breach; historical rollout details are not a current project inventory. |
| E2 | Miki Pokryvailo, Nile, 2022-07-26; [Shipping multi-tenant SaaS using Postgres Row-Level Security](https://www.thenile.dev/blog/multi-tenant-rls), shipping account | Opening architecture decision; “A few gotchas”: wrong database role in testing and reused thread-local user state | Changes lesson 34's test identities and alternating-request experiment. Their thread-local bug is not a claim that PostgREST has that bug. Their superuser-owned definer example is not a universal property of definer functions. |
| E3 | Todd Jefferson, Shopify, 2019-08-27; [Building Resilient GraphQL APIs Using Idempotency](https://shopify.engineering/building-resilient-graphql-apis-using-idempotency), payment-service engineering account | Named request, client/key uniqueness, duplicate coordination and recovery points | Changes lesson 35's ownership decision. Shopify's client is not assumed to mean a Supabase user. Our SQL transaction does not implement their remote-provider workflow, and their 409 strategy is not imported as a universal response. |

These are enough to shape the three questions. More company names would not establish additional behavior. Existing lesson 32's Stripe account remains useful background; it was not independently refreshed here and no new claim depends on it.

## Platform and database references

Living documentation generally has organizational authorship, not an individual byline. Dates below identify the version or displayed revision where useful; all pages were read on the research date above. PostgREST's `stable` documentation identified itself as version 16. This does not prove the version used by any hosted Supabase project. PostgreSQL references target major version 17, matching the course's existing native evidence rather than asserting its old patch version is current.

| ID | Primary source | Passage inspected and supported claim | Boundary or implication |
| --- | --- | --- | --- |
| T1 | Supabase, [API keys](https://supabase.com/docs/guides/getting-started/api-keys), displayed update 2026-11-02 | Key types; role table; publishable versus secret; legacy keys | Separate project credential from person identity. Use publishable key plus user token for the learner caller. Verify the actual project's key/configuration choices. |
| T2 | Supabase, [JWT guide](https://supabase.com/docs/guides/auth/jwts) | Authenticated REST headers, JWKS and shared-secret verification sections | Supports the wire-level explanation and distinction between inspection and verification. The guide does not establish every deployment's issuer/audience configuration. |
| T3 | PostgREST 16, [Authentication](https://docs.postgrest.org/en/stable/references/auth.html) | Role impersonation, bearer token, signature/claims validation and anonymous role | Explains request role selection and validation boundary. Capture deployed version, validation configuration and expiry tolerance before finalizing test expectations. |
| T4 | PostgREST 16, [Transactions](https://docs.postgrest.org/en/stable/references/transactions.html) | Request transaction, access modes, isolation defaults, request-scoped settings | Basis for one RPC as one transaction. A sequence of independent API calls is not covered by that transaction. |
| T5 | Supabase Auth maintainers, [helper migration at e062eeae0079a6b1a70d5d5da9e5ac5cb8c21194](https://github.com/supabase/auth/blob/e062eeae0079a6b1a70d5d5da9e5ac5cb8c21194/migrations/20220224000811_update_auth_functions.up.sql) | Full 34-line migration, especially the UID function; file-specific commit lookup resolved to a 2022-12-02 formatting commit | UID reads legacy or aggregated request subject settings and casts to UUID. Pin makes this inspection reproducible; inspect the installed function separately. No claim that this old migration is the complete current platform. |
| T6 | Supabase Auth maintainers, [OpenAPI specification](https://github.com/supabase/auth/blob/master/openapi.yaml) | `/token`, password JSON example, `/signup`, response fields and distinct `/oauth/token` | Establishes feasibility of a small caller using native fetch. Main Auth password login is not a recommendation to use a password grant for unrelated third-party OAuth integrations. This moving specification needs a version pin at implementation. |
| T7 | Supabase, [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) | UID/JWT helpers, metadata mutability and token freshness | Database membership is proposed for fresh store permissions. Correct the page's simplified NULL explanation using T17, and distinguish expired-token rejection using T10. |
| T8 | Supabase, [Securing your API](https://supabase.com/docs/guides/api/securing-your-api), displayed update 2026-10-22 | Grants/RLS, default privileges, dedicated schemas, pre-request scope | API exposure, object privileges and row rules are different checks. A PostgREST pre-request hook does not automatically protect Storage or Realtime. No such wider integration is claimed. |
| T9 | Supabase, [Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) | Anonymous-user versus unauthenticated distinction and `is_anonymous` | Adds a terminology counterexample to lesson 33. Does not establish that anonymous sign-in is enabled in the planned fixture. |
| T10 | PostgREST 16, [Errors](https://docs.postgrest.org/en/stable/references/errors.html) | SQLSTATE mapping, JWT validation errors and schema/API error groups | Supports distinguishing missing privilege, invalid token and API failures. Assert exact codes only after the selected runtime is tested; do not infer all authorization outcomes from HTTP status alone. |
| T11 | PostgREST 16, [Prefer header](https://docs.postgrest.org/en/stable/references/api/preferences.html#return-representation) | Minimal versus represented write results | Make returned rows an explicit observation choice. An empty body by itself does not establish a zero-row mutation. |
| T12 | PostgREST 16, [Functions as RPC](https://docs.postgrest.org/en/stable/references/api/functions.html) | POST argument mapping and schema-cache note | Supports a JSON RPC caller and refresh after definition changes. No course RPC was deployed or invoked. |
| T13 | Supabase, [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data) | Profile relation to managed primary key; trigger failure warning | Informs missing-profile and provisioning-repair exercises. Its sample cascade policy is not imported into order-history retention. |
| T14 | Supabase, [User sessions](https://supabase.com/docs/guides/auth/sessions) | Access/refresh model, sign-out session lookup and timeout cleanup | Distinguishes token lifetime, session status and application membership. A current membership check alone does not prove logout invalidation. |
| T15 | Supabase, [Password-based Auth](https://supabase.com/docs/guides/auth/passwords), displayed update 2026-11-11 | Hosted versus local email-confirmation defaults | Requires explicit setup settings. Confirmed test accounts do not establish delivery, redirect or recovery flows. |
| T16 | Supabase, [Server-side client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client#choosing-an-auth-method), displayed update 2026-10-22 | Choosing an auth method; caching considerations | Explains the three SDK operations without adopting the guide's framework setup. A cached user object is not independent proof of current identity. |
| T17 | PostgreSQL 17, [Comparison functions](https://www.postgresql.org/docs/17/functions-comparison.html) | Ordinary NULL comparisons | Corrects the distinction between unknown and false; no synthetic runtime output was invented. |
| T18 | PostgreSQL 17, [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) | USING versus WITH CHECK, true/false/null and omitted-check behavior | Grounds visibility and proposed-row test design. We avoid asserting every forbidden UPDATE must throw. |
| T19 | PostgreSQL 17, [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) | Execution identity and safe definer functions, including default PUBLIC execution | Defines the final RPC review obligations. It does not prove that the proposed function is safe without implementation and tests. |
| T20 | PostgreSQL 17, [Row Security Policies](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | Owner/bypass rules and cross-table policy race example | Supports privileged-caller controls and explicit limits on revocation. RLS is not a universal synchronization mechanism. |
| T21 | PostgreSQL 17, [Transaction Isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | Read Committed snapshots, concurrent updates and sequence exception | Grounds proposed revocation ordering and rollback observations. No new concurrent schedule was executed. |
| T22 | Supabase, [CLI getting started](https://supabase.com/docs/guides/local-development/cli/getting-started) | Container requirement, Windows options and experimental native platform support | Documents feasible routes. Runtime installation and project creation were not performed. |
| T23 | Supabase, [Custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas), displayed update 2026-09-03 | Schema exposure setup | Supports feasibility of a dedicated API schema. Its broad sample grants should not replace a deliberate per-object privilege design. |

## Important source disagreements and limits

The Supabase RLS guide uses shorthand that can hide two different mechanisms: no authenticated context versus an expired supplied JWT, and NULL comparison versus false. The memo uses PostgREST validation/error documentation and PostgreSQL comparison/policy documentation to keep those distinctions precise.

Nile's thread-local identity problem motivates a negative test, but its remedy is not copied into PostgREST. The platform already has a defined transaction-context mechanism; the lab must observe it through the actual caller path.

Some search results suggested that invalid asymmetric tokens silently fall back to anonymous access, or proposed elevated credentials as a fix. Those unverified comments were excluded. They conflict with the documented validation-error boundary and cannot justify weakening the test caller.

Neither official documentation nor the source migration proves the future project's deployed settings. The memo therefore makes runtime identification, sanitized request observations and actual allow/deny cases part of implementation acceptance.

## Repository evidence inspected

- `AUTHORING.md`: concrete question, worked example, prediction/feedback, changed setting, retrieval, original-source attribution, supported-environment and reader publication checks.
- `PUBLICATION.md`, `COURSE_MAP.md`, `TOPIC_INVENTORY.md`, `REVIEW.md`, `SOURCES.md`: current route, remaining authenticated-access outcomes and existing source boundaries.
- `labs/32-request-replay/setup.sql`, `solution.sql`, `request.mjs`: store/key uniqueness, actor-free operation, accepted receipt and direct `pg` caller.
- `package.json`, `tests/verify.mjs`, `tests/check-links.mjs`: existing dependencies and verification scope; no complete HTTP/Auth harness.
- `learning/MASTER_CURRICULUM_v0.3.md`: independent-practice expectations and personal scope; no pacing dependency imposed on the master course.
- New identity/permissions report and research log: simulated identity boundary and claimed native permission experiments; treated as related, unfinished work from another chat.
- Live upstream metadata, all eight default-branch commits, empty all-state PR/issues lists, local history, clean tracked/index state and exact live-SHA divergence.

All repository reads were read-only. Files mentioned here are existing inputs, not changed deliverables.

## Completion audit

| Research requirement | Evidence delivered | Status |
| --- | --- | --- |
| Decide what comes next from the actual course | Current inventory/history inspection and explicit selection criteria in memo | Complete |
| Respect comprehensive master-course scope | Independent authoring trajectory; depth-based word estimate; later branches retained | Complete |
| Read referenced chats and personal curriculum | Chat reads plus curriculum inspection; relevant editorial implications stated | Complete |
| Confirm commit and duplication state | Live upstream SHA, 11/0 divergence, commits and empty PR/issues collections | Complete for the research snapshot |
| Investigate original engineering experience | Three opened originals with attribution, relevant passages and teaching consequences | Complete |
| Validate technical assumptions | Official technical references and pinned UID implementation, with disagreements resolved narrowly | Complete as research, not runtime certification |
| Make the next batch concrete | Three questions, connected fixtures, predictions, transfers, policy alternatives and required observations | Complete |
| Establish implementation feasibility and unknowns | PATH check, documented local/hosted routes and explicit environment prerequisites | Complete; runtime setup remains implementation work |
| Preserve scope | Two artifact documents; final Git inspection still shows no tracked or staged changes and the same two unrelated untracked directories | Complete |
| Distinguish proposed outcomes from evidence | Matrix explicitly future-facing; no new SQL/Auth execution claimed | Complete |

The research objective does not include implementing the lessons, provisioning a project or passing the future test matrix. Those are concrete next work, not silently weakened research evidence.

Final artifact checks passed: five local links resolve, Markdown fences and table column counts are consistent, 25 verification scenarios have unique IDs, and the register contains three firsthand accounts plus 23 technical references. Narrative review checked the key/replay/revocation policies against the proposed journey and kept every future experiment distinct from observed evidence. External sources were opened during research; this is not a continuing availability guarantee. No SQL or integration suite was run because no executable course material changed.
