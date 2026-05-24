// Admini kasutajate nimekirja ja rolli uuendamise marsruudid
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { getAllUsers, getSpecialists, updateUserRole, deleteUser, updateUser } from '../controllers/userController';

const router = Router();

router.get('/', authMiddleware, requireRole('admin'), getAllUsers);
router.get('/specialists', authMiddleware, requireRole('admin', 'specialist'), getSpecialists);
router.put('/:id/role', authMiddleware, requireRole('admin'), updateUserRole);
router.put('/:id', authMiddleware, requireRole('admin'), updateUser);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteUser);

export default router;
