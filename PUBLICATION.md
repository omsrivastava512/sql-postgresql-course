# Publication queue and working agreement

Author material. Readers use the [course map](COURSE_MAP.md) and [available drafts](README.md#available-drafts).

## Accepted direction

Standalone SQL/PostgreSQL course for programmers new to databases; connected short articles and separate labs; local PostgreSQL and Supabase setup routes; publish as the author learns. The clinic is one fictional setting. Real engineering accounts supply attributed comparisons, not invented experience.

The source-study objectives are a minimum baseline, documented in the [author audit](CURRICULUM_AUDIT.md). They do not define public module names, a fixed sequence, or the course's upper limit.

## Current package

Seven article drafts, six independent labs, and a curriculum of 132 topic groups with explicit evidence and gaps. The onramp and six mechanism-focused lessons are useful opening material; they do not complete the foundations or the course. All remain drafts.

The [first route](COURSE_MAP.md#the-first-route) remains usable now. The [beginner route](COURSE_MAP.md#the-beginner-route) identifies the missing foundations. Existing numbers and URLs stay stable.

## Next writing batch

Write these three foundation articles and separate labs next, one at a time. They are specifications, not files created in this pass. An article may publish independently once its own release checks pass.

| Working article question | Objectives and setting | Required experiment and transfer |
|---|---|---|
| What value did I actually store? | F04–F07, F15, Q05–Q07; a shop's product row | Compare omitted input, explicit NULL, empty text and a default; inspect stored values and predicate results. Transfer to a missing reservation contact. |
| Which rows did I ask for? | Q01, Q13–Q16, Q21; shop orders | Predict filtered and ordered results, break a tie deliberately, compare row filters with group filters, and inspect writes selected by WHERE. Transfer to a subscription report; introduce pagination and leave concurrent paging depth for later. |
| What identifies this row? | F08–F10, F14, F16, R03–R05; workspace members | Test primary keys and scoped duplicates, model a membership junction, distinguish at-most-one from existence, and reconnect to the FK draft. Transfer to customers joining loyalty programmes. |

For each: provide a worked example before the task, resettable synthetic setup, prediction feedback, accessible hints/solution, a return prompt and evidence-backed inventory updates. Use exact outcomes to keep the lesson short; split a draft if its single main question becomes unmanageable.

## Later branches

After foundations, build joins and grouping before ledger views and performance work. Then choose from the reader's actual question while respecting prerequisites:

- A dashboard total doubles: joins and grain, then views, windows and query plans.
- Two people reserve the same resource: transactions, locks, isolation and retry boundaries.
- A successful request loses its response: idempotency, payload comparison and concurrent duplicate requests.
- A user logs in but cannot see a row: identity, privileges, RLS, then invoker/definer and full request tracing.
- Yesterday's invoice changes with today's price: snapshots, exact money and time-dependent rules.
- An application needs a new field: migration history, backfill, compatibility, locks and restore rehearsal.

Use the [full inventory](TOPIC_INVENTORY.md) for less visible objectives; this queue is a writing priority, not a replacement syllabus.

## Before each article goes public

- Check its stated prerequisites, scope labels, prediction feedback and changed-context answer.
- Run setup twice, then solution and relevant failure cases from a fresh state. Record exact objectives tested.
- Execute on local PostgreSQL and hosted Supabase; record engine, role, date and outcomes. Hosted testing remains deferred by request, so affected articles remain drafts. Embedded tests do not satisfy these two gates.
- Check source attribution, dates, narrow company claims and local links.
- Have the author do the lab and revise in their own voice; retain assistance/source attribution.
- Ask a new reader to follow the material without private conversations and explain a changed example. Record confusion and revise the relevant passage.

Publishing a site, selecting a license, or changing GitHub visibility requires a separate release decision. The course repository remains private. The original clinic application and private study records are not part of the public course export; review author provenance before any export.

## Learning feedback

After a gap, record a prediction, observed result, explanation and remaining uncertainty. Use this to improve a passage or exercise. A passing SQL test does not prove reader understanding, and a reader's success on one example is not universal mastery.
