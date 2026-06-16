import { detectSourceType, defaultConfidenceFor } from './sourceType.js';
import { DEFAULT_CONFIDENCE } from '@swimvault/contracts';

describe('detectSourceType', () => {
  it.each(['meet.hy3', 'meet.cl2', 'meet.sd3', 'RESULTS.HY3'])(
    'maps result files: %s → result_file',
    (f) => {
      expect(detectSourceType(f)).toBe('result_file');
    },
  );

  it('maps .pdf → pdf', () => {
    expect(detectSourceType('heat-sheet.pdf')).toBe('pdf');
  });

  it.each(['scoreboard.jpg', 'photo.jpeg', 'board.png', 'iphone.heic'])(
    'maps images: %s → photo',
    (f) => {
      expect(detectSourceType(f)).toBe('photo');
    },
  );

  it('throws on unknown extension', () => {
    expect(() => detectSourceType('notes.txt')).toThrow();
    expect(() => detectSourceType('noext')).toThrow();
  });
});

describe('defaultConfidenceFor', () => {
  it('maps to contracts DEFAULT_CONFIDENCE', () => {
    expect(defaultConfidenceFor('result_file')).toBe(DEFAULT_CONFIDENCE.result_file);
    expect(defaultConfidenceFor('pdf')).toBe(DEFAULT_CONFIDENCE.pdf);
    expect(defaultConfidenceFor('photo')).toBe(DEFAULT_CONFIDENCE.photo);
  });
});
