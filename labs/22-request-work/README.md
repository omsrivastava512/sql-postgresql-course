# Lab 22 — Count the work for the whole operation

Read [the article](../../articles/22-request-work.md), then run [setup.sql](setup.sql). It resets only course_request. Use [the shared guide](../README.md) and the existing Node/pg dependencies.

No HTTP server is needed. The supplied [request.mjs](request.mjs) represents a backend read operation. The dataset stays unchanged during these comparisons.

## Inspect the response contract

There are forty customers, thirty active. Customers 1–24 each have three paid orders; active customers 25–30 have none. All thirty must appear, ordered by customer ID, with paid orders ordered by order ID.

Implement or trace the straightforward per-customer lookup. Predict its query count: one customer query plus thirty order queries.

Then trace the batch and LEFT JOIN variants. Compare entire nested results, including empty orders arrays. Check that parent limiting happens before joining; LIMIT 3 on joined rows is not a three-customer contract.

## Run and measure

With COURSE_DATABASE_URL set to the disposable database, run from the repository root:

```sh
node labs/22-request-work/request.mjs
```

It does not reset the schema. It asserts equal responses and prints an initial run plus five subsequent observations for each variant. Expected call counts are loop 31, batch 2, join 1.

The loop/batch retrieve thirty parent rows plus 72 order rows. The join retrieves 78 rows: 72 orders plus six padded rows. Compare approximate JSON row bytes as well as timings. These bytes are serialized driver row objects, not measured PostgreSQL wire traffic.

Local latency is not hosted deployment latency. Do not copy a small timing difference into a promised production speedup.

## Test inputs and boundaries

The native checker also runs:

- A name pattern with no matches: every variant returns an empty customer array in one call.
- A SQL-looking pattern containing quotes, OR and DROP TABLE text: it remains bound data, returns no matches and leaves all 120 orders present.
- A three-customer limit with both allowed sort choices: complete customer collections match across implementations.
- An unrecognized sort fragment: reject it before sending SQL.
- A zero limit: reject it under this harness's explicit 1–100 policy.

Inspect how values use parameters and sort choices use fixed fragments. The supplied code is a small input contract, not a complete authentication or security design.

## Observe a connection wait

Run the complete author checker, or select this lab:

```sh
node tests/verify-performance.mjs --lab=22
```

Its pool experiment creates a pool with one connection, borrows that client, then requests another. It requires waitingCount = 1 while PostgreSQL reports the existing backend idle, rather than waiting on a lock. After release, the next checkout must reuse the same backend ID and waitingCount becomes zero.

Read the finally blocks that release clients and end the pool. Compare this with lab 16's server-side pg_blocking_pids observation. Explain why increasing pool size does not establish that the original work is efficient.

The pool size is chosen to make this demonstration observable, not to prescribe application capacity. A transaction must remain on a single borrowed client.

## Independent transfer

Return open-task counts for every active project. Project 1 has two, project 2 has zero because its task is done, project 3 has zero because it has no tasks. Inactive project 4 must not appear.

First implement a per-project lookup and count its four calls. Replace it with one grouped LEFT JOIN query while retaining exactly [{id: 1, open_tasks: 2}, {id: 2, open_tasks: 0}, {id: 3, open_tasks: 0}].

Hint: filtering a padded row in WHERE can lose an empty project; COUNT(*) can count that padded row. [solution.sql](solution.sql) and readProjects in request.mjs provide the reference after your attempt.

## Deliver

Save call counts, equal complete responses, first/subsequent timings, row-volume observations, input-boundary outcomes and the pool-wait trace. Explain which part of request duration an individual EXPLAIN cannot measure. Record actual learner effort and assistance separately.

Return later: when might a batched two-query response be a reasonable choice over one wider join?
