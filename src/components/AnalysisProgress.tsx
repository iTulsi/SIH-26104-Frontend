export function AnalysisProgress() {
  return (
    <section className="analysis-progress" aria-live="polite" aria-busy="true">
      <div className="scanner" aria-hidden="true">
        <span className="scanner-line" />
        <span className="scanner-core">AI</span>
      </div>
      <div>
        <p className="eyebrow">Analysis running</p>
        <h2>Evaluating voice integrity</h2>
        <p>
          Checking synthetic-speech patterns, speaker similarity, and fraud context before generating the final risk score.
        </p>
        <div className="analysis-tags" aria-label="Analysis layers">
          <span>Acoustic</span>
          <span>Speaker</span>
          <span>Context</span>
          <span>Risk</span>
        </div>
      </div>
    </section>
  );
}
