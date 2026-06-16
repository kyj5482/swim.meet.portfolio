import { ageInYears, matchStandards, meetsStandard } from './match.js';
import type { Standard } from '@swimvault/contracts';

function std(over: Partial<Standard>): Standard {
  return {
    id: 's1',
    system: 'USAS',
    label: 'AAA',
    gender: 'M',
    ageMin: 11,
    ageMax: 12,
    stroke: 'FR',
    distance: 50,
    course: 'SCY',
    timeMs: 30000,
    ...over,
  };
}

const query = {
  gender: 'M' as const,
  age: 11,
  stroke: 'FR' as const,
  distance: 50,
  course: 'SCY' as const,
};

describe('ageInYears', () => {
  it('computes full years', () => {
    expect(ageInYears('2014-06-16', '2026-06-16')).toBe(12);
  });

  it('subtracts a year when birthday not yet reached', () => {
    expect(ageInYears('2014-06-17', '2026-06-16')).toBe(11);
  });

  it('counts the year when birthday already reached', () => {
    expect(ageInYears('2014-06-15', '2026-06-16')).toBe(12);
  });
});

describe('matchStandards', () => {
  it('includes age exactly at ageMin', () => {
    const out = matchStandards([std({ ageMin: 11, ageMax: 12 })], { ...query, age: 11 });
    expect(out).toHaveLength(1);
  });

  it('includes age exactly at ageMax', () => {
    const out = matchStandards([std({ ageMin: 11, ageMax: 12 })], { ...query, age: 12 });
    expect(out).toHaveLength(1);
  });

  it('excludes age just outside the band', () => {
    const below = matchStandards([std({ ageMin: 11, ageMax: 12 })], { ...query, age: 10 });
    const above = matchStandards([std({ ageMin: 11, ageMax: 12 })], { ...query, age: 13 });
    expect(below).toHaveLength(0);
    expect(above).toHaveLength(0);
  });

  it('filters by gender', () => {
    const out = matchStandards([std({ gender: 'F' })], query);
    expect(out).toHaveLength(0);
  });

  it('filters by stroke, distance, and course', () => {
    expect(matchStandards([std({ stroke: 'BK' })], query)).toHaveLength(0);
    expect(matchStandards([std({ distance: 100 })], query)).toHaveLength(0);
    expect(matchStandards([std({ course: 'LCM' })], query)).toHaveLength(0);
  });

  it('sorts matches by timeMs ascending', () => {
    const out = matchStandards(
      [
        std({ id: 'slow', label: 'A', timeMs: 32000 }),
        std({ id: 'fast', label: 'AAA', timeMs: 29000 }),
        std({ id: 'mid', label: 'AA', timeMs: 30500 }),
      ],
      query
    );
    expect(out.map((s) => s.id)).toEqual(['fast', 'mid', 'slow']);
  });
});

describe('meetsStandard', () => {
  it('is true when time is under the cut', () => {
    expect(meetsStandard(std({ timeMs: 30000 }), 29000)).toBe(true);
  });

  it('is true when time equals the cut', () => {
    expect(meetsStandard(std({ timeMs: 30000 }), 30000)).toBe(true);
  });

  it('is false when time is over the cut', () => {
    expect(meetsStandard(std({ timeMs: 30000 }), 30001)).toBe(false);
  });
});
