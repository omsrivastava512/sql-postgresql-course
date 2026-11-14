const verdicts = ['pass', 'fail', 'insufficient_evidence'];
const ids = ['ack', 'next', 'promise'];
const evidenceSchema = { type: 'array', items: { type: 'object', additionalProperties: false, properties: { message_id: { type: 'string' }, quote: { type: 'string' } }, required: ['message_id', 'quote'] } };
const feedbackSchema = { type: 'object', additionalProperties: false, properties: { criterion: { type: 'string', enum: ids }, text: { type: 'string' }, evidence: evidenceSchema }, required: ['criterion', 'text', 'evidence'] };
export const evaluationSchema = { type: 'object', additionalProperties: false, properties: { judgments: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { criterion: { type: 'string', enum: ids }, verdict: { type: 'string', enum: verdicts }, evidence: evidenceSchema, reason: { type: 'string' } }, required: ['criterion', 'verdict', 'evidence', 'reason'] } } }, required: ['judgments'] };
export const coachingSchema = { type: 'object', additionalProperties: false, properties: { strengths: { type: 'array', items: feedbackSchema }, correction: { anyOf: [feedbackSchema, { type: 'null' }] }, improved_response: { type: 'string' }, needs_review: { type: 'boolean' }, review_reason: { type: 'string' } }, required: ['strengths', 'correction', 'improved_response', 'needs_review', 'review_reason'] };

function keys(value, expected) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join() === [...expected].sort().join();
}

function evidenceErrors(evidence, transcript) {
  if (!Array.isArray(evidence)) return ['evidence_not_array'];
  const errors = [];
  if (!evidence.length && transcript.some(m => m.speaker === 'learner')) errors.push('missing_evidence');
  for (const item of evidence) {
    if (!keys(item, ['message_id', 'quote']) || typeof item.quote !== 'string' || !item.quote.trim()) {
      errors.push('invalid_evidence_shape');
      continue;
    }
    const message = transcript.find(m => m.id === item.message_id);
    if (!message) errors.push('unknown_message:' + item.message_id);
    else if (message.speaker !== 'learner') errors.push('wrong_speaker:' + item.message_id);
    else if (!message.text.includes(item.quote)) errors.push('quote_not_found:' + item.message_id);
  }
  return errors;
}

export function overall(judgments) {
  if (judgments.some(j => j.verdict === 'fail')) return 'fail';
  if (judgments.some(j => j.verdict === 'insufficient_evidence')) return 'review';
  return 'pass';
}

export function validate(kind, value, transcript = []) {
  const errors = [];
  if (kind === 'evaluate') {
    if (!keys(value, ['judgments']) || !Array.isArray(value.judgments)) return { valid: false, errors: ['invalid_evaluation_shape'] };
    if (value.judgments.length !== 3 || new Set(value.judgments.map(j => j?.criterion)).size !== 3) errors.push('incomplete_or_duplicate_criteria');
    for (const j of value.judgments) {
      if (!keys(j, ['criterion', 'verdict', 'evidence', 'reason']) || !ids.includes(j.criterion) || !verdicts.includes(j.verdict) || typeof j.reason !== 'string' || !j.reason.trim()) {
        errors.push('invalid_judgment_shape');
        continue;
      }
      errors.push(...evidenceErrors(j.evidence, transcript));
    }
  } else if (kind === 'coach') {
    if (!keys(value, ['strengths', 'correction', 'improved_response', 'needs_review', 'review_reason']) || !Array.isArray(value.strengths) || typeof value.improved_response !== 'string' || !value.improved_response.trim() || typeof value.needs_review !== 'boolean' || typeof value.review_reason !== 'string') return { valid: false, errors: ['invalid_coaching_shape'] };
    for (const item of [...value.strengths, ...(value.correction === null ? [] : [value.correction])]) {
      if (!keys(item, ['criterion', 'text', 'evidence']) || !ids.includes(item.criterion) || typeof item.text !== 'string' || !item.text.trim()) errors.push('invalid_feedback_shape');
      else errors.push(...evidenceErrors(item.evidence, transcript));
    }
    if (value.needs_review && !value.review_reason.trim()) errors.push('missing_review_reason');
  } else if (typeof value !== 'string' || !value.trim()) errors.push('empty_customer_reply');
  return { valid: errors.length === 0, errors, ...(kind === 'evaluate' && errors.length === 0 ? { overall: overall(value.judgments) } : {}) };
}

export function decodeResponse(envelope, kind, transcript = []) {
  const choice = envelope?.choices?.[0];
  if (!choice) return { valid: false, errors: ['missing_choice'] };
  if (choice.message?.refusal) return { valid: false, errors: ['refusal'] };
  if (choice.finish_reason !== 'stop') return { valid: false, errors: ['finish:' + choice.finish_reason] };
  const content = choice.message?.content;
  if (typeof content !== 'string' || !content.trim()) return { valid: false, errors: ['empty_content'] };
  try {
    const value = kind === 'simulate' ? content : JSON.parse(content);
    return { ...validate(kind, value, transcript), value };
  } catch {
    return { valid: false, errors: ['invalid_json'] };
  }
}
