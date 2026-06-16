import express from 'express';
import { buildRouter } from './routes.js';
import { AnalyticsService } from './service.js';
import { InMemoryAnalyticsRepository } from './repository.js';

const app = express();
app.use(express.json());

const service = new AnalyticsService(new InMemoryAnalyticsRepository());
app.use('/api/analytics', buildRouter(service));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'analytics' }));

const port = Number(process.env.PORT ?? 8087);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[analytics-service] listening on :${port}`));
}

export { app };
