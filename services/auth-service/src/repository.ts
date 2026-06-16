import type { Parent } from '@swimvault/contracts';

/** 부모 계정(+ 비밀번호) 저장. 골격 기본 구현은 인메모리. */
export interface StoredParent extends Parent {
  password: string;
}

export interface ParentRepository {
  findByEmail(email: string): Promise<StoredParent | undefined>;
  findById(id: string): Promise<StoredParent | undefined>;
  save(parent: StoredParent): Promise<StoredParent>;
}

export class InMemoryParentRepository implements ParentRepository {
  private store = new Map<string, StoredParent>();

  async findByEmail(email: string): Promise<StoredParent | undefined> {
    return [...this.store.values()].find((p) => p.email === email);
  }

  async findById(id: string): Promise<StoredParent | undefined> {
    return this.store.get(id);
  }

  async save(parent: StoredParent): Promise<StoredParent> {
    this.store.set(parent.id, parent);
    return parent;
  }
}
