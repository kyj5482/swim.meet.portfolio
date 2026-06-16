import type { Standard } from '@swimvault/contracts';

/**
 * 스토리지 추상화. 골격 기본 구현은 인메모리.
 * 운영에서는 PostgreSQL 어댑터로 교체(인터페이스 유지).
 */
export interface StandardRepository {
  list(): Promise<Standard[]>;
  save(standard: Standard): Promise<Standard>;
}

export class InMemoryStandardRepository implements StandardRepository {
  private store = new Map<string, Standard>();

  async list(): Promise<Standard[]> {
    return [...this.store.values()];
  }

  async save(standard: Standard): Promise<Standard> {
    this.store.set(standard.id, standard);
    return standard;
  }
}
