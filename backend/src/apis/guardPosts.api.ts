import express, { Request, Response } from 'express';
import { getGuardPosts } from '../controllers/guardPosts.controller';

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

export default router;
