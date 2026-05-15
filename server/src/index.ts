import 'dotenv/config';
import { env } from './config/env';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { initSocket } from './config/socket';
import { globalErrorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './modules/auth/auth.routes';
import pollRoutes from './modules/polls/polls.routes';
import responseRoutes from './modules/responses/responses.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(globalErrorHandler);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 PollStar server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
