import type { RaceResult } from '@swimvault/contracts';

/**
 * 진척도/개선 분석 — 순수 로직(테스트 대상).
 *
 * 시간은 항상 timeMs(밀리초). 빠를수록(작을수록) 향상.
 */

/**
 * 이전 PB 대비 개선율(%). 빨라지면 양수, 느려지면 음수.
 * 공식: (previousMs - currentMs) / previousMs * 100, 소수 2자리 반올림.
 * previousMs <= 0 이면 RangeError.
 */
export function improvementPercent(previousMs: number, currentMs: number): number {
  if (previousMs <= 0) {
    throw new RangeError('previousMs must be > 0');
  }
  const pct = ((previousMs - currentMs) / previousMs) * 100;
  return Math.round(pct * 100) / 100;
}

export interface ProgressPoint {
  timeMs: number;
  improvementPctFromFirst: number;
}

/**
 * 한 종목 그룹의 진척도 시리즈. 입력 순서를 그대로 사용(정렬 안 함).
 * 첫 기록 대비 개선율을 각 포인트에 부착. 빈 배열이면 빈 배열.
 */
export function buildProgressSeries(results: RaceResult[]): ProgressPoint[] {
  if (results.length === 0) return [];
  const firstMs = results[0].timeMs;
  return results.map((r) => ({
    timeMs: r.timeMs,
    improvementPctFromFirst: improvementPercent(firstMs, r.timeMs),
  }));
}

export interface SplitAnalysis {
  fastestSegmentIndex: number | null;
  slowestSegmentIndex: number | null;
  averageIntervalMs: number;
  secondHalfFasterThanFirst: boolean;
}

/**
 * 구간별 인터벌(intervalMs[]) 분석.
 * - fastest/slowest 구간 인덱스
 * - 평균 인터벌
 * - 후반(second half)이 전반보다 빠른가(네거티브 스플릿)
 * 빈 배열은 안전하게 null/0/false 반환.
 */
export function splitAnalysis(splits: { intervalMs: number[] }): SplitAnalysis {
  const intervals = splits.intervalMs;
  if (!intervals || intervals.length === 0) {
    return {
      fastestSegmentIndex: null,
      slowestSegmentIndex: null,
      averageIntervalMs: 0,
      secondHalfFasterThanFirst: false,
    };
  }

  let fastestSegmentIndex = 0;
  let slowestSegmentIndex = 0;
  let sum = 0;
  for (let i = 0; i < intervals.length; i++) {
    sum += intervals[i];
    if (intervals[i] < intervals[fastestSegmentIndex]) fastestSegmentIndex = i;
    if (intervals[i] > intervals[slowestSegmentIndex]) slowestSegmentIndex = i;
  }
  const averageIntervalMs = sum / intervals.length;

  const mid = Math.floor(intervals.length / 2);
  const firstHalf = intervals.slice(0, mid);
  const secondHalf = intervals.slice(mid);
  const firstSum = firstHalf.reduce((a, b) => a + b, 0);
  const secondSum = secondHalf.reduce((a, b) => a + b, 0);
  const secondHalfFasterThanFirst =
    firstHalf.length > 0 && secondHalf.length > 0 && secondSum < firstSum;

  return {
    fastestSegmentIndex,
    slowestSegmentIndex,
    averageIntervalMs,
    secondHalfFasterThanFirst,
  };
}
