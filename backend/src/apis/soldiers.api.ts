import express, { Request, Response } from 'express';
import { getAllSoldiers } from '../models/soldier.model';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const soldiers = getAllSoldiers();
    return res.json({ soldiers });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get soldiers' });
  }
});

export default router;
