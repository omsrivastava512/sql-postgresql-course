# Author-only curriculum audit

Reviewed 2026-10-19. This is a maintenance record, not a reading route. Private study numbering appears only here and in historical provenance. The course's public structure is defined by questions and concepts in the [map](COURSE_MAP.md).

## Baseline and decision

The source is the local clinic-demo-be study/schema-study-plan-v2.md, read alongside the existing topic inventory, seven articles, six lab guides and tests/cases.json. The earlier discovery record remains in [repository evidence](REPOSITORY_EVIDENCE.md). Source-study depth notes were checked for relationship gaps; their assertions are prompts for verification, not technical authorities.

The source plan is the minimum educational baseline, not the course boundary. Its table names, implementation choices, strict module sequence and one-sitting expectation do not transfer to the course. The original application remains unchanged.

The table below maps every named concept, exercise and domain question in the ten-module plan (including both parts of 8). Rows are narrower objectives, not declarations that a whole module is taught. Status is supported by the [inventory](TOPIC_INVENTORY.md); the last column specifies the remaining lesson or exercise. Product decisions become comparative case studies rather than prescribed answers.

## Source-study cross-reference

| Source | Learning objective or exercise | Destination IDs | Current evidence and remaining work |
|---|---|---|---|
| 1 | Select data types | F04, F11, F12 | Lab 07 practises integer/text input and cast failure; broad type selection and enums/domains remain planned. |
| 1 | Explain NOT NULL, UNIQUE and scoped/composite uniqueness | F07, F09, F10 | Labs 07 and 09 practise required values, duplicate boundaries and NULL uniqueness policies. Tenant authorization remains separate. |
| 1 | Distinguish defaults, omitted input and explicit NULL | F05, F06 | Lab 07 compares stored values after omitted input, DEFAULT, explicit NULL and empty text. |
| 1 | Reject a conditional referral row, repair it, then insert successfully | F07, B13 | Negative amount CHECK practised in lab 06; conditional-row rule and repair exercise planned in an order/delivery setting. |
| 1 | Represent money in integer minor units and examine alternatives | D05, D06 | Labs 14/15 use exact cents, NUMERIC conversion/division and a declared precision policy. Floating-point comparisons and broader rounding policies remain planned. |
| 2 | Explain REFERENCES and deletion cascade | R01, R08, R09 | Practised in labs 01 and 04; retain existing lessons. |
| 2 | Distinguish catalog records from growing transaction records and choose keys | R07, F08, F14 | Planned; avoid teaching text versus UUID as an intrinsic distinction. |
| 2 | Trace one event's patient, service/course and location relationships | R03, R04, R06, R14 | Lab 09 practises membership grain; labs 10/11 add role-specific joins and report grain. Independent multi-fact schema design remains planned. |
| 2 | Reject an event without membership/access, create prerequisite membership, then accept | A10, B10, B14 | General role-guard gap practised in lab 02; membership workflow and auto-creation trace still planned. |
| 3 | Derive a stored generated total and reject a direct write | D01, D05 | Planned; order amounts supply the independent example. |
| 3 | Explain a view versus a stored table and compare a ledger view with its underlying join | D02, Q02, Q08, Q09 | Labs 10/11/14 compare joined facts, repaired totals, live views and materialized refresh. A full ledger model is not claimed. |
| 4 | Read a PL/pgSQL function and its BEFORE INSERT/UPDATE attachment | B03, B05, B09, B16 | Initial trigger mechanism practised in lab 02; independent function writing and timing variants planned. |
| 4 | Distinguish NEW and OLD | B04 | NEW explained; OLD and TG_OP lab planned. |
| 4 | Update a row and inspect an automatic timestamp | B15, D08 | Planned; separate updated_at from an audit history. |
| 4 | Insert conflicting owner input and inspect trigger-derived ownership | B06 | Practised in lab 03, including omitted input and stale copies. |
| 5 | Explain API exposure, privileges and why row policies matter | A05, A06, A07, A11 | Planned; use documented exposure configuration, not a blanket claim that all tables are publicly exposed. |
| 5 | Distinguish USING and WITH CHECK | A07 | Planned; separate SELECT/INSERT/UPDATE/DELETE role tests. |
| 5 | Trace login, JWT identity and auth.uid(); compare authenticated calls with editor execution | A01–A04, A11, A13 | Planned; record actual identity and role for each environment. |
| 5 | Hand-trace staff/admin visibility through membership and identify permissive placeholder policies | A07, A10 | Planned; replace permissive teaching policies and verify both allowed and forbidden rows in a disposable project. |
| 6 | Compare invoker/definer execution identity and when RLS can be bypassed | A08, A09 | Planned; verify ownership, privileges, search_path and caller role rather than assuming unconditional bypass. |
| 6 | Reject a cross-tenant pair inside a privileged function; distinguish role validity from authorization | A09, A10, B01, B10 | Role validation example exists; cross-tenant privileged-write lab planned. |
| 7 | Follow login → request identity → privileges/policy → visible rows | A13, O10 | Planned end-to-end walkthrough using two workspaces and multiple users; no application-source dependency. |
| 8a | Verify happy path and owner role rejection by execution | B10, O14 | Labs 01/02 cover simplified cases; original application verification is not claimed. |
| 8a | Verify branch isolation, cross-tenant rejection and admin visibility | A07, A10, A13, O14 | Planned identity matrix with explicit successful and rejected operations. Supabase run deferred. |
| 8b | Evaluate whether a referring person should be free text or a separate table | R07, R13, D03, D12, D13 | Planned contact/catalog modelling comparison; course does not settle the clinic's product decision. |
| 8b | Evaluate whether a visit's existence means completed and paid | B14, D12 | Planned order/reservation lifecycle exercise with draft, fulfilled and paid states. |
| 8b | Evaluate catalog selection and its day-to-day workflow | R07, D04, D07, D12 | Lab 14 distinguishes current catalog prices from supplied historical amounts. Catalog workflow, snapshot creation and price precedence remain planned. |
| 8b | Evaluate shared identity across branches versus separate identities | F09, R04, A10, D12 | Planned tenant/member identity comparison; no mandatory clinic policy. |
| 9 | Create versioned migration files and test locally/staging before production | O07, O21 | Planned; replay from empty and existing-data databases, record CLI/platform-specific steps. |
| 9 | Keep migration history reviewable and compare intended versus actual schema | O07, O08 | Planned migration-history and drift exercise; a file alone is not proof it ran. |
| 9 | Evaluate adding columns/tables/indexes/checks, including locks and existing data | O01, O07, O09, O19 | Planned; measure validation and lock effects, avoid blanket safe-change labels. |
| 9 | Backfill before stricter constraints; handle renames and type changes compatibly | O07–O09 | Planned expand-contract exercise with old and new callers. |
| 9 | Handle destructive changes and practise restoring data | O08, O15 | Planned disposable restore rehearsal, distinct from transaction rollback. |
| 9 | Introduce an appointment feature with relationships and safety rules together | D14, O07, O14, O21 | Planned reservation migration case study; both structural changes and validators require migration review. |
| 10 | Distinguish structured database rejection from a transport failure | B08, O12, T13 | SQLSTATE and lost-response distinction introduced; API comparison planned. |
| 10 | Map a rejection to a readable message and recovery path | O10–O12, O21 | Planned conceptual API/UI handoff; framework-specific frontend implementation remains outside core scope. |

## Beyond the source plan

The previous inventory already expanded beyond the study plan: query meaning, concurrency, retries, indexes, historical snapshots and operational concerns were listed, mostly without lessons. This pass keeps all 107 stable IDs and adds 25 groups rather than claiming those existing plans are finished.

| Missing depth found | Added IDs | Why it belongs |
|---|---|---|
| Quoting, casting and generated keys | F15–F16 | Readers must be able to write and interpret statements independently. |
| Composite references and referenced-key updates | R15–R16 | The initial single-column deletion examples do not cover all relationship design. |
| Ordering/paging, predicates, HAVING/FILTER, CASE, sets, CTEs, recursion, windows and text matching | Q13–Q21 | Querying needs a full route, not incidental SELECTs inside trigger examples. |
| Ordinary SQL functions versus PL/pgSQL functions | B16 | A trigger function should not be the reader's entire model of a database function. |
| Transaction retries and explicit/optimistic locking | T14–T15 | A single successful update is insufficient concurrency evidence. |
| Authenticated request synthesis | A13 | Individual security concepts need a complete trace and role matrix. |
| Dependencies/normalization and temporal overlap | D13–D14 | Model quality and booking rules extend beyond the source schema's chosen tables. |
| Imports, runtime query plans, maintenance, observability, safe query parameters and change rehearsal | O16–O21 | Readers need to operate and integrate what they build. |

The [PostgreSQL tutorial](https://www.postgresql.org/docs/17/tutorial.html) was used to check beginner prerequisites; the [SQL manual contents](https://www.postgresql.org/docs/17/sql.html) supplied an independent breadth check. These are topic-selection checks, not evidence that every planned lesson or claim is already verified. The [source notebook](SOURCES.md#curriculum-audit-references) records the reference boundary.

This course is not an exhaustive PostgreSQL manual. Specialist extensions, replication operations, sharding, and database administration can become optional routes later. New topics need a learning question, prerequisites and a transfer exercise; the original source repository is not a limit.

## Corrections required when authoring from old notes

Keep educational questions, not unverified assertions. In particular, do not copy claims that the Supabase Data API is a raw direct database connection, that RLS is the only security layer, or that SECURITY DEFINER always bypasses RLS. Verify platform exposure and identity using [Supabase's RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security); verify function execution identity and safe definitions using [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html).

Similarly, do not classify index creation or adding a CHECK as universally safe without examining locks and existing data. Do not infer a secure inner join solely from a non-null FK without considering policies, filters and row visibility. Future lessons must verify these boundaries for the documented engine and role.

## Foundation implementation — 2026-10-20

Three article/lab pairs now teach stored values, row selection and row identity. The [inventory](TOPIC_INVENTORY.md) updates only the demonstrated sub-outcomes; all 132 topic IDs are retained. Basic type choices do not complete time/money modelling, a between-page insert is not a concurrent-session test, and a workspace uniqueness constraint is not access control.

At that foundation checkpoint, joins, aggregation, group filters, reports and a reconciled data handoff were the next batch. Their implementation is recorded below. Learner trials and supported-environment execution remain pending.

## Query and data-handoff implementation — 2026-10-20

Six new article/lab pairs now cover joins, aggregate grain, scalar/existence/set shapes, nonrecursive CTEs, windows, views, reusable reports and a small reconciled import. The two original business briefs from the practical-course plan are implemented with synthetic datasets: the monthly sales/usage report and the CSV handoff.

The [inventory](TOPIC_INVENTORY.md) records narrower outcomes under existing IDs. All 132 IDs remain; no row is promoted to whole-course mastery. Reference examples passed 252 embedded assertions; actual CSV parsing, replay and export/re-import were checked separately. The query pilot is an executed draft, not a measured learner trial.

Concurrent writes/retries, authorization, measured performance, inherited-database repair, migrations, restore and the integrated capstone remain future implementation. The [publication queue](PUBLICATION.md) names the next concurrency and operations pilots. Public release requirements and deferred hosted testing are unchanged.

## Coverage acceptance

- Each source-study objective above has a course destination; unresolved product choices remain comparative exercises.
- Each inventory coverage claim names a narrower outcome and existing evidence. Remaining subtopics stay planned.
- Reader-facing routes require no source repository and distinguish available drafts from intended routes.
- At least one changed-setting prompt and later retrieval opportunity belongs to each route; planned prompts are labelled planned.
- SQL, PostgreSQL and Supabase are separated in the map and authoring contract.
- Execution evidence is tracked by environment, separately from editorial coverage. Hosted testing stays deferred.

An author's audit is not a new-reader usability test. Public release still requires the trials and supported-environment checks in the [publication agreement](PUBLICATION.md).
