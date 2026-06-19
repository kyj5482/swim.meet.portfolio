import { FamilyService, FamilyError } from './service.js';
import { InMemoryFamilyRepository } from './repository.js';

function newService(): FamilyService {
  return new FamilyService(new InMemoryFamilyRepository());
}

describe('FamilyService', () => {
  it('가족 생성 시 생성자는 guardian 멤버', async () => {
    const svc = newService();
    const fam = await svc.createFamily('Kim 가족', 'user-1');
    expect(fam.name).toBe('Kim 가족');
    expect(fam.members).toEqual([
      expect.objectContaining({ userId: 'user-1', role: 'guardian' }),
    ]);
    expect(fam.athleteIds).toEqual([]);
  });

  it('없는 가족 조회는 NOT_FOUND', async () => {
    const svc = newService();
    await expect(svc.getFamily('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('선수 추가는 멱등', async () => {
    const svc = newService();
    const fam = await svc.createFamily('가족', 'u1');
    await svc.addAthlete(fam.id, 'ath-1');
    const after = await svc.addAthlete(fam.id, 'ath-1');
    expect(after.athleteIds).toEqual(['ath-1']);
  });

  it('초대 → 수락하면 swimmer 멤버 + 선수 연결', async () => {
    const svc = newService();
    const fam = await svc.createFamily('가족', 'guardian-1');
    const invite = await svc.createInvite(fam.id, 'swimmer');
    const joined = await svc.acceptInvite(invite.code, 'kid-1', 'ath-1');

    expect(joined.members).toEqual([
      expect.objectContaining({ userId: 'guardian-1', role: 'guardian' }),
      expect.objectContaining({ userId: 'kid-1', role: 'swimmer', athleteId: 'ath-1' }),
    ]);
    expect(joined.athleteIds).toContain('ath-1');
  });

  it('초대 코드는 1회용 — 재사용 시 무효', async () => {
    const svc = newService();
    const fam = await svc.createFamily('가족', 'g1');
    const invite = await svc.createInvite(fam.id, 'guardian');
    await svc.acceptInvite(invite.code, 'u2');
    await expect(svc.acceptInvite(invite.code, 'u3')).rejects.toMatchObject({
      code: 'INVALID_INVITE',
    });
  });

  it('listForUser는 소속 가족만', async () => {
    const svc = newService();
    const a = await svc.createFamily('A', 'owner');
    await svc.createFamily('B', 'someone-else');
    const list = await svc.listForUser('owner');
    expect(list.map((f) => f.id)).toEqual([a.id]);
  });

  it('FamilyError는 code를 노출', async () => {
    const err = new FamilyError('X', 'msg');
    expect(err.code).toBe('X');
  });
});
