# Why did renaming one product give it two names?

A shop renames its tea. Search for the 50 g pack and the catalog says *Breakfast Tea*. Pick the 100 g pack and it still says *Tea*. Both rows passed the database checks. Which row should the shopkeeper edit next time?

| Variant | Product | Name before the edit | Pack |
|---|---|---|---|
| T50 | TEA | Tea | 50 g |
| T100 | TEA | Tea | 100 g |
| B50 | BIS | Oat Biscuits | 50 g |

In [lab 27](../labs/27-product-variants/README.md) you'll reproduce the disagreement, decide which facts belong together, and prove that every sellable pack survives the repair. This is a general SQL design question. The runnable example uses PostgreSQL.

## What identifies a fact?

A row in the flat catalog describes **one sellable pack**. Its variant code identifies the whole row. But the shop also promises that a product code has one current name shared by every pack. Giving two rows the same product code commits you to giving them the same product name. That's a *functional dependency*, written `product_code → product_name`. Changing just T50 breaks that promise. A primary key on the variant code sees two different variants and accepts the edit.

Here are the shop's two ways to identify a pack. The SKU team issues each variant a unique code. The buyer also promises to carry at most one variant of a given weight per product. That makes both `variant_code` and `(product_code, pack_g)` **candidate keys**. Each identifies a row and has no unnecessary column. The two teas rule out product code alone. Biscuits and tea at 50 g rule out weight alone. Three example rows can disprove a key. They can't promise that future data will obey it.

## Repair one fact and recover every pack

The buyer confirms that **Breakfast Tea** is the approved name for TEA. Until you have that decision, choosing a name alphabetically would turn a disagreement into a guess. Put the approved product names in a products table. Put T50, T100 and B50 in a variants table, each with a required reference to its product. The join now produces both tea rows from one stored name.

```sql
SELECT v.variant_code, p.product_name, v.pack_g
FROM course_variants.variants AS v
JOIN course_variants.products AS p USING (product_code)
ORDER BY v.variant_code;
```

You should see B50/Oat Biscuits/50, T100/Breakfast Tea/100 and T50/Breakfast Tea/50. Predict what happens if you rename TEA to *Morning Tea* in products. The update touches one row. The next read shows the new name twice because both variants follow that reference. Moving the shared fact into the table it describes is an example of **normalization**. The lab also checks the full reconstructed rows, since losing one pack and duplicating another could leave the total count unchanged.

## When would the key stop working?

Suppose loose tea and tea bags can both be sold in 50 g packs under TEA. The business has changed. The variant codes can still identify the packs. The rule about product and weight would reject a legitimate listing. In a library, would a book and its paperback edition always have the same identifying facts? Name one fact an editor can change for the book and one that can differ by edition.

**Return after a gap.** Explain what the variant primary key already protected and why it admitted the two names. Revisit [row identity](09-row-identity.md) for the difference between choosing a primary key and keeping other business keys. Continue to [store offers](28-store-offers.md) when two stores legitimately disagree about one pack's price.
