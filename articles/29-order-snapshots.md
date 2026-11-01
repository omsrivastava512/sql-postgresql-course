# What price did this customer accept?

A customer buys three packs of Breakfast Tea at North for ₹20 each. Tomorrow the shelf says *Morning Tea*, SKU `17A`, ₹22. A receipt that multiplies yesterday's quantity by today's offer will now say ₹66. The customer accepted ₹60. Which facts must you write while you still know them?

[Lab 14](../labs/14-reusable-reports/README.md) gave you historical amounts to report. In [lab 29](../labs/29-order-snapshots/README.md) you write them yourself. Stock has already been confirmed, as in [lab 16](../labs/16-competing-claims/README.md). Here the database receives a store, a local SKU, and a positive whole-pack quantity. The price comes from the matching offer.

## Read a real order line

Examine Saleor's open-source `OrderLine`. Alongside a nullable variant reference with `SET_NULL`, the model stores product and variant names, a SKU, currency, and monetary fields including a unit net amount. You can point to fields with two different lifetimes in the same row. The source shows the representation. Our shop uses its own simpler INR rule and links to a store offer. To test what that choice buys us, we'll retire the offer and then print the receipt again. [Saleor order model at the inspected revision](https://github.com/saleor/saleor/blob/5acd08ffe7389d7323344dd3e1398d8a46367919/saleor/order/models.py#L567)

| Value | Where the shop reads it | What a later catalog edit should do |
|---|---|---|
| Current display name and current shelf price | Product, variant and offer | Update the next sale |
| Accepted description, local SKU, quantity and unit price | Order line | Preserve the accepted terms |
| Optional path back to the current listing | Order line's offer reference | Clear the link when the offer is removed |

In lesson 27, two names for the **same current fact** were an error. Here two names answer questions about **different sales**. Calculate each total from that line's accepted unit price and quantity. Cast to bigint before multiplication to give the result room. For three packs at 2,000 paise you get 6,000 paise, or ₹60.

## Write the two rows together

Follow the SQL in the [reference solution](../labs/29-order-snapshots/solution.sql). Its function lets you repeat the same statement with different inputs. For North, `17`, quantity 3, track how many rows pass each stage.

1. **selected** looks up the store and SKU and joins to the pack and product. Both together identify one offer. The resulting row carries the description *Breakfast Tea 50 g* and price 2,000.
2. **new_order** inserts a header *from selected* and uses `RETURNING order_id` to pass its generated ID to the line insert. An unknown SKU gives this step zero input rows.
3. **The line insert** combines the returned ID with the selected terms and the requested quantity. A zero quantity fails the line check. The whole statement fails, including the header write.

The data-modifying common table expression and the line insert share a PostgreSQL statement snapshot. The new header reaches the final insert through its returned row. A separate price lookup between two application calls could read a later offer. This example covers the terms accepted in this statement. A quote that must remain valid for ten minutes would need its own agreement about price and expiry. [PostgreSQL 17 on data-modifying WITH queries](https://www.postgresql.org/docs/17/queries-with.html#QUERIES-WITH-MODIFYING)

## Print both receipts

| Accepted item | Accepted SKU | Packs × paise | Total |
|---|---|---|---|
| Breakfast Tea 50 g | 17 | 3 × 2,000 | ₹60 |
| Morning Tea 50 g | 17A | 3 × 2,200 | ₹66 |

Predict what happens to those four columns if the offer is deleted. They keep their values. Only the separate offer reference becomes NULL. A report that inner joins to the live offer would hide both sales. Read the accepted values directly from the order lines. A role with write access can still edit these ordinary rows. Tamper-evident accounting requires additional controls.

**Return after a gap.** A training centre raises its fee after a learner books. Which number belongs in today's listing and which in the booking confirmation? Try the [independent design brief](../labs/29-order-snapshots/README.md#independent-transfer) before opening its reference.
