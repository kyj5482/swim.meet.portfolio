import type { Standard, Gender, Stroke, Course } from '@swimvault/contracts';

/**
 * 기준 기록(Standard) 매칭 — 순수 로직(테스트 대상).
 *
 * 시간은 항상 timeMs(밀리초). 기준 컷 이하(<=)면 달성.
 */

export interface StandardQuery {
  gender: Gender;
  age: number;
  stroke: Stroke;
  distance: number;
  course: Course;
}

/** 두 ISO 날짜 사이의 만 나이(생일 미도래 시 1 차감). */
export function ageInYears(birthDate: string, onDate: string): number {
  const b = new Date(birthDate);
  const on = new Date(onDate);
  let age = on.getUTCFullYear() - b.getUTCFullYear();
  const monthDiff = on.getUTCMonth() - b.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && on.getUTCDate() < b.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/**
 * 기준 후보를 성별 일치, 연령 [ageMin, ageMax] 포함(경계 inclusive),
 * 영법/거리/코스 동일로 필터. timeMs 오름차순 정렬.
 */
export function matchStandards(
  standards: Standard[],
  q: StandardQuery
): Standard[] {
  return standards
    .filter(
      (s) =>
        s.gender === q.gender &&
        q.age >= s.ageMin &&
        q.age <= s.ageMax &&
        s.stroke === q.stroke &&
        s.distance === q.distance &&
        s.course === q.course
    )
    .sort((a, b) => a.timeMs - b.timeMs);
}

/** 기록이 기준 컷 이하(<=)면 달성. */
export function meetsStandard(standard: Standard, timeMs: number): boolean {
  return timeMs <= standard.timeMs;
}
