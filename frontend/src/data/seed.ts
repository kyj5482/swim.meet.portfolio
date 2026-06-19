/**
 * 시드 포트폴리오 — 한·미 양국에서 4년간 뛴 한인 선수(차별점).
 * 여러 나이 그룹(10&U → 11-12 → 13-14)을 가로지르는 이력으로, 나이 그룹별
 * 기록 수준과 향상 속도 분석을 보여줄 수 있게 구성. 게이트웨이 실프록시가
 * 백엔드에 시드 데이터를 채우기 전까지 프론트가 자립적으로 렌더하도록 한다.
 */
import type { PortfolioBundle, Meet, RaceResult } from '../types';

const meets: Meet[] = [
  { id: 'm1', name: 'YMCA Summer League #1', date: '2022-07-15', league: 'YMCA', country: 'US', course: 'SCY' },
  { id: 'm2', name: 'Bay Area Spring Invitational', date: '2023-03-12', league: 'Pacific Swimming', country: 'US', course: 'SCY' },
  { id: 'm3', name: '서울시 동계 수영대회', date: '2023-12-21', league: '서울시연맹', country: 'KR', course: 'SCM' },
  { id: 'm4', name: 'YMCA Summer League #4', date: '2024-06-28', league: 'YMCA', country: 'US', course: 'SCY' },
  { id: 'm5', name: 'Pacific Spring Invitational', date: '2025-03-15', league: 'Pacific Swimming', country: 'US', course: 'SCY' },
  { id: 'm6', name: '전국 꿈나무 수영대회', date: '2025-08-09', league: '대한수영연맹', country: 'KR', course: 'LCM' },
  { id: 'm7', name: 'Fall Classic SCY', date: '2025-11-22', league: 'Pacific Swimming', country: 'US', course: 'SCY' },
];

function r(
  id: string, meetId: string, stroke: RaceResult['stroke'], distance: number,
  course: RaceResult['course'], timeMs: number, place: number | undefined, isPB: boolean,
): RaceResult {
  return { id, athleteId: 'ath-jiwoo', meetId, stroke, distance, course, timeMs, place, isPB };
}

const races: RaceResult[] = [
  // 50 자유형 SCY — 4년·3개 나이 그룹을 가로지르는 진척 (40.10 → 32.80)
  r('r1', 'm1', 'FR', 50, 'SCY', 40100, 5, false), // 10&U
  r('r2', 'm2', 'FR', 50, 'SCY', 37800, 4, false), // 11-12
  r('r3', 'm4', 'FR', 50, 'SCY', 34900, 2, false), // 11-12
  r('r4', 'm5', 'FR', 50, 'SCY', 33400, 3, false), // 13-14
  r('r5', 'm7', 'FR', 50, 'SCY', 32800, 2, true), // 13-14 (PB)
  // 100 자유형 SCY
  r('r6', 'm2', 'FR', 100, 'SCY', 88200, 5, false),
  r('r7', 'm7', 'FR', 100, 'SCY', 79900, 3, true),
  // 50 배영 SCY
  r('r8', 'm4', 'BK', 50, 'SCY', 44600, 5, false),
  r('r9', 'm7', 'BK', 50, 'SCY', 41200, 3, true),
  // 100 개인혼영 SCY
  r('r10', 'm7', 'IM', 100, 'SCY', 92500, 4, true),
  // 한국 대회 기록(코스 다름 → 별도 PB) — 한·미 통합 타임라인
  r('r11', 'm3', 'FR', 50, 'SCM', 38900, 3, true),
  r('r12', 'm6', 'FR', 50, 'LCM', 41700, 6, true),
];

// 나이 그룹별 50 자유형 SCY 기준(예시, 작을수록 빠름). 나이가 오를수록 임계가 빡빡.
const FR50_BY_AGE = {
  '10&U': [
    { label: 'B', timeMs: 45000 }, { label: 'BB', timeMs: 42000 }, { label: 'A', timeMs: 40000 },
    { label: 'AA', timeMs: 38000 }, { label: 'AAA', timeMs: 36000 }, { label: 'AAAA', timeMs: 34000 },
  ],
  '11-12': [
    { label: 'B', timeMs: 41000 }, { label: 'BB', timeMs: 39000 }, { label: 'A', timeMs: 37000 },
    { label: 'AA', timeMs: 35000 }, { label: 'AAA', timeMs: 33500 }, { label: 'AAAA', timeMs: 32000 },
  ],
  '13-14': [
    { label: 'B', timeMs: 38000 }, { label: 'BB', timeMs: 36000 }, { label: 'A', timeMs: 34000 },
    { label: 'AA', timeMs: 32500 }, { label: 'AAA', timeMs: 31000 }, { label: 'AAAA', timeMs: 30000 },
  ],
};

export const SEED: PortfolioBundle = {
  athlete: {
    id: 'ath-jiwoo',
    firstName: '지우',
    lastName: 'Kim',
    birthDate: '2012-03-10',
    gender: 'F',
    clubs: ['Seoul Dolphins', 'Bay Area Aquatics'],
    countryCodes: ['KR', 'US'],
  },
  meets: Object.fromEntries(meets.map((m) => [m.id, m])),
  races,
  gamification: {
    athleteId: 'ath-jiwoo',
    xp: 720,
    level: 4,
    xpIntoLevel: 120,
    xpForNextLevel: 400,
    currentStreakDays: 5,
    longestStreakDays: 12,
    badges: [
      { code: 'first_splash', label: '첫 물보라', earnedAt: '2022-07-15T00:00:00Z' },
      { code: 'all_four_strokes', label: '4영법 마스터', earnedAt: '2024-06-28T00:00:00Z' },
      { code: 'pb_machine', label: 'PB 머신', earnedAt: '2025-11-22T00:00:00Z' },
      { code: 'distance_explorer', label: '거리 탐험가', earnedAt: '2025-11-22T00:00:00Z' },
    ],
  },
  family: [
    { athleteId: 'ath-jiwoo', name: '지우', level: 4, xp: 720, rank: 1 },
    { athleteId: 'ath-minjun', name: '민준', level: 2, xp: 240, rank: 2 },
  ],
  // 헤드라인 등급(현재 나이 그룹 13-14 기준)
  standards: {
    'FR-50-SCY': FR50_BY_AGE['13-14'],
    'FR-100-SCY': [
      { label: 'B', timeMs: 90000 }, { label: 'BB', timeMs: 85000 }, { label: 'A', timeMs: 80000 },
      { label: 'AA', timeMs: 76000 }, { label: 'AAA', timeMs: 72000 }, { label: 'AAAA', timeMs: 69000 },
    ],
    'BK-50-SCY': [
      { label: 'B', timeMs: 46000 }, { label: 'BB', timeMs: 43000 }, { label: 'A', timeMs: 40500 },
      { label: 'AA', timeMs: 38500 }, { label: 'AAA', timeMs: 36500 }, { label: 'AAAA', timeMs: 35000 },
    ],
  },
  ageStandards: {
    'FR-50-SCY': FR50_BY_AGE,
  },
};
