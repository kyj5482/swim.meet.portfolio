import { describe, it, expect } from 'vitest';
import { findAthlete, matchExtractedToAthletes } from './match';
import type { ExtractedRow, RosterAthlete } from '../types';

const roster: RosterAthlete[] = [
  { id: 'a1', firstName: '지우', lastName: 'Kim', birthDate: '2012-03-10', gender: 'F' },
  { id: 'a2', firstName: '민준', lastName: 'Kim', birthDate: '2015-08-20', gender: 'M' },
];

function row(name: string): ExtractedRow {
  return { swimmerName: name, stroke: 'FR', distance: 50, course: 'SCY', timeMs: 33000, fieldConfidence: {} };
}

describe('findAthlete', () => {
  it('성+이름, 이름+성, 쉼표/공백 변형 매칭', () => {
    expect(findAthlete('Kim Jiwoo', roster)).toBeNull(); // 영문 이름은 별개(한글 이름 등록) — 부분포함 방지 확인
    expect(findAthlete('지우 Kim', roster)?.id).toBe('a1');
    expect(findAthlete('Kim, 지우', roster)?.id).toBe('a1');
    expect(findAthlete('지우', roster)?.id).toBe('a1');
    expect(findAthlete('민준', roster)?.id).toBe('a2');
  });

  it('등록 외 선수는 null', () => {
    expect(findAthlete('John Smith', roster)).toBeNull();
    expect(findAthlete('', roster)).toBeNull();
  });
});

describe('matchExtractedToAthletes', () => {
  it('등록된 아이만 matched, 나머지는 unmatched', () => {
    const rows = [row('지우 Kim'), row('John Smith'), row('민준'), row('Jane Doe')];
    const res = matchExtractedToAthletes(rows, roster);
    expect(res.matched.map((m) => m.athlete.id)).toEqual(['a1', 'a2']);
    expect(res.unmatched.map((r) => r.swimmerName)).toEqual(['John Smith', 'Jane Doe']);
  });
});
