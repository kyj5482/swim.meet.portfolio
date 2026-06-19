import { randomUUID } from 'node:crypto';
import type {
  Family,
  FamilyInvite,
  FamilyRole,
} from '@swimvault/contracts';
import type { FamilyRepository } from './repository.js';
import { generateInviteCode, expiryFrom, isExpired } from './invite.js';

export class FamilyError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class FamilyService {
  constructor(private readonly repo: FamilyRepository) {}

  /** 가족 생성 — 생성자는 자동으로 guardian 멤버가 된다. */
  async createFamily(name: string, createdBy: string): Promise<Family> {
    const now = new Date().toISOString();
    const family: Family = {
      id: randomUUID(),
      name,
      createdBy,
      members: [{ userId: createdBy, role: 'guardian', joinedAt: now }],
      athleteIds: [],
      createdAt: now,
    };
    return this.repo.save(family);
  }

  async getFamily(id: string): Promise<Family> {
    const family = await this.repo.get(id);
    if (!family) throw new FamilyError('NOT_FOUND', `family ${id} not found`);
    return family;
  }

  async listForUser(userId: string): Promise<Family[]> {
    return this.repo.listForUser(userId);
  }

  /** 선수 프로필을 가족에 연결(중복 무시). */
  async addAthlete(familyId: string, athleteId: string): Promise<Family> {
    const family = await this.getFamily(familyId);
    if (!family.athleteIds.includes(athleteId)) {
      family.athleteIds.push(athleteId);
      await this.repo.save(family);
    }
    return family;
  }

  /** 보호자가 합류 초대 발급. */
  async createInvite(familyId: string, role: FamilyRole): Promise<FamilyInvite> {
    await this.getFamily(familyId); // 존재 검증
    const invite: FamilyInvite = {
      code: generateInviteCode(),
      familyId,
      role,
      expiresAt: expiryFrom(new Date()),
    };
    return this.repo.saveInvite(invite);
  }

  /**
   * 초대 코드 수락 → 멤버 추가. swimmer면 athleteId 연결 가능.
   * 이미 멤버면 멱등(중복 추가 안 함). 만료/무효 코드는 에러.
   */
  async acceptInvite(
    code: string,
    userId: string,
    athleteId?: string,
  ): Promise<Family> {
    const invite = await this.repo.getInvite(code);
    if (!invite) throw new FamilyError('INVALID_INVITE', 'invite code not found');
    if (isExpired(invite.expiresAt)) {
      await this.repo.deleteInvite(code);
      throw new FamilyError('EXPIRED_INVITE', 'invite code expired');
    }

    const family = await this.getFamily(invite.familyId);
    const already = family.members.find((m) => m.userId === userId);
    if (!already) {
      family.members.push({
        userId,
        role: invite.role,
        athleteId,
        joinedAt: new Date().toISOString(),
      });
    }
    if (athleteId && !family.athleteIds.includes(athleteId)) {
      family.athleteIds.push(athleteId);
    }
    await this.repo.save(family);
    await this.repo.deleteInvite(code); // 1회용
    return family;
  }
}
