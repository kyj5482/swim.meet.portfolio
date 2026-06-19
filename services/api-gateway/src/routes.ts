import { Router } from 'express';
import { resolveTarget, verifyBearer, forward } from './proxy.js';

/** 인증이 필요 없는 공개 프리픽스. */
const PUBLIC_PREFIXES = ['/api/auth'];

function isPublic(path: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function buildRouter(): Router {
  const router = Router();

  // 캐치올: 해석된 업스트림으로 실제 프록시 전달.
  router.all('*', async (req, res) => {
    const target = resolveTarget(req.path);
    if (!target) {
      return res
        .status(404)
        .json({ error: { code: 'NO_ROUTE', message: `no upstream for ${req.path}` } });
    }

    if (!isPublic(req.path) && !verifyBearer(req.headers.authorization).ok) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'bearer token required' } });
    }

    await forward(target, req, res);
  });

  return router;
}
