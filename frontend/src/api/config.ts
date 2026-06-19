/**
 * API 공통 설정 — 게이트웨이 베이스 / mock 토글 / 추적 ID 부여.
 * 게이트웨이 실프록시가 붙기 전까지 mock으로 자립 동작하고, VITE_USE_MOCK=false면 실서버.
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

export function newRequestId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

/** 게이트웨이를 통한 fetch — x-request-id 자동 부여(프론트→백엔드 추적). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('x-request-id')) headers.set('x-request-id', newRequestId());
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  const token = globalThis.localStorage?.getItem('swimvault.token');
  if (token && !headers.has('authorization')) headers.set('authorization', `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
