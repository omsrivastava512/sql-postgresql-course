# SQL that holds up

A standalone course about storing facts, asking questions, and understanding what a database can guarantee.

**For:** programmers new to databases. **Focus:** SQL and PostgreSQL, with backend context where it helps explain the database. **Format:** connected short articles and separate, resettable labs.

The examples use fictional applications. The first lessons use a clinic; the wider curriculum also uses shops, reservations, subscriptions, and shared workspaces. Everything needed for a lab is supplied here. You need no existing application, private notes, or medical knowledge.

## Choose a way in

- **New to databases:** see the [beginner route](COURSE_MAP.md#the-beginner-route). It distinguishes available lessons from topics still to be written. The [SQL onramp](articles/00-reading-the-examples.md) and three foundation lessons are available now.
- **Ready to explore the current lessons:** follow the [first route](COURSE_MAP.md#the-first-route), starting with foreign keys.
- **Returning after a gap:** choose a [review prompt](REVIEW.md), then revisit the relevant article's return note.
- **Following a question:** use the [course map](COURSE_MAP.md). Related ideas are linked; there is no locked sequence.
- **Ready to run SQL:** choose local PostgreSQL or Supabase in the [lab guide](labs/README.md).

## Available lessons

| Article | What you should be able to do afterward |
|---|---|
| [Reading the examples](articles/00-reading-the-examples.md) | Read a small table definition and inspect or change a row. |
| [What value did I actually store?](articles/07-stored-values.md) | Distinguish omitted input, NULL and empty text, then enforce a chosen row rule. |
| [Which rows did I ask for?](articles/08-selecting-rows.md) | Predict filters, ordering, pages and the rows selected for a write. |
| [What identifies this row?](articles/09-row-identity.md) | Define scoped uniqueness and relationships, and separate generated keys from business numbering. |
| [Which rows survive a join?](articles/10-joins.md) | Preserve the intended population and query role-specific relationships. |
| [Why did the total multiply?](articles/11-aggregate-grain.md) | Repair double counting at the right grain and distinguish row/group filters. |
| [What shape does this query return?](articles/12-query-shapes.md) | Choose scalar, existence and set results; decompose queries with CTEs. |
| [Which row is first, and what came before it?](articles/13-window-questions.md) | Specify ranking ties, latest rows, running totals and previous-row comparisons. |
| [What does this monthly number mean?](articles/14-reusable-reports.md) | Build reusable reports with explicit metrics, periods and denominators. |
| [Can this imported data be trusted?](articles/15-data-handoff.md) | Validate, reconcile, export and replay a small CSV handoff. |
| [What a foreign key actually promises](articles/01-foreign-keys.md) | Separate existence from suitability and permission. |
| [An existing person can still be the wrong owner](articles/02-business-rules.md) | Trace a validation trigger and identify a write it does not cover. |
| [Who put that owner on the note?](articles/03-derived-values.md) | Trace supplied input through a BEFORE trigger and spot a stale copy. |
| [Deleting a patient with visits](articles/04-deleting-related-rows.md) | Predict rejection, cascading deletion, and clearing a reference. |
| [Can the database wait until I am finished?](articles/05-deferred-checks.md) | Compare immediate and deferred checks in a complete transaction. |
| [The invoice failed. Did its number disappear?](articles/06-transaction-boundaries.md) | Locate rollback boundaries and distinguish them from a lost response. |
| [Can two callers claim the last item?](articles/16-competing-claims.md) | Repair a stale decision, observe blocking and retry a complete transaction. |
| [Can old callers survive a required new field?](articles/17-compatible-change.md) | Resume a bounded backfill, preserve old/new callers and inspect migration failures. |
| [Where did this query spend its work?](articles/18-query-plans.md) | Read estimated/actual work and measure a change without changing its answer. |
| [Which index earns its cost?](articles/19-index-decisions.md) | Compare index candidates against reads, writes, storage and a scoped uniqueness rule. |
| [Why does the later page do more work?](articles/20-deep-pages.md) | Compare matching offset/cursor pages, preserve ties and test changing sort values. |
| [Why did yesterday's plan stop fitting today's data?](articles/21-statistics-maintenance.md) | Distinguish statistics from cleanup and observe an old snapshot delaying vacuum. |
| [How much database work does one request cause?](articles/22-request-work.md) | Count calls, preserve nested results, bind inputs and identify a pool wait. |
| [I connected successfully. Why is this query denied?](articles/23-database-roles.md) | Separate database identity from profile labels and test schema/table/column/sequence grants. |
| [Which rows may this role change?](articles/24-row-policies.md) | Implement and test allowed/forbidden reads and writes with row policies. |
| [Who belongs to this workspace?](articles/25-tenant-membership.md) | Protect memberships, enforce tenant write rights and preserve tenant-consistent references. |
| [Whose permissions does this helper use?](articles/26-privileged-code.md) | Inspect view/function execution identity and repair excess access and unsafe name resolution. |
| [Why did renaming one product give it two names?](articles/27-product-variants.md) | Repair a shared name and prove that every sellable pack survives. |
| [Can two stores use SKU 17 for different things?](articles/28-store-offers.md) | Locate a store offer and distinguish zero stock from a missing listing. |
| [What price did this customer accept?](articles/29-order-snapshots.md) | Write the accepted terms with the order and recover both receipts after the offer disappears. |

There are **30 lessons and 29 labs**. The catalog route starts with two packs of tea and ends with a receipt that survives a rename, a price change and the removal of the offer. Request retries, authenticated API integration, broader migrations, recovery and an integrated capstone remain open. The [topic inventory](TOPIC_INVENTORY.md) records the evidence for each objective.

The full embedded and native reference checks passed on 2026-11-02. The [verification record](VERIFICATION.md) gives separate dates for the session, performance and restricted-login checks. Docker setup, hosted Supabase and reader trials remain open.

## How the ideas connect

Read a worked example, predict a change, run it, and explain the result. Later, meet the same idea in a different setting: a patient reference becomes a customer reference; an invoice rollback becomes a reservation rollback. Use [review prompts](REVIEW.md) after a gap, with hints and answers available whenever useful.

The [map](COURSE_MAP.md) separates prerequisites from related questions. General SQL ideas, PostgreSQL features, and Supabase integration are labelled separately. PostgreSQL is our execution environment; identical-looking SQL is not a promise of identical behaviour in every database.

Articles can be published as the author learns and verifies them. Planned lessons stay visibly planned, and links to articles appear only when those articles exist.

## Real engineering, with attribution

The [source notebook](SOURCES.md#lesson-by-lesson-grounding-coverage) connects the lessons to reported engineering decisions: retries and migrations at Stripe, pagination at Shopify, metric definitions at Airbnb, duplicate delivery at Segment, and access checks at Nile. It also identifies practitioner demonstrations and lessons that use fictional exercises. All course datasets are synthetic; the coverage table explains what each example borrows and where the comparison ends.

This README was prepared with AI assistance. The course author should revise it after doing the labs; we do not invent personal experience or claim it was entirely human-written.

## For authors and maintainers

Readers can skip these records:

- [Teaching guide](AUTHORING.md) and [publication queue](PUBLICATION.md): how to develop and release lessons.
- [Curriculum audit](CURRICULUM_AUDIT.md): source-study cross-reference, added topics, and evidence requirements.
- [Repository evidence](REPOSITORY_EVIDENCE.md): historical provenance, not reader prerequisites.
- [File guide](NEW_FILES.md): what the repository's supporting files are for.

The SQL uses synthetic data in dedicated course schemas. Use a disposable learning database; setup scripts reset their named lab schema. Access labs additionally create dedicated cluster-wide roles and provide cleanup scripts.
