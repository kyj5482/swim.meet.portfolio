import { Router } from 'express';
import { z } from 'zod';
import { RecordsService } from './service.js';

const createSchema = z.object({
  athleteId: z.string().min(1),
  meetId: z.string().min(1),
  stroke: z.enum(['FR', 'BK', 'BR', 'FL', 'IM']),
  distance: z.number().positive(),
  course: z.enum(['SCY', 'SCM', 'LCM']),
  timeMs: z.number().int().positive(),
  place: z.number().int().positive().optional(),
  sourceJobId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export function buildRouter(service: RecordsService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    const record = await service.addRecord(parsed.data);
    res.status(201).json(record);
  });

  router.get('/athletes/:id', async (req, res) => {
    res.json(await service.listByAthlete(req.params.id));
  });

  router.get('/athletes/:id/pb', async (req, res) => {
    res.json(await service.personalBests(req.params.id));
  });

  return router;
}
