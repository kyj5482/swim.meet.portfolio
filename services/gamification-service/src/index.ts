import express from 'express';
import { buildRouter } from './routes.js';
import { GamificationService } from './service.js';
import { InMemoryGamificationRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new GamificationService(new InMemoryGamificationRepository());
app.use('/api/gamification', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gamification' }));

const port = Number(process.env.PORT ?? 8088);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[gamification-service] listening on :${port}`));
}

export { app };
