import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get XP and level
router.get('/xp', async (_req: Request, res: Response) => {
  try {
    let xp = await prisma.userXP.findFirst();
    if (!xp) {
      xp = await prisma.userXP.create({ data: {} });
    }
    res.json(xp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch XP' });
  }
});

// Add XP (called after completing tasks)
router.post('/xp/add', async (req: Request, res: Response) => {
  try {
    const { amount, reason } = req.body;
    let xp = await prisma.userXP.findFirst();
    if (!xp) {
      xp = await prisma.userXP.create({ data: {} });
    }

    const newTotal = xp.totalXP + (amount || 10);
    // Level formula: level = floor(sqrt(totalXP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(newTotal / 100)) + 1;

    const today = new Date().toISOString().split('T')[0];
    let newStreak = xp.currentStreak;

    if (xp.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (xp.lastActiveDate === yesterdayStr) {
        newStreak = xp.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    }

    const updated = await prisma.userXP.update({
      where: { id: xp.id },
      data: {
        totalXP: newTotal,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(xp.longestStreak, newStreak),
        lastActiveDate: today,
      },
    });

    // Check for achievements
    await checkAchievements(newTotal, newLevel, newStreak);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

// Get all achievements
router.get('/achievements', async (_req: Request, res: Response) => {
  try {
    let achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    if (achievements.length === 0) {
      const defaultAchievements = [
        { name: 'First Steps', description: 'Reach 10 XP', category: 'milestone', xpReward: 10 },
        { name: 'Centurion', description: 'Reach 100 XP', category: 'milestone', xpReward: 50 },
        { name: 'XP Hunter', description: 'Reach 500 XP', category: 'milestone', xpReward: 100 },
        { name: 'XP Master', description: 'Reach 1000 XP', category: 'milestone', xpReward: 200 },
        { name: 'Level 5', description: 'Reach Level 5', category: 'milestone', xpReward: 50 },
        { name: 'Level 10', description: 'Reach Level 10', category: 'milestone', xpReward: 100 },
        { name: 'Week Warrior', description: 'Achieve a 7-day streak', category: 'streak', xpReward: 50 },
        { name: 'Month Master', description: 'Achieve a 30-day streak', category: 'streak', xpReward: 200 },
        { name: 'Consistency King', description: 'Achieve a 60-day streak', category: 'streak', xpReward: 500 },
      ];
      
      await prisma.achievement.createMany({
        data: defaultAchievements
      });
      
      achievements = await prisma.achievement.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Helper to check and unlock achievements
async function checkAchievements(totalXP: number, level: number, streak: number) {
  const checks = [
    { name: 'First Steps', condition: totalXP >= 10, category: 'milestone' },
    { name: 'Centurion', condition: totalXP >= 100, category: 'milestone' },
    { name: 'XP Hunter', condition: totalXP >= 500, category: 'milestone' },
    { name: 'XP Master', condition: totalXP >= 1000, category: 'milestone' },
    { name: 'Level 5', condition: level >= 5, category: 'milestone' },
    { name: 'Level 10', condition: level >= 10, category: 'milestone' },
    { name: 'Week Warrior', condition: streak >= 7, category: 'streak' },
    { name: 'Month Master', condition: streak >= 30, category: 'streak' },
    { name: 'Consistency King', condition: streak >= 60, category: 'streak' },
  ];

  for (const check of checks) {
    if (check.condition) {
      const existing = await prisma.achievement.findFirst({
        where: { name: check.name },
      });
      if (existing && !existing.unlocked) {
        await prisma.achievement.update({
          where: { id: existing.id },
          data: { unlocked: true, unlockedAt: new Date() },
        });
      }
    }
  }
}

export default router;
