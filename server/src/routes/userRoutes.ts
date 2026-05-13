// Admini kasutajate nimekirja ja rolli uuendamise marsruudid
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { getAllUsers, updateUserRole } from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), getAllUsers);
router.put('/:id/role', authMiddleware, requireRole('admin'), updateUserRole);

export default router;
