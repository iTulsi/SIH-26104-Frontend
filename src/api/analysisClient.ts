import { parseAnalysisResult, type AnalysisResult } from '../domain/analysis';

const apiBaseUrl = import.meta.env.VITE_ANALYSIS_API_URL?.trim().replace(/\/$/, '');

export const isDemoMode = !apiBaseUrl;

const demoResult: AnalysisResult = {
  riskScore: 94,
  riskLevel: 'HIGH',
  deepfakeProbability: 0.91,
  speakerSimilarity: 0.38,
  fraudIndicators: ['urgent_money_request', 'impersonation'],
  recommendation: 'VERIFY_CALLER',
};

function waitForDemoResult(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, 900);

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Analysis cancelled.', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function analyzeAudio(file: File, signal: AbortSignal): Promise<AnalysisResult> {
  if (!apiBaseUrl) {
    await waitForDemoResult(signal);
    return demoResult;
  }

  const formData = new FormData();
  formData.append('audio', file, file.name);

  const response = await fetch(`${apiBaseUrl}/analyze`, {
    method: 'POST',
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Analysis request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  return parseAnalysisResult(payload);
}

export async function hashAnalysisResult(result: AnalysisResult): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(result));
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
