# Lab 32 — Retrieve an order after its response disappears

Read [the lesson](../../articles/32-request-replay.md). Use a disposable native PostgreSQL database and the [local connection guide](../README.md). Node.js and the course's installed pg dependency are needed for the supplied caller. The caller uses one connection for each transaction. Set COURSE_DATABASE_URL to your local disposable database as described in the guide.

Run [setup.sql](setup.sql) then [solution.sql](solution.sql) in a persistent session. Setup resets only course_replay. The solution installs the reference operation without placing an order. Start every independent run with those two scripts. For competing sessions use A, B and observer C. End transactions before resetting. Use session-local statement and idle-transaction timeouts of 120 seconds and five minutes respectively, as in [lab 31](../31-lock-order/README.md).

## Lose the result

From the repository root run the [supplied caller](request.mjs).

```sh
node labs/32-request-replay/request.mjs
```

The script commits North's order, discards its first return value, then calls again with the same key. Predict the number of orders before inspecting. Rerun the command. Compare the whole receipt including its ID with the first run. A fresh fixture starts at ID 1. Rollbacks elsewhere can leave gaps in generated IDs.

```sql
SELECT * FROM course_replay.orders ORDER BY order_id;
SELECT * FROM course_replay.order_lines ORDER BY order_id;
SELECT * FROM course_replay.requests ORDER BY store, request_key;
```

You should find one order, one line, and one saved request. The line records three packs at 2000 paise. The response contains total_paise as the string "6000". Read the short Node loop and identify the statement after which it can return a receipt. A database rejection with 40001 or 40P01 can restart the entire transaction. A dropped return value comes after that loop.

## Change the catalog and the intention

Run each statement separately. Record the entire original receipt first.

```sql
UPDATE course_replay.offers SET unit_price_paise = 2200, description = 'Morning Tea 50 g'
WHERE store = 'North' AND sku = '17';
SELECT course_replay.accept_order('North', 'counter-1', '17', 3);
SELECT course_replay.accept_order('North', 'counter-2', '17', 3);
DELETE FROM course_replay.offers WHERE store = 'North' AND sku = '17';
SELECT course_replay.accept_order('North', 'counter-1', '17', 3);
```

The original key returns Breakfast Tea at 6000 paise both times. The fresh key creates a Morning Tea order at 6600. Now try quantity 4 with counter-1. Expect a payload conflict (22023) even though the listing is gone. Use a new key for the deleted offer and expect P0002. Check the three tables after each failure. South can accept counter-1 independently for its biscuits because the key includes the store. Try a new South order with quantity zero and inspect the absence of its failed request.

## Race two requests

Reset and install the operation in C. Record B's backend ID. In A run `BEGIN;` then `SELECT course_replay.accept_order('North','race','17',3);` without committing. In B begin a Read Committed transaction and issue the same call. In C use `SELECT pg_blocking_pids(12345);` with B's actual ID. Inspect the three tables. A already knows a candidate receipt but the observer still sees no committed rows.

| End A | Predict B's result | Final inspection after B commits |
|---|---|---|
| Commit | The same receipt, including A's ID | One header, line and saved request |
| Rollback | B makes the purchase and receives its own receipt | One header, line and saved request with B's ID |

Run each branch from a fresh fixture. Repeat the commit branch with B asking for four packs under the same key. B should receive 22023. Roll back B, then check A's three-pack order. Finally retry the rollback branch with a different quantity in B. Decide which payload B should find committed before it attempts to place its order.

## Exercise the attempt limit

Start from a fresh setup and solution. Install this deliberate failure in the disposable lab schema. It fires after the order line has been inserted, when the function saves the receipt. The sequence counts attempts across rollbacks.

```sql
CREATE SEQUENCE course_replay.fault_attempts;
CREATE FUNCTION course_replay.inject_failure() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM nextval('course_replay.fault_attempts');
    RAISE EXCEPTION 'Controlled retry exercise' USING ERRCODE = '40P01';
END;
$$;
CREATE TRIGGER retry_exercise BEFORE UPDATE ON course_replay.requests
FOR EACH ROW EXECUTE FUNCTION course_replay.inject_failure();
```

Run the same Node command again. Expect an error after three attempts, with 40P01 as its cause. In SQL run `SELECT last_value FROM course_replay.fault_attempts;` and the three inspection queries above. Explain why the counter says 3 while all three tables are empty. This trigger supplies a known error to exercise the caller. Lab 31 produces the server's own deadlock detection.

Run `DROP TRIGGER retry_exercise ON course_replay.requests;` and repeat the command. One order now survives and the second call returns the saved receipt. A reset removes the exercise function and sequence.

## Independent transfer

East accepts a booking for workshop 7 at ₹800. The confirmation disappears. East then raises the fee to ₹850. Design the write so a repeat of the first booking returns ₹800 and a second intentional booking returns ₹850. Include West using the same key, and attempt to change the workshop under East's original key. Predict the number and contents of booking rows after each action.

<details><summary>Hint and worked answer</summary>

A booking row can itself hold the scoped key and accepted fee when the fee is the only promised return value. Try your design first. After a fresh setup run [transfer.sql](transfer.sql). Expect two East bookings, at 80000 and 85000 paise. Run `SELECT course_replay.book('West', 'booking-1', '7');` to get 70000, then separately `SELECT course_replay.book('East', 'booking-1', '8');` for 22023. Inspect the same three bookings. The unique pair arbitrates inserts when both readers initially see no booking.

</details>

Deliver the original and replayed results, the stored rows after the conflicting retry, and the first decision where you needed help. Close the sessions. Return later and explain when a fresh key would be the wrong recovery decision.
