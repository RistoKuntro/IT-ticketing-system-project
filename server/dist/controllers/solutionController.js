"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSolution = exports.createSolution = void 0;
const prisma_1 = require("../lib/prisma");
const createSolution = async (req, res, next) => {
    try {
        const ticketId = Number(req.params.id);
        const { content } = req.body;
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ error: 'Pilet ei leitud' });
            return;
        }
        if (req.user?.role === 'specialist') {
            const isAssigned = await prisma_1.prisma.ticketAssignment.findUnique({
                where: { ticketId_specialistId: { ticketId, specialistId: req.user.id } },
            });
            if (!isAssigned) {
                res.status(403).json({ error: 'Puuduvad õigused' });
                return;
            }
        }
        const ticketResponse = await prisma_1.prisma.ticketResponse.create({
            data: {
                content,
                ticketId: ticket.id,
                authorId: req.user.id,
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({ ticketResponse });
    }
    catch (error) {
        next(error);
    }
};
exports.createSolution = createSolution;
const deleteSolution = async (req, res, next) => {
    try {
        const solutionId = Number(req.params.solutionId);
        const ticketResponse = await prisma_1.prisma.ticketResponse.findUnique({ where: { id: solutionId } });
        if (!ticketResponse) {
            res.status(404).json({ error: 'Lahendust ei leitud' });
            return;
        }
        await prisma_1.prisma.ticketResponse.delete({ where: { id: solutionId } });
        res.status(200).json({ message: 'Lahendus kustutatud' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSolution = deleteSolution;
