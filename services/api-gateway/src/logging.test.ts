import { requestId, REQUEST_ID_HEADER } from './logging.js';

function mockReqRes(incoming?: string) {
  const headers: Record<string, string> = {};
  const req = {
    header: (k: string) => (k === REQUEST_ID_HEADER ? incoming : undefined),
  } as any;
  const res = {
    setHeader: (k: string, v: string) => {
      headers[k] = v;
    },
  } as any;
  return { req, res, headers };
}

describe('requestId 미들웨어', () => {
  it('들어온 x-request-id를 이어받는다', () => {
    const { req, res, headers } = mockReqRes('abc-123');
    requestId(req, res, () => {});
    expect(req.requestId).toBe('abc-123');
    expect(headers[REQUEST_ID_HEADER]).toBe('abc-123');
  });

  it('없으면 새 ID를 발급하고 응답 헤더에 반영', () => {
    const { req, res, headers } = mockReqRes(undefined);
    requestId(req, res, () => {});
    expect(req.requestId).toMatch(/[0-9a-f-]{36}/);
    expect(headers[REQUEST_ID_HEADER]).toBe(req.requestId);
  });

  it('공백 ID는 새로 발급', () => {
    const { req } = mockReqRes('   ');
    requestId(req, { setHeader: () => {} } as any, () => {});
    expect(req.requestId.length).toBeGreaterThan(10);
  });
});
