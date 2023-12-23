import express, { Request, Response } from 'express';
import { getTeams } from '../controllers/teams.controller';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const teams = getTeams();
    return res.json({ teams });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get teams' });
  }
});

router.put('/:team_id', (req: Request, res: Response) => {
  try {
    const id = req.params.team_id;

    // const teams = getTeams();
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to update team' });
  }
});

export default router;
