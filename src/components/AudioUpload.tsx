import { useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent } from 'react';
import {
  formatDuration,
  readAudioDuration,
  validateAudioFileMetadata,
  validateDuration,
} from '../utils/audioValidation';

interface AudioUploadProps {
  isDemo: boolean;
  onAnalyze: (file: File) => void;
}

interface SelectedAudio {
  file: File;
  duration: number;
}

const waveformBars = [22, 36, 54, 78, 43, 68, 90, 58, 82, 48, 72, 94, 63, 80, 45, 67, 38, 55, 28, 42, 20];

export function AudioUpload({ isDemo, onAnalyze }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const simulationDialogRef = useRef<HTMLDialogElement>(null);
  const selectionTokenRef = useRef(0);
  const [selectedAudio, setSelectedAudio] = useState<SelectedAudio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReadingMetadata, setIsReadingMetadata] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = async (file: File | undefined) => {
    if (!file) return;
    const token = ++selectionTokenRef.current;
    setError(null);
    setSelectedAudio(null);

    const fileError = validateAudioFileMetadata(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setIsReadingMetadata(true);
    try {
      const duration = await readAudioDuration(file);
      if (token !== selectionTokenRef.current) return;
      const durationError = validateDuration(duration);
      if (durationError) {
        setError(durationError);
        return;
      }
      setSelectedAudio({ file, duration });
    } catch {
      if (token === selectionTokenRef.current) setError('We could not read this recording. Try another MP3 or WAV file.');
    } finally {
      if (token === selectionTokenRef.current) setIsReadingMetadata(false);
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void selectFile(event.dataTransfer.files?.[0]);
  };

  const startAnalysis = () => {
    if (!selectedAudio) return;
    if (isDemo) simulationDialogRef.current?.showModal();
    else onAnalyze(selectedAudio.file);
  };

  const confirmSimulation = () => {
    if (!selectedAudio) return;
    simulationDialogRef.current?.close();
    onAnalyze(selectedAudio.file);
  };

  return (
    <section className="upload-experience screen-enter" aria-labelledby="upload-title">
      <div className="upload-toolbar">
        <div>
          <span className="section-kicker">New scan</span>
          <h2 id="upload-title">Analyze a voice sample</h2>
        </div>
        <div className="constraint-row" aria-label="Upload constraints">
          <span>MP3 / WAV</span><span>≤ 15 MB</span><span>10–30 sec</span>
        </div>
      </div>

      <div
        className={`voice-drop${isDragging ? ' voice-drop--dragging' : ''}${selectedAudio ? ' voice-drop--ready' : ''}`}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="ambient-orb" aria-hidden="true">
          <span className="orb-ring orb-ring--one" />
          <span className="orb-ring orb-ring--two" />
          <span className="orb-core">
            <svg viewBox="0 0 24 24"><path d="M12 4v11m0-11-4 4m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
          </span>
        </div>

        <div className={`hero-wave${selectedAudio ? ' hero-wave--active' : ''}`} aria-hidden="true">
          {waveformBars.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, '--bar-delay': `${index * 28}ms` } as CSSProperties} />
          ))}
        </div>

        <div className="drop-copy">
          <strong>{isDragging ? 'Release to add recording' : selectedAudio ? 'Recording ready' : 'Drop a recording here'}</strong>
          <p>{selectedAudio ? 'Your file passed local format and duration checks.' : 'or choose a consented sample from this device'}</p>
        </div>

        <button className="glass-button" type="button" onClick={() => inputRef.current?.click()}>
          {selectedAudio ? 'Choose another' : 'Choose audio'}
        </button>
        <input ref={inputRef} className="visually-hidden" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.mp3,.wav" onChange={handleInput} />
      </div>

      <div className="upload-status" aria-live="polite">
        {isReadingMetadata && <span className="soft-status"><i />Reading audio metadata…</span>}
        {error && <span className="soft-status soft-status--error"><b>Audio not ready.</b> {error}</span>}
        {selectedAudio && (
          <div className="file-pill">
            <span className="file-pill-icon"><svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12M9 10l10-2M6.5 20A2.5 2.5 0 1 0 6.5 15a2.5 2.5 0 0 0 0 5Zm10 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /></svg></span>
            <span className="file-pill-copy"><small>Ready to scan</small><strong title={selectedAudio.file.name}>{selectedAudio.file.name}</strong></span>
            <span className="file-pill-duration">{formatDuration(selectedAudio.duration)}</span>
          </div>
        )}
      </div>

      <div className="upload-footer">
        <span className="privacy-copy"><svg viewBox="0 0 24 24"><path d="M12 3 5.5 5.7v5.4c0 4.4 2.7 8.3 6.5 9.9 3.8-1.6 6.5-5.5 6.5-9.9V5.7L12 3Z" /></svg>Transient processing. Raw audio is not retained.</span>
        <button className="scan-button" type="button" disabled={!selectedAudio || isReadingMetadata} onClick={startAnalysis}>
          <span>{isDemo ? 'Preview scan' : 'Analyze voice'}</span>
          <svg viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </button>
      </div>

      {isDemo && <span className="simulation-badge">Simulation · no AI inference</span>}

      <dialog className="modal-sheet" ref={simulationDialogRef} aria-labelledby="simulation-title">
        <button className="modal-close" type="button" aria-label="Close" onClick={() => simulationDialogRef.current?.close()}>×</button>
        <span className="modal-symbol">SIM</span>
        <span className="section-kicker section-kicker--warning">Simulation mode</span>
        <h3 id="simulation-title">Your recording will not be classified yet.</h3>
        <p>The AI endpoint is still pending. This run displays a fixed high-risk scenario so the team can test the complete interface and integration contract.</p>
        <div className="modal-callout"><strong>The displayed score is not derived from your file.</strong><span>Once inference is connected, this same UI will render the real model output.</span></div>
        <div className="modal-actions">
          <button className="glass-button" type="button" onClick={() => simulationDialogRef.current?.close()}>Cancel</button>
          <button className="scan-button scan-button--compact" type="button" onClick={confirmSimulation}>Run interface preview</button>
        </div>
      </dialog>
    </section>
  );
}
