import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all concepts (optionally filter by subject)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject } = req.query;
    const where: any = {};
    if (subject) where.subject = subject as string;

    const concepts = await prisma.concept.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(concepts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch concepts' });
  }
});

// Create concept
router.post('/', async (req: Request, res: Response) => {
  try {
    const concept = await prisma.concept.create({ data: req.body });
    res.status(201).json(concept);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create concept' });
  }
});

// Update concept
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const concept = await prisma.concept.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(concept);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update concept' });
  }
});

// Delete concept
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.concept.delete({ where: { id: req.params.id } });
    res.json({ message: 'Concept deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete concept' });
  }
});

// Get subjects with counts
router.get('/subjects/all', async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.concept.groupBy({
      by: ['subject'],
      _count: { id: true },
    });

    const withCompletion = await Promise.all(
      subjects.map(async (s: any) => {
        const completed = await prisma.concept.count({
          where: { subject: s.subject, completed: true },
        });
        return {
          name: s.subject,
          total: s._count.id,
          completed,
          percentage: Math.round((completed / s._count.id) * 100),
        };
      })
    );

    res.json(withCompletion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

export default router;
