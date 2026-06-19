/**
 * 포트폴리오 집계 순수 헬퍼 (테스트 핵심).
 * 경쟁 앱의 "베스트 타임 보드 + 진척 그래프 + 향상%"를 떠받친다.
 */
import { eventKey, type RaceResult } from '../types';

export interface EventBest {
  key: string;
  stroke: RaceResult['stroke'];
  distance: number;
  course: RaceResult['course'];
  best: RaceResult; // 최고 기록(가장 빠른)
  count: number; // 해당 이벤트 기록 수
  firstMs: number; // 최초 기록(시간순)
  improvementPct: number; // 최초 대비 향상%(양수=빨라짐)
}

/** 이벤트별 최고기록 + 향상% 요약. distance·stroke·course로 그룹. */
export function bestTimesByEvent(races: RaceResult[], meetDate: (r: RaceResult) => string): EventBest[] {
  const groups = new Map<string, RaceResult[]>();
  for (const r of races) {
    const k = eventKey(r);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  const out: EventBest[] = [];
  for (const [key, list] of groups) {
    const byTime = [...list].sort((a, b) => a.timeMs - b.timeMs);
    const byDate = [...list].sort((a, b) => meetDate(a).localeCompare(meetDate(b)));
    const best = byTime[0];
    const firstMs = byDate[0].timeMs;
    const latestMs = byDate[byDate.length - 1].timeMs;
    out.push({
      key,
      stroke: best.stroke,
      distance: best.distance,
      course: best.course,
      best,
      count: list.length,
      firstMs,
      improvementPct: improvementPct(firstMs, latestMs),
    });
  }
  // 거리 → 종목 순 정렬(보기 좋게)
  return out.sort((a, b) => a.distance - b.distance || a.stroke.localeCompare(b.stroke));
}

/** 최초 대비 향상%. 양수면 빨라진 것(개선). 0 이하 입력은 0. */
export function improvementPct(firstMs: number, latestMs: number): number {
  if (firstMs <= 0) return 0;
  return ((firstMs - latestMs) / firstMs) * 100;
}

export interface ProgressPoint {
  date: string;
  timeMs: number;
  isPB: boolean;
}

/** 특정 이벤트의 시간순 진척 포인트(그래프용). */
export function progressionFor(
  races: RaceResult[],
  key: string,
  meetDate: (r: RaceResult) => string,
): ProgressPoint[] {
  return races
    .filter((r) => eventKey(r) === key)
    .map((r) => ({ date: meetDate(r), timeMs: r.timeMs, isPB: r.isPB }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 생년월일 → 만 나이(기준일 today). */
export function ageFromBirth(birthDate: string, today: Date = new Date()): number {
  const b = new Date(birthDate);
  let age = today.getUTCFullYear() - b.getUTCFullYear();
  const m = today.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < b.getUTCDate())) age--;
  return age;
}
