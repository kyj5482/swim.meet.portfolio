import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * 요청 추적 미들웨어 — 프론트엔드부터 백엔드까지 하나의 ID로 추적.
 *
 * 프론트엔드가 `x-request-id`를 보내면 그대로 이어받고, 없으면 발급한다.
 * 응답 헤더로 되돌려주고, 한 줄 접근 로그를 stdout에 남긴다(run.sh가
 * logs/api-gateway.log로 수집). 게이트웨이는 단일 진입점이므로 여기 로그가
 * 전체 트래픽의 추적 시작점이 된다.
 */
export const REQUEST_ID_HEADER = 'x-request-id';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(REQUEST_ID_HEADER);
  const id = incoming && incoming.trim() ? incoming.trim() : randomUUID();
  (req as Request & { requestId: string }).requestId = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}

export function accessLog(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const id = (req as Request & { requestId?: string }).requestId ?? '-';
  res.on('finish', () => {
    const ms = Date.now() - start;
    // 구조화 한 줄 로그: 다운스트림과 grep 가능한 동일 reqId
    console.log(
      JSON.stringify({
        t: new Date().toISOString(),
        svc: 'api-gateway',
        reqId: id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms,
      }),
    );
  });
  next();
}
