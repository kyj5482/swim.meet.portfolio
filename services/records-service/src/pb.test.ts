import { determinePB, pbKey } from './pb.js';
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
    isPB: true,
    confidence: 1,
    ...over,
  };
}

describe('pbKey', () => {
  it('separates by course', () => {
    expect(pbKey(result({ course: 'SCY' }))).not.toBe(
      pbKey(result({ course: 'LCM' }))
    );
  });
});

describe('determinePB', () => {
  it('first ever result is a PB', () => {
    expect(determinePB([], result({ timeMs: 30000 }))).toEqual({
      isPB: true,
      demotedIds: [],
    });
  });

  it('faster time becomes PB and demotes the old one', () => {
    const old = result({ id: 'old', timeMs: 30000, isPB: true });
    expect(determinePB([old], result({ timeMs: 29500 }))).toEqual({
      isPB: true,
      demotedIds: ['old'],
    });
  });

  it('slower time is not a PB', () => {
    const old = result({ id: 'old', timeMs: 29000, isPB: true });
    expect(determinePB([old], result({ timeMs: 30000 }))).toEqual({
      isPB: false,
      demotedIds: [],
    });
  });

  it('equal time keeps the earlier record as PB', () => {
    const old = result({ id: 'old', timeMs: 29000, isPB: true });
    expect(determinePB([old], result({ timeMs: 29000 })).isPB).toBe(false);
  });

  it('different course does not affect PB', () => {
    const scy = result({ id: 'scy', course: 'SCY', timeMs: 29000 });
    const decision = determinePB([scy], result({ course: 'LCM', timeMs: 35000 }));
    expect(decision.isPB).toBe(true); // LCM 최초 → PB
  });

  it('different stroke is a separate PB', () => {
    const fr = result({ id: 'fr', stroke: 'FR', timeMs: 29000 });
    expect(determinePB([fr], result({ stroke: 'BK', timeMs: 40000 })).isPB).toBe(
      true
    );
  });
});
