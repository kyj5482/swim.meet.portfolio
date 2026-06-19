/**
 * 결과지에서 추출한 줄을 "우리 가족에 등록된 아이"에게만 매칭 (순수, 테스트 핵심).
 *
 * 설계 P6(프라이버시): 등록되지 않은 다른 선수의 기록은 저장하지 않는다.
 * 이름 표기는 제각각("Kim Jiwoo", "Jiwoo Kim", "Kim, Jiwoo", "지우", "김지우")이므로
 * 공백/쉼표/대소문자를 정규화하고 여러 조합을 비교한다.
 */
import type { ExtractedRow, RosterAthlete } from '../types';

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s,.\-]/g, '');
}

/** 추출 이름이 어떤 등록 선수와 일치하는지 찾는다. 없으면 null.
 *  형제가 성을 공유하므로 성 단독으로는 매칭하지 않고, 풀네임 조합 또는
 *  이름(given name)으로만 판정한다. 결과지에 나이/등수 등 군더더기가 붙어도
 *  부분 포함으로 흡수한다. */
export function findAthlete(
  swimmerName: string,
  roster: RosterAthlete[],
): RosterAthlete | null {
  const n = norm(swimmerName);
  if (!n) return null;
  for (const a of roster) {
    const combos = [norm(`${a.firstName}${a.lastName}`), norm(`${a.lastName}${a.firstName}`)];
    const given = norm(a.firstName);
    if (combos.some((c) => c.length >= 2 && (n === c || n.includes(c)))) return a;
    if (given.length >= 2 && (n === given || n.includes(given))) return a;
  }
  return null;
}

export interface MatchResult {
  matched: { row: ExtractedRow; athlete: RosterAthlete }[];
  unmatched: ExtractedRow[];
}

/** 추출 줄 전체를 등록 선수 기준으로 분류. */
export function matchExtractedToAthletes(
  rows: ExtractedRow[],
  roster: RosterAthlete[],
): MatchResult {
  const matched: MatchResult['matched'] = [];
  const unmatched: ExtractedRow[] = [];
  for (const row of rows) {
    const athlete = findAthlete(row.swimmerName, roster);
    if (athlete) matched.push({ row, athlete });
    else unmatched.push(row);
  }
  return { matched, unmatched };
}
