# Lab 28 — Give each store its own listing

Run [setup.sql](setup.sql) in a disposable database. It resets only `course_offers`. The [lesson](../../articles/28-store-offers.md) explains why the store matters. The feed holds three incoming rows. Treat it as input you need to validate.

## Find the ambiguous lookup

```sql
SELECT store_id, store_sku, variant_code, unit_price_paise, stock_units
FROM course_offers.offer_feed WHERE store_sku = '17' ORDER BY store_id;
```

Expect North/T50/2000/12 and South/B50/1500/8. Now change the filter to `variant_code = 'T50'`. North and South also disagree about the price and stock of the same pack. Explain which columns identify the customer's intended shelf label and which identify a store's listing for a known pack.

## Build an offer and try to break it

Create an offers table with a generated primary key, a required store reference, a required variant reference, a local text SKU, nonnegative integer price in paise, and nonnegative integer stock. All business key and amount columns are required. Enforce one local SKU per store and one current offer per store and variant. Load the feed. Preserve both uses of SKU 17.

Before changing a price, predict the results for all three listings. Change only North/17 to 2,200 paise. Read the rows ordered by store and local SKU. Prices should be 2,200, 1,500 and 2,300 respectively.

Try these inserts separately in autocommit. Use the listed values for store, SKU and variant, plus price 100 and stock 1. Check the table again after each failure.

| Store | SKU | Variant | What the input tests | Expected SQLSTATE |
|---|---|---|---|---|
| North | 17 | T100 | A second pack under North's existing code | 23505 |
| North | 99 | T50 | A second local code for North's existing pack | 23505 |
| North | 99 | X | Unknown pack | 23503 |
| East | 99 | T100 | Unknown store | 23503 |

## Distinguish no stock from no listing

For every store and every pack, report the SKU, price and stock **if an offer exists**. There are two stores and three packs. Your result should contain six rows, including South/T50 with SKU 81 and stock 0, and North/T100 with NULL for all three offer fields. If both results say 0, show how your caller could still tell which pack has a price.

<details>
<summary>Hints and worked solution</summary>

Keep the generated ID and both business uniqueness rules. Filter the update by store and local SKU together. For the coverage report start with a CROSS JOIN of stores and variants. LEFT JOIN offers on both components of that pair. Refer back to [preserving outer rows](../../articles/10-joins.md) if the result only contains three rows.

Reset before running [solution.sql](solution.sql). It creates the table, imports the three rows, changes North's price and prints the six-row report. Run the failure probes against the finished table.
</details>

**Transfer.** If North now offers a pack at separate pickup and delivery prices at the same time, decide what a listing represents. Which lookup would become ambiguous without a fulfilment choice?
