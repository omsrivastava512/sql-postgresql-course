# Run the labs

Choose either local PostgreSQL or a dedicated Supabase learning project. Both routes use the same setup and solution SQL. Lab schemas are not the clinic application's schema.

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

These initial labs don't use the Data API, authentication or RLS. They use custom course schemas and do not require exposing those schemas through the API. Later security labs need separate identities; testing as the SQL Editor's privileged role is not a substitute.

## Reset and expected errors

Every setup.sql drops and recreates exactly its named course schema. This intentionally erases that lab's previous work. Do not run it against a real application's schema.

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

The runner uses one persistent connection and resets the seventeen named course schemas. It prints server version and results, never the connection string. For Supabase, use a direct or session-mode connection string with the appropriate SSL settings. Do not paste passwords into chats or commit them.

For the two concurrent-session labs, with the same disposable database variable set:

```sh
node tests/verify-sessions.mjs
```

This separate checker uses the existing pg driver and three connections. It resets only course_race and course_change, observes blockers through pg_blocking_pids and checks stored results after waits, failures and retries. It uses 10-second statement and 60-second idle-transaction limits; manual exercises allow longer pauses. Use --lab=16 or --lab=17 for one suite, or --reverse to check the opposite order. Do not run reset scripts or another checker against those schemas concurrently. The embedded runner checks their single-session reference examples only.

The runner checks failure categories and stored state, including rejected writes and commit-time failures. See [verification](../VERIFICATION.md).

