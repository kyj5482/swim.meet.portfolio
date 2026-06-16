import { Router } from 'express';
import { z } from 'zod';
import { IngestionService, NotFoundError } from './service.js';

// 골격: 멀티파트 대신 JSON {athleteId, filename} 수신. 실제 파일 업로드는 M1.
const createSchema = z.object({
  athleteId: z.string().min(1),
  filename: z.string().min(1),
});

export function buildRouter(service: IngestionService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    try {
      const job = await service.createJob(parsed.data);
      res.status(201).json(job);
    } catch (err) {
      // 미지원 확장자
      return res.status(422).json({
        error: {
          code: 'UNSUPPORTED_SOURCE',
          message: err instanceof Error ? err.message : 'unsupported source',
        },
      });
    }
  });

  router.get('/jobs/:id', async (req, res) => {
    try {
      res.json(await service.getJob(req.params.id));
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.status(404).json({ error: { code: err.code, message: err.message } });
      }
      throw err;
    }
  });

  return router;
}
