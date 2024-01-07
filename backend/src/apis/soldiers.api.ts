import express, { Request, Response } from 'express';
import { createNewSoldier, deleteSoldier, getAllSoldiers } from '../models/soldier.model';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const soldiers = await getAllSoldiers();
    return res.json({ soldiers });
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to get soldiers' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, personal_number, phone_number, capabilities } = req.body;

    await createNewSoldier({ first_name, last_name, personal_number, phone_number, capabilities });
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to create soldier' });
  }
});

router.delete('/:soldier_id', async (req: Request, res: Response) => {
  try {
    const soldierId = req.params.soldier_id;

    await deleteSoldier(soldierId);
    return res.json({});
  } catch (e) {
    console.log('[server] error:', e);
    return res.status(500).json({ message: 'unable to remove soldier' });
  }
});

export default router;
