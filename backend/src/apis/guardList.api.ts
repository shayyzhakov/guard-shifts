import express, { Request, Response } from 'express';
import { buildGuardList, getGuardListHistory } from '../controllers/guardList.controller';

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
