import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAudioFileMetadata, validateDuration } from './audioValidation.ts';

test('accepts an MP3 file with valid metadata', () => {
  assert.equal(
    validateAudioFileMetadata({ name: 'demo.mp3', size: 2_000_000, type: 'audio/mpeg' }),
    null,
  );
});

test('rejects unsupported audio formats', () => {
  assert.match(
    validateAudioFileMetadata({ name: 'demo.aac', size: 1_000_000, type: 'audio/aac' }) ?? '',
    /MP3 or WAV/,
  );
});

test('rejects recordings outside the prototype duration window', () => {
  assert.match(validateDuration(8) ?? '', /10 and 30 seconds/);
  assert.match(validateDuration(45) ?? '', /10 and 30 seconds/);
  assert.equal(validateDuration(20), null);
});
