import { xpForLevel, levelForXp } from './gamification.js';

describe('xpForLevel', () => {
  it('레벨 임계값 곡선', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
    expect(xpForLevel(5)).toBe(1000);
  });
  it('레벨 < 1 거부', () => {
    expect(() => xpForLevel(0)).toThrow(RangeError);
  });
});

describe('levelForXp', () => {
  it('0 XP는 레벨 1', () => {
    expect(levelForXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 });
  });
  it('임계값 정확히 도달 시 다음 레벨', () => {
    expect(levelForXp(100).level).toBe(2);
    expect(levelForXp(300).level).toBe(3);
    expect(levelForXp(1000).level).toBe(5);
  });
  it('구간 중간 XP의 진행도', () => {
    const r = levelForXp(150);
    expect(r.level).toBe(2);
    expect(r.xpIntoLevel).toBe(50);
    expect(r.xpForNextLevel).toBe(200); // L2(100)→L3(300)
  });
  it('음수는 0으로 클램프', () => {
    expect(levelForXp(-5).level).toBe(1);
  });
  it('xpForLevel과 왕복 일관성', () => {
    for (let n = 1; n <= 20; n++) {
      expect(levelForXp(xpForLevel(n)).level).toBe(n);
      // 다음 임계값 직전 1 XP는 여전히 같은 레벨
      expect(levelForXp(xpForLevel(n + 1) - 1).level).toBe(n);
    }
  });
});
