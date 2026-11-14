# Authenticated-access lab environment

Lessons 33–35 supply a dedicated Supabase fixture for real Auth and Data API requests. Live verification is pending. The instructions below are for a later local run and repetition in a disposable hosted project. The fixture resets only the three lesson namespaces. Its Auth users are recorded individually in a private manifest.

To check the repository files without installing or starting a service, run `node tests/verify-authenticated-access-sql.mjs` from the repository root with the existing dependencies. This uses synthetic identity context in an in-memory SQL engine; it does not establish the Auth/API behavior described below.

## Pinned local tooling

Use the standalone **Supabase CLI 3.1.0**. For Windows x64, download the [official ZIP](https://github.com/supabase/cli/releases/download/v3.1.0/supabase_3.1.0_windows_amd64.zip). Its SHA-256 is:

```text
4881f8ee3019d159c7c5f276f90a14918dd8846b796f8c71e0dd8ff7efbe2267
```

Compare `Get-FileHash -Algorithm SHA256` with that value before extracting the archive. Invoke the extracted executable directly or add its directory to your own PATH. The CLI is separate from the course's npm dependencies. On Windows, install Docker Desktop with its WSL 2 backend following the [official installation instructions](https://docs.docker.com/desktop/setup/install/windows-install/). Start Docker before starting Supabase.

From the repository root, run:

```powershell
supabase --version
supabase start
```

The configuration exposes only the three lesson API schemas. The corresponding private schemas must never appear in the exposed list. PostgreSQL 17 is selected; the pooler, Realtime, Storage, Studio, Edge Runtime and analytics are disabled because this batch does not use them. Local mail is captured rather than delivered. Accounts are administratively confirmed for the core fixture; this does not verify signup or email delivery.

Local access tokens expire after **120 seconds** so a genuine expired-token test is practical. Sign in again when doing a later exercise. This short lifetime is a disposable-lab setting, not a deployment recommendation. Anonymous sign-in and public signup are disabled; an unauthenticated API request is still a distinct case.

## Private configuration and synthetic users

Run `supabase status` privately to obtain the local connection details. Create an ignored `.env.auth-course` file at the repository root with the following names and your actual values:

```dotenv
COURSE_AUTH_DISPOSABLE=yes
COURSE_SUPABASE_URL=http://127.0.0.1:54321
COURSE_SUPABASE_PUBLISHABLE_KEY=replace-with-publishable-key-or-local-anon-key
COURSE_SUPABASE_ADMIN_KEY=replace-with-administrative-key
COURSE_DATABASE_URL=replace-with-persistent-postgresql-connection-url
```

The administrative key is used only by the fixture provisioner. Learner requests use the publishable project key plus the access token obtained by signing in. The private `.env.auth-course.json` manifest holds the four synthetic users' generated passwords and Auth IDs. Both files match the repository's existing `.env.*` ignore rule. Do not paste their contents into verification reports.

```powershell
node --env-file=.env.auth-course labs/auth-fixture.mjs users
node --env-file=.env.auth-course labs/auth-fixture.mjs reset 33
node --env-file=.env.auth-course labs/33-request-identity/request.mjs alice
node --env-file=.env.auth-course labs/33-request-identity/request.mjs anon
```

Provisioning reuses recorded user IDs. A partial provisioning failure preserves the manifest rather than deleting other users or silently starting another fixture. Reset verifies that all four recorded Auth IDs exist through the SQL connection before replacing a lesson schema. Use a persistent direct or session-mode connection, not transaction pooling, for the later observer and concurrency exercises.

`reset 34` and `reset 35` install the corresponding independent fixture and reference solution. Add `--unsolved` after the lesson number to install the initial schema without its solution functions/policies. An unsolved fixture exposes no private rows through RLS. The shared request helper lives beside lesson 33; importing it does not require running lesson 33 first.

## Hosted repetition

Use a separately designated disposable course project and the [placeholder template](hosted.env.example). Add `course_auth33_api`, `course_auth34_api` and `course_auth35_api` to its exposed schemas and keep all `course_auth*_private` schemas unexposed. Record the actual deployed database/API/Auth versions, key types, JWT expiry and validation settings. Do not assume they match the local CLI images. The full checker needs a test-token lifetime no longer than 300 seconds for its genuine expiry case; configure this only in the disposable project.

Use a separate environment file and set `COURSE_AUTH_MANIFEST` to a different ignored `.env.*.json` file. Run the same provisioner, reset commands and request scenarios. A manifest from a different project is rejected. Never run a whole-project reset against a hosted project or delete all Auth users to reset these exercises.

## Evidence status

The standalone Windows CLI archive was checksum-verified and executed as version 3.1.0; local configuration was initialized with that CLI. The Supabase stack has not been started or verified. On 2026-11-15, the SQL-only checker passed 71 assertions covering repeated setup, grants/RLS, replay, rollback, permission changes and all three transfers with synthetic claim context. Real Auth/API requests, independent sessions, response-loss experiments, hosted execution and reader walkthroughs remain pending. See the [author verification record](../VERIFICATION.md#authenticated-access--2026-11-15) for the setup history and evidence boundaries.
