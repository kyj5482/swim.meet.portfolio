import express from 'express';
import { buildRouter } from './routes.js';
import { requestId, accessLog } from './logging.js';

const app = express();
app.use(express.json());
app.use(requestId); // 프론트→백엔드 추적 ID 부여/전파
app.use(accessLog); // 구조화 접근 로그(logs/api-gateway.log)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.use('/', buildRouter());

const port = Number(process.env.PORT ?? 8080);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`[api-gateway] listening on :${port}`));
}

export { app };
