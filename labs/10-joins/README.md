# Lab 10 — Preserve the intended population

Read [the article](../../articles/10-joins.md), choose an environment in [the lab guide](../README.md), and run [setup.sql](setup.sql). It resets only course_join. No earlier lab state is needed.

## Inspect and predict

Inspect customers and orders, ordered by id, and read their declarations. State what one row means in each table.

1. Predict the customer/order pairs for INNER JOIN: (1,101), (1,102), (2,103).
2. Use LEFT JOIN: add (3,NULL). Explain why order 104 is absent.
3. Use FULL JOIN: include all five pairs, adding (NULL,104). Order by customer ID NULLS LAST, then order ID.
4. Reverse the tables and use RIGHT JOIN to reproduce the customer-preserving result.
5. Count a CROSS JOIN: twelve rows, not four. COUNT(*) counts output rows; the next lesson explains counting in more detail.

Inspect row IDs, not only customer names. Two Riya rows represent different orders.

## Repair a plausible query

Run this query, then repair it to retain every customer:

```sql
SELECT c.id AS customer_id, o.id AS order_id
FROM course_join.customers c
LEFT JOIN course_join.orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
ORDER BY c.id, o.id;
```

Before repair it returns (1,101), (2,103). After repair it must also return (3,NULL). Move the match restriction only after explaining how the requirement differs from “customers who have paid orders.”

Insert order 105 for customer 3 with status pending. The repaired query must still return (3,NULL); a pending order does not qualify. The original query still drops customer 3. Reset after this variation.

## Two roles, one table

Return ticket ID, creator name and assignee name. Expected: 1/Asha/Bo and 2/Asha/NULL. Use separate staff aliases and the two appropriate keys. Repair a version that accidentally uses created_by for both roles; it incorrectly names Asha as ticket 1's assignee.

## Independent transfer

List every club and its active membership IDs. Expected: (10,1), (20,NULL), (30,NULL). Club 20 has an inactive membership, which is different from having no membership at all.

Change the brief to only clubs without active members. Expected IDs: 20,30. Test the joined membership's non-null key for absence. Then add a second active membership to club 10: the first report should contain two club-10 rows, while the absence report stays 20,30.

## Hints and solution

Conceptual hint: decide which source rows must survive. Intermediate check: place an active/paid restriction inside the matching rule when the brief preserves all parents. Inspect the matched key to detect absence.

Reset before [solution.sql](solution.sql). It supplies the successful queries for the original fixture. Equivalent SQL is acceptable if rows, multiplicity and requested ordering agree. Record whether you used help for the independent task.

Return later: if orders.customer_id becomes NOT NULL, does that force Dev to have an order? Answer: no. It requires each order to reference a customer; it does not require every customer to be referenced.
