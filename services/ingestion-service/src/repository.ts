import type { ExtractionJob } from '@swimvault/contracts';

/**
 * ExtractionJob 스토리지 추상화. 골격 기본 구현은 인메모리.
 * 운영에서는 PostgreSQL 어댑터로 교체(인터페이스 유지).
 */
export interface JobRepository {
  save(job: ExtractionJob): Promise<ExtractionJob>;
  get(id: string): Promise<ExtractionJob | undefined>;
}

export class InMemoryJobRepository implements JobRepository {
  private store = new Map<string, ExtractionJob>();

  async save(job: ExtractionJob): Promise<ExtractionJob> {
    this.store.set(job.id, job);
    return job;
  }

  async get(id: string): Promise<ExtractionJob | undefined> {
    return this.store.get(id);
  }
}
