import express from 'express';
import { buildRouter } from './routes.js';
import { FamilyService } from './service.js';
import { InMemoryFamilyRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new FamilyService(new InMemoryFamilyRepository());
app.use('/api/families', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'family' }));

const port = Number(process.env.PORT ?? 8089);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[family-service] listening on :${port}`));
}

export { app };
