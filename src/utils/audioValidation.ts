const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024;
const MIN_DURATION_SECONDS = 10;
const MAX_DURATION_SECONDS = 30;

const SUPPORTED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
]);

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav'];

export interface AudioFileMetadata {
  name: string;
  size: number;
  type: string;
}

export function validateAudioFileMetadata(file: AudioFileMetadata): string | null {
  const normalizedName = file.name.toLowerCase();
  const hasSupportedExtension = SUPPORTED_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension),
  );
  const hasSupportedMimeType = file.type.length > 0 && SUPPORTED_MIME_TYPES.has(file.type);

  if (!hasSupportedExtension && !hasSupportedMimeType) {
    return 'Upload an MP3 or WAV recording.';
  }

  if (file.size <= 0) {
    return 'The selected audio file is empty.';
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return 'Audio must be 15 MB or smaller.';
  }

  return null;
}

export function validateDuration(durationSeconds: number): string | null {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return 'Could not read the audio duration.';
  }

  if (durationSeconds < MIN_DURATION_SECONDS || durationSeconds > MAX_DURATION_SECONDS) {
    return 'Use a recording between 10 and 30 seconds for this prototype.';
  }

  return null;
}

export function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();

    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      URL.revokeObjectURL(objectUrl);
      audio.removeAttribute('src');
      audio.load();
    };

    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();
      resolve(duration);
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Unable to read audio metadata.'));
    };
    audio.src = objectUrl;
  });
}

export function formatDuration(durationSeconds: number): string {
  const totalSeconds = Math.round(durationSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
