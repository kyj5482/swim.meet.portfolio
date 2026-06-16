import express from 'express';
import { buildRouter } from './routes.js';
import { StandardsService } from './service.js';
import { InMemoryStandardRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new StandardsService(new InMemoryStandardRepository());
app.use('/api/standards', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'standards' }));

const port = Number(process.env.PORT ?? 8086);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[standards-service] listening on :${port}`));
}

export { app };
