# Research log: file storage and transfers

Started and completed 5 Nov 2026. Status: research complete; native database verification passed. Final artifact checks are recorded below.

## Approved objective

Explain the whole file lifecycle across cloud drives, messaging attachments, temporary transfers, self-hosted storage and device synchronization. Connect visible actions to database records, bytes, requests, permissions and recovery. Live collaborative editing receives a focused comparison, as selected by the user. Deliverables are this log and a connected report with inline models and verification evidence. No storage product or course changes are in scope.

## Repository preflight

The GitHub connector confirmed `omsrivastava512/sql-postgresql-course`, default branch `main`, live head `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local `main` at `b683564` is exactly 7 ahead / 0 behind. The local additions include catalog walkthrough `60da999`, course work through `d7c95fb`, and offers research `b683564`. No branch update is needed. The all-state PR search was empty; issue searches for storage and file/storage/transfer returned none. Commit searches for storage and transfer found earlier SQL lessons and catalog research, not equivalent file-platform research. Initial commit-tool parameter validation failed; the corrected read succeeded. No Git state was mutated.

Existing unrelated modifications: course indexes and audit/review/publication files; lessons 6, 16 and 29; labs README; tests/cases.json and tests/verify-sessions.mjs; untracked lessons and labs 30–32. Preserve them. This task changes only this new research directory. No commit or push is authorized by the current implementation request.

## Evidence discipline

- Confirmed means an opened primary source or specifically inspected pinned code establishes the bounded claim; it does not mean independent production verification.
- Inferred means reasoning from named evidence, with the reasoning explained. Unknown means the inspected evidence does not establish the fact.
- Teaching models and hypothetical policies are explicitly synthetic. Never present them as Google, Telegram or another provider's private schema.
- Pin inspected code; date historical engineering posts; separate versioned code behavior from rolling documentation. Do not run downloaded application source.
- Use sources to resolve different mechanisms rather than meeting a citation count.

## Code snapshots

| Repository | Release inspected | Commit |
| --- | --- | --- |
| nextcloud/server | v31.0.0 | 051e46a7a272300cf7c90b3e330fd1501fd6a996 |
| syncthing/syncthing | v1.29.0 | 13d7881b8014cc5078140689198d43fd7829d8a6 |
| tus/tusd | v2.8.0 | 0e52ad650abed02ec961353bb0c3c8bc36650d2c |

These are reproducible historical snapshots, not recommendations to deploy old releases. Current documentation is consulted separately.

## Discrepancies and access limits

- Drive's overview says My Drive files can have multiple parents; the v3 resource reference and folder guide specify one parent. Report the discrepancy and use the specific v3 contract for examples.
- Telegram's main file page intermittently fails in the web fetcher; its Markdown endpoint is rejected there for unsupported content type. The old file-reference URL is a move notice. Follow official replacements rather than infer server behavior.
- Initial shell network access failed DNS resolution. No installed PostgreSQL server or preserved binary was found in PATH, standard Program Files, the known research temporary directory, Codex temporary directories, or C:/tmp. A verified temporary distribution and approved elevated execution subsequently enabled native verification; see the setup and results below.
- Nextcloud antivirus documentation at the guessed versioned URL failed. The source register links the successfully opened stable documentation instead; no claim is taken from the failed fetch.

## Source register and reading decisions

All sources below were opened on 5 Nov 2026. Links are also attached to the bounded claims in the report. An opened page is not a claim that a live provider integration was tested. Word counts and citation counts are not completion criteria.

| Source group | Material read and purpose | Boundary |
| --- | --- | --- |
| Google Drive resource model | [Overview](https://developers.google.com/workspace/drive/api/guides/about-files), [v3 files](https://developers.google.com/workspace/drive/api/reference/rest/v3/files), [folder operations](https://developers.google.com/workspace/drive/api/guides/folder) | Public identity/tree contract; conflicting overview statement recorded. No private schema inferred. |
| Google Drive access | [Sharing](https://developers.google.com/workspace/drive/api/guides/manage-sharing), [limited access](https://developers.google.com/workspace/drive/api/guides/limited-expansive-access), [ownership transfer](https://developers.google.com/workspace/drive/api/guides/transfer-file) | Read inheritance, roles/capabilities, exception folders and ownership restrictions. Synthetic space transfer is explicitly different. |
| Google Drive content lifecycle | [Uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [downloads](https://developers.google.com/workspace/drive/api/guides/manage-downloads), [revisions](https://developers.google.com/workspace/drive/api/guides/manage-revisions), [changes](https://developers.google.com/workspace/drive/api/guides/manage-changes), [trash/delete](https://developers.google.com/workspace/drive/api/guides/delete) | Protocol/state contracts; no remote calls using user content. Avoid treating change enumeration as full audit history. |
| Google Drive derived views | [Search](https://developers.google.com/workspace/drive/api/guides/search-files), [push notifications](https://developers.google.com/workspace/drive/api/guides/push) | Public search predicates and empty notification bodies/channel renewal. Neither establishes Google's private indexing or event infrastructure. |
| Microsoft OneDrive | [Upload sessions](https://learn.microsoft.com/en-us/graph/api/driveitem-createuploadsession?view=graph-rest-1.0), [delta](https://learn.microsoft.com/en-us/graph/api/driveitem-delta?view=graph-rest-1.0) | Body available despite page chrome mentioning authorization. Used sequential fragments and continuation/deletion semantics. |
| Box | [File requests](https://developer.box.com/guides/file-requests), [ZIP downloads](https://developer.box.com/guides/downloads/zip-archive) | Intake without collaborator membership; generated exports with status/expiry/name mappings. Private implementation not claimed. |
| Nextcloud | [Primary storage](https://docs.nextcloud.com/server/31/admin_manual/configuration_files/primary_storage.html), [backup](https://docs.nextcloud.com/server/31/admin_manual/maintenance/backup.html), [previews](https://docs.nextcloud.com/server/31/admin_manual/configuration_files/previews_configuration.html), [antivirus](https://docs.nextcloud.com/server/stable/admin_manual/configuration_server/antivirus_configuration.html) | Version-31 documentation accompanies pinned old code; rolling stable antivirus page is separately identified. Do not recommend unsupported v31 for deployment. |
| Dropbox | [Magic Pocket, 6 May 2016](https://dropbox.tech/infrastructure/inside-the-magic-pocket), [Nucleus, 9 March 2020](https://dropbox.tech/infrastructure/rewriting-the-heart-of-our-sync-engine), [storage efficiency, 2 April 2026](https://dropbox.tech/infrastructure/improving-storage-efficiency-in-magic-pocket-our-immutable-blob-store) | Dated company accounts for hardware placement, sync failure modeling and reclamation. No timeless “Dropbox uses exactly this” claim. |
| Amazon S3 | [Object keys](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html), [multipart](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), [presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) | General-purpose key model, independent part assembly and bearer lifetime. No claim that all bucket types share every behavior. |
| Ceph | [Architecture index](https://docs.ceph.com/en/latest/architecture/), [storage cluster](https://docs.ceph.com/en/latest/architecture/storage-cluster/), [erasure coding](https://docs.ceph.com/en/latest/architecture/erasure-coding/) | Pages identify themselves as development documentation. Placement calculation is contrasted with Dropbox's dated index design. |
| tus | [Protocol 1.0.0](https://tus.io/protocols/resumable-upload) | Core offset semantics versus optional extensions. The tiny HTTP example is constructed, not captured. |
| Syncthing | [Synchronization](https://docs.syncthing.net/users/syncing.html) | Rolling docs on block reuse/case handling; detailed conflict claims tied to inspected v1.29.0 code. |
| Magic Wormhole | [File-transfer protocol](https://magic-wormhole.readthedocs.io/en/latest/file-transfer-protocol.html) | Offer, archive and direct/relay transport; not a durable cloud-drive contract. |
| WeTransfer | [Transfer availability](https://wetransfer.com/help-center/how-to/transfer-availability), updated 30 September 2026 | Recovery after some link expirations disproves a universal expiry=physical-erasure assumption. No pricing advice or server-schema claim. |
| Telegram | [File API](https://core.telegram.org/api/files), [references](https://core.telegram.org/api/file-references), [CDN](https://core.telegram.org/cdn), [Secret Chats](https://core.telegram.org/api/end-to-end), [FAQ](https://telegram.org/faq) | File API read as official Markdown via shell fallback. Reference tables are explicitly client-side. FAQ warns parts may be outdated; only cache/cloud distinction used, not limits/prices. |
| Proton Drive | [Security model](https://proton.me/blog/protondrive-security), published 31 August 2020, updated 22 September 2022 | Historical nodes/links/shares and encrypted hierarchy. Roadmap wording is not used as current feature inventory. |
| Collaborative editing | [Yjs](https://docs.yjs.dev/) | Focused analogue only; no claim that Google Docs uses Yjs. |
| PostgreSQL | [bytea](https://www.postgresql.org/docs/17/datatype-binary.html), [large objects](https://www.postgresql.org/docs/17/largeobjects.html), [isolation](https://www.postgresql.org/docs/17/transaction-iso.html) | Database content capability and the exact READ COMMITTED behavior used in the race experiment. |

## Pinned code inspection

The GitHub connector resolved the tags above to immutable commits, then fetched individual files. Relevant fields, callers and branches were read; downloaded application code was not executed. These are bounded traces rather than whole-product audits.

| Inspected files at pinned commit | Trace and finding | Limitation |
| --- | --- | --- |
| [Nextcloud migration](https://github.com/nextcloud/server/blob/051e46a7a272300cf7c90b3e330fd1501fd6a996/core/Migrations/Version13000Date20170718121200.php#L154), [Cache.php](https://github.com/nextcloud/server/blob/051e46a7a272300cf7c90b3e330fd1501fd6a996/lib/private/Files/Cache/Cache.php#L203) | Initial filecache columns; parent/storage reads; descendant-path updates in moves. | Later migrations add fields. A schema migration is not the whole live schema or access layer. |
| [Nextcloud ObjectStoreStorage.php](https://github.com/nextcloud/server/blob/051e46a7a272300cf7c90b3e330fd1501fd6a996/lib/private/Files/ObjectStore/ObjectStoreStorage.php#L248) | ID→URN; readObject; rename→cache move; new file→.part metadata→object write→promotion. | Scoped backend, excluding all encryption/version wrappers and alternate stores. Initial master read was exploratory and replaced by pinned v31 evidence. |
| [Nextcloud DefaultShareProvider.php](https://github.com/nextcloud/server/blob/051e46a7a272300cf7c90b3e330fd1501fd6a996/lib/private/Share20/DefaultShareProvider.php#L85) | Share records persist recipients, permissions, file identity and link-related state. | Does not establish all permission precedence or password verification. |
| [tusd datastore.go](https://github.com/tus/tusd/blob/0e52ad650abed02ec961353bb0c3c8bc36650d2c/pkg/handler/datastore.go#L12), [filestore.go](https://github.com/tus/tusd/blob/0e52ad650abed02ec961353bb0c3c8bc36650d2c/pkg/filestore/filestore.go#L104) | Upload metadata separate from bytes; resumed offset from file size; chunk append. | Only filesystem storage implementation inspected, not S3 store or power-loss durability. |
| [tusd unrouted_handler.go](https://github.com/tus/tusd/blob/0e52ad650abed02ec961353bb0c3c8bc36650d2c/pkg/handler/unrouted_handler.go#L721) | Optional configured locker; current offset check; finish then callbacks. | Does not promise atomic application publication or guaranteed hook delivery. |
| [Syncthing blocks.go](https://github.com/syncthing/syncthing/blob/13d7881b8014cc5078140689198d43fd7829d8a6/lib/scanner/blocks.go#L27), [vector.go](https://github.com/syncthing/syncthing/blob/13d7881b8014cc5078140689198d43fd7829d8a6/lib/protocol/vector.go#L19), [lowlevel.go](https://github.com/syncthing/syncthing/blob/13d7881b8014cc5078140689198d43fd7829d8a6/lib/db/lowlevel.go#L139) | Block hashing, causal counters and local/remote index maintenance. | Not a benchmark or claim about the latest database engine. |
| [Syncthing folder_sendrecv.go](https://github.com/syncthing/syncthing/blob/13d7881b8014cc5078140689198d43fd7829d8a6/lib/model/folder_sendrecv.go#L1825) | Concurrent-vector detection; conflict-file path; configurable retention. | v1.29.0 comments on deletion ordering differ from rolling docs. Report avoids a universal winner rule. |

## Verification setup

The temporary PostgreSQL 17.11-3 Windows binary ZIP was obtained from the provider linked by [PostgreSQL's Windows page](https://www.postgresql.org/download/windows/). Its SHA-256 matched `4b8db0930c38f6ef845db919551dedda3b6b845aeb0927b3d79a6e8e9e4537cf`, published in [EDB's issue response](https://github.com/EnterpriseDB/edb-installers/issues/682#issuecomment-5580623267). Download required elevated network access after sandbox DNS failure. Extracted under the task's temporary directory; no global installation or registered service.

Initialized a disposable cluster with a random password, SCRAM authentication, UTF-8/C locale, and loopback-only port 55439. The first initdb invocation had an argument-parsing error; corrected arguments succeeded. The initial sandbox server start reported readiness, but a later status check found it stopped. A sandbox Node connection also failed with EACCES before any SQL assertion. An early cleanup path obscured that connection failure with an unsettled-await warning; connection timeouts and cleanup of connected clients made the environmental failure explicit. Approved elevated server startup and test execution then succeeded. Downloaded provider application source was not run; only the verified PostgreSQL distribution and our own synthetic tests were executed.

The SQL harness extracts all five SQL blocks from the actual report. It uses the repository's existing pg dependency, three independent connections and pg_blocking_pids to verify contention. Objects and byte counts in the database are synthetic; real provider storage, network resumes, encryption and restore infrastructure are not tested. No dependency was added to the repository.

## Native verification results

PostgreSQL reported server version **17.11**. The first completed run passed 56 checks. The report's upload admission and restoration examples were then aligned with the documented space-first lock order, and four further assertions were added. The final run passed **60 checks: 50 asserted outcomes and 10 observed transaction blockers**. An observed blocker means the observer connection found A in `pg_blocking_pids(B)` while A's transaction remained open; it is not an inference from elapsed time.

| Area | Observed result |
| --- | --- |
| Access and representation | Inherited read succeeds; write, unrelated user, wrong space and unknown action fail; cross-space parent and duplicate sibling are rejected; empty folder survives listing. |
| Connected lifecycle | Restore publishes r3 while preserving r1/r2; 26 MiB logical usage differs from 18 MiB unique content; reservations reach zero; repeated completion returns its original revision without another event. |
| Ownership, copies and trash | Group ownership preserves Alice's access; Bob loses access; a copy adds a separate charge and retained reference; trash and a trashed ancestor deny reads; restoring visibility restores access. |
| Purge and recovery inventory | Purging the original retains B1 for its surviving copy and leaves an 8 MiB charge. A deliberately incomplete inventory identifies B2 as missing. This is reconciliation of synthetic rows, not an actual backup restore. |
| Metadata rollback | Old head and verified upload remain; the ready-content marker is unchanged; no publication event survives; a retry publishes successfully. No actual object-store rollback was tested. |
| Concurrent publication | Duplicate completion creates one new revision/charge; a competing edit from an obsolete head fails and retains its candidate and visible reservation. |
| Quota | After A commits, B reserves nothing; after A rolls back, B reserves 8 MiB. Both final totals stay within the 10 MiB limit with 2 MiB used. |
| Revocation and GC | Revocation that commits first blocks later publication. A collector claim prevents a later reference; a reference that commits first prevents the collector claim. |
| Hierarchy | Direct descendant move and opposing moves reject cycles; delete-before-move and move-before-delete reject stale actions; a valid move preserves the content locator. |
| Expiry | An expired grant denies a fresh access decision. |

The 10 blocker observations cover duplicate completion, competing edits, quota after commit, quota after rollback, revocation, GC first, new reference first, opposing moves, delete first and move first. The harness below preserves the assertions and orchestration. Fixture setup deliberately writes synthetic state directly; it is not a production mutation API.

## Completion audit against the approved plan

Section numbers refer to the [report](How%20file%20platforms%20store%20transfer%20and%20isolate%20data.md). Evidence was checked against the actual report, pinned code, opened sources and completed native results. A conceptual example is not promoted to tested provider behavior.

| Approved coverage | Where and evidence | Completion boundary |
| --- | --- | --- |
| 1. File identity, bytes and revisions | Sections 1, 3, 11: resource distinctions, PostgreSQL content options, Nextcloud ID-to-object trace; actual composite-key and revision rows. | Private Drive/Telegram schemas remain unknown. |
| 2. Folder representation and views | Sections 2, 11–12: adjacency/path/closure alternatives, empty folders, names, shortcuts and query views; Nextcloud migration/cache trace; native listing, uniqueness and cycle tests. | No claim that the teaching schema implements every provider naming or hierarchy rule. |
| 3. Tenant isolation | Section 6 and native cross-space/access assertions: database, storage credentials, caches, search, derivatives, jobs and operations. | No production security perimeter or live tenant-escape test. |
| 4. Uploads and transfers | Sections 4–5: direct/proxied paths, resumability, folder manifests, temporary hosting, device relay and provider migration; four upload protocols and pinned tusd implementation. | HTTP trace is constructed; bytes were not transferred to real providers. |
| 5. Downloads and delivery | Section 5: ranges, pinned revisions, exports, archive jobs, streaming derivatives, CDN capabilities, expiry and revocation. Drive, S3 and Box contracts plus Wormhole/WeTransfer comparison. | No measured CDN behavior or provider account exercise. |
| 6. Sharing and ownership | Section 6: inheritance, exceptions, groups, links, upload-only intake, ownership and employee departure. Drive/Box contracts, Nextcloud share persistence; native inherited-access, transfer, revocation and expiry checks. | Nested groups, limited-access exceptions and encrypted key distribution are discussed, not implemented in SQL. |
| 7. Versions, sync and collaboration | Section 7: change cursors, notification renewal, offline edits, causal vectors, block reuse, selective/on-demand sync and focused live-document comparison. Pinned Syncthing code, Dropbox's sync account, Drive/OneDrive APIs and Yjs. | OT/CRDT internals intentionally outside the user-selected comparison depth. |
| 8. Messenger attachments | Section 8: Telegram parts→media→message journey, reuse, client reference cache, CDN, Secret Chats and local/cloud deletion distinctions. Official API material. | No private server schema, deduplication or physical deletion deadline inferred. |
| 9. Physical storage, encryption and deduplication | Sections 3, 9: object locators, devices, replicas/erasure coding, integrity/repair, key hierarchy, ciphertext constraints and reachability. Dropbox/Ceph/Proton evidence; native shared-reference/GC tests. | Historical architecture is dated; encryption and disk repair were not executed. |
| 10. Derived features and operations | Section 10: previews, OCR/search, notifications, scanning/quarantine, trash, retention, quota, cost, backup and monitoring. Nextcloud, Drive and Dropbox evidence plus native quota/inventory checks. | No real malware pipeline, cost benchmark or disaster-recovery drill. |
| Connected walkthrough and deliverables | Sections 11–12 connect Alice's folder upload, sharing, offline edit, ownership transfer, revocation, old-content restoration, copy and trash. Inline schema, five SQL blocks, stored outcomes, two diagrams and this source/verification log. | Initial upload is represented by setup rows; storage and worker actions in the sequence diagram are conceptual. |
| Interrupted transfer | Section 4 tus trace and section 12 timeline. Protocol and tusd code establish offset recovery. | Source-backed example, not a captured request trace. |
| Duplicate completion, storage/metadata split and concurrent edits | Sections 11–12 and native rollback/retry, duplicate and stale-head tests. | External storage is represented by an already-committed ready marker. |
| Move/delete and opposing moves | Section 12 timelines and native races in both move/delete orders; executable move helper below. | Helper exercises the stated synthetic space-lock/version procedure. |
| Revocation during upload and cached access | Sections 5–6, 12: native revocation-before-publication race; separate bearer/cache lifetime explanation. | Does not promise recall of downloaded plaintext or already-issued bearer URLs. |
| Quota, GC and inconsistent restore | Sections 9–12: native admission commit/rollback, both GC race orders and missing-object inventory. | No actual storage deletion or restore was performed. |

## Artifact checks and cleanup

- `node tests/check-links.mjs` passed: **971 local links in 83 Markdown files**. This validates local targets, not continued availability of remote websites.
- Both new documents passed fence-balance, table-column and trailing-whitespace checks. The report contains five SQL blocks, two Mermaid diagrams and one HTTP example. Diagrams received a static review; browser rendering was not tested.
- The embedded harness matches the executed file after line-ending normalization, and its recorded SHA-256 matches the original. The saved native result contains 50 named outcomes and a total of 60 checks on PostgreSQL 17.11.
- SHA-256 comparison confirmed all **31 pre-existing modified/untracked files** in the saved scope baseline were unchanged. Git status adds only this research directory to that pre-existing work. No staging, commit, push or branch update was performed.
- During cleanup, the original temporary control executable and supporting files were no longer present; the reason was not established. Elevated process inspection still found the task's server and children, so a missing executable/port listing was not treated as proof of shutdown. Rechecked the saved distribution's checksum, extracted only its control utility and DLLs to a temporary directory, then used `pg_ctl -m fast -w stop`. It reported a completed shutdown; subsequent status reported no server and process inspection found no task PostgreSQL processes. The server was not restarted. Temporary verification files remain outside the repository; no service was installed.

## Not done and where to start

No required research area remains open. Unknown provider internals and deliberately excluded production implementation/live collaboration algorithms are documented above, not presented as completed findings. A future extension would need new primary evidence or a separately scoped live integration experiment; repeating the same synthetic SQL would not resolve those unknowns.

## Reproduction harness

The following is the executed JavaScript harness, with file line endings normalized for this document. The original Windows `verify.mjs` SHA-256 was `91c5ac636a73d7cb82c492560cd3cbb1ea29ff2c82636f0408d1e4b4d6b788cd`. It reads SQL from the report rather than keeping another copy. Save it as `verify.mjs`, adapt the machine-specific paths and connection settings, and run `node verify.mjs` against a dedicated disposable PostgreSQL 17 database. It drops/recreates the `file_research` schema repeatedly. It expects the existing `pg` library and a local password file; no password value is included here. The verification environment used the temporary cluster described above, not a provider account.

````javascript
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import pg from 'file:///C:/Github/sql-postgresql-course/node_modules/pg/lib/index.js';

const dir = 'C:/Users/HP/AppData/Local/Temp/codex-file-research';
const report = await fs.readFile('C:/Github/sql-postgresql-course/research/database-design/file-storage-and-transfers/How file platforms store transfer and isolate data.md', 'utf8');
const blocks = [...report.matchAll(/```sql\r?\n([\s\S]*?)```/g)].map(m => m[1]);
assert.equal(blocks.length, 5);
const config = { host: '127.0.0.1', port: 55439, user: 'researcher', database: 'postgres', password: (await fs.readFile(dir + '/pg-password.txt', 'utf8')).trim(), statement_timeout: 8000, connectionTimeoutMillis: 4000 };
const clients = [new pg.Client(config), new pg.Client(config), new pg.Client(config)];
const [db, a, b] = clients;
let checks = 0;
const observations = [];
function eq(actual, expected, name) { assert.deepEqual(actual, expected, name); checks++; observations.push(name); }
async function scalar(sql, params = []) { return Object.values((await db.query(sql, params)).rows[0])[0]; }
async function reset() {
  await db.query('DROP SCHEMA IF EXISTS file_research CASCADE');
  await db.query(blocks[0]);
  await db.query(blocks[1]);
  for (const c of clients) await c.query('SET search_path = file_research, public');
}
async function denied(sql, params, pattern, name) {
  let failed = false;
  try { await db.query(sql, params); } catch (error) { assert.match(error.message, pattern); failed = true; }
  eq(failed, true, name);
}
async function seedUpload(id, actor = 'alice', blobId = id, size = 1048576) {
  await db.query('BEGIN');
  try {
    await db.query('UPDATE space SET reserved_bytes = reserved_bytes + $1 WHERE id = $2', [size, 'S1']);
    await db.query("INSERT INTO blob VALUES ('S1', $1, $2, $3, 'ready') ON CONFLICT DO NOTHING", [blobId, 'S1/content/' + blobId, size]);
    await db.query("INSERT INTO upload_session(space_id,id,actor_id,entry_id,expected_head,blob_id,bytes,state) VALUES ('S1',$1,$2,'F42',1,$3,$4,'verified')", [id, actor, blobId, size]);
    await db.query('COMMIT');
  } catch (e) { await db.query('ROLLBACK'); throw e; }
}
async function waitBlocked() {
  const apid = (await a.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
  const bpid = b.processID;
  const until = Date.now() + 5000;
  while (Date.now() < until) {
    if (await scalar('SELECT $1::int = ANY(pg_blocking_pids($2::int))', [apid, bpid])) { checks++; return; }
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  throw new Error('Expected PostgreSQL blocker was not observed');
}
async function race(sqlA, sqlB, finish = 'COMMIT') {
  await a.query('BEGIN'); await b.query('BEGIN');
  const ar = await a.query(sqlA);
  const pending = b.query(sqlB).then(result => ({result}), error => ({error}));
  await waitBlocked();
  await a.query(finish);
  const br = await pending;
  await b.query(br.error ? 'ROLLBACK' : 'COMMIT');
  return {ar, ...br};
}
try {
  await Promise.all(clients.map(c => c.connect()));
  const version = await scalar('SHOW server_version');
  await reset();
  eq(await scalar("SELECT can_access('S1','F42','bob','read')"), true, 'inherited reader');
  eq(await scalar("SELECT can_access('S1','F42','bob','write')"), false, 'reader cannot write');
  eq(await scalar("SELECT can_access('S1','F42','carol','read')"), false, 'unrelated user denied');
  eq(await scalar("SELECT can_access('S2','F42','alice','read')"), false, 'wrong namespace denied');
  eq(await scalar("SELECT can_access('S1','F42','alice','admin')"), false, 'unknown action denied');
  await denied("INSERT INTO entry(space_id,id,parent_id,name,kind) VALUES ('S2','X','P7','x','file')", [], /foreign key/, 'cross-space parent rejected');
  await denied("INSERT INTO entry(space_id,id,parent_id,name,kind) VALUES ('S1','X','P7','proposal.pdf','file')", [], /unique/, 'duplicate sibling rejected');
  eq((await db.query("SELECT id FROM entry WHERE space_id='S1' AND parent_id='P7' ORDER BY id")).rows.map(r=>r.id), ['F42','P8'], 'folder listing preserves empty folder');
  await db.query(blocks[2]);
  eq(await scalar("SELECT head FROM entry WHERE space_id='S1' AND id='F42'"), 3, 'restore publishes third revision');
  eq((await db.query("SELECT number,blob_id FROM revision ORDER BY number")).rows, [{number:1,blob_id:'B1'},{number:2,blob_id:'B2'},{number:3,blob_id:'B1'}], 'revision content mapping');
  eq(await scalar("SELECT used_bytes::text FROM space WHERE id='S1'"), '27262976', '26 MiB logical accounting');
  eq(await scalar("SELECT reserved_bytes::text FROM space WHERE id='S1'"), '0', 'reservations consumed');
  eq(await scalar("SELECT sum(bytes)::text FROM blob WHERE state='ready'"), '18874368', '18 MiB unique content');
  eq(await scalar("SELECT count(*)::int FROM change_event WHERE kind='revision_published'"), 2, 'publication retry did not duplicate event');
  eq(await scalar("SELECT publish_upload('S1','U2','alice')"), 2, 'old completion retry returns original revision');
  eq(await scalar("SELECT can_access('S1','F42','bob','read')"), false, 'revocation fresh decision');
  eq(await scalar("SELECT can_access('S1','F42','alice','write')"), true, 'new owner group membership');
  await db.query(blocks[3]);
  eq(await scalar("SELECT count(*)::int FROM revision WHERE blob_id='B1'"), 3, 'copy shares content without removing old references');
  eq(await scalar("SELECT used_bytes::text FROM space WHERE id='S1'"), '35651584', 'copy charged as separate logical revision');
  await db.query("UPDATE entry SET state='trashed' WHERE space_id='S1' AND id='F42'");
  eq(await scalar("SELECT can_access('S1','F42','alice','read')"), false, 'file hidden while trashed');
  await db.query("UPDATE entry SET state='active' WHERE space_id='S1' AND id='F42'");
  eq(await scalar("SELECT can_access('S1','F42','alice','read')"), true, 'restored visibility');
  await db.query("UPDATE entry SET state='trashed' WHERE space_id='S1' AND id='P7'");
  eq(await scalar("SELECT can_access('S1','F42','alice','read')"), false, 'trashed ancestor denies content');
  await db.query("UPDATE entry SET state='active' WHERE space_id='S1' AND id='P7'");
  await db.query("CREATE TEMP TABLE restored_inventory(object_key text PRIMARY KEY); INSERT INTO restored_inventory VALUES ('S1/content/B1-v1')");
  eq((await db.query("SELECT DISTINCT b.id FROM revision r JOIN blob b ON (b.space_id,b.id)=(r.space_id,r.blob_id) LEFT JOIN restored_inventory i ON i.object_key=b.object_key WHERE i.object_key IS NULL ORDER BY b.id")).rows, [{id:'B2'}], 'inconsistent recovery inventory detects missing object');
  await db.query("BEGIN; SELECT id FROM space WHERE id='S1' FOR UPDATE; UPDATE entry SET head=NULL,state='trashed' WHERE space_id='S1' AND id='F42'; DELETE FROM upload_session WHERE space_id='S1' AND entry_id='F42'; DELETE FROM revision WHERE space_id='S1' AND entry_id='F42'; UPDATE space SET used_bytes=used_bytes-27262976 WHERE id='S1'; COMMIT");
  eq((await db.query("SELECT id FROM blob b WHERE space_id='S1' AND NOT EXISTS (SELECT 1 FROM revision r WHERE (r.space_id,r.blob_id)=(b.space_id,b.id)) ORDER BY id")).rows, [{id:'B2'}], 'purging original retains blob shared by surviving copy');
  eq(await scalar("SELECT used_bytes::text FROM space WHERE id='S1'"), '8388608', 'surviving copy keeps its logical charge');
  await reset();
  await seedUpload('ROLLBACK');
  await db.query('BEGIN');
  await db.query("SELECT publish_upload('S1','ROLLBACK','alice')");
  await db.query('ROLLBACK');
  eq(await scalar("SELECT head FROM entry WHERE id='F42'"), 1, 'failed metadata commit preserves old head');
  eq(await scalar("SELECT state FROM upload_session WHERE id='ROLLBACK'"), 'verified', 'failed publication retains resumable session');
  eq(await scalar("SELECT state FROM blob WHERE id='ROLLBACK'"), 'ready', 'external content marker survives SQL rollback');
  eq(await scalar("SELECT count(*)::int FROM change_event"), 0, 'rolled-back publication has no event');
  eq(await scalar("SELECT publish_upload('S1','ROLLBACK','alice')"), 2, 'retry after rollback publishes');
  await reset();
  await seedUpload('DUP');
  const duplicate = await race("SELECT publish_upload('S1','DUP','alice')", "SELECT publish_upload('S1','DUP','alice')");
  eq(duplicate.result.rows, [{publish_upload:2}], 'concurrent duplicate returns same revision');
  eq(await scalar("SELECT count(*)::int FROM revision"), 2, 'concurrent duplicate creates one new revision');
  eq(await scalar("SELECT used_bytes::text FROM space WHERE id='S1'"), '9437184', 'concurrent duplicate charges once');
  await reset();
  await seedUpload('EDIT_A'); await seedUpload('EDIT_B');
  const edit = await race("SELECT publish_upload('S1','EDIT_A','alice')", "SELECT publish_upload('S1','EDIT_B','alice')");
  eq(edit.error?.message, 'stale revision', 'concurrent stale edit rejected');
  eq(await scalar("SELECT state FROM upload_session WHERE id='EDIT_B'"), 'verified', 'losing edit retained for explicit resolution');
  eq(await scalar("SELECT reserved_bytes::text FROM space WHERE id='S1'"), '1048576', 'losing edit reservation remains visible');
  for (const finish of ['COMMIT','ROLLBACK']) {
    await reset();
    await db.query("INSERT INTO space(id,owner_id,limit_bytes,used_bytes) VALUES ('RACE','alice',10485760,2097152)");
    const quota = await race(blocks[4], blocks[4], finish);
    eq(quota.result.rowCount, finish==='COMMIT' ? 0 : 1, 'quota waiter after ' + finish);
    eq(await scalar("SELECT reserved_bytes::text FROM space WHERE id='RACE'"), '8388608', 'quota final reservation after ' + finish);
  }
  await reset();
  await db.query("UPDATE grant_rule SET role='editor' WHERE principal_id='bob'");
  await seedUpload('REVOKED','bob');
  const revoked = await race("SELECT id FROM space WHERE id='S1' FOR UPDATE; DELETE FROM grant_rule WHERE principal_id='bob'", "SELECT publish_upload('S1','REVOKED','bob')");
  eq(revoked.error?.message, 'access denied', 'revocation winning race blocks publication');
  await reset();
  await db.query("INSERT INTO blob VALUES ('S1','GC','S1/content/GC',1048576,'ready')");
  const attach = "UPDATE space SET reserved_bytes=reserved_bytes+1048576 WHERE id='S1'; INSERT INTO upload_session(space_id,id,actor_id,entry_id,expected_head,blob_id,bytes,state) VALUES ('S1','GC','alice','F42',1,'GC',1048576,'verified'); SELECT publish_upload('S1','GC','alice')";
  const claim = "SELECT id FROM space WHERE id='S1' FOR UPDATE; UPDATE blob SET state='deleting' WHERE space_id='S1' AND id='GC' AND NOT EXISTS (SELECT 1 FROM revision WHERE space_id='S1' AND blob_id='GC') AND NOT EXISTS (SELECT 1 FROM upload_session WHERE space_id='S1' AND blob_id='GC' AND state IN ('receiving','verified')) RETURNING id";
  const gc = await race(claim, attach);
  eq(gc.error?.message, 'content not ready', 'collector claim prevents later publication');
  await reset();
  await db.query("INSERT INTO blob VALUES ('S1','GC','S1/content/GC',1048576,'ready')");
  const keep = await race(attach, claim);
  eq(keep.result.at(-1).rowCount, 0, 'collector skips newly referenced content');
  await reset();
  await db.query(`CREATE FUNCTION move_entry(p_id text, p_parent text, p_version int)
    RETURNS void LANGUAGE plpgsql AS $$
    DECLARE e entry%ROWTYPE;
    BEGIN
      PERFORM 1 FROM space WHERE id='S1' FOR UPDATE;
      SELECT * INTO STRICT e FROM entry WHERE space_id='S1' AND id=p_id;
      IF e.state <> 'active' OR e.metadata_version <> p_version OR e.parent_id IS NULL THEN RAISE EXCEPTION 'stale move'; END IF;
      IF NOT can_access('S1',p_id,'alice','write') OR NOT can_access('S1',p_parent,'alice','write') THEN RAISE EXCEPTION 'access denied'; END IF;
      IF NOT EXISTS (SELECT 1 FROM entry WHERE space_id='S1' AND id=p_parent AND kind='folder') THEN RAISE EXCEPTION 'not a folder'; END IF;
      IF EXISTS (WITH RECURSIVE tree AS (
        SELECT id,parent_id FROM entry WHERE space_id='S1' AND id=p_parent
        UNION SELECT n.id,n.parent_id FROM entry n JOIN tree t ON n.id=t.parent_id WHERE n.space_id='S1'
      ) SELECT 1 FROM tree WHERE id=p_id) THEN RAISE EXCEPTION 'cycle'; END IF;
      UPDATE entry SET parent_id=p_parent,metadata_version=metadata_version+1 WHERE space_id='S1' AND id=p_id;
      INSERT INTO change_event(space_id,entry_id,kind) VALUES ('S1',p_id,'moved');
    END; $$`);
  await db.query("INSERT INTO entry(space_id,id,parent_id,name,kind) VALUES ('S1','P9','P0','Other','folder')");
  await denied("SELECT move_entry('P7','P8',1)", [], /cycle/, 'move into descendant rejected');
  const cycle = await race("SELECT move_entry('P7','P9',1)", "SELECT move_entry('P9','P7',1)");
  eq(cycle.error?.message, 'cycle', 'opposing moves cannot create cycle');
  eq(await scalar("SELECT parent_id FROM entry WHERE space_id='S1' AND id='P9'"), 'P0', 'rejected opposing move leaves tree rooted');
  const deletion = await race("SELECT id FROM space WHERE id='S1' FOR UPDATE; UPDATE entry SET state='trashed',metadata_version=metadata_version+1 WHERE space_id='S1' AND id='F42' AND metadata_version=1", "SELECT move_entry('F42','P9',1)");
  eq(deletion.error?.message, 'stale move', 'delete before move rejects stale move');
  await db.query("UPDATE entry SET state='active',metadata_version=1 WHERE space_id='S1' AND id='F42'");
  const move = await race("SELECT move_entry('F42','P9',1)", "SELECT id FROM space WHERE id='S1' FOR UPDATE; UPDATE entry SET state='trashed',metadata_version=metadata_version+1 WHERE space_id='S1' AND id='F42' AND metadata_version=1 RETURNING id");
  eq(move.result.at(-1).rowCount, 0, 'move before delete rejects stale delete');
  eq(await scalar("SELECT b.object_key FROM entry e JOIN revision r ON (r.space_id,r.entry_id,r.number)=(e.space_id,e.id,e.head) JOIN blob b ON (b.space_id,b.id)=(r.space_id,r.blob_id) WHERE e.space_id='S1' AND e.id='F42'"), 'S1/content/B1-v1', 'move preserves content locator');
  await reset();
  await db.query("UPDATE grant_rule SET expires_at=statement_timestamp()-interval '1 second' WHERE principal_id='bob'");
  eq(await scalar("SELECT can_access('S1','F42','bob','read')"), false, 'expired grant denied');
  const result = {version, checks, observations, limitations:['Storage bytes and provider calls were not exercised.','Recovery inventory is a synthetic reconciliation check, not a backup restore.','Hierarchy helper implements the procedure described in the report; it is included in the log harness.']};
  await fs.writeFile(dir + '/results.json', JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const c of clients) { if (c._connected && !c._ending) { try { await c.query('ROLLBACK'); } catch {} } await c.end().catch(()=>{}); }
}
````

## Connected teaching pass, 11 Nov 2026

The user authorized a teaching pass across all four existing report/log pairs. Read the goal attachment, referenced chat and collection. Live GitHub repository/branch reads confirmed authoritative `omsrivastava512/sql-postgresql-course`, default `main`, at `9fbadbedca2e2828d619d9d47b47a6f31baf0887`. Local clean `main` at `25befd4` was exactly 10 ahead / 0 behind. All-state PR/issue searches found none; remote history and local file-research commit `0149291` establish that this is an explanation revision of completed research. No update or Git mutation was needed or performed.

### Gap and repair

The report had executable publication and rich comparisons, but initial upload was compressed into seed rows, several operations occupied one long SQL block, and physical reclamation was distant from Alice's concrete history. Added a reading route and a conceptual initial-upload bridge, then explained the existing columns and publication checks before combining them. The edit now follows S1/F42, U2/B2 and U3/B1 through admission, trusted verification, publication, retry, ownership/revocation, restore, copy and purge. It explains 8/18/26/34 MiB logical usage against 18 MiB unique bytes, and why F43 retains B1 after F42's 26 MiB history is purged.

The prose also makes visible two existing fixture boundaries: zero-row admission can leave a staged blob without a session, and the trash/restore statements share one transaction rather than exposing a committed interval in trash. These are explanations of the existing code, not repairs to it. Added a prediction about U2's historical result after the head advances, an exercise changing quota to unique-blob accounting with hints/answer, and an implementation decision record.

Existing sources remain useful at the decisions they explain: tus separates transfer offset from publication; S3 bounds delivery capabilities; Nextcloud illustrates metadata/object separation; Dropbox distinguishes reachability from physical reclamation. No new provider claim needed a new source. Source registers, dates, exceptions and unknowns are retained.

### Learning and evidence boundary

A reader should be able to trace an authorized read to a retained revision and exact blob; explain why completed bytes are not yet publication; recover a lost publication response; distinguish access revocation from recalling delivered content; and justify why restoring content, restoring visibility, purging history and deleting storage have different effects. The quota exercise tests transfer to a changed policy, but no learner attempt has been observed.

All five SQL blocks and the embedded native harness are unchanged. Their evidence remains the 5 Nov PostgreSQL 17.11 run: 50 asserted outcomes and 10 observed blockers. The connected purge explanation matches that harness's synthetic row check; the continuation through object deletion and physical reclamation is reasoned, not a new integration test. No server was started, no bytes uploaded/deleted, and no provider or cryptography experiment was run in this pass. Full authorization, expiry/cancellation workers, retention-safe receipt archival and storage recovery remain production work.

Final artifact checks on 11 Nov: 978 local links in 85 Markdown files passed. New reading-route anchors resolve. All eight documents passed fence/table checks, and comparison with pre-edit HEAD after newline normalization preserved every fenced block, both embedded harnesses and all external source targets. Rechecked 26 MiB = 27,262,976 bytes, 34 MiB = 35,651,584 bytes and 18 MiB = 18,874,368 bytes. Reviewed admission/publication/restore/purge prose against the unchanged SQL and harness; explicitly distinguished a missing physical object from a database marker saying ready. `git diff --check` passed and status contained exactly the eight authorized documents. This validates consistency and navigation, not byte durability, access security, physical deletion or a learner's independent understanding.

Final review on 12 Nov: live upstream main remained at 9fbadbedca2e2828d619d9d47b47a6f31baf0887; the local branch remained 10 ahead / 0 behind. The same link and heading checks restricted to tracked Markdown passed 978 links in 85 files. Fence/table checks and unchanged-example/source comparisons passed again. The full recursive link checker now reports a thread-scheme link in the independently added, untracked learning/Full-Stack-Backend-Curriculum.md as a missing local file. That file and the checker were left untouched. The tracked diff remains confined to the eight authorized research documents; the earlier 11 Nov results remain dated observations.
