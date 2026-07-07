import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Dashboard analytics
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const settings = await prisma.settings.findFirst();
    const startDate = settings?.startDate || today;
    const targetDays = settings?.targetDays || 90;

    // Calculate days remaining
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + targetDays);
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const daysPassed = targetDays - daysRemaining;

    // Study hours
    const totalHoursResult = await prisma.dailyTracker.aggregate({ _sum: { studyHours: true } });
    const totalHours = totalHoursResult._sum.studyHours || 0;

    // Today's entry
    const todayEntry = await prisma.dailyTracker.findFirst({ where: { date: today } });

    // DSA stats
    const dsaSolved = await prisma.dSAProblem.count({ where: { status: 'Solved' } });
    const dsaTotal = await prisma.dSAProblem.count();

    // Concepts stats
    const conceptsLearned = await prisma.concept.count({ where: { completed: true } });
    const conceptsTotal = await prisma.concept.count();

    // Revision due
    const revisionDue = await prisma.revisionSchedule.count({
      where: { status: 'Pending', revisionDate: { lte: today } },
    });

    // Mock interviews
    const mockCount = await prisma.mockInterview.count();

    // Job applications
    const applicationsCount = await prisma.jobApplication.count();

    // Streak calculation
    const dailyEntries = await prisma.dailyTracker.findMany({
      orderBy: { date: 'desc' },
      select: { date: true, studyHours: true },
    });

    let currentStreak = 0;
    const checkDate = new Date(today);
    for (const entry of dailyEntries) {
      const entryDate = entry.date;
      const expected = checkDate.toISOString().split('T')[0];
      if (entryDate === expected && entry.studyHours > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate < expected) {
        break;
      }
    }

    // Weekly hours (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEntries = await prisma.dailyTracker.findMany({
      where: { date: { gte: weekAgo.toISOString().split('T')[0] } },
      select: { date: true, studyHours: true },
    });
    const weeklyHours = weeklyEntries.reduce((sum: number, e: any) => sum + e.studyHours, 0);

    // Monthly hours
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyEntries = await prisma.dailyTracker.findMany({
      where: { date: { gte: monthAgo.toISOString().split('T')[0] } },
      select: { date: true, studyHours: true },
    });
    const monthlyHours = monthlyEntries.reduce((sum: number, e: any) => sum + e.studyHours, 0);

    // Roadmap progress
    const roadmapTotal = await prisma.roadmapItem.count();
    const roadmapCompleted = await prisma.roadmapItem.count({ where: { completed: true } });

    // Average productivity
    const prodResult = await prisma.dailyTracker.aggregate({ _avg: { productivity: true } });
    const avgProductivity = prodResult._avg.productivity || 5;

    // Consistency (days with study / total days)
    const totalDaysTracked = await prisma.dailyTracker.count({ where: { studyHours: { gt: 0 } } });
    const consistency = daysPassed > 0 ? Math.round((totalDaysTracked / daysPassed) * 100) : 0;

    // Overall progress
    const overallProgress = Math.round(((dsaSolved + conceptsLearned + roadmapCompleted) /
      Math.max(1, dsaTotal + conceptsTotal + roadmapTotal)) * 100);

    // Interview readiness (weighted)
    const interviewReadyConcepts = await prisma.concept.count({ where: { interviewReady: true } });
    const interviewReadiness = Math.round(
      (dsaSolved * 0.3 + interviewReadyConcepts * 0.3 + roadmapCompleted * 0.2 + mockCount * 0.2) /
      Math.max(1, (dsaTotal * 0.3 + conceptsTotal * 0.3 + roadmapTotal * 0.2 + 10 * 0.2)) * 100
    );

    // XP & Level
    const xp = await prisma.userXP.findFirst();

    res.json({
      overallProgress,
      interviewReadiness,
      faangReadiness: Math.round(interviewReadiness * 0.85),
      currentStreak,
      daysRemaining,
      daysPassed,
      targetDays,
      totalHours,
      weeklyHours,
      monthlyHours,
      todayHours: todayEntry?.studyHours || 0,
      dsaSolved,
      dsaTotal,
      conceptsLearned,
      conceptsTotal,
      revisionDue,
      mockInterviews: mockCount,
      applicationsSent: applicationsCount,
      roadmapProgress: roadmapTotal > 0 ? Math.round((roadmapCompleted / roadmapTotal) * 100) : 0,
      consistency,
      avgProductivity: Math.round(avgProductivity * 10) / 10,
      xp: xp?.totalXP || 0,
      level: xp?.level || 1,
      goalHoursPerDay: settings?.goalHoursPerDay || 6,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Weekly chart data
router.get('/weekly', async (_req: Request, res: Response) => {
  try {
    const entries: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = await prisma.dailyTracker.findFirst({ where: { date: dateStr } });
      entries.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        hours: entry?.studyHours || 0,
        problems: entry?.problemsSolved || 0,
        productivity: entry?.productivity || 0,
      });
    }
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly data' });
  }
});

// Monthly chart data
router.get('/monthly', async (_req: Request, res: Response) => {
  try {
    const entries: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = await prisma.dailyTracker.findFirst({ where: { date: dateStr } });
      entries.push({
        date: dateStr,
        hours: entry?.studyHours || 0,
        problems: entry?.problemsSolved || 0,
      });
    }
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
});

// Heatmap data (last 365 days)
router.get('/heatmap', async (_req: Request, res: Response) => {
  try {
    const yearAgo = new Date();
    yearAgo.setDate(yearAgo.getDate() - 365);
    const entries = await prisma.dailyTracker.findMany({
      where: { date: { gte: yearAgo.toISOString().split('T')[0] } },
      select: { date: true, studyHours: true },
      orderBy: { date: 'asc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// Subject progress for radar chart
router.get('/subjects', async (_req: Request, res: Response) => {
  try {
    const subjects = ['JavaScript', 'React', 'Node.js', 'SQL', 'Python', 'Docker', 'System Design', 'DSA'];
    const progress = await Promise.all(
      subjects.map(async (subject) => {
        const total = await prisma.concept.count({ where: { subject } });
        const completed = await prisma.concept.count({ where: { subject, completed: true } });
        return {
          subject,
          total,
          completed,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject progress' });
  }
});

export default router;
