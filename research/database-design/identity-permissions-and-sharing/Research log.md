# Research log: identity, permissions and sharing

Started 12 Nov 2026. Completed 13 Nov 2026 (Asia/Calcutta): research, native experiments, fresh document-extracted reproduction and final artifact audit passed within the evidence boundaries below. See the [report](How%20business%20apps%20model%20identity%20permissions%20and%20sharing.md).

## Objective and boundaries

Implement the approved fifth investigation. Permissions are central; authentication, SSO, sessions, provisioning and recovery supply the trusted-identity and revocation boundaries. PostgreSQL carries a complete connected journey. SpiceDB executes the same bounded core decisions and a coordination experiment. Explain small mechanisms before combining them. Deliver this log and the companion report; keep reproduction code inside these documents and transient files outside the repository. Do not change earlier research, course files, dependencies or Git history.

## Preflight

Read the referenced Backend Research chat and confirmed the combined structure/enforcement topic. Live GitHub metadata and branch lookup on 12 Nov identified authoritative non-fork `omsrivastava512/sql-postgresql-course`, default `main`, at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local `main` at `879ffe8` is exactly 11 ahead / 0 behind. All-state pull-request and issue collections are empty. The remote history and local permission-related commits contain earlier lessons and research boundaries, not this investigation. No update is necessary. Untracked `learning/` predates this work and is outside scope. No repository AGENTS.md was found; the user-supplied instructions apply.

## Evidence discipline

Source-reported means an opened primary source or pinned implementation establishes the stated, bounded fact. Observed means an executed experiment recorded the result. Teaching policy is explicitly invented for the example. Reasoned schedules and proposed production extensions remain identified as such. A simulated identity is not an identity-provider integration; a fresh authorization check is not a transaction spanning a subsequent application write. Record failures and unresolved work rather than marking them complete.

## Environment

Executed with PostgreSQL 17.11, Node 24.15.0 and the existing pg 8.16.3 dependency. SpiceDB 1.57.1 and zed 1.2.1 native Windows binaries were downloaded from their official releases and matched the published Windows SHA-256 manifests before execution. PostgreSQL 17.11 is the existing experiment binary, not a claim about the newest patch release. The cluster contains separate `perm_app` and `perm_spice` databases and binds to loopback. No provider account or real identity was used.

| Artifact | SHA-256 |
| --- | --- |
| spicedb_1.57.1_windows_amd64.zip | efd82b06daf18a87a2f646441a34508ceb760d6bb76affc2adaeb497a16ebf26 |
| zed_1.2.1_windows_amd64.zip | 0da10d7e15633f5a4034da20a6575c498fc41ef31b611795b2c47e11ed272b7b |

Release sources: [SpiceDB 1.57.1](https://github.com/authzed/spicedb/releases/tag/v1.57.1), [zed 1.2.1](https://github.com/authzed/zed/releases/tag/v1.2.1). Tag lookup resolves SpiceDB 1.57.1 to commit `7074da7242e5aedfeb4586d93a403eca45388ada`.

## Sources read and their use

All readings below are dated 12 Nov 2026. Public product contracts are not evidence of private database layouts. The report uses comparisons at the decision they illuminate rather than copying a provider's policy into the fictional application.

| Primary source | Bounded finding and use |
| --- | --- |
| [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html#ClaimStability) | Issuer/subject identity and pairwise-subject caveat; separates trusted identity mapping from email and organization membership |
| [OpenID Connect back-channel logout](https://openid.net/specs/openid-connect-backchannel-1_0.html) | Application session termination remains part of implementing logout; no live SSO integration claimed |
| [SCIM core schema](https://www.rfc-editor.org/rfc/rfc7643#section-4.1.1) | Provider-defined meaning of administrative active status; use the bounded field definition, not a claim to cover subsequent SCIM extensions |
| [Discord permissions](https://docs.discord.com/developers/topics/permissions) | Actual overwrite order, administrator exception and limits of role-position intuition; informs the explicit-deny exercise |
| [Drive sharing](https://developers.google.com/workspace/drive/api/guides/manage-sharing) | Inherited/direct access, move effects and computed capabilities; explains why removing one route may leave another |
| [Drive ownership](https://developers.google.com/workspace/drive/api/guides/transfer-file) | Ownership depends on account/storage context; distinguishes file ownership from our organization-owner policy |
| [GitHub repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) | Role/base/owner distinctions and independent deploy-key access after removal; informs credential inventory |
| [PostgreSQL isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | Read Committed snapshots and lock waiting; basis for rechecking after the shared organization lock |
| [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | Separate enforcement feature with privileged bypass rules; no RLS-perimeter claim from these invoker-function tests |
| [SpiceDB schema](https://authzed.com/docs/spicedb/concepts/schema) | Subject sets, permission operators and explicit grouping; translated bounded policy |
| [SpiceDB relationships](https://authzed.com/docs/spicedb/concepts/relationships) | Stored relationships versus computed permissions; distinction between fixture projection and application mutation validation |
| [SpiceDB consistency](https://authzed.com/docs/spicedb/concepts/consistency) | Revision modes, defaults and tokens; experiment records default behavior without forcing a stale outcome |
| [SpiceDB read-after-write](https://authzed.com/docs/spicedb/concepts/read-after-write) | Consistency boundary after writes; supports the application token/acknowledgement discussion |
| [Windows installation](https://authzed.com/docs/spicedb/getting-started/install/windows) | Native experiment feasibility; actual release binaries and checksums verified separately |

Pinned implementation trace: [relationships.go](https://github.com/authzed/spicedb/blob/7074da7242e5aedfeb4586d93a403eca45388ada/internal/services/v1/relationships.go#L414) validates updates/preconditions within a datastore read/write transaction and returns its revision token. [permissions.go](https://github.com/authzed/spicedb/blob/7074da7242e5aedfeb4586d93a403eca45388ada/internal/services/v1/permissions.go#L78) obtains the selected revision and snapshot reader. These inspected paths support transaction/snapshot boundaries, not a complete engine audit or proof that application resource writes participate in them.

## Experiment record

The first complete scratch-model run passed 110 checks and observed 10 blockers. Coverage was then expanded for direct-grant removal, custom-role changes, local session revocation/expiry, and invitation expiry during a lock wait: 126 checks and 11 blockers. The document-extracted run added both orderings of the coordinated external edit plus assertions for the separately committed story: **133 checks and 12 observed blockers**, completed at **2026-11-12 15:52:56 UTC / 21:22:56 Asia/Calcutta**.

The expected permission matrix is specified independently in the harness. Each case is asserted against SQL and SpiceDB. It covers organization separation, owner access, inherited/team rights, guest scope, service-principal scope, direct grants, role changes, moves, removal and fresh membership after rejoining. Native races use two independent mutation sessions and a third observer querying `pg_blocking_pids`; these are not simulated wait diagrams.

| Observed blocker | Verified outcome |
| --- | --- |
| Revoke before edit | Waiting write rejects and preserves version 1 |
| Edit before revoke | Accepted version 2 remains after removal |
| Revocation rollback | Waiting edit succeeds |
| Cancel before accept | Acceptance rejects |
| Accept before cancel | Cancellation rejects; explicit membership removal is required |
| Duplicate acceptance | Same membership result, one acceptance event |
| Invitation expires while waiting | Deadline is evaluated after waiting and rejects |
| Two owners leave | Second removal rejects as last owner |
| Move before edit | Inherited edit path disappears before the waiting check |
| Team removal before edit | Waiting edit loses access |
| Coordinated external check/edit before revoke | Content commits under the application lock, then membership removal completes |
| Revocation before external edit | Application membership check rejects the waiting external edit |

SpiceDB freshness evidence: revocation-token and fully consistent checks denied. The historical snapshot explicitly retained its earlier allowance. The 110/126-check runs observed denial for the subsequent default check; the 133-check run observed allowance. Both are retained as observations, not assertions that a default query must be stale or fresh. The latter run's complete result was retained as `results-133-first.json` in scratch; the harness writes `results.json` for its current run.

Two negative controls deliberately produced unsafe outcomes in the synthetic environment. An unguarded SQL write succeeded after a previously successful engine decision had been revoked. A privileged malformed graph granted cross-organization editing that the application's membership validation rejected. Each fixture was reset before subsequent experiments. These show missing application boundaries, not escapes from a tested production security perimeter.

The delivery experiment commits membership removal with a pending versioned event, observes stale engine authority before delivery, denies affected adapter access, simulates loss of local acknowledgement after the engine write, then replays deletion and acknowledges its token. A later policy event cannot overtake a pending one. The test includes an unaffected owner's resumed access and the removed member's continued denial. It implements this one event type; general synchronization is explicitly not claimed.

The story is executed statement by statement with autocommit. Its final rows retain Bob's inactive membership 7 and active membership 8, Dan as Alpha owner, and Alpha `doc` at parent `private`, version 3, content `Bob edit`. Bob's session resolves but his new membership has no restored access. Independent reset fixtures are not presented as later events in that story.

### Corrections made during verification

- Sandboxed downloads failed DNS; the official downloads succeeded with approved network access. Checksums were verified before execution.
- The first initdb command used an incorrectly formed password-file argument. It failed before cluster initialization; the corrected separate argument succeeded.
- An empty consistency object is not an omitted default-consistency request. The engine rejected the empty object; the client was corrected to omit the field for that observation.
- Initial document assembly interpreted PostgreSQL `$$` inside a JavaScript replacement string. Executing the document-extracted SQL caught the corruption. Literal replacement callbacks restored exact source text, and the document-extracted suite passed.
- An early separate story check submitted all statements as one simple-query batch. Its values were useful but did not establish separate commits. The final harness executes each statement separately and asserts the final state.
- The attempted generic SpiceDB installation URL was unavailable; the linked Windows page supplied the supported route. A guessed consistency middleware source path yielded no usable source and is not cited as evidence.

## Reproduce the experiments

Use Windows with Node, this repository's existing `pg` dependency, and PostgreSQL 17 binaries. The following setup targets fresh temporary data only. Run from the repository root. Set `PERM_PG_BIN` to the PostgreSQL bin directory; the recorded run used the existing 17.11 binaries from the previous research scratch area. Ports 55451, 55051, 58080 and 59090 must be free. The setup aborts if its data directory already exists; choose a new scratch directory for a fresh run rather than overwriting a running cluster.

The engine and application use different databases. The generated password and engine key stay in scratch and are never included in this log. Loopback HTTP without TLS is for this disposable fixture. Setup migrates only the empty engine database. The release commands below are reproduction instructions; no application runtime dependency is added to the repository.

```powershell
$ErrorActionPreference = 'Stop'
if (-not $env:PERM_SCRATCH) { $env:PERM_SCRATCH = Join-Path $env:TEMP 'codex-permissions-reproduction' }
if (-not $env:PERM_PG_BIN) { throw 'Set PERM_PG_BIN to the PostgreSQL 17 bin directory.' }
$researchScratch = [System.IO.Path]::GetFullPath($env:PERM_SCRATCH)
$researchData = Join-Path $researchScratch 'pg-data'
if (Test-Path -LiteralPath $researchData) { throw 'Choose a fresh scratch directory; pg-data already exists.' }
$researchPorts = @(55451,55051,58080,59090)
$researchListeners = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
if ($researchListeners | Where-Object { $_.Port -in $researchPorts }) { throw 'A required experiment port is already in use.' }
New-Item -ItemType Directory -Path $researchScratch -Force | Out-Null
foreach ($researchRelease in @(@('spicedb','1.57.1'),@('zed','1.2.1'))) {
  $researchTool = $researchRelease[0]
  $researchVersion = $researchRelease[1]
  $researchArchive = Join-Path $researchScratch "$researchTool.zip"
  $researchManifest = Join-Path $researchScratch "$researchTool-checksums.txt"
  $researchArchiveName = "${researchTool}_${researchVersion}_windows_amd64.zip"
  $researchBaseUrl = "https://github.com/authzed/$researchTool/releases/download/v$researchVersion"
  if (-not (Test-Path -LiteralPath $researchArchive)) {
    Invoke-WebRequest -Uri "$researchBaseUrl/$researchArchiveName" -OutFile $researchArchive
  }
  if (-not (Test-Path -LiteralPath $researchManifest)) {
    Invoke-WebRequest -Uri "$researchBaseUrl/windows_checksums.txt" -OutFile $researchManifest
  }
  $researchLine = Get-Content -LiteralPath $researchManifest | Where-Object { $_ -match ([regex]::Escape($researchArchiveName) + '$') }
  if (@($researchLine).Count -ne 1) { throw "Missing or ambiguous checksum for $researchArchiveName" }
  $researchExpectedHash = ($researchLine -split '\s+')[0]
  $researchActualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $researchArchive).Hash
  if ($researchActualHash -ne $researchExpectedHash) { throw "Checksum mismatch for $researchTool" }
  Expand-Archive -LiteralPath $researchArchive -DestinationPath (Join-Path $researchScratch $researchTool)
}
$researchPassword = [Guid]::NewGuid().ToString('N')
[System.IO.File]::WriteAllText((Join-Path $researchScratch 'pg-password.txt'),$researchPassword)
[System.IO.File]::WriteAllText((Join-Path $researchScratch 'spice-key.txt'),[Guid]::NewGuid().ToString('N'))
& (Join-Path $env:PERM_PG_BIN 'initdb.exe') -D $researchData -U researcher --auth-host=scram-sha-256 --auth-local=trust --pwfile (Join-Path $researchScratch 'pg-password.txt') --encoding=UTF8 --locale=C
if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
& (Join-Path $env:PERM_PG_BIN 'pg_ctl.exe') -D $researchData -l (Join-Path $researchScratch 'postgres.log') -o '-h 127.0.0.1 -p 55451' -w start
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL start failed' }
$env:PGPASSWORD = $researchPassword
foreach ($researchDatabase in @('perm_app','perm_spice')) {
  & (Join-Path $env:PERM_PG_BIN 'createdb.exe') -h 127.0.0.1 -p 55451 -U researcher $researchDatabase
  if ($LASTEXITCODE -ne 0) { throw "Database creation failed: $researchDatabase" }
}
$env:SPICEDB_DATASTORE_ENGINE = 'postgres'
$env:SPICEDB_DATASTORE_CONN_URI = "postgres://researcher:${researchPassword}@127.0.0.1:55451/perm_spice?sslmode=disable"
$env:SPICEDB_GRPC_PRESHARED_KEY = Get-Content -Raw -LiteralPath (Join-Path $researchScratch 'spice-key.txt')
$researchSpice = Join-Path $researchScratch 'spicedb\spicedb.exe'
& $researchSpice datastore migrate head *> (Join-Path $researchScratch 'migration.log')
if ($LASTEXITCODE -ne 0) { throw 'SpiceDB migration failed; inspect migration.log.' }
$researchProcess = Start-Process -FilePath $researchSpice -ArgumentList @('serve','--grpc-addr=127.0.0.1:55051','--http-enabled','--http-addr=127.0.0.1:58080','--metrics-addr=127.0.0.1:59090','--telemetry-endpoint=','--datastore-conn-pool-read-max-open=4','--datastore-conn-pool-read-min-open=1','--datastore-conn-pool-write-max-open=4','--datastore-conn-pool-write-min-open=1') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $researchScratch 'spicedb.out.log') -RedirectStandardError (Join-Path $researchScratch 'spicedb.err.log')
[System.IO.File]::WriteAllText((Join-Path $researchScratch 'spicedb.pid'),[string]$researchProcess.Id)
$researchReady = $false
for ($researchAttempt = 0; $researchAttempt -lt 50; $researchAttempt++) {
  if ($researchProcess.HasExited) { throw 'SpiceDB exited; inspect spicedb.err.log.' }
  $researchClient = [System.Net.Sockets.TcpClient]::new()
  try { $researchClient.Connect('127.0.0.1',58080); $researchReady = $true; break }
  catch { Start-Sleep -Milliseconds 100 }
  finally { $researchClient.Dispose() }
}
if (-not $researchReady) { throw 'SpiceDB listener did not become ready; inspect its log.' }
Write-Output "Disposable experiment ready in $researchScratch"
```

Save the following JavaScript block as `verify.mjs` in that scratch directory and run `node "$env:PERM_SCRATCH\verify.mjs"` from the repository root. It reads the report's two SQL blocks and compiled schema directly, so an altered document cannot silently reuse an older scratch SQL file. It resets only `perm_lab` and the relationship fixtures in the dedicated engine database. Treat the scratch databases as disposable.

````javascript
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const pg = require('pg');
const dir = process.env.PERM_SCRATCH || 'C:/Users/HP/AppData/Local/Temp/codex-permissions-research';
const report = await fs.readFile(path.resolve('research/database-design/identity-permissions-and-sharing/How business apps model identity permissions and sharing.md'),'utf8');
const sqlBlocks = [...report.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map(m=>m[1]);
const spiceSchema = report.match(/```zed\r?\n([\s\S]*?)```/)[1];
assert.equal(sqlBlocks.length,2);
const config = {host:'127.0.0.1',port:55451,user:'researcher',database:'perm_app',password:(await fs.readFile(dir+'/pg-password.txt','utf8')).trim(),statement_timeout:10000};
const key = (await fs.readFile(dir+'/spice-key.txt','utf8')).trim();
const clients = [new pg.Client(config),new pg.Client(config),new pg.Client(config)];
const [db,a,b] = clients;
const checks=[],blockers=[],observations=[];
function eq(actual,expected,label){assert.deepEqual(actual,expected,label);checks.push(label);}
async function scalar(sql,params=[],client=db){return Object.values((await client.query(sql,params)).rows[0])[0];}
async function fails(fn,pattern,label){await assert.rejects(fn,pattern,label);checks.push(label);}
async function api(route,body){
  const response=await fetch('http://127.0.0.1:58080/v1/'+route,{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
  const data=await response.json();if(!response.ok)throw new Error(JSON.stringify(data));return data;
}
function rel(type,id,relation,subjectType,subjectId,subjectRelation){
  return {resource:{objectType:type,objectId:String(id)},relation,subject:{object:{objectType:subjectType,objectId:String(subjectId)},...(subjectRelation?{optionalRelation:subjectRelation}:{})}};
}
function update(relationship,operation='OPERATION_TOUCH'){return {operation,relationship};}
async function check(org,actor,resource,permission,consistency={fullyConsistent:true}){
  return api('permissions/check',{resource:{objectType:'resource',objectId:org+'__'+resource},permission,subject:{object:{objectType:'user',objectId:actor}},...(consistency?{consistency}:{})});
}
function has(result){return result.permissionship==='PERMISSIONSHIP_HAS_PERMISSION';}
async function reset(){
  await db.query('DROP SCHEMA IF EXISTS perm_lab CASCADE');
  await db.query(sqlBlocks[0]);
  for(const c of clients)await c.query('SET search_path=perm_lab,public');
}
async function bob(){
  await db.query("SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day')");
  return scalar("SELECT accept_invite('alpha','bob','I1')");
}
async function ready(){
  await reset();await bob();
  await db.query("SELECT set_team_member('alpha','alice','design',7,true); SELECT grant_access('alpha','alice','project','editor',NULL,'design'); SELECT grant_access('alpha','alice','doc','reader',4,NULL); SELECT grant_access('alpha','alice','doc','exporter',5,NULL)");
}
async function project(){
  for(const type of ['resource','binding','role','team','organization','membership'])await api('relationships/delete',{relationshipFilter:{resourceType:type}});
  const updates=[];
  const put=(...args)=>updates.push(update(rel(...args)));
  for(const m of (await db.query('SELECT m.*,a.enabled FROM membership m JOIN account a ON a.id=m.account_id')).rows){
    if(m.active&&m.enabled)put('membership',m.id,'active','user',m.account_id);
    put('organization',m.org,'participant','membership',m.id,'active');
    if(m.owner)put('organization',m.org,'owner','membership',m.id,'active');
  }
  for(const t of (await db.query('SELECT * FROM team_member')).rows)put('team',t.org+'__'+t.team_id,'member','membership',t.member_id,'active');
  for(const r of (await db.query('SELECT * FROM role_action')).rows){
    const action={view:'viewer',edit:'editor',export:'exporter'}[r.action];
    if(action)put('role',r.org+'__'+r.role_id,action,'user','*');
  }
  for(const g of (await db.query('SELECT * FROM access_grant')).rows){
    put('binding',g.id,'subject',g.member_id?'membership':'team',g.member_id||g.org+'__'+g.team_id,'active');
    put('binding',g.id,'role','role',g.org+'__'+g.role_id);
    put('resource',g.org+'__'+g.resource_id,'grant','binding',g.id);
  }
  for(const r of (await db.query('SELECT * FROM resource')).rows){
    put('resource',r.org+'__'+r.id,'org','organization',r.org);
    if(r.parent)put('resource',r.org+'__'+r.id,'parent','resource',r.org+'__'+r.parent);
  }
  return api('relationships/write',{updates});
}
async function matrix(label,cases){
  for(const [org,actor,resource,action,want] of cases){
    eq(await scalar('SELECT allowed($1,$2,$3,$4)',[org,actor,resource,action]),want,label+' SQL '+[org,actor,resource,action].join('/'));
    eq(has(await check(org,actor,resource,action)),want,label+' SpiceDB '+[org,actor,resource,action].join('/'));
  }
}
async function waitForBlock(){
  const until=Date.now()+5000;
  while(Date.now()<until){
    if(await scalar('SELECT $1::int = ANY(pg_blocking_pids($2::int))',[a.processID,b.processID]))return;
    await new Promise(resolve=>setTimeout(resolve,20));
  }
  throw new Error('Expected separate-session blocker was not observed');
}
async function race(label,first,second,commit=true,duringWait){
  await a.query('BEGIN');await b.query('BEGIN');
  try{
    await a.query(first);
    const pending=(typeof second==='function'?second(b):b.query(second)).then(result=>({result}),error=>({error}));
    await waitForBlock();blockers.push(label);
    if(duringWait)await duringWait();
    await a.query(commit?'COMMIT':'ROLLBACK');
    const result=await pending;
    await b.query(result.error?'ROLLBACK':'COMMIT');return result;
  }catch(error){await a.query('ROLLBACK');await b.query('ROLLBACK');throw error;}
}
async function enqueueRevoke(){
  await db.query('BEGIN');
  try{
    await db.query("SELECT enter_org('alpha','alice')");
    const state=(await db.query("SELECT * FROM organization WHERE id='alpha'")).rows[0];
    if(state.policy_version!==state.applied_version)throw new Error('delivery pending');
    await db.query("SELECT revoke_member('alpha','alice',7)");
    const version=await scalar("UPDATE organization SET policy_version=policy_version+1 WHERE id='alpha' RETURNING policy_version");
    const changes=[update(rel('membership','7','active','user','bob'),'OPERATION_DELETE')];
    await db.query('INSERT INTO policy_delivery (org,version,updates) VALUES ($1,$2,$3)',['alpha',version,JSON.stringify(changes)]);
    await db.query('COMMIT');return version;
  }catch(error){await db.query('ROLLBACK');throw error;}
}
async function deliver(crash=false){
  await db.query('BEGIN');
  try{
    await db.query("SELECT 1 FROM organization WHERE id='alpha' FOR UPDATE");
    const event=(await db.query("SELECT d.* FROM policy_delivery d JOIN organization o ON d.org=o.id WHERE d.org='alpha' AND d.version=o.applied_version+1 AND d.state='pending'")).rows[0];
    if(!event){await db.query('COMMIT');return 'nothing pending';}
    const result=await api('relationships/write',{updates:event.updates});
    if(crash){await db.query('ROLLBACK');return 'lost acknowledgement';}
    await db.query("UPDATE policy_delivery SET state='applied',token=$3 WHERE org=$1 AND version=$2",[event.org,event.version,result.writtenAt.token]);
    await db.query('UPDATE organization SET applied_version=$2,consistency_token=$3 WHERE id=$1',[event.org,event.version,result.writtenAt.token]);
    await db.query('COMMIT');return 'applied';
  }catch(error){await db.query('ROLLBACK');throw error;}
}
async function guardedCheck(actor){
  await db.query('BEGIN');
  try{
    await db.query("SELECT enter_org('alpha',$1,false)",[actor]);
    const o=(await db.query("SELECT * FROM organization WHERE id='alpha'")).rows[0];
    if(o.policy_version!==o.applied_version){await db.query('ROLLBACK');return 'pending';}
    const answer=has(await check('alpha',actor,'doc','view',o.consistency_token?{atLeastAsFresh:{token:o.consistency_token}}:{fullyConsistent:true}));
    await db.query('COMMIT');return answer;
  }catch(error){await db.query('ROLLBACK');if(/permission denied/.test(error.message))return false;throw error;}
}
async function externalEditInTransaction(client,actor,expected,content){
  await client.query("SELECT enter_org('alpha',$1,false)",[actor]);
  const org=(await client.query("SELECT * FROM organization WHERE id='alpha'")).rows[0];
  if(org.policy_version!==org.applied_version)throw new Error('delivery pending');
  const consistency=org.consistency_token?{atLeastAsFresh:{token:org.consistency_token}}:{fullyConsistent:true};
  if(!has(await check('alpha',actor,'doc','edit',consistency)))throw new Error('external edit denied');
  const result=await client.query("UPDATE resource SET content=$1,version=version+1 WHERE org='alpha' AND id='doc' AND version=$2 RETURNING version",[content,expected]);
  if(!result.rowCount)throw new Error('stale document');
  await client.query("INSERT INTO audit (org,actor,action,details) VALUES ('alpha',$1,'external_edit',jsonb_build_object('version',$2::bigint))",[actor,result.rows[0].version]);
  return result;
}
try{
  for(const c of clients)await c.connect();
  await api('schema/write',{schema:spiceSchema});
  await reset();
  eq(await scalar("SELECT actor_for_session('session-alice')"),'alice','session resolves identity');
  eq(await scalar("SELECT actor_for_session('missing')"),null,'unknown session denies');
  eq(await scalar("SELECT allowed('alpha','alice','doc','edit')"),true,'Alice owner in Alpha');
  eq(await scalar("SELECT allowed('beta','alice','doc','edit')"),false,'Alice not editor in Beta');
  await fails(()=>db.query("SELECT invite_person('alpha','cara','bad','bob','member',clock_timestamp()+interval '1 day')"),/permission denied/,'guest cannot invite');
  const deadline=await scalar("SELECT clock_timestamp()+interval '1 day'");
  await db.query("SELECT invite_person('alpha','alice','I1','bob','member',$1)",[deadline]);
  await db.query("SELECT invite_person('alpha','alice','I1','bob','member',$1)",[deadline]);
  eq(await scalar("SELECT count(*)::int FROM audit WHERE action='invite'"),1,'invitation retry does not duplicate event');
  await fails(()=>db.query("SELECT invite_person('alpha','alice','I1','eve','member',$1)",[deadline]),/key conflict/,'changed invitation retry rejects');
  await fails(()=>db.query("SELECT accept_invite('alpha','eve','I1')"),/invitation denied/,'wrong identity cannot accept');
  eq(await scalar("SELECT accept_invite('alpha','bob','I1')"),'7','Bob joins as membership 7');
  eq(await scalar("SELECT accept_invite('alpha','bob','I1')"),'7','accepted invitation replays membership');
  await fails(()=>db.query("SELECT edit_resource('alpha','bob','doc',1,'early')"),/edit denied/,'membership alone grants no content');
  await db.query("SELECT set_team_member('alpha','alice','design',7,true); SELECT grant_access('alpha','alice','project','editor',NULL,'design'); SELECT grant_access('alpha','alice','doc','reader',4,NULL); SELECT grant_access('alpha','alice','doc','exporter',5,NULL)");
  await project();
  await matrix('initial',[
    ['alpha','alice','doc','edit',true],['beta','alice','doc','view',true],['beta','alice','doc','edit',false],
    ['alpha','bob','doc','view',true],['alpha','bob','doc','edit',true],['alpha','bob','other','view',false],
    ['beta','bob','doc','view',false],['alpha','cara','doc','view',true],['alpha','cara','doc','edit',false],
    ['alpha','cara','other','view',false],['alpha','exportbot','doc','export',true],['alpha','exportbot','doc','edit',false],
    ['alpha','exportbot','other','export',false],['alpha','eve','doc','view',false]
  ]);
  await fails(()=>db.query("SELECT grant_access('alpha','bob','doc','editor',7,NULL)"),/permission denied/,'editor cannot escalate grants');
  await fails(()=>db.query("SELECT grant_access('alpha','alice','doc','reader',2,NULL)"),/foreign member/,'cross-organization member grant rejected');
  await fails(()=>db.query("INSERT INTO team_member VALUES ('alpha','design',2)"),/foreign key/,'composite FK rejects foreign membership');
  await fails(()=>db.query("SELECT set_team_member('alpha','alice','design',4,true)"),/regular member/,'guest cannot gain team-wide access');
  eq(await scalar("SELECT edit_resource('alpha','bob','doc',1,'Bob edit')"),'2','authorized edit advances version');
  await fails(()=>db.query("SELECT edit_resource('alpha','bob','doc',1,'stale')"),/stale document/,'stale content edit rejects');
  await db.query("SELECT grant_access('alpha','alice','doc','reader',7,NULL); SELECT move_resource('alpha','alice','doc','private',2)");
  await project();
  await matrix('moved', [['alpha','bob','doc','view',true],['alpha','bob','doc','edit',false],['alpha','cara','doc','view',true]]);
  await fails(()=>db.query("SELECT move_resource('alpha','alice','private','doc',1)"),/folder/,'document cannot become parent');
  await fails(()=>db.query("SELECT move_resource('alpha','alice','root','private',1)"),/cycle/,'hierarchy cycle rejected');
  await db.query("SELECT transfer_owner('alpha','alice',3)");
  await fails(()=>db.query("SELECT revoke_member('alpha','alice',7)"),/permission denied/,'former owner loses administration');
  await db.query("SELECT revoke_member('alpha','dan',7)");
  eq(await scalar("SELECT actor_for_session('session-bob')"),'bob','organization removal leaves login session');
  eq(await scalar("SELECT accept_invite('alpha','bob','I1')"),'7','old accepted invitation returns history without reactivation');
  await project();
  await matrix('revoked',[['alpha','bob','doc','view',false],['alpha','dan','doc','edit',true],['alpha','alice','doc','view',false],['beta','alice','doc','view',true]]);
  await db.query("SELECT invite_person('alpha','dan','I2','bob','member',clock_timestamp()+interval '1 day')");
  eq(await scalar("SELECT accept_invite('alpha','bob','I2')"),'8','rejoin creates new membership');
  await project();await matrix('rejoined',[['alpha','bob','doc','view',false],['alpha','bob','doc','edit',false]]);
  await fails(()=>db.query("SELECT revoke_member('alpha','dan',3)"),/last owner/,'last owner cannot be removed');
  await db.query("SELECT invite_person('alpha','dan','expired','eve','member',clock_timestamp()+interval '1 day'); UPDATE invitation SET expires_at=clock_timestamp()-interval '1 second' WHERE id='expired'");
  await fails(()=>db.query("SELECT accept_invite('alpha','eve','expired')"),/unavailable/,'expired invitation rejects');
  await ready();await db.query("SELECT set_team_member('alpha','alice','design',7,false)");await project();
  await matrix('team removed',[['alpha','bob','doc','view',false],['alpha','cara','doc','view',true]]);
  await ready();
  const guestGrant=await scalar("SELECT id FROM access_grant WHERE org='alpha' AND member_id=4");
  eq(await scalar("SELECT revoke_grant('alpha','alice',$1)",[guestGrant]),true,'direct guest grant removed');
  eq(await scalar("SELECT revoke_grant('alpha','alice',$1)",[guestGrant]),false,'duplicate grant removal has no second effect');
  await db.query("SELECT set_role_actions('alpha','alice','exporter',ARRAY['view'])");
  await project();
  await matrix('grant and role changed',[['alpha','cara','doc','view',false],['alpha','exportbot','doc','view',true],['alpha','exportbot','doc','export',false],['alpha','bob','doc','edit',true]]);
  await fails(()=>db.query("SELECT set_role_actions('alpha','bob','editor',ARRAY['share'])"),/permission denied/,'editor cannot rewrite its role');
  await fails(()=>db.query("SELECT set_role_actions('alpha','alice','exporter',ARRAY['unknown'])"),/check constraint/,'invalid role action rolls back replacement');
  eq(await scalar("SELECT array_agg(action ORDER BY action) FROM role_action WHERE org='alpha' AND role_id='exporter'"),['view'],'failed role replacement retains old definition');
  await db.query("UPDATE login_session SET active=false WHERE id='session-bob'");
  eq(await scalar("SELECT actor_for_session('session-bob')"),null,'local session revocation rejects resolution');
  await db.query("UPDATE login_session SET active=true,expires_at=clock_timestamp()-interval '1 second' WHERE id='session-bob'");
  eq(await scalar("SELECT actor_for_session('session-bob')"),null,'expired local session rejects resolution');
  await ready();
  let r=await race('revoke before edit',"SELECT revoke_member('alpha','alice',7)","SELECT edit_resource('alpha','bob','doc',1,'late')");
  assert.match(r.error?.message||'',/permission denied/);checks.push('waiting edit denied after revocation');
  eq(await scalar("SELECT version FROM resource WHERE org='alpha' AND id='doc'"),'1','denied edit leaves version unchanged');
  await ready();
  r=await race('edit before revoke',"SELECT edit_resource('alpha','bob','doc',1,'accepted')","SELECT revoke_member('alpha','alice',7)");
  eq(Boolean(r.error),false,'earlier edit can commit before revocation');
  eq(await scalar("SELECT version FROM resource WHERE org='alpha' AND id='doc'"),'2','accepted edit retained after revocation');
  await ready();
  r=await race('revocation rollback',"SELECT revoke_member('alpha','alice',7)","SELECT edit_resource('alpha','bob','doc',1,'after rollback')",false);
  eq(Boolean(r.error),false,'rolled-back revoke allows waiting edit');
  await reset();await db.query("SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day')");
  r=await race('cancel before accept',"SELECT cancel_invite('alpha','alice','I1')","SELECT accept_invite('alpha','bob','I1')");
  assert.match(r.error?.message||'',/unavailable/);checks.push('cancelled invitation cannot be accepted');
  await reset();await db.query("SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day')");
  r=await race('accept before cancel',"SELECT accept_invite('alpha','bob','I1')","SELECT cancel_invite('alpha','alice','I1')");
  assert.match(r.error?.message||'',/already accepted/);checks.push('accepted invitation needs explicit member revocation');
  await reset();await db.query("SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day')");
  r=await race('duplicate acceptance',"SELECT accept_invite('alpha','bob','I1')","SELECT accept_invite('alpha','bob','I1')");
  eq(r.result.rows[0].accept_invite,'7','concurrent acceptance returns same membership');
  eq(await scalar("SELECT count(*)::int FROM audit WHERE action='accept'"),1,'one acceptance event after concurrent retries');
  await reset();await db.query("SELECT invite_person('alpha','alice','I1','bob','member',clock_timestamp()+interval '1 day')");
  r=await race('invitation expires while waiting',"UPDATE invitation SET expires_at=clock_timestamp()+interval '300 milliseconds' WHERE org='alpha' AND id='I1'; SELECT 1 FROM organization WHERE id='alpha' FOR UPDATE","SELECT accept_invite('alpha','bob','I1')",true,async()=>{await new Promise(resolve=>setTimeout(resolve,400));});
  assert.match(r.error?.message||'',/unavailable/);checks.push('deadline evaluated after lock wait');
  await ready();await db.query("UPDATE membership SET owner=true WHERE id=3");
  r=await race('two owners leave',"SELECT revoke_member('alpha','alice',1)","SELECT revoke_member('alpha','dan',3)");
  assert.match(r.error?.message||'',/last owner/);checks.push('concurrent owner removal preserves one owner');
  await ready();
  r=await race('move before edit',"SELECT move_resource('alpha','alice','doc','private',1)","SELECT edit_resource('alpha','bob','doc',1,'late')");
  assert.match(r.error?.message||'',/edit denied/);checks.push('moved resource loses inherited edit before waiting write');
  await ready();
  r=await race('team removal before edit',"SELECT set_team_member('alpha','alice','design',7,false)","SELECT edit_resource('alpha','bob','doc',1,'late')");
  assert.match(r.error?.message||'',/edit denied/);checks.push('team removal defeats waiting edit');
  await ready();await project();
  const old=await check('alpha','bob','doc','edit');eq(has(old),true,'fresh SpiceDB check before revocation allows');
  const revoked=await api('relationships/write',{updates:[update(rel('membership','7','active','user','bob'),'OPERATION_DELETE')]});
  eq(has(await check('alpha','bob','doc','edit',{atLeastAsFresh:revoked.writtenAt})),false,'revocation-token check denies');
  eq(has(await check('alpha','bob','doc','edit')),false,'fully consistent post-revoke check denies');
  eq(has(await check('alpha','bob','doc','edit',{atExactSnapshot:old.checkedAt})),true,'historical snapshot still describes earlier access');
  observations.push({name:'default consistency immediately after revocation',result:await check('alpha','bob','doc','edit',null)});
  await db.query("UPDATE resource SET content='unsafe use of prior check',version=version+1 WHERE org='alpha' AND id='doc'");
  eq(await scalar("SELECT version FROM resource WHERE org='alpha' AND id='doc'"),'2','negative control: external permission check does not guard later SQL write');
  await ready();await project();
  r=await race('coordinated external check and edit',"SELECT enter_org('alpha','bob',false)","SELECT revoke_member('alpha','alice',7)",true,async()=>{
    eq((await externalEditInTransaction(a,'bob',1,'coordinated edit')).rows[0].version,'2','external check and write while application mutation lock held');
  });
  eq(Boolean(r.error),false,'revocation completes after coordinated edit');
  eq(await guardedCheck('bob'),false,'application membership gate denies after coordinated revocation');
  await ready();await project();
  r=await race('revocation before external edit',"SELECT revoke_member('alpha','alice',7)",client=>externalEditInTransaction(client,'bob',1,'late external edit'));
  assert.match(r.error?.message||'',/permission denied/);checks.push('waiting external edit denied after revocation');
  eq(await scalar("SELECT version FROM resource WHERE org='alpha' AND id='doc'"),'1','denied external edit leaves content unchanged');
  await ready();await project();
  eq(await enqueueRevoke(),'1','permission change and pending update commit together');
  eq(has(await check('alpha','bob','doc','view')),true,'engine alone still allows before delivery');
  eq(await guardedCheck('alice'),'pending','adapter blocks affected organization while delivery pending');
  eq(await guardedCheck('bob'),false,'removed member denied by application membership gate');
  await fails(()=>enqueueRevoke(),/delivery pending/,'later changes cannot overtake pending delivery');
  eq(await deliver(true),'lost acknowledgement','injected crash after engine write');
  eq(has(await check('alpha','bob','doc','view')),false,'engine revocation survives lost local acknowledgement');
  eq(await guardedCheck('alice'),'pending','local pending state survives lost acknowledgement');
  eq(await deliver(),'applied','idempotent relationship deletion replay acknowledged');
  eq(await deliver(),'nothing pending','acknowledged update is not delivered again');
  eq(await guardedCheck('alice'),true,'unaffected owner access resumes after acknowledgement');
  eq(await guardedCheck('bob'),false,'revoked member stays denied after recovery');
  eq(await scalar("SELECT policy_version=applied_version AND consistency_token IS NOT NULL FROM organization WHERE id='alpha'"),true,'acknowledged version and token stored');
  await ready();await project();
  await fails(()=>db.query("SELECT grant_access('beta','dan','doc','editor',1,NULL)"),/foreign member/,'application rejects cross-organization subject before projection');
  await api('relationships/write',{updates:[
    update(rel('binding','foreign','subject','membership','1','active')),
    update(rel('binding','foreign','role','role','alpha__editor')),
    update(rel('resource','beta__doc','grant','binding','foreign'))
  ]});
  eq(has(await check('beta','alice','doc','edit')),true,'negative control: privileged malformed graph can grant cross-organization authority');
  await project();
  eq(has(await check('beta','alice','doc','edit')),false,'validated projection removes malformed cross-organization graph');
  await reset();const story=[];
  for(const statement of sqlBlocks[1].split(';').filter(s=>s.trim())){
    const result=await db.query(statement);if(result.rows.length)story.push(result.rows);
  }
  eq(await scalar("SELECT id FROM membership WHERE org='alpha' AND account_id='bob' AND active"),'8','autocommit story ends with new membership 8');
  eq(await scalar("SELECT version FROM resource WHERE org='alpha' AND id='doc'"),'3','autocommit story retains document version 3');
  eq(await scalar("SELECT allowed('alpha','bob','doc','view')"),false,'autocommit story does not restore old grants');
  eq(await scalar("SELECT owner_check('alpha','dan')"),true,'autocommit story retains Dan as owner');
  await fs.writeFile(dir+'/story-results.json',JSON.stringify(story,null,2));
  const result={executedAt:new Date().toISOString(),postgres:await scalar('SELECT version()'),checks,blockers,observations,story};
  await fs.writeFile(dir+'/results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify({checks:checks.length,observedBlockers:blockers.length,observations},null,2));
}finally{for(const c of clients){if(c._connected&&!c._ending){await c.query('ROLLBACK').catch(()=>{});await c.end();}}}
````

When finished, stop only these experiment processes. Verify that the PID still belongs to the expected binary before stopping it; then stop the PostgreSQL cluster identified by its exact data directory. Retain the logs/results until their evidence has been recorded.

```powershell
$researchProcessId = Get-Content -Raw -LiteralPath (Join-Path $env:PERM_SCRATCH 'spicedb.pid')
$researchProcessId = [int]$researchProcessId
$researchProcess = Get-Process -Id $researchProcessId -ErrorAction SilentlyContinue
$researchExpectedBinary = Join-Path $env:PERM_SCRATCH 'spicedb\spicedb.exe'
if ($researchProcess -and $researchProcess.Path -eq $researchExpectedBinary) {
  Stop-Process -Id $researchProcessId
}
& (Join-Path $env:PERM_PG_BIN 'pg_ctl.exe') -D (Join-Path $env:PERM_SCRATCH 'pg-data') -m fast -w stop
```

## Completion audit

| Requirement | Evidence and boundary |
| --- | --- |
| Permissions central; focused identity foundation | Report separates validated identity, account, session and membership; sign-in, SSO, provisioning and recovery consequences are explained; deeper identity work is parked |
| Complete PostgreSQL journey | Embedded setup and individually committed story, asserted final rows, concrete before/after explanations and observed competing transitions |
| Smaller mechanisms first | Identity/role/grant/ancestry explanation precedes journey, procedures and engine schema; columns and coordination have explicit reasons |
| Same bounded SpiceDB scenarios | Independent expected matrix asserted in both implementations; role, membership, grant and hierarchy changes are compared |
| Enforcement and application coordination | Trusted-actor limits, tenant-write validation, negative controls, coordinated external edit and pending-delivery recovery |
| Revocation and consistency | Both runtime decisions and default-mode variability recorded; history, current membership, engine revisions and independent delivery capabilities distinguished |
| Comparisons and source boundaries | Opened primary sources plus two pinned implementation paths; no private schemas or production behavior invented |
| Predictions and transfer exercise | Explained predictions, explicit-deny changed requirement with hints and answer; exercise remains unexecuted and learner understanding unassessed |
| Implementation decisions and operations | Per-model decision table, access/transaction/retry boundaries, monitoring, repair, backup and scale evidence still needed |
| Executable/reproduction evidence | Native PostgreSQL and SpiceDB runs; exact embedded SQL/schema read by the harness; twelve observed blockers; full harness retained here |
| Artifact scope and navigation | 984 local links in 87 tracked/new Markdown files passed; only the report/log pair was created; the unrelated learning-folder link issue is recorded below |

### Final reproduction and artifact audit, 13 Nov 2026

The setup and complete harness were extracted from this log into a fresh temporary directory. The setup reverified the cached official archives against their published checksums, initialized new PostgreSQL data, created separate application/engine databases, migrated the empty SpiceDB datastore and started loopback listeners. The extracted harness read the final report's SQL/schema blocks. It passed **133 checks with 12 observed blockers** at **2026-11-12 20:03:49 UTC / 13 Nov 01:33:49 Asia/Calcutta**. This fresh run returned denial for the default-consistency observation, while preserving the earlier run's allowance as separately dated evidence. Both runs' token-bounded, fully consistent and historical-snapshot assertions passed.

The startup port check initially detected the earlier experiment processes. Sandboxed process inspection had not exposed them; inspection with the processes' execution permissions confirmed their exact PIDs, executable/data paths and loopback ports. Only those task-owned instances were stopped. Fresh reproduction then succeeded. The log's cleanup commands were also extracted and executed; the new runtimes stopped and all four experiment ports were verified free. Evidence files remain in temporary storage; reproduction does not depend on them.

The two new documents passed balanced-fence, table-width, placeholder and trailing-whitespace checks. The report's two SQL blocks match their tested source exactly, and the embedded harness matches the executed code. The existing link/heading rules applied to tracked Markdown plus the new pair passed **984 local links in 87 files**. The full recursive checker reports only the pre-existing `thread://` link in untracked `learning/Full-Stack-Backend-Curriculum.md`; that file and the checker were left untouched. A PowerShell cast in the cleanup example initially resembled a Markdown link to the naive checker; splitting the cast into two equivalent statements resolved the new-document false positive, and the final cleanup was executed successfully.

Live upstream remained at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`, with local `879ffe8` still 11 ahead / 0 behind. No tracked file changed, and the only new task artifacts in the repository are this report/log pair. The pre-existing untracked learning directory remains outside scope. No commit, push, dependency change or course edit was performed.

These SHA-256 values cover each embedded block after LF normalization and exactly one final newline:

| Executed block | SHA-256 |
| --- | --- |
| PostgreSQL setup/model | 1441652a32d2a193d4ffc616db55475bdad58ab550b01b7351c0c52c5cac88e8 |
| Individually committed story | 04fed0ecb25917cdc63865e1e0e57264606cb4bf6870af31302d099b327f8da9 |
| SpiceDB schema | 9ff2df3ce73777c7230c9fc1927099e04e798915903a07079dfd79c6f4e4e2af |
| Fresh-runtime setup | d79177106662edda2b5f1bcf24ed9216f09e29c5341bb89f87cf75d30f4061f4 |
| Native verification harness | 8e44bd82a3638b8f69d3578ef4d9a104a44b8efc6b431492f78776e84d3232bf |

The requirement audit is complete for the approved research scope. Production identity integration, a production database/API security perimeter, general multi-event projection, live search/download/job integration, scale and independent learner understanding remain explicitly unverified; the report explains their boundaries rather than treating them as achieved results.

