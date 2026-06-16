import express from 'express';
import { buildRouter } from './routes.js';
import { IngestionService } from './service.js';
import { InMemoryJobRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new IngestionService(new InMemoryJobRepository());
app.use('/api/uploads', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ingestion' }));

const port = Number(process.env.PORT ?? 8083);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[ingestion-service] listening on :${port}`));
}

export { app };
