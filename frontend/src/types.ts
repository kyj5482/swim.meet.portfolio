/**
 * 프론트엔드 도메인 타입 — `@swimvault/contracts` 미러링(독립 빌드).
 * 계약 변경 시 동기화. 포트폴리오 화면이 쓰는 최소 집합만 둔다.
 */

export type Stroke = 'FR' | 'BK' | 'BR' | 'FL' | 'IM';
export type Course = 'SCY' | 'SCM' | 'LCM';
export type Gender = 'M' | 'F' | 'X';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date
  gender: Gender;
  clubs: string[];
  countryCodes: string[]; // ["US","KR"] — 한·미 통합
}

export interface Meet {
  id: string;
  name: string;
  date: string; // ISO date
  league: string;
  country: string; // ISO-3166 alpha-2
  course: Course;
}

export interface RaceResult {
  id: string;
  athleteId: string;
  meetId: string;
  stroke: Stroke;
  distance: number;
  course: Course;
  timeMs: number;
  place?: number;
  isPB: boolean;
}

export interface Badge {
  code: string;
  label: string;
  earnedAt: string;
}

export interface GamificationProfile {
  athleteId: string;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  currentStreakDays: number;
  longestStreakDays: number;
  badges: Badge[];
}

export interface FamilyMemberView {
  athleteId: string;
  name: string;
  level: number;
  xp: number;
  rank: number;
}

/** 한 선수의 포트폴리오에 필요한 모든 데이터 묶음. */
export interface PortfolioBundle {
  athlete: Athlete;
  meets: Record<string, Meet>;
  races: RaceResult[];
  gamification: GamificationProfile;
  family: FamilyMemberView[];
  /** 이벤트 키(`${stroke}-${distance}-${course}`) → 기준 라인들(현재 나이 그룹) */
  standards: Record<string, { label: string; timeMs: number }[]>;
  /** 이벤트 키 → 나이 그룹 → 기준 라인들 (나이 그룹별 등급 판정) */
  ageStandards?: Record<string, Record<string, { label: string; timeMs: number }[]>>;
}

/** 이벤트 식별 키. */
export function eventKey(r: Pick<RaceResult, 'stroke' | 'distance' | 'course'>): string {
  return `${r.stroke}-${r.distance}-${r.course}`;
}
