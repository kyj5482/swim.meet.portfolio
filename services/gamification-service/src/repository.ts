import type { GameEvent } from '@swimvault/contracts';

/**
 * 게임 이벤트 저장 추상화(append-only). 골격 기본은 인메모리.
 * 운영에서는 PostgreSQL/이벤트 스토어 어댑터로 교체(인터페이스 유지).
 */
export interface GamificationRepository {
  append(event: GameEvent): Promise<GameEvent>;
  listByAthlete(athleteId: string): Promise<GameEvent[]>;
}

export class InMemoryGamificationRepository implements GamificationRepository {
  private events: GameEvent[] = [];

  async append(event: GameEvent): Promise<GameEvent> {
    this.events.push(event);
    return event;
  }

  async listByAthlete(athleteId: string): Promise<GameEvent[]> {
    return this.events
      .filter((e) => e.athleteId === athleteId)
      .sort((a, b) => a.at.localeCompare(b.at));
  }
}
