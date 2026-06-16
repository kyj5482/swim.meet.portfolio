import { Router } from 'express';
import { z } from 'zod';
import { AuthError, AuthService } from './service.js';

const registerSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  displayName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

function bearerToken(header?: string): string | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return null;
  const token = trimmed.slice(7).trim();
  return token.length > 0 ? token : null;
}

export function buildRouter(service: AuthService): Router {
  const router = Router();

  router.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    try {
      const result = await service.register(parsed.data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(400).json({ error: { code: err.code, message: err.message } });
      }
      throw err;
    }
  });

  router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({ error: { code: 'INVALID_INPUT', message: parsed.error.message } });
    }
    try {
      const result = await service.login(parsed.data);
      res.json(result);
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(401).json({ error: { code: err.code, message: err.message } });
      }
      throw err;
    }
  });

  router.get('/me', async (req, res) => {
    const token = bearerToken(req.headers.authorization);
    if (!token) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'bearer token required' } });
    }
    try {
      res.json(await service.me(token));
    } catch (err) {
      if (err instanceof AuthError) {
        return res.status(401).json({ error: { code: err.code, message: err.message } });
      }
      throw err;
    }
  });

  return router;
}
