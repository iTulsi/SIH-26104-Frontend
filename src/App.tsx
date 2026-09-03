import { useEffect, useRef, useState } from 'react';
import { analyzeAudio, hashAnalysisResult, isDemoMode } from './api/analysisClient';
import { AnalysisProgress } from './components/AnalysisProgress';
import { AnalysisResult } from './components/AnalysisResult';
import { AudioUpload } from './components/AudioUpload';
import { Sidebar } from './components/Sidebar';
import type { AnalysisResult as AnalysisResultType } from './domain/analysis';

type ViewState = 'ready' | 'analyzing' | 'success' | 'error';

interface CompletedAnalysis {
  result: AnalysisResultType;
  evidenceHash: string;
}

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('ready');
  const [completedAnalysis, setCompletedAnalysis] = useState<CompletedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleAnalyze = async (file: File) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCompletedAnalysis(null);
    setError(null);
    setViewState('analyzing');

    try {
      const result = await analyzeAudio(file, controller.signal);
      const evidenceHash = await hashAnalysisResult(result);

      if (controller.signal.aborted) {
        return;
      }

      setCompletedAnalysis({ result, evidenceHash });
      setViewState('success');
    } catch (requestError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(requestError instanceof Error ? requestError.message : 'Voice analysis failed.');
      setViewState('error');
    }
  };

  const reset = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setCompletedAnalysis(null);
    setError(null);
    setViewState('ready');
  };

  return (
    <div className="app-shell">
      <Sidebar isDemo={isDemoMode} />

      <main id="analysis" className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI-powered voice fraud defense</p>
            <h1>Voice Integrity Console</h1>
          </div>
          <div className="topbar-status">
            <span className="status-dot" aria-hidden="true" />
            <span>{isDemoMode ? 'Demo mode' : 'Live API'}</span>
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <span className="hero-kicker">Real-time architecture · prototype workflow</span>
            <h2>Detect synthetic voice risk before trust becomes a transaction.</h2>
            <p>
              Analyze a short recording, combine voice-authenticity and fraud signals, and return an actionable risk score with evidence integrity.
            </p>
          </div>
          <div className="hero-metrics" aria-label="Prototype capabilities">
            <div><strong>01</strong><span>Audio input</span></div>
            <div><strong>04</strong><span>Risk layers</span></div>
            <div><strong>SHA</strong><span>Evidence hash</span></div>
          </div>
        </section>

        {viewState === 'ready' && (
          <AudioUpload onAnalyze={(file) => void handleAnalyze(file)} />
        )}

        {viewState === 'analyzing' && <AnalysisProgress />}

        {viewState === 'error' && (
          <section className="error-card" role="alert">
            <p className="eyebrow">Analysis failed</p>
            <h2>We could not complete this recording.</h2>
            <p>{error}</p>
            <button className="primary-button" type="button" onClick={reset}>Try another recording</button>
          </section>
        )}

        {viewState === 'success' && completedAnalysis && (
          <AnalysisResult
            result={completedAnalysis.result}
            evidenceHash={completedAnalysis.evidenceHash}
            isDemo={isDemoMode}
            onReset={reset}
          />
        )}

        <footer>
          <span>SIH 26104 · AICTE · Blockchain &amp; Cybersecurity</span>
          <span>Privacy-conscious prototype</span>
        </footer>
      </main>
    </div>
  );
}
