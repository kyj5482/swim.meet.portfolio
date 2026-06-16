import {
  improvementPercent,
  buildProgressSeries,
  splitAnalysis,
} from './improvement.js';
import type { RaceResult } from '@swimvault/contracts';

function result(over: Partial<RaceResult>): RaceResult {
  return {
    id: 'r1',
    athleteId: 'a1',
    meetId: 'm1',
    stroke: 'FR',
    distance: 50,
    course: 'SCY',
    timeMs: 30000,
    isPB: false,
    confidence: 1,
    ...over,
  };
}

describe('improvementPercent', () => {
  it('faster current time yields positive %', () => {
    expect(improvementPercent(30000, 29000)).toBeCloseTo(3.33, 2);
  });

  it('slower current time yields negative %', () => {
    expect(improvementPercent(30000, 31000)).toBeCloseTo(-3.33, 2);
  });

  it('equal time yields 0', () => {
    expect(improvementPercent(30000, 30000)).toBe(0);
  });

  it('rounds to 2 decimals', () => {
    expect(improvementPercent(30000, 29000)).toBe(3.33);
  });

  it('throws RangeError when previousMs is 0', () => {
    expect(() => improvementPercent(0, 29000)).toThrow(RangeError);
  });

  it('throws RangeError when previousMs is negative', () => {
    expect(() => improvementPercent(-5, 29000)).toThrow(RangeError);
  });
});

describe('buildProgressSeries', () => {
  it('returns empty array for empty input', () => {
    expect(buildProgressSeries([])).toEqual([]);
  });

  it('computes improvement vs first record', () => {
    const series = buildProgressSeries([
      result({ timeMs: 30000 }),
      result({ timeMs: 29000 }),
      result({ timeMs: 30000 }),
    ]);
    expect(series).toEqual([
      { timeMs: 30000, improvementPctFromFirst: 0 },
      { timeMs: 29000, improvementPctFromFirst: 3.33 },
      { timeMs: 30000, improvementPctFromFirst: 0 },
    ]);
  });
});

describe('splitAnalysis', () => {
  it('finds fastest and slowest segment indices', () => {
    const a = splitAnalysis({ intervalMs: [15000, 14000, 16000, 14500] });
    expect(a.fastestSegmentIndex).toBe(1);
    expect(a.slowestSegmentIndex).toBe(2);
    expect(a.averageIntervalMs).toBeCloseTo(14875, 0);
  });

  it('detects negative split (second half faster)', () => {
    const a = splitAnalysis({ intervalMs: [16000, 16000, 14000, 14000] });
    expect(a.secondHalfFasterThanFirst).toBe(true);
  });

  it('detects positive split (second half slower)', () => {
    const a = splitAnalysis({ intervalMs: [14000, 14000, 16000, 16000] });
    expect(a.secondHalfFasterThanFirst).toBe(false);
  });

  it('handles empty splits safely', () => {
    expect(splitAnalysis({ intervalMs: [] })).toEqual({
      fastestSegmentIndex: null,
      slowestSegmentIndex: null,
      averageIntervalMs: 0,
      secondHalfFasterThanFirst: false,
    });
  });
});
