// Piletite ja lahenduste marsruudid
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicketById,
  getArchivedTickets,
  updateTicket,
} from '../controllers/ticketController';
import { assignSpecialist, removeAssignment } from '../controllers/assignmentController';
import {
  createSolution,
  deleteSolution,
} from '../controllers/solutionController';
import { addFeedback } from '../controllers/feedbackController';
import {
  createTicketValidators,
  createSolutionValidators,
  updateTicketValidators,
  validate,
} from '../validators/ticketValidators';

const router = Router();

router.get('/', authMiddleware, getAllTickets);
router.get('/archived', authMiddleware, getArchivedTickets);
router.post('/', authMiddleware, createTicketValidators, validate, createTicket);
router.get('/:id', authMiddleware, getTicketById);
router.put('/:id', authMiddleware, updateTicketValidators, validate, updateTicket);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteTicket);
router.post('/:id/solutions', authMiddleware, requireRole('admin', 'specialist'), createSolutionValidators, validate, createSolution);
router.delete('/:id/solutions/:solutionId', authMiddleware, requireRole('admin'), deleteSolution);
router.post('/:id/assign/:specialistId', authMiddleware, requireRole('admin', 'specialist'), assignSpecialist);
router.delete('/:id/assign/:specialistId', authMiddleware, requireRole('admin', 'specialist'), removeAssignment);
router.post('/:id/feedback', authMiddleware, addFeedback);

export default router;
