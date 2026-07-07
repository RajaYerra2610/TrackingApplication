import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all DSA problems
router.get('/', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, status, favorite, bookmark } = req.query;
    const where: any = {};
    if (topic) where.topic = topic as string;
    if (difficulty) where.difficulty = difficulty as string;
    if (status) where.status = status as string;
    if (favorite === 'true') where.favorite = true;
    if (bookmark === 'true') where.bookmark = true;

    const problems = await prisma.dSAProblem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DSA problems' });
  }
});

// Get single problem
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await prisma.dSAProblem.findUnique({
      where: { id: req.params.id },
    });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Create problem
router.post('/', async (req: Request, res: Response) => {
  try {
    const problem = await prisma.dSAProblem.create({ data: req.body });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// Update problem
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await prisma.dSAProblem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// Delete problem
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.dSAProblem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// Bulk import
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { problems } = req.body;
    const created = await prisma.dSAProblem.createMany({ data: problems });
    res.status(201).json({ count: created.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import problems' });
  }
});

// Get stats
router.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const total = await prisma.dSAProblem.count();
    const solved = await prisma.dSAProblem.count({ where: { status: 'Solved' } });
    const easy = await prisma.dSAProblem.count({ where: { difficulty: 'Easy', status: 'Solved' } });
    const medium = await prisma.dSAProblem.count({ where: { difficulty: 'Medium', status: 'Solved' } });
    const hard = await prisma.dSAProblem.count({ where: { difficulty: 'Hard', status: 'Solved' } });

    const topicCounts = await prisma.dSAProblem.groupBy({
      by: ['topic'],
      _count: { id: true },
      where: { status: 'Solved' },
    });

    res.json({ total, solved, easy, medium, hard, topicCounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
