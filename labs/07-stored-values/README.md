# Lab 07 — Inspect the stored fact

Read [the article](../../articles/07-stored-values.md) and choose an environment from [the lab guide](../README.md). Run [setup.sql](setup.sql). It resets only course_values; every task uses synthetic data. Run intentional errors as separate statements, outside an explicit transaction. Reset before the independent task or the complete [solution](solution.sql).

## Inspect and predict

First inspect the actual columns. This SQL works in the SQL editor as well as psql:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'course_values' AND table_name = 'products'
ORDER BY ordinal_position;
```

The four columns are id, name, stock and note. Stock is nullable, even though it has a default and a check. Predict the three rows, then run:

```sql
SELECT id, stock, note IS NULL AS missing, note = '' AS empty,
       COALESCE(stock, 0) AS displayed
FROM course_values.products
ORDER BY id;
```

Expected (NULL below means a null result):

| id | stock | missing | empty | displayed |
|---|---|---|---|---|
| 10 | 0 | false | false | 0 |
| 20 | NULL | true | NULL | 0 |
| 30 | 0 | false | true | 0 |

Select stock for row 20 again. It remains NULL. Explain why the display expression did not change storage.

## Repair the question

These queries are meant to find unknown stock and stock different from zero, including unknown stock. Both need repair:

```sql
SELECT id FROM course_values.products WHERE stock = NULL;
SELECT id FROM course_values.products WHERE stock <> 0;
```

Before changing them, predict their current results. Both return no rows. The repaired queries each return id 20. Use the article's comparison tools; equivalent correct SQL is welcome.

Now predict each write and run it separately:

```sql
INSERT INTO course_values.products (id, name, stock) VALUES (40, 'Bowl', NULL);
INSERT INTO course_values.products (id, name, stock) VALUES (41, 'Plate', -1);
INSERT INTO course_values.products (id, name, stock) VALUES (42, NULL, 3);
INSERT INTO course_values.products (id, name, stock) VALUES (43, '', 3);
```

The first and fourth succeed. The negative stock fails with 23514; the missing name fails with 23502. Inspect IDs and stock after each failure: rejected rows 41 and 42 must be absent. Empty text passed NOT NULL.

Run SELECT '12'::integer AS stock; then separately SELECT 'twelve'::integer;. Expect 12, then 22P02. Compare these to SELECT DATE '2026-10-20' AS sale_date, true AS active;. Type conversion and business validation answer different questions.

## Implement a stated policy

Reset. You now know the tea's stock is four because someone counted it. The shop requires a known, nonnegative stock and a name containing at least one character other than an ordinary space.

1. Insert bowl 40 with stock 2 and explicitly request the default note.
2. Record the tea's count, then make missing stock invalid.
3. Add the nonblank name rule without changing existing product names.
4. Try new rows with NULL stock, negative stock, a NULL name, empty name and space-only name. Each must fail; a normal product with omitted stock must still succeed with zero.

Use ALTER TABLE ... ALTER COLUMN ... SET NOT NULL for required values and ALTER TABLE ... ADD CONSTRAINT ... CHECK (...) for the name rule. Do not replace an unknown fact merely to make validation pass.

Expected state before your extra probe rows: product IDs 10, 20, 30, 40 have stock 0, 4, 0, 2. Row 40's note is 'not supplied'. Keep probe IDs distinct and inspect state after failures.

## Independent transfer

The reservations table allows an unknown contact. Empty or space-only contacts should be represented as NULL. Preserve sam@example.test.

Normalize the supplied empty contact, then add a rule allowing NULL or a nonblank contact. Prove that an unknown contact can still be inserted, while empty and space-only contacts are rejected. This rule does not validate an email address or guarantee deliverability.

Expected rows after cleaning: 1 has NULL, 2 has NULL, 3 has sam@example.test.

## Hints and solution

First hint: defaults, required values and allowed values are separate decisions. Second hint: use IS NULL or IS DISTINCT FROM for the repaired queries; btrim(contact) = '' selects the supplied empty/space-only contact for cleaning.

The complete [solution](solution.sql) implements the stated policies after a reset. Compare its stored rows and your rejected-write evidence, not the spelling of your SQL. Reading it completes guided practice; rerun a changed contact policy without it before recording independent success.

At the next session, use a fresh scratch table to allow unknown stock but reject zero. Predict whether CHECK (stock > 0) alone permits NULL. Run these statements separately; the last should fail with 23514, leaving the single NULL row. Reset the lab before repeating this probe.

```sql
CREATE TABLE course_values.positive_stock (stock integer CHECK (stock > 0));
INSERT INTO course_values.positive_stock VALUES (NULL);
INSERT INTO course_values.positive_stock VALUES (0);
```

This fresh table isolates the rule. Adding a stricter check to products would also require deciding what to do with its existing zero values; that is a later migration question.
