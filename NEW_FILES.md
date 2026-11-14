# Course file guide and original delivery record

## What the files are for

The original package contained 42 files. The reliable-writes batch added 16 files to the 151-file catalog checkpoint at d7c95fb. The table below preserves that delivery's counts; the [authenticated-access delivery](#authenticated-access-implementation--2026-11-15) records the later additions without counting unrelated research or private learning material.

| Files | Purpose | Intended audience |
|---|---|---|
| 33 article files | One SQL onramp, six mechanism-focused lessons, three foundation lessons, six query/data-handoff lessons, two concurrency/migration pilots, five practical performance lessons, four access-control lessons, three catalog design lessons and three reliable-writes lessons | Readers |
| 112 lab files | Shared instructions plus thirty-two sets of tasks, setup SQL and solutions, with one CSV fixture, three migration phase files, a standalone vacuum command, two request modules, four access-role cleanup files and four separate transfer solutions | Readers; authors verifying examples |
| 11 top-level Markdown files | Navigation, review, sources, curriculum, authoring and verification records | Mixed; author records are labelled |
| 9 tooling files | Git ignore rules, package files and six verification files | Maintainers |
| 2 research files | Previously committed catalog/billing report and its research log; unchanged in the access batch | Authors |
| 167 total | Reliable-writes source package, excluding Git metadata and installed dependencies | Readers and maintainers |

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

See VERIFICATION.md for executed checks and outstanding release gates. These are saved authoring files, not a public deployment.

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

## Concurrency and migration delivery on 2026-10-21

This batch adds twelve files and updates thirteen against local commit 564ed9d. The live upstream preflight found main at 7cd5dcc, with the local branch 1 ahead/0 behind and no open/closed PRs or issues. No Git mutation was performed. Locations below describe this delivery; future revisions may move them. The temporary runtime and approval log are outside the course repository.

| File | Added or updated line locations |
|---|---|
| [COURSE_MAP.md](COURSE_MAP.md) | 32–33, 44, 48, 100–102, 134–135 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 45–48, 91–99, 108 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 9–10, 12–13, 145–175 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 44–54, 57, 60, 64, 72 |
| [README.md](README.md) | 37–38, 40, 42 |
| [REVIEW.md](REVIEW.md) | 26–33, 59, 63 |
| [SOURCES.md](SOURCES.md) | 16, 68–75 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 116–118, 124–125, 174–176, 181, 186 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7–9, 11–12, 16, 20–53, 72 |
| [articles/06-transaction-boundaries.md](articles/06-transaction-boundaries.md) | 84 |
| [articles/15-data-handoff.md](articles/15-data-handoff.md) | 78 |
| [labs/README.md](labs/README.md) | 31–33, 45, 75–83 |
| [tests/cases.json](tests/cases.json) | 3396–3575 |
| [articles/16-competing-claims.md](articles/16-competing-claims.md) | 1–76 (new file) |
| [articles/17-compatible-change.md](articles/17-compatible-change.md) | 1–76 (new file) |
| [labs/16-competing-claims/README.md](labs/16-competing-claims/README.md) | 1–107 (new file) |
| [labs/16-competing-claims/setup.sql](labs/16-competing-claims/setup.sql) | 1–8 (new file) |
| [labs/16-competing-claims/solution.sql](labs/16-competing-claims/solution.sql) | 1–20 (new file) |
| [labs/17-compatible-change/01-expand.sql](labs/17-compatible-change/01-expand.sql) | 1–7 (new file) |
| [labs/17-compatible-change/02-backfill.sql](labs/17-compatible-change/02-backfill.sql) | 1–10 (new file) |
| [labs/17-compatible-change/03-require.sql](labs/17-compatible-change/03-require.sql) | 1–9 (new file) |
| [labs/17-compatible-change/README.md](labs/17-compatible-change/README.md) | 1–92 (new file) |
| [labs/17-compatible-change/setup.sql](labs/17-compatible-change/setup.sql) | 1–11 (new file) |
| [labs/17-compatible-change/solution.sql](labs/17-compatible-change/solution.sql) | 1–50 (new file) |
| [tests/verify-sessions.mjs](tests/verify-sessions.mjs) | 1–295 (new file) |

## Practical performance delivery on 2026-10-21

This batch adds twenty-three files and updates eleven against 9686887720f4f37573040dcd5ee921a5db4b4b77. Live upstream main and local HEAD matched, 0 ahead/0 behind with a clean tree at preflight; no PRs/issues or equivalent work were found. No staging, commit, push or publication was performed. All original seventeen reference suites and 132 topic IDs remain. Existing runner/dependency files are unchanged.

The five lessons use generated fixtures, exact results, changed-setting tasks and bounded native observations. The temporary server was stopped and removed after verification. Evidence outputs and the requested approval log are outside the repository. Locations below describe this delivery; later changes can move them.

| File | Added or updated line locations |
|---|---|
| [COURSE_MAP.md](COURSE_MAP.md) | 34–35, 49, 111–115, 143–147 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 99–107 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 9–10, 12–13, 176–218 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 55–68, 71, 73 |
| [README.md](README.md) | 39–43, 45, 59 |
| [REVIEW.md](REVIEW.md) | 34–43, 72 |
| [SOURCES.md](SOURCES.md) | 17, 77–84 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 76, 168–170, 172–173, 184–188 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7–8, 10, 13, 23–80, 83 |
| [labs/README.md](labs/README.md) | 75, 87–100 |
| [tests/cases.json](tests/cases.json) | 3576–4064 |
| [articles/18-query-plans.md](articles/18-query-plans.md) | 1–66 (new file) |
| [articles/19-index-decisions.md](articles/19-index-decisions.md) | 1–68 (new file) |
| [articles/20-deep-pages.md](articles/20-deep-pages.md) | 1–64 (new file) |
| [articles/21-statistics-maintenance.md](articles/21-statistics-maintenance.md) | 1–47 (new file) |
| [articles/22-request-work.md](articles/22-request-work.md) | 1–61 (new file) |
| [labs/18-query-plans/README.md](labs/18-query-plans/README.md) | 1–75 (new file) |
| [labs/18-query-plans/setup.sql](labs/18-query-plans/setup.sql) | 1–8 (new file) |
| [labs/18-query-plans/solution.sql](labs/18-query-plans/solution.sql) | 1–8 (new file) |
| [labs/19-index-decisions/README.md](labs/19-index-decisions/README.md) | 1–83 (new file) |
| [labs/19-index-decisions/setup.sql](labs/19-index-decisions/setup.sql) | 1–12 (new file) |
| [labs/19-index-decisions/solution.sql](labs/19-index-decisions/solution.sql) | 1–9 (new file) |
| [labs/20-deep-pages/README.md](labs/20-deep-pages/README.md) | 1–66 (new file) |
| [labs/20-deep-pages/setup.sql](labs/20-deep-pages/setup.sql) | 1–8 (new file) |
| [labs/20-deep-pages/solution.sql](labs/20-deep-pages/solution.sql) | 1–5 (new file) |
| [labs/21-statistics-maintenance/README.md](labs/21-statistics-maintenance/README.md) | 1–77 (new file) |
| [labs/21-statistics-maintenance/setup.sql](labs/21-statistics-maintenance/setup.sql) | 1–10 (new file) |
| [labs/21-statistics-maintenance/solution.sql](labs/21-statistics-maintenance/solution.sql) | 1–8 (new file) |
| [labs/21-statistics-maintenance/vacuum.sql](labs/21-statistics-maintenance/vacuum.sql) | 1–1 (new file) |
| [labs/22-request-work/README.md](labs/22-request-work/README.md) | 1–67 (new file) |
| [labs/22-request-work/request.mjs](labs/22-request-work/request.mjs) | 1–87 (new file) |
| [labs/22-request-work/setup.sql](labs/22-request-work/setup.sql) | 1–13 (new file) |
| [labs/22-request-work/solution.sql](labs/22-request-work/solution.sql) | 1–6 (new file) |
| [tests/verify-performance.mjs](tests/verify-performance.mjs) | 1–317 (new file) |

## PostgreSQL access-control delivery — 2026-10-26

Four article/lab pairs and one separate actual-login checker add 21 files. Eleven existing files contain the reference cases and connected navigation, coverage, source and verification records. The following current line locations are relative to local HEAD 60da999b26326a083a5f75b13dd8d5fc549da4eb; unchanged historical delivery records above are retained.

The read-only preflight found main one commit ahead of live upstream main (9fbadbedca2e2828d619d9d47b47a6f31baf0887), zero behind, with no PRs/issues or duplicate access work. The local-only commit contains the two research documents; neither was edited here. No Git mutation was performed. External approval and execution-evidence files are outside this source manifest.

| File | Current changed lines |
|---|---|
| [COURSE_MAP.md](COURSE_MAP.md) | 36–37, 49, 118–121, 153–156 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 109–118 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 9–10, 12–14, 220–260 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 69–81, 84, 86–93, 101, 106 |
| [README.md](README.md) | 44–47, 49, 51, 63, 76 |
| [REVIEW.md](REVIEW.md) | 44–53, 80 |
| [SOURCES.md](SOURCES.md) | 18, 86–93 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 24, 131, 135–140, 181 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7–8, 11, 14, 24–58, 61 |
| [articles/23-database-roles.md](articles/23-database-roles.md) | 1–61 (new file) |
| [articles/24-row-policies.md](articles/24-row-policies.md) | 1–63 (new file) |
| [articles/25-tenant-membership.md](articles/25-tenant-membership.md) | 1–71 (new file) |
| [articles/26-privileged-code.md](articles/26-privileged-code.md) | 1–58 (new file) |
| [labs/23-database-roles/README.md](labs/23-database-roles/README.md) | 1–53 (new file) |
| [labs/23-database-roles/cleanup.sql](labs/23-database-roles/cleanup.sql) | 1–3 (new file) |
| [labs/23-database-roles/setup.sql](labs/23-database-roles/setup.sql) | 1–14 (new file) |
| [labs/23-database-roles/solution.sql](labs/23-database-roles/solution.sql) | 1–7 (new file) |
| [labs/24-row-policies/README.md](labs/24-row-policies/README.md) | 1–53 (new file) |
| [labs/24-row-policies/cleanup.sql](labs/24-row-policies/cleanup.sql) | 1–3 (new file) |
| [labs/24-row-policies/setup.sql](labs/24-row-policies/setup.sql) | 1–13 (new file) |
| [labs/24-row-policies/solution.sql](labs/24-row-policies/solution.sql) | 1–7 (new file) |
| [labs/25-tenant-membership/README.md](labs/25-tenant-membership/README.md) | 1–70 (new file) |
| [labs/25-tenant-membership/cleanup.sql](labs/25-tenant-membership/cleanup.sql) | 1–3 (new file) |
| [labs/25-tenant-membership/setup.sql](labs/25-tenant-membership/setup.sql) | 1–29 (new file) |
| [labs/25-tenant-membership/solution.sql](labs/25-tenant-membership/solution.sql) | 1–12 (new file) |
| [labs/26-privileged-code/README.md](labs/26-privileged-code/README.md) | 1–56 (new file) |
| [labs/26-privileged-code/cleanup.sql](labs/26-privileged-code/cleanup.sql) | 1–3 (new file) |
| [labs/26-privileged-code/setup.sql](labs/26-privileged-code/setup.sql) | 1–33 (new file) |
| [labs/26-privileged-code/solution.sql](labs/26-privileged-code/solution.sql) | 1–9 (new file) |
| [labs/README.md](labs/README.md) | 3, 47, 51, 75, 101–120 |
| [tests/cases.json](tests/cases.json) | 4065–5003 |
| [tests/verify-access.mjs](tests/verify-access.mjs) | 1–245 (new file) |

## Catalog design implementation — 2026-11-02

The rows below identify every changed repository file and its current line ranges against c5ad1e6. The batch adds 13 files and updates 14. The full reference suites preserve the 399 earlier assertions and add 11 for lab 27, 11 for lab 28 and 19 for lab 29.

| File | Changed lines |
|---|---|
| `COURSE_MAP.md` | 7, 38–39, 47, 52, 124–126, 162–164 |
| `CURRICULUM_AUDIT.md` | 23, 43 |
| `NEW_FILES.md` | 5, 9–10, 14, 261–294 |
| `PUBLICATION.md` | 13, 82–85, 94 |
| `README.md` | 48–50, 52, 54 |
| `REVIEW.md` | 63–70 |
| `SOURCES.md` | 20–26, 85–87 |
| `TOPIC_INVENTORY.md` | 14, 49, 151–152, 161 |
| `VERIFICATION.md` | 3, 7–8, 14–15, 25–38 |
| `articles/09-row-identity.md` | 101–102 |
| `articles/14-reusable-reports.md` | 97–98 |
| `articles/27-product-variants.md` | 1–36 |
| `articles/28-store-offers.md` | 1–35 |
| `articles/29-order-snapshots.md` | 1–38 |
| `labs/27-product-variants/README.md` | 1–40 |
| `labs/27-product-variants/setup.sql` | 1–15 |
| `labs/27-product-variants/solution.sql` | 1–40 |
| `labs/28-store-offers/README.md` | 1–41 |
| `labs/28-store-offers/setup.sql` | 1–34 |
| `labs/28-store-offers/solution.sql` | 1–24 |
| `labs/29-order-snapshots/README.md` | 1–78 |
| `labs/29-order-snapshots/setup.sql` | 1–42 |
| `labs/29-order-snapshots/solution.sql` | 1–55 |
| `labs/29-order-snapshots/transfer.sql` | 1–37 |
| `labs/README.md` | 3, 75, 87–90 |
| `tests/cases.json` | 5004–5590 |
| `tests/verify.mjs` | 38–42 |

## Reliable writes implementation — 2026-11-02

These current line ranges cover the batch against d7c95fb. There are 16 added files and 15 modified files.

| File | Changed lines |
|---|---|
| `COURSE_MAP.md` | 40–41, 52, 129–131, 169–171 |
| `CURRICULUM_AUDIT.md` | 119–122 |
| `NEW_FILES.md` | 5, 9–10, 14, 295–332 |
| `PUBLICATION.md` | 13, 86–89, 97 |
| `README.md` | 51–53, 55 |
| `REVIEW.md` | 71–78, 95 |
| `SOURCES.md` | 88–90 |
| `TOPIC_INVENTORY.md` | 14, 116, 119, 121–125 |
| `VERIFICATION.md` | 3, 7–9, 14–15, 23–41 |
| `articles/06-transaction-boundaries.md` | 92 |
| `articles/16-competing-claims.md` | 62 |
| `articles/29-order-snapshots.md` | 39–40 |
| `articles/30-conflicting-edits.md` | 1–42 (new file) |
| `articles/31-lock-order.md` | 1–29 (new file) |
| `articles/32-request-replay.md` | 1–31 (new file) |
| `labs/30-conflicting-edits/README.md` | 1–35 (new file) |
| `labs/30-conflicting-edits/setup.sql` | 1–12 (new file) |
| `labs/30-conflicting-edits/solution.sql` | 1–12 (new file) |
| `labs/30-conflicting-edits/transfer.sql` | 1–23 (new file) |
| `labs/31-lock-order/README.md` | 1–58 (new file) |
| `labs/31-lock-order/setup.sql` | 1–9 (new file) |
| `labs/31-lock-order/solution.sql` | 1–28 (new file) |
| `labs/31-lock-order/transfer.sql` | 1–28 (new file) |
| `labs/32-request-replay/README.md` | 1–81 (new file) |
| `labs/32-request-replay/request.mjs` | 1–36 (new file) |
| `labs/32-request-replay/setup.sql` | 1–36 (new file) |
| `labs/32-request-replay/solution.sql` | 1–33 (new file) |
| `labs/32-request-replay/transfer.sql` | 1–40 (new file) |
| `labs/README.md` | 3, 31, 75, 77, 83, 87–90 |
| `tests/cases.json` | 5591–6256 |
| `tests/verify-sessions.mjs` | 5, 271–416, 427, 430 |

## Authenticated-access implementation — 2026-11-15

Three article/lab pairs add request identity, direct table authorization and authorized receipt recovery. Each lab has independent setup, solution, request and transfer files. Shared provisioning, separate SQL-only/live checkers, local configuration and hosted placeholders support the route. The existing npm dependencies and earlier test runners are unchanged.

The SQL-only checker passed 71 assertions; the earlier embedded suite passed 496. Real Auth/API, concurrent-session, response-loss, hosted and reader checks remain pending. See [verification](VERIFICATION.md#authenticated-access--2026-11-15). No commit or push was performed.

This delivery adds 25 files and updates 10 existing documentation files. The table records current delivery lines; later edits can shift them. `learning/` and unrelated research are outside this change.

| File | Lines added or changed |
|---|---|
| [articles/33-request-identity.md](articles/33-request-identity.md) | 1–78 (new file) |
| [articles/34-authorized-requests.md](articles/34-authorized-requests.md) | 1–74 (new file) |
| [articles/35-authorized-replay.md](articles/35-authorized-replay.md) | 1–62 (new file) |
| [labs/33-request-identity/README.md](labs/33-request-identity/README.md) | 1–71 (new file) |
| [labs/33-request-identity/setup.sql](labs/33-request-identity/setup.sql) | 1–48 (new file) |
| [labs/33-request-identity/solution.sql](labs/33-request-identity/solution.sql) | 1–24 (new file) |
| [labs/33-request-identity/transfer.sql](labs/33-request-identity/transfer.sql) | 1–7 (new file) |
| [labs/33-request-identity/request.mjs](labs/33-request-identity/request.mjs) | 1–74 (new file) |
| [labs/34-authorized-requests/README.md](labs/34-authorized-requests/README.md) | 1–90 (new file) |
| [labs/34-authorized-requests/setup.sql](labs/34-authorized-requests/setup.sql) | 1–47 (new file) |
| [labs/34-authorized-requests/solution.sql](labs/34-authorized-requests/solution.sql) | 1–24 (new file) |
| [labs/34-authorized-requests/transfer.sql](labs/34-authorized-requests/transfer.sql) | 1–3 (new file) |
| [labs/34-authorized-requests/request.mjs](labs/34-authorized-requests/request.mjs) | 1–14 (new file) |
| [labs/35-authorized-replay/README.md](labs/35-authorized-replay/README.md) | 1–92 (new file) |
| [labs/35-authorized-replay/setup.sql](labs/35-authorized-replay/setup.sql) | 1–72 (new file) |
| [labs/35-authorized-replay/solution.sql](labs/35-authorized-replay/solution.sql) | 1–69 (new file) |
| [labs/35-authorized-replay/transfer.sql](labs/35-authorized-replay/transfer.sql) | 1–2 (new file) |
| [labs/35-authorized-replay/request.mjs](labs/35-authorized-replay/request.mjs) | 1–49 (new file) |
| [labs/auth-fixture.mjs](labs/auth-fixture.mjs) | 1–97 (new file) |
| [supabase/.gitignore](supabase/.gitignore) | 1–5 (new file) |
| [supabase/config.toml](supabase/config.toml) | 1–50 (new file) |
| [supabase/README.md](supabase/README.md) | 1–61 (new file) |
| [supabase/hosted.env.example](supabase/hosted.env.example) | 1–6 (new file) |
| [tests/verify-authenticated-access-sql.mjs](tests/verify-authenticated-access-sql.mjs) | 1–180 (new file) |
| [tests/verify-authenticated-access.mjs](tests/verify-authenticated-access.mjs) | 1–619 (new file) |
| [COURSE_MAP.md](COURSE_MAP.md) | 36, 42–43, 55, 58, 134–136, 177–179, 181 |
| [CURRICULUM_AUDIT.md](CURRICULUM_AUDIT.md) | 32, 34, 38, 123–128 |
| [NEW_FILES.md](NEW_FILES.md) | 5, 333–378 |
| [PUBLICATION.md](PUBLICATION.md) | 13, 90–103, 110–111 |
| [README.md](README.md) | 54–56, 58, 60, 85 |
| [REVIEW.md](REVIEW.md) | 79–88 |
| [SOURCES.md](SOURCES.md) | 91–93, 171–180 |
| [TOPIC_INVENTORY.md](TOPIC_INVENTORY.md) | 14, 122–123, 131–134, 138, 140–141, 143, 177, 179 |
| [VERIFICATION.md](VERIFICATION.md) | 3, 7–9, 17, 22, 28–71 |
| [labs/README.md](labs/README.md) | 3, 47, 87–100 |
