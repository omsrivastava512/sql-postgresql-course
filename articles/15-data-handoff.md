# Can this imported data be trusted?

A CSV contains two identical-looking purchases, a repeated source record, February 30, and a product name containing a comma. Loading it without an error is only the first step.

By the end, retain raw input, apply an explicit repair/reject policy, preserve legitimate repeated facts and reconcile a repeatable import.

**Scope:** PostgreSQL CSV parsing, validation, exact conversions and conflict handling in a small single-session batch. This is not a concurrent ingestion service.

## Keep the input and its identity

Run [lab 15's setup](../labs/15-data-handoff/setup.sql). It supplies a raw text staging table and a SQL equivalent of [raw-lines.csv](../labs/15-data-handoff/raw-lines.csv). The file has ten source records. The lab also shows the actual CSV route.

line_no identifies a physical source record. source_key identifies the external purchase-line event. Records 1 and 2 have the same product, quantity and amount but different event keys, L1 and L2: both are real facts. Record 3 repeats L1 with the same payload and is a duplicate delivery.

Splitting text on commas would corrupt Coffee, ground and check, shelf. CSV quotes also encode Tea "house". Under the specified PostgreSQL CSV defaults, an unquoted empty field is NULL while a quoted empty string remains empty text. Keep that distinction unless a documented policy changes it.

## Decide what can be normalized

This exercise trims ordinary surrounding spaces from keys, product names, numeric fields and dates. It preserves the original raw text and the note exactly.

| Field | Accepted form and decision |
|---|---|
| Source key/product | Required and nonblank after trimming |
| Order ID | One to six digits, no leading zero, and an existing supplied order |
| Quantity | Integer 1–999 with no leading zero |
| Unit price | Zero to 9999.99, exactly two decimal places; extra precision is rejected, not silently rounded |
| Date | A real calendar date in YYYY-MM-DD form |
| Repeated key | Equal normalized payload: retain the first source occurrence; differing payload: reject the conflicting key's candidate rows |
| Existing fact | Equal payload: keep it; differing payload: reject the new candidate, never silently overwrite history |

These are the source contract for one exercise, not universal formats. Leading-zero order codes or fractional quantities would require different rules.

## Validate before converting

The price expression in the supplied solution is:

```sql
CASE WHEN btrim(unit_price) ~ '^[0-9]{1,4}[.][0-9]{2}$'
     THEN (btrim(unit_price)::numeric * 100)::integer
END
```

The regular expression requires one to four digits, a decimal point and exactly two digits. CASE produces NULL for other inputs, which the decision step labels as a rejection. The bounded valid price converts exactly to integer cents. Do not convert 12.345 directly to NUMERIC(…,2) and call the rounded value “validated.”

For dates, shape alone is insufficient. The solution combines the explicit format with pg_input_is_valid(value, 'date') before casting. This PostgreSQL helper depends on the input type supporting soft errors; it is not a universal safe-cast promise for all types. The lab checks the date type and this engine.

## Record every outcome

The solution names normalization and assessment steps as views, then stores one decision per source record. Grouping versions of the complete normalized payload distinguishes a repeated delivery from a conflicting key. ROW_NUMBER selects the first equal occurrence using line_no, not an arbitrary row.

Expected classification:

| Decision | Source line numbers |
|---|---|
| Accept | 1,2,9,10 |
| Duplicate | 3 |
| Invalid date | 4 |
| Invalid quantity | 5 |
| Invalid precision | 6 |
| Unknown order | 7 |
| Blank product | 8 |

Ten source records reconcile as four accepted + one duplicate + five rejected. Accepted facts total 5250 cents: 2000 + 2000 + 550 + 700. Raw monetary totals are not a trustworthy control total while some source fields are invalid; reconcile the accepted subset separately and report rejection reasons.

## Repeating the batch is a policy

A primary key protects facts.source_key. After comparing payloads, INSERT ... ON CONFLICT (source_key) DO NOTHING preserves already-loaded equal facts. The decision table uses ON CONFLICT (line_no) DO UPDATE to refresh its assessment for this retained batch.

Run the same solution twice: raw records remain ten, facts remain four and their total remains 5250. The number of accepted source records is not the number of newly inserted facts on a replay. This decision table is the latest assessment, not an append-only audit history.

A different payload under an existing source key must be reported as a conflict. Ignoring every conflict without comparing payloads could silently lose a correction. Competing import workers, interrupted multi-batch jobs and request retries need later concurrency/operations lessons; this exercise does not claim those guarantees.

## Practise and transfer

The [lab](../labs/15-data-handoff/README.md) imports the real CSV, compares it with the supplied SQL snapshot, exports the accepted facts, replays the batch and changes the duplicate policy input. Its independent transfer adds a distinct event with the same economic values; that must increase the accepted total.

**Requires:** [values](07-stored-values.md), [grouping](11-aggregate-grain.md), [CTEs](12-query-shapes.md), [windows](13-window-questions.md) and [views](14-reusable-reports.md).
**Revisited in:** [planned migrations and operational recovery](../COURSE_MAP.md#the-wider-course).
**Return:** explain which count refers to records, unique facts, accepted candidates or newly inserted rows.
**References:** PostgreSQL [COPY and CSV](https://www.postgresql.org/docs/17/sql-copy.html), [input validation](https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-INFO-VALIDITY), [conditional expressions](https://www.postgresql.org/docs/17/functions-conditional.html) and [ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html#SQL-ON-CONFLICT).
