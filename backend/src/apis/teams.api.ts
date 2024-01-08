import express, { Request, Response } from 'express';
import { createNewTeam, deleteTeam, getTeams, updateTeam } from '../controllers/teams.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await getTeams();
    return res.json({ teams });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get teams' });
  }
});

router.put('/:team_id', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.team_id;
    const { name, people, guardPosts } = req.body;

    await updateTeam(teamId, { name, people, guardPosts });
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to update team' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, people, guardPosts } = req.body;

    await createNewTeam({ name, people, guardPosts });
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to create a new team' });
  }
});

router.delete('/:team_id', async (req: Request, res: Response) => {
  try {
    const teamId = req.params.team_id;

    await deleteTeam(teamId);
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to delete team' });
  }
});

export default router;
