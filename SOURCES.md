# Source notebook

Initial notebook checked 2026-10-17; collection-wide grounding revision checked 2026-10-27. Sources are selected for a specific teaching purpose. "Read" means the original page was opened and its relevant passage inspected; it does not mean every code claim has been independently reproduced. The dated sections retain earlier research decisions; the coverage table below records current use.

## Firsthand engineering accounts

| Source | Attribution and date | Use in this course | What not to infer |
|---|---|---|---|
| [Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency) | Brandur Leach, Stripe, 2017-02-22; read | Article 06: a lost response can leave the caller uncertain after a successful operation. | A database transaction alone cannot deduplicate arbitrary retries; this historical article is not the current API specification. |
| [Herding elephants: Lessons learned from sharding Postgres at Notion](https://www.notion.com/blog/sharding-postgres-at-notion) | Garrett Fidalgo, Notion, 2021-10-06; read | Removed from lesson 01 in this revision: too distant from the basic FK guarantee. Retained here as a research record. | Our clinic needs sharding, or its relationships reproduce Notion's schema. |
| [Partitioning GitHub's relational databases to handle scale](https://github.blog/engineering/infrastructure/partitioning-githubs-relational-databases-scale/) | GitHub Engineering, 2021; read | Removed from lesson 02: a database-boundary account did not explain the trigger's missing write paths. | MySQL behavior is interchangeable with PostgreSQL, or GitHub's scale is a beginner requirement. |
| [Soft Deletion Probably Isn't Worth It](https://brandur.org/soft-deletion) | Brandur Leach, personal engineering account, 2022-07-19; read | Article 04: retaining a deleted marker changes the work required of queries and relationships. | Soft deletion is always wrong, or a medical retention policy follows from this essay. |
| [Easy, alternative soft deletion: deleted_record_insert](https://brandur.org/fragments/deleted-record-insert) | Brandur Leach, 2022-12-28; read | Article 03: a concrete reported use of AFTER DELETE triggers. | The author uses our owner-derivation trigger, or our sample is production-ready security code. |
| [Zero-downtime Postgres migrations — the hard parts](https://gocardless.com/blog/zero-downtime-postgres-migrations-the-hard-parts/) | Chris Sinjakli, GoCardless; page says last edited June 2024, account discusses older PostgreSQL versions; read | Future migration lab: a quick DDL change can still wait on locks and disrupt requests. | Historical lock modes or table-rewrite advice describe current PostgreSQL unchanged. Recheck the target version. |
| [Postmortem of database outage of January 31](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/) | GitLab engineering incident account, 2017-02-10; read | Future operations article: restoring a backup is a separate capability from transaction rollback. | The course's DELETE lab reproduces this filesystem-level incident. |
| [Online migrations at scale](https://stripe.com/blog/online-migrations) | Jacqueline Xu, Stripe, 2017-02-02; read 2026-10-21 | Article 17: separate compatibility, backfill, read transition and eventual removal; our additive exercise adapts staging and reconciliation. | Our exercise reproduces Stripe's architecture, scale or dual-write transition. It does not replace an existing field. |
| [Paginating requests in APIs using relative cursors](https://shopify.engineering/pagination-relative-cursors) | Drew Martin, Shopify, 2019-08-12; reread 2026-10-26 | Article 20: catalog traversal, connection pressure, cursor navigation trade-offs and the external-client transition. | The account predates full adoption. Our PostgreSQL measurements do not establish Shopify's production outcome or a general speedup. |
| [Multi-tenant data isolation with PostgreSQL Row Level Security](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) | Michael Beardsley, AWS Database Blog, 2020-05-18; read 2026-10-26 | Article 25: centralized tenant checks and the danger of testing through an owner connection. | This is an engineering demonstration, not a production incident report. A caller-writable session setting is not proof of authenticated identity; our membership fixture is not AWS's implementation. |

### Catalog design evidence inspected for lessons 27–29

| Primary source | Passage used | Teaching decision and limit |
|---|---|---|
| [Instacart, Catalog Localization](https://company.instacart.com/tech-innovation/catalog-localization-more-than-just-a-translation), company engineering account, 2022-01-11 | The catalog structure and localization sections distinguish product, retailer and store attributes and explain why price can be independent of language. | Lesson 28 asks who sets each value and tests a change confined to one store. Tea, weights, local SKUs and constraints are course fixtures. Lesson 27 uses a fictional rename to isolate the dependency. |
| [Saleor project, OrderLine model](https://github.com/saleor/saleor/blob/5acd08ffe7389d7323344dd3e1398d8a46367919/saleor/order/models.py#L567), source code at revision 5acd08f, inspected 2026-11-02 | OrderLine combines names, SKU and monetary fields with a nullable variant foreign key using SET_NULL. | Lesson 29 tests an analogous separation with a store offer, integer paise and an explicit sale write. The code establishes field choices. The deletion scenario and its motivation are our exercise. |

Use the space needed to explain the relevant problem, choice, trade-off and consequence, within source-use limits. A developed case must affect the reasoning or work the learner performs; a brief connection must be labelled as such in the coverage record. Do not retell an entire source or copy company code for appearance. The [authoring guide](AUTHORING.md#investigate-the-engineering-problem) requires investigation while allowing a clearly fictional example when it teaches better.

## Additional originals inspected — 2026-10-27

These entries identify the inspected passage and its use, not independent validation of a company's outcome. All course datasets remain synthetic. Source categories deliberately separate firsthand operational accounts from constructed demonstrations and advisories.

| Original source | Author/date and evidence type | Inspected focus and boundary |
|---|---|---|
| [Trigger constraints](https://www.cybertec-postgresql.com/en/triggers-to-enforce-constraints/) | Laurenz Albe, CYBERTEC, April 2019; practitioner demonstration | Concurrent check failure; lesson 02 uses the question, not a complete concurrency repair. |
| [Deferring constraints](https://hashrocket.com/blog/posts/deferring-database-constraints) | Joshua Davey, Hashrocket, 2013-08-22; practitioner walkthrough | Reordering and explicit deferral; our FK experiment uses a different constraint. |
| [Sequences and commit order](https://blog.sequinstream.com/postgres-sequences-can-commit-out-of-order/) | Anthony Accomazzo, Sequin, 2024-07-23; firsthand investigation | Allocation versus visibility; synthetic schedule, no streaming implementation. |
| [Join duplicates and misses](https://alexpetralia.com/2017/07/19/more-dangerous-subtleties-of-joins-in-sql/) | Alex Petralia, 2017-07-19; practitioner examples | Missing and multiplied amounts; no named production incident claimed. |
| [LEFT JOIN versus UNION ALL](https://www.crunchydata.com/blog/postgres-query-optimization-left-join-vs-union-all) | David Christensen, Crunchy Data, 2022-05-20; client optimization account | Matched/unmatched branches; local adaptation verifies semantics, not a performance gain. |
| [Finding user sessions](https://mode.com/blog/finding-user-sessions-sql/) | Benn Stancil, Mode, 2015-03-20; practitioner analysis | Previous-event comparison; invented three-event trace, historical portability remarks excluded. |
| [Metric consistency at Airbnb](https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70) | Amit Pahwa, Robert Chang and colleagues, 2021-04-30; company account | Conflicting definitions and shared consumption; no Minerva architecture reproduced. |
| [Exactly-once delivery](https://segment.com/blog/exactly-once-delivery/) | Amir Abu Shareb, Segment, 2017-06-29; company account, now hosted by Twilio | Duplicate delivery identity; bounded source guarantee, single-session CSV adaptation. |
| [Race conditions](https://engineering.kraken.tech/news/2025/01/20/mysql-race-conditions.html) | Kraken Engineering, 2025-01-20; operational context and constructed example | Concurrent interval checks; MySQL remedies are not evidence for our PostgreSQL claim. |
| [Partial indexes](https://www.heap.io/blog/speeding-up-postgresql-queries-with-partial-indexes) | Dan Robinson, Heap, 2014-12-10; synthetic benchmark walkthrough | Rare-event predicate and index costs; no copied performance numbers or production claim. |
| [Job queues and MVCC](https://brandur.org/postgres-queues) | Brandur Leach, 2015-05-18; production account plus controlled reproduction | Long transaction and cleanup investigation; local lab omits replication and throughput claims. |
| [Two-phase load and render](https://brandur.org/two-phase-render) | Brandur Leach, 2024-05-28; firsthand implementation essay | Collection loading versus rendering; our existing JavaScript response stays unchanged. |
| [Shipping RLS at Nile](https://www.thenile.dev/blog/multi-tenant-rls) | Miki Pokryvailo, 2022-07-26; company implementation account | Wrong connection role and stale request context; not evidence that our fixture authenticates website users. |
| [CVE-2018-1058 guide](https://wiki.postgresql.org/wiki/A_Guide_to_CVE-2018-1058:_Protect_Your_Search_Path) and [advisory](https://www.postgresql.org/support/security/CVE-2018-1058/) | PostgreSQL project; security release 2018-03-01 | Historical name-resolution risk; not a breach report or current-default claim. |

Also inspected [Feature Casualties of Large Databases](https://brandur.org/large-database-casualties) (Brandur Leach, 2020-12-01). Its broad scaling trade-offs did not improve the beginner FK lesson, so no new excerpt was inserted. Searches around missing values and simple filtering found demonstrations and broader analytical problems rather than a close firsthand account of our exact fixtures. Those lessons retain small counterexamples and connect forward to developed cases. This is a research limitation, not a claim that no relevant account exists.

## Lesson-by-lesson grounding coverage

**Developed account** means a firsthand source informs the problem and subsequent decision, trace or exercise. **Worked demonstration** develops a practitioner's constructed example or experiment without calling it a production case. **Brief connection** links a source to one relevant boundary. **Fictional exercise** has no claimed external provenance. **Advisory connection** is official security context, not incident experience. Every category can contain original synthetic practice; these labels describe grounding, not mastery or publication readiness.

| Lesson | Grounding and source or limitation | Substantive revision or reason to preserve |
|---|---|---|
| [00 Reading examples](articles/00-reading-the-examples.md) | Fictional exercise; no company case needed for basic syntax | Distinguishes beginner and relationship routes; makes fictional provenance explicit. |
| [01 Foreign keys](articles/01-foreign-keys.md) | Fictional exercise; Notion and the scaling essay were too distant | Replaces the brand aside with screen/import writer comparison and existence-versus-eligibility prediction. |
| [02 Business rules](articles/02-business-rules.md) | Brief connection: CYBERTEC demonstration | Replaces GitHub aside with an operation inventory; separates unobserved events from concurrent decisions. |
| [03 Derived values](articles/03-derived-values.md) | Brief connection: Leach's deletion-trigger account | Uses OLD/NEW and event choice to test attachment reasoning; preserves the repaired ownership trace. |
| [04 Deletion](articles/04-deleting-related-rows.md) | Developed account: Leach on soft deletion | Compares desired outcomes, readers and cleanup duties before choosing a policy; no retention-law claim. |
| [05 Deferred checks](articles/05-deferred-checks.md) | Worked demonstration: Hashrocket | Explains a reason for temporary invalidity and compares parent-first loading with deferred validation. |
| [06 Transactions](articles/06-transaction-boundaries.md) | Developed account: Stripe idempotency | Adds an observation/knowledge table and a lost-response decision prompt; no API implementation claim. |
| [07 Stored values](articles/07-stored-values.md) | Fictional exercise; no close firsthand inventory account selected | Adds a reorder decision distinguishing quantity from whether it is known; preserves the physical-count repair. |
| [08 Selection](articles/08-selecting-rows.md) | Brief connection forward to Shopify in 20 | Carries the two-page prediction into the later navigation trade-off without importing API prerequisites. |
| [09 Identity](articles/09-row-identity.md) | Developed account: Sequin | Adds a four-step synthetic commit-order counterexample and explains why uniqueness does not fix a reader's cursor. |
| [10 Joins](articles/10-joins.md) | Brief connection: Petralia demonstration | Makes unmatched-row inspection a prerequisite to interpreting a summed amount. |
| [11 Aggregate grain](articles/11-aggregate-grain.md) | Brief connection: Petralia demonstration | Opens with independently established control totals; preserves the equal-amount DISTINCT counterexample. |
| [12 Query shapes](articles/12-query-shapes.md) | Developed account: Crunchy Data client optimization | Adds a runnable branch-equivalence example, multiplicity check and ordering boundary; clarifies highest-ID address policy. |
| [13 Windows](articles/13-window-questions.md) | Worked demonstration: Mode | Traces previous events and gap-policy decisions before returning to meter readings; no sessionization subsystem added. |
| [14 Reports](articles/14-reusable-reports.md) | Developed account: Airbnb | Connects shared definitions to handoff interpretation; adds the missing complete CREATE VIEW bridge. |
| [15 Data handoff](articles/15-data-handoff.md) | Developed account: Segment | Connects delivery identity to L1/L2, traces normalization/versions/occurrence/decision, and separates two conflict scenarios. |
| [16 Competing claims](articles/16-competing-claims.md) | Brief connection: Kraken's operational example | Distinguishes a shared stock row from a multirow interval rule; rejects the inference that one statement alone prevents races. |
| [17 Compatible change](articles/17-compatible-change.md) | Developed account: Stripe migration | Moves staging into the opening and adds evidence gates before each transition; preserves all repaired session instructions. |
| [18 Query plans](articles/18-query-plans.md) | Measured fictional exercise; no firsthand production case substituted | Unchanged: the captured, annotated native plan already supplies concrete evidence. Source-backed rewriting decisions in 12 lead here. |
| [19 Index choices](articles/19-index-decisions.md) | Worked demonstration: Heap | Frames subset indexing as a workload/cost choice and changes the queue requirement to test the candidate's limits. |
| [20 Deep pages](articles/20-deep-pages.md) | Developed account: Shopify | Unchanged: prior revision already connects the operational problem, navigation trade-off, rollout and measured synthetic fixture. |
| [21 Maintenance](articles/21-statistics-maintenance.md) | Developed account: Leach's queue investigation | Contrasts two diagnoses and maps the snapshot experiment to a bounded part of the reported problem. |
| [22 Request work](articles/22-request-work.md) | Developed account: Leach's implementation essay | Traces 31/2/1 calls, empty arrays and the load/assembly boundary; names the actual JavaScript prerequisite. |
| [23 Roles](articles/23-database-roles.md) | Fictional exercise with brief forward connection to Nile | Carries identity evidence into later policy tests; no company provenance assigned to the admin-labelled profile. |
| [24 Row policies](articles/24-row-policies.md) | Developed account: Nile | Makes connection identity and allowed/denied comparisons part of the policy-validation reasoning. |
| [25 Membership](articles/25-tenant-membership.md) | Brief connections: Nile; AWS demonstration | Separates request-context reuse from membership correctness; preserves the repaired snapshot workflow. |
| [26 Privileged code](articles/26-privileged-code.md) | Advisory connection: PostgreSQL security guide | Adds historical motivation and bounded catalog queries; repairs function-reading prerequisites. No breach reproduction claim. |
| [27 Product variants](articles/27-product-variants.md) | Fictional repair | An approved name resolves the conflicting rows. Keys come from stated pack rules. |
| [28 Store offers](articles/28-store-offers.md) | Developed account from Instacart | Local price and availability determine where the learner puts each fact and which rows a reprice changes. |
| [29 Order snapshots](articles/29-order-snapshots.md) | Open-source implementation evidence from Saleor | Historical fields beside an optional reference motivate a rename, reprice and deletion experiment. |
| [30 Conflicting edits](articles/30-conflicting-edits.md) | [Vasyl Zakharchenko, Forge SQL demonstration, 2025-07-07](https://www.atlassian.com/blog/development/reliable-data-storage-using-optimistic-locking-in-forge-sql) | Two editors submit a decision made against the same revision. Adapt the reload decision to shop prices with PostgreSQL integer versions. The original checklist is a practitioner demonstration on TiDB. |
| [31 Lock order](articles/31-lock-order.md) | [Louis Heath, incident.io investigation, 2025-02-04](https://incident.io/blog/debugging-deadlocks-in-postgres) | A catalog bulk upsert received unsorted input. Trace resource order across two callers and sort the lock targets. The shop moves stock in separate statements. |
| [32 Request replay](articles/32-request-replay.md) | [Brandur Leach, Stripe engineering, 2017-02-22](https://stripe.com/blog/idempotency) | Successful execution can precede a lost response. Discard the committed result, repeat the original key and compare the entire receipt. Our local fixture retains successful requests until reset. |
| [33 Request identity](articles/33-request-identity.md) | [Stojan Dimitrovski, Supabase, 2025-07-14](https://supabase.com/blog/jwt-signing-keys) | Separating signing from verification motivates locating the verifier instead of trusting a decoded subject. The synthetic exercise does not implement key rotation. |
| [34 Authorized requests](articles/34-authorized-requests.md) | [Miki Pokryvailo, Nile, 2022-07-26](https://www.thenile.dev/blog/multi-tenant-rls) | Centralized row checks and request-context gotchas motivate allowed/denied operations and alternating identities. Our Supabase fixture is an adaptation, not Nile's implementation. |
| [35 Authorized replay](articles/35-authorized-replay.md) | [Todd Jefferson, Shopify, 2019-08-27](https://shopify.engineering/building-resilient-graphql-apis-using-idempotency) | Client/key identity and concurrent duplicate coordination motivate an explicit actor/key boundary. Our database-only transaction does not reproduce Shopify's payment-provider recovery workflow. |

Remaining human evidence: the author must attempt the decision prompts without solutions, record where narration is still needed, and choose any wording that should reflect their own voice. A new learner must try the beginner route, the import trace and the request-code transition. Record misunderstandings and help used, then revise from those observations. Automated SQL/link checks and this editorial assessment do not establish comprehension. Hosted execution remains separately recorded in VERIFICATION.md; adding sources does not satisfy that publication gate.

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

Checked 2026-10-20. The two original business briefs from the accepted plan now have lesson labs: a monthly metric with an independent usage report, and a reconciled CSV handoff. They use synthetic data and are not reports of incidents at a named company. Existing engineering case studies remain curated for the later lessons where they are relevant.

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

Focused revision, 2026-10-26: article 20 now separates the existing source's account, our interpretation and local measurements. No additional company source was added. Article 18's annotated output is captured from our own fixture; its environment and execution evidence are recorded in [verification](VERIFICATION.md#focused-editorial-revisions--2026-10-26). The manual revisions use PostgreSQL's [timeout settings](https://www.postgresql.org/docs/17/runtime-config-client.html#GUC-LOCK-TIMEOUT) and [SET ROLE identity semantics](https://www.postgresql.org/docs/17/sql-set-role.html), both reread on this date.

## PostgreSQL access-control references

Checked 2026-10-26. Versioned PostgreSQL 17 authorities are [privileges](https://www.postgresql.org/docs/17/ddl-priv.html), [SET ROLE](https://www.postgresql.org/docs/17/sql-set-role.html), [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html), [safe function definitions](https://www.postgresql.org/docs/17/sql-createfunction.html), [view security](https://www.postgresql.org/docs/17/sql-createview.html), [search_path and row_security](https://www.postgresql.org/docs/17/runtime-config-client.html), [foreign keys](https://www.postgresql.org/docs/17/ddl-constraints.html) and [host authentication rules](https://www.postgresql.org/docs/17/auth-pg-hba-conf.html).

The current Supabase changelog index and its documentation search were also consulted to identify the boundary with [hosted row security](https://supabase.com/docs/guides/database/postgres/row-level-security). The changelog's upcoming HTTP TLS-cipher change does not affect this local PostgreSQL batch. No hosted project or request identity was tested. The main Supabase skill's broad shortcuts were checked against PostgreSQL's detailed rules: omitted WITH CHECK can inherit USING, a definer function uses its owner's privileges rather than automatically bypassing RLS, and default views use the owner's underlying access rather than literally behaving as definer functions. The new original fixtures execute these distinctions.

AWS supplies the one additional engineering comparison. Its application-context alternative requires a trusted upstream identity boundary and careful connection lifecycle; the course does not present a writable setting as authentication. Existing Stripe/Shopify cases are not repeated merely to add company names.

## Authenticated-access references — 2026-11-15

The three original accounts linked in coverage rows 33–35 were reopened and their relevant passages inspected. Supabase's announcement is a historical product-engineering explanation of symmetric versus asymmetric keys, not an incident account. Nile reports the move from application filtering toward RLS and its request-context cautions. Shopify describes request identity, locking and recovery progress in its payment API. The lessons use those decisions to motivate specific predictions; the store, draft and workshop datasets and the placement-versus-receipt permission policy are original synthetic teaching choices.

The [research recommendation](research/database-design/authenticated-access/Authenticated%20access%20-%20research%20and%20batch%20recommendation.md), [source register](research/database-design/authenticated-access/Authenticated%20access%20-%20source%20register.md) and [lifecycle decisions](research/database-design/authenticated-access/Authenticated%20access%20-%20implementation%20decisions%20and%20lifecycle%20research.md) preserve the fuller research and required case matrix. They are historical research evidence, not live verification results for these new files.

Technical authorities are the [Supabase API-key guide](https://supabase.com/docs/guides/getting-started/api-keys), [JWT guide](https://supabase.com/docs/guides/auth/jwts), [Data API security guide](https://supabase.com/docs/guides/api/securing-your-api), and [anonymous-user guide](https://supabase.com/docs/guides/auth/auth-anonymous); PostgREST's [authentication](https://docs.postgrest.org/en/stable/references/auth.html), [errors](https://docs.postgrest.org/en/stable/references/errors.html), [RPC](https://docs.postgrest.org/en/stable/references/api/functions.html) and [transaction modes](https://docs.postgrest.org/en/stable/references/transactions.html); and PostgreSQL 17's [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), [row locks](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS) and [safe definer functions](https://www.postgresql.org/docs/17/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY). The PostgREST stable pages identified themselves as version 16 when checked; the actual local/hosted service versions must be recorded when the stack runs.

PostgreSQL 17 is the intended native target. Bounded execution used PGlite 0.5.10/PostgreSQL 18.6 with a deliberately synthetic Auth helper. This establishes SQL fixture behavior under the recorded assumptions, not JWT verification or Supabase compatibility. The [verification record](VERIFICATION.md#authenticated-access--2026-11-15) keeps that distinction and the pending native/API checks explicit. Local tooling is pinned to [Supabase CLI 3.1.0](https://github.com/supabase/cli/releases/tag/v3.1.0), separate from the unchanged npm dependencies.

## Learning format references

[The Odin Project](https://www.theodinproject.com/lessons/foundations-how-this-course-will-work) connects lessons with projects. [SQLBolt](https://sqlbolt.com/) places exercises beside explanations. [Explorable Explanations](https://explorabl.es/faq/) offers examples of learning through manipulation. [Quantum Country](https://quantum.country/) embeds spaced review into essays.

These are format inspirations, not proof that every feature improves learning.

[Pimsleur](https://www.pimsleur.com/the-pimsleur-method/) describes anticipation and spaced recall. We borrow those general ideas without claiming its language-course method is validated for SQL.

The [IES learning guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) and [Karpicke and Blunt (2011)](https://pubmed.ncbi.nlm.nih.gov/21252317/) inform the practice design. The course's own effectiveness remains to be evaluated.

