import type { Family, FamilyInvite } from '@swimvault/contracts';

/**
 * 가족·초대 저장 추상화. 골격 기본은 인메모리.
 * 운영에서는 PostgreSQL 어댑터로 교체(인터페이스 유지).
 */
export interface FamilyRepository {
  save(family: Family): Promise<Family>;
  get(id: string): Promise<Family | null>;
  listForUser(userId: string): Promise<Family[]>;
  saveInvite(invite: FamilyInvite): Promise<FamilyInvite>;
  getInvite(code: string): Promise<FamilyInvite | null>;
  deleteInvite(code: string): Promise<void>;
}

export class InMemoryFamilyRepository implements FamilyRepository {
  private families = new Map<string, Family>();
  private invites = new Map<string, FamilyInvite>();

  async save(family: Family): Promise<Family> {
    this.families.set(family.id, family);
    return family;
  }

  async get(id: string): Promise<Family | null> {
    return this.families.get(id) ?? null;
  }

  async listForUser(userId: string): Promise<Family[]> {
    return [...this.families.values()].filter((f) =>
      f.members.some((m) => m.userId === userId),
    );
  }

  async saveInvite(invite: FamilyInvite): Promise<FamilyInvite> {
    this.invites.set(invite.code, invite);
    return invite;
  }

  async getInvite(code: string): Promise<FamilyInvite | null> {
    return this.invites.get(code) ?? null;
  }

  async deleteInvite(code: string): Promise<void> {
    this.invites.delete(code);
  }
}
