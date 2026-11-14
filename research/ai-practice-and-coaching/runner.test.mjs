import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));
const mock = `
globalThis.fetch = async (url, options) => {
  const b = JSON.parse(options.body);
  if (b.model !== 'gpt-6-astra' || b.max_completion_tokens > 2048) throw new Error('Bad request controls');
  if (['EACCES', 'EPERM'].includes(process.env.FIXTURE_MODE)) throw Object.assign(new TypeError('fetch failed'), {cause:{code:process.env.FIXTURE_MODE}});
  if (process.env.FIXTURE_MODE === 'quota') return new Response(JSON.stringify({error:{code:'insufficient_quota',type:'insufficient_quota'}}),{status:429});
  if (b.max_completion_tokens === 64) return new Response(JSON.stringify({model:'offline-fixture',choices:[{finish_reason:'length',message:{content:'1 2 3'}}],usage:{prompt_tokens:1,completion_tokens:64,total_tokens:65}}));
  let content = 'Please check the tracking.';
  const schema = b.response_format?.json_schema?.name;
  if (schema) {
    const input = JSON.parse(b.messages[1].content);
    const learner = input.transcript.find(m => m.speaker === 'learner');
    const evidence = learner ? [{message_id:learner.id,quote:learner.text}] : [];
    content = JSON.stringify(schema === 'evaluate' ? {judgments:['ack','next','promise'].map(criterion => ({criterion,verdict:learner?'pass':'insufficient_evidence',evidence,reason:'Offline transport fixture, not a judgment.'}))} : {strengths:[],correction:null,improved_response:'I can check tracking.',needs_review:false,review_reason:''});
  }
  return new Response(JSON.stringify({model:'offline-fixture',choices:[{finish_reason:'stop',message:{content}}],usage:{prompt_tokens:1,completion_tokens:process.env.FIXTURE_MODE === 'over_limit'?2049:1,total_tokens:2}}));
};
`;

async function setup(mode) {
  const directory = await mkdtemp(path.join(tmpdir(), 'ai-practice-test-'));
  for (const file of ['run.mjs', 'validate.mjs', 'cases.json', 'prompts.json']) await copyFile(path.join(root, file), path.join(directory, file));
  await writeFile(path.join(directory, 'mock.mjs'), mock);
  const env = { ...process.env, OPENAI_API_KEY: 'offline-fixture-key', OPENAI_BASE_URL: 'https://fixture.invalid/v1', OPENAI_MODEL: 'gpt-6-astra', OPENAI_API_FORMAT: 'chat_completions', FIXTURE_MODE: mode };
  const run = args => spawnSync(process.execPath, ['--import', pathToFileURL(path.join(directory, 'mock.mjs')).href, path.join(directory, 'run.mjs'), ...args], { env, encoding: 'utf8', timeout: 30000, windowsHide: true });
  const frozen = run(['freeze', 'fixture']);
  assert.equal(frozen.status, 0, frozen.stderr);
  return { directory, run };
}

test('Offline fixture exercises full call matrix and immutable resume without external network', async () => {
  const { directory, run } = await setup('success');
  const result = run(['run', 'fixture', '--allow-model-usage']);
  assert.equal(result.status, 0, result.stderr);
  const attemptDirectory = path.join(directory, 'runs', 'fixture', 'attempts');
  const requests = (await readdir(attemptDirectory)).filter(f => f.endsWith('.request.json'));
  assert.equal(requests.length, 110);
  const records = await Promise.all(requests.map(async file => JSON.parse(await readFile(path.join(attemptDirectory, file), 'utf8'))));
  assert.equal(records.filter(r => r.phase === 'conversation').length, 48);
  assert.equal(records.filter(r => r.phase === 'judgment').length, 48);
  assert.equal(records.filter(r => r.phase === 'connected_evaluation').length, 4);
  assert.equal(records.filter(r => r.phase === 'coaching').length, 8);
  for (const r of records.filter(r => r.phase === 'conversation')) {
    assert(!JSON.stringify(r.body).includes('evaluate_evidence'));
    if (r.job_id.includes('-latest-')) assert.equal(r.body.messages.length, 3);
  }
  for (const r of records) assert(!JSON.stringify(r).includes('offline-fixture-key'));
  const resume = run(['run', 'fixture', '--allow-model-usage']);
  assert.equal(resume.status, 0, resume.stderr);
  assert.equal((await readdir(attemptDirectory)).filter(f => f.endsWith('.request.json')).length, 110);
});

test('Quota failure stops after one request and preserves rejection', async () => {
  const { directory, run } = await setup('quota');
  const result = run(['run', 'fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  const files = await readdir(path.join(directory, 'runs', 'fixture', 'attempts'));
  assert.equal(files.filter(f => f.endsWith('.request.json')).length, 1);
  assert.equal(files.filter(f => f.endsWith('.response.json')).length, 1);
});

for (const code of ['EACCES', 'EPERM']) test(code + ' stops after one request and releases the campaign lock', async () => {
  const { directory, run } = await setup(code);
  const result = run(['run', 'fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Local network access denied/);
  const attempts = path.join(directory, 'runs', 'fixture', 'attempts');
  assert.equal((await readdir(attempts)).filter(f => f.endsWith('.request.json')).length, 1);
  const response = JSON.parse(await readFile(path.join(attempts, '001.response.json'), 'utf8'));
  assert.equal(response.transport_error.code, code);
  assert(!(await readdir(path.join(directory, 'runs'))).includes('running.lock'));
});

test('Usage beyond requested cap halts before measurement', async () => {
  const { directory, run } = await setup('over_limit');
  const result = run(['run', 'fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  assert.equal((await readdir(path.join(directory, 'runs', 'fixture', 'attempts'))).filter(f => f.endsWith('.request.json')).length, 1);
});

test('Budget counts earlier runs and refuses further requests at the ceiling', async () => {
  const { directory, run } = await setup('success');
  const attempts = path.join(directory, 'runs', 'fixture', 'attempts');
  for (let n = 1; n <= 120; n++) await writeFile(path.join(attempts, String(n).padStart(3, '0') + '.request.json'), JSON.stringify({ number: n, job_id: 'historical', phase: 'judgment', retry: false }));
  assert.equal(run(['freeze', 'next-fixture']).status, 0);
  const result = run(['run', 'next-fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  assert.equal((await readdir(path.join(directory, 'runs', 'next-fixture', 'attempts'))).length, 0);
});

test('Changing frozen cases is rejected before any request', async () => {
  const { directory, run } = await setup('success');
  await writeFile(path.join(directory, 'cases.json'), '{}');
  const result = run(['run', 'fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  assert.equal((await readdir(path.join(directory, 'runs', 'fixture', 'attempts'))).length, 0);
});

test('Compatibility allowance remains bounded across run IDs', async () => {
  const { directory, run } = await setup('success');
  const attempts = path.join(directory, 'runs', 'fixture', 'attempts');
  for (let n = 1; n <= 6; n++) await writeFile(path.join(attempts, String(n).padStart(3, '0') + '.request.json'), JSON.stringify({ number: n, job_id: 'historical-compatibility', phase: 'compatibility', retry: false }));
  assert.equal(run(['freeze', 'next-fixture']).status, 0);
  const result = run(['run', 'next-fixture', '--allow-model-usage']);
  assert.notEqual(result.status, 0);
  assert.equal((await readdir(path.join(directory, 'runs', 'next-fixture', 'attempts'))).length, 0);
});
