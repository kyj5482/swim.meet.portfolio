import { parseTimeToMs, formatMsToTime, timeDeltaMs } from './time.js';

describe('parseTimeToMs', () => {
  it.each([
    ['28.91', 28910],
    ['1:02.34', 62340],
    ['0:28.91', 28910],
    ['1:02:03.45', 3723450],
    ['28.9', 28900], // 한 자리 백분초
    ['28', 28000], // 백분초 생략
    ['1:00.00', 60000],
  ])('parses %s -> %d ms', (input, expected) => {
    expect(parseTimeToMs(input)).toBe(expected);
  });

  it('accepts comma as decimal separator', () => {
    expect(parseTimeToMs('28,91')).toBe(28910);
  });

  it.each(['abc', '', '1:2:3:4.5', '99:99', '1:60.00'])(
    'rejects invalid input %s',
    (bad) => {
      expect(parseTimeToMs(bad)).toBeNull();
    }
  );
});

describe('formatMsToTime', () => {
  it.each([
    [28910, '28.91'],
    [62340, '1:02.34'],
    [60000, '1:00.00'],
    [3723450, '1:02:03.45'],
    [990, '0.99'],
  ])('formats %d ms -> %s', (ms, expected) => {
    expect(formatMsToTime(ms)).toBe(expected);
  });

  it('rounds to centiseconds', () => {
    expect(formatMsToTime(28914)).toBe('28.91');
    expect(formatMsToTime(28916)).toBe('28.92');
  });

  it('rejects negative', () => {
    expect(() => formatMsToTime(-1)).toThrow(RangeError);
  });
});

describe('round-trip', () => {
  it.each(['28.91', '1:02.34', '1:00.00'])('parse∘format is stable for %s', (t) => {
    const ms = parseTimeToMs(t)!;
    expect(formatMsToTime(ms)).toBe(t);
  });
});

describe('timeDeltaMs', () => {
  it('negative when faster (improvement)', () => {
    expect(timeDeltaMs(30000, 29500)).toBe(-500);
  });
});
