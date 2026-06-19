import { describe, it, expect } from 'vitest';
import { tierForTime, tierIntensity, type StandardLine } from './standards';

// 50 자유형 SCY 예시 (작을수록 빠름)
const STD: StandardLine[] = [
  { label: 'B', timeMs: 40000 },
  { label: 'BB', timeMs: 37000 },
  { label: 'A', timeMs: 34000 },
  { label: 'AA', timeMs: 32000 },
  { label: 'AAA', timeMs: 30000 },
  { label: 'AAAA', timeMs: 28000 },
];

describe('tierForTime', () => {
  it('A와 AA 사이면 A 달성, 다음은 AA', () => {
    const r = tierForTime(33000, STD);
    expect(r.achieved).toBe('A');
    expect(r.next).toBe('AA');
    expect(r.gapMs).toBe(1000); // 33.00 - 32.00
  });

  it('가장 빠른 등급 초과 달성이면 AAAA, next 없음', () => {
    const r = tierForTime(27000, STD);
    expect(r.achieved).toBe('AAAA');
    expect(r.next).toBeNull();
    expect(r.gapMs).toBeNull();
  });

  it('B 임계보다 느리면 미달성', () => {
    const r = tierForTime(45000, STD);
    expect(r.achieved).toBeNull();
    expect(r.achievedIndex).toBe(-1);
    expect(r.next).toBe('B');
  });

  it('정확히 임계값이면 그 등급 달성(<=)', () => {
    expect(tierForTime(34000, STD).achieved).toBe('A');
  });

  it('정렬이 뒤섞여도 동일 결과', () => {
    const shuffled = [STD[3], STD[0], STD[5], STD[2], STD[1], STD[4]];
    expect(tierForTime(33000, shuffled).achieved).toBe('A');
  });
});

describe('tierIntensity', () => {
  it('미달성 0, 최고 1', () => {
    expect(tierIntensity(-1)).toBe(0);
    expect(tierIntensity(5)).toBeCloseTo(1, 5);
  });
});
