// Piletite ja lahenduste marsruudid
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import {
  createTicket,
  deleteTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
} from '../controllers/ticketController';
import {
  createSolution,
  deleteSolution,
} from '../controllers/solutionController';
import {
  createTicketValidators,
  createSolutionValidators,
  updateTicketValidators,
  validate,
} from '../validators/ticketValidators';

const router = Router();

router.get('/', authMiddleware, getAllTickets);
router.post('/', authMiddleware, createTicketValidators, validate, createTicket);
router.get('/:id', authMiddleware, getTicketById);
router.put('/:id', authMiddleware, updateTicketValidators, validate, updateTicket);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteTicket);
router.post('/:id/solutions', authMiddleware, requireRole('admin', 'specialist'), createSolutionValidators, validate, createSolution);
router.delete('/:id/solutions/:solutionId', authMiddleware, requireRole('admin'), deleteSolution);

export default router;
