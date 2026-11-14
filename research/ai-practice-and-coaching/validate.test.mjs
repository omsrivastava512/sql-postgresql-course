import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, decodeResponse, overall } from './validate.mjs';

const transcript = [{ id: 'm1', speaker: 'customer', text: 'My parcel is late.' }, { id: 'm2', speaker: 'learner', text: "I'm sorry it is late. I can check tracking. I cannot guarantee arrival today." }];
function evaluation() {
  return { judgments: ['ack', 'next', 'promise'].map(criterion => ({ criterion, verdict: 'pass', evidence: [{ message_id: 'm2', quote: 'I can check tracking.' }], reason: 'A short reason.' })) };
}

test('Existing quotes pass mechanical checks without proving semantic relevance', () => assert.equal(validate('evaluate', evaluation(), transcript).valid, true));
test('Reject fabricated quotation', () => {
  const value = evaluation();
  value.judgments[0].evidence[0].quote = 'I already checked the courier.';
  assert.equal(validate('evaluate', value, transcript).valid, false);
});
test('Reject nonexistent message', () => {
  const value = evaluation();
  value.judgments[0].evidence[0].message_id = 'm99';
  assert.equal(validate('evaluate', value, transcript).valid, false);
});
test('Reject customer evidence as learner performance', () => {
  const value = evaluation();
  value.judgments[0].evidence = [{ message_id: 'm1', quote: 'My parcel is late.' }];
  assert.equal(validate('evaluate', value, transcript).valid, false);
});
test('Reject duplicate or missing criteria', () => {
  const value = evaluation();
  value.judgments[2].criterion = 'ack';
  assert.equal(validate('evaluate', value, transcript).valid, false);
  value.judgments.pop();
  assert.equal(validate('evaluate', value, transcript).valid, false);
});
test('Reject invalid verdict and extra model-authored overall', () => {
  const value = evaluation();
  value.judgments[0].verdict = 'probably';
  assert.equal(validate('evaluate', value, transcript).valid, false);
  assert.equal(validate('evaluate', { ...evaluation(), overall: 'pass' }, transcript).valid, false);
});
test('Allow empty evidence only when learner text is absent', () => {
  const value = evaluation();
  for (const j of value.judgments) { j.evidence = []; j.verdict = 'insufficient_evidence'; }
  assert.equal(validate('evaluate', value, transcript.slice(0, 1)).valid, true);
  assert.equal(validate('evaluate', value, transcript).valid, false);
});
test('Reject malformed JSON, refusal and truncated output', () => {
  assert.equal(decodeResponse({ choices: [{ finish_reason: 'stop', message: { content: '{' } }] }, 'evaluate').valid, false);
  assert.equal(decodeResponse({ choices: [{ finish_reason: 'stop', message: { content: '{}', refusal: 'Refused' } }] }, 'evaluate').valid, false);
  assert.equal(decodeResponse({ choices: [{ finish_reason: 'length', message: { content: JSON.stringify(evaluation()) } }] }, 'evaluate').valid, false);
});
test('Derive overall with fail precedence and uncertainty review', () => {
  assert.equal(overall([{ verdict: 'pass' }]), 'pass');
  assert.equal(overall([{ verdict: 'pass' }, { verdict: 'insufficient_evidence' }]), 'review');
  assert.equal(overall([{ verdict: 'fail' }, { verdict: 'insufficient_evidence' }]), 'fail');
});
test('Accept no-correction coaching and reject invented evidence', () => {
  const value = { strengths: [], correction: null, improved_response: 'I can check tracking.', needs_review: false, review_reason: '' };
  assert.equal(validate('coach', value, transcript).valid, true);
  value.correction = { criterion: 'next', text: 'Check tracking.', evidence: [{ message_id: 'm2', quote: 'No thanks.' }] };
  assert.equal(validate('coach', value, transcript).valid, false);
});
test('Reject review flag without explanation', () => assert.equal(validate('coach', { strengths: [], correction: null, improved_response: 'Please clarify.', needs_review: true, review_reason: '' }, transcript).valid, false));
test('Reject empty simulation and absent choices', () => {
  assert.equal(validate('simulate', '').valid, false);
  assert.equal(decodeResponse({}, 'simulate').valid, false);
});
