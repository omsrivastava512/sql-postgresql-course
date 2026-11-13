# Research log: practice, feedback and progress

Started and completed 13 Nov 2026 (Asia/Calcutta): research, native experiments, fresh document-extracted reproduction and the completion audit below. The report is [How learning apps store practice, feedback and progress](How%20learning%20apps%20store%20practice%20feedback%20and%20progress.md).

## Objective and boundaries

Explain learning-platform behaviour to a developer who understands basic SQL and backend programming but has no assumed domain knowledge. Begin with a SQL-practice analogy, then connect one employee's task, attempts, evaluations, review correction, policy change and progress. Use PostgreSQL for the complete worked model. Keep surrounding AI, media, integration and identity topics bounded. The only repository deliverables are this log and the report; executable reproduction material is embedded here and in the report. Temporary tools and results live outside the repository. Existing research, course material, dependencies and Git history are unchanged.

## Preflight

Live GitHub metadata and branch endpoints on 13 Nov identify authoritative non-fork `omsrivastava512/sql-postgresql-course`, default `main`, at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local `main` is `fbd34f7ccfb7550085d9a689ff88dad3342aa6fa`, exactly 12 ahead / 0 behind. The latest local commit contains the completed identity/permissions research. All-state pull-request and issue collections are empty. Searches of current research and local/default-branch history found earlier SQL lessons and adjacent research, not this investigation. No branch update is needed. Untracked `learning/` is independent work and outside scope. No repository AGENTS.md was found; the supplied coding instructions apply. No Git mutation is included.

## Source readings and their effect on the model

All readings in this table were made on 13 Nov 2026. Product pages establish advertised behaviour, not hidden storage or measured effectiveness. Source inspection establishes the particular pinned implementation, not the behaviour of every release. The teaching design is our own.

| Primary source | Evidence read | Decision or boundary it influenced |
| --- | --- | --- |
| [Moodle question banks, 5.3 documentation](https://docs.moodle.org/503/en/Question_bank) | Reusable question banks; ready/draft status; fixed question version versus following updates | Separate an editable exercise from a published edition. Choose fixed assignment references; do not assume updating existing assignments is universally correct |
| [Moodle storage definitions](https://github.com/moodle/moodle/blob/69ef83ad2948db19595106671f03a1429679c870/lib/db/install.xml#L1478) | `question_bank_entries`, `question_versions`, `question_references`, `question_attempts`, `question_attempt_steps`, step data; references may specify a version or leave latest resolution to the implementation | Explain distinct identities for reusable content, editions and activity. Our schema is not a Moodle clone |
| [Moodle attempt persistence](https://github.com/moodle/moodle/blob/69ef83ad2948db19595106671f03a1429679c870/question/engine/datalib.php#L116) | `insert_question_attempt` records question, variant and marking context and iterates steps; `insert_question_attempt_step` persists ordered steps; adjacent update path can replace step data | An inspectable connection from runtime attempt objects to stored records. Do not describe these tables as universally immutable history |
| [Moodle regrading and manual grading](https://github.com/moodle/moodle/blob/69ef83ad2948db19595106671f03a1429679c870/question/engine/questionattempt.php#L1421) | Regrade walks old steps and signals their deletion while replaying actions; `manual_grade` passes comment/mark into `process_action` | Human judgment is an action with context. Our independent evaluation records and explicit selection history are a deliberate teaching alternative, not a claim about Moodle's regrading guarantees |
| [LangSmith evaluation](https://docs.langchain.com/langsmith/evaluation) | Examples/datasets, evaluators, experiments, human/code/model methods, offline/online distinction | Separate subject, evaluation method and result. Use as an adjacent comparison about AI output quality; no account, hosted integration or evaluator run |
| [Zenarate Perform](https://www.zenarate.com/products/perform) | Practice simulations, learning activities, coaching, configurable skills and dashboards | Ground the domain explanation in documented product capabilities. No inferred backend language, database or internal architecture |
| [Zenarate Analyze](https://www.zenarate.com/products/analyze) | Review/disputes, scorecard calibration, transcript ingestion/redaction and reporting | Motivate correction history and source-version boundaries. Marketing claims about impact are not treated as causal evidence |
| [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | Read Committed statement visibility and locked-row rechecks | Version/state checks follow lock acquisition; independent observers verify waits |
| [PostgreSQL 17 locking](https://www.postgresql.org/docs/17/explicit-locking.html) | Row locks and transaction lifetimes | Explain blocking, rollback and the scope of coordination |

The Moodle source pin is `69ef83ad2948db19595106671f03a1429679c870`, returned for `MOODLE_405_STABLE` during this research. It is a 4.5-branch implementation comparison, not the source corresponding to the separately read 5.3 documentation. Only the stated overlapping concepts are compared. Moodle, LangSmith and the training products were not installed or executed. No third-party product schema is attributed to the teaching model.

## Teaching and implementation decisions

The report introduces assignment, attempt, rubric and evaluation through a familiar SQL-learning experience, then uses Lee, Maya, Noah, the `delay` exercise and consistent identifiers throughout. It explains each transition before presenting the combined SQL. Tables show the same records changing; the main diagram distinguishes definitions, answers, judgments and selected results.

The bounded policy is explicit: text responses; stable published editions; assignments fixed to one edition; any number of deliberate attempts; submitted answers fixed through the operation protocol; three boolean criteria, all required; failed or absent evaluation distinct from a zero score; preserved evaluation candidates; explicit accepted result; only trainers may replace a selection. Current assignment passing means at least one attempt whose currently accepted result passes. Changed scoring editions cannot qualify an older assignment. This avoids inventing a single universal meaning for completion or progress.

No real evaluator runs. Controlled deliveries include a deliberately wrong judgment about a negated promise, a human correction, a successful next attempt and a later-edition comparison. The fixtures test persistence and coordination, not language comprehension, calibration or training effectiveness. Evidence/explanation strings are required but their semantic truth is not machine-validated by the database.

The functions run as the disposable database owner with synthetic trusted actor parameters. They reject unauthorized actors and cross-organization references in the stated paths. Direct SQL privileges, RLS, production authentication, hardened function search paths and a full revocation protocol are not implemented. Published releases, submitted answers and history are immutable through these functions, not protected against the database owner. This boundary is stated in the report and prevents overclaiming the access tests.

## Environment

Experiments use the existing PostgreSQL 17.11 Windows binaries from the earlier workflow research, Node 24.15.0 and the repository's existing `pg` 8.16.3 dependency. These are recorded execution versions, not claims about the newest releases. No package manifest or lockfile was changed. The database is disposable, bound only to `127.0.0.1:55461`, with a generated password retained only in its scratch directory. The database name is `practice`; its teaching objects are in schema `practice`.

Initial scratch directory: `C:\Users\HP\AppData\Local\Temp\codex-learning-research`. Results include named assertions, PostgreSQL/Node versions, completion time, observed blocker/waiter PIDs and final story rows. The harness resets only this disposable schema between independent test cases. It restores and executes the connected story at the end, statement by statement with independent commits.

The first setup initialized a cluster but could not launch the native server under the Windows sandbox's restricted-token handling. The command finished with a start error; the existing cluster was then started outside the sandbox through approved execution, without reinitializing or deleting it. This was an environment startup issue, not an experimental result about application behaviour.

## Observed experiments

The first complete run passed 70 named checks and observed 10 actual lock waits. Review then added explicit checks for withdrawing a current pass while retaining its historical evaluation, visibility and rollback of a complete evaluation, and publication of a genuinely new release in the draft/publication race. The revised run passed 75 named checks and 10 waits. The final document-extracted reproduction is recorded in the completion audit below.

| Experiment | Observed result |
| --- | --- |
| Connected journey | `A1`: two submitted and accepted attempts, currently passing; `A2` and revision-2 `A3`: no attempts |
| Initial judgment, review and comparison | `E1` 1/3, `E2` 2/3, `E3` 3/3, `E4` 2/3 retained; `T1` selects `E2`, `T2` selects `E3` |
| Repeated starts/submissions | Same request identity returns same attempt/submission; timestamp unchanged; deliberate second attempt is separate |
| Stale or unauthorized changes | Stale/null versions, another learner's operations, inactive actors and disallowed roles reject |
| Invalid evaluation payload | Missing, duplicate or unknown criteria, string instead of boolean, and empty evidence reject; partial result does not persist |
| Failure, uncommitted result and rollback | Failure has no score or pass; cannot be accepted. Uncommitted complete delivery is invisible to another connection; rollback leaves neither evaluation nor marks |
| Repeated evaluator delivery | Same ID/payload returns the existing result; changed payload conflicts; no duplicated marks |
| Historical selection replay | Returns original receipt without replacing a later accepted review |
| Late candidate | Stored as evidence; worker cannot replace current selection, even with its current sequence |
| Revised rules | New published prompt does not alter release 1; revision-2 comparison cannot qualify a revision-1 assignment |
| Current pass withdrawn | Correcting the only passing attempt removes current assignment pass; original passing result remains stored |
| Reporting negative control | Raw join produces 12 rows for one attempted assignment; assignment-level report retains zero-attempt rows and groups revisions separately |
| Access boundaries | Learners see only own progress/attempts; another organization's trainer cannot read the response; worker report access rejects; cross-organization release reference fails |

The concurrency harness uses two independent transaction sessions and a third observer. It obtains their backend PIDs, starts the competing operations, polls `pg_blocking_pids` until the actual relationship is visible, then commits or rolls back the first transaction. Waiting is required for the test to pass; elapsed time alone is not evidence.

| First operation holding the lock | Waiting operation | Observed outcome after release |
| --- | --- | --- |
| Submit | Save answer | Edit rejects; submitted text unchanged |
| Save answer | Submit old version | Submission rejects; changed answer remains draft |
| Submit, then rollback | Save answer | Edit succeeds |
| Submit | Identical submit | Same submission receipt |
| Human accepts result | Worker accepts initial result | Worker rejects stale selection; human result remains |
| Worker accepts initial result | Human accepts from old sequence | Human request conflicts; explicit refreshed retry succeeds and retains both decisions |
| Human accepts result | Another human selection from same sequence | Second conflicts; one winning selection |
| Evaluation delivery | Same evaluation delivery | One evaluation and one set of three marks |
| Publish new release | Edit next draft | Both complete in order; release captures intended old draft |
| Edit draft | Publish stale draft | Publication rejects |

## Reproduce from the documents

Use an empty temporary directory, Node and the existing repository dependencies, and PostgreSQL 17 binaries. Run from the repository root. Set `LEARN_PG_BIN` to the PostgreSQL bin directory and `LEARN_SCRATCH` to a fresh temporary directory. Port 55461 must be free. The block below extracts the model and fixture/story from the report and the setup/verifier from this log. It starts the disposable database, runs the checks and stops it in `finally`. It refuses an already existing scratch directory. If Windows blocks native server startup under restricted-token execution, run this reviewed reproduction block in an authorized native execution context; do not initialize a second cluster just because a launch failed.

### Extraction and execution

```powershell
$ErrorActionPreference = 'Stop'
if (-not $env:LEARN_PG_BIN -or -not $env:LEARN_SCRATCH) { throw 'Set LEARN_PG_BIN and LEARN_SCRATCH first.' }
$researchScratch = [System.IO.Path]::GetFullPath($env:LEARN_SCRATCH)
if (Test-Path -LiteralPath $researchScratch) { throw 'Choose a fresh temporary directory.' }
$researchDocs = Join-Path (Get-Location) 'research\database-design\learning-assessments-and-progress'
$researchReport = Get-Content -Raw -LiteralPath (Join-Path $researchDocs 'How learning apps store practice feedback and progress.md')
$researchLog = Get-Content -Raw -LiteralPath (Join-Path $researchDocs 'Research log.md')
function Get-ResearchBlock([string]$body,[string]$heading,[string]$language) {
  $researchPattern = '(?ms)^## ' + [regex]::Escape($heading) + '\r?\n.*?^```' + $language + '\r?\n(.*?)^```[ \t]*\r?$'
  $researchMatch = [regex]::Match($body,$researchPattern)
  if (-not $researchMatch.Success) { throw "Missing block: $heading" }
  return $researchMatch.Groups[1].Value
}
New-Item -ItemType Directory -Path $researchScratch | Out-Null
foreach ($researchBlock in @(
  @('model.sql',$researchReport,'Runnable PostgreSQL model','sql'),
  @('fixture.sql',$researchReport,'Create the initial people and assignment records','sql'),
  @('story.sql',$researchReport,'Run the connected journey','sql'),
  @('setup.ps1',$researchLog,'Setup script','powershell'),
  @('verify.mjs',$researchLog,'Verification harness','javascript')
)) {
  [System.IO.File]::WriteAllText((Join-Path $researchScratch $researchBlock[0]),(Get-ResearchBlock $researchBlock[1] $researchBlock[2] $researchBlock[3]))
}
try {
  & (Join-Path $researchScratch 'setup.ps1')
  node (Join-Path $researchScratch 'verify.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'Verification failed; inspect the output.' }
} finally {
  if (Test-Path -LiteralPath (Join-Path $researchScratch 'pg-data\postmaster.pid')) {
    & (Join-Path $env:LEARN_PG_BIN 'pg_ctl.exe') -D (Join-Path $researchScratch 'pg-data') -m fast -w stop
    if ($LASTEXITCODE -ne 0) { throw 'Database shutdown failed; inspect the process before retrying.' }
  }
}
```

The verifier deliberately drops and recreates schema `practice` inside database `practice` at this fixed loopback port. Do not point it at a shared database. It reads the generated password file without printing it. Separate-case resets are not presented as later events in the narrative. Only the final story is restored as the connected end state.

## Setup script

Extracted as `setup.ps1`; the wrapper above supplies the environment and guarantees shutdown after verification.

```powershell
$ErrorActionPreference = 'Stop'
if (-not $env:LEARN_SCRATCH) { throw 'Set LEARN_SCRATCH to a new temporary directory.' }
if (-not $env:LEARN_PG_BIN) { throw 'Set LEARN_PG_BIN to the PostgreSQL 17 bin directory.' }
$researchScratch = [System.IO.Path]::GetFullPath($env:LEARN_SCRATCH)
$researchData = Join-Path $researchScratch 'pg-data'
if (Test-Path -LiteralPath $researchData) { throw 'Choose a fresh scratch directory; pg-data already exists.' }
if ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object { $_.Port -eq 55461 }) { throw 'Port 55461 is in use.' }
New-Item -ItemType Directory -Path $researchScratch -Force | Out-Null
$researchPassword = [Guid]::NewGuid().ToString('N')
[System.IO.File]::WriteAllText((Join-Path $researchScratch 'pg-password.txt'),$researchPassword)
& (Join-Path $env:LEARN_PG_BIN 'initdb.exe') -D $researchData -U researcher --auth-host=scram-sha-256 --auth-local=trust --pwfile (Join-Path $researchScratch 'pg-password.txt') --encoding=UTF8 --locale=C
if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
& (Join-Path $env:LEARN_PG_BIN 'pg_ctl.exe') -D $researchData -l (Join-Path $researchScratch 'postgres.log') -o '-h 127.0.0.1 -p 55461' -w start
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL start failed' }
$env:PGPASSWORD = $researchPassword
& (Join-Path $env:LEARN_PG_BIN 'createdb.exe') -h 127.0.0.1 -p 55461 -U researcher practice
if ($LASTEXITCODE -ne 0) { throw 'Database creation failed' }
Write-Output "Disposable experiment ready in $researchScratch"
```

## Verification harness

Extracted as `verify.mjs`; run from the repository root so it resolves the existing `pg` dependency. Assertions contain expected business outcomes independently of the SQL implementation. The final pass also executes every small SQL excerpt in the report.

```javascript
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.join(process.cwd(), 'package.json'));
const { Client } = require('pg');
const scratch = process.env.LEARN_SCRATCH;
if (!scratch) throw new Error('Set LEARN_SCRATCH');
const config = { host: '127.0.0.1', port: 55461, database: 'practice', user: 'researcher', password: (await readFile(path.join(scratch, 'pg-password.txt'), 'utf8')).trim() };
const model = await readFile(path.join(scratch, 'model.sql'), 'utf8');
const fixture = await readFile(path.join(scratch, 'fixture.sql'), 'utf8');
const story = await readFile(path.join(scratch, 'story.sql'), 'utf8');
const checks = [];
const waits = [];
async function connect() {
  const c = new Client(config);
  await c.connect();
  await c.query("SET search_path=practice,public; SET statement_timeout='10s'");
  return c;
}
const c = await connect();
async function q(sql, args = [], client = c) { return (await client.query(sql, args)).rows; }
async function value(sql, args = [], client = c) { return Object.values((await q(sql, args, client))[0])[0]; }
function eq(label, actual, expected) { assert.deepEqual(actual, expected, label); checks.push(label); }
async function rejects(label, fn, pattern) {
  await assert.rejects(fn, pattern, label);
  checks.push(label);
}
async function fresh() {
  await c.query('DROP SCHEMA IF EXISTS practice CASCADE');
  await c.query(model);
  for (const statement of fixture.split(/;\s*(?:\r?\n|$)/).map(s => s.trim()).filter(Boolean)) await q(statement);
}
async function ready() {
  await fresh();
  await q("SELECT start_attempt('alpha','maya','A1','T1')");
  await q("SELECT save_answer('alpha','maya','T1',0,'Synthetic response for transaction tests')");
}
const marks = (bits = [true, false, true]) => ({ marks: ['ack','next','promise'].map((code, i) => ({ code, passed: bits[i], evidence: 'Controlled synthetic evidence', explanation: 'Fixture judgment, not a language evaluator' })) });
async function evaluate(id, { actor = 'worker', kind = 'automated', revision = 1, body = marks(), client = c } = {}) {
  return value("SELECT record_evaluation('alpha',$1,$2,'T1',$3,'fixture-test',$4,$5::jsonb)", [actor,id,revision,kind,JSON.stringify(body)], client);
}
async function submitted() { await ready(); await q("SELECT submit('alpha','maya','T1',1,'S1')"); }
async function race(label, firstSql, secondSql, { rollbackFirst = false } = {}) {
  const a = await connect(); const b = await connect();
  let outcome;
  try {
    const apid = await value('SELECT pg_backend_pid()', [], a);
    const bpid = await value('SELECT pg_backend_pid()', [], b);
    await a.query('BEGIN'); await b.query('BEGIN');
    await a.query(firstSql);
    const pending = b.query(secondSql).then(r => ({ rows: r.rows }), e => ({ error: e.message }));
    let blocked = false;
    for (let n = 0; n < 100; n++) {
      if (await value('SELECT $1::int = ANY(pg_blocking_pids($2::int))', [apid,bpid])) { blocked = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.ok(blocked, `${label}: actual lock wait missing`);
    waits.push({ label, blocker: apid, waiter: bpid });
    await a.query(rollbackFirst ? 'ROLLBACK' : 'COMMIT');
    outcome = await pending;
    await b.query(outcome.error ? 'ROLLBACK' : 'COMMIT');
    return outcome;
  } finally {
    await a.query('ROLLBACK').catch(() => {}); await b.query('ROLLBACK').catch(() => {});
    await a.end(); await b.end();
  }
}
try {
  await fresh();
  for (const statement of story.split(/;\s*(?:\r?\n|$)/).map(s => s.trim()).filter(Boolean)) await q(statement);
  eq('story final progress', await q("SELECT assignment_id,attempts::int,submitted::int,evaluated::int,passed FROM progress('alpha','lee')"), [
    { assignment_id: 'A1', attempts: 2, submitted: 2, evaluated: 2, passed: true },
    { assignment_id: 'A2', attempts: 0, submitted: 0, evaluated: 0, passed: false },
    { assignment_id: 'A3', attempts: 0, submitted: 0, evaluated: 0, passed: false }
  ]);
  eq('original and corrected scores retained', await q('SELECT id,points,passed FROM evaluation_score ORDER BY id'), [
    { id: 'E1', points: 1, passed: false }, { id: 'E2', points: 2, passed: false },
    { id: 'E3', points: 3, passed: true }, { id: 'E4', points: 2, passed: false }
  ]);
  eq('comparison does not replace accepted result', await value("SELECT accepted_evaluation FROM attempt WHERE id='T2'"), 'E3');
  await rejects('new scoring rules cannot qualify old assignment', () => q("SELECT accept_evaluation('alpha','lee','T2','E4',1,'bad','Changed rules')"), /ineligible result/);
  eq('old prompt remains fixed', await value("SELECT prompt FROM release WHERE revision=1"), 'Customer: My parcel is late. Will it arrive today? Policy: offer to check tracking. Never guarantee an arrival time.');
  eq('learner sees own assignments', (await q("SELECT assignment_id FROM progress('alpha','maya')")).map(r => r.assignment_id), ['A1','A3']);
  eq('other learner sees only own assignment', (await q("SELECT assignment_id FROM progress('alpha','noah')")).map(r => r.assignment_id), ['A2']);
  eq('other organization has no report rows', await q("SELECT * FROM progress('beta','lee')"), []);
  await rejects('other organization cannot read response', () => q("SELECT read_attempt('beta','lee','T1')"), /read denied/);
  await rejects('other learner cannot read response', () => q("SELECT read_attempt('alpha','noah','T1')"), /read denied/);
  await rejects('result from another attempt cannot be selected', () => q("SELECT accept_evaluation('alpha','lee','T1','E3',2,'wrong-attempt','Wrong target')"), /ineligible result/);
  await rejects('worker cannot read learner report', () => q("SELECT * FROM progress('alpha','worker')"), /report denied/);
  eq('replay old selection returns its receipt', await value("SELECT accept_evaluation('alpha','worker','T1','E1',0,'P1','Initial result')"), 1);
  eq('old selection replay does not undo correction', await value("SELECT accepted_evaluation FROM attempt WHERE id='T1'"), 'E2');
  await rejects('selection key payload mismatch', () => q("SELECT accept_evaluation('alpha','worker','T1','E1',0,'P1','Different reason')"), /key reused/);
  eq('report groups versions and people separately', await q("SELECT revision,count(*)::int assigned,count(DISTINCT learner_id)::int people,count(*) FILTER (WHERE submitted>0)::int submitted,count(*) FILTER (WHERE evaluated>0)::int evaluated,count(*) FILTER (WHERE passed)::int passed FROM progress('alpha','lee') GROUP BY revision ORDER BY revision"), [
    { revision: 1, assigned: 2, people: 2, submitted: 1, evaluated: 1, passed: 1 },
    { revision: 2, assigned: 1, people: 1, submitted: 0, evaluated: 0, passed: 0 }
  ]);
  eq('join multiplication negative control', await value('SELECT count(*)::int FROM assignment a JOIN attempt t ON (t.org,t.assignment)=(a.org,a.id) JOIN evaluation e ON (e.org,e.attempt)=(t.org,t.id) JOIN criterion_result r ON (r.org,r.evaluation)=(e.org,e.id)'), 12);
  await q("SELECT record_evaluation('alpha','lee','H3','T2',1,'review-2','human',$1::jsonb)", [JSON.stringify(marks())]);
  await q("SELECT accept_evaluation('alpha','lee','T2','H3',1,'P4','Withdraw the previous pass after review')");
  eq('correcting only passing attempt removes current assignment pass', await value("SELECT passed FROM progress('alpha','lee') WHERE assignment_id='A1'"), false);
  eq('withdrawal preserves old passing evaluation', await value("SELECT passed FROM evaluation_score WHERE id='E3'"), true);
  await q("UPDATE member SET active=false WHERE org='alpha' AND id='maya'");
  await rejects('inactive learner cannot read', () => q("SELECT read_attempt('alpha','maya','T1')"), /inactive/);
  await ready();
  eq('repeated start keeps one attempt', await value("SELECT start_attempt('alpha','maya','A1','T1')"), 'T1');
  eq('attempt count after start retry', await value('SELECT count(*)::int FROM attempt'), 1);
  await rejects('cannot start another learner assignment', () => q("SELECT start_attempt('alpha','maya','A2','X')"), /assignment denied/);
  await rejects('stale save rejected', () => q("SELECT save_answer('alpha','maya','T1',0,'Overwrite')"), /stale/);
  await rejects('null version cannot bypass stale check', () => q("SELECT save_answer('alpha','maya','T1',NULL,'Overwrite')"), /stale/);
  await rejects('other learner cannot submit', () => q("SELECT submit('alpha','noah','T1',1,'S1')"), /attempt denied/);
  await q("SELECT submit('alpha','maya','T1',1,'S1')");
  const acceptedTime = await value("SELECT submitted_at::text FROM attempt WHERE id='T1'");
  eq('submission replay same receipt', await value("SELECT submit('alpha','maya','T1',1,'S1')"), 'T1');
  eq('submission replay preserves timestamp', await value("SELECT submitted_at::text FROM attempt WHERE id='T1'"), acceptedTime);
  await rejects('submission key conflict', () => q("SELECT submit('alpha','maya','T1',1,'S2')"), /conflicts/);
  await rejects('save after submission rejected', () => q("SELECT save_answer('alpha','maya','T1',1,'Overwrite')"), /submitted/);
  await q("SELECT start_attempt('alpha','maya','A1','T2')");
  eq('deliberate practice creates a different attempt', await value('SELECT count(*)::int FROM attempt'), 2);
  await rejects('empty answer cannot submit', () => q("SELECT submit('alpha','maya','T2',0,'S2')"), /empty/);
  await rejects('draft cannot be evaluated', () => q("SELECT record_evaluation('alpha','worker','draft','T2',1,'v','automated','{\"error\":\"test\"}')"), /submitted attempt/);
  await rejects('worker cannot impersonate human review', () => evaluate('bad', { kind: 'human' }), /denied/);
  await rejects('learner cannot evaluate', () => evaluate('bad', { actor: 'maya' }), /denied/);
  await rejects('missing criterion rejects entire result', () => evaluate('bad', { body: { marks: marks().marks.slice(0,2) } }), /invalid marks/);
  eq('partial result leaves no evaluation', await value("SELECT count(*)::int FROM evaluation WHERE id='bad'"), 0);
  const duplicate = marks(); duplicate.marks[2].code='ack';
  await rejects('duplicate criterion rejected', () => evaluate('bad', { body: duplicate }), /invalid marks/);
  const unknown = marks(); unknown.marks[2].code='unknown';
  await rejects('unknown criterion rejected', () => evaluate('bad', { body: unknown }), /invalid marks/);
  const stringBool = marks(); stringBool.marks[0].passed='true';
  await rejects('string is not a boolean judgment', () => evaluate('bad', { body: stringBool }), /invalid marks/);
  const noEvidence = marks(); noEvidence.marks[0].evidence='';
  await rejects('missing evidence rejected', () => evaluate('bad', { body: noEvidence }), /invalid marks/);
  eq('failed evaluator delivery recorded', await evaluate('F1', { body: { error: 'Timeout fixture' } }), 'F1');
  eq('failure has no marks or pass value', await q("SELECT checks,points,passed FROM evaluation_score WHERE id='F1'"), [{ checks: 0, points: null, passed: null }]);
  await rejects('failed evaluator result cannot be accepted', () => q("SELECT accept_evaluation('alpha','worker','T1','F1',0,'bad','Initial')"), /ineligible/);
  await evaluate('E1');
  eq('lost acknowledgement replay returns same evaluation', await evaluate('E1'), 'E1');
  eq('replayed evaluation has three marks', await value("SELECT count(*)::int FROM criterion_result WHERE evaluation='E1'"), 3);
  await rejects('changed payload under same key rejected', () => evaluate('E1', { body: marks([true,true,true]) }), /key reused/);
  await q("SELECT accept_evaluation('alpha','worker','T1','E1',0,'P1','Initial')");
  await evaluate('H1', { actor: 'lee', kind: 'human', body: marks([true,true,true]) });
  await q("SELECT accept_evaluation('alpha','lee','T1','H1',1,'P2','Reviewed')");
  await evaluate('LATE');
  await rejects('late worker cannot replace review even with current version', () => q("SELECT accept_evaluation('alpha','worker','T1','LATE',2,'P3','Late')"), /cannot replace/);
  eq('late delivery stored without changing accepted feedback', await value("SELECT accepted_evaluation FROM attempt WHERE id='T1'"), 'H1');
  await rejects('cross organization assignment reference fails', () => q("INSERT INTO assignment(org,id,learner,exercise,revision,assigned_by) VALUES('beta','X','outsider','delay',1,'lee')"), /foreign key/);
  await fresh();
  eq('same draft publication is idempotent', await value("SELECT publish('alpha','lee','delay',1)"), 1);
  eq('publication retry has one release', await value('SELECT count(*)::int FROM release'), 1);
  eq('assignment replay returns same record', await value("SELECT assign('alpha','lee','A1','maya','delay',1)"), 'A1');
  await rejects('assignment key cannot be reassigned to another person', () => q("SELECT assign('alpha','lee','A1','noah','delay',1)"), /key reused/);
  await rejects('learner cannot publish', () => q("SELECT publish('alpha','maya','delay',1)"), /trainer required/);
  await q("SELECT edit_exercise('alpha','lee','delay',1,'Changed prompt','[]')");
  await rejects('empty checklist cannot publish', () => q("SELECT publish('alpha','lee','delay',2)"), /invalid criteria/);
  eq('failed publication preserves old release', await value('SELECT count(*)::int FROM release'), 1);
  await ready();
  let r = await race('submit before edit', "SELECT submit('alpha','maya','T1',1,'S1')", "SELECT save_answer('alpha','maya','T1',1,'Changed')");
  eq('waiting edit cannot change submitted answer', /submitted/.test(r.error), true);
  eq('submitted answer remains original', await value("SELECT answer FROM attempt WHERE id='T1'"), 'Synthetic response for transaction tests');
  await ready();
  r = await race('edit before submit', "SELECT save_answer('alpha','maya','T1',1,'Changed')", "SELECT submit('alpha','maya','T1',1,'S1')");
  eq('waiting submit rejects old version', /conflicts/.test(r.error), true);
  eq('stale submission leaves draft editable', await q("SELECT state,version,answer FROM attempt WHERE id='T1'"), [{ state: 'draft', version: 2, answer: 'Changed' }]);
  await ready();
  r = await race('submit rollback before edit', "SELECT submit('alpha','maya','T1',1,'S1')", "SELECT save_answer('alpha','maya','T1',1,'Changed')", { rollbackFirst: true });
  eq('rollback permits waiting edit', r.rows, [{ save_answer: 2 }]);
  await ready();
  r = await race('duplicate submission', "SELECT submit('alpha','maya','T1',1,'S1')", "SELECT submit('alpha','maya','T1',1,'S1')");
  eq('concurrent submission retry returns one receipt', r.rows, [{ submit: 'T1' }]);
  await submitted(); await evaluate('E1'); await evaluate('H1', { actor: 'lee', kind: 'human' });
  r = await race('human selection before worker', "SELECT accept_evaluation('alpha','lee','T1','H1',0,'PH','Reviewed')", "SELECT accept_evaluation('alpha','worker','T1','E1',0,'PW','Initial')");
  eq('waiting worker rejects stale acceptance', /stale selection/.test(r.error), true);
  eq('human accepted result survives', await value("SELECT accepted_evaluation FROM attempt WHERE id='T1'"), 'H1');
  await submitted(); await evaluate('E1'); await evaluate('H1', { actor: 'lee', kind: 'human' });
  r = await race('worker selection before human', "SELECT accept_evaluation('alpha','worker','T1','E1',0,'PW','Initial')", "SELECT accept_evaluation('alpha','lee','T1','H1',0,'PH','Reviewed')");
  eq('waiting reviewer sees conflict rather than silent overwrite', /stale selection/.test(r.error), true);
  eq('reviewer can deliberately accept after refresh', await value("SELECT accept_evaluation('alpha','lee','T1','H1',1,'PH2','Reviewed after refresh')"), 2);
  eq('both selection decisions retained', await value('SELECT count(*)::int FROM selection'), 2);
  await submitted(); await evaluate('H1', { actor: 'lee', kind: 'human' }); await evaluate('H2', { actor: 'sam', kind: 'human' });
  r = await race('competing human selections', "SELECT accept_evaluation('alpha','lee','T1','H1',0,'P1','First review')", "SELECT accept_evaluation('alpha','sam','T1','H2',0,'P2','Second review')");
  eq('second reviewer must refresh', /stale selection/.test(r.error), true);
  eq('one winning selection', await value('SELECT count(*)::int FROM selection'), 1);
  await submitted();
  const transaction = await connect();
  try {
    await transaction.query('BEGIN');
    await evaluate('ROLLBACK', { client: transaction });
    eq('uncommitted complete evaluation is invisible to other reader', await value("SELECT count(*)::int FROM evaluation WHERE id='ROLLBACK'"), 0);
    await transaction.query('ROLLBACK');
    eq('rollback removes evaluation and its marks', await value("SELECT (SELECT count(*) FROM evaluation WHERE id='ROLLBACK')::int + (SELECT count(*) FROM criterion_result WHERE evaluation='ROLLBACK')::int"), 0);
  } finally { await transaction.end(); }
  const encoded = JSON.stringify(marks()).replaceAll("'", "''");
  const delivery = `SELECT record_evaluation('alpha','worker','E1','T1',1,'fixture-test','automated','${encoded}'::jsonb)`;
  r = await race('duplicate evaluator delivery', delivery, delivery);
  eq('concurrent evaluator replay returns existing result', r.rows, [{ record_evaluation: 'E1' }]);
  eq('concurrent evaluator replay stores one set of marks', await value('SELECT count(*)::int FROM criterion_result'), 3);
  await fresh();
  await q("SELECT edit_exercise('alpha','lee','delay',1,'Ready for revision 2',(SELECT criteria FROM exercise WHERE id='delay'))");
  r = await race('publish before draft edit', "SELECT publish('alpha','lee','delay',2)", "SELECT edit_exercise('alpha','lee','delay',2,'New draft','[]')");
  eq('editing next draft leaves published version available', r.rows, [{ edit_exercise: 3 }]);
  eq('new release captures the intended draft', await value('SELECT prompt FROM release WHERE revision=2'), 'Ready for revision 2');
  eq('published prompt unaffected by later edit', await value('SELECT count(*)::int FROM release WHERE prompt=\'New draft\''), 0);
  await fresh();
  await q("SELECT edit_exercise('alpha','lee','delay',1,'Ready for revision 2',(SELECT criteria FROM exercise WHERE id='delay'))");
  r = await race('draft edit before stale publication', "SELECT edit_exercise('alpha','lee','delay',2,'New draft','[]')", "SELECT publish('alpha','lee','delay',2)");
  eq('stale publication rejects after waiting', /stale exercise/.test(r.error), true);
  await fresh();
  for (const statement of story.split(/;\s*(?:\r?\n|$)/).map(s => s.trim()).filter(Boolean)) await q(statement);
  const report = await readFile(path.join(process.cwd(), 'research/database-design/learning-assessments-and-progress/How learning apps store practice feedback and progress.md'), 'utf8');
  const normal = s => s.replaceAll('\r\n','\n').trim();
  const fullBlocks = [model,fixture,story].map(normal);
  let snippetNumber = 0;
  for (const match of report.matchAll(/^```sql\r?\n([\s\S]*?)^```/gm)) {
    if (fullBlocks.includes(normal(match[1]))) continue;
    await q(match[1]);
    checks.push(`Report SQL excerpt ${++snippetNumber} executes against final story`);
  }
  const result = { completedAt: new Date().toISOString(), postgres: await value('SHOW server_version'), node: process.version, passed: checks.length, waits, checks, finalProgress: await q("SELECT * FROM progress('alpha','lee')") };
  await writeFile(path.join(scratch, 'results.json'), JSON.stringify(result, null, 2));
  process.stdout.write(`PASS ${checks.length} checks; ${waits.length} observed lock waits\n`);
} finally { await c.end(); }
```

## Completion audit

The fresh reproduction extracted all five executable blocks from these documents into `C:\Users\HP\AppData\Local\Temp\codex-learning-reproduction`, initialized a new cluster, and passed **82 named checks with 10 observed lock waits**. Completion time was **2026-11-13 07:56:14.694 UTC / 13:26:14.694 Asia/Calcutta**. PostgreSQL reported 17.11 and Node reported v24.15.0. The final four checks execute the report's short SQL excerpts against the restored story, in addition to the full model, fixture and journey. The final accepted state is T1 → E2 and T2 → E3; A1 has two attempts and passes; A2 and A3 have none. The deliberately revised-rules comparison E4 remains separate.

The documented extraction/start/test/stop command itself was executed successfully. Both the initial and fresh PostgreSQL servers were stopped; their `postmaster.pid` files were absent and port 55461 had no listener. Scratch artifacts remain available for inspecting the dated evidence; no live service remains.

| Approved requirement | Evidence inspected at completion |
| --- | --- |
| Beginner bridge and connected domain explanation | Opening SQL-practice analogy, plain-language vocabulary, one customer situation, consistent people/IDs, before-and-after rows and the definition of each criterion |
| Prepare, publish, assign and preserve editions | Fixture plus authoring functions; successful/idempotent publication, invalid checklist rejection, fixed old prompt and actual publication/edit races |
| Resume, submit, retry and deliberately practise again | T1 saved/read/edited/submitted; identical submission replay and T2 new attempt; stale, empty and unauthorized cases; both edit/submit orderings and rollback |
| Evaluations with evidence, review and corrections | Four journey evaluations, exact criterion validation, failure and rollback checks, candidate/selection separation, historical receipt replay, late worker rejection and two distinct trainer principals competing |
| Changed requirements and reassessment | Published revision 2, A3, E4 comparison and rejected selection for the old assignment; weighted/mandatory-rule exercise explicitly identified as unexecuted design |
| Trustworthy progress and further practice | Independently asserted assignment/person counts, zero-attempt records, separated revisions, join-multiplication negative control, removal of a current pass, and missed-criterion explanation used to motivate another try |
| Primary research without invented internals | Opened documentation and the pinned Moodle definitions/persistence/grade paths; implementation and provider-marketing boundaries recorded above |
| Bounded AI, integration, media and identity treatment | Controlled evaluator fixtures; report distinguishes semantic quality, transcript revisions, delivery coordination, trusted identity and production follow-up from executed work |
| Reproducibility and artifact scope | Fresh extraction and execution; only the two new research documents; no changed tracked files, dependencies, course material or Git mutations |

The Markdown audit checked **1,001 local links across 92 tracked-plus-new Markdown documents**, including the three authenticated-access documents added concurrently during this work. It also checked the new documents' table column counts, fence balance and whitespace. The Mermaid relationship diagram received a static syntax/content review, not a renderer-based visual test. A separate repository-wide `npm run check:links` run reports the existing `thread://` link in untracked `learning/Full-Stack-Backend-Curriculum.md`; that independent file was not changed. No actual learner study, provider integration, workload benchmark or production-readiness claim follows from these checks.

Final repository recheck: a concurrent update added three authenticated-access documents in commit `60f6102ea1b2329d1fa717e2134491f2467a7cee`. The live upstream default branch and local main both resolve to that commit, **0 ahead / 0 behind**. The update does not overlap this investigation. The two new research files and the pre-existing `learning/` directory remain untracked; this research was not committed or pushed.

For reproduction identity, the following SHA-256 values cover extracted executable text normalized to LF with exactly one final newline. They match the blocks used by the fresh run:

| Block | SHA-256 |
| --- | --- |
| PostgreSQL model | `5f29319b6cc8360fe93fe8c0d4bb59909bc9041ddfca5d228b7e321c377b379c` |
| Initial fixture | `b3d4a286e4fd7ea90938403da571262db1ff47350a50b550b18e3f67f39f966b` |
| Connected journey | `c1a37f10b1d48e1f765d8e431cfa666b433ebfa7a6292f23192cd8f96954c40e` |
| Setup | `79b24435a8faa213c3d3ce05d18cb6f1ae1e5791fbd28336f4ce130c2ec68acb` |
| Verifier | `cc47e5cde8cd42cc2683b38241967deb5bd87a835fdd1baeea2c257515d16592` |
