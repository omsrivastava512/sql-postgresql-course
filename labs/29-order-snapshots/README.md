# Lab 29 — Write a receipt that survives a catalog change

Run [setup.sql](setup.sql) in a disposable database. It recreates only `course_receipt`. Read [the lesson](../../articles/29-order-snapshots.md). Start after stock confirmation. Record one accepted pack type per order for this exercise.

## Inspect the offer and write the sale

Join offers to variants and products. For North/17 you should find T50, Breakfast Tea, 50 g and 2,000 paise. For South/17 you should find biscuits. For North/81 you should find nothing.

Create an order header with its own generated ID and store, and an order line identified by order and line number. Preserve the accepted description, local SKU, positive quantity and unit price in paise on the line. Keep a nullable offer reference with ON DELETE SET NULL. Use the database's current offer to supply the terms.

Write one statement that selects North/17, inserts the header from that result, and inserts the line using its returned order ID. Run it for quantity 3. There should be one header, one line and a 6,000-paise total. A callable SQL function is one way to reuse the statement.

## Change the catalog and inspect the evidence

1. Change TEA's name to *Morning Tea*, then change North/17 to SKU 17A at 2,200 paise. Read the first receipt. It must still print *Breakfast Tea 50 g*, SKU 17 and 6,000 paise.
2. Accept North/17A for quantity 3 and read both receipts in order. The second should say *Morning Tea 50 g*, SKU 17A and 6,600 paise. Record the live offer ID on each line.
3. Delete North/17A. Read the receipts directly from the order and line tables. Both totals, quantities and labels should survive, with two NULL offer links.

If you want the worked run, start again with setup and run [solution.sql](solution.sql). It performs all three steps and provides the function and receipts view used below. With your own implementation, use its corresponding write and read operations.

## Can a header escape a failed sale?

At the end of the worked run the retired North listing is absent and South/17 still exists. Run the following statements **separately**, in autocommit. Before each attempt, predict how many headers and lines it can add.

```sql
SELECT * FROM course_receipt.accept_offer('North', 'missing', 3);
```

Expect an empty result. Now try an existing offer with an invalid quantity.

```sql
SELECT * FROM course_receipt.accept_offer('South', '17', 0);
```

Expect 23514 from the line's quantity check. Inspect the counts. Both must be 2 after either attempt. An identity value consumed by a failed insert can leave a gap. Count stored rows to check atomicity.

```sql
SELECT (SELECT count(*) FROM course_receipt.orders) AS headers,
       (SELECT count(*) FROM course_receipt.order_lines) AS lines;
```

<details>
<summary>Hints for the shop</summary>

Use a selected-offer CTE with a store-and-SKU predicate. INSERT the header with SELECT FROM that CTE. Use the header's RETURNING row as input to the final INSERT alongside the selected offer. An unconditional header insert would leave an empty order for an unknown SKU. Use quantity::bigint times the accepted unit price when printing the line.
</details>

## Independent transfer

A learner books **SQL basics** at East for ₹800 under booking code 7. West uses code 7 for **Map reading** at ₹700 and code 9 for **SQL basics** at ₹900. Each centre may list a workshop only once. East then raises its SQL fee to ₹850.

Start with a blank design. Submit your schema, a booking operation, and a pair of ordered queries you can run before and after changing East's fee. Include two rejected writes that test **different** business rules, with the exact rows you checked afterward. Equivalent designs are welcome if they produce the specified results.

For a learner trial, try it once before opening the hint. Record the first query or decision where you needed help, the hint you used, and whether you could explain the outcome independently. If you needed none, keep your first unaided result. This record belongs to the learner doing the task.

<details>
<summary>First hint</summary>

Which fact can change at East while West stays at ₹900? Which fact must still answer the question “what did the learner book for ₹800”?
</details>

<details>
<summary>Check your design against a worked answer</summary>

After setup, [transfer.sql](transfer.sql) runs independently of the shop solution. It creates separate workshop, centre, listing and booking tables in the lab schema. It shows all three ordered listings and the East booking both before and after the fee change. Only East/7 moves from 80,000 to 85,000 paise. West/7 stays at 70,000, West/9 at 90,000 and the booking at 80,000.

After the reference, run each statement separately. East/7 cannot also mean Map reading. West cannot relist SQL basics under a second code. Both fail with 23505 from different keys. Repeat the reference's final two reads and check all three listings and the booking.

```sql
INSERT INTO course_receipt.listings VALUES ('East', '7', 'MAP', 70000);
```

```sql
INSERT INTO course_receipt.listings VALUES ('West', '8', 'SQL', 90000);
```

Rerun setup before repeating either worked script from scratch.
</details>
