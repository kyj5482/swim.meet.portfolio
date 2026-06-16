import { describe, it, expect } from 'vitest';
import { parseTimeToMs, formatMsToTime } from './time';

describe('parseTimeToMs', () => {
  it('parses ss.SS under a minute', () => {
    expect(parseTimeToMs('28.91')).toBe(28910);
  });

  it('parses mm:ss.SS over a minute', () => {
    expect(parseTimeToMs('1:02.34')).toBe(62340);
  });

  it('parses hh:mm:ss.SS', () => {
    expect(parseTimeToMs('1:02:03.45')).toBe(3723450);
  });

  it('returns null on invalid input', () => {
    expect(parseTimeToMs('abc')).toBeNull();
    expect(parseTimeToMs('1:99.00')).toBeNull();
  });
});

describe('formatMsToTime', () => {
  it('formats sub-minute', () => {
    expect(formatMsToTime(28910)).toBe('28.91');
  });

  it('formats over a minute', () => {
    expect(formatMsToTime(62340)).toBe('1:02.34');
  });

  it('throws on negative', () => {
    expect(() => formatMsToTime(-1)).toThrow(RangeError);
  });
});

describe('round-trip', () => {
  it('parse → format → parse is stable', () => {
    for (const s of ['28.91', '1:02.34', '0.05', '59.99']) {
      const ms = parseTimeToMs(s)!;
      expect(parseTimeToMs(formatMsToTime(ms))).toBe(ms);
    }
  });
});
