# Lab 27 — Repair a product rename

Read [the lesson](../../articles/27-product-variants.md). In a disposable database, run [setup.sql](setup.sql). It recreates only `course_variants`. You can run it again to start over. Use the [lab guide](../README.md) for a connection.

## Make two names disagree

```sql
SELECT * FROM course_variants.flat_catalog ORDER BY variant_code;
UPDATE course_variants.flat_catalog SET product_name = 'Breakfast Tea' WHERE variant_code = 'T50';
SELECT product_code, product_name, pack_g FROM course_variants.flat_catalog
WHERE product_code = 'TEA' ORDER BY pack_g;
```

Expect Breakfast Tea/50 and Tea/100. Write a query that finds every product code with more than one current name, without mentioning tea in your filter. Only TEA should appear. Explain why the flat table's primary key allowed this write.

## Choose the keys and repair the rows

The buyer has approved *Breakfast Tea* for TEA and *Oat Biscuits* for BIS. Each product code has one current name. Each variant code is unique and required. The shop also promises one pack of each weight per product, with positive whole grams.

1. Sketch one row from each proposed table. Underline the smallest sets of columns that identify a row. Would the two 50 g packs still fit?
2. Create the tables. Insert the two approved product rows. Copy each variant's code, product code and pack size from the flat table. Require a valid product reference. Keep the flat table as evidence.
3. Join the new tables and compare all four columns against the expected catalog below. Check missing rows and extra rows, preserving duplicates. Both differences should return zero rows.

| Variant | Product | Approved name | Grams |
|---|---|---|---|
| B50 | BIS | Oat Biscuits | 50 |
| T100 | TEA | Breakfast Tea | 100 |
| T50 | TEA | Breakfast Tea | 50 |

Change only the approved TEA product row to *Morning Tea*. Read the catalog again. Both tea packs should show the new name, while B50 keeps its name and weight. Try adding X50 under TEA at 50 g. The scoped unique rule should reject it (23505). Try adding X10 under an unknown product at 10 g. Expect a foreign-key error (23503). Run expected failures one at a time in autocommit. Confirm that all three original packs still exist.

<details>
<summary>Hints and worked repair</summary>

Group the flat rows by product code and keep groups with more than one distinct name. Choosing the alphabetically first name cannot settle the buyer's intent. In the new design put a primary key on each code and a UNIQUE constraint on the product/weight pair. Use EXCEPT ALL in both directions to compare row multiplicities.

For a worked run, reset and execute [solution.sql](solution.sql). Its final query reports missing and unexpected rows together. It should return none. Now try the single-product rename and the two failing inserts against that design.
</details>

**Transfer.** A publisher sells paperback and hardback editions with distinct edition codes. Would `(book_code, page_count)` identify an edition? Describe two legitimate rows that would break that rule before choosing a key.
