/**
 * 포트폴리오 API 클라이언트.
 *
 * 게이트웨이(api-gateway)가 실제 프록시되기 전까지는 시드(mock)로 동작하고,
 * VITE_USE_MOCK=false 면 실서버(VITE_API_BASE)에서 조립한다. 화면 코드는
 * 이 인터페이스만 의존하므로, 백엔드가 붙으면 여기만 바꾸면 된다.
 *
 * 추적(P/운영): 모든 요청에 x-request-id를 실어 게이트웨이 로그와 이어지게 한다.
 */
import type { PortfolioBundle } from '../types';
import { SEED } from '../data/seed';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

function newRequestId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

/** 게이트웨이를 통한 fetch — x-request-id 자동 부여. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('x-request-id')) headers.set('x-request-id', newRequestId());
  headers.set('content-type', 'application/json');
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/** 선수 1명의 포트폴리오 묶음을 가져온다. */
export async function getPortfolio(athleteId: string): Promise<PortfolioBundle> {
  if (USE_MOCK) {
    // 네트워크 지연 흉내(로딩 상태 검증용) 없이 즉시 반환.
    return structuredClone(SEED);
  }
  // 실서버 조립: 여러 서비스 응답을 PortfolioBundle로 합친다.
  const [athlete, races, gamification] = await Promise.all([
    apiFetch(`/api/athletes/${athleteId}`).then((r) => r.json()),
    apiFetch(`/api/records/athletes/${athleteId}`).then((r) => r.json()),
    apiFetch(`/api/gamification/athletes/${athleteId}`).then((r) => r.json()),
  ]);
  // meets/standards/family는 후속 엔드포인트 연동 전까지 시드로 보강.
  return {
    ...SEED,
    athlete: athlete ?? SEED.athlete,
    races: Array.isArray(races) && races.length ? races : SEED.races,
    gamification: gamification ?? SEED.gamification,
  };
}
