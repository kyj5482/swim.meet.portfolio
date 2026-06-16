import { randomUUID } from 'node:crypto';
import type { Parent } from '@swimvault/contracts';
import type { ParentRepository } from './repository.js';
import { validateEmail, validatePasswordStrength } from './auth.js';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** 공개용 Parent (비밀번호 제외). */
function toPublic(p: Parent & { password: string }): Parent {
  const { password: _pw, ...rest } = p;
  return rest;
}

export class AuthService {
  constructor(private readonly repo: ParentRepository) {}

  async register(input: RegisterInput): Promise<{ parent: Parent; token: string }> {
    if (!validateEmail(input.email)) {
      throw new AuthError('INVALID_EMAIL', 'invalid email');
    }
    const strength = validatePasswordStrength(input.password);
    if (!strength.ok) {
      throw new AuthError('WEAK_PASSWORD', strength.reason ?? 'weak password');
    }
    if (await this.repo.findByEmail(input.email)) {
      throw new AuthError('EMAIL_TAKEN', 'email already registered');
    }

    const parent = {
      id: randomUUID(),
      email: input.email,
      displayName: input.displayName,
      createdAt: new Date().toISOString(),
      // 골격: 평문 저장. 실제 해싱은 M1.
      password: input.password,
    };
    await this.repo.save(parent);
    // 골격 토큰 = parentId. 실제 JWT 서명은 M1.
    return { parent: toPublic(parent), token: parent.id };
  }

  async login(input: LoginInput): Promise<{ parent: Parent; token: string }> {
    const found = await this.repo.findByEmail(input.email);
    if (!found || found.password !== input.password) {
      throw new AuthError('INVALID_CREDENTIALS', 'invalid email or password');
    }
    return { parent: toPublic(found), token: found.id };
  }

  /** 골격 토큰(= parentId)로 본인 조회. 실제 JWT 디코드는 M1. */
  async me(token: string): Promise<Parent> {
    const found = await this.repo.findById(token);
    if (!found) throw new AuthError('UNAUTHORIZED', 'invalid token');
    return toPublic(found);
  }
}
