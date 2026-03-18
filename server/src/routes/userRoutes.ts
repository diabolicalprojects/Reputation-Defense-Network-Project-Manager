import { Router } from 'express';
import { getAllUsers, getUsersByRole, updateUser, deleteUser } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['PM']), getAllUsers);
router.get('/role/:role', getUsersByRole);
router.put('/:id', roleMiddleware(['PM']), updateUser);
router.delete('/:id', roleMiddleware(['PM']), deleteUser);

export default router;
