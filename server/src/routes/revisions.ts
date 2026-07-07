import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all revisions (filter by status)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const revisions = await prisma.revisionSchedule.findMany({
      where,
      orderBy: { revisionDate: 'asc' },
    });
    res.json(revisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// Get upcoming revisions
router.get('/upcoming', async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const revisions = await prisma.revisionSchedule.findMany({
      where: {
        status: 'Pending',
        revisionDate: { gte: today },
      },
      orderBy: { revisionDate: 'asc' },
      take: 20,
    });
    res.json(revisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming revisions' });
  }
});

// Get missed revisions
router.get('/missed', async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const revisions = await prisma.revisionSchedule.findMany({
      where: {
        status: 'Pending',
        revisionDate: { lt: today },
      },
      orderBy: { revisionDate: 'asc' },
    });

    // Mark them as missed
    if (revisions.length > 0) {
      await prisma.revisionSchedule.updateMany({
        where: {
          status: 'Pending',
          revisionDate: { lt: today },
        },
        data: { status: 'Missed' },
      });
    }

    const missed = await prisma.revisionSchedule.findMany({
      where: { status: 'Missed' },
      orderBy: { revisionDate: 'desc' },
    });
    res.json(missed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missed revisions' });
  }
});

// Mark revision as completed
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const revision = await prisma.revisionSchedule.update({
      where: { id: req.params.id },
      data: { status: 'Completed' },
    });
    res.json(revision);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete revision' });
  }
});

// Create revision schedule for an item
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { itemType, itemId, itemName, originalDate } = req.body;
    const revisionDays = [1, 3, 7, 15, 30];

    const schedules = revisionDays.map((days, index) => {
      const date = new Date(originalDate);
      date.setDate(date.getDate() + days);
      return {
        itemType,
        itemId,
        itemName,
        originalDate,
        revisionDate: date.toISOString().split('T')[0],
        revisionNumber: index + 1,
        status: 'Pending',
      };
    });

    await prisma.revisionSchedule.createMany({ data: schedules });
    res.status(201).json({ message: 'Revision schedule created', count: schedules.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate revision schedule' });
  }
});

// Delete revision
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.revisionSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Revision deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete revision' });
  }
});

export default router;
