# Research log: business workflows and approvals

Started 10 Nov 2026. **Completed 11 Nov 2026: research, native verification and final artifact audit passed within the stated evidence boundaries.** See the [report](How%20business%20systems%20run%20workflows%20and%20approvals.md).

## Objective and deliverables

The user selected a thorough investigation of business workflows, approvals and long-running processes. Explain how a purchase can require several approvals, wait weeks, change approver, suffer partial failures and continue safely. Follow definitions, individual runs, human tasks, deadlines, delegation, retries, cancellation, compensation and changing rules while old runs remain active. Keep database records and backend behavior central, comparing multiple product families rather than treating one workflow engine as universal.

Deliver a connected research report and this investigation log in this directory. Include primary-source comparisons, immutable source-code references, an explicit illustrative data model, concrete request/transaction timelines, verification evidence and a requirement-by-requirement completion audit. Do not build a production workflow service or change the SQL course. No commit or push is requested.

## Repository preflight and preserved scope

GitHub metadata confirmed authoritative repository `omsrivastava512/sql-postgresql-course`, default `main`. Live branch lookup returned `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local main is `b6835646afca5c2755eb180b0e666e0f486d0d65`; direct ancestry comparison reports **7 ahead / 0 behind**. No update is needed and no Git mutation was performed. Local commits are `60da999`, `7c27b50`, `254acf0`, `f01f566`, `c5ad1e6`, `d7c95fb` and `b683564`.

All-state PR search returned none. Issue search for workflow/approval/orchestration returned none. Commit searches for workflow and approval found only the earlier concurrency/migration lesson commit `9686887`, not an equivalent investigation. Local research mentions workflows incidentally but has no dedicated report. No repository AGENTS.md was found; the supplied global instructions apply within their stated scope.

Preserve existing course/index/test edits, untracked lessons/labs 30–32 and the previous file-storage research. An initial SHA-256 baseline was recorded outside the repository, but its original `baseline.json` was unavailable when work resumed on 11 Nov. A fresh `resume-baseline.txt` records all 33 existing files outside this investigation. The final comparison uses that resume baseline and must not be represented as an uninterrupted original-baseline check. Only this new research directory is in scope.

## Research plan and acceptance questions

| Area | Questions the report must answer | Intended evidence |
| --- | --- | --- |
| Definitions versus runs | What identifies a process definition/version, request, run, step instance, attempt, task, decision and business object? Is a workflow just a status column? | Contrasting engines, pinned schemas and concrete rows |
| Human decisions | Sequential, parallel, unanimous, first-response and quorum decisions; candidates versus assignee; claim/delegate/reassign; self-approval, membership changes and evidence of what was approved | Business product contracts, engine task implementation, worked approval rounds |
| Rules and branching | Facts and rule versions, thresholds, conditions, joins, loops, rejection, resubmission, child processes and ad-hoc work | BPMN/decision model and application examples; explicit policy alternatives |
| Waiting and scheduling | What survives a restart? Durable timers, calendars/time zones, deadlines versus reminders, escalation, callback correlation and early/late messages | Engine docs/code, event and timer records |
| Execution and transactions | Workers, queues, leases, fencing, optimistic locks, outbox/inbox, retries, deduplication and ambiguous external results | Pinned implementation plus synthetic executable invariants |
| Failure recovery | Crash before/after effect, duplicate response, lost callback, partial parallel work, exhausted retries, operator repair and reconciliation | Competing timelines and verified stored outcomes |
| Cancellation and compensation | Cancel request versus stopped execution; completed external effects; reversal failures and manual intervention | Engine contracts and saga examples, clearly distinguished from SQL rollback |
| Version changes | Definition version, policy version, business-data revision; old runs versus new deployments; replay compatibility and explicit migration | Temporal and BPMN migration contracts, code where useful |
| Authorization and tenancy | API checks, task visibility, actor/effective actor, delegation scope, tenant joins, credentials, secrets and sensitive history | Product contracts and model invariants; not a security certification |
| Operations and retention | Business status versus engine status; searchable views, audit, metrics, repair, retention, backups and cost drivers | Company engineering accounts and provider operating limits |
| Connected walkthrough | Purchase request, multiple approvers, absence/escalation, amendment, vendor action, uncertain result, cancellation/reversal and rule upgrade | Actual rows, diagrams, transitions and experiment results |
| Comparative breadth | Human-centric BPM engines, durable code execution, cloud state machines, business approval products and low-code automation | Sources selected for distinct mechanisms, not a citation quota |

Workflow source candidates: Temporal/Cadence, Camunda 7/8, Flowable, AWS Step Functions, Power Automate, Salesforce, Frappe/ERPNext and n8n. These are research leads, not yet established findings. Trace at least three contrasting open implementations if accessible. Separate historical releases from current contracts. Do not execute downloaded application code or use real user/provider accounts.

## Evidence discipline

- Confirmed: a bounded claim established by opened primary documentation or inspected pinned code. Not independent production verification.
- Inferred: an explanation or proposed teaching design, explicitly distinct from provider internals.
- Unknown: not established by accessible evidence; never fill in a private schema from public API shape.
- A source listing/search snippet is a lead until its relevant body is read. Record version conflicts, failed fetches and unresolved discrepancies.
- Tests prove only their stated model and failure schedule. Embedded SQL is not evidence of competing native PostgreSQL sessions. A mocked external effect is not a live integration.

## Early leads requiring resolution

Microsoft's approval tutorial describes separating approval creation and response handling for work beyond a flow's lifetime. Its limits page says 30 days for a run, while its known-issues page says approval waiting fails after 28 days and the approval can remain in the action center. Read the full pages, preserve this discrepancy and avoid a universal waiting limit. The important research question is which persistent object outlives which executor.

Sources found: [approval tutorial](https://learn.microsoft.com/en-us/power-automate/modern-approvals), [approval types](https://learn.microsoft.com/en-us/power-automate/get-started-approvals), [known issues](https://learn.microsoft.com/en-us/power-automate/approvals-known-issues), [run limits](https://learn.microsoft.com/en-us/power-automate/limits-and-config). Other initial leads include [Camunda migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/), [AWS callback patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html) and [Temporal task errors](https://docs.temporal.io/references/workflow-task-errors).

## First evidence pass: 10 Nov 2026

The following releases were resolved through GitHub to immutable commits. They are historical inspection targets, not deployment recommendations:

| Project | Release | Commit | Inspected material |
| --- | --- | --- | --- |
| Frappe | v15.0.0 | b8c1f492c492f7cbbfd3cc768234fbb244fd3737 | frappe/model/workflow.py; frappe/workflow/doctype/workflow/workflow.json |
| Temporal server | v1.27.0 | b1ae42e00f5d784b66c41ac7d353ef9e55390241 | schema/postgresql/v12/temporal/schema.sql |
| Flowable | flowable-7.1.0 | 46e0b79cbd02ebd637890b78d428595b1a9a6299 | modules/flowable-task-service/src/main/resources/org/flowable/task/service/db/mapping/entity/Task.xml |

Copies of those four source files are saved as text outside the repository in the task scratch directory. No downloaded source was executed. Frappe's transition path reloads the document, derives allowed actions from current state, roles and conditions, applies a self-approval check, then saves/submits/cancels and adds a workflow comment. Its bulk action commits separately per document. This is materially different from a universal immutable process-run model; inspect document concurrency handling before making a race-safety claim.

Temporal's PostgreSQL schema separately stores current executions, execution payloads, history branches/nodes, activity/timer information, buffered events and task queues. Many fields are serialized byte payloads rather than ordinary business columns. This establishes storage representation only; inspect mutation code before asserting atomicity or locking details.

Flowable's actual task mapper inserts distinct owner, assignee, delegation, process/definition references, lifecycle timestamps, tenant and form fields into ACT_RU_TASK. Its update increments REV_ and later constrains the old revision. Follow command and persistence handling before claiming how a losing update reaches the caller.

Opened primary documentation: Temporal workflow-execution overview, activities, message passing, event history and Continue-As-New; Power Automate modern approvals, known issues and flow limits; AWS Standard/Express workflow comparison. Relevant Temporal bodies were read through targeted finds after the initial page excerpts contained navigation. Temporal distinguishes replayed workflow commands from retryable Activities; Continue-As-New retains Workflow ID but creates another Run ID/history. AWS's comparison distinguishes Standard, asynchronous Express and synchronous Express execution semantics; the broad Express paragraph must not override its more specific distinction. Do not convert any engine-level execution promise into a general exactly-once external-effect guarantee.

The Microsoft known-issues body confirms an early-response race between separate create/wait actions, stale Teams cards, and approval records outliving their waiter. The other two full pages were opened but their relevant duration paragraphs still need targeted inspection before closing the 28/30-day discrepancy.

Access notes: the guessed Camunda architecture URL failed; search located the actual Zeebe technical-concepts path. Guessed Flowable schema directories returned 404; directory discovery located a real SQL mapper instead. A repository-wide recursive tree request was explicitly canceled after repeated live waits; smaller subtree/directory reads succeeded. None of those failed reads is evidence about implementation behavior.

## Second evidence pass and synthesis: 10–11 Nov 2026

The first-pass open questions above describe the investigation at that time. The following follow-ups close the accessible evidence gaps while retaining genuinely unknown behavior:

- Inspected Flowable's claim, delegation, resolution, job acquisition and database-flush paths at the same pinned commit. A zero-row revision update throws an optimistic-locking exception; delegation and resolution preserve different actor meanings; expiring job ownership is distinct from holding a SQL transaction open for a human wait.
- Read Temporal's pinned `UpdateWorkflowExecution` path, including the history append before its mutable-state transaction. Corrected the tempting but unsupported claim that all persistence is one atomic SQL transaction. Full append-failure recovery remains outside the inspected trace.
- Read the targeted Microsoft duration paragraphs. Rechecked all three on 11 Nov: the known-issues page still says 28 days; limits say 30 days; the tutorial describes separate creation/response flows with Dataverse beyond 30 days. Preserve the contradiction rather than picking a universal number.
- Read Camunda user tasks, compensation and instance migration; AWS integration and redrive contracts; Salesforce step and process API records; n8n queue/wait behavior; and Uber's dated Cadence isolation account. The report distinguishes documentation, actual pinned storage code and inferred designs.
- Added a connected purchase model and explicit comparisons for expenses, onboarding, provisioning, contracts, refunds, access requests and cases. These additional domain models are teaching designs, not private vendor schemas.

### Source register and claim boundaries

Primary-source bodies below were inspected on 10–11 Nov 2026. Rolling URLs are dated evidence, not permanent version pins. Camunda pages displayed version 8.10; inspected open-source code is pinned separately. Search hits and navigation-only excerpts were not used as proof.

| Source group | Primary references | What was used |
| --- | --- | --- |
| Temporal execution | [Workflow execution](https://docs.temporal.io/workflow-execution), [Activities](https://docs.temporal.io/activities), [messages](https://docs.temporal.io/encyclopedia/workflow-message-passing), [history events](https://docs.temporal.io/workflow-execution/event), [Continue-As-New](https://docs.temporal.io/workflow-execution/continue-as-new), [safe deployments](https://docs.temporal.io/develop/safe-deployments) | Replay versus effects, retries/checkpoints, message types, history/run identity and compatible deployment. Not a live engine test. |
| Camunda 8.10 | [User tasks](https://docs.camunda.io/docs/components/modeler/bpmn/user-tasks/), [compensation](https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/), [migration](https://docs.camunda.io/docs/components/concepts/process-instance-migration/) | Human-task activation/assignment boundaries, compensation scope/order and active-instance mapping including timers. Do not apply these contracts to Camunda 7 or older Tasklist versions. |
| AWS Step Functions | [Types](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html), [integration patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html), [redrive](https://docs.aws.amazon.com/step-functions/latest/dg/redrive-executions.html) | Named execution boundaries, callbacks versus job waiting, cancellation limitations and original-definition redrive. No AWS account used. |
| Power Automate | [Known issues](https://learn.microsoft.com/en-us/power-automate/approvals-known-issues), [limits](https://learn.microsoft.com/en-us/power-automate/limits-and-config), [long-running approvals](https://learn.microsoft.com/en-us/power-automate/modern-approvals) | Durable approval versus waiter versus notification; documented early-response race; unresolved 28/30-day difference. Readable article bodies were available despite an authorization notice in page chrome. |
| Salesforce | [ProcessInstanceStep](https://developer.salesforce.com/docs/platform/object-reference/references/standard-objects/object-processinstancestep.html), [process API](https://developer.salesforce.com/docs/platform/api/guide/sforce-api-calls-process.html) | Original/current actor and NoResponse semantics; per-record bulk results. API records are not physical SQL tables; no claim about all newer Flow approval products. |
| n8n | [Queue mode](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode.md), [Wait node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait) | Execution-ID handoff and stored waits, including the under-65-second exception and server-time behavior. |
| Uber/Cadence | [Multi-tenant task processing](https://www.uber.com/us/en/blog/cadence-multi-tenant-task-processing/) | Engineering account dated 16 Dec 2021: delayed work can overload shared resources despite incoming API limits. No claim to reproduce current Uber architecture. |
| PostgreSQL 17 | [Read Committed](https://www.postgresql.org/docs/17/transaction-iso.html), [time functions](https://www.postgresql.org/docs/17/functions-datetime.html) | Row-lock waiter behavior and actual clock versus transaction start, checked against native model experiments. |

The three open implementations are Frappe, Flowable and Temporal. The initial table above records releases/commits; the report links directly to every inspected file. Additional inspected paths were:

| Repository at pinned commit | Path or bounded trace |
| --- | --- |
| Flowable | `modules/flowable-engine/src/main/java/org/flowable/engine/impl/cmd/ClaimTaskCmd.java` |
| Flowable | `modules/flowable-engine/src/main/java/org/flowable/engine/impl/cmd/DelegateTaskCmd.java` and `ResolveTaskCmd.java` |
| Flowable | `modules/flowable-engine-common/src/main/java/org/flowable/common/engine/impl/db/DbSqlSession.java`, affected-row check in `flushUpdateEntity`, called by `flushUpdates` |
| Flowable | `modules/flowable-job-service/src/main/java/org/flowable/job/service/impl/cmd/AcquireJobsCmd.java` |
| Temporal | `common/persistence/sql/execution.go`, especially `UpdateWorkflowExecution` around lines 342–446 |

Full downloaded text does not imply every function was audited: the task mapper's insert/update sections, the persistence conflict check and the Temporal update trace were targeted reads. Frappe document-save concurrency, Temporal history append recovery and proprietary platform storage remain bounded unknowns. A separate Camunda 8.8 task-lifecycle lead was not generalized into a current Tasklist authorization claim. No downloaded application source was executed.

## Native verification: 11 Nov 2026

Used Node.js with the repository's existing `pg` 8.16.3 client and a disposable PostgreSQL 17.11 Windows cluster. The PostgreSQL archive was reused from the previous investigation after SHA-256 verification: `4b8db0930c38f6ef845db919551dedda3b6b845aeb0927b3d79a6e8e9e4537cf`, matching the [EDB maintainer's checksum](https://github.com/EnterpriseDB/edb-installers/issues/682#issuecomment-5580623267). The [PostgreSQL Windows distribution page](https://www.postgresql.org/download/windows/) identifies EDB as a distribution option. No dependency or service installation was added to the repository.

An initial embedded PostgreSQL run compiled the model and committed its seed. That established syntax/seed compatibility only. The first native initialization failed because the extracted archive lacked the server's library DLLs (`dict_snowball` was missing). After extracting those DLLs from the same verified archive, initialization completed. The original process handle was no longer available on continuation; `PG_VERSION` and `pg_ctl status` were checked before starting, rather than assuming the previous process remained live or initializing a second cluster.

The native server listened only on `127.0.0.1:55441`, used a random SCRAM password kept outside the repository, and required elevated execution for the local sandbox's process/loopback restrictions. No credential is included in these documents. Three database sessions ran at Read Committed. Every race required an observed blocker via `pg_blocking_pids`, not just a delayed promise or back-to-back calls.

Initial native pass: 81 assertions, 12 observed blocking schedules. Review then found and corrected two model defects: a repeated cancellation could conceal failed compensation, and reassigning a different gate could clear an unresolved expiry. Added tests for those cases, concurrent worker claims, waiting retry after rollback, post-success cancellation, definitive unsuccessful effects, expired leases before replacement, and the complete report walkthrough. Added audit timestamps. Final native run: **103 named assertions and 14 observed blocking schedules, all passed, PostgreSQL 17.11, exit 0**. No SQL change followed that successful run.

The harness extracts the report's actual model and story SQL, so verification does not depend on an independently maintained copy. The story is executed statement by statement to preserve its stated autocommit boundaries. The small statement splitter is sufficient for this particular block, which contains no semicolons in quoted text or procedural bodies; it is not a general SQL parser. The model block is executed intact, including its seed transaction.

The final story stored run W90 as cancelled, round/reviewed revision 2 and definition 7. Five approved task rows and one withdrawn task row remained. `place:2` and `cancel:2` both remained succeeded with lease number 2 and remote reference V42. These are selected actual results, also tabulated in the report.

### What the experiment does not prove

The vendor is a separate committed fixture transaction in the same database, not an independent server. The harness assumes a stable operation key and compares its payload; it does not establish that any real vendor offers that contract. The lost local completion is a deliberate rollback, not an OS crash or network fault. Timer/lease instants are moved into the past rather than waiting days. Repair is an explicitly audited fixture transaction under the run lock, not an implemented operator application. No arbitrary graph interpreter, scheduler daemon, production authentication/RLS, broker, engine migration, backup restoration, throughput benchmark or real provider integration was built or claimed.

The 103 count covers named result assertions, including seven connected-story checks; the 14 blocking observations are counted separately. Fixture setup and every intermediate story statement are not presented as separate tests. The policy compares several approval styles but only executes manager-then-Finance-and-Security unanimity. This is deliberate research coverage, not a claim to implement every discussed system.

### Reproduce the native checks

Use a disposable database: the harness repeatedly drops `wf_lab` and truncates its simulated vendor orders. Run from the repository root so it can load the existing `pg` dependency and the report. Save the following JavaScript block as `verify.mjs` in a scratch directory. Set `WF_SCRATCH` to that directory and standard `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, `PGPASSWORD` variables for your disposable server; alternatively supply `pg-password.txt` in the scratch directory. It writes `results.txt` and `story-rows.txt` there. Run `node <scratch-directory>/verify.mjs`. Do not use a database containing valuable schemas with those names. The historical defaults identify the original local experiment only.

````javascript
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(path.resolve('package.json'));
const pg = require('pg');

const dir = process.env.WF_SCRATCH || 'C:/Users/HP/AppData/Local/Temp/codex-workflow-research';
const report = await fs.readFile(path.resolve('research/database-design/business-workflows-and-approvals/How business systems run workflows and approvals.md'),'utf8');
const blocks = [...report.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map(m=>m[1]);
const config = {host:process.env.PGHOST || '127.0.0.1',port:Number(process.env.PGPORT || 55441),user:process.env.PGUSER || 'researcher',database:process.env.PGDATABASE || 'postgres',password:process.env.PGPASSWORD || (await fs.readFile(dir+'/pg-password.txt','utf8')).trim(),statement_timeout:8000,connectionTimeoutMillis:4000};
const [db,a,b] = [new pg.Client(config),new pg.Client(config),new pg.Client(config)];
const clients=[db,a,b], outcomes=[], blockers=[];
function eq(value,want,label){assert.deepEqual(value,want,label);outcomes.push(label);}
async function scalar(sql){return Object.values((await db.query(sql)).rows[0])[0];}
async function reset(){await db.query('DROP SCHEMA IF EXISTS wf_lab CASCADE');await db.query(blocks[0]);for(const c of clients)await c.query('SET search_path=wf_lab,public');}
async function fails(sql,pattern,label){let caught=false;try{await db.query(sql);}catch(e){assert.match(e.message,pattern);caught=true;}eq(caught,true,label);}
const who={manager:'bob',finance:'carol',security:'dan'};
function decision(gate,{actor=who[gate],round=1,authority=1,revision=round,choice='approve',key=gate+round}={}){
  return `SELECT decide('T1','W90',${round},'${gate}','${actor}',${authority},${revision},'${choice}','${key}')`;
}
const state=()=>scalar("SELECT state FROM run WHERE tenant='T1' AND id='W90'");
async function approve(){for(const gate of ['manager','finance','security'])await db.query(decision(gate));}
async function locked(sql){await db.query("BEGIN; SELECT id FROM run WHERE tenant='T1' AND id='W90' FOR UPDATE");try{await db.query(sql);await db.query('COMMIT');}catch(e){await db.query('ROLLBACK');throw e;}}
async function race(label,sqlA,sqlB,end='COMMIT'){
  await a.query('BEGIN');await b.query('BEGIN');const first=await a.query(sqlA);
  const pending=b.query(sqlB).then(result=>({result}),error=>({error}));
  const until=Date.now()+5000;let observed=false;
  while(Date.now()<until){const q=await db.query('SELECT $1::int = ANY(pg_blocking_pids($2::int)) AS waiting',[a.processID,b.processID]);if(q.rows[0].waiting){observed=true;break;}await new Promise(resolve=>setTimeout(resolve,25));}
  assert(observed,'Missing blocker: '+label);blockers.push(label);
  await a.query(end);const second=await pending;await b.query(second.error?'ROLLBACK':'COMMIT');return {first,...second};
}
const reassign="SELECT reassign_task('T1','W90','manager','ops',1,'erin',clock_timestamp()+interval '2 days')";
const cancel="SELECT cancel_run('T1','W90','alice')";
const claim="SELECT claim_effect('T1','W90','place:1')";
try{
  await Promise.all(clients.map(c=>c.connect()));
  const version=await scalar('SHOW server_version');
  eq(await scalar('SHOW transaction_isolation'),'read committed','native checks use Read Committed');
  await reset();
  await fails("SELECT decide('T2','W90',1,'manager','bob',1,1,'approve','x')",/no rows/,'wrong tenant cannot resolve run');
  await fails(decision('manager',{actor:'alice'}),/actor not eligible/,'requester cannot approve own purchase');
  await fails(decision('manager',{actor:'erin'}),/stale task authority/,'eligible participant still needs assignment');
  await fails(decision('finance'),/stale task authority/,'future gate cannot approve early');
  await fails(decision('manager',{revision:2}),/stale review/,'reviewed revision must match');
  await fails(decision('manager',{choice:'maybe'}),/invalid decision/,'unsupported decision rejected');
  const original=await scalar(decision('manager'));
  eq(await scalar(decision('manager')),original,'duplicate decision returns original receipt');
  eq(await scalar('SELECT count(*)::int FROM audit'),1,'duplicate decision adds no audit event');
  await fails(decision('manager',{choice:'reject'}),/request key reused/,'request key cannot change payload');
  await fails(decision('manager',{key:'different'}),/stale task authority/,'new key cannot decide completed task');
  await db.query(decision('finance'));eq(await state(),'reviewing','one parallel gate cannot release purchase');
  await db.query(decision('security'));eq(await state(),'approved','all three gates release purchase');
  eq(await scalar('SELECT count(*)::int FROM effect'),1,'final approval enqueues one effect');
  eq(await scalar('SELECT count(*)::int FROM outbox'),1,'effect and outbox created together');
  eq(await scalar("SELECT payload FROM effect WHERE id='place:1'"),{purchase:'P42',revision:1,amount:120000},'effect binds reviewed facts');
  eq(await scalar('SELECT definition_version FROM run'),7,'new definition does not migrate existing run');
  await reset();
  eq(await scalar(reassign),2,'reassignment increments authority version');
  eq(await scalar("SELECT original_assignee FROM task WHERE gate='manager'"),'bob','original assignee retained');
  await fails(decision('manager'),/stale task authority/,'old assignee cannot use old action');
  await fails(decision('manager',{actor:'erin'}),/stale task authority/,'new assignee needs new authority version');
  await fails("SELECT reassign_task('T1','W90','manager','bob',2,'bob',clock_timestamp()+interval '2 days')",/admin required/,'reassignment requires administrator');
  await db.query(decision('manager',{actor:'erin',authority:2}));
  eq(await scalar("SELECT state FROM task WHERE gate='manager'"),'approved','replacement can approve');
  await reset();
  await db.query(decision('manager'));await db.query(decision('finance'));
  eq(await scalar("SELECT amend('T1','W90','alice',1,180000)"),2,'amendment creates new revision');
  eq(await scalar("SELECT count(*)::int FROM task WHERE round=1 AND state='approved'"),2,'historical decisions preserved');
  eq(await scalar("SELECT state FROM task WHERE round=1 AND gate='security'"),'withdrawn','unanswered old task withdrawn');
  await fails(decision('security'),/stale review/,'old round response rejected');
  eq((await scalar(decision('manager'))).round,1,'retry returns historical receipt without deciding new round');
  for(const gate of ['manager','finance','security'])await db.query(decision(gate,{round:2}));
  eq(await scalar("SELECT payload FROM effect WHERE id='place:2'"),{purchase:'P42',revision:2,amount:180000},'new round authorizes amended amount');
  eq(await scalar('SELECT count(*)::int FROM purchase_revision'),2,'old reviewed snapshot remains');
  await reset();await db.query(decision('manager',{choice:'reject'}));
  eq(await state(),'rejected','rejection closes review');
  eq(await scalar("SELECT count(*)::int FROM task WHERE state='withdrawn'"),2,'rejection withdraws unanswered tasks');
  eq(await scalar('SELECT count(*)::int FROM effect'),0,'rejection creates no vendor intent');
  await reset();await db.query(reassign);
  await locked("UPDATE task SET due_at=clock_timestamp()-interval '1 second' WHERE gate='manager'");
  eq(await scalar("SELECT expire_task('T1','W90',1,'manager',1)"),false,'old timer generation cannot expire reassigned task');
  await fails(decision('manager',{actor:'erin',authority:2}),/after deadline/,'late decision denied even before scheduler runs');
  eq(await scalar("SELECT expire_task('T1','W90',1,'manager',2)"),true,'current timer expires task');
  eq(await scalar("SELECT expire_task('T1','W90',1,'manager',2)"),false,'replayed timer has no second effect');
  eq(await state(),'needs_attention','expiry parks run for intervention');
  eq(await scalar("SELECT reassign_task('T1','W90','manager','ops',3,'erin',clock_timestamp()+interval '1 day')"),4,'administrator can reopen expired task with fresh authority');
  await db.query(decision('manager',{actor:'erin',authority:4}));
  await reset();await db.query(decision('manager'));
  await locked("UPDATE task SET due_at=clock_timestamp()-interval '1 second' WHERE gate='finance'");
  await db.query("SELECT expire_task('T1','W90',1,'finance',1)");
  await db.query("SELECT reassign_task('T1','W90','security','ops',1,'dan',clock_timestamp()+interval '1 day')");
  eq(await state(),'needs_attention','unrelated reassignment cannot clear expired finance gate');
  await db.query("SELECT reassign_task('T1','W90','finance','ops',2,'carol',clock_timestamp()+interval '1 day')");
  eq(await state(),'reviewing','repairing expired gate releases review');
  await reset();await db.query(decision('manager'));await db.query(decision('finance'));
  await db.query('BEGIN');await db.query(decision('security'));await db.query('ROLLBACK');
  eq(await state(),'reviewing','rollback preserves unfinished review');
  eq(await scalar('SELECT count(*)::int FROM effect'),0,'rollback removes vendor intent');
  eq(await scalar('SELECT count(*)::int FROM outbox'),0,'rollback removes outbox entry');
  eq(await scalar('SELECT count(*)::int FROM decision_receipt'),2,'rollback removes final decision receipt');
  await db.query(decision('security'));eq(await state(),'approved','same command succeeds after rollback');
  await reset();await db.query(decision('manager'));await db.query(decision('finance'));
  const duplicate=await race('duplicate final decision',decision('security'),decision('security'));
  eq(duplicate.result.rows,duplicate.first.rows,'concurrent duplicate returns same receipt');
  eq(await scalar('SELECT count(*)::int FROM effect'),1,'concurrent duplicate creates one effect');
  eq(await scalar('SELECT count(*)::int FROM decision_receipt'),3,'concurrent duplicate creates one final receipt');
  await reset();
  const conflict=await race('approve versus reject',decision('manager'),decision('manager',{choice:'reject',key:'reject'}));
  eq(conflict.error?.message,'stale task authority','competing choice cannot overwrite accepted decision');
  await reset();await db.query(decision('manager'));
  const join=await race('parallel gate completions',decision('finance'),decision('security'));
  eq(join.error,undefined,'both independent gates accepted');eq(await state(),'approved','parallel join advances once');
  eq(await scalar('SELECT count(*)::int FROM outbox'),1,'parallel join emits one intent');
  await reset();
  const reassigned=await race('reassignment before decision',reassign,decision('manager'));
  eq(reassigned.error?.message,'stale task authority','reassignment defeats stale approval');
  await reset();
  const decided=await race('decision before reassignment',decision('manager'),reassign);
  eq(decided.error?.message,'stale reassignment','accepted decision defeats stale reassignment');
  await reset();
  const revoke=await race('revocation before decision',"SELECT id FROM run FOR UPDATE; UPDATE participant SET active=false WHERE actor='bob'",decision('manager'));
  eq(revoke.error?.message,'actor not eligible','eligibility rechecked after waiting');
  await reset();
  const changed=await race('amendment before decision',"SELECT amend('T1','W90','alice',1,180000)",decision('manager'));
  eq(changed.error?.message,'stale review','amendment defeats stale reviewed revision');
  await reset();
  const timeout=await race('deadline changes before waiting decision',"SELECT id FROM run FOR UPDATE; UPDATE task SET due_at=clock_timestamp()-interval '1 second' WHERE gate='manager'",decision('manager'));
  eq(timeout.error?.message,'decision after deadline','deadline checked after lock acquisition');
  await reset();
  const stopped=await race('cancellation before approval',cancel,decision('manager'));
  eq(stopped.error?.message,'stale review','cancelled review cannot accept a decision');
  await reset();await db.query(decision('manager'));await db.query(decision('finance'));
  const afterApproval=await race('final approval before cancellation',decision('security'),cancel);
  eq(afterApproval.result.rows,[{cancel_run:'cancelled'}],'cancellation prevents unclaimed vendor action');
  eq(await scalar("SELECT state FROM effect WHERE id='place:1'"),'cancelled','pending operation retired');
  await reset();await approve();
  const cancelFirst=await race('cancellation before worker claim',cancel,claim);
  eq(cancelFirst.result.rows,[{claim_effect:null}],'worker cannot claim cancelled operation');
  await reset();await approve();
  const claimFirst=await race('worker claim before cancellation',claim,cancel);
  eq(claimFirst.result.rows,[{cancel_run:'cancel_requested'}],'claimed operation requires reconciliation');
  await reset();await approve();
  const competingClaims=await race('two worker claims',claim,claim);
  eq(competingClaims.first.rows,[{claim_effect:1}],'winning worker receives first lease');
  eq(competingClaims.result.rows,[{claim_effect:null}],'waiting worker cannot acquire same live lease');
  await reset();await db.query(decision('manager'));await db.query(decision('finance'));
  const rolledBack=await race('final approval rollback then retry',decision('security'),decision('security'),'ROLLBACK');
  eq(rolledBack.error,undefined,'waiting duplicate proceeds after original rollback');
  eq(await scalar('SELECT count(*)::int FROM effect'),1,'waiting retry commits one intent after rollback');
  await reset();await approve();await db.query(claim);
  eq(await scalar("SELECT finish_effect('T1','W90','place:1',1,'succeeded','V42','success')"),'fulfilled','confirmed order completes fulfillment stage');
  eq(await scalar(cancel),'compensating','cancellation after known success requires compensation');
  eq(await scalar("SELECT payload FROM effect WHERE id='cancel:1'"),{remote_ref:'V42'},'post-success cancellation retains actual target');
  await reset();await approve();await db.query(claim);await db.query(cancel);
  eq(await scalar("SELECT finish_effect('T1','W90','place:1',1,'failed',NULL,'refused')"),'cancelled','definitive failed purchase needs no compensation');
  eq(await scalar('SELECT count(*)::int FROM effect'),1,'no reversal is invented for an unsuccessful effect');
  await reset();await approve();
  eq(await scalar(claim),1,'first worker receives lease one');
  eq(await scalar(claim),null,'unexpired lease excludes competing claim');
  await db.query('CREATE SCHEMA IF NOT EXISTS vendor_sim; CREATE TABLE IF NOT EXISTS vendor_sim.orders(operation_key text PRIMARY KEY,payload jsonb NOT NULL,remote_ref text NOT NULL,state text NOT NULL); TRUNCATE vendor_sim.orders');
  await db.query("INSERT INTO vendor_sim.orders SELECT 'T1/W90/place:1',payload,'V42','accepted' FROM effect WHERE id='place:1'");
  await db.query('BEGIN');await db.query("SELECT finish_effect('T1','W90','place:1',1,'succeeded','V42','result1')");await db.query('ROLLBACK');
  eq(await scalar('SELECT count(*)::int FROM vendor_sim.orders'),1,'separate vendor transaction survives local rollback');
  eq(await state(),'ordering','unknown external result does not invent local success');
  await locked("UPDATE effect SET lease_until=clock_timestamp()-interval '1 second' WHERE id='place:1'");
  await fails("SELECT finish_effect('T1','W90','place:1',1,'succeeded','V42','expired-worker')",/stale worker/,'expired worker cannot publish even before replacement');
  eq(await scalar(claim),2,'replacement receives a higher lease number');
  await fails("SELECT finish_effect('T1','W90','place:1',1,'succeeded','V42','old-worker')",/stale worker/,'old worker cannot publish after lease replacement');
  await db.query("INSERT INTO vendor_sim.orders SELECT 'T1/W90/place:1',payload,'V42','accepted' FROM effect WHERE id='place:1' ON CONFLICT (operation_key) DO NOTHING");
  eq(await scalar('SELECT count(*)::int FROM vendor_sim.orders'),1,'simulated vendor deduplicates stable operation identity');
  eq(await scalar("SELECT o.payload=e.payload FROM vendor_sim.orders o CROSS JOIN effect e WHERE e.id='place:1'"),true,'reconciliation matches original operation payload');
  eq(await scalar(cancel),'cancel_requested','uncertain purchase is not declared cancelled');
  eq(await scalar("SELECT finish_effect('T1','W90','place:1',2,'succeeded','V42','result2')"),'compensating','late confirmed purchase creates compensation');
  eq(await scalar("SELECT payload FROM effect WHERE id='cancel:1'"),{remote_ref:'V42'},'compensation targets actual vendor order');
  eq(await scalar("SELECT finish_effect('T1','W90','place:1',2,'succeeded','V42','result2')"),'compensating','duplicate result returns stored response');
  eq(await scalar('SELECT count(*)::int FROM effect'),2,'duplicate result creates no second compensation');
  await fails("SELECT finish_effect('T1','W90','place:1',2,'succeeded','different','result2')",/message key reused/,'result message cannot change payload');
  eq(await scalar("SELECT claim_effect('T1','W90','cancel:1')"),1,'compensation has its own lease');
  eq(await scalar("SELECT finish_effect('T1','W90','cancel:1',1,'failed',NULL,'cancel-fail')"),'manual_review','failed compensation remains unresolved');
  eq(await scalar("SELECT state FROM effect WHERE id='place:1'"),'succeeded','compensation failure does not erase original purchase');
  eq(await scalar(cancel),'manual_review','repeated cancellation cannot hide failed compensation');
  eq(await scalar("SELECT claim_effect('T1','W90','cancel:1')"),null,'failed compensation needs explicit repair before another claim');
  await locked("UPDATE effect SET state='pending' WHERE id='cancel:1' AND state='failed'; UPDATE run SET state='compensating'; INSERT INTO audit(tenant,run_id,actor,kind,details) VALUES ('T1','W90','ops','repair','{\"reason\":\"definitive vendor refusal corrected\"}')");
  eq(await scalar("SELECT claim_effect('T1','W90','cancel:1')"),2,'audited repair retries same compensation identity');
  await db.query("UPDATE vendor_sim.orders SET state='cancelled' WHERE remote_ref='V42'");
  eq(await scalar("SELECT finish_effect('T1','W90','cancel:1',2,'succeeded','V42','cancel-ok')"),'cancelled','confirmed compensation completes cancellation');
  eq(await scalar('SELECT count(*)::int FROM effect'),2,'repair does not create another purchase or compensation');
  eq(await scalar(cancel),'cancelled','repeated cancellation is stable');
  await reset();
  assert.equal(blocks.length,2,'report must contain model and connected story');
  for(const statement of blocks[1].split(/;\s*(?:\r?\n|$)/).filter(s=>s.trim()))await db.query(statement);
  eq(await state(),'cancelled','connected story reaches confirmed cancellation');
  eq(await scalar('SELECT reviewed_revision FROM run'),2,'connected story approves amended revision');
  eq(await scalar('SELECT definition_version FROM run'),7,'connected story remains on original definition');
  eq(await scalar("SELECT count(*)::int FROM task WHERE round=1 AND state='approved'"),2,'connected story retains earlier manager and finance decisions');
  eq(await scalar("SELECT payload FROM effect WHERE id='place:2'"),{purchase:'P42',revision:2,amount:180000},'connected story order binds revised amount');
  eq(await scalar('SELECT count(*)::int FROM effect'),2,'connected story records purchase and compensation separately');
  eq(await scalar("SELECT state FROM vendor_sim.orders WHERE operation_key='T1/W90/place:2'"),'cancelled','connected story vendor simulation records cancellation');
  const storyRows={run:(await db.query('SELECT tenant,id,round,reviewed_revision,definition_version,state FROM run')).rows,tasks:(await db.query('SELECT round,gate,assignee,authority_version,state FROM task ORDER BY round,gate')).rows,effects:(await db.query('SELECT id,kind,payload,state,lease_number,remote_ref FROM effect ORDER BY id')).rows};
  await fs.writeFile(dir+'/story-rows.txt',JSON.stringify(storyRows,null,2));
  const result={version,assertions:outcomes.length,blockerObservations:blockers.length,outcomes,blockers,limits:['Vendor rows simulate a remote contract; no network/vendor API was exercised.','The model is one fixed approval policy, not a general workflow interpreter.','A failed compensation is retried through an explicit fixture repair transaction under the run lock.']};
  await fs.writeFile(dir+'/results.txt',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(error){console.error(error);process.exitCode=1;}
finally{for(const c of clients){if(c._connected&&!c._ending){try{await c.query('ROLLBACK');}catch{}}await c.end().catch(()=>{});}}

````

## Completion audit: 11 Nov 2026

This audit checks the original research questions, not merely whether the SQL runs. “Complete” means the question is investigated with its evidence and limits stated; it does not mean every compared product was deployed or every discussed mechanism was implemented.

| Original requirement | Authoritative evidence inspected | Disposition |
| --- | --- | --- |
| Definitions versus runs, tasks, attempts and effects | Report sections 1–2; pinned Frappe, Flowable and Temporal traces; SQL definition/run/task/effect identities | Complete; three contrasting implementations, including serialized engine state |
| Human decisions, eligibility, delegation and reviewed facts | Section 4; Flowable delegation/resolution and Salesforce step contracts; native assignment, revocation, self-approval, receipt and revision tests | Complete; alternative voting policies analyzed, fixed departmental policy executed |
| Branches, joins, loops, rules, children and ad-hoc work | Section 5 and domain comparisons; native parallel join and new-round tests | Complete research coverage; no arbitrary process interpreter claimed |
| Waiting, calendars, deadlines, timers and callbacks | Sections 3 and 6; Microsoft discrepancy, n8n exception, message contracts; stale timer, late decision and expiry-repair checks | Complete; real multi-week waits and callback server are not simulated as successful integrations |
| Transactions, workers, leases, fencing, inbox/outbox and retries | Sections 7 and 12; pinned locking/acquisition paths; 14 native observed blocking schedules, rollback and lease-result checks | Complete for the documented model and schedules; dispatch remains a conceptual boundary |
| Failure recovery and uncertain external results | Failure table, separate vendor fixture commit, lost local completion, stable operation retry, failed compensation and explicit audited repair | Complete bounded investigation; no network/crash injection claim |
| Cancellation and compensation | Section 8; AWS and Camunda contracts; before/after claim races, known-success cancellation and failed-reversal retention | Complete; cancellation intent and completed reversal remain distinct |
| Version changes and long-lived executions | Section 9; Temporal deployment and Camunda migration documentation; original definition retained across amended review | Complete research coverage; actual engine migrations not exercised |
| Authorization, tenancy and sensitive history | Sections 4 and 10; version-specific Tasklist distinction; wrong-tenant, actor, reassignment and revocation tests | Complete analysis; trusted actor arguments are explicitly not production authentication |
| Operations, audit, retention, backups and cost drivers | Section 10; dated Uber account, per-item API outcomes, audit timestamps and repair records | Complete analysis; no price estimate, recovery drill or performance claim |
| Connected walkthrough with actual stored outcomes | Section 12: executable schema/procedures and story, final rows, two diagrams, transaction schedules; harness extracts both SQL blocks | Complete; seven final-story assertions included in total |
| Comparative breadth and evidence discipline | Nine evidence families, three pinned open implementations, 31 distinct primary links in report, seven additional domain comparisons, source register and unknowns | Complete; API contracts never represented as private schemas |
| Reproduction and artifact quality | Full harness embedded above matches executed scratch file after newline normalization; 103 distinct named assertions, 14 blockers; local-link and Markdown structure checks | Complete; Mermaid source reviewed structurally, not visually rendered |
| Scoped edits and temporary cleanup | Resume SHA-256 comparison: all 33 pre-existing files unchanged; native stop succeeded, pg_ctl reported no running server, process query found no matching research PostgreSQL process | Complete; only two new research documents authored; no commit or push |

Artifact checks: `node tests/check-links.mjs` passed **974 local links in 85 Markdown files**. Both documents passed balanced-fence, consistent table-column and trailing-whitespace checks. The embedded JavaScript exactly matches the executed harness after CRLF/LF normalization. The native result file contains 103 distinct named assertions and 14 blocking observations. Documentation prose added after the final database run did not change either SQL block.

SQL SHA-256 values after normalizing CRLF to LF:

- Model: `18cf072be054f4c2ff250231841d78b7391c89de846896c155dab50b6534ce03`.
- Connected story: `2aa6b383beeb82e42e8e2deccc49c2fd9c5bade8f993a13007fcb2805d69e9cb`.

Repository state changed independently during the investigation: local HEAD at final inspection was `0fdc81d` (the course lesson commit), whereas the initial preflight above records `b683564`. This investigation performed no Git mutations. File-content comparison, rather than unchanged Git status, proves that the 33 resume-baseline files were preserved. Final status showed only this new research directory and the pre-existing untracked file-storage research directory; the tracked diff was empty. The missing original baseline is not retroactively reconstructed.

## Not done and where to start

No required work remains for this research report. The open unknowns in section 14 are explicit evidence boundaries: proprietary storage, Microsoft's conflicting timeout documentation, uninspected engine recovery internals, and behavior requiring real deployment/integration tests. Further work would be a separately scoped implementation or experiment, such as provider idempotency validation, a real engine migration drill, or production authorization design. No such work is represented as already verified.

## Connected teaching pass, 11 Nov 2026

This later pass follows the user's collection-wide objective, not a new workflow implementation. Read the objective attachment, referenced chat and all four report/log pairs. Live GitHub repository metadata and branch lookup confirmed authoritative `omsrivastava512/sql-postgresql-course`, default `main`, at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local clean `main` at `25befd4` was exactly 10 ahead / 0 behind. All-state PR/issue searches returned none; remote history has no equivalent collection revision. Local `25befd4` contains the completed workflow investigation. No branch update or Git mutation was performed.

### Gap and repair

The opening illustration used revision/amount/task identifiers that did not line up with the executable story. Aligned it to P42/r1/120,000 → P42/r2/180,000, the compound task identity, definition 7/policy 12 and T1/W90/place:2. Reassignment is explicitly the model's behavior, rather than implying it implements Flowable's delegate/resolve path. Added a reading route distinguishing executable depth from comparative overview.

Before the long procedures, four smaller explanations now connect task authority, command receipts, the fixed departmental join and effect leases to their columns and invariants. A guided journey describes each existing call's inputs, trusted actor context, prior rows, changes, visibility and recovery. It follows the same identities through absence, amendment, approval, uncertain vendor result, cancellation, failed compensation and audited repair. It also identifies the external assumption: after cancellation, recovering an earlier operation is not permission to create a new purchase if no order exists.

Added predictions about a late round-1 retry and rollback at the join, an exercise changing Security to a conditional requirement with hints/answer, and a compact implementation decision record. Existing Flowable, Temporal, AWS and Camunda evidence informs the choices. No new provider claim required new research; the prior source boundaries and Microsoft discrepancy remain intact.

### Learning and evidence boundary

A reader should be able to explain why an old approval remains historical without authorizing an amended amount; why three department gates differ from three arbitrary votes; what an outbox preserves; why lease replacement does not change the vendor operation identity; and why cancellation can remain unresolved after the execution stops. Independent performance on the conditional-gate exercise has not been observed.

Both SQL blocks and the embedded reproduction harness are unchanged. The earlier 11 Nov PostgreSQL 17.11 results remain 103 assertions and 14 observed blocking schedules; none is presented as a new run during this pass. Vendor acceptance/compensation remain simulated, and the narrative's real-vendor recovery branches need integration evidence. Conditional gates, general workflow interpretation, actual schedulers, production access boundaries and disaster recovery remain outside the executable fixed-policy model.

Final artifact checks on 11 Nov: 978 local links in 85 Markdown files passed, including the new route into the worked model. All eight documents passed fence/table checks. Comparison with pre-edit HEAD after newline normalization preserved every fenced block, both embedded harnesses and the external source-target sets, so the two SQL hashes recorded earlier remain applicable. Reviewed task versions, rounds, reviewed amounts, original receipts, operation keys and cancellation states against the procedures and historical story results. The conditional-gate answer is explicitly a model extension. `git diff --check` passed; status contained exactly the eight authorized documents. No new concurrent-session/vendor result or learner-understanding claim is inferred from these checks.

Final review on 12 Nov: live upstream main remained at 9fbadbedca2e2828d619d9d47b47a6f31baf0887; the local branch remained 10 ahead / 0 behind. The same link and heading checks restricted to tracked Markdown passed 978 links in 85 files. Fence/table checks and unchanged-example/source comparisons passed again. The full recursive link checker now reports a thread-scheme link in the independently added, untracked learning/Full-Stack-Backend-Curriculum.md as a missing local file. That file and the checker were left untouched. The tracked diff remains confined to the eight authorized research documents; the earlier 11 Nov results remain dated observations.
