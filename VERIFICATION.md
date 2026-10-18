# Verification record

Status: draft. SQL execution record dated 2026-10-17 (Asia/Kolkata); documentation audit added 2026-10-19.

| Check | Result |
|---|---|
| Embedded PostgreSQL execution | PASS: 65 assertions across 6 labs on PostgreSQL 18.6 / PGlite 0.5.10 |
| Local Docker PostgreSQL 17.11 | Not run; Docker is not installed on this host |
| Hosted Supabase | Deferred at the user's request on 2026-10-17; not tested |
| Local Markdown links, original package | Historical PASS: 161 local links across 24 Markdown files; current revision checked below |
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
