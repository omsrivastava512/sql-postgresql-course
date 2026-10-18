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

## Learning format references

[The Odin Project](https://www.theodinproject.com/lessons/foundations-how-this-course-will-work) connects lessons with projects. [SQLBolt](https://sqlbolt.com/) places exercises beside explanations. [Explorable Explanations](https://explorabl.es/faq/) offers examples of learning through manipulation. [Quantum Country](https://quantum.country/) embeds spaced review into essays.

These are format inspirations, not proof that every feature improves learning.

[Pimsleur](https://www.pimsleur.com/the-pimsleur-method/) describes anticipation and spaced recall. We borrow those general ideas without claiming its language-course method is validated for SQL.

The [IES learning guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) and [Karpicke and Blunt (2011)](https://pubmed.ncbi.nlm.nih.gov/21252317/) inform the practice design. The course's own effectiveness remains to be evaluated.

