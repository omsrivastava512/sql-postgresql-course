# Verification record

Status: draft. Initial SQL execution dated 2026-10-17 (Asia/Kolkata); documentation audit added 2026-10-19; foundation and query/data-handoff execution added 2026-10-20; native concurrency, migration and practical performance execution added 2026-10-21; PostgreSQL access-control execution and focused editorial revisions added 2026-10-26.

| Check | Result |
|---|---|
| Embedded PostgreSQL execution | PASS: 399 assertions across 26 labs on PostgreSQL 18.6 / PGlite 0.5.10 (2026-10-26) |
| Native local PostgreSQL 17.11 | PASS: 399 assertions across 26 labs, Windows x64, role course_author (2026-10-26) |
| Independent concurrent sessions | PASS: 100 assertions across labs 16/17 using three distinct connections; also passed in reverse suite order on native PostgreSQL 17.11 (2026-10-21) |
| Practical performance | PASS: 107 assertions across labs 18–22, normal and reverse suite order, native PostgreSQL 17.11; learner request command also passed (2026-10-21) |
| Restricted database logins | PASS: 157 assertions across labs 23–26 with 11 actual restricted logins, normal and reverse suite order; each suite and its cleanup also passed independently (2026-10-26) |
| Local Docker PostgreSQL 17.11 | Not run; Docker is not installed on this host |
| Hosted Supabase | MCP connected and project inventory read; no SQL run or project changed. No dedicated course project used; hosted verification remains open. |
| Local Markdown links, current package | PASS: 822 local links across 67 Markdown files, including heading targets (2026-10-26, focused revision) |
| Editorial review | Retrospective inspection of 27 articles/26 lab guides completed; approved focused revisions reviewed separately below (2026-10-26). Other findings remain outside this revision set. |
| Actual human learner trials | Pending; automated execution of documented steps is not a human trial. |
| Public publication | Not performed |

The embedded runtime tests SQL behavior only. It cannot establish Docker setup, hosted permissions, or concurrent-session behavior. Native local execution now establishes the SQL and session results described below, but not Docker startup. A public release still requires hosted verification and an editorial learning trial.

The six initial labs cover foreign-key failures, role validation and its update gap, derived values and stale copies, delete actions, deferred-check timing, and invoice failure rollback. The test cases also run every successful solution after a fresh setup and exercise setup reset twice.

No test in this package claims to verify HTTP requests, API retries, production authorization, or a deployed clinic schema. Live SQL sessions are tested separately from application requests. Earlier sections below preserve dated checkpoints; this opening table and the latest section describe the current package.

## Focused editorial revisions — 2026-10-26

The approved scope was five items: manual backfill observation, a role-switched snapshot exercise, copied-owner reasoning, an annotated real plan and a developed existing Shopify connection. No new lesson, fixture, dependency or course checker was added. The intentionally incomplete ownership trigger and all supplied SQL scripts remain unchanged.

### Checks rerun for these revisions

| Check | Fresh result | What it establishes |
|---|---|---|
| npm run test:embedded | PASS: 399 assertions across 26 labs, PostgreSQL 18.6 / PGlite 0.5.10 | Existing reference SQL behavior and reset/solution checks |
| npm run test:database | PASS: 399 assertions across 26 labs, native PostgreSQL 17.11 | Same reference behavior on the temporary native server |
| node tests/verify-sessions.mjs --lab=17 | PASS: 45 assertions on three distinct connections | Existing compatibility, backfill, DDL failure/recovery and transfer behavior |
| node tests/verify-access.mjs --lab=25 | PASS: 49 assertions with three actual restricted logins | Existing membership permissions, identity restrictions, snapshot behavior and temporary-login cleanup |
| node tests/verify-performance.mjs --lab=18 | PASS: 10 assertions | Existing complete-result checks, before/after plans, repeated lookup and write/rollback observations |
| node tests/verify-performance.mjs --lab=20 | PASS: 7 assertions | Existing equal-page, incomplete-cursor, changed-data and descending-transfer checks, with native observations |

A separate task-local verifier executed the SQL blocks extracted from the revised lab Markdown, using the existing pg dependency and three persistent native connections. It is retained with the evidence outside the course repository; it is not a new learner dependency or course test framework.

- **03:** the three observed owner triples (patient, note 100, note 101) were (1,1,1), (2,1,1), (2,2,1), matching the article's table. No trigger repair was made.
- **17:** the inline manual backfill matches 02-backfill.sql's transaction apart from its explicit 60-second lock timeout and 90-second statement timeout. After a deliberate three-second delay, B was still blocked by A; committing A preserved 120 and returned only booking 4/30. A separate run reached 55P03 after about 60.027 seconds. A query in the failed transaction returned 25P02; ROLLBACK, committing A, inspecting the rows and rerunning the original script completed only booking 4. Both local timeouts reverted afterward. The unchanged expansion script still reached its deliberate 55P03 after about 1.013 seconds, left no column/version record after rollback, then succeeded after releasing A.
- **25:** both connections logged in as course_author; A used SET ROLE course_tenant_alice while Alice remained NOLOGIN. A read 11/12, B deleted and committed Alice's membership, A still read 11/12 in its old snapshot, then saw no tasks after COMMIT and received 42501 for the new insert. Administrator inspection confirmed no task changes and no Alice membership. RESET ROLE and cleanup succeeded. This demonstrates the documented role-switched snapshot path; the separate actual-login checker supplies different evidence.

The first execution of the revised snapshot draft exposed SQLSTATE 25001 when the identity SELECT and BEGIN ISOLATION LEVEL were sent in one multi-statement request. The final instructions separate those executions and explain recovery; that corrected sequence passed. The earlier successful ownership and timeout checks were retained, and only the revised snapshot sequence and subsequent plan capture were resumed. No failed attempt is counted as a pass.

The earlier full 100-assertion concurrency, 107-assertion performance and 157-assertion access runs elsewhere in this record remain dated evidence from their implementation batches. Those full specialized suites and their reverse-order variants were not rerun here; the selected runs above were.

### Captured plan and environment

[Article 18's plan](articles/18-query-plans.md#follow-one-captured-plan) is the complete text output of its EXPLAIN (ANALYZE, BUFFERS) query, captured after fresh setup.sql and its ANALYZE statements, before adding the customer index. Capture time: 2026-10-26 10:27:12 UTC. The forty ordered result rows and 5680-cent total were checked separately. A sequential scan emitted 40 and filtered 39,960 rows, followed by a sort; observed execution time was 2.103 ms. The article's text block was compared verbatim with the saved native output. It is one observation, not a required plan shape or timing target.

Environment: PostgreSQL 17.11 on Windows x64, Node.js v24.15.0, pg 8.16.3, role course_author, work_mem 4MB, shared_buffers 32MB and default planner enable settings. The database was recently loaded and read; this was not a controlled cold-cache measurement. The same official PostgreSQL 17.11-5 archive size and locally computed SHA-256 documented below were checked. The dedicated server used 127.0.0.1:55435, no Windows service, and SCRAM for temporary restricted logins. No hosted SQL or paid resource was used.

Task-local evidence includes focused-revision-evidence-20261026.json, lesson-18-plan-20261026.txt, the documented-step verifier and individual native reference/session/access/performance outputs. These author artifacts are outside the repository; learners need only the included output and runnable fixture.

Final local navigation passed 822 links across 67 Markdown files; diff whitespace, Markdown fences/tables and the exact nine-file scope passed. Before shutdown, there were no other database sessions and all thirteen fixture roles were NOLOGIN with no password. pg_ctl stopped the exact temporary server and returned status 3 (no server running). Runtime removal was confined to its resolved task-artifact child directory after checking for reparse points and a remaining server PID file. The archive, binaries and synthetic database were removed; evidence files were retained outside that directory.

### Editorial review and remaining learner evidence

The revised explanations were reviewed as a separate pass: 03 follows three concrete row states before comparing business meanings; 18 reads an observed plan from scan to output before the independent task; 20 explains the existing source's decision and costs, then labels our interpretation and local measurement limits. The Shopify original was reread, including its limited-adoption qualification. No benchmark ratio or full-rollout outcome was invented. Manual 17/25 instructions now supply executable intermediate steps and their recovery/identity boundaries.

Actual human trials remain unperformed. A learner still needs to try switching sessions within the bounded window, explain the old snapshot without spoken help, interpret a different plan and distinguish the source's account from the lab's evidence. Docker setup and hosted verification remain open. These revisions do not make the draft publication-ready.

Changed course files: [article 03](articles/03-derived-values.md), [lab 03](labs/03-derived-values/README.md), [lab 17](labs/17-compatible-change/README.md), [article 18](articles/18-query-plans.md), [lab 18](labs/18-query-plans/README.md), [article 20](articles/20-deep-pages.md), [lab 25](labs/25-tenant-membership/README.md), [sources](SOURCES.md) and this verification record. Other retrospective findings remain outside the approved set. No staging, commit or push was performed.

## PostgreSQL access-control implementation — 2026-10-26

Four new article/lab pairs add ordinary privileges, row policies, tenant membership and privileged access paths. The current package has 138 source files, twenty-seven articles and twenty-six labs. That includes two previously committed research documents, unchanged by this batch. All 132 topic IDs remain. The original twenty-two reference suites are unchanged; four additional suites add 98 assertions, for 399 on each engine. No dependency, package file or existing checker changed.

| Suite | Observed behaviour checked | Not established |
|---|---|---|
| 23-database-roles | Schema/table/column/sequence privileges; profile labels confer no SQL grant; allowed writes and unchanged forbidden fields; revocation on an existing connection; dispatch transfer | Website authentication, inherited-role administration or production provisioning |
| 24-row-policies | Default deny; allowed and forbidden CRUD; hidden writes return zero rows; reassignment fails; omitted WITH CHECK inherits USING in the tested ALL policy; permissive/restrictive combinations; missing table privilege; failed RLS-disable, TRUNCATE, role-switch and row_security-off bypass attempts; message transfer | Every policy combination, archive immutability or a complete security audit |
| 25-tenant-membership | Member/read-only/nonmember matrix; protected membership writes; composite tenant/parent FK; caller-writable setting does not replace current_user; old Repeatable Read snapshot retains revoked membership until transaction end; branch/visit transfer | Immediate revocation of existing snapshots, authenticated request context, pooled identity lifecycle or absence of error side channels |
| 26-privileged-code | Owner-view/function exposure; narrower definer remains subject to RLS; FORCE affects an ordinary owner but not the superuser; temporary-table shadowing reproduced then repaired in the same connection; explicit function execution grants; invoker reads require base-table privileges; delivery lookup transfer | General privileged-function safety, arbitrary dynamic SQL, Supabase API exposure or user-specific privileged operations |

The ordinary reference runner uses administrator-controlled SET ROLE. That establishes statement behaviour, not login isolation. The separate access checker connects as eleven actual restricted roles, with independently generated temporary passwords. For every role it checks non-superuser/non-BYPASSRLS attributes, absence of memberships, wrong-password rejection (28P01), current_user/session_user and rejection of switching to the administrator. The two owner/worker roles remain NOLOGIN. The final cleanup closes caller connections, restores all temporary callers to NOLOGIN with no password and verifies that result before reporting PASS.

Native environment: PostgreSQL 17.11 on Windows x64, Node.js v24.15.0, administrator course_author, SCRAM-SHA-256 password storage, max_connections 30 and shared_buffers 32MB. The dedicated server's first host rule trusted only course_author on 127.0.0.1; other loopback roles matched scram-sha-256. This was an isolated test configuration, not a production recommendation. Both full access runs passed 157 assertions and used eleven restricted connections. Each suite also passed starting without any access schemas/roles: 36 assertions for lab 23, 34 for 24, 49 for 25 and 44 for 26. Independent counts include the administrator and credential-cleanup assertions per run, so their sum is not the full-run count.

```text
npm run test:embedded
PASS 399 assertions across 26 labs.

npm run test:database
PASS 399 assertions across 26 labs.

node tests/verify-access.mjs
PASS 157 access assertions across 4 labs with 11 actual restricted logins.

node tests/verify-access.mjs --reverse
PASS 157 access assertions across 4 labs with 11 actual restricted logins.
```

The four supplied cleanup scripts were executed before and after independent suites. Catalog queries confirmed all four access schemas and all thirteen named access roles were absent afterward. Setup reset and fresh-setup solutions also passed in the ordinary runner. Native checks verify the actual login/snapshot paths; embedded checks do not substitute for them. The older 100-assertion concurrency and 107-assertion performance results above are dated evidence, not claims that those separate checkers were rerun in this batch.

The official PostgreSQL 17.11-5 archive had the same 381531864-byte size and locally computed SHA-256 recorded below. The temporary server listened only on 127.0.0.1:55434 and installed no Windows service. Authorized elevated runtime access was used where needed. After verification, pg_ctl stopped the exact data-directory server and returned status 3 (no server running). The exact child folder and absence of reparse points were verified before its archive, binaries and synthetic database were removed. Normal, reverse, independent-suite and shutdown evidence remains outside the repository.

No hosted SQL, Supabase project change or paid feature was used. The Supabase documentation search and changelog read were research only. Website login, JWT validation, auth.uid(), API exposure and request-level allow/deny tests remain a separate integration batch. Human learning trials and the hosted/Docker release checks remain open. This implementation did not stage, commit, push or change repository visibility; the preflight found the repository already public.

## Practical performance implementation — 2026-10-21

Five new article/lab pairs add plan reading, measured index choices, deep pagination, statistics/maintenance and database work per request. At that checkpoint the package contained 115 source files, twenty-three articles and twenty-two labs. All 132 topic IDs remained. No dependency or package file changed. The original seventeen reference suites were unchanged; the regular checker added 31 assertions, for 301 on each engine.

| Suite | Observed behaviour checked | Not established |
|---|---|---|
| 18-query-plans | Complete ordered result equality before/after indexing; estimated/actual rows, buffers and repeated execution; inner operation loops three times; broad scan; EXPLAIN versus executing/rolling back EXPLAIN ANALYZE on an ordinary update; independent delivery query | Production latency, disk reads inferred from buffer reads, arbitrary external-effect rollback or fixed plan selection |
| 19-index-decisions | Primary-key/FK index inventory; single-column versus ordered composite/covering access; queue partial index and full-index storage; active-subscription uniqueness on INSERT/UPDATE; exact results after rolled-back writes; independent ticket query | Production index build/deployment, sustained write throughput, generic prepared-plan predicate implication or indexing every FK |
| 20-deep-pages | Equivalent offset/cursor rows; shallow/deep consumed rows; timestamp ties; earlier insert and moved future row; descending message transfer | Frozen history, nullable/mixed-direction keys, free arbitrary page jumps or HTTP cursor design |
| 21-statistics-maintenance | Exact live counts and estimate improvement after distribution changes; old snapshot holds deleted versions; VACUUM reports before/after snapshot release; fixture autovacuum settings restored; independent mailbox estimates | Full autovacuum tuning, exact physical interpretation of statistics-view estimates or production administration |
| 22-request-work | Complete nested response against independently constructed expected data; 31/2/1 calls; empty search, selected-parent limits, bound values and allowed sorts; project-count transfer; actual pool checkout queue and backend reuse | HTTP integration, authorization, wire-byte measurement, deployed latency or correct production pool sizing |

Native environment: PostgreSQL 17.11, Windows x64, role course_author, Node.js v24.15.0; shared_buffers 32MB, work_mem 4MB, random_page_cost 4, effective_cache_size 4GB, max_parallel_workers_per_gather 2. The runtime used the same official 17.11-5 bundle and local archive hash recorded in the earlier section below. Each performance suite resets its own named schema. The full suite passed again in reverse order, and the learner request command passed against the resulting fixture.

### Recorded observations

These are observations from one local run, not speed thresholds. Each repeated comparison records its first execution separately and five subsequent executions. Data loading, earlier queries and maintenance can warm caches; neither the first nor subsequent sample is a controlled cold-cache measurement. Plans and timing can vary on another machine.

| Comparison | First execution | Five subsequent executions | Other evidence |
|---|---|---|---|
| Customer lookup, no secondary index | 1.853 ms | 1.795–2.070 ms | 616 shared hits; scan returns 40 and removes 39,960 |
| Same lookup, customer index | 0.058 ms | 0.037–0.059 ms | 42 shared hits; identical forty rows |
| Latest five orders, no secondary index / composite index | 2.769 / 0.018 ms | 2.532–2.803 / 0.012–0.024 ms | Same five IDs; composite plan has zero heap fetches in this run |
| Deep offset / supplied cursor | 1.525 / 0.018 ms | 1.372–1.480 / 0.020–0.033 ms | 9,010 / 10 entries consumed; 114 / 4 shared hits; same ten IDs |
| Update 1,000 rows, primary key only / primary key plus composite | 6.648 / 8.418 ms | 4.348–5.841 / 5.938–20.105 ms | First WAL 232,986 / 300,920 bytes; all stored facts restored after every trial |
| Customer operation, loop / batch / join | 14.206 / 0.897 / 1.404 ms | 6.494–8.563 / 0.539–0.613 / 0.439–0.596 ms | 31 / 2 / 1 calls; exact same thirty customers, 72 paid orders and six empty collections |

The open-queue index occupied 40,960 bytes; the full index with the same keys occupied 1,900,544 bytes; the customer composite occupied 2,457,600 bytes. The full and partial queue candidates were removed before measuring composite-index write cost, so that comparison changes only the secondary composite index. Six ordinary updates per variant were rolled back. Rollback preserves logical facts, not the physical/cache state: dead versions, page changes and WAL still matter. Subsequent indexed write WAL ranged from 303,242 to 725,421 bytes. These observations do not isolate a universal per-index overhead or sustained throughput effect.

Task estimates changed from 40 for 40 actual rows, to 60 for 20,000 actual rows after the update, to 20,000 after ANALYZE. The mailbox transfer moved from an estimate of 25 to 1,000 for 1,000 actual rows. With the old snapshot held, VACUUM reported zero removed and 30,000 dead but not yet removable tuples; after release it reported 30,000 removed and zero held. Live SELECT still counted 10,000. The post-vacuum n_live_tup estimate was 2,539 in this run, illustrating why the statistics view is not an exact row count. Ordinary vacuum also truncated empty trailing pages here; it does not generally compact all free space inside a relation.

The loop/batch/join returned 102/102/78 driver rows, with 2,629/3,791/4,507 bytes of UTF-8 JSON encoding of those rows. That proxy includes different repeated fields and is not PostgreSQL wire traffic. The pool test held its only client, observed waitingCount 1 while the backend was idle waiting for its client, then released it and verified the next borrower reused the same backend. It distinguishes checkout waiting from database lock waiting without inventing a production pool size.

### Commands and limits

With COURSE_DATABASE_URL set in the test process environment to the dedicated loopback database:

```text
npm run test:embedded
PASS 301 assertions across 22 labs.

npm run test:database
PASS 301 assertions across 22 labs.

node tests/verify-performance.mjs
PASS 107 performance/correctness assertions across 5 labs; timings are observations, not speed thresholds.

node tests/verify-performance.mjs --reverse
PASS 107 performance/correctness assertions across 5 labs; timings are observations, not speed thresholds.

node labs/22-request-work/request.mjs
Completed six samples per mode with identical nested results.
```

The separate concurrency checker was unchanged; its earlier 100-assertion native result below is retained, not claimed as rerun in this batch. The embedded checker verifies exact SQL results and errors; it does not measure native plans, live snapshots or connection pools. Human learning trials, Docker setup, hosted execution, production workloads and the wider unfinished curriculum remain open.

The temporary performance server listened only on 127.0.0.1:55433 and installed no Windows service. Previously authorized elevated runtime/test access was used for initialization, launch and native connections. Shutdown completed after the tests; pg_ctl confirmed no server running. The exact resolved task runtime folder was checked for containment and reparse points, then its archive, binaries and synthetic database were removed. Both evidence outputs remain outside the course repository. No Supabase project, hosted SQL or paid feature was used. This batch was not staged, committed, pushed or published.

## Concurrency and migration pilots — 2026-10-21

Two new article/lab pairs add a competing stock claim and a bounded additive schema change. At that checkpoint the package contained 92 source files, eighteen articles and seventeen labs. All 132 topic IDs remained. No dependency or package file changed; the approved separate session checker uses the existing pg driver.

| Suite | Observed behaviour checked | Not established |
|---|---|---|
| 16-competing-claims | Both callers read 1 and overpromise with stale replacements; conditional claims block, then correctly follow commit/rollback; observer sees committed state; locking read returns updated availability; invalid reservation rolls back decrement; 40001 requires a fresh read/decision; 55P03 leaves an explicit transaction failed until rollback; two-seat/one-seat transfer | Deadlocks, optimistic versioning, arbitrary writers, restocking/cancellation, HTTP deduplication or external-effect safety |
| 17-compatible-change | Immediate NOT NULL addition fails; defaults leave old NULLs; NOT VALID checks new writes; interrupted two-row backfill resumes without replacing 0/120; premature validation rolls back schema/history; original booking facts survive; old/new callers work; overlapping update wins over backfill; blocked ALTER times out without a column/history record; retry succeeds; jobs use historical 3 and future default 5 | Zero downtime, production-scale timings, deployment tooling, rename/removal bridge, hosted migration permissions or backup restoration |

The regular checker passed 270 assertions on both engines: the original 252 plus 18 new single-session reference checks. It resets each setup twice and runs each solution from fresh setup. The separate checker passed 100 assertions on three distinct PostgreSQL backend IDs, then passed in reverse suite order. Each scenario resets its own schema after ending transactions. Wait checks query pg_blocking_pids and require B to be blocked by A; elapsed time alone is not accepted as evidence.

Commands executed with COURSE_DATABASE_URL set only in the test process environment to the temporary loopback database:

```text
npm run test:embedded
PASS 270 assertions across 17 labs.

npm run test:database
PASS 270 assertions across 17 labs.

node tests/verify-sessions.mjs
PASS 100 live-session assertions on three distinct PostgreSQL connections.

node tests/verify-sessions.mjs --reverse
PASS 100 live-session assertions on three distinct PostgreSQL connections.
```

The native runtime was EDB's PostgreSQL 17.11-5 Windows x64 binary bundle, obtained through the official PostgreSQL Windows download route. postgres --version and the server both reported 17.11. Archive size: 381531864 bytes; locally computed SHA-256: 80379B2C04D51C30225532E0AE04509899141E9957ED096FE749D7FD9DF8F82F. This identifies the downloaded artifact; it is not a claimed comparison with a publisher checksum.

The temporary server listened only on 127.0.0.1:55433, used a dedicated disposable course database and role course_author, and installed no Windows service. A sandboxed background launch did not persist and local socket access was denied; the already-approved runtime and test commands therefore ran with elevated tool access. Shutdown completed after testing; pg_ctl confirmed no server running. The task's temporary archive, runtime and data directory were then removed after checking their resolved cleanup path. No Supabase SQL, paid feature or hosted resource was used.

These checks do not run the Docker/psql CSV transport, prove learner comprehension or complete the wider curriculum. The article/lab drafts include independent transfer and retrieval prompts; actual author/new-reader time, errors and assistance remain unrecorded until a person attempts them. Hosted execution, Docker setup and reader trials remain release work.

## Query and data-handoff implementation — 2026-10-20

Six new article/lab pairs add joins, aggregate grain, query shapes, windows, reusable reports and a reconciled CSV import. All 252 assertions across fifteen labs passed, including 103 new assertions. The original nine suites are unchanged. Each suite resets setup twice and runs its solution from a fresh setup.

| New suite | Observed behaviour checked | Not established |
|---|---|---|
| 10-joins | Inner/outer/cross joins, ON versus WHERE, unmatched rows, creator/assignee roles and active-club transfer | Authorization or join performance |
| 11-aggregate-grain | Fan-out errors, failed DISTINCT repair, independent summaries, WHERE/HAVING, FILTER, empty aggregates and usage/receipt transfer | Arbitrary reporting correctness |
| 12-query-shapes | Scalar zero/one/many results, EXISTS/NOT EXISTS, nullable NOT IN, set duplicates, CTE equivalence and workspace transfer | Recursive CTEs or optimizer behaviour |
| 13-window-questions | Deterministic latest rows, ranking ties, explicit/default frames, LAG and changed meter readings | Concurrent histories or complete window-function coverage |
| 14-reusable-reports | Explicit month boundaries, weighted averages, historical prices, dated refunds, empty periods, current-account denominators and materialized-view refresh | Accounting policy, historical eligibility, daylight-saving calendars or production financial controls |
| 15-data-handoff | Guarded conversions, row decisions, accepted totals, replay, distinct event identity and conflicting payload rejection | Concurrent ingestion, append-only audit history or multi-batch recovery |

The six new suites also passed independently in fresh embedded databases, run in reverse order: 103 assertions. This checks their independence from earlier labs. Editorial review corrected a refund that preceded its order; a fixture assertion now checks that relationship.

A separate check loaded the actual CSV through PostgreSQL's parser and matched all ten raw rows to the SQL snapshot, including quoted commas, quotes, NULL and empty text. Processing yielded four facts totalling 5250 cents, replay left those facts unchanged, and an exported CSV re-imported to equal facts. The command below makes that author check repeatable; the normal runner uses the SQL snapshot.

At this checkpoint the package contained 80 source files, sixteen articles and fifteen labs. All 132 topic IDs remained. No dependencies or runner architecture changed. Docker and psql were unavailable on this host; local PostgreSQL 17 and hosted Supabase execution had not been performed. The later native concurrency/migration checks are recorded above. This batch was a verified draft, not a public release or completion of the course.

### Repeat the actual-file check

From the repository root, with the existing pinned dependencies available, run in PowerShell:

```powershell
$csvCheck = @'
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
try {
  const base = 'labs/15-data-handoff/';
  await db.exec(await readFile(base + 'setup.sql', 'utf8'));
  const expected = (await db.query('SELECT * FROM course_import.raw_lines ORDER BY line_no')).rows;
  await db.exec('TRUNCATE course_import.decisions, course_import.raw_lines');
  await db.query("COPY course_import.raw_lines FROM '/dev/blob' WITH (FORMAT csv, HEADER true)", [], { blob: new Blob([await readFile(base + 'raw-lines.csv')]) });
  assert.deepEqual((await db.query('SELECT * FROM course_import.raw_lines ORDER BY line_no')).rows, expected);
  const solution = await readFile(base + 'solution.sql', 'utf8');
  await db.exec(solution);
  const facts = (await db.query('SELECT * FROM course_import.facts ORDER BY source_key')).rows;
  assert.equal(facts.length, 4);
  assert.deepEqual((await db.query('SELECT SUM(quantity::bigint * unit_cents)::integer AS cents FROM course_import.facts')).rows, [{ cents: 5250 }]);
  await db.exec(solution);
  assert.deepEqual((await db.query('SELECT * FROM course_import.facts ORDER BY source_key')).rows, facts);
  const exported = await db.query("COPY (SELECT * FROM course_import.facts ORDER BY source_key) TO '/dev/blob' WITH (FORMAT csv, HEADER true)");
  assert.ok(exported.blob);
  await db.exec('CREATE TABLE course_import.roundtrip (LIKE course_import.facts INCLUDING ALL)');
  await db.query("COPY course_import.roundtrip FROM '/dev/blob' WITH (FORMAT csv, HEADER true)", [], { blob: exported.blob });
  assert.deepEqual((await db.query('SELECT * FROM course_import.roundtrip ORDER BY source_key')).rows, facts);
  console.log('PASS actual CSV import equals 10-row SQL snapshot; accepted 4 facts / 5250 cents; replay unchanged; CSV export/import round trip equal.');
} finally {
  await db.close();
}
'@
$csvCheck | node --input-type=module
```

The /dev/blob route belongs to the embedded runtime. It verifies CSV parsing and SQL processing, not the lab's Docker/psql transport instructions.

## Foundation implementation — 2026-10-20

Added three articles and nine lab files. The existing runner now checks nine lab suites, including setup reset twice and each successful solution from a fresh setup. All 149 assertions passed, including 84 assertions added in this batch. The original six suites still pass.

| New suite | Observed behaviour checked | Not established |
|---|---|---|
| 07-stored-values | Omitted/default/NULL/empty input; COALESCE without storage changes; NULL-safe comparisons; rejected types and row rules; independent stock/contact policies | Complete type selection, contact validation or application payload handling |
| 08-selecting-rows | Exact predicate results; CASE and text matching; deterministic tie ordering; offset/keyset pages across an explicit insert; selected writes; changed subscription policy | Concurrent paging, a frozen dataset, grouping/report correctness or performance |
| 09-row-identity | Pair/scoped duplicates; NULL uniqueness policies; optional shared-key profiles; identity generation versus constraints; rollback gap; UUID duplicate rejection; independent loyalty junction | Authorization, collision probabilities, production numbering or historical membership design |

These checks validate reference examples and solutions, not arbitrary learner submissions or independent learner mastery. All new SQL runs in dedicated disposable course schemas. No dependency, test-runner architecture or existing setup/solution files changed.

Local navigation passed: 315 links across 31 Markdown files, including heading targets. There are 55 source files, including ten articles and nine independent labs. All 132 topic IDs remain intact.

Existing pinned test dependencies were installed with npm ci to run the embedded checks. Docker and psql were unavailable; no server or hosted test is claimed. Author/new-reader trials remain pending. The query, concurrency and operational pilots are still planned; this first batch does not complete the course.

## Findings from execution

The first run caught a version-specific error category in the RESTRICT experiment. PostgreSQL 18.6 returned 23001 (restrict_violation); PostgreSQL 17's source uses the general foreign-key violation path. The lab now describes the difference and the test accepts those two documented categories for that one operation. Immediate failure and the unchanged stored rows remain required.

Primary evidence: [PostgreSQL 17 referential-integrity source](https://github.com/postgres/postgres/blob/REL_17_STABLE/src/backend/utils/adt/ri_triggers.c) and [PostgreSQL 18 source](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/utils/adt/ri_triggers.c). This is source inspection for version 17, not an executed version-17 test.

Command results:

```text
npm run test:embedded
PASS 01-foreign-keys
PASS 02-business-rules
PASS 03-derived-values
PASS 04-deleting-related-rows
PASS 05-deferred-checks
PASS 06-transaction-boundaries
PASS 65 assertions across 6 labs.

npm run check:links
PASS 161 local links in 24 Markdown files.
```

The draft uses PostgreSQL 17 documentation and a PostgreSQL 17.11 Docker tag. Embedded execution on PostgreSQL 18.6 is useful cross-version evidence, but does not replace the planned version-17 and hosted tests. No Docker engine or connected Supabase test project was available for this draft session.

## Standalone curriculum revision — 2026-10-19

Documentation-only revision. SQL setup/solution files, lab instructions, test code and package files were preserved. The sole article edit redirects its next-step link from an author queue to the reader map. SQL tests were not rerun because executable content did not change; the 65-assertion result above remains the dated earlier execution record.

| Check | Evidence and result |
|---|---|
| Local navigation | PASS: 209 links across 25 Markdown files, including heading targets |
| Inventory continuity | PASS: all 107 original IDs retained; 25 added; 132 unique topic groups |
| Source-study coverage | Author review: every named concept, exercise and domain question in the ten-module source plan has a destination in CURRICULUM_AUDIT.md, including both parts of 8 |
| Coverage honesty | Author review: each introduced/explained/practised claim names its narrower objective and an existing article section or task; remaining objectives are separate |
| Reader independence | No private module labels or source-repository paths in learner materials; source-study numbering confined to author provenance/audit |
| Graph and routes | Prerequisite arrows checked for cycles; current-draft route is distinct from the intended beginner route; future destinations visibly planned |
| Transfer and retrieval | Existing transfer prompts retained; reservation reasoning prompt added; all nine wider routes have explicit future retrieval targets |
| File count | 43 source files: original 42 plus the curriculum audit; installed dependencies/Git metadata excluded |
| Change scope | No SQL, lab instructions, dependencies, application code, commits or remote changes in this revision |
| Reader trial | Pending; author review is not evidence of new-reader comprehension |
| Hosted verification | Still deferred; no Supabase execution claimed |

### What the earlier embedded tests establish

These are suite-level evidence summaries, not a claim to test every sentence or objective mentioned in the corresponding article. The actual statements and expected rows/errors are in tests/cases.json; the runner also checks setup reset and successful solutions.

| Suite | Observed behaviour checked | Not established by this suite |
|---|---|---|
| 01-foreign-keys | Present/absent/NULL IDs, wrong-role acceptance, duplicate key and referenced-row rejection | Nullable variant, complete cardinality modelling or authorization |
| 02-business-rules | Owner rejection on patient writes and the unguarded profile-role change | A complete persistent invariant or concurrent role-change safety |
| 03-derived-values | Supplied/omitted owner, missing lookup, stale copies and note-update rederivation | A normalization lesson, production identity flow or all scalar-query cardinalities |
| 04-deleting-related-rows | NO ACTION, CASCADE, SET NULL and conflicting NOT NULL; stored rows after failure | Soft-delete lifecycle design or all referenced-key update cases |
| 05-deferred-checks | Successful repair, COMMIT failure, forced immediate check and RESTRICT timing | INITIALLY DEFERRED variant, all deferrable constraint types or bulk-import integration |
| 06-transaction-boundaries | Four failure points, counter rollback, earlier commit and shared transaction | Sequence rollback, independent concurrent sessions, network response loss or idempotent API retries |

The onramp's manual exercise and written transfer/review answers are teaching material, not additional automated assertions. Local Docker and hosted Supabase runs, author learning trials and a new-reader attempt remain publication gates.
