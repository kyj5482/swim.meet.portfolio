/**
 * 기준(Standard) 대비 실력 티어 계산 — 경쟁 앱(Swimmetry)의 motivational
 * standard 히트맵을 벤치마킹. "이 기록이 어느 단계(B~AAAA)인가"를 색으로 보여준다.
 *
 * USAS 모티베이셔널 등급: B < BB < A < AA < AAA < AAAA (오른쪽이 더 빠름).
 * 각 등급은 "이 시간 이하면 달성"하는 임계 timeMs를 가진다(작을수록 빠름).
 * 기준이 없는 방치된 세그먼트(여름리그 등)에서는 null → 진척/레벨로 대체.
 */

export const USAS_TIERS = ['B', 'BB', 'A', 'AA', 'AAA', 'AAAA'] as const;
export type Tier = (typeof USAS_TIERS)[number];

export interface StandardLine {
  label: Tier;
  timeMs: number; // 이 값 이하면 해당 등급 달성
}

export interface TierResult {
  achieved: Tier | null; // 달성한 가장 높은(빠른) 등급
  achievedIndex: number; // USAS_TIERS 내 인덱스, 미달성 -1
  next: Tier | null; // 다음 목표 등급
  gapMs: number | null; // 다음 등급까지 남은 ms (양수=더 빨라져야 함)
}

/** 기록 timeMs가 도달한 최고 등급과 다음 목표를 계산. */
export function tierForTime(timeMs: number, standards: StandardLine[]): TierResult {
  // 등급 순서대로 정렬(B→AAAA). 임계는 빠를수록 작다.
  const lines = [...standards].sort(
    (a, b) => USAS_TIERS.indexOf(a.label) - USAS_TIERS.indexOf(b.label),
  );

  let achievedIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (timeMs <= lines[i].timeMs) achievedIndex = i;
  }

  const achieved = achievedIndex >= 0 ? lines[achievedIndex].label : null;
  const nextLine = lines[achievedIndex + 1];
  return {
    achieved,
    achievedIndex,
    next: nextLine ? nextLine.label : null,
    gapMs: nextLine ? timeMs - nextLine.timeMs : null,
  };
}

/** 0..1 정규화된 진행도(B 전 0 → AAAA 1). 히트맵 채도 계산용. */
export function tierIntensity(achievedIndex: number): number {
  if (achievedIndex < 0) return 0;
  return (achievedIndex + 1) / USAS_TIERS.length;
}
