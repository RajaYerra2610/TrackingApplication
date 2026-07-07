import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const resumes = await prisma.resumeVersion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const resume = await prisma.resumeVersion.create({ data: req.body });
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const resume = await prisma.resumeVersion.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.resumeVersion.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;
