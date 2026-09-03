import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  formatDuration,
  readAudioDuration,
  validateAudioFileMetadata,
  validateDuration,
} from '../utils/audioValidation';

interface AudioUploadProps {
  onAnalyze: (file: File) => void;
}

interface SelectedAudio {
  file: File;
  duration: number;
}

export function AudioUpload({ onAnalyze }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionTokenRef = useRef(0);
  const [selectedAudio, setSelectedAudio] = useState<SelectedAudio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReadingMetadata, setIsReadingMetadata] = useState(false);

  const selectFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    const selectionToken = ++selectionTokenRef.current;
    setError(null);
    setSelectedAudio(null);
    setIsReadingMetadata(false);

    const fileError = validateAudioFileMetadata(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setIsReadingMetadata(true);

    try {
      const duration = await readAudioDuration(file);
      if (selectionToken !== selectionTokenRef.current) {
        return;
      }

      const durationError = validateDuration(duration);
      if (durationError) {
        setError(durationError);
        return;
      }

      setSelectedAudio({ file, duration });
    } catch {
      if (selectionToken === selectionTokenRef.current) {
        setError('We could not read this recording. Try another MP3 or WAV file.');
      }
    } finally {
      if (selectionToken === selectionTokenRef.current) {
        setIsReadingMetadata(false);
      }
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void selectFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void selectFile(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="upload-card" aria-labelledby="upload-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">New analysis</p>
          <h2 id="upload-title">Check a voice recording</h2>
        </div>
        <span className="duration-badge">10–30 sec</span>
      </div>

      <div
        className="drop-zone"
        onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="upload-icon" aria-hidden="true">⌁</div>
        <strong>Drop a consented recording here</strong>
        <p>MP3 or WAV · up to 15 MB</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Choose audio
        </button>
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.mp3,.wav"
          onChange={handleInput}
        />
      </div>

      {isReadingMetadata && (
        <p className="inline-status" role="status">Reading audio metadata…</p>
      )}

      {error && (
        <div className="inline-error" role="alert">
          <strong>Audio not ready</strong>
          <span>{error}</span>
        </div>
      )}

      {selectedAudio && (
        <div className="selected-file">
          <div>
            <span className="file-kicker">Ready to analyze</span>
            <strong title={selectedAudio.file.name}>{selectedAudio.file.name}</strong>
          </div>
          <span>{formatDuration(selectedAudio.duration)}</span>
        </div>
      )}

      <button
        className="primary-button"
        type="button"
        disabled={!selectedAudio || isReadingMetadata}
        onClick={() => selectedAudio && onAnalyze(selectedAudio.file)}
      >
        Analyze voice integrity
      </button>

      <p className="privacy-note">
        <span aria-hidden="true">◈</span>
        Prototype audio is processed temporarily for analysis and is not intended for permanent raw-audio retention.
      </p>
    </section>
  );
}
