import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsService } from './service.js';

const athleteIdSchema = z.object({ id: z.string().min(1) });
const splitsParamsSchema = z.object({
  id: z.string().min(1),
  raceId: z.string().min(1),
});

export function buildRouter(service: AnalyticsService): Router {
  const router = Router();

  router.get('/athletes/:id/progress', async (req, res) => {
    const parsed = athleteIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    res.json(await service.progress(parsed.data.id));
  });

  router.get('/athletes/:id/splits/:raceId', async (req, res) => {
    const parsed = splitsParamsSchema.safeParse(req.params);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    res.json(await service.splits(parsed.data.raceId));
  });

  return router;
}
