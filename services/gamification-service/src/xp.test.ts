import type { GameEvent } from '@swimvault/contracts';
import { xpForEvent, totalXp, XP_RULES } from './xp.js';

function ev(type: GameEvent['type'], meta?: GameEvent['meta']): GameEvent {
  return { id: 'x', athleteId: 'a', type, at: '2026-06-01T00:00:00.000Z', meta };
}

describe('xpForEvent', () => {
  it('기록 적재 기본 보상', () => {
    expect(xpForEvent(ev('race_logged'))).toBe(XP_RULES.race_logged);
  });
  it('PB는 기본 + 향상% 보너스', () => {
    expect(xpForEvent(ev('pb_achieved', { improvementPct: 3 }))).toBe(
      XP_RULES.pb_base + 3,
    );
  });
  it('PB 향상% 보너스는 상한으로 캡', () => {
    expect(xpForEvent(ev('pb_achieved', { improvementPct: 999 }))).toBe(
      XP_RULES.pb_base + XP_RULES.pb_improvement_cap,
    );
  });
  it('PB 음수/누락 향상%는 보너스 0', () => {
    expect(xpForEvent(ev('pb_achieved', { improvementPct: -5 }))).toBe(XP_RULES.pb_base);
    expect(xpForEvent(ev('pb_achieved'))).toBe(XP_RULES.pb_base);
  });
  it('도전형(거리/영법) 보상', () => {
    expect(xpForEvent(ev('distance_milestone'))).toBe(XP_RULES.distance_milestone);
    expect(xpForEvent(ev('stroke_unlocked'))).toBe(XP_RULES.stroke_unlocked);
  });
});

describe('totalXp', () => {
  it('이벤트 묶음 합산', () => {
    const events = [ev('race_logged'), ev('race_logged'), ev('pb_achieved', { improvementPct: 0 })];
    expect(totalXp(events)).toBe(10 + 10 + 25);
  });
});
