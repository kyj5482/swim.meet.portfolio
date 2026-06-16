import { Router } from 'express';
import { z } from 'zod';
import { StandardsService } from './service.js';

const genderEnum = z.enum(['M', 'F', 'X']);
const strokeEnum = z.enum(['FR', 'BK', 'BR', 'FL', 'IM']);
const courseEnum = z.enum(['SCY', 'SCM', 'LCM']);

const matchSchema = z.object({
  gender: genderEnum,
  age: z.coerce.number().int().nonnegative(),
  stroke: strokeEnum,
  distance: z.coerce.number().positive(),
  course: courseEnum,
});

const customSchema = z.object({
  label: z.string().min(1),
  leagueId: z.string().optional(),
  gender: genderEnum,
  ageMin: z.number().int().nonnegative(),
  ageMax: z.number().int().nonnegative(),
  stroke: strokeEnum,
  distance: z.number().positive(),
  course: courseEnum,
  timeMs: z.number().int().positive(),
});

export function buildRouter(service: StandardsService): Router {
  const router = Router();

  router.get('/match', async (req, res) => {
    const parsed = matchSchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    res.json(await service.match(parsed.data));
  });

  router.post('/custom', async (req, res) => {
    const parsed = customSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    const standard = await service.addCustom(parsed.data);
    res.status(201).json(standard);
  });

  return router;
}
