import { randomUUID } from 'node:crypto';
import type { RaceResult } from '@swimvault/contracts';
import type { RecordRepository } from './repository.js';
import { determinePB } from './pb.js';

export interface CreateRecordInput {
  athleteId: string;
  meetId: string;
  stroke: RaceResult['stroke'];
  distance: number;
  course: RaceResult['course'];
  timeMs: number;
  place?: number;
  sourceJobId?: string;
  confidence?: number;
}

export class RecordsService {
  constructor(private readonly repo: RecordRepository) {}

  /** 기록 적재 + PB 판정(기존 PB 강등 포함). */
  async addRecord(input: CreateRecordInput): Promise<RaceResult> {
    const existing = await this.repo.listByAthlete(input.athleteId);
    const { isPB, demotedIds } = determinePB(existing, input);

    for (const id of demotedIds) {
      await this.repo.setPB(id, false);
    }

    const record: RaceResult = {
      id: randomUUID(),
      athleteId: input.athleteId,
      meetId: input.meetId,
      stroke: input.stroke,
      distance: input.distance,
      course: input.course,
      timeMs: input.timeMs,
      place: input.place,
      isPB,
      sourceJobId: input.sourceJobId,
      confidence: input.confidence ?? 1,
    };
    return this.repo.save(record);
  }

  async listByAthlete(athleteId: string): Promise<RaceResult[]> {
    return this.repo.listByAthlete(athleteId);
  }

  /** 종목별 현재 PB만 반환 */
  async personalBests(athleteId: string): Promise<RaceResult[]> {
    const all = await this.repo.listByAthlete(athleteId);
    return all.filter((r) => r.isPB);
  }
}
