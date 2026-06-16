import { randomUUID } from 'node:crypto';
import type { Standard } from '@swimvault/contracts';
import type { StandardRepository } from './repository.js';
import { matchStandards, type StandardQuery } from './match.js';

export interface CreateStandardInput {
  label: string;
  leagueId?: string;
  gender: Standard['gender'];
  ageMin: number;
  ageMax: number;
  stroke: Standard['stroke'];
  distance: number;
  course: Standard['course'];
  timeMs: number;
}

export class StandardsService {
  constructor(private readonly repo: StandardRepository) {}

  /** 쿼리에 맞는 기준 기록(timeMs 오름차순). */
  async match(q: StandardQuery): Promise<Standard[]> {
    const all = await this.repo.list();
    return matchStandards(all, q);
  }

  /** 커스텀 기준 기록 등록. */
  async addCustom(input: CreateStandardInput): Promise<Standard> {
    const standard: Standard = {
      id: randomUUID(),
      system: 'CUSTOM',
      leagueId: input.leagueId,
      label: input.label,
      gender: input.gender,
      ageMin: input.ageMin,
      ageMax: input.ageMax,
      stroke: input.stroke,
      distance: input.distance,
      course: input.course,
      timeMs: input.timeMs,
    };
    return this.repo.save(standard);
  }
}
