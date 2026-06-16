/**
 * 인증 순수 로직 (테스트 핵심).
 * 실제 비밀번호 해싱·JWT 서명/검증은 골격 이후(M1).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 이메일 형식 검증. */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  return EMAIL_RE.test(email.trim());
}

/** 비밀번호 강도 검증. 골격 규칙: 최소 8자. */
export function validatePasswordStrength(
  pw: string,
): { ok: boolean; reason?: string } {
  if (typeof pw !== 'string' || pw.length < 8) {
    return { ok: false, reason: 'password must be at least 8 characters' };
  }
  return { ok: true };
}
