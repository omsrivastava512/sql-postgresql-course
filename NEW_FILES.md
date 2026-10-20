# Course file guide and original delivery record

## What the files are for

The original package contained 42 files. It now contains 80 after adding the author-only curriculum audit, three foundation article/lab sets and six query/data-handoff sets with a CSV fixture; this is a file count, not a lesson count.

| Files | Purpose | Intended audience |
|---|---|---|
| 16 article files | One SQL onramp, six mechanism-focused lessons, three foundation lessons and six query/data-handoff lessons | Readers |
| 47 lab files | Shared instructions plus fifteen sets of tasks, setup SQL and solutions, with one CSV fixture | Readers; authors verifying examples |
| 11 top-level Markdown files | Navigation, review, sources, curriculum, authoring and verification records | Mixed; author records are labelled |
| 6 tooling files | Git ignore rules, package files and three verification files | Maintainers |
| 80 total | Current source package, excluding Git metadata and installed dependencies | Not 80 lessons |

Readers start at the [README](README.md), [course map](COURSE_MAP.md), articles, labs and [review prompts](REVIEW.md). Authors additionally use the [curriculum audit](CURRICULUM_AUDIT.md), teaching guide, publication queue, provenance and verification records. No reader needs the private source application.

## Original delivery on 2026-10-17

The following line counts are historical, not the current diff. At initial delivery every listed file was new and no pre-existing application or study file was edited. Later revisions are tracked by Git.

| File | Lines added |
|---|---:|
| [.gitignore](.gitignore) | 5 |
| [articles/00-reading-the-examples.md](articles/00-reading-the-examples.md) | 86 |
| [articles/01-foreign-keys.md](articles/01-foreign-keys.md) | 89 |
| [articles/02-business-rules.md](articles/02-business-rules.md) | 82 |
| [articles/03-derived-values.md](articles/03-derived-values.md) | 87 |
| [articles/04-deleting-related-rows.md](articles/04-deleting-related-rows.md) | 72 |
| [articles/05-deferred-checks.md](articles/05-deferred-checks.md) | 85 |
| [articles/06-transaction-boundaries.md](articles/06-transaction-boundaries.md) | 87 |
| [AUTHORING.md](AUTHORING.md) | 51 |
| [COURSE_MAP.md](COURSE_MAP.md) | 60 |
| [labs/01-foreign-keys/README.md](labs/01-foreign-keys/README.md) | 30 |
| [labs/01-foreign-keys/setup.sql](labs/01-foreign-keys/setup.sql) | 19 |
| [labs/01-foreign-keys/solution.sql](labs/01-foreign-keys/solution.sql) | 5 |
| [labs/02-business-rules/README.md](labs/02-business-rules/README.md) | 47 |
| [labs/02-business-rules/setup.sql](labs/02-business-rules/setup.sql) | 29 |
| [labs/02-business-rules/solution.sql](labs/02-business-rules/solution.sql) | 6 |
| [labs/03-derived-values/README.md](labs/03-derived-values/README.md) | 53 |
| [labs/03-derived-values/setup.sql](labs/03-derived-values/setup.sql) | 33 |
| [labs/03-derived-values/solution.sql](labs/03-derived-values/solution.sql) | 10 |
| [labs/04-deleting-related-rows/README.md](labs/04-deleting-related-rows/README.md) | 60 |
| [labs/04-deleting-related-rows/setup.sql](labs/04-deleting-related-rows/setup.sql) | 12 |
| [labs/04-deleting-related-rows/solution.sql](labs/04-deleting-related-rows/solution.sql) | 15 |
| [labs/05-deferred-checks/README.md](labs/05-deferred-checks/README.md) | 58 |
| [labs/05-deferred-checks/setup.sql](labs/05-deferred-checks/setup.sql) | 23 |
| [labs/05-deferred-checks/solution.sql](labs/05-deferred-checks/solution.sql) | 8 |
| [labs/06-transaction-boundaries/README.md](labs/06-transaction-boundaries/README.md) | 86 |
| [labs/06-transaction-boundaries/setup.sql](labs/06-transaction-boundaries/setup.sql) | 37 |
| [labs/06-transaction-boundaries/solution.sql](labs/06-transaction-boundaries/solution.sql) | 13 |
| [labs/README.md](labs/README.md) | 76 |
| [package-lock.json](package-lock.json) | 181 |
| [package.json](package.json) | 15 |
| [PUBLICATION.md](PUBLICATION.md) | 39 |
| [README.md](README.md) | 51 |
| [REPOSITORY_EVIDENCE.md](REPOSITORY_EVIDENCE.md) | 20 |
| [REVIEW.md](REVIEW.md) | 25 |
| [SOURCES.md](SOURCES.md) | 42 |
| [tests/cases.json](tests/cases.json) | 609 |
| [tests/check-links.mjs](tests/check-links.mjs) | 37 |
| [tests/verify.mjs](tests/verify.mjs) | 68 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 171 |
| [VERIFICATION.md](VERIFICATION.md) | 42 |

This delivery record itself was the 42nd file. Temporary runtime dependencies and node_modules were excluded. The curriculum audit was added on 2026-10-19; the table above remains the original delivery snapshot.

See VERIFICATION.md for executed checks and outstanding release gates. These files are saved drafts, not a public deployment.

## Foundation delivery on 2026-10-20

This dated record lists the first implementation batch against e652e31. Line locations describe this delivery; future revisions may move them. Existing article URLs, original lab SQL, test runner and dependency files were preserved. No Git commit or publication was performed.

| File | Added or updated line locations |
|---|---|
| [articles/07-stored-values.md](articles/07-stored-values.md) | 1–92 (new file) |
| [articles/08-selecting-rows.md](articles/08-selecting-rows.md) | 1–113 (new file) |
| [articles/09-row-identity.md](articles/09-row-identity.md) | 1–85 (new file) |
| [labs/07-stored-values/README.md](labs/07-stored-values/README.md) | 1–94 (new file) |
| [labs/07-stored-values/setup.sql](labs/07-stored-values/setup.sql) | 1–16 (new file) |
| [labs/07-stored-values/solution.sql](labs/07-stored-values/solution.sql) | 1–8 (new file) |
| [labs/08-selecting-rows/README.md](labs/08-selecting-rows/README.md) | 1–67 (new file) |
| [labs/08-selecting-rows/setup.sql](labs/08-selecting-rows/setup.sql) | 1–31 (new file) |
| [labs/08-selecting-rows/solution.sql](labs/08-selecting-rows/solution.sql) | 1–12 (new file) |
| [labs/09-row-identity/README.md](labs/09-row-identity/README.md) | 1–96 (new file) |
| [labs/09-row-identity/setup.sql](labs/09-row-identity/setup.sql) | 1–29 (new file) |
| [labs/09-row-identity/solution.sql](labs/09-row-identity/solution.sql) | 1–13 (new file) |
| [AUTHORING.md](AUTHORING.md) | 52–61 |
| [COURSE_MAP.md](COURSE_MAP.md) | 7, 11–15, 22, 36–38, 88–90, 108–110 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 17–19, 24, 79–84 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 15, 17, 19, 23–25, 31 |
| [README.md](README.md) | 11, 22–24, 32, 34 |
| [REVIEW.md](REVIEW.md) | 9–15, 37 |
| [SOURCES.md](SOURCES.md) | 44–58 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 25–31, 35–37, 45–47, 64, 68–70, 76–77, 79, 84 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7, 20–35 |
| [labs/README.md](labs/README.md) | 73 |
| [tests/cases.json](tests/cases.json) | 607–1538 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 9–10, 13, 69–98 |

## Query and data-handoff delivery on 2026-10-20

This batch adds 25 files and updates 13 against 7cd5dcc. Locations describe this delivery. It adds six article/lab pairs, a CSV fixture, reference checks and connected course records. No commit, push or public release was performed.

| File | Added or updated line locations |
|---|---|
| [COURSE_MAP.md](COURSE_MAP.md) | 7, 13, 16–18, 40, 44–45, 99–104, 118–123 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 21, 24, 27, 43, 83–91 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 9–10, 13, 99–143 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 29–43, 46, 48 |
| [README.md](README.md) | 25–30, 38 |
| [REVIEW.md](REVIEW.md) | 16–25, 49, 53 |
| [SOURCES.md](SOURCES.md) | 59–66 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 26, 48, 56, 65–67, 71–73, 77–81, 83, 121, 150, 152–154, 156, 160, 183 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7, 10, 20–77 |
| [articles/08-selecting-rows.md](articles/08-selecting-rows.md) | 111 |
| [articles/09-row-identity.md](articles/09-row-identity.md) | 83–84 |
| [labs/README.md](labs/README.md) | 73 |
| [tests/cases.json](tests/cases.json) | 1539–3395 |
| [articles/10-joins.md](articles/10-joins.md) | 1–62 (new file) |
| [articles/11-aggregate-grain.md](articles/11-aggregate-grain.md) | 1–102 (new file) |
| [articles/12-query-shapes.md](articles/12-query-shapes.md) | 1–89 (new file) |
| [articles/13-window-questions.md](articles/13-window-questions.md) | 1–67 (new file) |
| [articles/14-reusable-reports.md](articles/14-reusable-reports.md) | 1–79 (new file) |
| [articles/15-data-handoff.md](articles/15-data-handoff.md) | 1–80 (new file) |
| [labs/10-joins/README.md](labs/10-joins/README.md) | 1–49 (new file) |
| [labs/10-joins/setup.sql](labs/10-joins/setup.sql) | 1–14 (new file) |
| [labs/10-joins/solution.sql](labs/10-joins/solution.sql) | 1–6 (new file) |
| [labs/11-aggregate-grain/README.md](labs/11-aggregate-grain/README.md) | 1–48 (new file) |
| [labs/11-aggregate-grain/setup.sql](labs/11-aggregate-grain/setup.sql) | 1–14 (new file) |
| [labs/11-aggregate-grain/solution.sql](labs/11-aggregate-grain/solution.sql) | 1–12 (new file) |
| [labs/12-query-shapes/README.md](labs/12-query-shapes/README.md) | 1–41 (new file) |
| [labs/12-query-shapes/setup.sql](labs/12-query-shapes/setup.sql) | 1–16 (new file) |
| [labs/12-query-shapes/solution.sql](labs/12-query-shapes/solution.sql) | 1–10 (new file) |
| [labs/13-window-questions/README.md](labs/13-window-questions/README.md) | 1–46 (new file) |
| [labs/13-window-questions/setup.sql](labs/13-window-questions/setup.sql) | 1–6 (new file) |
| [labs/13-window-questions/solution.sql](labs/13-window-questions/solution.sql) | 1–9 (new file) |
| [labs/14-reusable-reports/README.md](labs/14-reusable-reports/README.md) | 1–62 (new file) |
| [labs/14-reusable-reports/setup.sql](labs/14-reusable-reports/setup.sql) | 1–16 (new file) |
| [labs/14-reusable-reports/solution.sql](labs/14-reusable-reports/solution.sql) | 1–35 (new file) |
| [labs/15-data-handoff/README.md](labs/15-data-handoff/README.md) | 1–70 (new file) |
| [labs/15-data-handoff/raw-lines.csv](labs/15-data-handoff/raw-lines.csv) | 1–11 (new file) |
| [labs/15-data-handoff/setup.sql](labs/15-data-handoff/setup.sql) | 1–18 (new file) |
| [labs/15-data-handoff/solution.sql](labs/15-data-handoff/solution.sql) | 1–39 (new file) |
