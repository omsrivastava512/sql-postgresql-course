# Verification record

Status: draft. Initial SQL execution dated 2026-10-17 (Asia/Kolkata); documentation audit added 2026-10-19; foundation and query/data-handoff execution added 2026-10-20; native concurrent-session and migration execution added 2026-10-21.

| Check | Result |
|---|---|
| Embedded PostgreSQL execution | PASS: 270 assertions across 17 labs on PostgreSQL 18.6 / PGlite 0.5.10 (2026-10-21) |
| Native local PostgreSQL 17.11 | PASS: 270 assertions across 17 labs, Windows x64, role course_author (2026-10-21) |
| Independent concurrent sessions | PASS: 100 assertions across labs 16/17 using three distinct connections; also passed in reverse suite order on native PostgreSQL 17.11 (2026-10-21) |
| Local Docker PostgreSQL 17.11 | Not run; Docker is not installed on this host |
| Hosted Supabase | MCP connected and project inventory read; no SQL run or project changed. No dedicated course project used; hosted verification remains open. |
| Local Markdown links, current package | PASS: 558 local links across 47 Markdown files, including heading targets (2026-10-21) |
| Author learning trial and editorial revision | Pending |
| Public publication | Not performed |

The embedded runtime tests SQL behavior only. It cannot establish Docker setup, hosted permissions, or concurrent-session behavior. Native local execution now establishes the SQL and session results described below, but not Docker startup. A public release still requires hosted verification and an editorial learning trial.

The six initial labs cover foreign-key failures, role validation and its update gap, derived values and stale copies, delete actions, deferred-check timing, and invoice failure rollback. The test cases also run every successful solution after a fresh setup and exercise setup reset twice.

No test in this package claims to verify HTTP requests, API retries, production authorization, or a deployed clinic schema. Live SQL sessions are tested separately from application requests. Earlier sections below preserve dated checkpoints; this opening table and the latest section describe the current package.

## Concurrency and migration pilots — 2026-10-21

Two new article/lab pairs add a competing stock claim and a bounded additive schema change. The package now contains 92 source files, eighteen articles and seventeen labs. All 132 topic IDs remain. No dependency or package file changed; the approved separate session checker uses the existing pg driver.

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
