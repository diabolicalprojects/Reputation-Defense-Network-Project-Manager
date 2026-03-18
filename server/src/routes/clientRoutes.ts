import { Router } from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientProjects,
  createClientProject,
} from '../controllers/clientController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', roleMiddleware(['PM']), createClient);
router.put('/:id', roleMiddleware(['PM']), updateClient);
router.delete('/:id', roleMiddleware(['PM']), deleteClient);

// Client projects
router.get('/:id/projects', getClientProjects);
router.post('/:id/projects', roleMiddleware(['PM']), createClientProject);

export default router;
