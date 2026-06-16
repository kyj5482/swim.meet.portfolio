import type { AnalyticsRepository } from './repository.js';
import {
  buildProgressSeries,
  splitAnalysis,
  type ProgressPoint,
  type SplitAnalysis,
} from './improvement.js';

export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  /** 선수 기록의 진척도 시리즈(첫 기록 대비 개선율). */
  async progress(athleteId: string): Promise<ProgressPoint[]> {
    const results = await this.repo.listByAthlete(athleteId);
    return buildProgressSeries(results);
  }

  /** 한 경주의 스플릿 분석. */
  async splits(raceId: string): Promise<SplitAnalysis> {
    const intervalMs = await this.repo.splitsByRace(raceId);
    return splitAnalysis({ intervalMs });
  }
}
