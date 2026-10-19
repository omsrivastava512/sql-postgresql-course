# Topic inventory

Stable IDs group concepts; they are not lesson numbers or completion badges. This inventory contains 132 topic groups: the original 107 retained, plus 25 gaps added during the standalone curriculum audit. A group can contain several objectives at different stages. No group inherits completion from a passing test elsewhere.

## How to read coverage

- **Planned:** no dedicated teaching evidence for the named objective yet.
- **Introduced:** mentioned or briefly illustrated; not fully explained.
- **Explained:** a worked mechanism or comparison supports the named objective.
- **Practised:** an executable learner task exists for the named objective, with inspection or expected outcomes. This describes the material, not a reader's mastery or a public release.

The covered column names the exact objective and its evidence. Everything in the remaining column is planned unless explicitly stated otherwise. If there is no covered objective, the whole group is planned. Combined groups such as NEW/OLD/TG_OP are deliberately not given a misleading single completion status.

**Verification is a separate axis:** the [execution record](VERIFICATION.md) identifies the nine tested lab suites and their limits. An onramp task or written transfer question is not automatically covered by those tests. Neither links nor embedded execution prove hosted setup, concurrent behaviour, or human comprehension.

Route destinations and prerequisite knowledge are in the [course map](COURSE_MAP.md). The [author audit](CURRICULUM_AUDIT.md) maps the source study to these IDs and records why additional topics were selected.

## Values and identity

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| F01 | SQL, PostgreSQL and PL/pgSQL | Introduced: recognize SQL statements and a PL/pgSQL function in examples; [article](articles/00-reading-the-examples.md#the-few-commands-you-need), [article](articles/02-business-rules.md#where-the-check-runs) | Distinguish language, database engine and procedural language explicitly. |
| F02 | Column and table-level declaration syntax | Explained: read a column declaration; [article](articles/00-reading-the-examples.md#the-few-commands-you-need). Introduced: table-level FK form; [article](articles/01-foreign-keys.md#is-references-a-postgresql-invention) | Compare column/table forms through independent declarations. |
| F03 | Schemas and qualified names | Explained: resolve a schema-qualified table name; [article](articles/00-reading-the-examples.md#the-few-commands-you-need) | Create and inspect namespaces; connect name resolution to privileges. |
| F04 | Scalar types: text, integer, UUID, boolean, date and timestamptz | Practised: integer/text input and an incompatible cast; [lab](labs/07-stored-values/README.md#repair-the-question). Introduced: date and Boolean literals; [article](articles/07-stored-values.md#types-make-a-different-promise). UUID generation is covered under F14. | Broader type selection, ranges and timestamptz need dedicated examples. |
| F05 | NULL versus absent input versus empty string | Practised: inspect omitted input, explicit NULL and empty text as different cases; [lab](labs/07-stored-values/README.md#inspect-and-predict). | Apply these distinctions to later imports and application payloads. |
| F06 | DEFAULT values and explicit NULL | Practised: compare omitted input, explicit DEFAULT and explicit NULL; [lab](labs/07-stored-values/README.md#implement-a-stated-policy). | Later migration/default changes are not covered by this insertion exercise. |
| F07 | NOT NULL and CHECK | Practised: design required/nonnegative stock and nonblank-name rules, then reject invalid writes; [lab](labs/07-stored-values/README.md#implement-a-stated-policy). Practised: nullable contact rule; [transfer](labs/07-stored-values/README.md#independent-transfer). | More complex conditional row rules remain under B13; these checks are not complete contact validation. |
| F08 | Primary keys and business identifiers | Practised: separate a membership pair from a scoped card identifier and compare a generated-key alternative; [lab](labs/09-row-identity/README.md#independent-transfer). | Identifier lifecycle decisions such as renames, merging and historical episodes need deeper modelling. |
| F09 | Composite and tenant-scoped uniqueness | Practised: reject duplicate handles within a workspace while allowing them across workspaces; [lab](labs/09-row-identity/README.md#predict-accepted-and-rejected-memberships). | Uniqueness is not tenant authorization; access is covered separately under A10. |
| F10 | UNIQUE and NULL behavior | Practised: repeated NULL under ordinary UNIQUE versus NULLS NOT DISTINCT, plus repeated non-NULL rejection; [lab](labs/09-row-identity/README.md#optional-does-not-mean-duplicated). | Revisit the chosen NULL policy when a later business requirement changes. |
| F11 | Enums versus text plus CHECK | Planned — no dedicated lesson yet. | Implement the same allowed-value rule with an enum and text plus CHECK; compare evolution costs. |
| F12 | JSONB, arrays and relational tables | Planned — no dedicated lesson yet. | Choose a table, array or JSONB value for a concrete relationship and justify query/constraint needs. |
| F13 | DDL versus DML | Planned — no dedicated lesson yet. | Classify schema changes separately from row reads/writes and identify what each statement changes. |
| F14 | UUID generation and collision assumptions | Practised: generate UUIDs and deliberately repeat an ID to verify uniqueness enforcement; [lab](labs/09-row-identity/README.md#uuids-still-need-a-constraint). Explained: generation does not prove zero collision probability or authorization; [article](articles/09-row-identity.md#what-changes-with-uuids). | Other UUID versions and their ordering/performance tradeoffs are outside this first objective. |
| F15 | Identifiers, string literals, quoting and explicit casts | Explained: identifiers versus text literals; practised: explicit integer conversion and failed conversion; [article](articles/07-stored-values.md#follow-the-input-into-storage), [lab](labs/07-stored-values/README.md#repair-the-question). | Independent quoted-identifier and ambiguous-input exercises; safe application parameters belong under O20. |
| F16 | Identity columns and generated keys versus business numbering | Practised: identity allocation, explicit override, separate primary-key enforcement and a rollback gap; [lab](labs/09-row-identity/README.md#an-id-generator-is-not-the-key). | Designing a complete business numbering policy remains distinct from generating row IDs. |

## Relationships

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| R01 | Foreign keys and existence | Practised: compare existing, absent and unsuitable referenced IDs; [article](articles/01-foreign-keys.md#follow-three-attempts), [lab](labs/01-foreign-keys/README.md#predict-and-run) | No remaining work for this narrow existence objective; composite FK design remains F09/R04. |
| R02 | Optional relationships and FK nullability | Explained: predict an optional single-column FK with NULL; [article](articles/01-foreign-keys.md#follow-three-attempts) | Run nullable versus required variants; composite NULL matching remains R15. |
| R03 | One-to-many and many-to-many | Explained and practised: many-to-many membership rows, with neither side individually unique; [article](articles/09-row-identity.md#one-row-one-fact), [lab](labs/09-row-identity/README.md#predict-accepted-and-rejected-memberships). | Broader comparisons among one-to-many, many-to-many and optionality from a requirements brief. |
| R04 | Junction tables and composite keys | Practised: independently build a loyalty junction, allow repeated members across programs and reject repeated pairs; [lab](labs/09-row-identity/README.md#independent-transfer). | Compare historical membership episodes in a deeper modelling lesson; the current return prompt is reasoning only. |
| R05 | Shared primary key: at-most-one versus exactly-one | Practised: shared primary/FK rejects a second profile but permits a member without one; [lab](labs/09-row-identity/README.md#at-most-one-profile). | A workflow requiring profile existence is not implemented by this at-most-one example. |
| R06 | Multiple role-specific references to the same table | Introduced: recognize owner as another profile reference; [article](articles/01-foreign-keys.md#an-existing-row-can-still-be-unsuitable) | Model independent owner/author/assignee references; query each with aliases. |
| R07 | Catalog keys versus transaction identifiers | Planned — no dedicated lesson yet. | Choose catalog and event identifiers without treating text or UUID as a mandatory category rule. |
| R08 | NO ACTION and RESTRICT | Practised: contrast deletion rejection and deferred NO ACTION with RESTRICT; [lab](labs/04-deleting-related-rows/README.md#no-action), [lab](labs/05-deferred-checks/README.md) | UPDATE/comparison distinctions remain R16; the current objective concerns deletion. |
| R09 | CASCADE and SET NULL | Practised: inspect CASCADE, SET NULL and NOT NULL conflict; [lab](labs/04-deleting-related-rows/README.md) | No remaining work for these deletion experiments; choose policies in modelling exercises. |
| R10 | Soft deletion and active-record rules | Explained: a retained inactive row can still satisfy an FK; [article](articles/04-deleting-related-rows.md#what-if-we-only-mark-the-patient-deleted) | Exercise active-only queries, uniqueness and lifecycle policy. |
| R11 | DEFERRABLE, INITIALLY and SET CONSTRAINTS | Practised: defer, repair, fail at COMMIT, force an earlier check; [lab](labs/05-deferred-checks/README.md) | Run an INITIALLY DEFERRED variant; current setup is INITIALLY IMMEDIATE. |
| R12 | Dependency ordering and adding FKs with ALTER TABLE | Introduced: distinguish DDL ordering from deferred data checking; [article](articles/05-deferred-checks.md#keep-the-request-boundary-visible) | Build a cyclic schema using ALTER TABLE after both tables exist. |
| R13 | Typed references versus polymorphic references | Planned — no dedicated lesson yet. | Compare typed references with a generic type/id pair and state which integrity checks are lost. |
| R14 | Ownership, authorship, assignment and row grain | Planned — no dedicated lesson yet. | State what one row represents; separate ownership, authorship and assignment relationships. |
| R15 | Composite foreign keys and NULL matching | Planned — no dedicated lesson yet. | Test composite references with partial NULL inputs and document the intended matching policy. |
| R16 | Referenced-key updates and ON UPDATE policies | Planned — no dedicated lesson yet. | Update a referenced key under alternative policies; compare NO ACTION/RESTRICT edge cases separately. |

## Query meaning

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| Q01 | SELECT, INSERT, UPDATE, DELETE and WHERE | Practised: composed selection and previewed UPDATE/DELETE with affected-row inspection; [lab](labs/08-selecting-rows/README.md#select-a-write-deliberately). Basic inserts remain in the [onramp](articles/00-reading-the-examples.md#the-few-commands-you-need). | Concurrent changes between a preview and write need the later transaction route. |
| Q02 | INNER and OUTER JOINs, aliases and unmatched rows | Planned — no dedicated lesson yet. | Predict inner and outer join rows, including missing matches, and use aliases for repeated tables. |
| Q03 | EXISTS and NOT EXISTS | Explained: interpret NOT EXISTS in a validator; [article](articles/02-business-rules.md#where-the-check-runs) | Write EXISTS and NOT EXISTS queries independently; compare to joins. |
| Q04 | Subqueries and scalar subquery cardinality | Introduced: follow a scalar lookup; [article](articles/03-derived-values.md#start-with-actual-rows). Practised: observe its zero-row result; [lab](labs/03-derived-values/README.md#the-missing-patient) | Explain scalar cardinality; exercise zero, one and multiple rows in isolation. |
| Q05 | COALESCE and expression evaluation | Practised: COALESCE display fallback and an unchanged stored NULL; [lab](labs/07-stored-values/README.md#inspect-and-predict). | Broader expression evaluation and type-resolution cases remain planned. |
| Q06 | Three-valued logic and CHECK accepting unknown | Explained: true/false/unknown comparison results; practised: WHERE excludes unknown and CHECK accepts NULL; [article](articles/07-stored-values.md#a-comparison-can-be-unknown), [lab](labs/07-stored-values/README.md#repair-the-question). | Revisit compound predicates and aggregate missing-value policies in later query tasks. |
| Q07 | IS DISTINCT FROM and NULL-safe comparisons | Practised: repair a not-equal query to include unknown stock using a NULL-safe comparison; [lab](labs/07-stored-values/README.md#repair-the-question). | Apply null-safe change detection in a later update workflow. |
| Q08 | GROUP BY, COUNT, SUM and aggregate grain | Planned — no dedicated lesson yet. | State each output row's grain, group inputs and distinguish COUNT variants from SUM. |
| Q09 | Join multiplication and double counting | Planned — no dedicated lesson yet. | Count rows before and after a join, reproduce a doubled total and fix the query at the right grain. |
| Q10 | Latest-per-group and DISTINCT ON | Planned — no dedicated lesson yet. | Select a deterministic latest row per group with ties; compare DISTINCT ON with a window approach. |
| Q11 | JSON operators -> and ->> and expanding arrays | Planned — no dedicated lesson yet. | Extract JSON versus text and expand an array while accounting for the resulting rows. |
| Q12 | SELECT INTO versus STRICT and missing/multiple rows | Planned — no dedicated lesson yet. | Compare SELECT INTO and STRICT for zero, one and multiple results in a function. |
| Q13 | ORDER BY, ties, LIMIT/OFFSET and keyset pagination | Practised: tie-breaker, offset pages and a keyset boundary across an explicit insert; [lab](labs/08-selecting-rows/README.md#two-pages-and-one-new-row). | Real concurrent requests, mutable sort values, snapshot policies and pagination performance remain planned. |
| Q14 | Boolean predicates, operator precedence, IN and NULL | Practised: repair AND/OR precedence, compare IN with explicit alternatives, and diagnose NOT IN containing NULL; [article](articles/08-selecting-rows.md#parentheses-preserve-the-question), [lab](labs/08-selecting-rows/README.md#repair-a-plausible-query). | Subquery-based IN/NOT IN and EXISTS comparisons follow joins/subqueries. |
| Q15 | WHERE versus HAVING and aggregate FILTER | Planned — no dedicated lesson yet. | Filter input rows versus grouped results and apply an aggregate-specific FILTER. |
| Q16 | CASE and conditional expressions | Practised: compute queue labels with explicit NULL and fallback branches without changing stored status; [lab](labs/08-selecting-rows/README.md#shape-the-output). | Revisit conditional expressions inside aggregates and reports. |
| Q17 | DISTINCT, UNION/UNION ALL, INTERSECT and EXCEPT | Planned — no dedicated lesson yet. | Compare duplicate-preserving and duplicate-removing set operations on overlapping results. |
| Q18 | CTEs and decomposing a query into named steps | Planned — no dedicated lesson yet. | Decompose a query with named CTE steps and verify the same result without assuming a performance benefit. |
| Q19 | Recursive CTEs and hierarchical data | Planned — no dedicated lesson yet. | Traverse a small hierarchy with a recursive CTE and account for termination and cycles. |
| Q20 | Window functions, partitions, ordering and frames | Planned — no dedicated lesson yet. | Compute rank and running totals while distinguishing partitions, ordering and frame boundaries. |
| Q21 | String operations and pattern matching | Practised: ordinary-space trimming in row rules and case-sensitive/insensitive prefix matching; [lab 07](labs/07-stored-values/README.md#independent-transfer), [lab 08](labs/08-selecting-rows/README.md#shape-the-output). | Escaping literal wildcard characters, additional string operations and broader text normalization remain planned. |

## Rules and automation

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| B01 | Row validity versus permissions versus workflow policy | Explained: distinguish eligibility from existence and permission; [article](articles/01-foreign-keys.md#an-existing-row-can-still-be-unsuitable), [article](articles/02-business-rules.md#why-not-check-on-the-server) | Apply validity, permission and workflow distinctions to one complete request. |
| B02 | Constraint versus application versus trigger enforcement | Explained: compare application, constraint and trigger responsibility; [article](articles/02-business-rules.md#why-not-check-on-the-server) | Implement and compare alternative enforcement designs. |
| B03 | Trigger function and trigger attachment | Practised: trace trigger attachment and a function on INSERT/UPDATE; [article](articles/02-business-rules.md#where-the-check-runs), [lab](labs/02-business-rules/README.md#predict-and-run) | Write a function and attachment independently in a new setting. |
| B04 | NEW, OLD and TG_OP | Explained: read NEW as the proposed row; [article](articles/02-business-rules.md#where-the-check-runs) | Trace OLD and TG_OP across INSERT, UPDATE and DELETE. |
| B05 | BEFORE, AFTER, row and statement timing | Practised: observe a BEFORE row trigger rewriting input; [lab](labs/03-derived-values/README.md) | Contrast BEFORE/AFTER and row/statement triggers directly. |
| B06 | Derivation versus validation versus caller input | Practised: compare supplied, overwritten and omitted input; [article](articles/03-derived-values.md#supplying-and-checking-are-different-operations), [lab](labs/03-derived-values/README.md) | No remaining work for this narrow distinction; secure caller identity remains A. |
| B07 | Trigger ordering and explicit sequencing | Planned — no dedicated lesson yet. | Attach multiple triggers, observe their order and decide when sequencing must be explicit. |
| B08 | RAISE EXCEPTION and SQLSTATE | Practised: observe RAISE EXCEPTION and P0001; [lab](labs/02-business-rules/README.md#predict-and-run) | Choose structured SQLSTATE/error contracts and map them at the API boundary. |
| B09 | PL/pgSQL dollar quoting, assignment, casts and concatenation | Explained: read dollar delimiters and assignment; [article](articles/02-business-rules.md#where-the-check-runs), [article](articles/03-derived-values.md#start-with-actual-rows) | Practise function syntax, casts and concatenation independently. |
| B10 | Keeping cross-table rules true across all writes | Practised: find an unguarded related-table write; [lab](labs/02-business-rules/README.md#explain) | Implement the chosen invariant across all writers and concurrent changes. |
| B11 | Cross-row totals and at-least-one-child rules | Planned — no dedicated lesson yet. | State a cross-row invariant and test both its final result and intermediate write states. |
| B12 | Deferred constraint triggers | Planned — no dedicated lesson yet. | Implement a deferred constraint trigger and test success, forced checking and commit failure. |
| B13 | Conditional XOR and num_nonnulls | Planned — no dedicated lesson yet. | Encode mutually exclusive/conditional fields and test all combinations, including NULL. |
| B14 | State values versus permitted transitions | Planned — no dedicated lesson yet. | Distinguish an allowed state value from an allowed transition and reject a forbidden transition. |
| B15 | updated_at versus audit history | Planned — no dedicated lesson yet. | Observe automatic updated_at changes and demonstrate which history that timestamp cannot recover. |
| B16 | SQL functions versus PL/pgSQL functions; parameters and return values | Planned — no dedicated lesson yet. | Define and call an ordinary SQL function and a PL/pgSQL function with explicit inputs and results. |

## Transactions and concurrency

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| T01 | Implicit and explicit transactions | Practised: compare autocommit and an explicit group; [lab](labs/06-transaction-boundaries/README.md#earlier-commit), [lab](labs/06-transaction-boundaries/README.md#one-shared-transaction) | No remaining work for this narrow comparison; connection lifecycle remains O06. |
| T02 | Atomicity, COMMIT and ROLLBACK | Practised: inspect committed or rolled-back rows; [lab](labs/06-transaction-boundaries/README.md#one-shared-transaction), [lab](labs/05-deferred-checks/README.md) | Durability/recovery and isolation are separate objectives, not certified by this lab. |
| T03 | Trigger effects share the transaction | Practised: observe trigger counter rollback after later failures; [lab](labs/06-transaction-boundaries/README.md#four-failure-points) | No remaining work for this single-transaction objective; concurrency remains T07/T08. |
| T04 | API request boundaries versus transaction boundaries | Explained: distinguish a request or button action from a database transaction; [article](articles/06-transaction-boundaries.md#what-about-a-visit-saved-earlier) | Execute an API example with separate versus shared transactions. |
| T05 | Table counters versus sequences | Introduced: distinguish table counter rollback from sequence behaviour; [article](articles/06-transaction-boundaries.md#follow-the-invoice) | Run a sequence rollback comparison; evaluate numbering requirements. |
| T06 | UPDATE RETURNING and row locks | Explained: follow UPDATE RETURNING into the invoice row; [article](articles/06-transaction-boundaries.md#follow-the-invoice) | Run two sessions to observe row locking and concurrent counter updates. |
| T07 | Race conditions and concurrent read-modify-write | Planned — no dedicated lesson yet. | Reproduce a read-modify-write race using two sessions and inspect the final stored result. |
| T08 | MVCC and isolation levels | Planned — no dedicated lesson yet. | Compare what concurrent transactions can observe at chosen isolation levels, including failure/retry. |
| T09 | Deadlocks versus workflow dependency cycles | Planned — no dedicated lesson yet. | Distinguish a workflow dependency problem from a lock deadlock using an executed two-session example. |
| T10 | Savepoints and exception recovery | Planned — no dedicated lesson yet. | Recover to a savepoint after an expected failure and identify which writes remain in the transaction. |
| T11 | ON CONFLICT and conflict policy | Planned — no dedicated lesson yet. | Choose a conflict target and compare insert, ignore and update outcomes under a stated policy. |
| T12 | Idempotency keys, payload matching and response replay | Introduced: reuse a key for the same retry; [article](articles/06-transaction-boundaries.md#the-database-commits-but-the-response-goes-missing) | Implement payload matching, replay, concurrent duplicates and an expiry policy. |
| T13 | Commit succeeded but response failed | Explained: commit success does not guarantee response delivery; [article](articles/06-transaction-boundaries.md#the-database-commits-but-the-response-goes-missing) | Inject response loss and demonstrate safe retries in a request lab. |
| T14 | Serialization/deadlock retry boundaries and transaction retry safety | Planned — no dedicated lesson yet. | Induce a retryable transaction failure and retry the correct unit without duplicating external effects. |
| T15 | SELECT FOR UPDATE, lock ordering and optimistic version checks | Planned — no dedicated lesson yet. | Compare row locking with a version-checked update; document ordering and conflict handling. |

## Identity and access

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| A01 | Authentication versus authorization | Planned — no dedicated lesson yet. | Separate proving identity from granting a particular action in one request. |
| A02 | Auth users and application profiles | Planned — no dedicated lesson yet. | Relate an authentication account to an application profile and compare shared versus separate keys. |
| A03 | JWT and request identity | Planned — no dedicated lesson yet. | Trace verified request identity to a database operation; distinguish token claims from trusted validation. |
| A04 | Supabase auth.uid() and SQL-editor identity | Planned — no dedicated lesson yet. | Inspect auth.uid() under authenticated, unauthenticated and SQL-editor execution with recorded roles. |
| A05 | Database roles versus application role columns | Planned — no dedicated lesson yet. | Distinguish a PostgreSQL execution role from a role value stored in an application table. |
| A06 | GRANT and privileges | Planned — no dedicated lesson yet. | Grant/revoke the needed privileges and test an operation with a restricted role. |
| A07 | RLS USING and WITH CHECK | Planned — no dedicated lesson yet. | Compare USING and WITH CHECK using allowed/denied SELECT, INSERT, UPDATE and DELETE cases. |
| A08 | SECURITY INVOKER versus SECURITY DEFINER | Planned — no dedicated lesson yet. | Run equivalent invoker and definer functions and identify whose privileges apply. |
| A09 | Function ownership, RLS bypass and search_path | Planned — no dedicated lesson yet. | Inspect function ownership, search_path and RLS bypass conditions; test hostile/unprivileged callers. |
| A10 | Tenant boundaries and membership | Planned — no dedicated lesson yet. | Test member/nonmember and same/cross-tenant operations under an explicit ownership model. |
| A11 | Direct database access versus Supabase Data API | Planned — no dedicated lesson yet. | Trace direct SQL versus Data API access and identify the roles, exposed schemas and checks involved. |
| A12 | Account provisioning and email delivery | Planned — no dedicated lesson yet. | Separate account provisioning from email delivery and handle incomplete onboarding without overgranting access. |
| A13 | Trace an authenticated request through API, privileges and row policies | Planned — no dedicated lesson yet. | Trace login through the API, database role, grants and row policies to actual returned rows. |

## Derived data and domain meaning

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| D01 | Generated columns | Planned — no dedicated lesson yet. | Derive a generated value and test a forbidden direct write, including source-column changes. |
| D02 | Views and materialized views | Planned — no dedicated lesson yet. | Compare a table, view and materialized view by changing source data and observing query/refresh results. |
| D03 | Normalization and redundant stored values | Practised: observe a stale copied value; [article](articles/03-derived-values.md#a-copied-value-can-become-stale), [lab](labs/03-derived-values/README.md#a-later-change) | Explain normalization and compare schemas using functional dependencies (D13). |
| D04 | Snapshots and historical prices | Introduced: choose historical address versus synchronized copy; [lab](labs/03-derived-values/README.md#hint-and-solution) | Implement price snapshots and prove past records remain stable. |
| D05 | Exact NUMERIC, integer minor units and floating point | Planned — no dedicated lesson yet. | Represent and calculate money using NUMERIC and integer minor units; compare floating-point limitations. |
| D06 | Rounding and amount boundaries | Planned — no dedicated lesson yet. | Define a rounding boundary and test totals at edge values rather than rounding inconsistently per layer. |
| D07 | Price precedence, overrides and grandfathering | Planned — no dedicated lesson yet. | Resolve competing price rules, overrides and grandfathered terms using an explicit precedence policy. |
| D08 | Dates, timezones and business calendars | Planned — no dedicated lesson yet. | Separate date, instant and local business time; test timezone and calendar-boundary examples. |
| D09 | Attendance, business closures and expiry | Planned — no dedicated lesson yet. | Count usable attendance/service days with closures and a clearly stated expiry policy. |
| D10 | Lazy expiry versus stored state | Planned — no dedicated lesson yet. | Compare computing expiry when queried with maintaining an explicit expired state. |
| D11 | Approval workflows and auditability | Planned — no dedicated lesson yet. | Record an approval decision and recover who changed what, when and under which rule. |
| D12 | Domain validity versus mechanically valid SQL | Introduced: choose whether eligibility must hold at creation or forever; [lab](labs/02-business-rules/README.md#transfer) | Run a complete domain walkthrough and revise a mechanically valid but unsuitable model. |
| D13 | Functional dependencies, candidate keys and update anomalies | Planned — no dedicated lesson yet. | Identify candidate keys and functional dependencies; remove a demonstrated update anomaly. |
| D14 | Temporal ranges, overlapping reservations and exclusion constraints | Planned — no dedicated lesson yet. | Represent booking intervals and test boundary-touching versus overlapping reservations. |

## Operations and integration

| ID | Topic group | Covered objective and evidence | Remaining objectives |
|---|---|---|---|
| O01 | Indexes and the cost of writes | Planned — no dedicated lesson yet. | Measure read benefits and write/storage costs of an index against a stated workload. |
| O02 | FK columns are not automatically indexed | Planned — no dedicated lesson yet. | Inspect indexes after declaring an FK and evaluate an index on the referencing side. |
| O03 | Partial and unique indexes | Planned — no dedicated lesson yet. | Use partial and unique indexes for a scoped rule; test predicates and duplicate boundaries. |
| O04 | pg_trgm, extensions and GIN | Planned — no dedicated lesson yet. | Evaluate pg_trgm/GIN for a text-search workload and verify extension availability. |
| O05 | EXPLAIN and measured query performance | Planned — no dedicated lesson yet. | Read a query plan and use measurements to justify or reject a proposed optimization. |
| O06 | Connection pooling | Planned — no dedicated lesson yet. | Compare connection/pooling modes and determine which session assumptions survive each mode. |
| O07 | Migrations, seeds and backfills | Planned — no dedicated lesson yet. | Replay versioned migrations, seed synthetic data and backfill an existing table in a disposable environment. |
| O08 | Compatibility and expand-contract changes | Planned — no dedicated lesson yet. | Keep old and new callers working during an expand-contract schema change. |
| O09 | Migration locks and validation of existing data | Planned — no dedicated lesson yet. | Observe migration lock/validation behaviour with existing rows and concurrent operations. |
| O10 | RPC versus direct table operations versus custom APIs | Planned — no dedicated lesson yet. | Compare direct table operations, RPC and a custom API for one multi-write workflow. |
| O11 | Nested request payloads and validation | Planned — no dedicated lesson yet. | Validate a nested input and define which invalid children reject the whole request. |
| O12 | Error codes, messages and UI recovery | Introduced: inspect SQLSTATE as an error category; [article](articles/00-reading-the-examples.md#when-something-fails) | Translate structured database errors into API and UI recovery behaviour. |
| O13 | Refetching, polling and realtime | Planned — no dedicated lesson yet. | Choose refetch, polling or realtime updates and handle stale/missing notifications in a stated workflow. |
| O14 | Negative tests, rollback tests and race tests | Practised: inspect rejected writes and rollback state; [lab](labs/06-transaction-boundaries/README.md#four-failure-points) | Design a test matrix independently; race and authorization tests remain planned. |
| O15 | Backups and restoration as distinct from rollback | Planned — no dedicated lesson yet. | Restore a backup into a disposable database and verify recovered data separately from rollback tests. |
| O16 | COPY/import/export and validating a batch | Planned — no dedicated lesson yet. | Import/export a batch and inspect rejected, missing and duplicated input under an explicit policy. |
| O17 | EXPLAIN ANALYZE, estimates, actual rows and buffer observations | Planned — no dedicated lesson yet. | Compare estimated with actual rows and buffer evidence; account for EXPLAIN ANALYZE executing the query. |
| O18 | Statistics, ANALYZE, VACUUM and dead tuples | Planned — no dedicated lesson yet. | Observe statistics and dead tuples after writes, then distinguish ANALYZE from VACUUM responsibilities. |
| O19 | Observing slow queries, waiting locks and transaction timeouts | Planned — no dedicated lesson yet. | Identify a slow or blocked query and test bounded waiting without confusing a timeout with rollback evidence. |
| O20 | Parameterized queries, SQL injection and dynamic identifiers | Planned — no dedicated lesson yet. | Bind data values safely and distinguish them from dynamic SQL identifiers; test adversarial input. |
| O21 | Rehearse an application change from migration to API recovery | Planned — no dedicated lesson yet. | Rehearse schema change, compatible callers, structured errors and recovery as one integration case study. |

## Evidence rule

Before advancing an objective, link the article section and, for practised objectives, the exact task or lab. Record the observed outcome in the verification record when execution is claimed. Keep separate objectives separate: recognizing NEW does not teach OLD; executing one counter update does not demonstrate concurrent locking; observing a stale copy does not complete normalization.

An article can combine or split objectives without renumbering these IDs. A future release record must name the objectives actually explained and exercised, the changed-context task, and the environments actually verified.
