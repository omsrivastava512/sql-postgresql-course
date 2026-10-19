# What value did I actually store?

A shop has three products. The mug's stock was omitted from the insert, the tea's stock was explicitly NULL, and the tin's stock was zero. The screen displays zero for all three. Did the database store the same fact?

By the end, you should be able to distinguish supplied input from stored values, predict a missing-value comparison, and choose a rule that rejects the input your application cannot accept.

**Scope:** general SQL ideas, executed with PostgreSQL syntax. The lab does not test another database's NULL or type-conversion behaviour.

## Follow the input into storage

Run [lab 07's setup](../labs/07-stored-values/setup.sql). Its product table is:

```sql
CREATE TABLE course_values.products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  note text DEFAULT 'not supplied'
);
```

An integer stores a whole-number quantity. Text stores characters. A type is not the complete business rule: negative integers are integers, so this table also needs its stock check. Single quotes delimit a text value; an unquoted name identifies a column or table. PostgreSQL double quotes delimit an identifier, not a text value.

The setup runs three inserts:

```sql
INSERT INTO course_values.products (id, name) VALUES (10, 'Mug');
INSERT INTO course_values.products (id, name, stock, note)
VALUES (20, 'Tea', NULL, NULL);
INSERT INTO course_values.products (id, name, stock, note)
VALUES (30, 'Tin', 0, '');
```

| id | Stored stock | Stored note | Why |
|---|---|---|---|
| 10 | 0 | not supplied | Omitted columns use their defaults. |
| 20 | NULL | NULL | Explicit NULL does not request a default. |
| 30 | 0 | empty text | Zero and an empty string are supplied values. |

You can explicitly write DEFAULT in a VALUES list too. The default is an insertion choice, not a rule that replaces every missing-looking input. It does not preserve whether the caller omitted the column or explicitly supplied the same value.

## Inspect instead of guessing from a blank cell

Some clients display NULL and empty text similarly. Ask separate questions:

```sql
SELECT id, stock, note IS NULL AS note_missing,
       note = '' AS note_empty,
       COALESCE(stock, 0) AS display_stock
FROM course_values.products
ORDER BY id;
```

For row 20, note_missing is true, note_empty is NULL, and display_stock is 0. COALESCE chooses the first non-NULL expression for this result. It has not updated stock. A convenient display can conceal uncertainty: unknown inventory is not evidence that the shelf is empty.

## A comparison can be unknown

Predict these expressions for stock values 4, 0 and NULL:

| stock | stock = 0 | stock <> 0 | stock IS NULL |
|---|---|---|---|
| 4 | false | true | false |
| 0 | true | false | false |
| NULL | unknown | unknown | true |

Unknown is represented by NULL in a Boolean result. WHERE keeps rows for which its condition is true. That is why both stock = 0 and stock <> 0 leave out the tea. Use IS NULL to ask whether the value is missing; stock = NULL does not do that.

PostgreSQL's IS DISTINCT FROM compares while treating NULL as a comparable missing marker. NULL IS DISTINCT FROM 0 is true; NULL IS DISTINCT FROM NULL is false. That can help detect whether a supplied value differs from an existing one without losing the missing-value case.

## The check that still accepts NULL

The stock check rejects a negative number, but accepts NULL: its expression is unknown, not false. If the business now requires a known stock quantity, add NOT NULL as well. First decide what an existing unknown quantity means. In this lab a physical count establishes that the tea has four units; silently replacing unknown with zero would invent a fact.

NOT NULL on name also does not reject empty text. A separate check such as CHECK (length(btrim(name)) > 0) rejects names consisting only of ordinary spaces. Here btrim removes surrounding spaces and length counts characters. It is a deliberately narrow rule, not full international name validation.

## Types make a different promise

Try SELECT '12'::integer; PostgreSQL's :: requests an explicit conversion. The result is the number 12. Converting 'twelve' to integer fails before any useful stock rule can be checked. A date literal such as DATE '2026-10-20' represents a calendar date; a Boolean value is true or false. Neither should be confused with arbitrary display text.

UUID identity and instants/timezones need their own questions. This lesson practises text and integer inputs and introduces date and Boolean values; it does not settle all type choices.

## Practise and return

The [lab](../labs/07-stored-values/README.md) starts with inspection, asks you to repair two queries, then gives you a stock policy to implement. Its independent transfer concerns a reservation contact: missing is allowed, empty or space-only text is not. [Hints and a solution](../labs/07-stored-values/README.md#hints-and-solution) are available whenever useful.

At your next session, explain why DEFAULT 0, NOT NULL and CHECK (stock >= 0) do three different jobs. Then explain why displaying a zero proves nothing about stored NULL.

**Requires:** [Reading the examples](00-reading-the-examples.md).
**Next:** [Which rows did I ask for?](08-selecting-rows.md) uses these comparisons to select reads and writes.
**Related:** [Derived values](03-derived-values.md) shows a different reason supplied input and stored data can differ.

**References:** PostgreSQL [defaults](https://www.postgresql.org/docs/17/ddl-default.html), [comparisons](https://www.postgresql.org/docs/17/functions-comparison.html), [conditional expressions](https://www.postgresql.org/docs/17/functions-conditional.html) and [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html).
