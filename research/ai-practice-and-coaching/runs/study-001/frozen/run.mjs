import { mkdir, readFile, writeFile, readdir, open, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { evaluationSchema, coachingSchema, decodeResponse } from './validate.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const [command, runId] = process.argv.slice(2);
const sourceFiles = ['cases.json', 'prompts.json', 'run.mjs', 'validate.mjs'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async file => JSON.parse(await readFile(file, 'utf8'));
const save = (file, data) => writeFile(file, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
const exists = async file => { try { await readFile(file); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };

if (!['freeze', 'run'].includes(command) || !runId || !/^[a-zA-Z0-9_-]+$/.test(runId)) {
  console.error('Usage: node research/ai-practice-and-coaching/run.mjs freeze RUN_ID | run RUN_ID --allow-model-usage');
  process.exit(1);
}
const directory = path.join(root, 'runs', runId);

if (command === 'freeze') {
  await mkdir(path.join(root, 'runs'), { recursive: true });
  await mkdir(directory);
  await mkdir(path.join(directory, 'frozen'));
  await mkdir(path.join(directory, 'attempts'));
  await mkdir(path.join(directory, 'jobs'));
  const hashes = {};
  for (const file of sourceFiles) {
    const bytes = await readFile(path.join(root, file));
    hashes[file] = hash(bytes);
    await writeFile(path.join(directory, 'frozen', file), bytes, { flag: 'wx' });
  }
  await save(path.join(directory, 'manifest.json'), { run_id: runId, frozen_at: new Date().toISOString(), node: process.version, hashes, expected_measured_requests: 108, maximum_requests: 120, expectations: 'Researcher-authored synthetic expectations, not independent human-expert ground truth.' });
  console.log('Frozen ' + runId + '; no model requests made.');
  process.exit(0);
}

if (!process.argv.includes('--allow-model-usage')) throw new Error('Fresh requests require --allow-model-usage. Offline inspection uses summarize.mjs.');
const manifest = await json(path.join(directory, 'manifest.json'));
for (const file of sourceFiles) {
  if (hash(await readFile(path.join(root, file))) !== manifest.hashes[file]) throw new Error('Frozen source changed: ' + file);
}
const cases = await json(path.join(directory, 'frozen', 'cases.json'));
const prompts = await json(path.join(directory, 'frozen', 'prompts.json'));
const settings = prompts.settings;
if (settings.max_requests > 120 || settings.max_completion_tokens > 2048 || settings.max_retries > 8 || settings.max_compatibility > 4 || settings.model !== 'gpt-6-astra') throw new Error('Experiment limits exceeded');
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_BASE_URL || process.env.OPENAI_MODEL !== settings.model || process.env.OPENAI_API_FORMAT !== 'chat_completions') throw new Error('Required session gateway configuration unavailable or mismatched');
const endpoint = new URL(process.env.OPENAI_BASE_URL.replace(/\/$/, '') + '/chat/completions');
if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) throw new Error('HTTPS or a loopback gateway is required');
if (endpoint.username || endpoint.password || endpoint.search) throw new Error('Credentials must be supplied only via authorization header');
const lockPath = path.join(directory, 'running.lock');
const lock = await open(lockPath, 'wx');
await lock.writeFile(String(process.pid));
let stopped = false;
const attemptFiles = (await readdir(path.join(directory, 'attempts'))).filter(f => f.endsWith('.request.json'));
let count = attemptFiles.length;
let retries = 0;
let compatibility = 0;
for (const file of attemptFiles) {
  const record = await json(path.join(directory, 'attempts', file));
  if (record.retry) retries++;
  if (record.phase === 'compatibility') compatibility++;
}
const redact = text => text.split(process.env.OPENAI_API_KEY).join('[REDACTED_KEY]').split(process.env.OPENAI_BASE_URL).join('[REDACTED_ENDPOINT]');

async function request(job, body, retry = false) {
  if (stopped || count >= settings.max_requests || (retry && retries >= settings.max_retries) || (job.phase === 'compatibility' && compatibility >= settings.max_compatibility)) throw new Error('Request allowance exhausted or run stopped');
  const number = ++count;
  if (retry) retries++;
  if (job.phase === 'compatibility') compatibility++;
  const stem = String(number).padStart(3, '0');
  const requestRecord = { number, job_id: job.id, phase: job.phase, retry, started_at: new Date().toISOString(), body };
  await save(path.join(directory, 'attempts', stem + '.request.json'), requestRecord);
  const start = performance.now();
  let result;
  try {
    const response = await fetch(endpoint, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.OPENAI_API_KEY }, body: JSON.stringify(body), signal: AbortSignal.timeout(settings.timeout_ms) });
    const raw = redact(await response.text());
    let envelope;
    try { envelope = JSON.parse(raw); } catch { envelope = null; }
    result = { http_status: response.status, raw, envelope, request_id: response.headers.get('x-request-id'), transport_error: null };
  } catch (error) {
    result = { http_status: null, raw: null, envelope: null, request_id: null, transport_error: { name: error.name, code: error.cause?.code ?? null, message: redact(error.message) } };
  }
  result = { number, job_id: job.id, latency_ms: Math.round(performance.now() - start), finished_at: new Date().toISOString(), ...result };
  await save(path.join(directory, 'attempts', stem + '.response.json'), result);
  console.log(JSON.stringify({ request: number, job: job.id, status: result.http_status, latency_ms: result.latency_ms, model: result.envelope?.model, usage: result.envelope?.usage, error: result.transport_error?.name }));
  const used = result.envelope?.usage?.completion_tokens;
  if (result.http_status === 200 && (!Number.isInteger(used) || used < 0 || used > body.max_completion_tokens)) {
    stopped = true;
    throw new Error('Completion usage missing or beyond requested limit; required control unresolved');
  }
  return result;
}

async function execute(job, messages, schema = null, cap = settings.max_completion_tokens) {
  const target = path.join(directory, 'jobs', job.id + '.json');
  if (await exists(target)) return json(target);
  const previous = [];
  for (const file of (await readdir(path.join(directory, 'attempts'))).filter(f => f.endsWith('.request.json'))) {
    const record = await json(path.join(directory, 'attempts', file));
    if (record.job_id === job.id) previous.push(record);
  }
  const body = { model: settings.model, messages, max_completion_tokens: cap, reasoning_effort: settings.reasoning_effort, ...(schema ? { response_format: { type: 'json_schema', json_schema: { name: job.kind, strict: true, schema } } } : {}) };
  let result;
  if (previous.length) {
    const latest = previous.sort((a, b) => b.number - a.number)[0];
    const file = path.join(directory, 'attempts', String(latest.number).padStart(3, '0') + '.response.json');
    if (await exists(file)) result = await json(file);
    else result = { number: latest.number, http_status: null, transport_error: { name: 'InterruptedUnknownOutcome' }, envelope: null };
  } else result = await request(job, body);
  const transient = result.http_status === null || [408, 429, 500, 502, 503, 504].includes(result.http_status);
  if (transient && !previous.some(p => p.retry) && retries < settings.max_retries && (job.phase !== 'compatibility' || compatibility < settings.max_compatibility)) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    result = await request(job, body, true);
  }
  if (result.http_status === 200 && (!Number.isInteger(result.envelope?.usage?.completion_tokens) || result.envelope.usage.completion_tokens < 0 || result.envelope.usage.completion_tokens > cap)) {
    stopped = true;
    throw new Error('Recorded completion usage does not establish required token control');
  }
  const validation = result.http_status !== 200 ? { valid: false, errors: ['transport_or_http_failure'] } : job.kind === 'cap_probe' ? { valid: result.envelope?.choices?.[0]?.finish_reason === 'length' && result.envelope?.usage?.completion_tokens <= cap, errors: result.envelope?.choices?.[0]?.finish_reason === 'length' ? [] : ['cap_probe_did_not_truncate'] } : decodeResponse(result.envelope, job.kind, job.transcript);
  const output = { ...job, request_number: result.number, validation };
  await save(target, output);
  return output;
}

async function pool(items, fn) {
  let next = 0;
  const workers = Array.from({ length: settings.concurrency }, async () => {
    while (next < items.length && !stopped) await fn(items[next++]);
  });
  const outcomes = await Promise.allSettled(workers);
  const failure = outcomes.find(o => o.status === 'rejected');
  if (failure) throw failure.reason;
}

function evaluationMessages(transcript, policy, complete, variant) {
  return [{ role: 'system', content: prompts['evaluate_' + variant] }, { role: 'user', content: JSON.stringify({ policy_id: policy, policy: cases.policies[policy], criteria: cases.criteria, transcript_complete: complete, transcript, output_schema: evaluationSchema }) }];
}

async function evaluate(job, transcript, policy, complete, variant) {
  return execute({ ...job, kind: 'evaluate', transcript, policy, complete, variant }, evaluationMessages(transcript, policy, complete, variant), evaluationSchema);
}

try {
  const plain = await execute({ id: 'compat-text', phase: 'compatibility', kind: 'simulate' }, [{ role: 'user', content: 'Reply with exactly: gateway ready' }]);
  if (!plain.validation.valid) throw new Error('Text compatibility failed');
  const specimen = cases.fixed[0];
  const structured = await evaluate({ id: 'compat-schema', phase: 'compatibility' }, specimen.messages, specimen.policy, specimen.complete, 'evidence');
  if (!structured.validation.valid) throw new Error('Structured-output compatibility failed');
  const cap = await execute({ id: 'compat-cap', phase: 'compatibility', kind: 'cap_probe' }, [{ role: 'user', content: 'Write the integers from 1 to 10000, separated by spaces. Do not summarize or stop early.' }], null, 64);
  if (!cap.validation.valid) throw new Error('Token-limit compatibility failed');
  const conversations = [];
  for (let repeat = 1; repeat <= settings.repetitions; repeat++) for (const script of cases.scripts) for (const history of ['full', 'latest']) conversations.push({ id: script.id + '-' + history + '-r' + repeat, script, history, repeat });
  await pool(conversations, async conversation => {
    const transcript = [{ id: 'm1', speaker: 'customer', text: cases.scenario.opening }];
    for (let turn = 0; turn < conversation.script.turns.length; turn++) {
      transcript.push({ id: 'm' + (transcript.length + 1), speaker: 'learner', text: conversation.script.turns[turn] });
      const supplied = conversation.history === 'full' ? transcript : transcript.slice(-2);
      const messages = [{ role: 'system', content: prompts.simulate + '\nScenario: ' + cases.scenario.facts }, ...supplied.map(m => ({ role: m.speaker === 'learner' ? 'user' : 'assistant', content: m.text }))];
      const result = await execute({ id: conversation.id + '-t' + (turn + 1), conversation_id: conversation.id, phase: 'conversation', kind: 'simulate', history: conversation.history, script: conversation.script.id, repeat: conversation.repeat, turn: turn + 1, transcript: [...transcript] }, messages);
      if (!result.validation.valid) return;
      transcript.push({ id: 'm' + (transcript.length + 1), speaker: 'customer', text: result.validation.value });
    }
    const target = path.join(directory, 'jobs', conversation.id + '-transcript.json');
    if (!await exists(target)) await save(target, { id: conversation.id, phase: 'transcript', history: conversation.history, script: conversation.script.id, repeat: conversation.repeat, transcript });
  });
  const evaluations = [];
  for (let repeat = 1; repeat <= settings.repetitions; repeat++) for (const item of cases.fixed) for (const variant of (repeat === 1 ? ['basic', 'evidence'] : ['evidence', 'basic'])) evaluations.push({ item, variant, repeat });
  await pool(evaluations, async ({ item, variant, repeat }) => evaluate({ id: item.id + '-' + variant + '-r' + repeat, phase: 'judgment', case_id: item.id, repeat, expected: item.expected }, item.messages, item.policy, item.complete, variant));
  await pool(cases.connected_selection, async id => {
    const file = path.join(directory, 'jobs', id + '-transcript.json');
    if (!await exists(file)) return;
    const { transcript } = await json(file);
    const evaluation = await evaluate({ id: id + '-evaluation', phase: 'connected_evaluation', conversation_id: id }, transcript, 'P1', true, 'evidence');
    if (!evaluation.validation.valid) return;
    for (let repeat = 1; repeat <= 2; repeat++) await execute({ id: id + '-coach-r' + repeat, phase: 'coaching', kind: 'coach', conversation_id: id, evaluation_id: evaluation.id, repeat, transcript }, [{ role: 'system', content: prompts.coach }, { role: 'user', content: JSON.stringify({ policy: cases.policies.P1, transcript, evaluation: evaluation.validation.value, overall: evaluation.validation.overall, output_schema: coachingSchema }) }], coachingSchema);
  });
  const completePath = path.join(directory, 'finished.json');
  if (!await exists(completePath)) await save(completePath, { finished_at: new Date().toISOString(), requests: count, retries, compatibility });
  console.log('Batch finished: ' + count + ' requests. Run summarize.mjs to inspect coverage and errors.');
} finally {
  await lock.close();
  await unlink(lockPath);
}
