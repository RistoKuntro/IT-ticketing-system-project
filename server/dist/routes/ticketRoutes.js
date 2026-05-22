"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Piletite ja lahenduste marsruudid
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const ticketController_1 = require("../controllers/ticketController");
const solutionController_1 = require("../controllers/solutionController");
const ticketValidators_1 = require("../validators/ticketValidators");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, ticketController_1.getAllTickets);
router.post('/', authMiddleware_1.authMiddleware, ticketValidators_1.createTicketValidators, ticketValidators_1.validate, ticketController_1.createTicket);
router.get('/:id', authMiddleware_1.authMiddleware, ticketController_1.getTicketById);
router.put('/:id', authMiddleware_1.authMiddleware, ticketValidators_1.updateTicketValidators, ticketValidators_1.validate, ticketController_1.updateTicket);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), ticketController_1.deleteTicket);
router.post('/:id/solutions', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin', 'specialist'), ticketValidators_1.createSolutionValidators, ticketValidators_1.validate, solutionController_1.createSolution);
router.delete('/:id/solutions/:solutionId', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), solutionController_1.deleteSolution);
exports.default = router;
