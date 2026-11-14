# The order was accepted. May Alice recover its receipt?

North accepts Alice's order for three packs of tea at ₹20 each. The response connection breaks. Before Alice retries, her manager removes her permission to place orders but leaves her permission to read her own receipts. Should the application create another order, replay the command, refuse every kind of recovery, or read the accepted receipt through a separate operation?

Our fictional policy chooses the last option. The accepted order remains a fact even if Alice's current permissions change. Her ability to read it is a separate authorization decision. This lesson combines the [accepted snapshot](29-order-snapshots.md), [request replay](32-request-replay.md), [verified identity](33-request-identity.md) and [request authorization](34-authorized-requests.md) into one PostgreSQL transaction exposed through Supabase RPC. The [lab](../labs/35-authorized-replay/README.md) supplies the independent fixture.

## Name the intention and its owner

Todd Jefferson's August 2019 Shopify account describes a payment API that identifies requests, coordinates concurrent duplicates and records recovery progress. Its request identity includes a client and an idempotency key. That changes our design question: a key string needs an ownership boundary. Shopify's client identity is not automatically a Supabase user, and its remote-provider recovery workflow is not implemented by our single database transaction. Our synthetic adaptation makes the boundary explicit as store, authenticated actor and key. [Original account](https://shopify.engineering/building-resilient-graphql-apis-using-idempotency)

Alice sends North, key `counter-1`, SKU `17`, and quantity 3. The caller keeps those values when the outcome is uncertain. A second intentional purchase gets a different key. Bob may independently use the text `counter-1`; his authenticated actor makes it a different request. Sharing Alice's key does not delegate Alice's authority to Bob.

The operation derives the actor from `auth.uid()`. The client supplies neither that actor nor the accepted price. The request record preserves the original SKU and quantity. The first successful transaction reads the current offer and stores a complete receipt. Later repricing does not change what Alice submitted and must not rewrite that receipt. A changed quantity under the same key is a conflict, not a request to silently alter history.

## Two operations answer two questions

| Operation | Required current authority | What it may do |
| --- | --- | --- |
| `place_order(store, key, sku, quantity)` | Active membership and placement permission | Accept a new order or replay the matching accepted command |
| `read_own_receipt(store, key)` | Active membership and receipt-read permission | Return that actor's saved receipt without creating anything |

A downgraded reader can call the second operation but not the first. A removed member can call neither. If the same account later rejoins with the required permission, the same old key still identifies its old accepted request. The fixture retains one membership row and changes its state; it does not create a new request namespace for each membership episode.

An authorized lookup for an unknown own key returns `null`. Looking for another actor's same-text key also returns `null` unless the caller has their own accepted request under that text. A caller without receipt permission is denied before the lookup. There is no endpoint for supplying Alice's ID and asking to read her response.

This business policy does not make all store receipts visible to staff. A staff reconciliation interface would need its own authorization rule. If Alice loses both permissions while a response is uncertain, the caller must retain the original intention and surface the unresolved outcome. Denying access is not evidence that the order rolled back.

## Admit the operation before inspecting its result

The command first selects the actor/store membership `FOR SHARE`, then checks the returned active state and placement permission. The receipt reader uses the same lock but checks receipt-read permission. Both hold that lock until their transaction ends. Every fixture permission change updates the same membership row, so it must conflict with admitted operations.

Why a shared lock? Two order commands for Alice should be able to pass admission together and then arbitrate their own request keys. An exclusive membership lock would serialize them before request-key contention. `FOR KEY SHARE` is too weak here: it permits a non-key update such as changing a permission flag. [PostgreSQL row-lock conflicts](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)

At Read Committed, consider two schedules. If removal commits before the waiting operation obtains the membership row, the operation examines the changed state and denies. If the operation obtains its shared lock first, removal waits for that transaction. The accepted order can finish before removal takes effect. This is a defined ordering between cooperating database transactions, not a promise to retract response bytes or stop a response already travelling to the client.

The lock order is membership, then request, then order work. Administrative code must not acquire these resources in the opposite order. Account-wide suspension, multiple grant sources and multi-store operations need additional coordination; this small protocol does not cover them.

## Make acceptance and its evidence atomic

After admission, the command inserts a request identified by `(store, actor, request_key)`, using the unique constraint to arbitrate competitors. It locks the matching request and compares the saved payload. A completed equal request returns the saved receipt immediately. It does not reread today's offer merely to recover yesterday's result.

For a new request, the function reads the offer, writes the order and accepted line, constructs the receipt, and saves that receipt before returning. All these changes belong to the same RPC transaction. If an intermediate write fails, the request reservation and order changes roll back together. A sequence gap after rollback is not a surviving order. [PostgREST request transactions](https://docs.postgrest.org/en/stable/references/transactions.html)

If another transaction is already creating the key, the contender waits. A creator commit leaves a request whose payload and receipt can be checked. A creator rollback leaves the contender free to establish its own request and accept its own payload. The lab tests both schedules with an observer that identifies actual blockers. One final order count cannot tell you whether the contender waited at membership admission or at the unique request key.

The receipt keeps lesson 32's fields: order ID, accepted SKU and description, quantity, integer unit price in paise, and total as decimal text. For three packs at 2000 paise, the total is `"6000"`. Compare the whole receipt and independently count orders, lines and request records. Equal totals alone would not detect two different orders.

## Read-only business intent can still need a write-capable transaction

`read_own_receipt` changes no business record, but its row lock is not permitted in a read-only transaction. Both functions are therefore VOLATILE and called through POST RPC for this lock-coordinated contract. An ordinary GET receipt lookup would need a different revocation contract; changing the HTTP verb without understanding that difference is not a harmless refactor. PostgREST's transaction modes depend on method and function volatility. [Function access modes](https://docs.postgrest.org/en/stable/references/transactions.html#access-mode-on-functions)

The functions execute under a dedicated non-login owner with only the private-table privileges they need. Their safe search path and qualified names prevent an untrusted object from replacing a referenced table. PUBLIC and anonymous execution are revoked, and the authenticated role has no direct mutation privilege on request or accepted-order tables. The functions still derive and authorize the person explicitly: elevated execution privileges are not a person identity. [Safe definer functions](https://www.postgresql.org/docs/17/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

## Recover from the failure you actually observed

The Node caller retries a structured `40001` or `40P01` failure at most three times, retaining the same operation identity. A transport exception instead reports an unknown outcome. It does not declare a rollback or invent another key. The test relay exercises a broken HTTP connection separately from the simpler response-discard demonstration in lesson 32.

After a failed delivery, repeat the command only while placement remains permitted. After a downgrade, use the separate receipt reader. After removal, report that recovery is not authorized and preserve the intention for authorized reconciliation. In every case, inspect the stored facts independently before explaining what happened.

**Independent transfer.** A coordinator accepts a workshop booking for ₹800, the advertised fee becomes ₹850, and the coordinator becomes read-only. Recover the accepted ₹800 result without admitting a new booking. Show that another coordinator who knows the same key cannot recover the first person's receipt.

**Return after a gap.** Why can a denied retry coexist with a successfully committed order? Why does a new login not create a new request identity? Why must deleting old request records be a deliberate retention decision rather than routine cleanup? These questions connect this batch to later session, recovery and external-effect work.
