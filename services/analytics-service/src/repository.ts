import type { RaceResult } from '@swimvault/contracts';

/**
 * 스토리지 추상화. 골격 기본 구현은 인메모리.
 * 운영에서는 records-service 조회/뷰로 교체(인터페이스 유지).
 */
export interface AnalyticsRepository {
  listByAthlete(athleteId: string): Promise<RaceResult[]>;
  splitsByRace(raceId: string): Promise<number[]>;
}

export class InMemoryAnalyticsRepository implements AnalyticsRepository {
  private results = new Map<string, RaceResult[]>();
  private splits = new Map<string, number[]>();

  async listByAthlete(athleteId: string): Promise<RaceResult[]> {
    return this.results.get(athleteId) ?? [];
  }

  async splitsByRace(raceId: string): Promise<number[]> {
    return this.splits.get(raceId) ?? [];
  }

  /** 테스트/시드용 */
  seedResults(athleteId: string, results: RaceResult[]): void {
    this.results.set(athleteId, results);
  }

  seedSplits(raceId: string, intervalMs: number[]): void {
    this.splits.set(raceId, intervalMs);
  }
}
