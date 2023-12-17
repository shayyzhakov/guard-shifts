import express, { Request, Response } from 'express';
import { getTeams } from '../controllers/teams.controller';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const teams = getTeams();
    return res.json({ teams });
  } catch (e: unknown) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get teams' });
  }
});

export default router;
