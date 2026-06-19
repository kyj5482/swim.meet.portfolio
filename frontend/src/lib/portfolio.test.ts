import { describe, it, expect } from 'vitest';
import {
  bestTimesByEvent,
  improvementPct,
  progressionFor,
  ageFromBirth,
} from './portfolio';
import type { RaceResult } from '../types';

const dates: Record<string, string> = {
  m1: '2025-01-10',
  m2: '2025-06-10',
  m3: '2025-12-10',
};
const md = (r: RaceResult) => dates[r.meetId];

function race(id: string, meetId: string, timeMs: number, isPB = false): RaceResult {
  return { id, athleteId: 'a', meetId, stroke: 'FR', distance: 50, course: 'SCY', timeMs, isPB };
}

describe('bestTimesByEvent', () => {
  it('이벤트별 최고기록 + 최초 대비 향상%', () => {
    const races = [race('r1', 'm1', 40000), race('r2', 'm2', 35000), race('r3', 'm3', 33000, true)];
    const [e] = bestTimesByEvent(races, md);
    expect(e.best.timeMs).toBe(33000);
    expect(e.count).toBe(3);
    expect(e.firstMs).toBe(40000);
    expect(e.improvementPct).toBeCloseTo(17.5, 5); // (40-33)/40
  });

  it('서로 다른 이벤트는 분리, 거리순 정렬', () => {
    const a = race('r1', 'm1', 40000);
    const b: RaceResult = { ...race('r2', 'm1', 80000), distance: 100 };
    const out = bestTimesByEvent([b, a], md);
    expect(out.map((e) => e.distance)).toEqual([50, 100]);
  });
});

describe('improvementPct', () => {
  it('빨라지면 양수', () => {
    expect(improvementPct(40000, 36000)).toBeCloseTo(10, 5);
  });
  it('느려지면 음수', () => {
    expect(improvementPct(36000, 40000)).toBeCloseTo(-11.111, 2);
  });
  it('0 이하 입력 방어', () => {
    expect(improvementPct(0, 100)).toBe(0);
  });
});

describe('progressionFor', () => {
  it('시간순 정렬된 포인트', () => {
    const races = [race('r3', 'm3', 33000), race('r1', 'm1', 40000), race('r2', 'm2', 35000)];
    const pts = progressionFor(races, 'FR-50-SCY', md);
    expect(pts.map((p) => p.timeMs)).toEqual([40000, 35000, 33000]);
  });
});

describe('ageFromBirth', () => {
  it('생일 전/후', () => {
    expect(ageFromBirth('2015-07-01', new Date('2026-06-19'))).toBe(10);
    expect(ageFromBirth('2015-06-01', new Date('2026-06-19'))).toBe(11);
  });
});
