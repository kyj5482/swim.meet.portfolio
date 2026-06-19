import { describe, it, expect } from 'vitest';
import { ageGroupBreakdown, improvementRate, rateLabel } from './ageAnalysis';
import type { RaceResult } from '../types';

const dates: Record<string, string> = {
  m10u: '2022-07-15', // 만 10세 → 10&U
  m12a: '2023-03-12', // 만 11세 → 11-12
  m12b: '2024-06-28', // 만 12세 → 11-12
  m14: '2025-11-22', // 만 13세 → 13-14
};
const md = (r: RaceResult) => dates[r.meetId];
const birth = '2012-03-10';

function race(id: string, meetId: string, timeMs: number, isPB = false): RaceResult {
  return { id, athleteId: 'a', meetId, stroke: 'FR', distance: 50, course: 'SCY', timeMs, isPB };
}

describe('ageGroupBreakdown', () => {
  it('나이 그룹별로 묶어 그룹별 최고기록을 보존', () => {
    const races = [
      race('r1', 'm10u', 40100),
      race('r2', 'm12a', 37800),
      race('r3', 'm12b', 34900),
      race('r4', 'm14', 32800, true),
    ];
    const out = ageGroupBreakdown(races, 'FR-50-SCY', birth, md);
    expect(out.map((g) => g.ageGroup)).toEqual(['10&U', '11-12', '13-14']);
    // 11-12 그룹은 2건, 최고 34.90
    const g1112 = out.find((g) => g.ageGroup === '11-12')!;
    expect(g1112.count).toBe(2);
    expect(g1112.best.timeMs).toBe(34900);
    expect(g1112.improvementPct).toBeCloseTo(7.67, 1); // (37800-34900)/37800
  });

  it('다른 종목은 제외', () => {
    const races = [race('r1', 'm10u', 40100), { ...race('r2', 'm12a', 80000), distance: 100 }];
    const out = ageGroupBreakdown(races, 'FR-50-SCY', birth, md);
    expect(out).toHaveLength(1);
  });
});

describe('improvementRate', () => {
  it('월 단위 향상 속도', () => {
    const pts = [
      { date: '2022-01-01', timeMs: 40000 },
      { date: '2023-01-01', timeMs: 36000 }, // 1년간 10% 향상
    ];
    const r = improvementRate(pts);
    expect(r.totalPct).toBeCloseTo(10, 5);
    expect(r.months).toBeCloseTo(12, 0);
    expect(r.pctPerMonth).toBeCloseTo(0.83, 1);
  });

  it('포인트 1개면 0', () => {
    expect(improvementRate([{ date: '2022-01-01', timeMs: 40000 }]).pctPerMonth).toBe(0);
  });
});

describe('rateLabel', () => {
  it('속도 구간별 라벨', () => {
    expect(rateLabel(1.5)).toContain('매우 빠름');
    expect(rateLabel(0.5)).toContain('꾸준');
    expect(rateLabel(0.1)).toContain('완만');
    expect(rateLabel(0)).toContain('정체');
  });
});
