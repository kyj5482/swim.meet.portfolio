import express from 'express';
import { buildRouter } from './routes.js';
import { AthleteService } from './service.js';
import { InMemoryAthleteRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new AthleteService(new InMemoryAthleteRepository());
app.use('/api/athletes', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'athlete' }));

const port = Number(process.env.PORT ?? 8082);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[athlete-service] listening on :${port}`));
}

export { app };
