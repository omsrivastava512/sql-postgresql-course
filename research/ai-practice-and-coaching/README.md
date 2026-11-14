# AI practice and coaching investigation

## Reconciled status — 15 November 2026

This update supersedes the original dated counts and continuation instructions below. Five compatibility attempts are preserved across three runs: study-001 has two quota failures; study-002 has two local EACCES network-access failures; study-003 has one quota failure. No successful model-generated output exists. Two attempts were retries. Local failures still count conservatively against the allowance.

The approved limits remain 120 total requests, four compatibility requests and eight retries. Another continuation configured six compatibility requests; the current configuration and runner ceiling have been restored to the approved four. Five are already recorded, exceeding that sublimit by one. There are 115 total requests and six retries remaining, but no compatibility allowance. Historical snapshots and responses are unchanged.

Live work remains pending. Do not recreate study-002 or study-003 or issue further requests. Resumption requires restored access and explicit approval of a revised cumulative compatibility allowance: at least seven would cover the five recorded attempts plus the two required checks. This is a proposal, not an approved increase; the 120-request total remains unchanged. After approval, update the configuration and runner ceiling together and freeze a new unused ID (currently study-004). No live requests were made during this reconciliation.



Start with [the interim report](Report.md), then [the research log](Research%20log.md). The previous [learning-platform report](../database-design/learning-assessments-and-progress/How%20learning%20apps%20store%20practice%20feedback%20and%20progress.md) covers storing attempts, evaluations, corrections and progress.

All commands below run from the repository root. Node 24.15.0 was used; the runner uses built-in modules and `fetch`. No package installation is required.

## Inspect the recorded evidence without model access

```powershell
node research/ai-practice-and-coaching/summarize.mjs study-001 --verify
node --test research/ai-practice-and-coaching/validate.test.mjs research/ai-practice-and-coaching/runner.test.mjs
```

The first command checks snapshot hashes, recorded request limits, response validation and exact reproduction of [summary.json](runs/study-001/summary.json). It does not use gateway credentials or make network requests. Token sums of zero mean **no usage metadata was received**, not verified zero billing.

The tests use fabricated transport responses in temporary directories. They test the software only; their judgments and customer text are not experimental observations. Test output never contributes to `runs/` or the research results. Temporary test folders use the prefix `ai-practice-test-` in the system temporary directory.

## Run the pending experiments when access is restored

The session environment must already supply `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL=gpt-6-astra` and `OPENAI_API_FORMAT=chat_completions`. The base URL is the configured API root; the runner appends `/chat/completions`. Keep credentials in the environment, never in these files or shell history. No alternate provider is selected automatically.

Fresh execution commands are withheld until the allowance is resolved. Inspect existing runs offline with summarize.mjs; use --verify for study-001 and study-002, which have saved summaries.

The overall limit is 2,048 completion tokens per request, with `reasoning_effort: low`. The short cap probe uses 64. No temperature override or SDK retry layer is used. The runner refuses to proceed after a successful response with missing or excessive reported completion usage. A structured successful response and a truncation probe are evidence of compatibility, not proof of hidden gateway billing or provider internals.

A run uses a campaign-wide `runs/running.lock` and up to three independent requests concurrently. After a hard process crash, inspect the recorded requests and confirm the owning process has stopped before manually removing a stale lock. Interrupted requests count against the allowance even when their remote outcome is unknown. Do not run the archived `runs/study-001/frozen/run.mjs`; it preserves the original implementation for evidence and has been superseded by the top-level runner's quota and campaign-limit fixes.

## Files

| File | Purpose |
| --- | --- |
| [Report.md](Report.md) | Connected explanation through Maya's practice journey; explicit pending evidence |
| [Research log.md](Research%20log.md) | Preflight, sources, experiment design, failures, corrections and completion audit |
| [cases.json](cases.json) | Policies, three learner scripts, twelve transcripts and expected labels |
| [prompts.json](prompts.json) | Separate simulator, evaluator and coaching instructions; settings |
| [run.mjs](run.mjs) | Freeze and execute bounded gateway requests |
| [validate.mjs](validate.mjs) | Schemas, evidence checks, completion handling and derived overall result |
| [summarize.mjs](summarize.mjs) | Offline evidence validation and deterministic statistics |
| [validate.test.mjs](validate.test.mjs), [runner.test.mjs](runner.test.mjs) | Offline unit and orchestration checks |
| [study-001 manifest](runs/study-001/manifest.json) | Original frozen sources and their hashes |
| [study-001 summary](runs/study-001/summary.json) | Reproduced record of the two quota failures |

There is no UI, database migration, vector database, training job or deployment. The experiment remains incomplete until real conversation, evaluation and coaching outputs have been generated, inspected and incorporated into the report.
