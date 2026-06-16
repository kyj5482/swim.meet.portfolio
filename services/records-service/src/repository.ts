import type { RaceResult } from '@swimvault/contracts';

/**
 * 스토리지 추상화. 골격 기본 구현은 인메모리.
 * 운영에서는 PostgreSQL 어댑터로 교체(인터페이스 유지).
 */
export interface RecordRepository {
  listByAthlete(athleteId: string): Promise<RaceResult[]>;
  save(result: RaceResult): Promise<RaceResult>;
  setPB(id: string, isPB: boolean): Promise<void>;
}

export class InMemoryRecordRepository implements RecordRepository {
  private store = new Map<string, RaceResult>();

  async listByAthlete(athleteId: string): Promise<RaceResult[]> {
    return [...this.store.values()].filter((r) => r.athleteId === athleteId);
  }

  async save(result: RaceResult): Promise<RaceResult> {
    this.store.set(result.id, result);
    return result;
  }

  async setPB(id: string, isPB: boolean): Promise<void> {
    const r = this.store.get(id);
    if (r) this.store.set(id, { ...r, isPB });
  }
}
