/**
 * 게임화 레벨 곡선 (프론트엔드 로컬 복사본).
 *
 * NOTE: `@swimvault/contracts`의 `libs/contracts/src/gamification.ts`를 미러링.
 * 진행바가 백엔드 레벨 계산과 동일한 곡선을 쓰도록 한다. 계약 변경 시 동기화.
 */

/** 레벨 n 도달 누적 XP: 50·(n-1)·n → L1:0, L2:100, L3:300 … */
export function xpForLevel(level: number): number {
  if (level < 1) throw new RangeError('level must be >= 1');
  return 50 * (level - 1) * level;
}

export function levelForXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + safeXp / 12.5)) / 2));
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpIntoLevel: safeXp - base, xpForNextLevel: next - base };
}

/** 현재 레벨 진행 비율 0..1 (진행바/링 표시용). */
export function levelProgress(xp: number): number {
  const { xpIntoLevel, xpForNextLevel } = levelForXp(xp);
  if (xpForNextLevel <= 0) return 0;
  return Math.min(1, Math.max(0, xpIntoLevel / xpForNextLevel));
}
