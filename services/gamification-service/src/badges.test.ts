import type { GameEvent } from '@swimvault/contracts';
import { evaluateBadges } from './badges.js';

let seq = 0;
function ev(type: GameEvent['type'], meta?: GameEvent['meta']): GameEvent {
  seq += 1;
  return {
    id: `e${seq}`,
    athleteId: 'a',
    type,
    at: `2026-06-${String((seq % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
    meta,
  };
}

describe('evaluateBadges', () => {
  it('첫 기록이면 first_splash', () => {
    const badges = evaluateBadges([ev('race_logged')], 0);
    expect(badges.map((b) => b.code)).toContain('first_splash');
  });

  it('PB 5회면 pb_machine', () => {
    const events = Array.from({ length: 5 }, () => ev('pb_achieved'));
    expect(evaluateBadges(events, 0).map((b) => b.code)).toContain('pb_machine');
  });

  it('PB 4회는 아직 pb_machine 아님', () => {
    const events = Array.from({ length: 4 }, () => ev('pb_achieved'));
    expect(evaluateBadges(events, 0).map((b) => b.code)).not.toContain('pb_machine');
  });

  it('서로 다른 4영법 unlock이면 all_four_strokes', () => {
    const events = (['FR', 'BK', 'BR', 'FL'] as const).map((s) =>
      ev('stroke_unlocked', { stroke: s }),
    );
    expect(evaluateBadges(events, 0).map((b) => b.code)).toContain('all_four_strokes');
  });

  it('같은 영법 4회는 all_four_strokes 아님(중복 제거)', () => {
    const events = Array.from({ length: 4 }, () => ev('stroke_unlocked', { stroke: 'FR' }));
    expect(evaluateBadges(events, 0).map((b) => b.code)).not.toContain('all_four_strokes');
  });

  it('서로 다른 5거리면 distance_explorer', () => {
    const events = [25, 50, 100, 200, 400].map((d) =>
      ev('distance_milestone', { distance: d }),
    );
    expect(evaluateBadges(events, 0).map((b) => b.code)).toContain('distance_explorer');
  });

  it('최장 스트릭 7 이상이면 iron_will', () => {
    expect(evaluateBadges([], 7).map((b) => b.code)).toContain('iron_will');
    expect(evaluateBadges([], 6).map((b) => b.code)).not.toContain('iron_will');
  });
});
