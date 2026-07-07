import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: { appliedDate: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const application = await prisma.jobApplication.create({ data: req.body });
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const application = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.jobApplication.delete({ where: { id: req.params.id } });
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Get pipeline stats
router.get('/stats/pipeline', async (_req: Request, res: Response) => {
  try {
    const pipeline = await prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const total = await prisma.jobApplication.count();
    const offers = await prisma.jobApplication.count({ where: { offer: true } });
    const rejected = await prisma.jobApplication.count({ where: { rejected: true } });

    res.json({ pipeline, total, offers, rejected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
