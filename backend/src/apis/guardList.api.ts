import express, { Request, Response } from 'express';
import {
  buildGuardList,
  commitGuardLists,
  getGuardListHistory,
  parseGuardLists,
} from '../controllers/guardList.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const guardLists = await getGuardListHistory();
    return res.json({ guardLists });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get guard lists' });
  }
});

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { startPeriod, duration, constraints } = req.body;
    const guardLists = await buildGuardList({ startPeriod, duration, constraints });

    return res.json({ guardLists });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to generate guard lists' });
  }
});

router.post('/commit', async (req: Request, res: Response) => {
  try {
    const { guardLists, startPeriod } = req.body;

    const parsedGuardLists = parseGuardLists(guardLists);
    await commitGuardLists({ guardLists: parsedGuardLists, startPeriod });

    return res.json({ message: 'guard lists committed successfully' });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to commit guard lists' });
  }
});

export default router;
