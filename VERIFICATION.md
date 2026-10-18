# Verification record

Status: draft. Recorded 2026-10-17 (Asia/Kolkata).

| Check | Result |
|---|---|
| Embedded PostgreSQL execution | PASS: 65 assertions across 6 labs on PostgreSQL 18.6 / PGlite 0.5.10 |
| Local Docker PostgreSQL 17.11 | Not run; Docker is not installed on this host |
| Hosted Supabase | Deferred at the user's request on 2026-10-17; not tested |
| Local Markdown links | PASS: 161 local links across 24 Markdown files, including the delivery inventory |
| Author learning trial and editorial revision | Pending |
| Public publication | Not performed |

The embedded runtime tests SQL behavior only. It cannot establish Docker setup, hosted permissions, or concurrent-session behavior. A public release requires the two supported environment runs and an editorial learning trial.

The six initial labs cover foreign-key failures, role validation and its update gap, derived values and stale copies, delete actions, deferred-check timing, and invoice failure rollback. The test cases also run every successful solution after a fresh setup and exercise setup reset twice.

No test in this package claims to verify concurrent requests, API retries, production authorization, or a deployed clinic schema.

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
