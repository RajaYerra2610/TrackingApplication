import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const interviews = await prisma.mockInterview.findMany({ orderBy: { date: 'desc' } });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mock interviews' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const interview = await prisma.mockInterview.create({ data: req.body });
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mock interview' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const interview = await prisma.mockInterview.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mock interview' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.mockInterview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mock interview' });
  }
});

export default router;
