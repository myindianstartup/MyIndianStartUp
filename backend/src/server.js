import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, frontendOrigins } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { mediaRouter } from './routes/media.js';
import { membersRouter } from './routes/members.js';
import { messagesRouter } from './routes/messages.js';
import { postsRouter } from './routes/posts.js';
import { profilesRouter } from './routes/profiles.js';
import { searchRouter } from './routes/search.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { adminRouter } from './routes/admin.js';
import { analyticsRouter } from './routes/analytics.js';
import { contactRouter } from './routes/contact.js';
import { publicRouter } from './routes/public.js';
import { requestMonitoring } from './middleware/requestMonitoring.js';

export const app = express();

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || frontendOrigins.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestMonitoring);

app.use('/health', healthRouter);
app.use('/api/media', mediaRouter);
app.use('/api/members', membersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/search', searchRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/public', publicRouter);

// Root route — friendly status for browser visits
app.get('/', (_req, res) => {
  res.json({
    name: 'MyIndianStartup API',
    status: 'online',
    version: '0.1.0',
    health: '/health'
  });
});

app.use(notFound);
app.use(errorHandler);


if (process.env.VERCEL !== '1') {
  app.listen(env.PORT, () => {
    console.log(`MyIndianStartup backend running on port ${env.PORT}`);
  });
}

export default app;
