# Topic inventory

Stable IDs identify concepts, not mandatory lessons. An available home may introduce a topic without completing its depth; the home article states its limits. This inventory consolidates the repository discovery and adjacent concepts needed to explain it accurately.

## Values and identity

Planned depth; onramp available.

| ID | Concept | Current home |
|---|---|---|
| F01 | SQL, PostgreSQL and PL/pgSQL | [Onramp](articles/00-reading-the-examples.md) |
| F02 | Column and table-level declaration syntax | [Onramp](articles/00-reading-the-examples.md) |
| F03 | Schemas and qualified names | [Onramp](articles/00-reading-the-examples.md) |
| F04 | Scalar types: text, integer, UUID, boolean, date and timestamptz | Planned |
| F05 | NULL versus absent input versus empty string | Planned |
| F06 | DEFAULT values and explicit NULL | Planned |
| F07 | NOT NULL and CHECK | Planned |
| F08 | Primary keys and business identifiers | [Foreign keys](articles/01-foreign-keys.md) |
| F09 | Composite and tenant-scoped uniqueness | Planned |
| F10 | UNIQUE and NULL behavior | Planned |
| F11 | Enums versus text plus CHECK | Planned |
| F12 | JSONB, arrays and relational tables | Planned |
| F13 | DDL versus DML | [Onramp](articles/00-reading-the-examples.md) |
| F14 | UUID generation and collision assumptions | Planned |

## Relationships

Initial articles available.

| ID | Concept | Current home |
|---|---|---|
| R01 | Foreign keys and existence | [Foreign keys](articles/01-foreign-keys.md) |
| R02 | Optional relationships and FK nullability | [Foreign keys](articles/01-foreign-keys.md) |
| R03 | One-to-many and many-to-many | Planned |
| R04 | Junction tables and composite keys | Planned |
| R05 | Shared primary key: at-most-one versus exactly-one | Planned |
| R06 | Multiple columns referencing profiles | [Foreign keys](articles/01-foreign-keys.md) |
| R07 | Natural catalog IDs and transactional IDs | Planned |
| R08 | NO ACTION and RESTRICT | [Deletion](articles/04-deleting-related-rows.md) |
| R09 | CASCADE and SET NULL | [Deletion](articles/04-deleting-related-rows.md) |
| R10 | Soft deletion and active-record rules | [Deletion](articles/04-deleting-related-rows.md) |
| R11 | DEFERRABLE, INITIALLY and SET CONSTRAINTS | [Deferred checks](articles/05-deferred-checks.md) |
| R12 | Dependency ordering and adding FKs with ALTER TABLE | [Deferred checks](articles/05-deferred-checks.md) |
| R13 | Typed references versus polymorphic references | Planned |
| R14 | Ownership, authorship, clinician identity and row grain | Planned |

## Query meaning

Planned.

| ID | Concept | Current home |
|---|---|---|
| Q01 | SELECT, INSERT, UPDATE, DELETE and WHERE | [Onramp](articles/00-reading-the-examples.md) |
| Q02 | INNER and OUTER JOINs, aliases and unmatched rows | Planned |
| Q03 | EXISTS and NOT EXISTS | [Business rules](articles/02-business-rules.md) |
| Q04 | Subqueries and scalar subquery cardinality | [Derived values](articles/03-derived-values.md) |
| Q05 | COALESCE and expression evaluation | Planned |
| Q06 | Three-valued logic and CHECK accepting unknown | Planned |
| Q07 | IS DISTINCT FROM and NULL-safe comparisons | Planned |
| Q08 | GROUP BY, COUNT, SUM and aggregate grain | Planned |
| Q09 | Join multiplication and double counting | Planned |
| Q10 | Latest-per-group and DISTINCT ON | Planned |
| Q11 | JSON operators -> and ->> and expanding arrays | Planned |
| Q12 | SELECT INTO versus STRICT and missing/multiple rows | Planned |

## Rules and automation

Initial articles available.

| ID | Concept | Current home |
|---|---|---|
| B01 | Row validity versus permissions versus workflow policy | [Business rules](articles/02-business-rules.md) |
| B02 | Constraint versus application versus trigger enforcement | [Business rules](articles/02-business-rules.md) |
| B03 | Trigger function and trigger attachment | [Business rules](articles/02-business-rules.md) |
| B04 | NEW, OLD and TG_OP | [Business rules](articles/02-business-rules.md) |
| B05 | BEFORE, AFTER, row and statement timing | [Derived values](articles/03-derived-values.md) |
| B06 | Derivation versus validation versus caller input | [Derived values](articles/03-derived-values.md) |
| B07 | Trigger ordering and explicit sequencing | Planned |
| B08 | RAISE EXCEPTION and SQLSTATE | [Business rules](articles/02-business-rules.md) |
| B09 | PL/pgSQL dollar quoting, assignment, casts and concatenation | [Business rules](articles/02-business-rules.md) |
| B10 | Keeping cross-table rules true across all writes | [Business rules](articles/02-business-rules.md) |
| B11 | Cross-row totals and at-least-one-child rules | Planned |
| B12 | Deferred constraint triggers | Planned |
| B13 | Conditional XOR and num_nonnulls | Planned |
| B14 | State values versus permitted transitions | Planned |
| B15 | updated_at versus audit history | Planned |

## Transactions and concurrency

Initial articles available.

| ID | Concept | Current home |
|---|---|---|
| T01 | Implicit and explicit transactions | [Transactions](articles/06-transaction-boundaries.md) |
| T02 | Atomicity, COMMIT and ROLLBACK | [Transactions](articles/06-transaction-boundaries.md) |
| T03 | Trigger effects share the transaction | [Transactions](articles/06-transaction-boundaries.md) |
| T04 | API request boundaries versus transaction boundaries | [Transactions](articles/06-transaction-boundaries.md) |
| T05 | Table counters versus sequences | [Transactions](articles/06-transaction-boundaries.md) |
| T06 | UPDATE RETURNING and row locks | [Transactions](articles/06-transaction-boundaries.md) |
| T07 | Race conditions and concurrent read-modify-write | Planned |
| T08 | MVCC and isolation levels | Planned |
| T09 | Deadlocks versus workflow dependency cycles | Planned |
| T10 | Savepoints and exception recovery | Planned |
| T11 | ON CONFLICT and conflict policy | Planned |
| T12 | Idempotency keys, payload matching and response replay | Planned |
| T13 | Commit succeeded but response failed | [Transactions](articles/06-transaction-boundaries.md) |

## Identity and access

Planned.

| ID | Concept | Current home |
|---|---|---|
| A01 | Authentication versus authorization | Planned |
| A02 | Auth users and application profiles | Planned |
| A03 | JWT and request identity | Planned |
| A04 | Supabase auth.uid() and SQL-editor identity | Planned |
| A05 | Database roles versus application role columns | Planned |
| A06 | GRANT and privileges | Planned |
| A07 | RLS USING and WITH CHECK | Planned |
| A08 | SECURITY INVOKER versus SECURITY DEFINER | Planned |
| A09 | Function ownership, RLS bypass and search_path | Planned |
| A10 | Tenant boundaries and clinic membership | Planned |
| A11 | Direct database access versus Supabase Data API | Planned |
| A12 | Account provisioning and email delivery | Planned |

## Derived data and domain meaning

Planned.

| ID | Concept | Current home |
|---|---|---|
| D01 | Generated columns | Planned |
| D02 | Views and materialized views | Planned |
| D03 | Normalization and redundant stored values | [Derived values](articles/03-derived-values.md) |
| D04 | Snapshots and historical prices | Planned |
| D05 | Exact NUMERIC, integer minor units and floating point | Planned |
| D06 | Rounding and amount boundaries | Planned |
| D07 | Price precedence, overrides and grandfathering | Planned |
| D08 | Dates, timezones and business calendars | Planned |
| D09 | Attendance days, closures and expiry | Planned |
| D10 | Lazy expiry versus stored state | Planned |
| D11 | Approval workflows and auditability | Planned |
| D12 | Domain validity versus mechanically valid SQL | Planned |

## Operations and integration

Planned.

| ID | Concept | Current home |
|---|---|---|
| O01 | Indexes and the cost of writes | Planned |
| O02 | FK columns are not automatically indexed | Planned |
| O03 | Partial and unique indexes | Planned |
| O04 | pg_trgm, extensions and GIN | Planned |
| O05 | EXPLAIN and measured query performance | Planned |
| O06 | Connection pooling | Planned |
| O07 | Migrations, seeds and backfills | Planned |
| O08 | Compatibility and expand-contract changes | Planned |
| O09 | Migration locks and validation of existing data | Planned |
| O10 | RPC versus direct table operations versus custom APIs | Planned |
| O11 | Nested request payloads and validation | Planned |
| O12 | Error codes, messages and UI recovery | Planned |
| O13 | Refetching, polling and realtime | Planned |
| O14 | Negative tests, rollback tests and race tests | Planned |
| O15 | Backups and restoration as distinct from rollback | Planned |

## Coverage rule

The complete map is not a promise that every planned topic is already taught. A release record names the concepts actually explained and exercised. A later author can split or combine articles without changing these concept IDs. Foreign-key existence is R01; owner validity adds B01/B02/B10; deferred deletion combines R08/R11 with T01/T02. These are connections to teach, not merely tags to display.

