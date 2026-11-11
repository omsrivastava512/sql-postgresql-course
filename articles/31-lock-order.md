# Why are both stock transfers waiting?

There are five packs on each of two shelves. One worker moves a pack from bin 1 to bin 2. Another moves a pack the other way. Each follows the same instruction to subtract from the source, add to the destination, and commit. If both finish, there should still be five packs in each bin. Halfway through, each worker has an open transaction and neither can finish the next update.

In [lab 31](../labs/31-lock-order/README.md) you will produce that situation on two persistent PostgreSQL connections. A third connection lets you inspect a wait without changing either transaction. Keep three observations separate as you go. Write down which row each transaction holds, which row it wants, and which changes an ordinary reader can see.

## Follow the two callers

A subtracts from bin 1. That update holds a row lock until its transaction ends. B subtracts from bin 2 and holds that row instead. Neither change is visible to the observer. B then tries to add to bin 1 and waits for A. At this point there is a queue, and A could still finish if it had no more work on bin 2. Instead A tries to add to bin 2. Now completing A requires B to finish, and completing B requires A to finish.

PostgreSQL detects this cycle and aborts one transaction with SQLSTATE `40P01`. You cannot choose which transaction will be the victim. In the losing session, roll back the failed transaction. Finish the surviving transfer and examine both bins from the observer. If A survived, they contain four and six. If B survived, they contain six and four. Counting ten packs verifies conservation. Inspecting each row tells you which move actually happened. [PostgreSQL 17 on deadlocks](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-DEADLOCKS)

Compare that with two departments each waiting for the other to approve a move in tomorrow's meeting. There may be a circular business dependency with no open database transaction at all. A database deadlock diagnosis needs evidence about transactions waiting on locks. A long wait by itself also falls short. In the lab you will deliberately leave one operation waiting behind another and let both finish.

## Find the order hidden in the data

When incident.io investigated an occasional deadlock in a catalog sync, the two traces led to the same bulk upsert code. Why would identical code acquire locks differently? The input rows had passed through a Go map and could arrive in different orders. Sorting the small batch addressed the reported problem. The input order gave the team a detail it could change even though both traces showed the same query. [Louis Heath's engineering account](https://incident.io/blog/debugging-deadlocks-in-postgres)

Our two-bin exercise makes that detail visible. Both callers execute “source first” but the word *source* names a different row for each caller. Make a separate decision about the physical order in which to take locks. Both operations first lock the smaller bin ID and then the larger. After obtaining both locks they still subtract from the requested source and credit the requested destination. Sorting the *meaning* of the transfer as well as its lock order would quietly reverse one customer's move.

Predict the repaired schedule. A locks both bins. B's first lock request is for bin 1, so B waits without holding bin 2. A can finish. B can then lock both rows, check the current source quantity, and move a pack. Both transfers commit. Your observer sees five and five again. Seeing just those final numbers would also fit a run in which nobody moved anything. Keep the two successful transaction results with your inspection.

## Repeat a decision that failed

An aborted transfer can be attempted in a new transaction. Start again with the requested direction and quantity, take both locks, and check the source's current stock. A different caller might have taken the last pack since the first attempt. Repeating just the credit to the destination would add stock without the debit. Record the outcome if the fresh check finds insufficient stock. There is nothing to retry automatically about a customer's request for more packs than the shop has.

The move and both quantity changes live entirely inside this database. You can see each failed attempt disappear by inspecting the rows. A text message sent to the warehouse during an attempt has a different lifetime. The database cannot recall a delivered message on rollback. The [request lesson](32-request-replay.md) puts a limit on retry attempts and shows what to do when a database operation has already committed.

**Return after a gap.** A workshop needs both a room and a projector. List the resources in acquisition order for two callers who request them in opposite orders. If the second resource has already been reserved, which changes should the first resource retain? Run the independent exercise and look at all three resource rows before answering.
