# Lab 15 — Reconcile the source and the facts

Read [the article](../../articles/15-data-handoff.md). Run [setup.sql](setup.sql) using [the lab guide](../README.md). It resets only course_import and supplies ten raw records, two valid order IDs, empty typed facts and an empty decision table. Preserve the original [CSV](raw-lines.csv).

## Load and inspect

The setup's INSERT statements are a supplied equivalent snapshot for SQL-editor users. They allow validation practice without assuming a hosted file-upload workflow. They do not by themselves demonstrate CSV import.

For the Docker route, from the repository root in a host terminal:

```sh
docker cp labs/15-data-handoff/raw-lines.csv clinic-course-postgres:/tmp/course-raw-lines.csv
docker exec -it clinic-course-postgres psql -U postgres -d course
```

Inside psql, immediately after fresh setup and before processing, run:

```sql
TRUNCATE course_import.decisions, course_import.raw_lines;
\copy course_import.raw_lines FROM '/tmp/course-raw-lines.csv' WITH (FORMAT csv, HEADER true)
SELECT * FROM course_import.raw_lines ORDER BY line_no;
```

If using a host psql instead, use the file's actual local path. The psql \copy command reads on the client side; SQL COPY with a path reads on the database server. These are not interchangeable filesystem locations.

There must be ten rows. Inspect line 1's product Coffee, ground, line 9's Tea "house" and note check, shelf, line 1's NULL note, and line 10's empty-text note. A comma-splitting workaround is not an acceptable parser.

## Validate a single field, then the batch

Use the article's price CASE on the raw rows. Expected cents by line: 1000,1000,1000,700,700,NULL,700,700,550,700. Line 6's extra precision must be rejected.

Try pg_input_is_valid('2026-02-30', 'date'): expect false. Try the real date 2026-02-28: expect true. Keep the required YYYY-MM-DD shape as a separate condition.

Build the remaining normalization and decision steps from the stated policy. Inspect every normalized field and decision before inserting typed facts. Record one reason per invalid source row; the supplied solution uses the first matching reason. It does not claim to enumerate every defect in a row.

## Guided handoff

Return source record count, accepted/duplicate/rejected counts, rejected line numbers/reasons, accepted event keys and their total amount.

Expected decisions: accept 1,2,9,10; duplicate 3; reject 4/date, 5/quantity, 6/price, 7/unknown order and 8/product. Expected keys: L1,L2,L8,L9. Expected total: 5250 cents. The two 2000-cent facts must both remain.

Run the successful processing again without resetting. Expect the same ten raw rows, ten decision rows, four facts and total 5250. The second run introduces zero new facts. Explain which counts alone would fail to detect a duplicated import.

After successful processing, export using psql:

```sql
\copy (SELECT * FROM course_import.facts ORDER BY source_key) TO '/tmp/course-accepted.csv' WITH (FORMAT csv, HEADER true)
```

For the container route, leave psql and copy the result to a new local output path with docker cp clinic-course-postgres:/tmp/course-accepted.csv ./course-accepted.csv. Inspect the quoted product and note fields. Treat this as your generated lab output; do not commit it as course source.

## Independent transfer and conflict checks

After a successful original run, add a raw record with line_no 11, source_key L10 and the same payload as L1. Process again. Expected: eleven raw records, five accepted, one duplicate, five rejected; five facts and total 7250 cents. Identical economic values are not sufficient evidence of the same event.

Reset. Before processing, insert an existing L1 fact with quantity 9 and otherwise the same normalized values as source L1. Process. Source lines 1 and 3 must be rejected as existing conflicts, and the stored quantity 9 must remain. No silent overwrite or silent acceptance is permitted.

Reset again. Add a different quantity under the repeated raw key L1 before processing. The valid-format rows for that conflicting key must be rejected as source conflicts. Explain why choosing whichever record happened to load first would conceal ambiguity.

Change the rule to allow three decimal places in prices. Do not implement it by relaxing only the pattern: decide the storage unit and rounding policy first. This last task is a design explanation; the supplied executable contract remains two decimals.

## Hints and solution

Conceptual hint: keep physical row identity separate from source event identity. Intermediate check: validate and compare complete normalized payloads before deciding which conflict action is acceptable.

The [solution](solution.sql) supplies normalization, assessment, decision recording and insertion in a transaction. The regular-expression syntax and complete conflict comparison are available there as scaffolding; understanding their purpose matters more than memorizing the patterns. If you need the full solution first, do the new-key transfer again without it.

Deliver the retained raw file, your policy, rejected-row report, accepted facts and reconciliation counts/total. State that this is a single-session exercise. A production job needs additional concurrency, provenance, recovery and monitoring decisions.

Return later: what evidence would distinguish “four accepted source events” from “four newly inserted rows” on a repeated run?
