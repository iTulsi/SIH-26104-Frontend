import type { CSSProperties } from 'react';
interface AnalysisProgressProps { isDemo: boolean; }

const stages = ['Acoustic fingerprints', 'Speaker identity', 'Fraud context', 'Risk fusion'];

export function AnalysisProgress({ isDemo }: AnalysisProgressProps) {
  return (
    <section className="scan-progress screen-enter" aria-live="polite" aria-busy="true">
      <div className="scan-visual" aria-hidden="true">
        <span className="scan-halo scan-halo--one" />
        <span className="scan-halo scan-halo--two" />
        <span className="scan-sweep" />
        <div className="scan-core"><span>AI</span></div>
      </div>
      <span className="section-kicker">{isDemo ? 'Simulating forensic scan' : 'Forensic scan in progress'}</span>
      <h2>{isDemo ? 'Previewing the analysis experience.' : 'Listening for what humans miss.'}</h2>
      <p>{isDemo ? 'No model inference is running. The interface is rehearsing each stage before showing the fixed scenario result.' : 'Voice, identity, and contextual signals are being fused into one explainable decision.'}</p>
      <div className="scan-stage-row">
        {stages.map((stage, index) => <span key={stage} style={{ '--scan-delay': `${index * 500}ms` } as CSSProperties}><i />{stage}</span>)}
      </div>
    </section>
  );
}
