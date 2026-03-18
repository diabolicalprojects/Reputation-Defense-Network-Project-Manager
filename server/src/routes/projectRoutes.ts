import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getMyProjects,
  updateSopTask,
} from '../controllers/projectController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAllProjects);
router.get('/mine', getMyProjects);
router.get('/:id', getProjectById);
router.post('/', roleMiddleware(['PM']), createProject);
router.put('/:id', roleMiddleware(['PM', 'DESIGNER', 'DEVELOPER', 'BOTH']), updateProject);
router.patch('/:id/status', updateProjectStatus);
router.delete('/:id', roleMiddleware(['PM']), deleteProject);

// SOP task updates
router.patch('/:id/sop/:taskId', updateSopTask);

export default router;
