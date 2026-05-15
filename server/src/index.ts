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

import cookieParser from 'cookie-parser';
import { prisma } from './config/prisma';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

initSocket(httpServer);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // Allow exact match to CLIENT_URL
      // Allow any Vercel preview URL
      // Allow localhost for development
      if (
        !origin || 
        origin === env.CLIENT_URL || 
        origin.endsWith('.vercel.app') || 
        origin.startsWith('http://localhost:')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
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

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  httpServer.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connections closed.');
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
