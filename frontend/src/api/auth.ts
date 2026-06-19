/** 인증 클라이언트 — auth-service(/api/auth). mock 기본, 실서버 전환 가능. */
import { USE_MOCK, apiFetch } from './config';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

function mockUserFromEmail(email: string, displayName?: string): AuthResult {
  const id = `u-${email.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'demo'}`;
  return {
    token: `mock.${id}.${Date.now()}`,
    user: { id, email, displayName: displayName ?? email.split('@')[0] },
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) {
    if (!email || !password) throw new Error('NEED_FIELDS');
    return mockUserFromEmail(email);
  }
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('AUTH_FAILED');
  const data = await res.json();
  return { token: data.token, user: data.parent ?? data.user };
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  if (USE_MOCK) {
    if (!email || !password || !displayName) throw new Error('NEED_FIELDS');
    return mockUserFromEmail(email, displayName);
  }
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
  if (!res.ok) throw new Error('AUTH_FAILED');
  const data = await res.json();
  return { token: data.token, user: data.parent ?? data.user };
}
