import type { Badge, GameEvent } from '@swimvault/contracts';

/**
 * 뱃지 규칙 (순수 로직, 테스트 핵심).
 *
 * 이벤트 누적 집계로 "달성형 목표"를 제공한다(컬렉션 욕구 → 리텐션).
 * 각 규칙은 (events, longestStreak)에서 충족 여부와 달성시점을 판정한다.
 * 달성시점 = 조건을 처음 만족시킨 이벤트의 at (결정적 → 테스트 가능).
 */

interface BadgeRule {
  code: string;
  label: string;
  /** 조건을 처음 만족시킨 시점의 ISO를 반환, 미달성이면 null. */
  earnedAt(events: GameEvent[], longestStreakDays: number): string | null;
}

/** type별로 n번째 이벤트의 at(달성시점) 반환. */
function nthOfType(events: GameEvent[], type: GameEvent['type'], n: number): string | null {
  const matched = events.filter((e) => e.type === type);
  return matched.length >= n ? matched[n - 1].at : null;
}

/** 서로 다른 meta 키 값이 threshold개에 도달한 시점. */
function distinctReachedAt(
  events: GameEvent[],
  type: GameEvent['type'],
  key: string,
  threshold: number,
): string | null {
  const seen = new Set<string>();
  for (const e of events) {
    if (e.type !== type) continue;
    const v = e.meta?.[key];
    if (v === undefined) continue;
    seen.add(String(v));
    if (seen.size >= threshold) return e.at;
  }
  return null;
}

export const BADGE_RULES: BadgeRule[] = [
  {
    code: 'first_splash',
    label: '첫 물보라',
    earnedAt: (e) => nthOfType(e, 'race_logged', 1),
  },
  {
    code: 'pb_machine',
    label: 'PB 머신',
    earnedAt: (e) => nthOfType(e, 'pb_achieved', 5),
  },
  {
    code: 'all_four_strokes',
    label: '4영법 마스터',
    earnedAt: (e) => distinctReachedAt(e, 'stroke_unlocked', 'stroke', 4),
  },
  {
    code: 'distance_explorer',
    label: '거리 탐험가',
    earnedAt: (e) => distinctReachedAt(e, 'distance_milestone', 'distance', 5),
  },
  {
    code: 'centurion',
    label: '백전노장(100경기)',
    earnedAt: (e) => nthOfType(e, 'race_logged', 100),
  },
  {
    code: 'iron_will',
    label: '강철 의지(7일 연속)',
    earnedAt: (_e, longest) => (longest >= 7 ? new Date().toISOString() : null),
  },
];

/** 현재까지 달성한 뱃지 목록. */
export function evaluateBadges(events: GameEvent[], longestStreakDays: number): Badge[] {
  const out: Badge[] = [];
  for (const rule of BADGE_RULES) {
    const earnedAt = rule.earnedAt(events, longestStreakDays);
    if (earnedAt) out.push({ code: rule.code, label: rule.label, earnedAt });
  }
  return out;
}
