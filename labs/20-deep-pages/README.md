# Lab 20 — Continue a page without skipping ties

Read [the article](../../articles/20-deep-pages.md), then run [setup.sql](setup.sql) using [the shared guide](../README.md). It resets only course_page.

Inspect 100,000 events: each workspace owns 10,000 consecutive IDs, and every three consecutive IDs share an occurred_at value.

## Define and index the ordering

Use workspace_id = 7, ordered by occurred_at and id ascending. Create:

```sql
CREATE INDEX events_workspace_cursor_idx
ON course_page.events (workspace_id, occurred_at, id);
```

Record EXPLAIN (ANALYZE, BUFFERS) for the first ten rows and for LIMIT 10 OFFSET 9000. The deep page must return 69001–69010.

Inspect the rows produced below Limit as well as root buffers and time. Ten output rows do not mean ten entries were examined.

## Compare the same page

The preceding complete key is (2026-01-01 06:23:19+00, 69000). Use the article's tuple comparison to fetch the next ten rows. Compare every ID against the deep offset page.

For each query record its first execution and five later observations, version, index and dataset. The supplied previous-page key is outside the timed operation. If you find that key using OFFSET in an application, include that discovery cost when evaluating the application.

## Break the incomplete cursor

The first workspace-7 row is ID 60001 at 2026-01-01 05:33:20+00.

Compare:

```sql
SELECT id FROM course_page.events
WHERE workspace_id = 7 AND occurred_at > timestamptz '2026-01-01 05:33:20+00'
ORDER BY occurred_at, id LIMIT 3;

SELECT id FROM course_page.events
WHERE workspace_id = 7 AND (occurred_at, id) > (timestamptz '2026-01-01 05:33:20+00', 60001)
ORDER BY occurred_at, id LIMIT 3;
```

The first returns 60004, 60005, 60006. The second returns 60002, 60003, 60004. Explain the lost rows without blaming LIMIT.

## Change data between requests

Keep the deep cursor. Insert ID 100001 into workspace 7 with occurred_at = '2025-12-31 00:00+00' and a description. The next cursor page remains 69001–69010; the new earlier event is outside the continuation range.

Now move event 69005 to that earlier timestamp. The next page becomes 69001, 69002, 69003, 69004, 69006, 69007, 69008, 69009, 69010, 69011.

Explain what this means for a traversal that promises to export every event once. A cursor is not itself a snapshot. Reset before repeating the performance comparison.

## Independent transfer

The messages fixture has 9,000 rows, three channels and two-row timestamp ties. Channel 2 is ordered by sent_at DESC, id DESC.

Continue after (2026-01-01 00:37:29+00, 4500). Expect 4499, 4498, 4497, 4496, 4495. Design the matching index and justify the comparison direction.

## Hints and record

Hint: preserve every ordering component in the cursor. Deeper hint: reversing both sort directions also reverses the continuation comparison.

[solution.sql](solution.sql) supplies the two indexes and reference pages from fresh setup. Deliver equal-page evidence, the broken-tie result, changed-data results, plans, repeated timings and a clear statement of consistency limits. Actual reader effort/help stays unfilled until attempted.

The native author checker is node tests/verify-performance.mjs --lab=20. The embedded cases establish result membership; native measurements establish the observed work on this machine.

Return later: which requirements would make simple continuation insufficient for a complete export?
