# Did the order fail, or did its response go missing?

A shop assistant at North orders three packs of Breakfast Tea at ₹20 each. PostgreSQL commits the order. The assistant never sees the receipt and presses the button again. It takes only one more successful transaction to create two orders for a customer who wanted one. What information could make that second press recover the first receipt?

[Lesson 29](29-order-snapshots.md) taught the order line to remember the price the customer accepted. [Lab 32](../labs/32-request-replay/README.md) gives the caller a way to find the result of that particular purchase again. Stock has already been confirmed. The supplied Node caller performs a real commit, deliberately discards the first return value, and calls the same operation again. You can inspect the saved rows between calls in the SQL walkthrough.

## Give an intention an identity

Stripe's engineering account describes the awkward interval between completing work and telling a client it succeeded. The client can send the same operation identifier on another attempt. A server that has already completed that operation can return its saved result. That design changes what the client must remember before it first sends a request. Our exercise adapts the decision to a shop with one database and its own rules about successful orders. [Stripe's engineering account](https://stripe.com/blog/idempotency)

North sends store North, request key `counter-1`, local SKU `17`, and quantity 3. It generates or chooses that key once for this intention and retains it across attempts. Another purchase of three identical packs gets a fresh key. Otherwise a perfectly legitimate second purchase could disappear. Another store can reuse the same text under our shop's store-scoped agreement. The fixture supplies the store. A system serving logged-in people would also have to establish who may act for it.

The saved input contains the SKU and quantity. The price is read from the offer when the order is first accepted. A subsequent catalog price change is therefore no change to what the caller submitted. By contrast, receiving quantity 4 under the original key would leave the shop guessing whether to alter an existing order. Reject the conflict and let the caller make a separate decision.

## What if both attempts arrive together?

Imagine doing a lookup, finding no request, and then creating an order. Two connections can each complete that lookup before either inserts anything. Our operation starts by inserting the scoped request key under a uniqueness constraint. When another transaction is already inserting that key, the contender waits for its outcome. It can then take one of two paths at Read Committed.

If the creator commits, the contender's insert does nothing. A subsequent locking read inside the function retrieves the committed request. Compare the saved input with the submitted input. For a match, return the saved receipt immediately. North can even remove the offer from its catalog afterward. A retry still knows the accepted description, price and order ID because it has all of those facts before it needs any catalog lookup.

If the creator rolls back, its request row and order disappear together. The waiting insert can now establish the key. This caller reads the offer and makes the order. A failed quantity check or missing offer must also leave the key available. The final receipt, order header, and order line commit together with the request record. In this fixture successful results last until the lab is reset. Expiring a key would change how late a retry can safely arrive.

## Read the caller's evidence

A receipt for the first order includes the accepted SKU and description, quantity 3, unit price 2000 paise, and total `"6000"`. The calculation uses a wide integer and sends the total as decimal text so a JavaScript consumer can preserve every digit. Compare the entire receipt, including its order ID. Two distinct orders can have identical totals. Also count the order headers and lines. Matching response bodies alone would miss a caller that returned the old receipt but accidentally inserted another order.

Inside the caller there is a second, shorter loop. When PostgreSQL reports a serialization failure or a deadlock, that attempt can be rolled back and the entire database transaction tried again. The supplied policy allows three attempts in all and inserts a short increasing delay with jitter before each retry. A conflicting payload goes back to the caller immediately. If all three attempts encounter a retryable failure, the caller surfaces exhaustion with the final database error as its cause. [PostgreSQL retry guidance](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html)

Successful commit ends that loop. The simulated loss takes place afterward. The next call carries the original key because the caller lacks an outcome, not because it knows the first transaction failed. An actual connection loss during commit can also leave the outcome unknown. This exercise verifies a discarded response in the supplied caller and makes no measurement of network behaviour.

**Return after a gap.** East accepts a workshop booking for ₹800, changes the advertised fee to ₹850, then receives two messages. One repeats the booking key and one carries a new key. Predict both confirmations and the number of bookings. Try the training-centre task before opening its worked answer.
