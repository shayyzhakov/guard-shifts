import express, { Request, Response } from 'express';
import {
  buildGuardList,
  commitGuardLists,
  getGuardListHistory,
  parseGuardLists,
} from '../controllers/guardList.controller';

const router = express.Router();

router.post('/generate', (req: Request, res: Response) => {
  try {
    const { startPeriod, duration } = req.body;
    const guardLists = buildGuardList({ startPeriod, duration });
    return res.json({ guardLists });
  } catch (e: unknown) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to generate guard lists' });
  }
});

router.post('/commit', (req: Request, res: Response) => {
  try {
    const { guardLists } = req.body;
    const parsedGuardLists = parseGuardLists(guardLists);
    commitGuardLists(parsedGuardLists);
    return res.json({ message: 'guard lists committed successfully' });
  } catch (e: unknown) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to commit guard lists' });
  }
});

router.get('/history', (req: Request, res: Response) => {
  try {
    const guardLists = getGuardListHistory();
    return res.json({ guardLists });
  } catch (e: unknown) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get guard lists' });
  }
});

export default router;
