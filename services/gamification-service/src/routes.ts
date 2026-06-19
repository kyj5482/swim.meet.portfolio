import { Router } from 'express';
import { z } from 'zod';
import { GamificationService } from './service.js';

const eventSchema = z.object({
  athleteId: z.string().min(1),
  type: z.enum([
    'race_logged',
    'pb_achieved',
    'distance_milestone',
    'stroke_unlocked',
    'streak_day',
  ]),
  at: z.string().datetime().optional(),
  meta: z.record(z.union([z.number(), z.string()])).optional(),
});

const leaderboardSchema = z.object({
  athleteIds: z.array(z.string().min(1)).min(1).max(50),
});

export function buildRouter(service: GamificationService): Router {
  const router = Router();

  router.post('/events', async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    const profile = await service.recordEvent(parsed.data);
    res.status(201).json(profile);
  });

  router.get('/athletes/:id', async (req, res) => {
    res.json(await service.profile(req.params.id));
  });

  router.post('/leaderboard', async (req, res) => {
    const parsed = leaderboardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    res.json(await service.leaderboard(parsed.data.athleteIds));
  });

  return router;
}
