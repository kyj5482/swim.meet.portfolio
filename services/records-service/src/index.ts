import express from 'express';
import { buildRouter } from './routes.js';
import { RecordsService } from './service.js';
import { InMemoryRecordRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new RecordsService(new InMemoryRecordRepository());
app.use('/api/records', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'records' }));

const port = Number(process.env.PORT ?? 8085);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[records-service] listening on :${port}`));
}

export { app };
