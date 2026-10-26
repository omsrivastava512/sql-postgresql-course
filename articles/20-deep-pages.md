# Why does the later page do more work?

The first page feels quick. A much later page returns the same ten rows per request, yet does more database work. LIMIT describes output size; it does not promise how many earlier entries can be skipped cheaply.

By the end, compare offset and cursor pagination on matching pages, preserve tied rows, and explain what happens when the data changes.

**Scope:** PostgreSQL pagination on a stated ordering. This exercise does not promise a frozen dataset between requests.

## Define one page precisely

[Lab 20](../labs/20-deep-pages/README.md) supplies 100,000 events in ten workspaces. Order workspace 7 by occurred_at ascending, then id ascending. Every three consecutive event IDs share a timestamp.

Its page after offset 9000 contains IDs 69001–69010:

```sql
SELECT id FROM course_page.events
WHERE workspace_id = 7
ORDER BY occurred_at, id LIMIT 10 OFFSET 9000;
```

The database must account for the skipped rows before returning the page. Compare the work below the Limit node, not just its ten output rows. [LIMIT and OFFSET](https://www.postgresql.org/docs/17/queries-limit.html)

## Continue from the last complete key

Suppose the preceding page ended at ID 69000, timestamp 2026-01-01 06:23:19+00:

```sql
SELECT id FROM course_page.events
WHERE workspace_id = 7
  AND (occurred_at, id) > (timestamptz '2026-01-01 06:23:19+00', 69000)
ORDER BY occurred_at, id LIMIT 10;
```

With an index on (workspace_id, occurred_at, id), the boundary can locate the next range. Compare the exact output with the offset page.

The fixture supplies that cursor to make two algorithms comparable. If an application first uses a deep OFFSET query to discover the cursor for an arbitrary page number, that work still counts. Cursor pagination naturally supports continuation; it does not provide free random jumps.

## Keep ties, then change the direction

A cursor containing only a timestamp is incomplete. After event 60001, timestamp-only > skips 60002 and 60003 because they share its timestamp. The pair comparison retains them.

For a descending order, the continuation comparison becomes < on the same complete key. The independent messages exercise begins after ID 4500 and must return 4499–4495. All sort columns here are NOT NULL; nullable or mixed-direction keys require a separately specified comparison.

[PostgreSQL row comparisons](https://www.postgresql.org/docs/17/functions-comparisons.html#ROW-WISE-COMPARISON) define the tuple comparison used here.

## A cursor does not freeze the history

Insert an event before the saved boundary. A later cursor request does not travel backward to include it. Change a future event's timestamp so it moves before the boundary; a traversal can now miss it. Moving a previously seen event forward can make it appear again.

For a changing feed, decide whether those effects are acceptable. A stable sort key, a snapshot requirement and an export consistency policy are different design choices. The lab demonstrates changes between requests rather than claiming a universal paging guarantee.

## Why Shopify changed the pagination contract

In [his Shopify account from 12 August 2019](https://shopify.engineering/pagination-relative-cursors), Drew Martin describes applications synchronizing large product catalogs through successive pages. Slow deep-offset queries occupied limited database connections; unrelated requests, including those for other shops sharing an instance, could wait or time out. The problem extended beyond one slow page.

Shopify chose relative cursors to continue from the previous position. That changed what clients could request: continuation replaced arbitrary page-number jumps. Nonunique sort values also needed a unique tie-breaker and a matching index. Martin reports that changing external endpoints required a coordinated, versioned API transition; adoption was still limited when he wrote, so the full rollout's effects were not yet established. These are the author's reported circumstances, not measurements from this course.

Our interpretation is that a pagination decision must account for both traversal work and the navigation callers need. The PostgreSQL exercise makes the first part observable: establish that both queries return 69001–69010, then compare the work below Limit with the complete-key index in place. The supplied cursor removes acquisition cost from that local comparison; an application's cost of finding a position still counts. The changed-data exercise tests another boundary: continuation does not freeze history.

Reducing per-page work can help explain the connection pressure in Shopify's account, but our single-client measurements do not reproduce its shared workload or establish a throughput gain. Keep Shopify's historical timings separate from your own plans and observations. The [request-work lesson](22-request-work.md) returns to the difference between one SQL statement and the work of a whole request.

## Practise and transfer

In the [lab](../labs/20-deep-pages/README.md), measure shallow and deep offset pages, then matching cursor pages. Keep the initial and five subsequent observations, plan row counts and buffer activity. Restore changed rows before comparing algorithms again.

**Requires:** [ordering and basic pagination](08-selecting-rows.md), [plans](18-query-plans.md) and [indexes](19-index-decisions.md).
**Related:** [database work per request](22-request-work.md) connects query work with connection occupancy.
**Return:** why can ten returned rows hide thousands of consumed rows, and why is a cursor's acquisition cost part of the comparison?
