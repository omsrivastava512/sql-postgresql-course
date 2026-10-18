# Teaching and editorial guide

## The reader's job

A reader should be able to predict an outcome, observe it, explain the mechanism, and apply it to a changed example. Reading a definition is the start, not the evidence that this has happened.

Keep the learner's attention on one main question. A short article can contain several related concepts if splitting them would make the explanation harder.

## Voice

Write as someone working through a concrete problem with another person. Begin with the row, request, or error that creates the question. Use names and small numbers. Define a term when it first earns its place.

Prefer "the visit still points to patient 10" over "the child retains referential integrity." Introduce the formal term afterward so the reader can recognize it in documentation.

Do not manufacture conversations, war stories, personal experience, or quotes. A named author's company account is evidence of that author's reported experience, not proof that every professional backend uses the same pattern. Older articles get dates and historical context.

Do not imitate an engineer's distinctive prose. Summarize a narrow lesson in our own words, cite it, and send readers to the original. A relevant source beats three decorative brand names.

## Article contract

Each article contains:
1. A concrete opening and an observable learning outcome.
2. A worked example with initial rows, action, and result.
3. A prediction and feedback, with a linked runnable lab.
4. A boundary or counterexample, then a changed-context exercise.
5. A return note and explained links: requires, related, applied in, revisited in.

Expose the whole mechanism before compressing it. Syntax, behavior, and architecture are different levels: connect them explicitly.

Use one local concept map or small table when useful. Avoid dumping the entire course graph into every article.

## Practice and memory

Show a complete example before asking a beginner to modify it. Reduce assistance across subsequent tasks. Give hints in increasing detail; keep the solution available without a timer or gate.

Bring earlier concepts into later problems. After basic practice, mix problems that require selecting the appropriate rule. Do not interleave a pile of unexplained new mechanisms.

Offer reviews at the next study session, around a week later, and around a month later. These are flexible defaults, not optimal scientific intervals. Ask why, what changes, and what would fail. A changed-context task helps test whether the concept transfers.

The [IES practice guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) supports spacing and combining examples with problems. [Karpicke and Blunt (2011)](https://pubmed.ncbi.nlm.nih.gov/21252317/) found benefits from retrieval on conceptual questions in their science-text experiments. Neither establishes that our particular course, graph, or review schedule is effective. We will evaluate that with actual reader attempts.

## Standalone scope and labels

Teach one complete question without requiring the source application, private conversations or historical study numbering. Supply every table, row and rule needed to understand the example. Repository provenance and the source-study cross-reference belong in author records, never in a reader's prerequisites.

Label the scope of each explanation: **General SQL idea**, **PostgreSQL behaviour**, or **Supabase integration**. A lesson can contain more than one, but name the boundary where it changes. Portability is a separate claim requiring another database's evidence. Existing article scopes are indexed in the course map.

Keep the clinic as one fictional case study. Use shops, reservations, subscriptions, libraries and team workspaces for changed-context practice. The [course map](COURSE_MAP.md#follow-a-question-across-settings) assigns first encounters and returns; every new route must have a transfer prompt, feedback and a later retrieval prompt. A company account must be attributed and clearly separated from our synthetic examples.

Use the [inventory's evidence rules](TOPIC_INVENTORY.md#how-to-read-coverage): planned, introduced, explained and practised describe an exact objective, not a whole bundled topic or a learner's mastery. Link the relevant section/task when changing a status. Record execution environment and outcome separately in the verification record.

## Evidence and publication

Every technical claim needs an executed example or an authoritative reference. Every company anecdote needs the original account, attribution, date, and a clear limit on the inference.

Label repository material: existing SQL, historical discussion, proposal, or teaching example. Do not convert an unresolved discussion into a universal recommendation.

A public reader must not need private chats, the clinic repository, or real patient data. Keep the repository cross-reference in author materials.

Release an article only after its lab passes in local PostgreSQL and Supabase and a reader can follow it without additional spoken instructions. Record failed attempts as useful evidence; do not silently redefine completion as page views or a quiz score.

