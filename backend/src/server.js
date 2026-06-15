import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
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
import { requestMonitoring } from './middleware/requestMonitoring.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
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

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`MyIndianStartup backend running on port ${env.PORT}`);
});
