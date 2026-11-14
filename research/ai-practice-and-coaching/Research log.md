# Research log: AI practice and coaching

## Reconciled status — 15 November 2026

This update supersedes the original dated counts and continuation instructions below. Five compatibility attempts are preserved across three runs: study-001 has two quota failures; study-002 has two local EACCES network-access failures; study-003 has one quota failure. No successful model-generated output exists. Two attempts were retries. Local failures still count conservatively against the allowance.

The approved limits remain 120 total requests, four compatibility requests and eight retries. Another continuation configured six compatibility requests; the current configuration and runner ceiling have been restored to the approved four. Five are already recorded, exceeding that sublimit by one. There are 115 total requests and six retries remaining, but no compatibility allowance. Historical snapshots and responses are unchanged.

Live work remains pending. Do not recreate study-002 or study-003 or issue further requests. Resumption requires restored access and explicit approval of a revised cumulative compatibility allowance: at least seven would cover the five recorded attempts plus the two required checks. This is a proposal, not an approved increase; the 120-request total remains unchanged. After approval, update the configuration and runner ceiling together and freeze a new unused ID (currently study-004). No live requests were made during this reconciliation.


Date: 14 November 2026, Asia/Calcutta. Status: **interim artifacts ready; live experiments pending at the user's request**.

## Scope and preflight

The approved scope is a connected teaching report, research log and runnable Node experiment bundle under this folder. Use the configured `gpt-6-astra` gateway through Chat Completions. Limit the entire investigation to 120 requests, at most 2,048 completion tokens each, up to four compatibility requests and eight retries. Preserve real errors and do not replace unavailable model outputs with predetermined judgments.

Read-only preflight identified `https://github.com/omsrivastava512/sql-postgresql-course` as origin and `main` as its live default branch. GitHub's live branch endpoint returned `60f6102ea1b2329d1fa717e2134491f2467a7cee`; local `main` was `21f28416dbd96eb0613cea6b2e78103496b5a813`. `git rev-list --left-right --count` against that exact upstream SHA returned `0 1`: local ahead one, behind zero. The extra commit contains the learning-assessments report and log, the intended reference for this investigation. No update strategy was needed.

GitHub's all-state PR and issue endpoints both returned empty arrays. Recent upstream commits and local history were checked for equivalent practice, conversation, evaluation, simulation and coaching work; no duplicate investigation was found. No ticket ID was supplied. Direct shell access to GitHub was network-blocked, so the connected GitHub tools supplied the live upstream evidence. No fetch, stage, commit, branch change, merge, rebase or push was performed.

The existing untracked `learning/` folder was present at preflight and is outside scope. All repository writes made by this investigation are confined to `research/ai-practice-and-coaching/`. No dependencies, course material or prior research were modified.

## Source register and how each source was used

These primary pages were opened on 14 November 2026. Documentation establishes the provider's public interface; it does not prove compatibility through the configured gateway. No private product architecture is inferred.

| Source | Relevant inspected material | Use and limitation |
| --- | --- | --- |
| [Chat Completions reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) | Message request, schema response format, completion limit and usage | Request shape; gateway compatibility still pending |
| [GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra) | Exact model identifier, reasoning-effort choices and Chat Completions endpoint | Preserve requested model; public pricing is not assumed to be gateway billing |
| [Structured-output guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat) | Schema adherence, mistakes, refusal and incomplete-output handling | Mechanical validation is distinct from correctness |
| [Conversation state](https://developers.openai.com/api/docs/guides/conversation-state) | Manual message-history example | Application supplies the history on later calls |
| [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) | Explicit criteria, edge/adversarial cases, model-grader limitations and human calibration | Design the case matrix; no human calibration was performed here |
| [Retrieval](https://developers.openai.com/api/docs/guides/retrieval) | Semantic search and attribute filtering | Explain larger-policy extension; no retrieval was built |
| [Model optimization](https://developers.openai.com/api/docs/guides/model-optimization) | Prompt context, evaluation and fine-tuning distinctions | Explain concepts; no training or fine-tuning API was used |
| [Structured-output cookbook](https://developers.openai.com/cookbook/examples/structured_outputs_intro) | `get_math_solution`, schema fields, parsing and refusal branch; structured summaries | Public implementation examples; page is archived, so do not assume old models or SDK syntax are current |
| [Evaluation flywheel cookbook](https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) | Qualitative error analysis, judge calibration and held-out sets | Supports separating software metrics from semantic inspection; archived workflow was not executed |

Provider pages were used for concise mechanism descriptions. The policies, cases, expected labels, runner and report examples are original teaching artifacts. No external example application or hosted evaluator was deployed.

## Frozen experiment design

The first freeze occurred before either gateway request. [Manifest](runs/study-001/manifest.json) records the UTC timestamp, Node version and SHA-256 hashes of `cases.json`, `prompts.json`, `run.mjs` and `validate.mjs`; exact copies are under `runs/study-001/frozen/`. The three learner scripts, twelve fixed cases, expectations, policy versions and prompt variants have not changed after that freeze.

| Experiment | Construction | Calls |
| --- | --- | ---: |
| Conversation behavior | Three fixed learner scripts × two history conditions × two repetitions × four generated customer turns | 48 |
| Judgment quality | Twelve fixed transcripts × basic/explicit evaluator variants × two repetitions | 48 |
| Connected feedback | Four preselected generated conversations, each evaluated once and coached twice | 12 |
| Compatibility | At most four requests across the campaign | Up to 4 |
| Recovery | At most eight retries across the campaign | Up to 8 |

The original compatibility sequence would have checked plain text, a structured evaluation, and a deliberate 64-token truncation. It stopped during plain text. The current sequence uses one structured evaluation to check authentication, text output, parameter acceptance, schema handling and usage together, followed by the truncation probe. This uses the two remaining compatibility slots if both succeed. The measured conditions and prompt wording remain unchanged.

Call settings: configured `gpt-6-astra`; `reasoning_effort: low`; maximum 2,048 completion tokens; 180-second HTTP timeout; no temperature or seed override; strict JSON Schema requested for evaluation/coaching; concurrency three across independent jobs, sequential turns within a conversation. Each attempt is reserved on disk before dispatch. Requests and response files use exclusive creation. Redirect following is disabled. Keys and the configured endpoint are excluded from request records; exact occurrences are redacted from response bodies if echoed.

The script ordering is deterministic, not randomized. Evaluator variant order reverses on repetition two, but concurrent scheduling and gateway changes could still confound a small comparison. Generated customer replies can change the context of later fixed learner messages. The learner scripts themselves do not adapt, which is a controlled test condition and a limit on realism.

The reduced-history input contains the previous customer message and latest learner message, plus the same system scenario as full history. Facts can survive if the previous reply repeats them. Qualitative reviewers must inspect actual input before describing a memory error or success.

Connected conversation selection was fixed in advance: `careful-full-r1`, `overpromise-full-r1`, `repair_and_injection-full-r1`, and `careful-latest-r1`. Invalid evaluation prevents downstream coaching. Missing upstream conversations prevent their connected operations; coverage reporting must expose that reduction.

## Observed access failure

The actual live evidence is limited to these two HTTP responses:

| Request | Local time | Operation | Status | Latency | Result |
| --- | --- | --- | --- | ---: | --- |
| 001 | 14:49:36 | `compat-text` | 429 | 1,361 ms | `insufficient_quota`; no choice, model ID or usage |
| 002 | 14:49:38 | Retry of `compat-text` | 429 | 610 ms | Same error; no choice, model ID or usage |

[Request 001](runs/study-001/attempts/001.request.json), [response 001](runs/study-001/attempts/001.response.json), [request 002](runs/study-001/attempts/002.request.json), [response 002](runs/study-001/attempts/002.response.json), [failed logical job](runs/study-001/jobs/compat-text.json).

The response states that available platform credits are exhausted. This is evidence of the gateway's rejection, not independently verified billing information. Successful model authentication, model availability, parameter compatibility, reasoning settings, token-limit enforcement and usage reporting remain unverified. No monetary ceiling or zero-cost claim is made.

The first runner retried all 429 responses. That was too broad: quota exhaustion needs an external account change. After inspecting the error, the top-level runner was changed to stop on `insufficient_quota`. It also gained a campaign-wide lock and counts all saved attempts across run directories so a new identifier cannot silently reset the approved allowance. The frozen first runner remains unchanged as historical evidence.

After the exception, the host's Node process printed a Windows libuv shutdown assertion. Both request/response pairs and the failed-job record had already been written, and the lock was removed. Subsequent offline checks completed normally. This host-level shutdown issue was not diagnosed as part of the model study; there is no evidence of a successful hidden model generation.

The user was informed and chose to leave live runs pending. No further gateway request was made. Remaining campaign allowance: 118 requests, two compatibility slots, seven retries. A successful new two-check compatibility sequence plus the 108 measured calls would bring the cumulative count to 112.

## Metrics and interpretation protocol

`summarize.mjs` validates frozen hashes and reproduces each stored decoded result from the provider response. It reports attempted requests by phase, returned model identifiers, reported token totals, missing usage, latency distribution, failures, completed conversation count, evaluator validity and label agreement.

Criterion-level agreement is exact equality with the fixed researcher expectation. Its denominator is valid comparable criterion decisions; invalid outputs are reported separately and must not disappear from interpretation. False pass means expected fail but predicted pass; false failure means expected pass but predicted fail. Expected insufficient evidence receiving a definite label is separately counted as missed uncertainty. All remaining disagreements are retained in the detailed array. These are descriptive counts, not general accuracy estimates or confidence intervals.

Repeated-run variation compares each valid case/variant pair's criterion labels. It does not measure wording variation. Recorded usage totals sum only metadata actually returned; absent fields remain a reporting limitation. A small truncation probe can give evidence that the gateway honors a requested cap for that request, but cannot prove internal enforcement or billing semantics for all cases.

The following qualitative inspections are **pending**, to be performed explicitly as Codex analysis, unblinded and not independent human rating:

1. Inspect all twelve generated conversations: responsiveness, corrections, exact reference/channel recall, role adherence, attempted scoring disclosure and invented courier facts. Attach message IDs and quotations.
2. Inspect every evaluator disagreement, plus evidence in agreeing results: an agreeing verdict can still cite irrelevant support. Review negation, omissions, contradiction and correction across all twelve cases and both repetitions.
3. Inspect all eight coaching outputs: supported strengths, actual priority issue, policy-compliant replacement, invented mistakes and appropriate uncertainty. Trace each claim to the original transcript, not only the evaluation.
4. Select at least one complete, actually executed conversation/evaluation/coaching chain for the report. Include representative failures as well as successes without choosing only favorable runs.

Human domain experts should later review the rubric and ambiguous labels before treating them as a reference standard. Real learners and transfer measures would be needed to assess training effectiveness. This investigation does not provide either.

## Offline verification

Executed with Node 24.15.0: **17 tests passed**. Twelve validator tests cover exact quotation checks, nonexistent messages, wrong speaker, duplicate/missing criteria, invalid verdicts, missing evidence, malformed JSON, refusal, truncation, overall derivation, coaching evidence and review explanations. One deliberately valid mechanical citation is semantically insufficient, demonstrating the boundary of the check.

Five runner tests use a replaced `fetch` in temporary directories, with a dummy key and fictional endpoint. They verify the complete 110-call orchestration (108 measured-shaped calls plus two compatibility fixtures), immutable resume without new requests, immediate quota stopping, excessive-usage stopping, cumulative request caps across run IDs, and rejection of changed frozen sources. These are **fabricated software fixtures**, not model requests or research results. Their output is never imported into the recorded live evidence.

The first test attempt exposed Windows file-path handling in the test preload argument; using a proper file URL fixed that test harness issue. All seventeen then passed. The current runner passed syntax checking. The actual `study-001` summary was written once and reproduced exactly with `--verify` after the quota fix. The verifier does not require environment credentials.

Final artifact checks parsed every JSON file, verified local Markdown links and balanced fences, scanned for the exact session API key without printing it, and confirmed an empty tracked Git diff. The only new repository content from this task is this investigation folder. The analyzer also tolerates a recorded non-JSON HTTP body while preserving its raw evidence.

## Continue from the preserved state

Use [README commands](README.md) after the user resumes the live work and gateway access is restored. Do not reuse existing IDs; follow the reconciled continuation requirements above. The current source no longer matches the archived runner hash, so the top-level command deliberately refuses to rerun that old snapshot. Fresh IDs remain subject to the cumulative campaign allowance.

Do not spend the remaining compatibility slots merely to poll whether credits have returned. If a required control fails, preserve that evidence and identify what remains unresolved. Do not silently switch models, endpoints, token limits or output parameters, and do not overwrite failed runs with a successful rerun.

## Completion audit

| Requirement | State |
| --- | --- |
| New folder only; prior learning report retained as reference | Implemented |
| Primary-source mechanism research and beginner-friendly connected explanation | Interim report prepared |
| Three separate model operations; no dependencies added | Implemented; offline orchestration verified |
| Frozen policies, cases, expectations and prompts | Preserved before requests |
| Real gateway evidence and failed responses retained | Two quota failures preserved |
| Bounded request/token controls and secrets outside artifacts | Implemented; live successful cap enforcement pending |
| 48 customer turns and 48 fixed evaluations | Pending |
| Four connected evaluations and eight coaching outputs | Pending |
| Semantic evidence/coaching review and repeated-run interpretation | Pending |
| Complete executed conversation-to-coaching trace | Pending |
| Offline inspection and fresh-run commands separated | Delivered |
| Recorded summary reproducible | Verified for failure evidence |
| Interactive UI, voice, vector retrieval, training, production deployment | Outside this pass |

The investigation is not complete. Access restoration and the user's resumption are required before the remaining live evidence can be obtained.
