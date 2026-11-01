# Can two stores use SKU 17 for different things?

A caller sends stock-keeping unit (SKU) `17`. North expects 50 g of tea. South expects biscuits. A lookup by SKU alone finds both. Adding `LIMIT 1` could hand the caller a perfectly valid product from the wrong store.

| Store | Local SKU | Sellable pack | Price | Units on hand |
|---|---|---|---|---|
| North | 17 | T50, Breakfast Tea | ₹20 | 12 |
| South | 17 | B50, Oat Biscuits | ₹15 | 8 |
| South | 81 | T50, Breakfast Tea | ₹23 | 0 |

These are the starting rows of [lab 28](../labs/28-store-offers/README.md). Your job is to locate a listing, change one price, and tell the difference between a listing with no stock and a pack the store never listed.

## Who gets to set the price?

When Instacart prepared its catalog for French-language shopping in Quebec, it had to decide which values could vary by language and where each value belonged. Its account describes shared product attributes, retailer-specific overrides such as descriptions, and a store layer where prices and availability can vary. A shopper switching language at the same store should still see that store's price. A shopper switching stores may see a different price. That distinction helped determine which catalog records needed localization. [Instacart engineering account, January 2022](https://company.instacart.com/tech-innovation/catalog-localization-more-than-just-a-translation)

Our two-store exercise borrows that question about ownership. The fictional shop uses one shared product name. A store chooses its local code, price and stock for each pack it lists. Putting 2,000 paise on the shared T50 row would give only one place to store South's equally valid 2,300. Putting the price on each **offer**, the row for a particular store selling a particular variant, gives each store a value it can change independently.

## Three ways to reach an offer

A generated `offer_id` gives other tables a short reference that survives a local SKU change. A caller reading a shelf label has a different key, `(store_id, store_sku)`. A stock manager who already knows the pack has another, `(store_id, variant_code)`. Our shop allows one current offer per store and variant. Both pairs therefore need uniqueness rules, even though the table already has a primary key. Two new IDs could otherwise identify two contradictory North listings.

```sql
UPDATE course_offers.offers
SET unit_price_paise = 2200
WHERE store_id = 'North' AND store_sku = '17';
```

North's tea now costs ₹22. South's biscuits still cost ₹15 and South's tea still costs ₹23. Using just the SKU in that update would also reprice the biscuits. Using just the variant would also reprice South's tea.

## Zero is an answer

Ask whether South lists T50. The offer exists and its stock is zero. Ask whether North lists T100. The pack exists, but the store has no offer for it. Starting a report from offers loses the second question entirely. The lab starts from stores and variants, then left joins their offers. Inspect the matched offer before converting a missing value to zero.

**Return after a gap.** Two cinemas use screen code A for different rooms. Which key should the booking desk use? If a cinema may sell both matinee and evening offers for the same film, which uniqueness rule would need another dimension? Revisit [joins](10-joins.md) for missing rows and continue to [order snapshots](29-order-snapshots.md) to decide what a receipt should remember.
