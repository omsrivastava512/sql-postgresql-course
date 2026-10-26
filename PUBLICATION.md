# Publication queue and working agreement

Author material. Readers use the [course map](COURSE_MAP.md) and [available lessons](README.md#available-lessons).

## Accepted direction

Standalone SQL/PostgreSQL course for programmers new to databases; connected short articles and separate labs; local PostgreSQL and Supabase setup routes; publish as the author learns. The clinic is one fictional setting. Real engineering accounts supply attributed comparisons, not invented experience.

The source-study objectives are a minimum baseline, documented in the [author audit](CURRICULUM_AUDIT.md). They do not define public module names, a fixed sequence, or the course's upper limit.

## Current package

The current collection contains twenty-seven lesson articles, twenty-six independent labs, and a curriculum of 132 topic groups with explicit evidence and gaps. It includes the onramp, six mechanism-focused lessons, three foundation lessons, six query/reporting lessons, two concurrency/migration pilots, five practical performance lessons and four PostgreSQL access lessons. Further foundations and later routes remain unwritten. The existing lessons are written, but the collection is still in editorial development: human learner trials, supported-environment checks and release work remain open.

The [first route](COURSE_MAP.md#the-first-route) remains usable now. The [beginner route](COURSE_MAP.md#the-beginner-route) connects the available foundations and identifies the missing steps. Existing numbers and URLs stay stable.

## First foundation batch

Written 2026-10-20 using the existing article/lab structure. Embedded execution passed; supported-environment and reader trials remain release gates. An article may publish independently once its own checks pass.

| Working article question | Objectives and setting | Required experiment and transfer |
|---|---|---|
| [What value did I actually store?](articles/07-stored-values.md) | F04–F07, F15, Q05–Q07; a shop's product row | Compare omitted input, explicit NULL, empty text and a default; inspect stored values and predicate results. Transfer to a missing reservation contact. |
| [Which rows did I ask for?](articles/08-selecting-rows.md) | Q01, Q13–Q14, Q16, Q21; shop orders | Predict filtered and ordered results, break a tie deliberately and inspect writes selected by WHERE. Group filters (Q15) follow grouping in the next batch. Transfer to a subscription report; introduce pagination and leave concurrent paging depth for later. |
| [What identifies this row?](articles/09-row-identity.md) | F08–F10, F14, F16, R03–R05; workspace members | Test primary keys and scoped duplicates, model a membership junction, distinguish at-most-one from existence, and reconnect to the foreign-key lesson. Transfer to customers joining loyalty programmes. |

For each lesson: provide a worked example before the task, resettable synthetic setup, prediction feedback, accessible hints/solution, a return prompt and evidence-backed inventory updates. Keep its main question manageable; split it if it becomes too broad.

## Query and data-handoff batch — 2026-10-20

The second implementation batch contains six connected article/lab pairs:

| Lesson | Concrete outcome and changed setting |
|---|---|
| [Joins](articles/10-joins.md) | Preserve unmatched customers, distinguish creator/assignee roles; transfer to active club memberships. |
| [Aggregate grain](articles/11-aggregate-grain.md) | Repair multiplied order totals; transfer to usage and receipts. |
| [Query shapes](articles/12-query-shapes.md) | Exercise scalar cardinality, existence, sets and CTEs; transfer to workspace events. |
| [Windows](articles/13-window-questions.md) | Test ties, frames, latest rows and previous values; transfer to meter readings. |
| [Reusable reports](articles/14-reusable-reports.md) | Define a monthly metric, rerun periods, test refunds and denominators; independently report account usage. |
| [Data handoff](articles/15-data-handoff.md) | Parse a retained CSV, record rejections, reconcile facts, replay safely under a single-session policy and test conflicting keys. |

Embedded checks passed 252 assertions across fifteen labs. Actual CSV import, replay and export/re-import were separately checked with the embedded engine. These are reference-execution results; local PostgreSQL, hosted and reader trials remain open.

## Concurrency and migration pilots — 2026-10-21

| Lesson | Concrete outcome and changed setting |
|---|---|
| [Competing claims](articles/16-competing-claims.md) | Reproduce a stale decision, repair it with a conditional claim, observe commit/rollback waits, compare a locking read and restart after 40001; transfer to limited seats. |
| [Compatible change](articles/17-compatible-change.md) | Add a field, interrupt and resume a backfill, preserve old/new SQL callers, roll back failed validation and retry a timed-out schema step; transfer to different historical/new job limits. |

Local PostgreSQL 17.11 passed 270 assertions across seventeen lab suites and 100 additional live-session assertions, also run in reverse suite order. Embedded execution passed the same 270 single-session assertions. The approved temporary native Windows server uses no hosted resources. Hosted execution, Docker setup and reader trials remain unverified. See [verification](VERIFICATION.md).

The migration pilot is one additive change, with a short attributed Stripe comparison. It does not implement a full deployment pipeline, rename/removal bridge or backup restore. The concurrency pilot has no HTTP retry store or external effects. These boundaries keep each learning question concrete.

## Practical performance batch — 2026-10-21

| Lesson | Concrete outcome and changed setting |
|---|---|
| [Query plans](articles/18-query-plans.md) | Preserve exact results while reading estimates, actual rows, loops and buffers; transfer customer lookup diagnosis to deliveries. |
| [Index decisions](articles/19-index-decisions.md) | Compare single/composite/partial/covering candidates, enforce scoped uniqueness and measure write/storage costs; transfer to project tickets. |
| [Deep pages](articles/20-deep-pages.md) | Compare matching offset/cursor pages, preserve ties and inspect changed sort values; transfer to descending channel messages. |
| [Statistics and maintenance](articles/21-statistics-maintenance.md) | Refresh estimates after distribution changes, distinguish vacuum cleanup and observe a retained snapshot; transfer to queued mail. |
| [Request work](articles/22-request-work.md) | Compare 31/2/1 database calls with equal nested results, bind input and observe a pool checkout wait; transfer to active-project task counts. |

The user selected this branch after the concurrency/migration pilots. It follows the accepted performance scope, including pagination, maintenance, pooling and N+1/query counts. It uses the existing pg dependency, a supplied request module and a separate native checker; no framework, dependency or runner refactor was introduced.

Embedded and native PostgreSQL passed 301 reference assertions. Native PostgreSQL 17.11 passed 107 further checks with measured plans, repeated observations, write/storage comparisons and actual snapshot/pool behaviour. Reverse suite order and the learner request command also passed. Results and limits belong in [verification](VERIFICATION.md); no fixed speedup is a mastery claim.

## PostgreSQL access-control batch — 2026-10-26

| Lesson | Concrete outcome and changed setting |
|---|---|
| [Database roles](articles/23-database-roles.md) | Test schema/table/column/sequence grants separately from a profile label; transfer support permissions to dispatch. |
| [Row policies](articles/24-row-policies.md) | Test allowed/forbidden CRUD, implicit checks and policy composition; transfer document ownership to messages. |
| [Tenant membership](articles/25-tenant-membership.md) | Enforce member/read-only/nonmember rights, protect membership changes and reject cross-tenant references; transfer to clinic branches. |
| [Privileged code](articles/26-privileged-code.md) | Compare owner/caller access, repair a broad view/function and temporary-name shadowing; transfer to a restricted delivery lookup. |

The user authorized the next researched batch after performance. This completes a bounded PostgreSQL access foundation using the existing dependencies, ordinary reference cases and a separate actual-login checker. It does not complete the Supabase identity/API route. Administrative fixtures require a disposable local cluster; no hosted resource, dependency or framework was introduced.

The [verification record](VERIFICATION.md) separates role-switched SQL from actual password-authenticated restricted connections, including rejected role switches and the membership snapshot limit. One AWS engineering reference supplies a narrow comparison; the labs remain original synthetic examples. Human learning trials are pending.

## Later branches

The query, concurrency, bounded migration, performance and access lessons have execution evidence, but no human learning-time or comprehension evidence. Have the author attempt them and record effort, help and wrong predictions before publication. Use that evidence when choosing further batches; do not equate passing reference SQL with mastery. Remaining work can be grouped as follows; these groups are scheduling units, not promises that one article covers each group:

| Remaining group | Practical deliverable |
|---|---|
| Authenticated application access | Verified login/JWT identity, auth accounts versus profiles, Supabase auth.uid()/SQL-editor distinctions, Data API exposure, onboarding boundaries and complete allowed/denied request traces. Builds on labs 23–26. |
| Reliable application operations | Multi-resource deadlocks/order, optimistic version checks, savepoints, bounded retries, idempotency keys/payload matching, simultaneous duplicates and lost-response replay. |
| Modelling and historical meaning | Requirements-to-schema choices, functional dependencies/update anomalies, remaining relationship rules, type selection, exact amounts, calendars and intentional historical snapshots. Catalog research is evidence to evaluate, not an implemented lesson or private-company schema guarantee. |
| Targeted SQL/rule depth | Remaining useful JSON/array, recursive-query, generated-value, function/trigger-event and lifecycle-rule objectives, each tied to a concrete feature rather than engine internals. |
| Change and recovery | Inherited-schema/data repair, broader compatibility/removal changes, interruption/reconciliation and a backup restored into a fresh target with data/permission checks. |
| Integration and release | Capstone checkpoints and changed-domain assessment, deployed workload diagnosis where needed, supported hosted/Docker verification and author/new-reader learning trials. Specialized extensions remain optional and demand-driven. |

Use the [full inventory](TOPIC_INVENTORY.md) for less visible objectives; this queue is a writing priority, not a replacement syllabus.

## Before each article goes public

- Check its stated prerequisites, scope labels, prediction feedback and changed-context answer.
- Run setup twice, then solution and relevant failure cases from a fresh state. Record exact objectives tested.
- Execute on local PostgreSQL and hosted Supabase; record engine, role, date and outcomes. Local native execution is recorded. Access labs currently require local administrative fixtures; their hosted adaptation must be designed and verified before meeting this existing release gate. Supabase MCP being connected is not a dedicated course test run. Embedded tests do not satisfy these two gates.
- Check source attribution, dates, narrow company claims and local links.
- Have the author do the lab and revise in their own voice; retain assistance/source attribution.
- Ask a new reader to follow the material without private conversations and explain a changed example. Record confusion and revise the relevant passage.

Publishing a site, selecting a license, or changing GitHub visibility requires a separate release decision. The 2026-10-26 preflight found this repository already public; this batch did not change its visibility. The original clinic application and private study records are not part of the course export; review author provenance before any further export. Repository visibility does not establish that the teaching-release checks above have passed.

## Learning feedback

After a gap, record a prediction, observed result, explanation and remaining uncertainty. Use this to improve a passage or exercise. A passing SQL test does not prove reader understanding, and a reader's success on one example is not universal mastery.
