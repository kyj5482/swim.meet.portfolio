import { resolveTarget, verifyBearer, buildTargetUrl, forwardHeaders } from './proxy.js';

describe('resolveTarget', () => {
  const cases: Array<[string, string]> = [
    ['/api/auth', 'auth-service'],
    ['/api/athletes', 'athlete-service'],
    ['/api/uploads', 'ingestion-service'],
    ['/api/extraction', 'extraction-service'],
    ['/api/records', 'records-service'],
    ['/api/standards', 'standards-service'],
    ['/api/analytics', 'analytics-service'],
    ['/api/gamification', 'gamification-service'],
    ['/api/families', 'family-service'],
  ];

  it.each(cases)('maps %s → %s', (path, service) => {
    const t = resolveTarget(path);
    expect(t).not.toBeNull();
    expect(t?.service).toBe(service);
    expect(t?.url).toMatch(/^http:\/\//);
  });

  it('matches subpaths', () => {
    expect(resolveTarget('/api/records/athletes/123')?.service).toBe('records-service');
  });

  it('returns null for unknown prefix', () => {
    expect(resolveTarget('/api/unknown')).toBeNull();
    expect(resolveTarget('/')).toBeNull();
  });

  it('honours env override', () => {
    process.env.AUTH_SERVICE_URL = 'http://localhost:9999';
    expect(resolveTarget('/api/auth')?.url).toBe('http://localhost:9999');
    delete process.env.AUTH_SERVICE_URL;
  });
});

describe('verifyBearer', () => {
  it('ok when bearer token present', () => {
    expect(verifyBearer('Bearer abc123').ok).toBe(true);
  });

  it('not ok when absent', () => {
    expect(verifyBearer(undefined).ok).toBe(false);
    expect(verifyBearer('').ok).toBe(false);
  });

  it('not ok when malformed', () => {
    expect(verifyBearer('Basic abc').ok).toBe(false);
    expect(verifyBearer('Bearer ').ok).toBe(false);
  });
});

describe('buildTargetUrl', () => {
  it('베이스 + 원본 경로(쿼리 포함) 조립', () => {
    expect(buildTargetUrl('http://family-service:8089', '/api/families/1?x=2')).toBe(
      'http://family-service:8089/api/families/1?x=2',
    );
  });
  it('베이스 끝 슬래시 중복 제거', () => {
    expect(buildTargetUrl('http://svc:80/', '/api/x')).toBe('http://svc:80/api/x');
  });
});

describe('forwardHeaders', () => {
  it('hop-by-hop 제거 + x-request-id 주입', () => {
    const out = forwardHeaders(
      { host: 'gw', 'content-length': '10', authorization: 'Bearer t', 'content-type': 'application/json' },
      'req-123',
    );
    expect(out.host).toBeUndefined();
    expect(out['content-length']).toBeUndefined();
    expect(out.authorization).toBe('Bearer t');
    expect(out['x-request-id']).toBe('req-123');
  });
  it('배열 헤더는 콤마 결합', () => {
    expect(forwardHeaders({ accept: ['a', 'b'] }, 'r')['accept']).toBe('a, b');
  });
});
