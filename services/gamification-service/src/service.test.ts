import { GamificationService } from './service.js';
import { InMemoryGamificationRepository } from './repository.js';

function newService(): GamificationService {
  return new GamificationService(new InMemoryGamificationRepository());
}

describe('GamificationService', () => {
  it('빈 프로필은 레벨 1, XP 0', async () => {
    const svc = newService();
    const p = await svc.profile('athlete-1');
    expect(p.level).toBe(1);
    expect(p.xp).toBe(0);
    expect(p.badges).toEqual([]);
  });

  it('이벤트 적재가 XP와 레벨에 반영된다', async () => {
    const svc = newService();
    // race(10) + pb(25+5) + distance(50) = 90 → 아직 레벨1, 다음 100
    await svc.recordEvent({ athleteId: 'a', type: 'race_logged' });
    await svc.recordEvent({ athleteId: 'a', type: 'pb_achieved', meta: { improvementPct: 5 } });
    const p = await svc.recordEvent({ athleteId: 'a', type: 'distance_milestone' });
    expect(p.xp).toBe(90);
    expect(p.level).toBe(1);
    expect(p.xpForNextLevel).toBe(100);
    expect(p.badges.map((b) => b.code)).toContain('first_splash');
  });

  it('선수별로 XP가 격리된다', async () => {
    const svc = newService();
    await svc.recordEvent({ athleteId: 'a', type: 'race_logged' });
    await svc.recordEvent({ athleteId: 'b', type: 'race_logged' });
    await svc.recordEvent({ athleteId: 'b', type: 'race_logged' });
    expect((await svc.profile('a')).xp).toBe(10);
    expect((await svc.profile('b')).xp).toBe(20);
  });

  it('가족 리더보드는 XP 내림차순 순위', async () => {
    const svc = newService();
    await svc.recordEvent({ athleteId: 'kid1', type: 'race_logged' });
    await svc.recordEvent({ athleteId: 'kid2', type: 'distance_milestone' }); // 50 > 10
    const board = await svc.leaderboard(['kid1', 'kid2']);
    expect(board[0]).toMatchObject({ athleteId: 'kid2', rank: 1 });
    expect(board[1]).toMatchObject({ athleteId: 'kid1', rank: 2 });
  });
});
