# Run the labs

Labs 01–22 offer local PostgreSQL and dedicated Supabase learning-project routes, with verification limits recorded below. Access labs 23–26 require a disposable local cluster with administrator-controlled roles; their scripts are not a hosted Supabase setup. Lab schemas are not the clinic application's schema.

**Current execution evidence is in [VERIFICATION.md](../VERIFICATION.md).** Instructions being present does not mean both environments have already been tested.

## Local PostgreSQL with Docker

Install Docker and start its engine. From a terminal, create this disposable database:

```sh
docker run --name clinic-course-postgres -e POSTGRES_PASSWORD=course-local-only -e POSTGRES_DB=course -p 127.0.0.1:55432:5432 -d postgres:17.11
docker exec clinic-course-postgres pg_isready -U postgres -d course
```

Wait until pg_isready reports accepting connections. Then open a persistent SQL session:

```sh
docker exec -it clinic-course-postgres psql -U postgres -d course
```

Paste the lab's setup.sql, then work through its README. The lab guide's SQL blocks run inside psql, not in PowerShell. Type `\q` to leave psql. Stop and restart the database with:

```sh
docker stop clinic-course-postgres
docker start clinic-course-postgres
```

The fixed tag selects PostgreSQL 17.11. The [official image page](https://hub.docker.com/_/postgres) documents image variables. No host directory is mounted; the classroom password is for this loopback-only disposable container.

If the name already exists, use docker start rather than recreating it. If port 55432 is occupied, change only the host port. Labs 16 and 17 use persistent A/B connections and a third observer connection against the same database; open three psql terminals. Confirm distinct SELECT pg_backend_pid(); results.

An existing native PostgreSQL 17 server also works. Use psql -h 127.0.0.1 -p YOUR_PORT -U YOUR_ROLE -d YOUR_DISPOSABLE_DATABASE. The author verification used a temporary native Windows server; it did not validate Docker startup.

## Supabase

Use a dedicated project you are willing to reset. Open its SQL Editor. Run:

```sql
SELECT version(), current_database(), current_user;
```

Save the output in your own verification record. Paste one lab's setup.sql and run it. Then run the tasks as directed.

Run each BEGIN-to-COMMIT or BEGIN-to-ROLLBACK block in one execution. Do not assume two separate editor or MCP requests share a transaction. For experiments that pause between statements, including labs 16 and 17, use psql with a direct or session-mode connection. [Connection-mode documentation](https://supabase.com/docs/guides/database/connecting-to-postgres)

Labs 01–22 do not use the Data API, authentication or RLS. They use custom course schemas and do not require exposing those schemas through the API. The new access labs use restricted local database identities; testing as the SQL Editor's privileged role is not a substitute. Their hosted adaptation and Supabase request identities remain separate future work.

## Reset and expected errors

Every setup.sql drops and recreates exactly its named course schema. This intentionally erases that lab's previous work. Access labs also create their named cluster-wide roles if absent. Do not run these scripts against a real application's schema or shared cluster.

For ordinary tasks, run one statement at a time. Some tasks intentionally fail: read the SQLSTATE, then inspect the data. In a persistent explicit transaction, issue ROLLBACK after a failure before continuing.

For a clean solution run: reset, then run solution.sql. For automated verification: the test runner resets each lab itself.

## Optional author verification

With Node.js 20+ and npm, from the course folder:

```sh
npm ci
npm run check:links
npm run test:embedded
```

The embedded run uses PGlite, a PostgreSQL build for WebAssembly. It checks SQL behavior in that runtime. It does not test Docker startup, hosted Supabase behavior or independent concurrent sessions.

For a real database run, set COURSE_DATABASE_URL in your local environment to the disposable database's connection string, then:

```sh
npm run test:database
```

The complete runner uses one administrator connection, resets twenty-six named course schemas and creates the access labs' fixture roles. Run it on a disposable local cluster; the complete suite is not a supported hosted-Supabase command. It prints server version and results, never the connection string. The earlier labs' individual hosted exercises require a direct or session-mode connection with appropriate SSL settings where persistent sessions are needed. Do not paste passwords into chats or commit them.

For the two concurrent-session labs, with the same disposable database variable set:

```sh
node tests/verify-sessions.mjs
```

This separate checker uses the existing pg driver and three connections. It resets only course_race and course_change, observes blockers through pg_blocking_pids and checks stored results after waits, failures and retries. It uses 10-second statement and 60-second idle-transaction limits; manual exercises allow longer pauses. Use --lab=16 or --lab=17 for one suite, or --reverse to check the opposite order. Do not run reset scripts or another checker against those schemas concurrently. The embedded runner checks their single-session reference examples only.

The runner checks failure categories and stored state, including rejected writes and commit-time failures. See [verification](../VERIFICATION.md).

## Performance labs

Labs 18–22 supply generated fixtures, preserving independent resettable schemas. Embedded checks verify reference results and failures. Measure plans, buffer/WAL work, vacuum behaviour and pool waits on a real server:

```sh
node tests/verify-performance.mjs
```

Set COURSE_DATABASE_URL first. This checker reuses pg, resets only course_plan, course_index, course_page, course_maintenance and course_request, and prints JSON evidence followed by a passing assertion count. It records the server/settings, first plans and five subsequent observations. No fixed timing or speedup is required. Use --lab=18 through --lab=22 to select one lab, or --reverse to verify the opposite order.

Do not run another checker against those schemas at the same time. The maintenance fixture temporarily disables autovacuum on its two tables to isolate the experiment; the solution/checker restores their settings. Its VACUUM runs as a standalone command. The request module's separate learner command is documented in [lab 22](22-request-work/README.md); it reads an already-created fixture and does not reset it.

These measurements do not establish hosted latency, production throughput or Docker setup. Keep role, version, data distribution, cache limitations, result equality and write/storage trade-offs with any conclusion. The wider concurrency checker remains separate because sequential performance measurements cannot establish a race.

## Access-control labs

Labs 23–26 use schemas course_priv, course_policy, course_tenant and course_code, plus thirteen dedicated cluster-wide roles. Use a fresh disposable local PostgreSQL 17 cluster and its superuser administrator. Setup creates missing roles as NOLOGIN; it does not overwrite existing role attributes or memberships. Do not reuse names belonging to other work. The ordinary reference suite uses administrator-controlled SET ROLE and resets the role between exercises.

For actual restricted logins, set COURSE_DATABASE_URL to that local administrator URL and run:

```sh
node tests/verify-access.mjs
```

The host connection must require password authentication for the restricted roles. The checker temporarily gives eleven caller roles random passwords, verifies wrong-password rejection, connects as each caller and checks current_user/session_user and prohibited role switches. It keeps the two owner/worker roles NOLOGIN. It closes clients, restores every temporary caller to NOLOGIN with no password, and verifies that cleanup before reporting success. Passwords and URLs are not printed or saved. Existing pg and Node built-ins suffice; no new dependency is needed.

For a native server, inspect its pg_hba.conf using the [PostgreSQL authentication guide](https://www.postgresql.org/docs/17/auth-pg-hba-conf.html). Restricted callers must match a password method such as scram-sha-256, not trust; the first matching rule wins. Set password_encryption to scram-sha-256 before the checker assigns passwords. The tested disposable Windows server trusted only course_author on 127.0.0.1 and required SCRAM for other loopback roles. That administrator exception is a test-fixture choice, not a deployment configuration. Do not weaken an existing server's authentication to run this course.

Use --lab=23 through --lab=26 for one suite, or --reverse for the opposite order. Do not run another checker/reset against these schemas concurrently. Native checks include a held Repeatable Read snapshot during membership revocation, view/function owner comparisons and temporary-table name shadowing. The default connection/statement limits are ten seconds and idle transactions sixty seconds; manual exercises may need an explicit longer timeout.

After manual exercises, RESET ROLE, end transactions and close restricted connections. Each lab supplies cleanup.sql to remove its schema and exact role names; unrelated role dependencies cause a failure rather than being removed automatically. Temporary tables disappear when their connection closes. The checker leaves resettable teaching schemas and NOLOGIN roles for inspection; run those cleanup scripts when finished.

These tests establish the stated PostgreSQL access rules. They do not verify website login, JWT validation, Supabase auth.uid(), API exposure, service keys, pooling identity propagation or a complete security audit. Do not simulate those claims by assigning an arbitrary session setting. The [verification record](../VERIFICATION.md) keeps this boundary explicit.

