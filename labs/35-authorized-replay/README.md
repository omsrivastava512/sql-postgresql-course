# Lab 35: recover an authorized accepted result

Read [the lesson](../../articles/35-authorized-replay.md) and use the [dedicated environment](../../supabase/README.md). This lab has its own membership, offer, order and request tables; it does not require running the earlier lab fixtures.

```powershell
node --env-file=.env.auth-course labs/auth-fixture.mjs reset 35
node --env-file=.env.auth-course labs/35-authorized-replay/request.mjs alice place counter-1
node --env-file=.env.auth-course labs/35-authorized-replay/request.mjs alice read counter-1
```

The default command places three packs of North's SKU 17. Save the complete returned receipt. Expect total `"6000"` in paise, not a new ID every time you repeat the same command. Read [setup.sql](setup.sql), [solution.sql](solution.sql) and [request.mjs](request.mjs), locating identity, admission, key arbitration, payload comparison, accepted writes and response construction in that order.

## Inspect the accepted facts

Use the separate administrator connection:

```sql
SELECT * FROM course_auth35_private.orders;
SELECT * FROM course_auth35_private.order_lines;
SELECT store, actor, request_key, sku, quantity, receipt
FROM course_auth35_private.requests;
```

There should be one order, one accepted line and one completed request. Change North's offer to 2200 paise and repeat the original command:

```sql
UPDATE course_auth35_private.offers SET unit_price_paise = 2200
WHERE store = 'North' AND sku = '17';
```

The original key must still return the complete original receipt. A fresh intentional key accepts the new price. Try the original key with quantity 4 using the optional command arguments:

```powershell
node --env-file=.env.auth-course labs/35-authorized-replay/request.mjs alice place counter-1 North 17 4
```

Expect payload conflict `22023` and unchanged accepted facts. Delete the current offer and retry the original equal payload: its receipt should still be recoverable. A new key for the missing offer must fail without leaving a completed request or order. Reset before the following permission exercise.

## Change permission, not history

Place `counter-1` once after reset. Use its stored actor to downgrade only that member:

```sql
UPDATE course_auth35_private.memberships SET can_place = false
WHERE store = 'North' AND actor = (
    SELECT actor FROM course_auth35_private.requests
    WHERE store = 'North' AND request_key = 'counter-1'
);
```

Predict three outcomes: a new order key is denied, the matching command retry is denied, and `read counter-1` returns the original receipt. Check that no accepted row changed. Then set that membership's `active` value to false. Both operations must deny. The accepted order remains. Set `active` and `can_place` back to true: the old key must recover its old receipt rather than produce another order.

The SQL subquery above is unambiguous in this fresh single-actor exercise. Once two actors have same-text keys, always include the actor in an administrative lookup; the actual RPC already does so. A caller never supplies an actor override.

## Predict the concurrent schedules

The integration checker uses separate native sessions and actual HTTP requests. Before running it, predict these results:

| Schedule | Required result |
| --- | --- |
| Same actor, different keys | Both pass shared membership admission |
| Equal keys, creator commits | Contender receives the same accepted receipt |
| Equal keys, creator rolls back | Contender may establish the request and accept its payload |
| Removal commits before admission | New operation denies |
| Operation admits before removal | Removal waits for that transaction |
| Permission update under a key-share negative control | Non-key permission change need not wait |

A third SQL observer uses blocker information to locate the wait. Test-only synchronization belongs in administrator-controlled fixture objects, never a public RPC delay or bypass parameter. Native claim-setting probes establish SQL locking behavior; the real Auth/API cases separately establish the user-request boundary.

The checker also injects failure after intermediate order work and verifies rollback; tests POST versus GET and STABLE versus VOLATILE modes; and breaks a real HTTP response path. A deliberately withheld known success and an early disconnect are separate experiments. Do not describe every timeout as proof that the transaction rolled back.

## Independent transfer

A training centre accepts Alice's one-seat workshop booking for ₹800. The fee later rises to ₹850. Alice loses permission to create bookings but retains permission to recover her own confirmations. Bob belongs to a different centre and knows Alice's request key.

From a fresh reset, add the workshop offer yourself. Hint: reuse the integer-paise representation and store/SKU key. The [reference seed](transfer.sql) adds only that offer. Then run:

```powershell
node --env-file=.env.auth-course labs/35-authorized-replay/request.mjs alice place workshop-1 North workshop 1
```

Record the accepted ID and total `"80000"`. Change the workshop offer to 85000 paise, then downgrade Alice as in the earlier exercise, using `workshop-1` to locate her request. Predict the command retry, receipt read and a fresh booking key. Independently prove one accepted booking remains at 80000 paise. Alice's read succeeds; both placement attempts deny.

Bob's North lookup initially denies because he lacks North membership. As an explicit second requirement, grant Bob North receipt-read membership administratively, using Bob's existing South membership to select his fixture ID. His `read workshop-1 North` now returns `null`, not Alice's confirmation. Store membership alone does not turn an actor-owned request into a staff-visible record.

Keep your original predictions and the first hint used. The reference policy does not delegate another person's receipt; a staff reconciliation operation would require a separate design.

## Return and completion evidence

At the next session, recover a receipt after repricing without reading the offer. Around a week later, explain the two revocation orderings. Around a month later, choose an operation identity for a cancelled response in another domain and state its retention policy.

Run `node --env-file=.env.auth-course tests/verify-authenticated-access.mjs` for later integration evidence. The checker reports incomplete coverage as a nonzero exit; source code containing a scenario is not proof it ran. SQL-only checks passed; live local execution, hosted execution and reader attempts remain pending. Hosted configuration is a placeholder template.
