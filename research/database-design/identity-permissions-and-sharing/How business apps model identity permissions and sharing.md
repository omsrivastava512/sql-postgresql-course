# How business apps model identity, permissions and sharing

Research and first executions: 12 Nov 2026. Fresh document-extracted reproduction and final audit: 13 Nov 2026 (Asia/Calcutta).

Alice owns a workspace at Alpha and reads one document at Beta. Bob joins Alpha, edits a project document, then loses access while his browser remains signed in. The difficult question is not whether a table contains a role named `editor`. It is which facts authorize Bob's particular request, when those facts were checked, and what happens if they change before the request finishes.

Follow [the small mechanisms](#first-separate-identity-membership-and-permission), [the connected journey](#follow-alphas-project-through-changing-access), and [the SpiceDB comparison](#repeat-the-core-decisions-in-spicedb). The PostgreSQL model works through invitations, permission administration, edits, moves, ownership and removal. SpiceDB repeats the core permission decisions and exercises the extra application/service boundary. Authentication protocols, nested groups, explicit denies, public links and global-scale operations receive focused explanations rather than complete implementations.

Primary-source facts are attributed where they influence a decision. The named people, policies and schemas below are our teaching example. **Observed** identifies results of the local experiments; **proposed** identifies work beyond them. The [research log](Research%20log.md) contains source details, reproduction material and evidence boundaries.

## First separate identity, membership and permission

Alice's application account identifies her across workspaces. An external identity connects a validated identity-provider subject to that account. A session lets subsequent requests establish that identity. Membership says that this account participates in a particular organization. A role or grant supplies some of that membership's powers. These records have different lifetimes: removing Alice from Alpha should not accidentally remove her Beta membership or merge her account with someone who uses a similar email address.

OpenID Connect specifies issuer and subject together as the stable identity key; email is not that key. That motivates the example's unique `(issuer, subject)` mapping. Actual token validation must precede the mapping lookup; a client-supplied issuer string is not proof of authentication. Pairwise subjects also mean an application cannot assume it can correlate identities across clients by subject alone. [OpenID Connect Core, identity claims](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability)

Our fixture seeds `account`, `identity_link` and `login_session`. `actor_for_session` models resolving an active, unexpired local session to an enabled account. Its predictable session names are test identifiers, not usable session credentials. The mutation procedures accept an already-trusted account ID; a real request adapter must supply it from authentication, never from an editable `actor` field in the request body. No identity provider or authentication endpoint is implemented here.

Provisioning answers a different question from sign-in: what membership or lifecycle changes should an enterprise directory cause? SCIM defines user/group data, and deliberately leaves the exact meaning of the user's `active` status to the service provider. The application must map a trusted provisioning event to its own account or membership policy, including how repeated or delayed events are handled. Do not translate every organization removal into disabling a global account. [SCIM core schema, administrative status](https://www.rfc-editor.org/rfc/rfc7643#section-4.1.1)

Likewise, SSO logout needs application cooperation. OpenID Connect back-channel logout communicates a logout event directly to the relying application, which must validate it and terminate the relevant application sessions. This is distinct from changing resource permissions. Account recovery must reconnect the legitimate person to the correct existing account and apply the chosen session-revocation policy; it must not silently recreate removed organization access. [OpenID Connect back-channel logout](https://openid.net/specs/openid-connect-backchannel-1_0.html)

**Predict:** Bob's local session remains valid after Alpha removes him. Can he read Alpha's document? In this model, no: session resolution still returns `bob`, but the subsequent active-membership and permission checks deny access. Signing in again cannot recreate the missing authorization.

## Build a decision from smaller mechanisms

Start with the question `may this actor perform this action on this resource in this organization?` The organization and resource must agree; permission to read Alpha's `doc` says nothing about Beta's `doc`.

| Mechanism | Concrete meaning | Why it is separate |
| --- | --- | --- |
| Membership | Bob's participation in Alpha is membership 7 | Removing and later reinviting him need not reactivate old assignments |
| Role definition | `editor` contains `view` and `edit` | A reusable set of actions is not yet an assignment to any resource |
| Team membership | Membership 7 belongs to Alpha's Design team | Team changes can affect many resources without copying grants onto every user |
| Grant | Design has `editor` on `project` | Role, subject and resource scope meet here |
| Inheritance | `doc` is inside `project` | Access can come from an ancestor even when the document has no direct grant |
| Direct exception | Bob also has `reader` directly on `doc` | Removing one inherited route may leave another valid route |
| Administrative authority | Alice may change membership and sharing as Alpha owner | Editing content does not authorize rewriting one's own permissions |

The model combines positive grants. Its decision requires an enabled account, an active membership, an existing resource in that organization, and either ownership or a qualifying grant on the resource or an ancestor. `permission_paths` returns the matching paths for an internal explanation; `allowed` reduces that to a boolean. Exposing all those paths to an unauthorized caller could reveal private team or resource names, so the trace is not automatically a public API response.

The role-to-action mapping is a small RBAC mechanism. Following team membership and resource ancestry is relationship-based authorization. An attribute rule could additionally require a trusted device or a time bound. These mechanisms can be combined, but each new condition needs a trustworthy source and an explicit evaluation time. A device claim copied from a request body supplies neither.

Real products deliberately choose different rules. Discord combines guild roles and channel overwrites in a defined order; role-specific allows can survive role-specific denies, member overwrites apply later, and administrator permission bypasses channel overwrites. Role position has additional administrative uses. Consequently, “highest role wins” and “deny always wins” are both inadequate descriptions of its system. Our additive model is a different policy. [Discord permissions](https://docs.discord.com/developers/topics/permissions)

Google Drive documents inherited folder permissions, extra child grants, limited-access exceptions and reevaluation when items move. Its computed file capabilities also help a client show currently available actions. Those concepts motivate the move and sharing examples here; they do not establish Google's internal tables or eliminate the need for server enforcement. [Drive sharing and inheritance](https://developers.google.com/workspace/drive/api/guides/manage-sharing)

## Follow Alpha's project through changing access

The initial rows describe two existing organizations. Alpha has Alice as owner (membership 1), Dan as a regular member (3), Cara as a guest (4), and Exportbot as a service principal (5). Beta has Alice as a reader (2) and Dan as owner (6). Bob has an account and session but no membership yet.

Alpha's hierarchy is `root → project → doc`, with a separate `private → other` branch under `root`. Beta has its own `doc`. All initial resource versions are 1. Alice's Beta reader grant is grant 1. The fixed roles are `reader`, `editor`, and an illustrative custom `exporter` role containing `view` and `export`.

Our explicit policies are intentionally small: owners can administer and access all organization resources; ordinary memberships confer no content access on their own; guests and service principals get direct scoped grants and cannot join teams; only owners administer roles, teams, sharing and moves. One-level teams are implemented. A membership's identity is never reused after removal. These are product choices, not universal definitions of owner, guest or service account.

### Invite Bob, then give him useful access

Alice submits invitation I1 for Bob. The backend supplies authenticated Alice, resolves Alpha, and binds this illustrative invitation to Bob's known account. Before the transaction, no I1 or Bob membership exists. `invite_person` locks Alpha, verifies Alice's current ownership, validates the deadline, and writes the invitation plus its audit event. A retry of I1 must contain the same target, kind and deadline; changed inputs conflict.

A real email invitation needs a protected invitation token and verified recipient-binding policy before it can resolve the account. This fixture starts after that resolution. Forwarding an email or claiming an address in an unauthenticated request is not equivalent to proving the intended identity.

Bob's acceptance supplies I1 and authenticated Bob. It locks the same organization, checks the target, state and current deadline, then creates membership **7**, marks I1 accepted and records the event together. Commit makes the membership available. Concurrent acceptance waits and returns the same membership; cancellation first makes acceptance fail. Acceptance first makes later cancellation reject with an instruction to revoke membership explicitly. The test also verifies that an invitation expiring during a lock wait cannot slip through using an old time value.

Bob now sees that he joined Alpha, but `allowed(alpha,bob,doc,view)` is still false. Alice adds membership 7 to Design and grants Design the editor role on `project`. The document inherits view and edit through its parent. There is no copied per-document grant for every Design member. If Bob is removed from Design, that path disappears on the next decision.

### Share one document and distinguish content from administration

Alice grants Cara reader on `doc`, Exportbot the custom exporter role on `doc`, and Bob a direct reader grant on `doc`. Before these changes, Cara and Exportbot cannot open it. After commit, Cara can view but cannot edit or open `other`; Exportbot can view/export this document but cannot edit it or export `other`.

Bob now has two reading paths: **grant 2** at `project` through Design and **grant 5** at `doc` through membership 7. A direct reader grant does not lower the inherited editor grant. It adds another route. The fixture rejects Bob trying to grant himself new rights or rewrite his role, and rejects Cara joining Design under the stated guest policy.

An export job must authenticate its service principal and check the requested operation/resource at execution. If a human requested it, the product must also define whether the job acts on that person's continuing authority or on an independently accepted organizational obligation. The model demonstrates the scoped service-principal decision; a job queue, credential rotation and downloadable export lifecycle are proposed integration work.

GitHub makes a related distinction between repository roles, organization base access and owner powers. Its documentation also warns that a deploy key can retain access after the person who installed it leaves. That is a concrete reason to inventory independent credentials when offboarding someone; deleting a membership is not proof that every access path vanished. [GitHub repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)

### Edit, then move the same document

Bob submits an edit of Alpha's `doc`, expected version 1 and new content. The service supplies authenticated Bob. `edit_resource` locks Alpha, rechecks active membership and current `edit` permission, and conditionally updates the document to version **2** with an audit event. A failure rolls both back. A stale version rejects instead of overwriting another editor's accepted content.

Alice next moves that same document into `private`, expecting version 2. The move validates an in-organization folder destination, rejects cycles, and commits parent `private` and version **3** together. Its content remains `Bob edit`. Bob loses the inherited editor path from `project`, but his direct reader grant 5 still applies. Cara's direct reader grant also stays with the document. The resource identity and direct grants survive a move; ancestry changes.

**Predict:** Bob retries an old edit form after the move. Does the expected-version check alone explain rejection? No. He has lost edit permission, and the procedure checks that first. Even a refreshed version number cannot authorize the write. The observed move-versus-edit race confirms that a waiting edit rechecks the new access situation.

Alice can now remove Cara's direct grant. The first removal succeeds, a repeated removal has no second effect, and Cara loses access because no other route remains. Alice also changes `exporter` to contain only `view`. Exportbot retains reading and loses export permission without changing its identity or assignment. An invalid action in a role replacement rejects the whole transaction and leaves the prior definition intact.

### Transfer ownership, remove Bob, then invite him again

Alice transfers Alpha ownership to Dan's existing active regular membership 3. The transaction grants Dan ownership before removing Alice's owner flag, and commits both changes with one audit event. Alice remains a member, but in this fixture she has no independent Alpha content grant. Her Beta reader access is unaffected. The old owner can no longer perform administrative mutations.

This is organization ownership under our policy. Drive's ownership-transfer rules vary by storage/account context, including organization ownership of shared-drive content and consent for consumer-account transfers. Transferring an organizational control role and transferring personal file ownership therefore need separate requirements. [Drive ownership transfer](https://developers.google.com/workspace/drive/api/guides/transfer-file)

Dan removes Bob's membership 7. After commit, its active and owner flags are false; old team membership and grant 5 remain historical references to **7**. `session-bob` still resolves to Bob, but Alpha reads fail. The already-committed edit remains in the document. Revocation controls subsequent authorized operations; it does not undo history or recall a copy already downloaded.

A replay of accepted I1 returns membership 7 as the historical result. It does not reactivate it. Dan issues I2 and Bob accepts, receiving **membership 8**. Membership 8 has no Design assignment or grant 5, so access is not restored automatically. Deliberate reassignment is required. This choice prevents an old invitation or a later rejoin from silently resurrecting past authority.

The owner-removal guard also has a concurrency boundary. With two owners, independent reads of “there are two” would not prevent both leaving. In the experiment, removals take the same organization lock; the second checks the committed result of the first and rejects removal of the last owner.

## Why these columns, constraints and locks exist

Composite foreign keys carry the organization through memberships, teams, resources and grants. They reject a reference to Beta's membership inside an Alpha grant even when both refer to Alice. A resource parent must belong to the same organization. A foreign key alone cannot prevent a longer hierarchy cycle, require a folder parent, or authorize a move; `move_resource` enforces those rules under the mutation protocol.

`membership.id` is the identity of a particular participation, while `(org, account_id)` has a partial unique index permitting only one active participation. Retaining inactive rows makes old grants and audit events explainable. `resource.version` handles conflicting content/location updates. `policy_version` and `applied_version`, introduced in the service experiment below, instead track delivery of authorization changes. They are not interchangeable clocks.

The organization lock gives this small model one coordination point. Every cooperating permission mutation and protected edit takes it before checking current facts. At Read Committed, later statements can see newer committed data; acquiring a lock and then rechecking matters. This protocol trades concurrency for an explanation that can be tested in both orderings. It is not a recommendation to serialize every operation of a large workspace. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html)

| Observed competing schedule | Result after the first transaction finishes |
| --- | --- |
| Revoke first, then edit | The edit waits, then fails; document version remains 1 |
| Edit first, then revoke | The edit commits version 2; revocation then completes |
| Revoke rolls back | The waiting edit succeeds because removal never committed |
| Cancel invitation first | Waiting acceptance rejects |
| Accept invitation first | Waiting cancellation rejects; membership needs explicit removal |
| Two acceptances | Both return membership 7; one acceptance audit event exists |
| Invitation expires while waiting | Acceptance checks the current clock and rejects |
| Two owners remove themselves | The second removal rejects; an active owner remains |
| Move or team removal first | Waiting edit loses its qualifying path and rejects |

These are actual independent PostgreSQL connections with a third connection observing blockers. A permission query alone is not a lock. The standalone `allowed` query describes its database snapshot; using that answer later requires the same application coordination as any other check-then-act sequence.

The functions run as invoker with trusted actor parameters. Arbitrary SQL clients can bypass them, and audit rows are not made tamper-proof against privileged writers. Deployable APIs need restricted database credentials, controlled mutation paths and validated request identity. RLS can add row-level enforcement, but it has its own role and bypass rules; testing as a superuser is not evidence of isolation for an ordinary application role. This experiment implements neither a production RLS perimeter nor a public API. [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)

## Repeat the core decisions in SpiceDB

SpiceDB stores relationships and computes permissions from its schema. The application still owns accounts, organization/resource existence, invitation workflows and content. Our comparison represents membership 7 as an object whose `active` relation reaches user Bob. Teams and grants refer to that membership's active users. Deleting its active relationship disables its old paths; a later membership 8 is a different object.

Roles remain reusable action sets. A binding combines a subject with a role. A resource combines its bindings, inherited permissions and owner permission, then intersects them with active organization participation. The explicit parentheses matter: SpiceDB documents an unusual union precedence, so the schema spells out the intended grouping. [SpiceDB schema language](https://authzed.com/docs/spicedb/concepts/schema)

The following is the exact compiled schema used in the experiment. The comparison covers `view`, `edit` and `export`; invitation and administrative mutation workflows remain in PostgreSQL. The schema's `user` type represents both human and service principals; credential validation stays with the application. The `user:*` action markers mean a role permits that action for whichever users its binding selects; they do not independently grant public resource access.

```zed
definition user {}
definition membership {
  relation active: user
}
definition organization {
  relation participant: membership#active
  relation owner: membership#active
  permission active = participant
  permission admin = owner
}
definition team {
  relation member: membership#active
  permission active = member
}
definition role {
  relation viewer: user:*
  relation editor: user:*
  relation exporter: user:*
  permission view = viewer
  permission edit = editor
  permission export = exporter
}
definition binding {
  relation subject: membership#active | team#active
  relation role: role
  permission view = subject & role->view
  permission edit = subject & role->edit
  permission export = subject & role->export
}
definition resource {
  relation org: organization
  relation parent: resource
  relation grant: binding
  permission view = (grant->view + parent->view + org->admin) & org->active
  permission edit = (grant->edit + parent->edit + org->admin) & org->active
  permission export = (grant->export + parent->export + org->admin) & org->active
}
```

In the fixture, `team:alpha__design#member@membership:7#active`, the membership-to-Bob relationship, the editor binding and the document's parent jointly explain the inherited decision. Removing any necessary edge breaks that route. The log's projection code shows the complete records; it rebuilds relationships from validated SQL fixtures for equivalence tests. It is not a production synchronization algorithm. [SpiceDB relationships](https://authzed.com/docs/spicedb/concepts/relationships)

**Observed:** both implementations produced the specified results for Alice's different organization roles, Bob's inherited editing, Cara's direct guest access, Exportbot's custom role, team removal, grant removal, role changes, document moves, ownership transfer, membership removal and rejoining. The test checks independently specified expected results in each implementation, rather than merely asserting that they agree.

The engine's schema checks relation and subject types. It does not inherit the application's composite foreign keys. In a deliberate negative control, a privileged engine request constructed a binding from Alice's Alpha membership to Beta's document. Alice participates in both organizations, so the resulting graph granted Beta editing. The corresponding application mutation rejects the foreign membership. This is an observed example of why validating relationship writes and tenant boundaries remains an application responsibility. The malformed graph was removed by rebuilding the controlled fixture.

Pinned implementation inspection supports the narrower engine boundaries: the relationship-write path validates updates/preconditions inside a datastore transaction and returns a revision token; the permission-check path reads at its selected revision. Neither transaction includes an arbitrary content update in our separate application database. See the pinned [relationship-write implementation](https://github.com/authzed/spicedb/blob/7074da7242e5aedfeb4586d93a403eca45388ada/internal/services/v1/relationships.go#L414) and [permission-check implementation](https://github.com/authzed/spicedb/blob/7074da7242e5aedfeb4586d93a403eca45388ada/internal/services/v1/permissions.go#L78).

## A fresh decision and a safe write are separate promises

First consider freshness. The experiment records a successful check, removes Bob's active relationship, and retains the write's ZedToken. A subsequent check using `at_least_as_fresh` with that token denies; a fully consistent check also denies. An exact-snapshot check at the earlier token still allows, correctly describing the earlier state. That historical result is not evidence of a cache bug.

Across runs, the default-consistency observation returned both denial and allowance after revocation. In the first 133-check run on 12 Nov it still allowed after the token-bounded and fully consistent checks had denied; the fresh reproduction on 13 Nov denied. The test records either result without requiring staleness; an earlier fresh result does not upgrade the default contract. The documentation describes latency-oriented checks, revision-bounded checks and fully consistent checks; the latter uses a snapshot selected when the call starts. A returned ZedToken is an opaque consistency marker, not a bearer credential authorizing its holder. [SpiceDB consistency](https://authzed.com/docs/spicedb/concepts/consistency)

Now consider action ordering. The negative-control script obtains a fresh `edit` permission, revokes it in SpiceDB, then issues an unguarded SQL content update using the earlier answer. The update succeeds. The engine did not participate in that later write, and no application lock or validation prevented it.

The coordinated experiment acquires the application's Alpha lock before the external check and retains it through the content transaction. A cooperating application-membership revocation waits; the edit commits first, then revocation proceeds. In the reverse ordering, the waiting external edit rejects at the application's current-membership gate and leaves document version 1 unchanged. Engine relationship delivery is tested separately below. This gives a defined serialization point only for participants following the same protocol. It holds a database lock during an external request, so timeouts, contention and outage handling are material costs. A short-lived decision or even the strongest read consistency does not automatically create this coordination.

### Deliver a permission change without pretending two stores share a commit

Suppose the application commits Bob's removal, but the worker has not updated SpiceDB. A check against the engine alone can still allow him. Requiring a fresh engine read cannot reveal a change that never reached that engine.

Our bounded experiment uses these records on Alpha:

| Point | Application state | Engine state | Adapter behavior |
| --- | --- | --- | --- |
| Before removal | `policy_version=0`, `applied_version=0`; Bob active | Bob's active edge exists | Normal checked access |
| Removal committed | Bob inactive; version 1; pending delivery 1 | Old edge may remain | Removed Bob denied; affected organization access reports pending |
| Engine applied, acknowledgement lost | Application still pending | Bob's edge is gone | Continue pending; do not infer acknowledgement from elapsed time |
| Retried and acknowledged | Both versions 1; token stored; delivery applied | Repeated deletion has same effect | Other authorized users resume; Bob stays denied |

The application transaction stores removal, the version advance and the exact engine update together. The worker takes the organization lock, reads only the next pending version, sends the deletion and records its acknowledgement/token. A simulated crash after the engine response rolls back only local acknowledgement. Retrying that deletion completes recovery. A subsequent delivery sees nothing pending; a later policy change is refused while the first remains pending, preventing it from overtaking an older operation.

**Observed:** the engine alone still allowed before delivery; the adapter blocked the affected organization; the engine denied after the injected crash; local pending state survived; retry acknowledged the same transition and restored the unaffected owner's access. The full acknowledgement boundary, including its availability cost, is visible to the application. The adapter's version/token use follows the purpose of read-after-write consistency. [SpiceDB read-after-write guidance](https://authzed.com/docs/spicedb/concepts/read-after-write)

This experiment implements one removal event and its replay, not a universal projector. General role edits, resource moves, bulk provisioning, account-wide disablement and schema changes need their own ordered event payloads and coordination. The harness's full fixture rebuild must never be mistaken for that production worker. A lost grant acknowledgement should be analyzed separately from a lost revocation acknowledgement because their exposure and availability consequences differ.

## Enforce the decision wherever information leaves

An API should derive the actor, bind the organization/resource, evaluate the current operation, then apply the chosen read or mutation boundary. A guessed ID does not bypass this sequence. The harness's `guardedCheck` returns a decision for inspection; consuming that result in a later uncoordinated operation would recreate the race. `externalEditInTransaction` instead checks and writes while the caller retains the transaction lock. These surrounding integration rules are proposed application behavior:

- **Lists and search:** authorize returned objects and sensitive fields, including names, snippets, counts and suggestions. A stale search index is a candidate source, not the final authority. Pagination must define whether results share a snapshot; filtering a page after fetching it can produce incomplete pages and misleading totals.
- **Downloads and public links:** a checked file request and a previously issued storage capability are different access paths. Revoking application membership need not revoke an already-issued URL or erase downloaded bytes. Define capability lifetime, delivery checks and any provider-specific revocation mechanism.
- **Open tabs and caches:** hide or refresh controls for usability, then enforce the request again. Cache keys need the relevant actor, organization, resource, action and policy/consistency context. A TTL describes permitted staleness; it is not an immediate-revocation guarantee.
- **Jobs and exports:** retain the requesting/effective principal, resource scope and accepted operation identity. Check at the chosen execution and delivery boundaries. A retry must not become an unscoped administrator action because the original user left.
- **Support and administration:** explain the path granting access, protect that explanation itself, and audit repair actions. Emergency access requires a deliberate policy and credential boundary, not an undocumented bypass in ordinary permission code.

Nested teams add transitive membership, cycle handling and more expensive explanations. Explicit deny rules add precedence. Attribute rules add contextual facts and evaluation-time questions. Public links add capability possession as a subject. These are useful extensions, but extending a schema without specifying their interactions can change who has access in unexpected ways.

## Transfer exercise: exclude Bob from one confidential subtree

Change the requirement: Bob may remain an editor on Project, but an explicit exclusion on a confidential folder must deny him access throughout that subtree, even if a child has a direct grant. Organization owners retain their recovery access. How must the decision change?

**Hints:** removing Bob's direct document grant leaves the inherited team path. Removing him from Design affects unrelated projects. Consider carrying a separate exclusion result down the ancestry, then applying it to all ordinary positive paths. Decide explicitly where the owner exception belongs.

**Explained answer:** introduce exclusions scoped to membership and resource ancestry. For an active ordinary member, evaluate positive access and then subtract any applicable ancestor or direct exclusion; owner recovery access is a separate explicit branch. In SQL, both positive paths and exclusions must inspect the relevant ancestry under the same mutation coordination. In SpiceDB, propagate an exclusion permission independently and apply it to the combined positive permission. Merely using the parent's already-filtered `view` result is insufficient: a child direct grant could reopen access. Membership removal must still defeat every ordinary path. Test team-plus-direct grants, a moved document, owner behavior and rejoining with a new membership. This is a reasoned extension, not executed by the baseline schema, and it deliberately differs from Discord's overwrite algorithm.

## Implementation decisions and what remains to establish

| Concern | PostgreSQL teaching choice | SpiceDB comparison and production evidence needed |
| --- | --- | --- |
| Policy | Additive role grants, active membership gate, owner powers, one-level teams, scoped guests/services | Same bounded decision semantics; validate future deny/nesting/context interactions explicitly |
| Identity boundary | Seeded local account/session resolution; trusted actor parameters | Same application responsibility; real token validation, identity linking, recovery and provisioning integration are untested |
| Integrity | Composite keys plus guarded administration/move procedures | Application validates organization/resource relationships before engine writes; typed relations alone do not establish business integrity |
| Transactions | Organization lock coordinates current checks, edits and access mutations | Engine writes have their own transaction; application content and relationship delivery need explicit coordination |
| Retry | Stable invitation identity, historical acceptance result, fresh membership on rejoin; repeated grant removal has no second effect | Removal delivery is ordered and replayable; general event projection and reconciliation remain work |
| Revocation | Subsequent cooperating operations recheck membership/grants | Pending delivery denies affected access; revision tokens constrain engine freshness after delivery; independent URLs/credentials remain separate |
| Operations | Audit accepted transitions, inspect matching paths, retain membership history | Monitor pending age, delivery failures, denied/error outcomes, reconciliation drift and lock waits; exercise repairs, backups and retention at real scale |
| Security perimeter | Procedures assume controlled writers; no production RLS/API boundary | Engine credentials are privileged; isolate administration and protect traces, keys and relationship writes |
| Scale | Small synthetic data and coarse locking | No latency, throughput, global distribution, tenant-escape or production-readiness claim |

A useful independent learner attempt is to explain Bob's two access paths, predict the move and rejoin outcomes, and then design the exclusion change without accidentally reopening access. Passing the executable checks establishes the tested behavior; it does not establish that a reader can yet do that unaided.

A separate identity-lifecycle investigation can cover registration, credential storage, passkeys/MFA, protocol implementation, identity linking, recovery abuse and full SSO/SCIM integration. Those topics matter, but this report's detailed subject is the permission decision and its enforcement over time.

## Runnable PostgreSQL model

Use a disposable PostgreSQL 17 database. The setup creates only `perm_lab`; resetting that schema belongs to the reproduction harness. Read the small mechanisms and journey above before the procedures below. Authentication and direct-SQL privileges remain outside this fixture's perimeter. Setup seeds existing organizations and identities; the next block executes Bob's journey with ordinary statement autocommit.

```sql
CREATE SCHEMA perm_lab;
SET search_path = perm_lab, public;
CREATE TABLE account (id text PRIMARY KEY, enabled boolean NOT NULL DEFAULT true);
CREATE TABLE identity_link (
  issuer text, subject text, account_id text NOT NULL REFERENCES account,
  PRIMARY KEY (issuer, subject)
);
CREATE TABLE login_session (
  id text PRIMARY KEY, account_id text NOT NULL REFERENCES account,
  active boolean NOT NULL DEFAULT true, expires_at timestamptz NOT NULL
);
CREATE TABLE organization (
  id text PRIMARY KEY, policy_version bigint NOT NULL DEFAULT 0,
  applied_version bigint NOT NULL DEFAULT 0, consistency_token text,
  CHECK (applied_version <= policy_version)
);
CREATE TABLE membership (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  org text NOT NULL REFERENCES organization, account_id text NOT NULL REFERENCES account,
  kind text NOT NULL CHECK (kind IN ('member','guest','service')),
  active boolean NOT NULL DEFAULT true, owner boolean NOT NULL DEFAULT false,
  UNIQUE (org,id), CHECK (NOT owner OR kind = 'member')
);
CREATE UNIQUE INDEX one_active_membership ON membership (org,account_id) WHERE active;
CREATE TABLE invitation (
  org text NOT NULL REFERENCES organization, id text NOT NULL,
  account_id text NOT NULL REFERENCES account, kind text NOT NULL CHECK (kind IN ('member','guest')),
  expires_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','accepted','cancelled')),
  accepted_member bigint, PRIMARY KEY (org,id),
  FOREIGN KEY (org,accepted_member) REFERENCES membership (org,id),
  CHECK ((state = 'accepted') = (accepted_member IS NOT NULL))
);
CREATE TABLE team (org text REFERENCES organization, id text, PRIMARY KEY (org,id));
CREATE TABLE team_member (
  org text, team_id text, member_id bigint,
  PRIMARY KEY (org,team_id,member_id),
  FOREIGN KEY (org,team_id) REFERENCES team (org,id),
  FOREIGN KEY (org,member_id) REFERENCES membership (org,id)
);
CREATE TABLE role (org text REFERENCES organization, id text, PRIMARY KEY (org,id));
CREATE TABLE role_action (
  org text, role_id text, action text CHECK (action IN ('view','edit','share','export')),
  PRIMARY KEY (org,role_id,action), FOREIGN KEY (org,role_id) REFERENCES role (org,id)
);
CREATE TABLE resource (
  org text REFERENCES organization, id text, parent text,
  kind text NOT NULL CHECK (kind IN ('folder','document')),
  content text NOT NULL DEFAULT '', version bigint NOT NULL DEFAULT 1,
  PRIMARY KEY (org,id), FOREIGN KEY (org,parent) REFERENCES resource (org,id),
  CHECK (id IS DISTINCT FROM parent)
);
CREATE TABLE access_grant (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org text NOT NULL, resource_id text NOT NULL, role_id text NOT NULL,
  member_id bigint, team_id text,
  CHECK ((member_id IS NOT NULL)::int + (team_id IS NOT NULL)::int = 1),
  FOREIGN KEY (org,resource_id) REFERENCES resource (org,id),
  FOREIGN KEY (org,role_id) REFERENCES role (org,id),
  FOREIGN KEY (org,member_id) REFERENCES membership (org,id),
  FOREIGN KEY (org,team_id) REFERENCES team (org,id),
  UNIQUE NULLS NOT DISTINCT (org,resource_id,role_id,member_id,team_id)
);
CREATE TABLE audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, org text NOT NULL REFERENCES organization,
  actor text NOT NULL REFERENCES account, action text NOT NULL, details jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE policy_delivery (
  org text NOT NULL REFERENCES organization, version bigint NOT NULL,
  updates jsonb NOT NULL, state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','applied')),
  token text, PRIMARY KEY (org,version)
);
CREATE FUNCTION actor_for_session(p_session text) RETURNS text LANGUAGE sql STABLE AS $$
  SELECT a.id FROM login_session s JOIN account a ON a.id=s.account_id
  WHERE s.id=p_session AND s.active AND s.expires_at > statement_timestamp() AND a.enabled
$$;
CREATE FUNCTION owner_check(p_org text,p_actor text) RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM membership m JOIN account a ON a.id=m.account_id
    WHERE m.org=p_org AND m.account_id=p_actor AND m.active AND m.owner AND a.enabled)
$$;
CREATE FUNCTION enter_org(p_org text,p_actor text,p_admin boolean DEFAULT true)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE mid bigint;
BEGIN
  PERFORM 1 FROM organization WHERE id=p_org FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'unknown organization'; END IF;
  SELECT m.id INTO mid FROM membership m JOIN account a ON a.id=m.account_id
    WHERE m.org=p_org AND m.account_id=p_actor AND m.active AND a.enabled;
  IF mid IS NULL OR (p_admin AND NOT owner_check(p_org,p_actor)) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;
  RETURN mid;
END $$;
CREATE FUNCTION permission_paths(p_org text,p_actor text,p_resource text,p_action text)
RETURNS TABLE(reason text) LANGUAGE sql STABLE AS $$
  WITH RECURSIVE ancestors AS (
    SELECT id,parent FROM resource WHERE org=p_org AND id=p_resource
    UNION
    SELECT r.id,r.parent FROM resource r JOIN ancestors a ON r.id=a.parent WHERE r.org=p_org
  ), current_member AS (
    SELECT m.* FROM membership m JOIN account a ON a.id=m.account_id
    WHERE m.org=p_org AND m.account_id=p_actor AND m.active AND a.enabled
  )
  SELECT 'organization owner' FROM current_member
    WHERE owner AND EXISTS (SELECT 1 FROM ancestors) AND p_action IN ('view','edit','share','export')
  UNION ALL
  SELECT 'grant ' || g.id || ' at ' || g.resource_id || ' via ' || COALESCE(g.team_id,'member')
    FROM ancestors n JOIN access_grant g ON g.org=p_org AND g.resource_id=n.id
    JOIN role_action ra ON ra.org=g.org AND ra.role_id=g.role_id AND ra.action=p_action
    JOIN current_member m ON g.member_id=m.id OR EXISTS (
      SELECT 1 FROM team_member tm WHERE tm.org=g.org AND tm.team_id=g.team_id AND tm.member_id=m.id)
$$;
CREATE FUNCTION allowed(p_org text,p_actor text,p_resource text,p_action text)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM permission_paths(p_org,p_actor,p_resource,p_action))
$$;
CREATE FUNCTION invite_person(p_org text,p_actor text,p_id text,p_account text,p_kind text,p_until timestamptz)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE old invitation;
BEGIN
  PERFORM enter_org(p_org,p_actor);
  SELECT * INTO old FROM invitation WHERE org=p_org AND id=p_id;
  IF FOUND THEN
    IF (old.account_id,old.kind,old.expires_at) IS DISTINCT FROM (p_account,p_kind,p_until) THEN
      RAISE EXCEPTION 'invitation key conflict';
    END IF;
    RETURN;
  END IF;
  IF p_until <= clock_timestamp() THEN RAISE EXCEPTION 'expired invitation'; END IF;
  INSERT INTO invitation (org,id,account_id,kind,expires_at) VALUES (p_org,p_id,p_account,p_kind,p_until);
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'invite',jsonb_build_object('id',p_id));
END $$;
CREATE FUNCTION accept_invite(p_org text,p_actor text,p_id text) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE inv invitation; mid bigint;
BEGIN
  PERFORM 1 FROM organization WHERE id=p_org FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM account WHERE id=p_actor AND enabled) THEN RAISE EXCEPTION 'identity denied'; END IF;
  SELECT * INTO inv FROM invitation WHERE org=p_org AND id=p_id;
  IF NOT FOUND OR inv.account_id IS DISTINCT FROM p_actor THEN RAISE EXCEPTION 'invitation denied'; END IF;
  IF inv.state='accepted' THEN RETURN inv.accepted_member; END IF;
  IF inv.state <> 'pending' OR inv.expires_at <= clock_timestamp() THEN RAISE EXCEPTION 'invitation unavailable'; END IF;
  INSERT INTO membership (org,account_id,kind) VALUES (p_org,p_actor,inv.kind) RETURNING id INTO mid;
  UPDATE invitation SET state='accepted',accepted_member=mid WHERE org=p_org AND id=p_id;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'accept',jsonb_build_object('member',mid));
  RETURN mid;
END $$;
CREATE FUNCTION cancel_invite(p_org text,p_actor text,p_id text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE inv invitation;
BEGIN
  PERFORM enter_org(p_org,p_actor);
  SELECT * INTO inv FROM invitation WHERE org=p_org AND id=p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'unknown invitation'; END IF;
  IF inv.state='accepted' THEN RAISE EXCEPTION 'already accepted; revoke membership explicitly'; END IF;
  IF inv.state='cancelled' THEN RETURN 'cancelled'; END IF;
  UPDATE invitation SET state='cancelled' WHERE org=p_org AND id=p_id;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'cancel_invite',jsonb_build_object('id',p_id));
  RETURN 'cancelled';
END $$;
CREATE FUNCTION set_team_member(p_org text,p_actor text,p_team text,p_member bigint,p_add boolean)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM enter_org(p_org,p_actor);
  IF NOT EXISTS (SELECT 1 FROM membership WHERE org=p_org AND id=p_member AND active AND kind='member') THEN
    RAISE EXCEPTION 'team needs active regular member';
  END IF;
  IF p_add THEN
    INSERT INTO team_member VALUES (p_org,p_team,p_member) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM team_member WHERE org=p_org AND team_id=p_team AND member_id=p_member;
  END IF;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'team',jsonb_build_object('team',p_team,'member',p_member,'add',p_add));
END $$;
CREATE FUNCTION grant_access(p_org text,p_actor text,p_resource text,p_role text,p_member bigint,p_team text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM enter_org(p_org,p_actor);
  IF p_member IS NOT NULL AND NOT EXISTS (SELECT 1 FROM membership WHERE org=p_org AND id=p_member AND active) THEN
    RAISE EXCEPTION 'inactive or foreign member';
  END IF;
  INSERT INTO access_grant (org,resource_id,role_id,member_id,team_id)
    VALUES (p_org,p_resource,p_role,p_member,p_team) ON CONFLICT DO NOTHING;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'grant',jsonb_build_object('resource',p_resource,'role',p_role));
END $$;
CREATE FUNCTION revoke_member(p_org text,p_actor text,p_member bigint) RETURNS void LANGUAGE plpgsql AS $$
DECLARE m membership;
BEGIN
  PERFORM enter_org(p_org,p_actor);
  SELECT * INTO m FROM membership WHERE org=p_org AND id=p_member;
  IF NOT FOUND THEN RAISE EXCEPTION 'unknown member'; END IF;
  IF NOT m.active THEN RETURN; END IF;
  IF m.owner AND (SELECT count(*) FROM membership WHERE org=p_org AND active AND owner) <= 1 THEN
    RAISE EXCEPTION 'last owner';
  END IF;
  UPDATE membership SET active=false,owner=false WHERE id=p_member;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'revoke',jsonb_build_object('member',p_member));
END $$;
CREATE FUNCTION revoke_grant(p_org text,p_actor text,p_grant bigint) RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  PERFORM enter_org(p_org,p_actor);
  DELETE FROM access_grant WHERE org=p_org AND id=p_grant;
  IF NOT FOUND THEN RETURN false; END IF;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'revoke_grant',jsonb_build_object('grant',p_grant));
  RETURN true;
END $$;
CREATE FUNCTION set_role_actions(p_org text,p_actor text,p_role text,p_actions text[]) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM enter_org(p_org,p_actor);
  IF p_actions IS NULL THEN RAISE EXCEPTION 'actions required'; END IF;
  INSERT INTO role VALUES (p_org,p_role) ON CONFLICT DO NOTHING;
  DELETE FROM role_action WHERE org=p_org AND role_id=p_role;
  INSERT INTO role_action SELECT p_org,p_role,action FROM (SELECT DISTINCT unnest(p_actions) AS action) x;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'role',jsonb_build_object('role',p_role,'actions',p_actions));
END $$;
CREATE FUNCTION transfer_owner(p_org text,p_actor text,p_to bigint) RETURNS void LANGUAGE plpgsql AS $$
DECLARE old_id bigint;
BEGIN
  old_id := enter_org(p_org,p_actor);
  IF p_to=old_id THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM membership WHERE org=p_org AND id=p_to AND active AND kind='member') THEN
    RAISE EXCEPTION 'new owner must be active regular member';
  END IF;
  UPDATE membership SET owner=true WHERE id=p_to;
  UPDATE membership SET owner=false WHERE id=old_id;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'transfer_owner',jsonb_build_object('from',old_id,'to',p_to));
END $$;
CREATE FUNCTION move_resource(p_org text,p_actor text,p_resource text,p_parent text,p_version bigint)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM enter_org(p_org,p_actor);
  IF NOT EXISTS (SELECT 1 FROM resource WHERE org=p_org AND id=p_parent AND kind='folder') THEN
    RAISE EXCEPTION 'parent must be a folder in this organization';
  END IF;
  IF EXISTS (WITH RECURSIVE chain AS (
    SELECT id,parent FROM resource WHERE org=p_org AND id=p_parent
    UNION SELECT r.id,r.parent FROM resource r JOIN chain c ON c.parent=r.id WHERE r.org=p_org
  ) SELECT 1 FROM chain WHERE id=p_resource) THEN RAISE EXCEPTION 'hierarchy cycle'; END IF;
  UPDATE resource SET parent=p_parent,version=version+1 WHERE org=p_org AND id=p_resource AND version=p_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'stale resource'; END IF;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'move',jsonb_build_object('resource',p_resource,'parent',p_parent));
END $$;
CREATE FUNCTION edit_resource(p_org text,p_actor text,p_resource text,p_version bigint,p_content text)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE next_version bigint;
BEGIN
  PERFORM enter_org(p_org,p_actor,false);
  IF NOT allowed(p_org,p_actor,p_resource,'edit') THEN RAISE EXCEPTION 'edit denied'; END IF;
  UPDATE resource SET content=p_content,version=version+1
    WHERE org=p_org AND id=p_resource AND kind='document' AND version=p_version RETURNING version INTO next_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'stale document'; END IF;
  INSERT INTO audit (org,actor,action,details) VALUES (p_org,p_actor,'edit',jsonb_build_object('resource',p_resource,'version',next_version));
  RETURN next_version;
END $$;
INSERT INTO account (id) VALUES ('alice'),('bob'),('cara'),('dan'),('exportbot'),('eve');
INSERT INTO identity_link VALUES ('https://idp.example','alice-42','alice'),('https://idp.example','bob-43','bob');
INSERT INTO login_session (id,account_id,expires_at)
  SELECT 'session-' || id,id,clock_timestamp()+interval '1 day' FROM account;
INSERT INTO organization (id) VALUES ('alpha'),('beta');
INSERT INTO membership (org,account_id,kind,owner) VALUES
  ('alpha','alice','member',true),('beta','alice','member',false),
  ('alpha','dan','member',false),('alpha','cara','guest',false),('alpha','exportbot','service',false),
  ('beta','dan','member',true);
INSERT INTO team VALUES ('alpha','design');
INSERT INTO role SELECT o.id,r FROM organization o CROSS JOIN unnest(ARRAY['reader','editor','exporter']) r;
INSERT INTO role_action
  SELECT org,id,'view' FROM role
  UNION ALL SELECT org,id,'edit' FROM role WHERE id='editor'
  UNION ALL SELECT org,id,'export' FROM role WHERE id='exporter';
INSERT INTO resource (org,id,parent,kind) VALUES
  ('alpha','root',NULL,'folder'),('alpha','project','root','folder'),
  ('alpha','private','root','folder'),('alpha','doc','project','document'),
  ('alpha','other','private','document'),('beta','root',NULL,'folder'),('beta','doc','root','document');
INSERT INTO access_grant (org,resource_id,role_id,member_id) VALUES ('beta','doc','reader',2);
```

## Run the connected journey

Execute these statements individually after fresh setup. The log's harness does that explicitly. Wrapping them all in one transaction would hide the committed intervals between separate user actions. Expected landmarks are membership 7, document versions 2 then 3, reading without editing after the move, Bob still authenticated after removal, and a new membership 8 with no restored access.

```sql
SET search_path = perm_lab, public;
SELECT actor_for_session('session-bob') AS actor,
       allowed('alpha','bob','doc','view') AS may_read;
SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day');
SELECT accept_invite('alpha','bob','I1') AS membership;
SELECT accept_invite('alpha','bob','I1') AS retried_membership;
SELECT allowed('alpha','bob','doc','view') AS membership_is_not_content_access;
SELECT set_team_member('alpha','alice','design',7,true);
SELECT grant_access('alpha','alice','project','editor',NULL,'design');
SELECT grant_access('alpha','alice','doc','reader',4,NULL);
SELECT grant_access('alpha','alice','doc','exporter',5,NULL);
SELECT grant_access('alpha','alice','doc','reader',7,NULL);
SELECT reason FROM permission_paths('alpha','bob','doc','view') ORDER BY reason;
SELECT edit_resource('alpha','bob','doc',1,'Bob edit') AS version;
SELECT move_resource('alpha','alice','doc','private',2);
SELECT allowed('alpha','bob','doc','view') AS may_read,
       allowed('alpha','bob','doc','edit') AS may_edit;
SELECT revoke_grant('alpha','alice',(SELECT id FROM access_grant WHERE org='alpha' AND member_id=4));
SELECT allowed('alpha','cara','doc','view') AS guest_still_reads;
SELECT set_role_actions('alpha','alice','exporter',ARRAY['view']);
SELECT allowed('alpha','exportbot','doc','view') AS bot_reads,
       allowed('alpha','exportbot','doc','export') AS bot_exports;
SELECT transfer_owner('alpha','alice',3);
SELECT revoke_member('alpha','dan',7);
SELECT actor_for_session('session-bob') AS actor,
       allowed('alpha','bob','doc','view') AS may_read;
SELECT accept_invite('alpha','bob','I1') AS historical_membership;
SELECT invite_person('alpha','dan','I2','bob','member',clock_timestamp()+interval '1 day');
SELECT accept_invite('alpha','bob','I2') AS new_membership;
SELECT allowed('alpha','bob','doc','view') AS restored_automatically;
SELECT org,id,account_id,active,owner FROM membership ORDER BY id;
SELECT org,id,parent,version,content FROM resource WHERE id='doc' ORDER BY org;
```

The separate-session and engine experiments reset their own fixtures. Their resets are not subsequent events in Alice's single story. Consult the [research log](Research%20log.md) for the exact executable harness, dated outcomes and completion audit.
