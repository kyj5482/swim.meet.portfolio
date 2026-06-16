import { Router } from 'express';
import { z } from 'zod';
import { AthleteService, ForbiddenError, NotFoundError } from './service.js';

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().min(1),
  gender: z.enum(['M', 'F', 'X']),
  clubs: z.array(z.string()).optional(),
  countryCodes: z.array(z.string()).optional(),
});

const patchSchema = createSchema.partial();

/**
 * 골격: parentId는 `x-parent-id` 헤더에서 읽는다(스텁).
 * 실제로는 게이트웨이가 검증한 JWT에서 주입(M1).
 */
function parentId(req: { headers: Record<string, unknown> }): string | null {
  const v = req.headers['x-parent-id'];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function handleError(res: import('express').Response, err: unknown): void {
  if (err instanceof ForbiddenError) {
    res.status(403).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: { code: err.code, message: err.message } });
    return;
  }
  throw err;
}

export function buildRouter(service: AthleteService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const pid = parentId(req);
    if (!pid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'x-parent-id required' } });
    }
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    res.status(201).json(await service.create(pid, parsed.data));
  });

  router.get('/', async (req, res) => {
    const pid = parentId(req);
    if (!pid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'x-parent-id required' } });
    }
    res.json(await service.list(pid));
  });

  router.get('/:id', async (req, res) => {
    const pid = parentId(req);
    if (!pid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'x-parent-id required' } });
    }
    try {
      res.json(await service.get(pid, req.params.id));
    } catch (err) {
      handleError(res, err);
    }
  });

  router.patch('/:id', async (req, res) => {
    const pid = parentId(req);
    if (!pid) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'x-parent-id required' } });
    }
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    try {
      res.json(await service.update(pid, req.params.id, parsed.data));
    } catch (err) {
      handleError(res, err);
    }
  });

  return router;
}
