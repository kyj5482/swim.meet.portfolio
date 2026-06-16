import { randomUUID } from 'node:crypto';
import type { Athlete, Gender } from '@swimvault/contracts';
import type { AthleteRepository } from './repository.js';

export interface CreateAthleteInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  clubs?: string[];
  countryCodes?: string[];
}

export class ForbiddenError extends Error {
  readonly code = 'FORBIDDEN';
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
}

/**
 * 소유권 검증(P6): 선수는 등록한 부모만 접근 가능.
 * 소유자가 아니면 ForbiddenError.
 */
export function assertOwner(athlete: Athlete, parentId: string): void {
  if (athlete.parentId !== parentId) {
    throw new ForbiddenError('not the owner of this athlete');
  }
}

export class AthleteService {
  constructor(private readonly repo: AthleteRepository) {}

  /** 부모 소유로 선수 생성. */
  async create(parentId: string, input: CreateAthleteInput): Promise<Athlete> {
    const athlete: Athlete = {
      id: randomUUID(),
      parentId,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
      gender: input.gender,
      clubs: input.clubs ?? [],
      countryCodes: input.countryCodes ?? [],
    };
    return this.repo.save(athlete);
  }

  /** 해당 부모가 소유한 선수만 조회. */
  async list(parentId: string): Promise<Athlete[]> {
    return this.repo.listByParent(parentId);
  }

  /** 소유권 검증 후 단건 조회. */
  async get(parentId: string, id: string): Promise<Athlete> {
    const athlete = await this.repo.get(id);
    if (!athlete) throw new NotFoundError('athlete not found');
    assertOwner(athlete, parentId);
    return athlete;
  }

  /** 소유권 검증 후 부분 수정. */
  async update(
    parentId: string,
    id: string,
    patch: Partial<CreateAthleteInput>,
  ): Promise<Athlete> {
    const athlete = await this.get(parentId, id);
    const updated: Athlete = {
      ...athlete,
      firstName: patch.firstName ?? athlete.firstName,
      lastName: patch.lastName ?? athlete.lastName,
      birthDate: patch.birthDate ?? athlete.birthDate,
      gender: patch.gender ?? athlete.gender,
      clubs: patch.clubs ?? athlete.clubs,
      countryCodes: patch.countryCodes ?? athlete.countryCodes,
    };
    return this.repo.save(updated);
  }
}
