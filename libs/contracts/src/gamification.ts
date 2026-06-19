/**
 * 게임화(gamification) 공유 계약 — 서비스 간 단일 진실 공급원.
 *
 * 설계 의도(차별점): 경쟁 선수만이 아니라 "배우는 단계"의 아이도
 * "내 수준이 몇 단계인지" 알 수 있게 한다. 레벨 곡선은 프론트엔드가
 * 진행바를 그릴 때도, gamification-service가 레벨을 계산할 때도 쓰므로
 * 여기(계약)에 둔다. 0.01초 도메인이므로 순수 계산은 단위 테스트로 보호.
 *
 * 책임 경계(R1): 실력 티어(USAS A/AA 등) 매핑은 standards-service 소관.
 * 이 파일은 "행동 → XP → 레벨/뱃지/스트릭" 게임 루프만 다룬다.
 */

/** 게임 이벤트 종류 — 다른 서비스가 발생시키고 gamification이 집계한다. */
export type GameEventType =
  | 'race_logged' // 확정 기록 1건 적재(records-service)
  | 'pb_achieved' // 개인 최고 기록 갱신
  | 'distance_milestone' // 특정 영법에서 새 거리 최초 완영
  | 'stroke_unlocked' // 새 영법 최초 기록
  | 'streak_day'; // 활동일(중복 무해, 날짜로 집계)

export interface GameEvent {
  id: string;
  athleteId: string;
  type: GameEventType;
  at: string; // ISO 8601
  /** 예: { improvementPct: 3.2, distance: 50, stroke: "FR" } */
  meta?: Record<string, number | string>;
}

export interface Badge {
  code: string;
  label: string;
  earnedAt: string; // ISO
}

/** 선수 1명의 게임화 상태 — 프론트가 그대로 렌더. */
export interface GamificationProfile {
  athleteId: string;
  xp: number;
  level: number;
  xpIntoLevel: number; // 현재 레벨 진입 후 누적 XP
  xpForNextLevel: number; // 다음 레벨까지 필요한 총 XP(현재 레벨 구간 폭)
  currentStreakDays: number;
  longestStreakDays: number;
  badges: Badge[];
  updatedAt: string;
}

export interface LeaderboardEntry {
  athleteId: string;
  level: number;
  xp: number;
  rank: number;
}

/**
 * 레벨 n에 "도달"하기 위한 누적 XP 임계값. (n>=1, 레벨1 = 0 XP)
 * 곡선: 50·(n-1)·n → L1:0, L2:100, L3:300, L4:600, L5:1000 …
 * 초반은 완만(유입), 후반은 가팔라짐(장기 리텐션).
 */
export function xpForLevel(level: number): number {
  if (level < 1) throw new RangeError('level must be >= 1');
  return 50 * (level - 1) * level;
}

/** 누적 XP → 레벨/구간 진행도. 음수 XP는 0으로 클램프. */
export function levelForXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  // 50·(n-1)·n <= xp  ⇒  n <= (1 + sqrt(1 + xp/12.5)) / 2
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + safeXp / 12.5)) / 2));
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    xpIntoLevel: safeXp - base,
    xpForNextLevel: next - base,
  };
}
