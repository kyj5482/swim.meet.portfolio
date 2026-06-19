/**
 * 경로 프리픽스 → 업스트림 서비스 매핑(순수) + 실제 프록시 전달.
 * 게이트웨이는 단일 진입점이므로 x-request-id를 다운스트림으로 전파해 추적을 잇는다.
 */
import type { Request, Response } from 'express';

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
  {
    prefix: '/api/gamification',
    service: 'gamification-service',
    url: () => process.env.GAMIFICATION_SERVICE_URL ?? 'http://gamification-service:8088',
  },
  {
    prefix: '/api/families',
    service: 'family-service',
    url: () => process.env.FAMILY_SERVICE_URL ?? 'http://family-service:8089',
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

/** baseUrl + 원본 경로(쿼리 포함)로 업스트림 URL 조립. */
export function buildTargetUrl(baseUrl: string, originalUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}${originalUrl}`;
}

/** 프록시 시 제거할 hop-by-hop 헤더(RFC 7230). content-length는 fetch가 재계산. */
const HOP_BY_HOP = new Set([
  'host', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length',
]);

/** 다운스트림으로 전달할 헤더 — hop-by-hop 제거 + x-request-id 강제 주입(추적 전파). */
export function forwardHeaders(
  raw: Record<string, string | string[] | undefined>,
  requestId: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === undefined || HOP_BY_HOP.has(k.toLowerCase())) continue;
    out[k] = Array.isArray(v) ? v.join(', ') : v;
  }
  out['x-request-id'] = requestId;
  return out;
}

/**
 * 요청을 업스트림으로 전달하고 응답을 그대로 반환.
 * JSON 본문만 재직렬화(우리 API는 JSON). 멀티파트 업로드 프록시는 후속 과제.
 * 업스트림 도달 실패 시 502.
 */
export async function forward(
  target: ResolvedTarget,
  req: Request,
  res: Response,
): Promise<void> {
  const url = buildTargetUrl(target.url, req.originalUrl);
  const requestId = (req as Request & { requestId?: string }).requestId ?? '';
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const isJson = (req.headers['content-type'] ?? '').includes('application/json');
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: forwardHeaders(req.headers, requestId),
      body: hasBody && isJson ? JSON.stringify(req.body ?? {}) : undefined,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.set('content-type', ct);
    res.send(text);
  } catch {
    res
      .status(502)
      .json({ error: { code: 'BAD_GATEWAY', message: `upstream ${target.service} unreachable` } });
  }
}
