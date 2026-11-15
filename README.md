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
- **Exploring a complete backend problem:** choose a [research guide](#research-guides-and-experiments) and use the [research routes](COURSE_MAP.md#apply-the-lessons-in-a-research-guide) to find its related lessons.

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
| [Why did my saved price disappear?](articles/30-conflicting-edits.md) | Catch a stale price edit and decide whether to submit a new one. |
| [Why are both stock transfers waiting?](articles/31-lock-order.md) | Trace a deadlock and move stock safely in either direction. |
| [Did the order fail, or did its response go missing?](articles/32-request-replay.md) | Recover an accepted receipt and reject a conflicting retry. |
| [Alice signed in. Why can she still see no store?](articles/33-request-identity.md) | Trace account identity separately from profile and membership. |
| [The request knows Alice. Which rows may it change?](articles/34-authorized-requests.md) | Distinguish hidden rows, forbidden changes and missing API privileges. |
| [The order was accepted. May Alice recover its receipt?](articles/35-authorized-replay.md) | Separate permission to place an order from permission to recover its accepted receipt. |

There are **36 lessons and 35 labs**. The newest three are authenticated-access drafts with SQL-only verification; real Auth/API and concurrent-session checks remain pending. Follow them after the local access-control and reliable-writes routes. Broader migrations, recovery and the capstone remain open. The [topic inventory](TOPIC_INVENTORY.md) records the evidence for each objective.

The earlier 32-lab embedded suite passed again on 2026-11-15; its native reference checks remain dated 2026-11-02. The new SQL-only checker passed 71 assertions. The [verification record](VERIFICATION.md) separates these results from pending live Supabase, concurrency and reader checks for lessons 33–35.

## How the ideas connect

Read a worked example, predict a change, run it, and explain the result. Later, meet the same idea in a different setting: a patient reference becomes a customer reference; an invoice rollback becomes a reservation rollback. Use [review prompts](REVIEW.md) after a gap, with hints and answers available whenever useful.

The [map](COURSE_MAP.md) separates prerequisites from related questions. General SQL ideas, PostgreSQL features, and Supabase integration are labelled separately. PostgreSQL is our execution environment; identical-looking SQL is not a promise of identical behaviour in every database.

Articles can be published as the author learns and verifies them. Planned lessons stay visibly planned, and links to articles appear only when those articles exist.

## Research guides and experiments

The research guides follow longer application journeys through business rules, stored records, transactions, failure and recovery. Use them alongside the numbered lessons; a guide's broader coverage does not mean every topic already has a course lesson or a verified implementation. The [course map](COURSE_MAP.md#apply-the-lessons-in-a-research-guide) connects the guides to the SQL ideas they use.

| Guide | Connection to the course | Current evidence and boundary |
|---|---|---|
| [Catalogs and billing](research/database-design/catalogs-and-billing/How%20commerce%20platforms%20model%20catalogs%20and%20billing.md) · [research log](research/database-design/catalogs-and-billing/Research%20log%20how%20the%20catalog%20and%20billing%20report%20was%20built.md) | Extend [product variants](articles/27-product-variants.md), [store offers](articles/28-store-offers.md) and [accepted terms](articles/29-order-snapshots.md) into selection, stock acceptance and billing. | Worked SQL model with dated execution evidence; wider fulfillment and recurring billing remain conceptual. |
| [Personalized offers and pricing](research/database-design/personalized-offers-and-pricing/How%20business%20apps%20personalize%20offers%20and%20prices.md) · [research log](research/database-design/personalized-offers-and-pricing/Research%20log.md) | Combine [competing claims](articles/16-competing-claims.md), accepted prices and [request replay](articles/32-request-replay.md) around one customer's offer. | Snapshot, balance and counter experiments; the complete checkout/payment protocol is proposed. |
| [File storage and transfers](research/database-design/file-storage-and-transfers/How%20file%20platforms%20store%20transfer%20and%20isolate%20data.md) · [research log](research/database-design/file-storage-and-transfers/Research%20log.md) | Apply relationships, [membership](articles/25-tenant-membership.md) and [version checks](articles/30-conflicting-edits.md) to uploads, revisions, sharing and deletion. | Native database experiments; actual byte transfer and physical storage deletion remain unverified. |
| [Workflows and approvals](research/database-design/business-workflows-and-approvals/How%20business%20systems%20run%20workflows%20and%20approvals.md) · [research log](research/database-design/business-workflows-and-approvals/Research%20log.md) | Extend [transaction boundaries](articles/06-transaction-boundaries.md) and request replay to reviewed revisions, human decisions and external work. | Native model experiments; vendor acceptance and compensation are simulated. |
| [Identity, permissions and sharing](research/database-design/identity-permissions-and-sharing/How%20business%20apps%20model%20identity%20permissions%20and%20sharing.md) · [research log](research/database-design/identity-permissions-and-sharing/Research%20log.md) | Deepen [local access control](articles/23-database-roles.md), membership and the [authenticated-request route](articles/33-request-identity.md) through changing resource access. | PostgreSQL and SpiceDB experiments; real identity-provider integration remains unverified. |
| [Learning assessments and progress](research/database-design/learning-assessments-and-progress/How%20learning%20apps%20store%20practice%20feedback%20and%20progress.md) · [research log](research/database-design/learning-assessments-and-progress/Research%20log.md) | Apply [row identity](articles/09-row-identity.md), [reporting grain](articles/11-aggregate-grain.md), snapshots and version checks to attempts, feedback and corrections. | Native database experiments; evaluator judgments are controlled fixtures, not measured AI quality or learner improvement. |
| [Authenticated-access design](research/database-design/authenticated-access/Authenticated%20access%20-%20research%20and%20batch%20recommendation.md) · [source register](research/database-design/authenticated-access/Authenticated%20access%20-%20source%20register.md) · [implementation and lifecycle decisions](research/database-design/authenticated-access/Authenticated%20access%20-%20implementation%20decisions%20and%20lifecycle%20research.md) | Read the design behind lessons [33](articles/33-request-identity.md), [34](articles/34-authorized-requests.md) and [35](articles/35-authorized-replay.md), plus the proposed identity-lifecycle follow-up. | Lessons and fixtures are implemented as a repository-only checkpoint; real Auth/API, native concurrency, hosted and reader checks remain pending. |
| [AI practice and coaching](research/ai-practice-and-coaching/README.md) · [interim report](research/ai-practice-and-coaching/Report.md) · [research log](research/ai-practice-and-coaching/Research%20log.md) | Continue the learning-app journey from storing an evaluation to generating practice conversations, judgments and coaching. | Interim experiment bundle with offline tests and recorded failures; live model outputs remain pending. |

Each research log records its sources, executed checks and unverified extensions. SQL/model tests, real service integration and learner understanding are separate kinds of evidence; use the recorded limits when moving between a guide and a lesson.

## Real engineering, with attribution

The [source notebook](SOURCES.md#lesson-by-lesson-grounding-coverage) connects the lessons to reported engineering decisions: retries and migrations at Stripe, pagination at Shopify, metric definitions at Airbnb, duplicate delivery at Segment, and access checks at Nile. It also identifies practitioner demonstrations and lessons that use fictional exercises. All course datasets are synthetic; the coverage table explains what each example borrows and where the comparison ends.

This README was prepared with AI assistance. The course author should revise it after doing the labs; we do not invent personal experience or claim it was entirely human-written.

## For authors and maintainers

Readers can skip these records:

- [Teaching guide](AUTHORING.md) and [publication queue](PUBLICATION.md): how to develop and release lessons.
- [Curriculum audit](CURRICULUM_AUDIT.md): source-study cross-reference, added topics, and evidence requirements.
- [Repository evidence](REPOSITORY_EVIDENCE.md): historical provenance, not reader prerequisites.
- [File guide](NEW_FILES.md): what the repository's supporting files are for.

The SQL uses synthetic data in dedicated course schemas. Use a disposable learning database; setup scripts reset their named lab schemas. Labs 23–26 create dedicated cluster-wide roles and provide cleanup scripts. Drafts 33–35 create separate roles and provision recorded synthetic Auth accounts in a designated disposable project; see their [environment guide](supabase/README.md).
