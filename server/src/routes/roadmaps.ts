import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { getInitialRoadmaps } from '../utils/roadmapData';

const router = Router();

// Get roadmap items by roadmap name
router.get('/:name', async (req: Request, res: Response) => {
  try {
    let items = await prisma.roadmapItem.findMany({
      where: { roadmap: req.params.name },
      orderBy: { order: 'asc' },
    });

    if (items.length === 0) {
      const allRoadmapData = getInitialRoadmaps();
      // Filter for this specific roadmap (though we might just populate all of them to be safe)
      // Actually, let's just populate all of them if ANY is missing to avoid multiple calls.
      const existingCount = await prisma.roadmapItem.count();
      if (existingCount === 0) {
        await prisma.roadmapItem.createMany({ data: allRoadmapData });
        items = await prisma.roadmapItem.findMany({
          where: { roadmap: req.params.name },
          orderBy: { order: 'asc' },
        });
      }
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
});

// Toggle roadmap item completion
router.put('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const item = await prisma.roadmapItem.findUnique({
      where: { id: req.params.id },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const updated = await prisma.roadmapItem.update({
      where: { id: req.params.id },
      data: { completed: !item.completed },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle item' });
  }
});

// Update roadmap item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await prisma.roadmapItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Get progress for all roadmaps
router.get('/progress/all', async (_req: Request, res: Response) => {
  try {
    let roadmaps = await prisma.roadmapItem.groupBy({
      by: ['roadmap'],
      _count: { id: true },
    });

    if (roadmaps.length === 0) {
      const allRoadmapData = getInitialRoadmaps();
      await prisma.roadmapItem.createMany({ data: allRoadmapData });
      roadmaps = await prisma.roadmapItem.groupBy({
        by: ['roadmap'],
        _count: { id: true },
      });
    }

    const progress = await Promise.all(
      roadmaps.map(async (r: any) => {
        const completed = await prisma.roadmapItem.count({
          where: { roadmap: r.roadmap, completed: true },
        });
        const totalHours = await prisma.roadmapItem.aggregate({
          where: { roadmap: r.roadmap },
          _sum: { estimatedHours: true },
        });
        return {
          roadmap: r.roadmap,
          total: r._count.id,
          completed,
          percentage: Math.round((completed / r._count.id) * 100),
          estimatedHours: totalHours._sum.estimatedHours || 0,
        };
      })
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Create roadmap item
router.post('/', async (req: Request, res: Response) => {
  try {
    const item = await prisma.roadmapItem.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Delete roadmap item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.roadmapItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
