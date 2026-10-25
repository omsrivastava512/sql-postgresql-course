# Source notebook

Checked 2026-10-17. Sources are selected for a specific teaching purpose. "Read" means the relevant page was opened and its relevant passage inspected; it does not mean every code claim has been independently reproduced.

## Firsthand engineering accounts

| Source | Attribution and date | Use in this course | What not to infer |
|---|---|---|---|
| [Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency) | Brandur Leach, Stripe, 2017-02-22; read | Article 06: a lost response can leave the caller uncertain after a successful operation. | A database transaction alone cannot deduplicate arbitrary retries; this historical article is not the current API specification. |
| [Herding elephants: Lessons learned from sharding Postgres at Notion](https://www.notion.com/blog/sharding-postgres-at-notion) | Garrett Fidalgo, Notion, 2021-10-06; read | Article 01: related data placement matters when operations must be coordinated. | Our clinic needs sharding, or its relationships reproduce Notion's schema. |
| [Partitioning GitHub's relational databases to handle scale](https://github.blog/engineering/infrastructure/partitioning-githubs-relational-databases-scale/) | GitHub Engineering, 2021; read | Article 02: application and database boundaries depend on architecture. | MySQL behavior is interchangeable with PostgreSQL, or GitHub's scale is a beginner requirement. |
| [Soft Deletion Probably Isn't Worth It](https://brandur.org/soft-deletion) | Brandur Leach, personal engineering account, 2022-07-19; read | Article 04: retaining a deleted marker changes the work required of queries and relationships. | Soft deletion is always wrong, or a medical retention policy follows from this essay. |
| [Easy, alternative soft deletion: deleted_record_insert](https://brandur.org/fragments/deleted-record-insert) | Brandur Leach, 2022-12-28; read | Article 03: a concrete reported use of AFTER DELETE triggers. | The author uses our owner-derivation trigger, or our sample is production-ready security code. |
| [Zero-downtime Postgres migrations — the hard parts](https://gocardless.com/blog/zero-downtime-postgres-migrations-the-hard-parts/) | Chris Sinjakli, GoCardless; page says last edited June 2024, account discusses older PostgreSQL versions; read | Future migration lab: a quick DDL change can still wait on locks and disrupt requests. | Historical lock modes or table-rewrite advice describe current PostgreSQL unchanged. Recheck the target version. |
| [Postmortem of database outage of January 31](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/) | GitLab engineering incident account, 2017-02-10; read | Future operations article: restoring a backup is a separate capability from transaction rollback. | The course's DELETE lab reproduces this filesystem-level incident. |
| [Online migrations at scale](https://stripe.com/blog/online-migrations) | Jacqueline Xu, Stripe, 2017-02-02; read 2026-10-21 | Article 17: separate compatibility, backfill, read transition and eventual removal; our additive exercise adapts staging and reconciliation. | Our exercise reproduces Stripe's architecture, scale or dual-write transition. It does not replace an existing field. |
| [Paginating requests in APIs using relative cursors](https://shopify.engineering/pagination-relative-cursors) | Drew Martin, Shopify, 2019-08-12; read 2026-10-21 | Article 20: deep offsets, connection occupancy, complete cursor keys and suitable indexes. | Shopify's historical timings are not our measurements or a general speedup guarantee. Our generated PostgreSQL events are an original exercise. |

Each source contributes a short connection, not a retelling of the whole article. Keep source-derived text across the course brief and avoid copying snippets from a company merely to look authentic.

## Technical authorities

- [PostgreSQL 17 SQL tutorial](https://www.postgresql.org/docs/17/tutorial-sql.html): language onramp.
- [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): FK, NULL and delete rules.
- [CREATE TABLE](https://www.postgresql.org/docs/17/sql-createtable.html): declaration details.
- [Trigger functions](https://www.postgresql.org/docs/17/plpgsql-trigger.html) and [CREATE TRIGGER](https://www.postgresql.org/docs/17/sql-createtrigger.html): function context and attachment.
- [SET CONSTRAINTS](https://www.postgresql.org/docs/17/sql-set-constraints.html): deferred-check timing.
- [Transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html) and [sequence functions](https://www.postgresql.org/docs/17/functions-sequence.html): distinct rollback behavior.
- [Stripe's current idempotency reference](https://docs.stripe.com/api/idempotent_requests): verify current service semantics before writing an integration lesson.
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres): direct, session and transaction connection modes.
- [Supabase tables guide](https://supabase.com/docs/guides/database/tables): SQL editor and schema exposure.

Pin teaching claims to a documented version. Record actual execution versions in VERIFICATION.md rather than assuming a hosted database uses the same version.

## Curriculum audit references

Checked 2026-10-19 for the standalone curriculum revision:

- [PostgreSQL tutorial overview](https://www.postgresql.org/docs/17/tutorial.html): independent check of beginner foundations and progression into views, relationships, transactions and windows.
- [PostgreSQL SQL manual contents](https://www.postgresql.org/docs/17/sql.html): breadth check for query composition, expressions, indexing and concurrency. This selects topics; it does not validate unwritten lesson examples.
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security): reference for future exposure, identity and policy lessons; do not carry over broad claims from private study notes.
- [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html): execution identity and safe function definitions for future invoker/definer lessons.

The [author audit](CURRICULUM_AUDIT.md) records the additions and limits. Recheck the relevant detailed documentation when each lesson is authored and tested.

## Practical-course reference decisions

Reviewed 2026-10-20 from public course pages, visible lessons and project/workshop specifications. Paid playback and unexecuted course checks are not claimed as reviewed learning experiences. These are teaching-design inspirations; technical PostgreSQL behaviour is verified separately.

| Reference | Selected use | Boundary |
|---|---|---|
| [Stephen Grider: SQL and PostgreSQL](https://www.udemy.com/course/sql-and-postgresql/) | Revisit a familiar application while supplying a complete starting snapshot for each lab. | Public curriculum review; no reproduction of paid lectures or exercises. |
| [Boot.dev: Learn SQL](https://www.boot.dev/courses/learn-sql) | Progress from prediction and repair to independent writing; give useful feedback and accept equivalent correct SQL. | Adapt to PostgreSQL and the declared task, rather than copying a provider's syntax-specific checker. |
| [freeCodeCamp relational databases v9](https://www.freecodecamp.org/learn/relational-databases-v9/) | Inspect schema/data after changes; separate guided workshops from independent briefs. | Database work stays central; a shell/editor curriculum is not added to the core. |
| [8 Week SQL Challenge](https://8weeksqlchallenge.com/getting-started/) | Use a business question and then change an assumption; later add a reconciled data handoff and reusable report. | The first three foundation labs use original synthetic data. Later report/import work remains planned; paid official solutions are not part of this reference review. |

The first foundation batch applies inspection, repair, independent practice and changed-setting prompts. It adds no company case study: basic NULL and key behaviour does not need a decorative company anecdote. The existing engineering accounts remain available where their reported tradeoffs answer a real lesson question.

Technical references for this batch also include PostgreSQL 17 [defaults](https://www.postgresql.org/docs/17/ddl-default.html), [comparisons](https://www.postgresql.org/docs/17/functions-comparison.html), [identity columns](https://www.postgresql.org/docs/17/ddl-identity-columns.html), [UUID functions](https://www.postgresql.org/docs/17/functions-uuid.html), [ordering](https://www.postgresql.org/docs/17/queries-order.html), [pagination](https://www.postgresql.org/docs/17/queries-limit.html) and [RETURNING](https://www.postgresql.org/docs/17/dml-returning.html). Each article links its more specific authorities. Actual execution versions belong in the verification record.

## Query and data-handoff implementation references

Checked 2026-10-20. The two original business briefs from the accepted plan now have draft labs: a monthly metric with an independent usage report, and a reconciled CSV handoff. They use synthetic data and are not reports of incidents at a named company. Existing engineering case studies remain curated for the later lessons where they are relevant.

Technical checks used PostgreSQL 17 [table expressions](https://www.postgresql.org/docs/17/queries-table-expressions.html), [aggregate expressions](https://www.postgresql.org/docs/17/sql-expressions.html), [subquery predicates](https://www.postgresql.org/docs/17/functions-subquery.html), [set operations](https://www.postgresql.org/docs/17/queries-union.html), [WITH](https://www.postgresql.org/docs/17/queries-with.html), [window functions](https://www.postgresql.org/docs/17/functions-window.html), [views](https://www.postgresql.org/docs/17/sql-createview.html), [materialized views](https://www.postgresql.org/docs/17/rules-materializedviews.html), [numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html), [date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html), [COPY](https://www.postgresql.org/docs/17/sql-copy.html), [input validation](https://www.postgresql.org/docs/17/functions-info.html) and [INSERT/ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html).

The separate actual-file check uses [PGlite's documented Blob import/export interface](https://pglite.dev/docs/api). This verifies PostgreSQL CSV parsing in the embedded runtime; it does not verify Docker copying, psql interaction, hosted file permissions or a Supabase upload flow. The [verification record](VERIFICATION.md) preserves the command and limitations.

## Concurrency and migration references

Checked 2026-10-21. The two new pilots use PostgreSQL 17 [transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html), [serialization-failure handling](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html), [ALTER TABLE](https://www.postgresql.org/docs/17/sql-altertable.html), [client timeouts](https://www.postgresql.org/docs/17/runtime-config-client.html) and [pg_blocking_pids](https://www.postgresql.org/docs/17/functions-info.html). The session checker follows [node-postgres transaction guidance](https://node-postgres.com/features/transactions): every transaction stays on its own client connection.

Article 17 uses the Stripe account above as its main engineering connection. [GitLab's migration guidance](https://docs.gitlab.com/development/database/avoiding_downtime_in_migrations/) adds a short compatibility check for later renames/removals. Neither source proves that this small lab is a production migration system. Additional company stories were not added merely to increase their count.

The native Windows test runtime came from the [official PostgreSQL Windows download route](https://www.postgresql.org/download/windows/) and its linked [EDB binary archive](https://www.enterprisedb.com/download-postgresql-binaries). Exact version, local artifact hash and execution limits are in [verification](VERIFICATION.md).

## Practical performance references

Checked 2026-10-21. PostgreSQL 17 authorities for this batch are [using EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html), [EXPLAIN options](https://www.postgresql.org/docs/17/sql-explain.html), [multicolumn indexes](https://www.postgresql.org/docs/17/indexes-multicolumn.html), [partial indexes](https://www.postgresql.org/docs/17/indexes-partial.html), [index-only scans](https://www.postgresql.org/docs/17/indexes-index-only-scans.html), [planner statistics](https://www.postgresql.org/docs/17/planner-stats.html), [routine vacuuming](https://www.postgresql.org/docs/17/routine-vacuuming.html) and [VACUUM](https://www.postgresql.org/docs/17/sql-vacuum.html). Pagination uses the ordering and row-comparison references linked in article 20.

The request module follows node-postgres guidance on [bound query values](https://node-postgres.com/features/queries) and [connection pooling](https://node-postgres.com/features/pooling). The installed pg-pool implementation was also inspected for waitingCount and checkout timeout behaviour; the native checker then observed a queued checkout and backend reuse. These are client-pool observations, not verification of hosted Supabase pool modes.

The review rejected blanket rules such as “a sequential scan means a missing index,” “a B-tree cannot be used without its leading key,” and “every foreign key needs another index.” The lessons use the target-version documentation, a named workload and actual plans. No source's benchmark ratio is presented as a course result. Shopify supplies the single new company connection; the other four labs need no additional company narrative.

## Learning format references

[The Odin Project](https://www.theodinproject.com/lessons/foundations-how-this-course-will-work) connects lessons with projects. [SQLBolt](https://sqlbolt.com/) places exercises beside explanations. [Explorable Explanations](https://explorabl.es/faq/) offers examples of learning through manipulation. [Quantum Country](https://quantum.country/) embeds spaced review into essays.

These are format inspirations, not proof that every feature improves learning.

[Pimsleur](https://www.pimsleur.com/the-pimsleur-method/) describes anticipation and spaced recall. We borrow those general ideas without claiming its language-course method is validated for SQL.

The [IES learning guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) and [Karpicke and Blunt (2011)](https://pubmed.ncbi.nlm.nih.gov/21252317/) inform the practice design. The course's own effectiveness remains to be evaluated.

