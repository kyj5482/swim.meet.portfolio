/**
 * 나이 그룹(Age Group) — 수영 대회는 보통 나이대별로 종목을 나눈다.
 * 핵심 문제: 어느 나이 그룹에서 잘했어도 그 "수준"이 종단으로 남지 않는다.
 * → 경기 당시 나이로 그룹을 계산해 그룹별 기록·등급을 보존한다.
 *
 * USA Swimming 표준 그룹: 10&U / 11-12 / 13-14 / 15-16 / 17-18 / 19+.
 */
import { ageFromBirth } from './portfolio';

export const AGE_GROUPS = ['10&U', '11-12', '13-14', '15-16', '17-18', '19+'] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

/** 만 나이 → 나이 그룹. */
export function ageGroupFor(age: number): AgeGroup {
  if (age <= 10) return '10&U';
  if (age <= 12) return '11-12';
  if (age <= 14) return '13-14';
  if (age <= 16) return '15-16';
  if (age <= 18) return '17-18';
  return '19+';
}

/** 경기일 기준 나이로 나이 그룹 계산. */
export function ageGroupAtDate(birthDate: string, onDate: string): AgeGroup {
  return ageGroupFor(ageFromBirth(birthDate, new Date(onDate)));
}

/** 정렬용 순서 인덱스. */
export function ageGroupOrder(g: AgeGroup): number {
  return AGE_GROUPS.indexOf(g);
}
