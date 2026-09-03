export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  deepfakeProbability: number;
  speakerSimilarity: number | null;
  fraudIndicators: string[];
  recommendation: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isProbability(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH';
}

export function parseAnalysisResult(value: unknown): AnalysisResult {
  if (!value || typeof value !== 'object') {
    throw new Error('Analysis response must be an object.');
  }

  const candidate = value as Record<string, unknown>;

  if (!isFiniteNumber(candidate.riskScore) || candidate.riskScore < 0 || candidate.riskScore > 100) {
    throw new Error('riskScore must be a number between 0 and 100.');
  }

  if (!isRiskLevel(candidate.riskLevel)) {
    throw new Error('riskLevel must be LOW, MEDIUM, or HIGH.');
  }

  if (!isProbability(candidate.deepfakeProbability)) {
    throw new Error('deepfakeProbability must be between 0 and 1.');
  }

  const speakerSimilarity = candidate.speakerSimilarity;
  if (speakerSimilarity !== null && speakerSimilarity !== undefined && !isProbability(speakerSimilarity)) {
    throw new Error('speakerSimilarity must be null or between 0 and 1.');
  }

  if (
    !Array.isArray(candidate.fraudIndicators) ||
    !candidate.fraudIndicators.every((indicator) => typeof indicator === 'string')
  ) {
    throw new Error('fraudIndicators must be an array of strings.');
  }

  if (typeof candidate.recommendation !== 'string' || candidate.recommendation.trim().length === 0) {
    throw new Error('recommendation must be a non-empty string.');
  }

  return {
    riskScore: candidate.riskScore,
    riskLevel: candidate.riskLevel,
    deepfakeProbability: candidate.deepfakeProbability,
    speakerSimilarity: speakerSimilarity ?? null,
    fraudIndicators: candidate.fraudIndicators,
    recommendation: candidate.recommendation,
  };
}

export function humanizeSignal(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function recommendationCopy(recommendation: string): string {
  const normalized = recommendation.trim().toUpperCase();

  if (normalized === 'VERIFY_CALLER') {
    return 'Verify the caller through an independent channel before taking any financial or privileged action.';
  }

  if (normalized === 'BLOCK_OR_ESCALATE') {
    return 'Stop the workflow and escalate the call to the configured security or fraud-response team.';
  }

  return humanizeSignal(recommendation);
}

export function explainRisk(result: AnalysisResult): string {
  const reasons: string[] = [];

  if (result.deepfakeProbability >= 0.7) {
    reasons.push('the voice shows a high probability of synthetic or manipulated speech');
  } else if (result.deepfakeProbability >= 0.4) {
    reasons.push('the voice shows some synthetic-speech indicators');
  }

  if (result.speakerSimilarity !== null && result.speakerSimilarity < 0.5) {
    reasons.push('speaker similarity is lower than the expected match');
  }

  if (result.fraudIndicators.length > 0) {
    reasons.push(`the conversation contains ${result.fraudIndicators.length} flagged fraud signal${result.fraudIndicators.length === 1 ? '' : 's'}`);
  }

  if (reasons.length === 0) {
    return 'No strong synthetic-voice or fraud indicators were returned by the current analysis.';
  }

  return `This call was flagged because ${reasons.join(', and ')}.`;
}
