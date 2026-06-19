import type { GameEvent } from '@swimvault/contracts';

/**
 * 행동 → XP 규칙 (순수 로직, 테스트 핵심).
 *
 * 리텐션 설계: "기록을 올리는 것"보다 "향상/도전"에 더 큰 보상을 준다.
 * - 단순 기록 적재: 기본 보상
 * - PB 갱신: 향상%에 비례한 보너스(상한)로 "더 빨라지는 재미"를 강화
 * - 새 거리/영법 개척: 큰 일회성 보상으로 "도전"을 유도
 */
export const XP_RULES = {
  race_logged: 10,
  pb_base: 25,
  pb_improvement_cap: 25, // 향상% 보너스 상한
  distance_milestone: 50,
  stroke_unlocked: 40,
  streak_day: 5,
} as const;

export function xpForEvent(event: GameEvent): number {
  switch (event.type) {
    case 'race_logged':
      return XP_RULES.race_logged;
    case 'pb_achieved': {
      const pct = Number(event.meta?.improvementPct ?? 0);
      const bonus = Number.isFinite(pct)
        ? Math.min(XP_RULES.pb_improvement_cap, Math.max(0, Math.round(pct)))
        : 0;
      return XP_RULES.pb_base + bonus;
    }
    case 'distance_milestone':
      return XP_RULES.distance_milestone;
    case 'stroke_unlocked':
      return XP_RULES.stroke_unlocked;
    case 'streak_day':
      return XP_RULES.streak_day;
    default:
      return 0;
  }
}

/** 이벤트 묶음의 총 XP. */
export function totalXp(events: GameEvent[]): number {
  return events.reduce((sum, e) => sum + xpForEvent(e), 0);
}
