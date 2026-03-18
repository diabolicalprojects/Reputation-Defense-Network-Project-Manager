import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', authMiddleware, roleMiddleware(['PM']), register);
router.get('/me', authMiddleware, getMe);

export default router;
