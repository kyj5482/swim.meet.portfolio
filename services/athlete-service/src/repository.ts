import type { Athlete } from '@swimvault/contracts';

/**
 * 선수 프로필 스토리지 추상화. 골격 기본 구현은 인메모리.
 * 운영에서는 PostgreSQL 어댑터로 교체(인터페이스 유지).
 */
export interface AthleteRepository {
  save(athlete: Athlete): Promise<Athlete>;
  get(id: string): Promise<Athlete | undefined>;
  listByParent(parentId: string): Promise<Athlete[]>;
}

export class InMemoryAthleteRepository implements AthleteRepository {
  private store = new Map<string, Athlete>();

  async save(athlete: Athlete): Promise<Athlete> {
    this.store.set(athlete.id, athlete);
    return athlete;
  }

  async get(id: string): Promise<Athlete | undefined> {
    return this.store.get(id);
  }

  async listByParent(parentId: string): Promise<Athlete[]> {
    return [...this.store.values()].filter((a) => a.parentId === parentId);
  }
}
