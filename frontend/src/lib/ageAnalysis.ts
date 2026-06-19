/**
 * 나이 그룹별 기록 수준 + 향상 속도 분석 (순수 로직, 테스트 핵심).
 *
 * - ageGroupBreakdown: 한 종목을 나이 그룹별로 묶어 그룹별 최고기록·등급을 보존.
 *   (대회는 나이대로 나뉘지만 그 수준이 종단으로 안 남는 문제를 보완)
 * - improvementRate: 기록이 "얼마나 빨리" 좋아지는지(월 단위 향상%).
 */
import { eventKey, type RaceResult } from '../types';
import { ageGroupAtDate, ageGroupOrder, type AgeGroup } from './ageGroup';
import { improvementPct } from './portfolio';

export interface AgeGroupRecord {
  ageGroup: AgeGroup;
  best: RaceResult; // 그 그룹에서의 최고(가장 빠른) 기록
  count: number;
  firstMs: number; // 그룹 내 최초 기록
  latestMs: number; // 그룹 내 최신 기록
  improvementPct: number; // 그룹 내 향상%(양수=빨라짐)
}

/** 한 종목(key)을 나이 그룹별로 묶어 그룹별 기록 요약을 반환(그룹 순서대로). */
export function ageGroupBreakdown(
  races: RaceResult[],
  key: string,
  birthDate: string,
  meetDate: (r: RaceResult) => string,
): AgeGroupRecord[] {
  const groups = new Map<AgeGroup, RaceResult[]>();
  for (const r of races) {
    if (eventKey(r) !== key) continue;
    const g = ageGroupAtDate(birthDate, meetDate(r));
    const list = groups.get(g) ?? groups.set(g, []).get(g)!;
    list.push(r);
  }

  const out: AgeGroupRecord[] = [];
  for (const [ageGroup, list] of groups) {
    const byTime = [...list].sort((a, b) => a.timeMs - b.timeMs);
    const byDate = [...list].sort((a, b) => meetDate(a).localeCompare(meetDate(b)));
    const firstMs = byDate[0].timeMs;
    const latestMs = byDate[byDate.length - 1].timeMs;
    out.push({
      ageGroup,
      best: byTime[0],
      count: list.length,
      firstMs,
      latestMs,
      improvementPct: improvementPct(firstMs, latestMs),
    });
  }
  return out.sort((a, b) => ageGroupOrder(a.ageGroup) - ageGroupOrder(b.ageGroup));
}

export interface ImprovementRate {
  months: number;
  totalPct: number; // 최초→최신 전체 향상%
  pctPerMonth: number; // 월 평균 향상 속도
}

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

/** 시간순 포인트들의 향상 속도(월 단위). 포인트 2개 미만이면 0. */
export function improvementRate(points: { date: string; timeMs: number }[]): ImprovementRate {
  if (points.length < 2) return { months: 0, totalPct: 0, pctPerMonth: 0 };
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalPct = improvementPct(first.timeMs, last.timeMs);
  const months = (Date.parse(last.date) - Date.parse(first.date)) / MS_PER_MONTH;
  const pctPerMonth = months > 0 ? totalPct / months : 0;
  return { months, totalPct, pctPerMonth };
}

export type RateCategory = 'fast' | 'steady' | 'slow' | 'flat';

/** 향상 속도 정성 분류(휴리스틱 임계값). 표시는 i18n에서 처리. */
export function rateCategory(pctPerMonth: number): RateCategory {
  if (pctPerMonth >= 1.0) return 'fast';
  if (pctPerMonth >= 0.4) return 'steady';
  if (pctPerMonth > 0) return 'slow';
  return 'flat';
}
