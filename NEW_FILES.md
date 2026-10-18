# Course file guide and original delivery record

## What the files are for

The original package contained 42 files. It now contains 43 after adding the author-only curriculum audit; this is a file count, not a lesson count.

| Files | Purpose | Intended audience |
|---|---|---|
| 7 article files | One SQL onramp and six mechanism-focused lessons | Readers |
| 19 lab files | Shared instructions plus six sets of tasks, setup SQL and solutions | Readers; authors verifying examples |
| 11 top-level Markdown files | Navigation, review, sources, curriculum, authoring and verification records | Mixed; author records are labelled |
| 6 tooling files | Git ignore rules, package files and three verification files | Maintainers |
| 43 total | Current source package, excluding Git metadata and installed dependencies | Not 43 lessons |

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
