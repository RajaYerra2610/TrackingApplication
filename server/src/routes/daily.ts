import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all daily entries
router.get('/', async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.dailyTracker.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily entries' });
  }
});

// Get single entry
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.dailyTracker.findUnique({
      where: { id: req.params.id },
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Create entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.dailyTracker.create({
      data: req.body,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Update entry
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.dailyTracker.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.dailyTracker.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Search entries
router.get('/search/query', async (req: Request, res: Response) => {
  try {
    const { q, startDate, endDate } = req.query;
    const where: any = {};
    if (startDate && endDate) {
      where.date = { gte: startDate as string, lte: endDate as string };
    }
    if (q) {
      where.OR = [
        { dsaTopic: { contains: q as string } },
        { jsTopic: { contains: q as string } },
        { reactTopic: { contains: q as string } },
        { notes: { contains: q as string } },
      ];
    }
    const entries = await prisma.dailyTracker.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search entries' });
  }
});

export default router;
