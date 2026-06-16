import express from 'express';
import { buildRouter } from './routes.js';
import { AuthService } from './service.js';
import { InMemoryParentRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new AuthService(new InMemoryParentRepository());
app.use('/api/auth', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth' }));

const port = Number(process.env.PORT ?? 8081);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[auth-service] listening on :${port}`));
}

export { app };
