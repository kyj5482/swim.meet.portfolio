import { Router } from 'express';
import { z } from 'zod';
import { FamilyService, FamilyError } from './service.js';

const createSchema = z.object({
  name: z.string().min(1).max(80),
  createdBy: z.string().min(1),
});
const addAthleteSchema = z.object({ athleteId: z.string().min(1) });
const inviteSchema = z.object({ role: z.enum(['guardian', 'swimmer']) });
const acceptSchema = z.object({
  userId: z.string().min(1),
  athleteId: z.string().min(1).optional(),
});

function invalid(res: import('express').Response, message: string) {
  return res.status(422).json({ error: { code: 'INVALID_INPUT', message } });
}

/** FamilyError → HTTP 상태 매핑. */
function handleError(res: import('express').Response, err: unknown) {
  if (err instanceof FamilyError) {
    const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'INVALID_INVITE' ? 404 : 409;
    return res.status(status).json({ error: { code: err.code, message: err.message } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'unexpected error' } });
}

export function buildRouter(service: FamilyService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed.error.message);
    const family = await service.createFamily(parsed.data.name, parsed.data.createdBy);
    res.status(201).json(family);
  });

  router.get('/', async (req, res) => {
    const userId = req.query.userId;
    if (typeof userId !== 'string') return invalid(res, 'userId query required');
    res.json(await service.listForUser(userId));
  });

  router.get('/:id', async (req, res) => {
    try {
      res.json(await service.getFamily(req.params.id));
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post('/:id/athletes', async (req, res) => {
    const parsed = addAthleteSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed.error.message);
    try {
      res.status(201).json(await service.addAthlete(req.params.id, parsed.data.athleteId));
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post('/:id/invites', async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed.error.message);
    try {
      res.status(201).json(await service.createInvite(req.params.id, parsed.data.role));
    } catch (err) {
      handleError(res, err);
    }
  });

  router.post('/invites/:code/accept', async (req, res) => {
    const parsed = acceptSchema.safeParse(req.body);
    if (!parsed.success) return invalid(res, parsed.error.message);
    try {
      const family = await service.acceptInvite(
        req.params.code,
        parsed.data.userId,
        parsed.data.athleteId,
      );
      res.json(family);
    } catch (err) {
      handleError(res, err);
    }
  });

  return router;
}
