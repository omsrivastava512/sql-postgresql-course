# Publication queue and working agreement

Author material. Readers use the [course map](COURSE_MAP.md) and [available drafts](README.md#available-drafts).

## Accepted direction

Standalone SQL/PostgreSQL course for programmers new to databases; connected short articles and separate labs; local PostgreSQL and Supabase setup routes; publish as the author learns. The clinic is one fictional setting. Real engineering accounts supply attributed comparisons, not invented experience.

The source-study objectives are a minimum baseline, documented in the [author audit](CURRICULUM_AUDIT.md). They do not define public module names, a fixed sequence, or the course's upper limit.

## Current package

Eighteen article drafts, seventeen independent labs, and a curriculum of 132 topic groups with explicit evidence and gaps. The onramp, six mechanism-focused lessons, three foundation lessons, six query/reporting lessons and two concurrency/migration pilots are drafted; further foundations and later routes remain unfinished. All remain drafts.

The [first route](COURSE_MAP.md#the-first-route) remains usable now. The [beginner route](COURSE_MAP.md#the-beginner-route) connects the available foundations and identifies the missing steps. Existing numbers and URLs stay stable.

## First foundation batch

Drafted 2026-10-20 using the existing article/lab structure. Embedded execution passed; supported-environment and reader trials remain release gates. An article may publish independently once its own checks pass.

| Working article question | Objectives and setting | Required experiment and transfer |
|---|---|---|
| [What value did I actually store?](articles/07-stored-values.md) | F04–F07, F15, Q05–Q07; a shop's product row | Compare omitted input, explicit NULL, empty text and a default; inspect stored values and predicate results. Transfer to a missing reservation contact. |
| [Which rows did I ask for?](articles/08-selecting-rows.md) | Q01, Q13–Q14, Q16, Q21; shop orders | Predict filtered and ordered results, break a tie deliberately and inspect writes selected by WHERE. Group filters (Q15) follow grouping in the next batch. Transfer to a subscription report; introduce pagination and leave concurrent paging depth for later. |
| [What identifies this row?](articles/09-row-identity.md) | F08–F10, F14, F16, R03–R05; workspace members | Test primary keys and scoped duplicates, model a membership junction, distinguish at-most-one from existence, and reconnect to the FK draft. Transfer to customers joining loyalty programmes. |

For each: provide a worked example before the task, resettable synthetic setup, prediction feedback, accessible hints/solution, a return prompt and evidence-backed inventory updates. Use exact outcomes to keep the lesson short; split a draft if its single main question becomes unmanageable.

## Query and data-handoff batch — 2026-10-20

The second implementation batch is drafted in six connected article/lab pairs:

| Draft | Concrete outcome and changed setting |
|---|---|
| [Joins](articles/10-joins.md) | Preserve unmatched customers, distinguish creator/assignee roles; transfer to active club memberships. |
| [Aggregate grain](articles/11-aggregate-grain.md) | Repair multiplied order totals; transfer to usage and receipts. |
| [Query shapes](articles/12-query-shapes.md) | Exercise scalar cardinality, existence, sets and CTEs; transfer to workspace events. |
| [Windows](articles/13-window-questions.md) | Test ties, frames, latest rows and previous values; transfer to meter readings. |
| [Reusable reports](articles/14-reusable-reports.md) | Define a monthly metric, rerun periods, test refunds and denominators; independently report account usage. |
| [Data handoff](articles/15-data-handoff.md) | Parse a retained CSV, record rejections, reconcile facts, replay safely under a single-session policy and test conflicting keys. |

Embedded checks passed 252 assertions across fifteen labs. Actual CSV import, replay and export/re-import were separately checked with the embedded engine. These are draft-execution results; local PostgreSQL, hosted and reader trials remain open.

## Concurrency and migration pilots — 2026-10-21

| Draft | Concrete outcome and changed setting |
|---|---|
| [Competing claims](articles/16-competing-claims.md) | Reproduce a stale decision, repair it with a conditional claim, observe commit/rollback waits, compare a locking read and restart after 40001; transfer to limited seats. |
| [Compatible change](articles/17-compatible-change.md) | Add a field, interrupt and resume a backfill, preserve old/new SQL callers, roll back failed validation and retry a timed-out schema step; transfer to different historical/new job limits. |

Local PostgreSQL 17.11 passed 270 assertions across seventeen lab suites and 100 additional live-session assertions, also run in reverse suite order. Embedded execution passed the same 270 single-session assertions. The approved temporary native Windows server uses no hosted resources. Hosted execution, Docker setup and reader trials remain unverified. See [verification](VERIFICATION.md).

The migration pilot is one additive change, with a short attributed Stripe comparison. It does not implement a full deployment pipeline, rename/removal bridge or backup restore. The concurrency pilot has no HTTP retry store or external effects. These boundaries keep each learning question concrete.

## Later branches

The query, concurrency and bounded migration pilots now have drafts and execution evidence, but no human learning-time or comprehension evidence. Next, have the author attempt these pilots and record effort, help and wrong predictions. Use that evidence to choose the next implementation batch; do not equate passing reference SQL with mastery. Continue broader implementation according to prerequisites:

- A correct report is slow: query plans and measured index choices, building on the new joins, views and windows.
- Two workflows acquire several resources: deadlocks, lock ordering and optimistic version checks, building on the claim pilot.
- A successful request loses its response: idempotency, payload comparison and concurrent duplicate requests.
- A user logs in but cannot see a row: identity, privileges, RLS, then invoker/definer and full request tracing.
- Yesterday's invoice changes with today's price: snapshots, exact money and time-dependent rules.
- An application replaces an old representation: extend the additive pilot to staged compatibility, removal and a separate restore rehearsal.

Use the [full inventory](TOPIC_INVENTORY.md) for less visible objectives; this queue is a writing priority, not a replacement syllabus.

## Before each article goes public

- Check its stated prerequisites, scope labels, prediction feedback and changed-context answer.
- Run setup twice, then solution and relevant failure cases from a fresh state. Record exact objectives tested.
- Execute on local PostgreSQL and hosted Supabase; record engine, role, date and outcomes. Local native execution is now recorded. Supabase MCP is connected, but no dedicated course project was used; hosted verification remains open. Embedded tests do not satisfy these two gates.
- Check source attribution, dates, narrow company claims and local links.
- Have the author do the lab and revise in their own voice; retain assistance/source attribution.
- Ask a new reader to follow the material without private conversations and explain a changed example. Record confusion and revise the relevant passage.

Publishing a site, selecting a license, or changing GitHub visibility requires a separate release decision. The course repository remains private. The original clinic application and private study records are not part of the public course export; review author provenance before any export.

## Learning feedback

After a gap, record a prediction, observed result, explanation and remaining uncertainty. Use this to improve a passage or exercise. A passing SQL test does not prove reader understanding, and a reader's success on one example is not universal mastery.
