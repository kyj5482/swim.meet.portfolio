import { AthleteService, ForbiddenError, assertOwner } from './service.js';
import { InMemoryAthleteRepository } from './repository.js';
import type { Athlete } from '@swimvault/contracts';

function svc(): AthleteService {
  return new AthleteService(new InMemoryAthleteRepository());
}

const baseInput = {
  firstName: 'Mina',
  lastName: 'Park',
  birthDate: '2014-05-01',
  gender: 'F' as const,
};

describe('AthleteService', () => {
  it('create then list returns it for the owner', async () => {
    const s = svc();
    const created = await s.create('parent-1', baseInput);
    const list = await s.list('parent-1');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
    expect(created.parentId).toBe('parent-1');
  });

  it('list is scoped per parent', async () => {
    const s = svc();
    await s.create('parent-1', baseInput);
    expect(await s.list('parent-2')).toHaveLength(0);
  });

  it('get by another parent is forbidden (P6)', async () => {
    const s = svc();
    const created = await s.create('parent-1', baseInput);
    await expect(s.get('parent-2', created.id)).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('assertOwner', () => {
  const athlete = { id: 'a1', parentId: 'parent-1' } as Athlete;

  it('passes for the owner', () => {
    expect(() => assertOwner(athlete, 'parent-1')).not.toThrow();
  });

  it('throws for a non-owner', () => {
    expect(() => assertOwner(athlete, 'parent-2')).toThrow(ForbiddenError);
  });
});
