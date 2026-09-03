import assert from 'node:assert/strict';
import test from 'node:test';
import { explainRisk, parseAnalysisResult, recommendationCopy } from './analysis.ts';

const validResult = {
  riskScore: 94,
  riskLevel: 'HIGH',
  deepfakeProbability: 0.91,
  speakerSimilarity: 0.38,
  fraudIndicators: ['urgent_money_request', 'impersonation'],
  recommendation: 'VERIFY_CALLER',
};

test('parseAnalysisResult accepts the frozen integration contract', () => {
  assert.deepEqual(parseAnalysisResult(validResult), validResult);
});

test('parseAnalysisResult rejects invalid probability values', () => {
  assert.throws(
    () => parseAnalysisResult({ ...validResult, deepfakeProbability: 1.2 }),
    /deepfakeProbability/,
  );
});

test('parseAnalysisResult allows unavailable speaker similarity', () => {
  const parsed = parseAnalysisResult({ ...validResult, speakerSimilarity: null });
  assert.equal(parsed.speakerSimilarity, null);
});

test('recommendationCopy converts VERIFY_CALLER into an actionable warning', () => {
  assert.match(recommendationCopy('VERIFY_CALLER'), /independent channel/i);
});

test('explainRisk uses returned model signals instead of inventing a fixed explanation', () => {
  const explanation = explainRisk(parseAnalysisResult(validResult));
  assert.match(explanation, /synthetic or manipulated speech/i);
  assert.match(explanation, /speaker similarity/i);
  assert.match(explanation, /2 flagged fraud signals/i);
});
