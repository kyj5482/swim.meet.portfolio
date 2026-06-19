/**
 * 시드 포트폴리오 — 한·미 양국에서 뛴 한인 선수(차별점). 백엔드 게이트웨이가
 * 실제 프록시되기 전까지 프론트가 자립적으로 풍부한 화면을 렌더하도록 한다.
 * (api/client.ts가 VITE_USE_MOCK로 이 데이터/실서버를 전환)
 */
import type { PortfolioBundle, Meet, RaceResult } from '../types';

const meets: Meet[] = [
  { id: 'm1', name: '서울시 동계 수영대회', date: '2024-12-21', league: '서울시연맹', country: 'KR', course: 'SCM' },
  { id: 'm2', name: 'Bay Area Spring Invitational', date: '2025-03-15', league: 'Pacific Swimming', country: 'US', course: 'SCY' },
  { id: 'm3', name: 'YMCA Summer League #2', date: '2025-06-28', league: 'YMCA', country: 'US', course: 'SCY' },
  { id: 'm4', name: '전국 꿈나무 수영대회', date: '2025-08-09', league: '대한수영연맹', country: 'KR', course: 'LCM' },
  { id: 'm5', name: 'Fall Classic SCY', date: '2025-11-22', league: 'Pacific Swimming', country: 'US', course: 'SCY' },
];

function r(
  id: string, meetId: string, stroke: RaceResult['stroke'], distance: number,
  course: RaceResult['course'], timeMs: number, place: number | undefined, isPB: boolean,
): RaceResult {
  return { id, athleteId: 'ath-jiwoo', meetId, stroke, distance, course, timeMs, place, isPB };
}

// 50 자유형 SCY 진척(빨라짐): 40.10 → 37.80 → 35.20 → 33.40(PB)
const races: RaceResult[] = [
  r('r1', 'm2', 'FR', 50, 'SCY', 40100, 6, false),
  r('r2', 'm3', 'FR', 50, 'SCY', 37800, 4, false),
  r('r3', 'm5', 'FR', 50, 'SCY', 33400, 2, true),
  // 100 자유형 SCY
  r('r4', 'm2', 'FR', 100, 'SCY', 88200, 5, false),
  r('r5', 'm5', 'FR', 100, 'SCY', 79900, 3, true),
  // 50 배영 SCY
  r('r6', 'm3', 'BK', 50, 'SCY', 44600, 5, false),
  r('r7', 'm5', 'BK', 50, 'SCY', 41200, 3, true),
  // 100 개인혼영 SCY
  r('r8', 'm5', 'IM', 100, 'SCY', 92500, 4, true),
  // 한국 대회 기록(코스 다름 → 별도 PB) — 한·미 통합 타임라인
  r('r9', 'm1', 'FR', 50, 'SCM', 38900, 3, true),
  r('r10', 'm4', 'FR', 50, 'LCM', 41700, 8, true),
];

export const SEED: PortfolioBundle = {
  athlete: {
    id: 'ath-jiwoo',
    firstName: '지우',
    lastName: 'Kim',
    birthDate: '2015-04-12',
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
      { code: 'first_splash', label: '첫 물보라', earnedAt: '2025-03-15T00:00:00Z' },
      { code: 'all_four_strokes', label: '4영법 마스터', earnedAt: '2025-06-28T00:00:00Z' },
      { code: 'pb_machine', label: 'PB 머신', earnedAt: '2025-11-22T00:00:00Z' },
      { code: 'distance_explorer', label: '거리 탐험가', earnedAt: '2025-11-22T00:00:00Z' },
    ],
  },
  family: [
    { athleteId: 'ath-jiwoo', name: '지우', level: 4, xp: 720, rank: 1 },
    { athleteId: 'ath-minjun', name: '민준', level: 2, xp: 240, rank: 2 },
  ],
  standards: {
    // 50 자유형 SCY — 여 10세 모티베이셔널(예시, 작을수록 빠름)
    'FR-50-SCY': [
      { label: 'B', timeMs: 41000 },
      { label: 'BB', timeMs: 38500 },
      { label: 'A', timeMs: 36000 },
      { label: 'AA', timeMs: 34000 },
      { label: 'AAA', timeMs: 32000 },
      { label: 'AAAA', timeMs: 30500 },
    ],
    'FR-100-SCY': [
      { label: 'B', timeMs: 90000 },
      { label: 'BB', timeMs: 85000 },
      { label: 'A', timeMs: 80000 },
      { label: 'AA', timeMs: 76000 },
      { label: 'AAA', timeMs: 72000 },
      { label: 'AAAA', timeMs: 69000 },
    ],
    'BK-50-SCY': [
      { label: 'B', timeMs: 46000 },
      { label: 'BB', timeMs: 43000 },
      { label: 'A', timeMs: 40500 },
      { label: 'AA', timeMs: 38500 },
      { label: 'AAA', timeMs: 36500 },
      { label: 'AAAA', timeMs: 35000 },
    ],
  },
};
