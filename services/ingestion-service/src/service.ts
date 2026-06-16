import { randomUUID } from 'node:crypto';
import type { ExtractionJob } from '@swimvault/contracts';
import type { JobRepository } from './repository.js';
import { detectSourceType } from './sourceType.js';

export interface CreateUploadInput {
  athleteId: string;
  filename: string;
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
}

export class IngestionService {
  constructor(private readonly repo: JobRepository) {}

  /**
   * 업로드 수신 → ExtractionJob 생성(status='uploaded').
   * 소유권(P6): athleteId는 호출 부모 소유여야 한다(게이트웨이 검증 가정, M1).
   * 미지원 확장자는 detectSourceType이 예외를 던진다.
   */
  async createJob(input: CreateUploadInput): Promise<ExtractionJob> {
    const sourceType = detectSourceType(input.filename);
    const job: ExtractionJob = {
      id: randomUUID(),
      athleteId: input.athleteId,
      sourceType,
      status: 'uploaded',
      fileRef: input.filename,
      extracted: [],
    };
    return this.repo.save(job);
  }

  async getJob(id: string): Promise<ExtractionJob> {
    const job = await this.repo.get(id);
    if (!job) throw new NotFoundError('job not found');
    return job;
  }
}
