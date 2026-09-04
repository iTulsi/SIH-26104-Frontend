import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useTransform } from 'motion/react';
import { analyzeAudio, hashAnalysisResult, isDemoMode } from './api/analysisClient';
import { AnalysisProgress } from './components/AnalysisProgress';
import { AnalysisResult } from './components/AnalysisResult';
import { AudioUpload } from './components/AudioUpload';
import { SiteHeader } from './components/SiteHeader';
import type { AnalysisResult as AnalysisResultType } from './domain/analysis';

type ViewState = 'ready' | 'analyzing' | 'success' | 'error';

interface CompletedAnalysis {
  result: AnalysisResultType;
  evidenceHash: string;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const workflow = [
  ['01', 'Listen', 'Acoustic forensics looks for synthetic-speech artefacts and manipulation cues.'],
  ['02', 'Match', 'Speaker identity checks how closely the voice aligns with an expected caller profile.'],
  ['03', 'Understand', 'Fraud context adds urgency, impersonation, and sensitive-action signals.'],
  ['04', 'Decide', 'Risk fusion turns every signal into one explainable recommendation.'],
] as const;

const problemPoints = [
  ['01', 'Synthetic speech can imitate tone and cadence.', 'We inspect acoustic patterns that are difficult to judge by ear alone.'],
  ['02', 'Identity needs more than a familiar sound.', 'Speaker similarity adds a second layer of verification when a reference profile is available.'],
  ['03', 'Context changes the risk of the same voice.', 'Urgency, payments, credentials, and impersonation signals influence the final recommendation.'],
] as const;

const projectPrinciples = [
  'VOICE AUTHENTICITY',
  'HUMAN TRUST',
  'SPEAKER IDENTITY',
  'CONTEXT MATTERS',
  'PRIVACY FIRST',
  'EXPLAINABLE RISK',
] as const;

const heroBars = [34, 52, 78, 43, 66, 92, 58, 82, 49, 72, 96, 64, 88, 55, 74, 42, 61, 31, 47];
const voiceSignalBars = [...heroBars, ...heroBars.slice().reverse()];

function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 38, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.78, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('ready');
  const [completedAnalysis, setCompletedAnalysis] = useState<CompletedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const productRef = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();
  const landingY = useTransform(scrollY, [0, 520], [0, -72]);
  const landingScale = useTransform(scrollY, [0, 520], [1, 0.965]);
  const landingOpacity = useTransform(scrollY, [0, 460], [1, 0.42]);
  const { scrollYProgress: productProgress } = useScroll({
    target: productRef,
    offset: ['start end', 'end start'],
  });
  const productProgressSmooth = useSpring(productProgress, { stiffness: 90, damping: 28, mass: 0.45 });
  const voiceCopyY = useTransform(productProgressSmooth, [0.02, 0.24, 0.82], [62, 0, -22]);
  const voiceCopyOpacity = useTransform(productProgressSmooth, [0.02, 0.2, 0.82, 0.96], [0.28, 1, 1, 0.5]);
  const voiceSweepX = useTransform(productProgressSmooth, [0.04, 0.94], ['-22%', '122%']);
  const voiceOrbitRotate = useTransform(productProgressSmooth, [0, 1], [-5, 8]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

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
      if (controller.signal.aborted) return;
      setCompletedAnalysis({ result, evidenceHash });
      setViewState('success');
    } catch (requestError) {
      if (controller.signal.aborted) return;
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
    window.requestAnimationFrame(() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const demoTransition = {
    initial: { opacity: 0, y: 26, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -18, filter: 'blur(8px)' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell" id="top">
        <SiteHeader isDemo={isDemoMode} />

        <main>
          <section className="landing-hero" aria-labelledby="landing-title">
            <motion.div className="landing-ambient landing-ambient--one" animate={{ x: [0, 18, 0], y: [0, -14, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="landing-ambient landing-ambient--two" animate={{ x: [0, -16, 0], y: [0, 12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

            <motion.div className="landing-hero-inner" style={{ y: landingY, scale: landingScale, opacity: landingOpacity }}>
              <motion.span
                className="landing-eyebrow"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Voice Integrity · SIH 26104
              </motion.span>

              <motion.h1 id="landing-title" initial="hidden" animate="visible">
                <span className="landing-line"><motion.span variants={{ hidden: { y: '115%' }, visible: { y: 0, transition: { duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] } } }}>Verify before trust</motion.span></span>
                <span className="landing-line"><motion.span variants={{ hidden: { y: '115%' }, visible: { y: 0, transition: { duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] } } }}>becomes action.</motion.span></span>
              </motion.h1>

              <motion.a
                className="landing-cta"
                href="#demo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.48 }}
                whileHover={{ y: -4, scale: 1.025 }}
                whileTap={{ scale: 0.975 }}
              >
                Open the prototype <span aria-hidden="true">↗</span>
              </motion.a>

              <motion.a
                className="landing-scroll-cue"
                href="#product"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                whileHover={{ y: 3 }}
              >
                <span>Discover the system</span>
                <i aria-hidden="true">↓</i>
              </motion.a>
            </motion.div>
          </section>

          <motion.section className="hero-section hero-section--voice" id="product" ref={productRef}>
            <div className="voice-signal-bed" aria-hidden="true">
              <motion.span className="voice-signal-sweep" style={{ x: voiceSweepX }} />
              <div className="voice-signal-bars">
                {voiceSignalBars.map((height, index) => (
                  <motion.i
                    key={`${height}-${index}`}
                    style={{ height: `${Math.max(14, height * 0.72)}%` }}
                    initial={{ scaleY: 0.15, opacity: 0.08 }}
                    whileInView={{ scaleY: 1, opacity: 0.34 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.72, delay: index * 0.015, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
            </div>

            <motion.div className="hero-copy voice-story-copy" style={{ y: voiceCopyY, opacity: voiceCopyOpacity }}>
              <motion.span
                className="eyebrow"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7 }}
              >
                AI-powered voice fraud defense
              </motion.span>

              <motion.h1 className="voice-story-title" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.46 }}>
                <span className="voice-story-line">
                  <motion.span variants={{ hidden: { y: '118%' }, visible: { y: 0, transition: { duration: 0.86, ease: [0.22, 1, 0.36, 1] } } }}>Trust the voice.</motion.span>
                </span>
                <span className="voice-story-line voice-story-line--serif">
                  <motion.em variants={{ hidden: { y: '118%', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.95, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}>Verify the source.</motion.em>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.72, delay: 0.18 }}
              >
                Detect synthetic speech, identity mismatch, and fraud context before a familiar voice becomes an irreversible action.
              </motion.p>

              <motion.div
                className="voice-belief"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.75, delay: 0.28 }}
              >
                <span>What drives us</span>
                <strong>We are building for the few seconds before trust becomes irreversible.</strong>
              </motion.div>

              <div className="hero-actions">
                <motion.a className="button button--primary" href="#demo" whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>Try the prototype <span aria-hidden="true">↗</span></motion.a>
                <motion.a className="button button--text" href="#approach" whileHover={{ x: 4 }}>See how it works <span aria-hidden="true">↓</span></motion.a>
              </div>
              <div className="hero-proof">
                <span><strong>04</strong><small>signal layers</small></span>
                <span><strong>10–30s</strong><small>voice sample</small></span>
                <span><strong>SHA‑256</strong><small>evidence integrity</small></span>
              </div>
            </motion.div>

            <Reveal className="hero-art" delay={0.12}>
              <div className="hero-art-grid" aria-hidden="true" />
              <motion.div className="voice-orbit" aria-hidden="true" style={{ rotate: voiceOrbitRotate }} animate={{ y: [0, -10, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}>
                <span className="voice-orbit-ring voice-orbit-ring--outer" />
                <span className="voice-orbit-ring voice-orbit-ring--inner" />
                <motion.span className="voice-orbit-core" whileHover={{ scale: 1.06, rotate: 2 }}>
                  <svg viewBox="0 0 24 24" focusable="false"><path d="M4 12h2m2-5v10m4-13v16m4-12v8m4-5v2" /></svg>
                </motion.span>
              </motion.div>
              <div className="hero-wave" aria-hidden="true">
                {heroBars.map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }} />)}
              </div>
              <motion.div className="hero-floating hero-floating--a" whileHover={{ scale: 1.035, y: -5 }}><small>Voice authenticity</small><strong>Acoustic layer</strong></motion.div>
              <motion.div className="hero-floating hero-floating--b" whileHover={{ scale: 1.035, y: -5 }}><small>Identity</small><strong>Speaker match</strong></motion.div>
              <motion.div className="hero-floating hero-floating--c" whileHover={{ scale: 1.035, y: -5 }}><small>Decision</small><strong>Explainable risk</strong></motion.div>
              <div className="hero-art-footer">
                <span><i /> {isDemoMode ? 'Prototype interface' : 'Inference online'}</span>
                <span>Privacy-first processing</span>
              </div>
            </Reveal>
          </motion.section>

          <section className="trust-strip trust-strip--moving" aria-label="Core product principles">
            <motion.div
              className="trust-track"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
              {[...projectPrinciples, ...projectPrinciples].map((item, index) => (
                <span key={`${item}-${index}`}><i aria-hidden="true" />{item}</span>
              ))}
            </motion.div>
          </section>

          <section className="problem-section" id="problem">
            <Reveal className="problem-heading">
              <span className="eyebrow eyebrow--dark">Why it matters</span>
              <h2>A familiar voice is no longer proof of identity.</h2>
            </Reveal>
            <Reveal className="problem-copy" delay={0.08}>
              <p>Voice cloning changes the trust model. A caller can sound convincing while the underlying audio, identity, and conversational intent tell a very different story.</p>
              <div className="problem-points">
                {problemPoints.map(([number, title, description], index) => (
                  <motion.article
                    key={number}
                    initial={{ opacity: 0, x: 32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.42 }}
                    transition={{ duration: 0.68, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 8 }}
                  >
                    <span>{number}</span><strong>{title}</strong><p>{description}</p>
                  </motion.article>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="approach-section" id="approach">
            <Reveal className="section-intro">
              <span className="eyebrow">How it works</span>
              <h2>Four signals. One decision.</h2>
              <p>The system keeps model inference, fraud context, and evidence handling separate, then combines only the outputs needed for the final risk assessment.</p>
            </Reveal>
            <div className="workflow-grid">
              {workflow.map(([number, title, description], index) => (
                <motion.article
                  className="workflow-card"
                  key={number}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.62, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -10, rotateX: 2, rotateY: index % 2 === 0 ? 2 : -2 }}
                >
                  <span className="workflow-number">{number}</span>
                  <div className="workflow-icon" aria-hidden="true"><span /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="demo-section" id="demo">
            <Reveal className="demo-intro">
              <span className="eyebrow eyebrow--dark">Interactive prototype</span>
              <h2>Put a voice sample through the experience.</h2>
              <p>Upload a consented 10–30 second MP3 or WAV recording. {isDemoMode ? 'The current build validates the full interface with a clearly labelled fixed scenario until the AI endpoint is connected.' : 'The connected inference service will return the live model assessment.'}</p>
            </Reveal>

            <Reveal className="demo-frame" delay={0.08}>
              <div className="demo-frame-topbar">
                <span><i className={isDemoMode ? 'is-demo' : ''} />{isDemoMode ? 'Simulation mode' : 'Inference online'}</span>
                <small>VOICE INTEGRITY / ANALYSIS</small>
              </div>

              <div className="demo-motion-stage">
                <AnimatePresence mode="wait" initial={false}>
                  {viewState === 'ready' && <motion.div key="ready" {...demoTransition}><AudioUpload isDemo={isDemoMode} onAnalyze={(file) => void handleAnalyze(file)} /></motion.div>}
                  {viewState === 'analyzing' && <motion.div key="analyzing" {...demoTransition}><AnalysisProgress isDemo={isDemoMode} /></motion.div>}
                  {viewState === 'success' && completedAnalysis && <motion.div key="success" {...demoTransition}><AnalysisResult result={completedAnalysis.result} evidenceHash={completedAnalysis.evidenceHash} isDemo={isDemoMode} onReset={reset} /></motion.div>}
                  {viewState === 'error' && (
                    <motion.div className="error-state" key="error" role="alert" {...demoTransition}>
                      <span className="error-symbol">!</span>
                      <span className="section-kicker section-kicker--danger">Analysis interrupted</span>
                      <h2>That scan didn’t finish.</h2>
                      <p>{error}</p>
                      <button className="scan-button scan-button--compact" type="button" onClick={reset}>Try another recording</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          </section>

          <section className="evidence-section" id="evidence">
            <Reveal className="evidence-visual">
              <motion.div className="evidence-orb" aria-hidden="true" whileInView={{ rotate: [0, 5, -4, 0], scale: [0.94, 1.03, 1] }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
                <svg viewBox="0 0 24 24"><path d="M12 3 5.5 5.7v5.4c0 4.4 2.7 8.3 6.5 9.9 3.8-1.6 6.5-5.5 6.5-9.9V5.7L12 3Z" /><path d="m9.4 12 1.7 1.7 3.6-3.9" /></svg>
              </motion.div>
              <div className="evidence-code"><small>RESULT FINGERPRINT</small><code>8f12c9d4…a7e2</code><span>SHA‑256</span></div>
            </Reveal>
            <Reveal className="evidence-copy-section" delay={0.08}>
              <span className="eyebrow">Evidence without exposing the voice</span>
              <h2>Prove what happened without storing raw audio on-chain.</h2>
              <p>The prototype fingerprints the final analysis JSON with SHA‑256. That gives the audit trail a stable integrity reference while keeping the original recording out of the evidence record.</p>
              <div className="evidence-benefits">
                <span><i>01</i>Transient audio processing</span>
                <span><i>02</i>Result-level fingerprint</span>
                <span><i>03</i>Clear explanation and recommendation</span>
              </div>
            </Reveal>
          </section>

          <section className="closing-section">
            <Reveal>
              <span className="eyebrow">Voice Integrity · SIH 26104</span>
              <h2>Verify before trust becomes action.</h2>
              <motion.a className="button button--light" href="#demo" whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>Open the prototype <span aria-hidden="true">↗</span></motion.a>
            </Reveal>
          </section>
        </main>

        <footer className="site-footer">
          <a className="site-brand site-brand--footer" href="#top">
            <span className="site-brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12h2m2-5v10m4-13v16m4-12v8m4-5v2" /></svg></span>
            <span className="site-brand-copy"><strong>Voice Integrity</strong><small>AICTE · SIH 26104</small></span>
          </a>
          <p>AI-powered real-time detection and prevention of voice cloning impersonation attacks.</p>
          <span>Blockchain &amp; Cybersecurity · Privacy-first prototype</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
