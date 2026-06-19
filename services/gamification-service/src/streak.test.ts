import { computeStreak } from './streak.js';

describe('computeStreak', () => {
  it('이벤트 없으면 0', () => {
    expect(computeStreak([])).toEqual({ currentStreakDays: 0, longestStreakDays: 0 });
  });

  it('같은 날 여러 이벤트는 1일로 집계', () => {
    const r = computeStreak(
      ['2026-06-19T01:00:00Z', '2026-06-19T20:00:00Z'],
      '2026-06-19T23:00:00Z',
    );
    expect(r.currentStreakDays).toBe(1);
    expect(r.longestStreakDays).toBe(1);
  });

  it('연속 3일 → current=longest=3 (오늘 포함)', () => {
    const r = computeStreak(
      ['2026-06-17T10:00:00Z', '2026-06-18T10:00:00Z', '2026-06-19T10:00:00Z'],
      '2026-06-19T12:00:00Z',
    );
    expect(r).toEqual({ currentStreakDays: 3, longestStreakDays: 3 });
  });

  it('최근 활동이 오늘/어제보다 오래되면 current=0이지만 longest는 보존', () => {
    const r = computeStreak(
      ['2026-06-10T10:00:00Z', '2026-06-11T10:00:00Z', '2026-06-12T10:00:00Z'],
      '2026-06-19T12:00:00Z',
    );
    expect(r.currentStreakDays).toBe(0);
    expect(r.longestStreakDays).toBe(3);
  });

  it('어제까지 이어지면 current 유지', () => {
    const r = computeStreak(
      ['2026-06-17T10:00:00Z', '2026-06-18T10:00:00Z'],
      '2026-06-19T09:00:00Z',
    );
    expect(r.currentStreakDays).toBe(2);
  });

  it('과거의 긴 연속과 최근의 짧은 연속을 구분', () => {
    const r = computeStreak(
      [
        '2026-06-01T10:00:00Z',
        '2026-06-02T10:00:00Z',
        '2026-06-03T10:00:00Z',
        '2026-06-04T10:00:00Z',
        '2026-06-18T10:00:00Z',
        '2026-06-19T10:00:00Z',
      ],
      '2026-06-19T12:00:00Z',
    );
    expect(r.currentStreakDays).toBe(2);
    expect(r.longestStreakDays).toBe(4);
  });
});
