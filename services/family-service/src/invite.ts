import { randomBytes } from 'node:crypto';

/** 초대 코드/만료 순수 헬퍼 (테스트 가능하게 분리). */

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

/** 사람이 공유하기 쉬운 8자리 대문자/숫자 코드(혼동 문자 제외). */
export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/O, 1/I 제외
  const bytes = randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

export function expiryFrom(now: Date, ttlMs: number = DEFAULT_TTL_MS): string {
  return new Date(now.getTime() + ttlMs).toISOString();
}

export function isExpired(expiresAt: string, now: Date = new Date()): boolean {
  return now.getTime() > Date.parse(expiresAt);
}
