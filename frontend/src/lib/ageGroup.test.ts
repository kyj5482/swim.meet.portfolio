import { describe, it, expect } from 'vitest';
import { ageGroupFor, ageGroupAtDate, ageGroupOrder } from './ageGroup';

describe('ageGroupFor', () => {
  it('브래킷 경계', () => {
    expect(ageGroupFor(8)).toBe('10&U');
    expect(ageGroupFor(10)).toBe('10&U');
    expect(ageGroupFor(11)).toBe('11-12');
    expect(ageGroupFor(12)).toBe('11-12');
    expect(ageGroupFor(13)).toBe('13-14');
    expect(ageGroupFor(15)).toBe('15-16');
    expect(ageGroupFor(18)).toBe('17-18');
    expect(ageGroupFor(20)).toBe('19+');
  });
});

describe('ageGroupAtDate', () => {
  it('경기일 나이로 그룹 계산', () => {
    // 2012-03-10 출생 → 2022-07 경기 시 만 10세 → 10&U
    expect(ageGroupAtDate('2012-03-10', '2022-07-15')).toBe('10&U');
    // 2025-03 경기 시 만 13세 → 13-14
    expect(ageGroupAtDate('2012-03-10', '2025-03-15')).toBe('13-14');
  });
});

describe('ageGroupOrder', () => {
  it('순서 인덱스', () => {
    expect(ageGroupOrder('10&U')).toBe(0);
    expect(ageGroupOrder('13-14')).toBe(2);
  });
});
