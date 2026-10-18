# Lab 01 — Which IDs are acceptable?

Read [the article](../../articles/01-foreign-keys.md). Run [setup.sql](setup.sql), then each task separately.

## Predict and run

1. Run `INSERT INTO course_fk.visits VALUES (100, 10);`.
2. Run `INSERT INTO course_fk.visits VALUES (101, 999);`.
3. Run `INSERT INTO course_fk.visits VALUES (102, NULL);`.
4. Run `INSERT INTO course_fk.patients VALUES (20, 'Sam', 2);`.
5. Inspect both tables with SELECT * and explain each accepted or rejected row.

Expected: task 1 succeeds; task 2 fails with 23503 (foreign_key_violation); task 3 fails with 23502 (not_null_violation); task 4 succeeds even though owner 2 is a receptionist.

## Hints

First hint: inspect profiles as well as patients. Second hint: the FK checks the referenced ID, while NOT NULL checks whether a value was supplied.

## Change the setting

In a shop, order.customer_id references customers.id. Does that prevent an order for a suspended customer? Explain which additional information the rule would need.

Answer: a plain FK doesn't inspect suspended status. That is a separate rule, just as role is separate in this lab.

## Solution and return

Reset before running [solution.sql](solution.sql). It contains the successful writes. The expected failures are intentionally separate so a batch does not stop before you inspect the result.

Remember: a constraint's name tells you what it checks, not every business rule you hoped it would imply.

