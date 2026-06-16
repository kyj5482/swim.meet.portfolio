import express from 'express';
import { buildRouter } from './routes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.use('/', buildRouter());

const port = Number(process.env.PORT ?? 8080);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[api-gateway] listening on :${port}`));
}

export { app };
