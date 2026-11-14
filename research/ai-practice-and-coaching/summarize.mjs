import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { decodeResponse } from './validate.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const runId = process.argv[2];
if (!runId || !/^[a-zA-Z0-9_-]+$/.test(runId)) throw new Error('Usage: node research/ai-practice-and-coaching/summarize.mjs RUN_ID [--write|--verify]');
const directory = path.join(root, 'runs', runId);
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const manifest = await json(path.join(directory, 'manifest.json'));
for (const [file, expected] of Object.entries(manifest.hashes)) assert.equal(createHash('sha256').update(await readFile(path.join(directory, 'frozen', file))).digest('hex'), expected, 'Frozen hash: ' + file);
const attempts = [];
const requestFiles = (await readdir(path.join(directory, 'attempts'))).filter(f => f.endsWith('.request.json')).sort();
for (const file of requestFiles) {
  const request = await json(path.join(directory, 'attempts', file));
  let response = null;
  try { response = await json(path.join(directory, 'attempts', file.replace('.request.', '.response.'))); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  attempts.push({ request, response });
}
assert(attempts.length <= 120, 'Request cap');
assert(attempts.filter(a => a.request.retry).length <= 8, 'Retry cap');
assert(attempts.filter(a => a.request.phase === 'compatibility').length <= (manifest.maximum_compatibility_requests ?? 4), 'Compatibility cap');
for (const { request, response } of attempts) {
  assert(request.body.max_completion_tokens <= 2048 && request.body.max_completion_tokens > 0, 'Per-request token limit');
  assert.equal(request.body.model, 'gpt-6-astra');
  if (response?.raw) {
    let parsed;
    try { parsed = JSON.parse(response.raw); } catch { parsed = null; }
    assert.deepEqual(parsed, response.envelope, 'Recorded raw response matches envelope');
  }
}
const jobs = [];
for (const file of (await readdir(path.join(directory, 'jobs'))).sort()) if (file.endsWith('.json')) jobs.push(await json(path.join(directory, 'jobs', file)));
for (const job of jobs.filter(j => j.kind && j.kind !== 'cap_probe')) {
  const response = attempts.find(a => a.request.number === job.request_number)?.response;
  const validation = response?.http_status === 200 ? decodeResponse(response.envelope, job.kind, job.transcript) : { valid: false, errors: ['transport_or_http_failure'] };
  assert.deepEqual(validation, job.validation, 'Validation reproduction: ' + job.id);
}
const phases = {};
for (const { request } of attempts) phases[request.phase] = (phases[request.phase] || 0) + 1;
const usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, reasoning_tokens: 0, cached_tokens: 0, responses_with_usage: 0, missing_usage: 0 };
const models = new Set();
const latencies = [];
const failures = [];
for (const { request, response } of attempts) {
  if (!response) { failures.push({ request: request.number, error: 'unknown_outcome' }); continue; }
  latencies.push(response.latency_ms);
  const u = response.envelope?.usage;
  if (response.envelope?.model) models.add(response.envelope.model);
  if (u) {
    usage.responses_with_usage++;
    for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens']) usage[key] += u[key] || 0;
    usage.reasoning_tokens += u.completion_tokens_details?.reasoning_tokens || 0;
    usage.cached_tokens += u.prompt_tokens_details?.cached_tokens || 0;
  } else usage.missing_usage++;
  if (response.http_status !== 200) failures.push({ request: request.number, error: response.transport_error?.code || response.transport_error?.name || response.http_status });
}
latencies.sort((a, b) => a - b);
const variants = {};
for (const variant of ['basic', 'evidence']) {
  const selected = jobs.filter(j => j.phase === 'judgment' && j.variant === variant);
  const stats = { transcripts_requested: selected.length, valid_outputs: 0, expected_criterion_decisions: selected.length * 3, comparable_decisions: 0, agreement: 0, false_passes: 0, false_failures: 0, missed_uncertainty: 0, invalid_outputs: [], disagreements: [], repeated_pairs: 0, repeated_decisions_changed: 0 };
  for (const job of selected) {
    if (!job.validation.valid) { stats.invalid_outputs.push({ id: job.id, errors: job.validation.errors }); continue; }
    stats.valid_outputs++;
    for (const judgment of job.validation.value.judgments) {
      const expected = job.expected[judgment.criterion];
      stats.comparable_decisions++;
      if (judgment.verdict === expected) stats.agreement++;
      else {
        stats.disagreements.push({ id: job.id, criterion: judgment.criterion, expected, actual: judgment.verdict });
        if (judgment.verdict === 'pass' && expected === 'fail') stats.false_passes++;
        if (judgment.verdict === 'fail' && expected === 'pass') stats.false_failures++;
        if (expected === 'insufficient_evidence' && judgment.verdict !== expected) stats.missed_uncertainty++;
      }
    }
  }
  for (const a of selected.filter(j => j.repeat === 1 && j.validation.valid)) {
    const b = selected.find(j => j.case_id === a.case_id && j.repeat === 2 && j.validation.valid);
    if (!b) continue;
    stats.repeated_pairs++;
    for (const j of a.validation.value.judgments) if (j.verdict !== b.validation.value.judgments.find(k => k.criterion === j.criterion).verdict) stats.repeated_decisions_changed++;
  }
  variants[variant] = stats;
}
const countPhase = phase => jobs.filter(j => j.phase === phase).length;
const summary = {
  run_id: runId,
  requests: attempts.length,
  retries: attempts.filter(a => a.request.retry).length,
  phases,
  returned_models: [...models].sort(),
  usage,
  latency_ms: { min: latencies[0] ?? null, median: latencies.length ? (latencies[Math.floor((latencies.length - 1) / 2)] + latencies[Math.ceil((latencies.length - 1) / 2)]) / 2 : null, p95: latencies[Math.ceil(latencies.length * 0.95) - 1] ?? null, max: latencies.at(-1) ?? null },
  transport_failures: failures,
  invalid_outputs: jobs.filter(j => j.validation && !j.validation.valid).map(j => ({ id: j.id, errors: j.validation.errors })),
  coverage: { customer_turns: countPhase('conversation'), complete_conversations: countPhase('transcript'), fixed_evaluations: countPhase('judgment'), connected_evaluations: countPhase('connected_evaluation'), coaching_outputs: countPhase('coaching') },
  variants,
  connected: jobs.filter(j => j.phase === 'connected_evaluation').map(j => ({ id: j.id, valid: j.validation.valid, overall: j.validation.overall ?? null, judgments: j.validation.value?.judgments.map(({ criterion, verdict }) => ({ criterion, verdict })) ?? [] })),
  coaching_review_flags: jobs.filter(j => j.phase === 'coaching' && j.validation.value?.needs_review).map(j => ({ id: j.id, reason: j.validation.value.review_reason }))
};
const output = JSON.stringify(summary, null, 2) + '\n';
if (process.argv.includes('--write')) await writeFile(path.join(directory, 'summary.json'), output, { flag: 'wx' });
if (process.argv.includes('--verify')) assert.equal(await readFile(path.join(directory, 'summary.json'), 'utf8'), output, 'Published summary exactly reproduces');
console.log(output);
if (process.argv.includes('--verify')) console.log('PASS: frozen hashes, request limits, recorded validation and summary reproduction. No model access used.');
