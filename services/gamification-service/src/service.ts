import { randomUUID } from 'node:crypto';
import {
  levelForXp,
  type GameEvent,
  type GameEventType,
  type GamificationProfile,
  type LeaderboardEntry,
} from '@swimvault/contracts';
import type { GamificationRepository } from './repository.js';
import { totalXp } from './xp.js';
import { computeStreak } from './streak.js';
import { evaluateBadges } from './badges.js';

export interface RecordEventInput {
  athleteId: string;
  type: GameEventType;
  at?: string;
  meta?: Record<string, number | string>;
}

export class GamificationService {
  constructor(private readonly repo: GamificationRepository) {}

  /** 이벤트 적재 후 갱신된 프로필 반환. */
  async recordEvent(input: RecordEventInput): Promise<GamificationProfile> {
    const event: GameEvent = {
      id: randomUUID(),
      athleteId: input.athleteId,
      type: input.type,
      at: input.at ?? new Date().toISOString(),
      meta: input.meta,
    };
    await this.repo.append(event);
    return this.profile(input.athleteId);
  }

  /** 선수의 현재 게임화 프로필(XP·레벨·스트릭·뱃지)을 집계. */
  async profile(athleteId: string): Promise<GamificationProfile> {
    const events = await this.repo.listByAthlete(athleteId);
    const xp = totalXp(events);
    const { level, xpIntoLevel, xpForNextLevel } = levelForXp(xp);
    const streak = computeStreak(events.map((e) => e.at));
    const badges = evaluateBadges(events, streak.longestStreakDays);
    return {
      athleteId,
      xp,
      level,
      xpIntoLevel,
      xpForNextLevel,
      currentStreakDays: streak.currentStreakDays,
      longestStreakDays: streak.longestStreakDays,
      badges,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 가족 내 리더보드 — athleteIds를 받아 레벨·XP로 정렬해 순위 부여.
   * (가족 멤버십은 family-service가 알고, 여기는 점수만 책임 R1)
   */
  async leaderboard(athleteIds: string[]): Promise<LeaderboardEntry[]> {
    const profiles = await Promise.all(athleteIds.map((id) => this.profile(id)));
    return profiles
      .sort((a, b) => b.xp - a.xp)
      .map((p, i) => ({ athleteId: p.athleteId, level: p.level, xp: p.xp, rank: i + 1 }));
  }
}
