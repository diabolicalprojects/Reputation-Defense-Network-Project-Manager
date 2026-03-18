import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getSettings);
router.put('/', roleMiddleware(['PM']), updateSettings);

export default router;
