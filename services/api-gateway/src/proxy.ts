/**
 * 경로 프리픽스 → 업스트림 서비스 매핑 (순수 로직, 테스트 핵심).
 * 실제 프록시 전달은 골격에 포함하지 않는다(스텁).
 */

export interface ResolvedTarget {
  service: string;
  url: string;
}

interface Route {
  prefix: string;
  service: string;
  url: () => string;
}

const ROUTES: Route[] = [
  {
    prefix: '/api/auth',
    service: 'auth-service',
    url: () => process.env.AUTH_SERVICE_URL ?? 'http://auth-service:8081',
  },
  {
    prefix: '/api/athletes',
    service: 'athlete-service',
    url: () => process.env.ATHLETE_SERVICE_URL ?? 'http://athlete-service:8082',
  },
  {
    prefix: '/api/uploads',
    service: 'ingestion-service',
    url: () => process.env.INGESTION_SERVICE_URL ?? 'http://ingestion-service:8083',
  },
  {
    prefix: '/api/extraction',
    service: 'extraction-service',
    url: () => process.env.EXTRACTION_SERVICE_URL ?? 'http://extraction-service:8084',
  },
  {
    prefix: '/api/records',
    service: 'records-service',
    url: () => process.env.RECORDS_SERVICE_URL ?? 'http://records-service:8085',
  },
  {
    prefix: '/api/standards',
    service: 'standards-service',
    url: () => process.env.STANDARDS_SERVICE_URL ?? 'http://standards-service:8086',
  },
  {
    prefix: '/api/analytics',
    service: 'analytics-service',
    url: () => process.env.ANALYTICS_SERVICE_URL ?? 'http://analytics-service:8087',
  },
];

/** 경로 프리픽스를 업스트림 대상으로 해석. 매칭 없으면 null. */
export function resolveTarget(path: string): ResolvedTarget | null {
  const route = ROUTES.find(
    (r) => path === r.prefix || path.startsWith(`${r.prefix}/`),
  );
  if (!route) return null;
  return { service: route.service, url: route.url() };
}

/** Bearer 토큰 존재 여부만 확인(스텁). 실제 JWT 검증은 M1. */
export function verifyBearer(header?: string): { ok: boolean } {
  if (!header) return { ok: false };
  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return { ok: false };
  const token = trimmed.slice(7).trim();
  return { ok: token.length > 0 };
}
