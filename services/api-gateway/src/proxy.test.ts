import { resolveTarget, verifyBearer } from './proxy.js';

describe('resolveTarget', () => {
  const cases: Array<[string, string]> = [
    ['/api/auth', 'auth-service'],
    ['/api/athletes', 'athlete-service'],
    ['/api/uploads', 'ingestion-service'],
    ['/api/extraction', 'extraction-service'],
    ['/api/records', 'records-service'],
    ['/api/standards', 'standards-service'],
    ['/api/analytics', 'analytics-service'],
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
