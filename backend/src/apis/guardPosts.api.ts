import express, { Request, Response } from 'express';
import {
  createNewGuardPost,
  deleteGuardPost,
  getGuardPosts,
  updateGuardPost,
} from '../controllers/guardPosts.controller';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const guardPosts = await getGuardPosts();
    return res.json({ guardPosts });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get guard posts' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { displayName, strategy, numOfSoldiers, occupation, constraints } = req.body;

    await createNewGuardPost({ displayName, strategy, numOfSoldiers, occupation, constraints });
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to create guard post' });
  }
});

router.put('/:team_id', async (req: Request, res: Response) => {
  try {
    const guardPostId = req.params.guard_post_id;
    const { displayName, strategy, numOfSoldiers, occupation, constraints } = req.body;

    await updateGuardPost(guardPostId, {
      displayName,
      strategy,
      numOfSoldiers,
      occupation,
      constraints,
    });
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to update guard post' });
  }
});

router.delete('/:guard_post_id', async (req: Request, res: Response) => {
  try {
    const guardPostId = req.params.guard_post_id;

    await deleteGuardPost(guardPostId);
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to delete guard post' });
  }
});

export default router;
