import { useState } from 'react';
import {
  explainRisk,
  humanizeSignal,
  recommendationCopy,
  type AnalysisResult as AnalysisResultType,
} from '../domain/analysis';

interface AnalysisResultProps {
  result: AnalysisResultType;
  evidenceHash: string;
  isDemo: boolean;
  onReset: () => void;
}

function percentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function AnalysisResult({ result, evidenceHash, isDemo, onReset }: AnalysisResultProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(evidenceHash);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1500);
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <section className="results" aria-labelledby="result-title">
      <div className="result-header">
        <div>
          <p className="eyebrow">Voice integrity result</p>
          <h2 id="result-title">Risk assessment complete</h2>
        </div>
        <div className="result-actions">
          {isDemo && <span className="mode-chip">Demo data</span>}
          <button className="ghost-button" type="button" onClick={onReset}>New analysis</button>
        </div>
      </div>

      {isDemo && (
        <div className="demo-banner" role="note">
          This screen is using the frozen mock response until the team backend is connected. No model claim is being made from this value.
        </div>
      )}

      <div className="result-grid">
        <article className={`risk-card risk-card--${result.riskLevel.toLowerCase()}`}>
          <span>Overall risk</span>
          <strong>{Math.round(result.riskScore)}</strong>
          <div>
            <b>{result.riskLevel} RISK</b>
            <small>out of 100</small>
          </div>
        </article>

        <article className="signal-card">
          <span className="signal-label">Deepfake probability</span>
          <strong>{percentage(result.deepfakeProbability)}</strong>
          <div className="meter" aria-label={`Deepfake probability ${percentage(result.deepfakeProbability)}`}>
            <span style={{ width: percentage(result.deepfakeProbability) }} />
          </div>
          <small>Synthetic or manipulated speech likelihood</small>
        </article>

        <article className="signal-card">
          <span className="signal-label">Speaker similarity</span>
          <strong>{result.speakerSimilarity === null ? 'N/A' : percentage(result.speakerSimilarity)}</strong>
          {result.speakerSimilarity !== null ? (
            <div className="meter" aria-label={`Speaker similarity ${percentage(result.speakerSimilarity)}`}>
              <span style={{ width: percentage(result.speakerSimilarity) }} />
            </div>
          ) : (
            <div className="meter meter--empty" aria-label="Speaker similarity unavailable" />
          )}
          <small>Cross-session or enrolled-speaker match, when available</small>
        </article>
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <p className="eyebrow">Why was this flagged?</p>
          <h3>Explainable assessment</h3>
          <p className="detail-copy">{explainRisk(result)}</p>
          <div className="indicator-list" aria-label="Detected fraud indicators">
            {result.fraudIndicators.length === 0 ? (
              <span className="indicator indicator--quiet">No contextual fraud indicator returned</span>
            ) : (
              result.fraudIndicators.map((indicator) => (
                <span className="indicator" key={indicator}>{humanizeSignal(indicator)}</span>
              ))
            )}
          </div>
        </article>

        <article className="detail-card recommendation-card">
          <p className="eyebrow">Recommended action</p>
          <h3>{humanizeSignal(result.recommendation)}</h3>
          <p className="detail-copy">{recommendationCopy(result.recommendation)}</p>
          <div className="warning-strip">
            Do not approve payments, credentials, or privileged actions based only on this call.
          </div>
        </article>
      </div>

      <article className="evidence-card">
        <div>
          <p className="eyebrow">Evidence integrity</p>
          <h3>SHA-256 analysis fingerprint</h3>
          <p>
            The fingerprint is generated from the final result JSON. Raw audio is not placed on-chain by this frontend.
          </p>
        </div>
        <div className="hash-panel">
          <code>{evidenceHash}</code>
          <button className="secondary-button" type="button" onClick={() => void copyHash()}>
            {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy hash'}
          </button>
        </div>
      </article>
    </section>
  );
}
