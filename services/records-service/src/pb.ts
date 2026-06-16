import type { RaceResult } from '@swimvault/contracts';

/**
 * PB(Personal Best) 판정 — 순수 로직(테스트 대상).
 *
 * PB는 같은 (선수·종목·거리·코스) 조합에서 가장 빠른(timeMs 최소) 기록.
 * 코스(SCY/SCM/LCM)가 다르면 별개의 PB로 취급한다.
 */

/** PB 비교 키 — 코스/종목/거리별로 분리 */
export function pbKey(
  r: Pick<RaceResult, 'athleteId' | 'stroke' | 'distance' | 'course'>
): string {
  return `${r.athleteId}|${r.stroke}|${r.distance}|${r.course}`;
}

export interface PBDecision {
  /** 후보 기록이 새 PB인가 */
  isPB: boolean;
  /** PB 지위를 잃는 기존 기록 id (있다면) */
  demotedIds: string[];
}

/**
 * 후보 기록이 기존 기록들 대비 PB인지 판정.
 * 동률(같은 timeMs)은 기존 기록을 PB로 유지(후보는 PB 아님) — 최초 달성 우선.
 */
export function determinePB(
  existing: RaceResult[],
  candidate: Pick<
    RaceResult,
    'athleteId' | 'stroke' | 'distance' | 'course' | 'timeMs'
  >
): PBDecision {
  const key = pbKey(candidate);
  const sameEvent = existing.filter((r) => pbKey(r) === key);

  if (sameEvent.length === 0) {
    return { isPB: true, demotedIds: [] };
  }

  const fastest = Math.min(...sameEvent.map((r) => r.timeMs));
  if (candidate.timeMs < fastest) {
    // 새 PB — 기존 PB 보유 기록들을 강등
    const demotedIds = sameEvent.filter((r) => r.isPB).map((r) => r.id);
    return { isPB: true, demotedIds };
  }

  return { isPB: false, demotedIds: [] };
}
