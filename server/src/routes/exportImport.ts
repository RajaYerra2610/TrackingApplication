import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import ExcelJS from 'exceljs';

const router = Router();

// Export a table as JSON
router.get('/json/:table', async (req: Request, res: Response) => {
  try {
    const { table } = req.params;
    let data: any;

    switch (table) {
      case 'daily': data = await prisma.dailyTracker.findMany(); break;
      case 'dsa': data = await prisma.dSAProblem.findMany(); break;
      case 'concepts': data = await prisma.concept.findMany(); break;
      case 'roadmaps': data = await prisma.roadmapItem.findMany(); break;
      case 'revisions': data = await prisma.revisionSchedule.findMany(); break;
      case 'mock-interviews': data = await prisma.mockInterview.findMany(); break;
      case 'jobs': data = await prisma.jobApplication.findMany(); break;
      case 'resumes': data = await prisma.resumeVersion.findMany(); break;
      case 'github': data = await prisma.githubProject.findMany(); break;
      default: return res.status(400).json({ error: 'Invalid table name' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export as Excel
router.get('/excel/:table', async (req: Request, res: Response) => {
  try {
    const { table } = req.params;
    let data: any[];
    let sheetName: string;

    switch (table) {
      case 'daily':
        data = await prisma.dailyTracker.findMany();
        sheetName = 'Daily Tracker';
        break;
      case 'dsa':
        data = await prisma.dSAProblem.findMany();
        sheetName = 'DSA Problems';
        break;
      case 'concepts':
        data = await prisma.concept.findMany();
        sheetName = 'Concepts';
        break;
      case 'jobs':
        data = await prisma.jobApplication.findMany();
        sheetName = 'Job Applications';
        break;
      case 'mock-interviews':
        data = await prisma.mockInterview.findMany();
        sheetName = 'Mock Interviews';
        break;
      default:
        return res.status(400).json({ error: 'Invalid table name' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      // Add headers
      const headers = Object.keys(data[0]).filter(k => k !== 'createdAt' && k !== 'updatedAt');
      worksheet.addRow(headers);

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF5B8CFF' },
      };

      // Add data rows
      data.forEach(item => {
        const row = headers.map(h => (item as any)[h]);
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        if (column && column.values) {
          let maxLength = 10;
          column.values.forEach(val => {
            if (val) {
              const len = val.toString().length;
              if (len > maxLength) maxLength = Math.min(len, 50);
            }
          });
          column.width = maxLength + 2;
        }
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${table}_export.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Export everything as JSON
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const data = {
      daily: await prisma.dailyTracker.findMany(),
      dsa: await prisma.dSAProblem.findMany(),
      concepts: await prisma.concept.findMany(),
      roadmaps: await prisma.roadmapItem.findMany(),
      revisions: await prisma.revisionSchedule.findMany(),
      mockInterviews: await prisma.mockInterview.findMany(),
      jobs: await prisma.jobApplication.findMany(),
      resumes: await prisma.resumeVersion.findMany(),
      github: await prisma.githubProject.findMany(),
      settings: await prisma.settings.findFirst(),
      xp: await prisma.userXP.findFirst(),
      achievements: await prisma.achievement.findMany(),
    };

    res.setHeader('Content-Disposition', 'attachment; filename=interview_tracker_backup.json');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export all data' });
  }
});

// Import JSON backup
router.post('/import', async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (data.daily?.length) {
      await prisma.dailyTracker.deleteMany();
      await prisma.dailyTracker.createMany({ data: data.daily.map((d: any) => {
        const { createdAt, updatedAt, ...rest } = d;
        return rest;
      })});
    }
    if (data.dsa?.length) {
      await prisma.dSAProblem.deleteMany();
      await prisma.dSAProblem.createMany({ data: data.dsa.map((d: any) => {
        const { createdAt, updatedAt, ...rest } = d;
        return rest;
      })});
    }
    if (data.concepts?.length) {
      await prisma.concept.deleteMany();
      await prisma.concept.createMany({ data: data.concepts.map((d: any) => {
        const { createdAt, updatedAt, ...rest } = d;
        return rest;
      })});
    }
    if (data.jobs?.length) {
      await prisma.jobApplication.deleteMany();
      await prisma.jobApplication.createMany({ data: data.jobs.map((d: any) => {
        const { createdAt, updatedAt, ...rest } = d;
        return rest;
      })});
    }

    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

export default router;
