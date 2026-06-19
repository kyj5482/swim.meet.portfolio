import { describe, it, expect } from 'vitest';
import { xpForLevel, levelForXp, levelProgress } from './level';

describe('level 곡선 (contracts 미러)', () => {
  it('임계값', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
  });
  it('levelForXp', () => {
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(150)).toEqual({ level: 2, xpIntoLevel: 50, xpForNextLevel: 200 });
  });
  it('levelProgress 0..1', () => {
    expect(levelProgress(0)).toBe(0);
    expect(levelProgress(150)).toBeCloseTo(0.25, 5);
    expect(levelProgress(300)).toBe(0); // 새 레벨 진입 직후
  });
});
