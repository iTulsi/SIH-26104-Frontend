import { useRef, useState, type CSSProperties } from 'react';
import { explainRisk, humanizeSignal, recommendationCopy, type AnalysisResult as AnalysisResultType } from '../domain/analysis';

interface AnalysisResultProps {
  result: AnalysisResultType;
  evidenceHash: string;
  isDemo: boolean;
  onReset: () => void;
}

function percentage(value: number) { return `${Math.round(value * 100)}%`; }
function riskTone(level: AnalysisResultType['riskLevel']) { return level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'safe'; }

export function AnalysisResult({ result, evidenceHash, isDemo, onReset }: AnalysisResultProps) {
  const reasoningDialogRef = useRef<HTMLDialogElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const tone = riskTone(result.riskLevel);
  const gaugeStyle = { '--risk-angle': `${Math.max(0, Math.min(100, result.riskScore)) * 3.6}deg` } as CSSProperties;

  const copyHash = async () => {
    try { await navigator.clipboard.writeText(evidenceHash); setCopyStatus('copied'); }
    catch { setCopyStatus('failed'); }
    window.setTimeout(() => setCopyStatus('idle'), 1700);
  };

  const verdict = isDemo
    ? 'High-risk scenario preview'
    : result.riskLevel === 'HIGH' ? 'Possible voice impersonation'
      : result.riskLevel === 'MEDIUM' ? 'Manual verification advised'
        : 'No strong spoofing signal';

  return (
    <section className="result-experience screen-enter" aria-labelledby="result-title">
      <header className="result-topline">
        <div><span className="section-kicker">{isDemo ? 'Simulation complete' : 'Analysis complete'}</span><h1 id="result-title">Voice verdict</h1></div>
        <button className="glass-button" type="button" onClick={onReset}>New scan</button>
      </header>

      {isDemo && <div className="simulation-strip"><span>SIM</span><p><strong>Not model output.</strong> This fixed scenario was not calculated from your uploaded audio.</p></div>}

      <div className={`verdict-stage verdict-stage--${tone}`}>
        <div className="verdict-glow" aria-hidden="true" />
        <div className="result-gauge" style={gaugeStyle}>
          <div className="result-gauge-inner"><small>{isDemo ? 'Scenario' : 'Risk score'}</small><strong>{Math.round(result.riskScore)}</strong><span>/100</span></div>
        </div>
        <div className="verdict-copy">
          <span className={`verdict-pill verdict-pill--${tone}`}>{isDemo ? 'Preview' : `${result.riskLevel} risk`}</span>
          <h2>{verdict}</h2>
          <p>{isDemo ? 'A preview of how the product presents a suspicious call once live inference is available.' : recommendationCopy(result.recommendation)}</p>
          <button className="reasoning-button" type="button" onClick={() => reasoningDialogRef.current?.showModal()}>View reasoning <span>↗</span></button>
        </div>
      </div>

      <div className="signal-rail">
        <article><span>Deepfake probability</span><strong>{percentage(result.deepfakeProbability)}</strong><div className="signal-track"><i className="signal-fill signal-fill--danger" style={{ width: percentage(result.deepfakeProbability) }} /></div><small>{isDemo ? 'Simulated' : 'Synthetic-speech likelihood'}</small></article>
        <article><span>Speaker similarity</span><strong>{result.speakerSimilarity === null ? 'N/A' : percentage(result.speakerSimilarity)}</strong><div className="signal-track"><i className="signal-fill" style={{ width: result.speakerSimilarity === null ? '0%' : percentage(result.speakerSimilarity) }} /></div><small>{isDemo ? 'Simulated' : 'Identity consistency'}</small></article>
        <article><span>Context flags</span><strong>{String(result.fraudIndicators.length).padStart(2, '0')}</strong><div className="context-pills">{result.fraudIndicators.map(item => <b key={item}>{humanizeSignal(item)}</b>)}</div><small>{isDemo ? 'Fixed scenario' : 'Conversation-level signals'}</small></article>
      </div>

      <div className="result-bottom">
        <div className="action-panel">
          <span className="section-kicker section-kicker--danger">Recommended action</span>
          <h3>{humanizeSignal(result.recommendation)}</h3>
          <p>{isDemo ? 'Example safety response for this simulated high-risk case.' : 'Do not approve payments, credentials, or privileged actions based only on this call.'}</p>
        </div>
        <div className="evidence-panel">
          <span className="section-kicker">Evidence fingerprint</span>
          <code>{evidenceHash}</code>
          <button className="copy-button" type="button" onClick={() => void copyHash()}>{copyStatus === 'copied' ? 'Copied ✓' : copyStatus === 'failed' ? 'Copy failed' : 'Copy SHA‑256'}</button>
        </div>
      </div>

      <dialog className="modal-sheet modal-sheet--wide" ref={reasoningDialogRef} aria-labelledby="reasoning-title">
        <button className="modal-close" type="button" aria-label="Close" onClick={() => reasoningDialogRef.current?.close()}>×</button>
        <span className="section-kicker">Signal rationale</span>
        <h3 id="reasoning-title">{isDemo ? 'Simulated high-risk reasoning' : 'Why this result was produced'}</h3>
        {isDemo && <div className="modal-callout"><strong>Not derived from your audio.</strong><span>The content below only explains the fixed interface scenario.</span></div>}
        <p className="reasoning-copy">{explainRisk(result)}</p>
        <div className="reasoning-metrics"><span><small>Deepfake</small><strong>{percentage(result.deepfakeProbability)}</strong></span><span><small>Speaker match</small><strong>{result.speakerSimilarity === null ? 'N/A' : percentage(result.speakerSimilarity)}</strong></span><span><small>Risk</small><strong>{Math.round(result.riskScore)}/100</strong></span></div>
        <button className="scan-button scan-button--compact" type="button" onClick={() => reasoningDialogRef.current?.close()}>Done</button>
      </dialog>
    </section>
  );
}
