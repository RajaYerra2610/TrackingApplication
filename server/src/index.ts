import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dailyRoutes from './routes/daily';
import dsaRoutes from './routes/dsa';
import conceptRoutes from './routes/concepts';
import roadmapRoutes from './routes/roadmaps';
import revisionRoutes from './routes/revisions';
import mockInterviewRoutes from './routes/mockInterviews';
import jobRoutes from './routes/jobs';
import resumeRoutes from './routes/resumes';
import githubRoutes from './routes/github';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import notificationRoutes from './routes/notifications';
import exportRoutes from './routes/exportImport';
import gamificationRoutes from './routes/gamification';
import { errorHandler } from './middleware/errorHandler';

import { AsyncLocalStorage } from 'async_hooks';
import authRoutes from './routes/auth';

export const als = new AsyncLocalStorage<{ userId: string }>();

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model === 'User') return query(args);

        const store = als.getStore();
        if (store?.userId) {
           const userId = store.userId;
           if (['findMany', 'findFirst', 'count', 'aggregate', 'groupBy'].includes(operation as string)) {
              args.where = { ...args.where, userId };
           } else if (operation === 'create') {
              args.data = { ...args.data, userId };
           } else if (operation === 'createMany') {
              if (Array.isArray(args.data)) {
                 args.data = args.data.map((d: any) => ({ ...d, userId }));
              }
           }
        }
        return query(args);
      }
    }
  }
}) as any;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth Middleware (AsyncLocalStorage)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/health')) {
    return next();
  }
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header' });
  }
  
  als.run({ userId }, () => {
    next();
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/mock-interviews', mockInterviewRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Ensure default settings exist
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      await prisma.settings.create({
        data: {
          userName: 'Developer',
          startDate: new Date().toISOString().split('T')[0],
        },
      });
    }

    // Ensure UserXP exists
    const xp = await prisma.userXP.findFirst();
    if (!xp) {
      await prisma.userXP.create({ data: {} });
    }

    app.listen(PORT, () => {
      console.log(`🚀 Interview Tracker Pro API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
