# Lab 11 — Keep each fact's contribution

Read [the article](../../articles/11-aggregate-grain.md) and run [setup.sql](setup.sql) using [the lab guide](../README.md). It resets only course_totals. Run intentional errors separately outside a transaction.

## Inspect before summing

Inspect lines and payments for order 101. Write the six line-ID/payment-ID pairs produced by joining them: (1,1), (1,2), (1,3), (2,1), (2,2), (2,3). Predict the article's incorrect totals, then execute its query: six rows, 6000 line cents, 3000 net payment cents.

Try SUM(DISTINCT quantity * unit_cents). It yields 1000 for these equal-valued lines. Explain why deduplicating the numerical value loses a real fact.

## Repair at the intended grain

Write one query returning every order, its line total and net payment total. Before combining, inspect each one-row-per-order summary.

| Order | Line cents | Net payment cents |
|---|---|---|
| 101 | 2000 | 1500 |
| 102 | 500 | 0 |
| 103 | 3000 | 3000 |
| 104 | 700 | 700 |
| 105 | 0 | 0 |

This table deliberately includes cancelled order 104. The task is a reconciliation of stored facts, not a sales eligibility policy. Change the request to paid orders only: IDs 101,103,105 remain; their line total is 5000 and net payments total 4500.

Insert an additional 100-cent capture for 101. Its line total must remain 2000; net payments become 1600. Reset afterward.

## Three filters and two counts

1. Group lines by order and retain totals at least 2000: expected 101/2000 and 103/3000. An aggregate in WHERE fails with 42803; repair it with the group filter.
2. Report captures and refunds separately with FILTER. Expected 101/2000/500, 103/3000/NULL and 104/700/NULL.
3. For order 105, LEFT JOIN lines and compare COUNT(*), COUNT(l.id) and SUM(l.quantity * l.unit_cents). Expected 1,0,NULL.
4. Query a nonexistent order directly in lines with COUNT(*) and SUM(...). Expected 0,NULL. Explain why “no group” and “an aggregate over no rows” need different result expectations.

## Independent transfer

Every subscription account must show its total usage units and receipt cents. Account 1 has usage 2 and 3, and receipts 100 and 200. Account 2 has usage 4 and no receipts.

Expected: account 1 = 5 units/300 cents; account 2 = 4 units/0 cents. A naive join gives account 1 ten units and 600 cents. Repair it without assuming unit counts or receipt amounts are unique.

Change the brief: add account 3 with no usage or receipts. It must appear as 0/0. Explain why an inner join between the two summaries would omit valid report rows.

## Hints and solution

Conceptual hint: name the grain of every intermediate result. Intermediate check: each summary must have at most one row for each parent key before the summaries are joined.

Reset before [solution.sql](solution.sql). Its derived-table queries implement both domains. Equivalent solutions are accepted; explain why your output remains correct when an extra payment is added.

Return later: what if the brief asks for one row per payment rather than per order? Answer: repeated order data may be intentional, but summing those repeated order totals is still a separate question.
