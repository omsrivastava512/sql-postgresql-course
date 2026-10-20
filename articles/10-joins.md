# Which rows survive a join?

Riya has two orders, Sam has one, and Dev has none. A customer list must show all three people. An order list must also include a guest order with no customer ID. One query cannot quietly decide which of those facts matters.

By the end, predict each joined row, preserve the side named in the requirement, and distinguish a missing match from a missing field.

**Scope:** general SQL joins and aliases, executed in PostgreSQL. These queries do not implement access control.

## Start with the relationship

Run [lab 10's setup](../labs/10-joins/setup.sql). Customers are 1/Riya, 2/Sam and 3/Dev. Orders are 101/customer 1/paid, 102/customer 1/pending, 103/customer 2/paid and 104/NULL/paid.

The foreign key permits the guest order because customer_id is nullable. It does not give every customer an order. A join asks which pairs of rows satisfy its condition:

```sql
SELECT c.id AS customer_id, o.id AS order_id
FROM course_join.customers c
JOIN course_join.orders o ON o.customer_id = c.id
ORDER BY c.id, o.id;
```

Here c and o are aliases: shorter names for these table references. The result is (1,101), (1,102), (2,103). Riya appears twice because two pairs match. An inner join keeps matching pairs; it does not promise one output row per customer.

## Preserve customers, including those without a match

Change JOIN to LEFT JOIN. The three pairs remain and (3,NULL) is added. The NULL here stands in for an absent order row. Test o.id, a non-null key, when asking whether a match exists; testing a nullable order field could confuse an existing incomplete order with no order.

A RIGHT JOIN preserves the table on its right. Reversing the table order and using LEFT JOIN can express the same preservation requirement. A FULL JOIN preserves both sides: this fixture also produces (NULL,104) for the guest order.

A CROSS JOIN has no matching condition. Three customers and four orders produce twelve combinations. That can be intentional, as with every reporting period crossed with every account, but it is not a customer-order relationship.

## A filter can remove the row you preserved

The request changes: show every customer and their paid orders, including customers with none.

```sql
SELECT c.id AS customer_id, o.id AS order_id
FROM course_join.customers c
LEFT JOIN course_join.orders o
  ON o.customer_id = c.id AND o.status = 'paid'
ORDER BY c.id, o.id;
```

Expected: (1,101), (2,103), (3,NULL). The status condition limits matches. If instead it appears in WHERE after the join, Dev's padded row fails the condition because NULL = 'paid' is unknown. Dev disappears.

This does not mean every right-table filter belongs in ON. WHERE is correct when the intended report excludes customers without qualifying orders. State the population first.

## Two references do two jobs

A ticket can have a creator and an assignee, both drawn from staff. Join staff twice with different aliases and different reference columns. The supplied ticket 1 was created by Asha and assigned to Bo; ticket 2 was created by Asha and is unassigned. An inner join for the assignee would silently lose ticket 2.

Saying “join to staff” is incomplete. Name the role and whether it is optional.

## Practise and return

The [lab](../labs/10-joins/README.md) repairs a disappearing-customer query and independently lists clubs with active memberships. It also changes the brief to clubs with no active members.

After a gap, draw the matching pairs before writing SQL. Explain why repeated customer values are not automatically duplicate source records. The next lesson uses this same multiplication to expose a wrong total.

**Requires:** [row selection](08-selecting-rows.md), [foreign keys](01-foreign-keys.md) and [row identity](09-row-identity.md).
**Next:** [Why did the total multiply?](11-aggregate-grain.md).
**Reference:** PostgreSQL [joined tables and table expressions](https://www.postgresql.org/docs/17/queries-table-expressions.html).
