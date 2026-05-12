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
        const solution = await prisma_1.prisma.solution.create({
            data: {
                content,
                ticketId: ticket.id,
                authorId: req.user.id,
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({ solution });
    }
    catch (error) {
        next(error);
    }
};
exports.createSolution = createSolution;
const deleteSolution = async (req, res, next) => {
    try {
        const solutionId = Number(req.params.solutionId);
        const solution = await prisma_1.prisma.solution.findUnique({ where: { id: solutionId } });
        if (!solution) {
            res.status(404).json({ error: 'Lahendust ei leitud' });
            return;
        }
        await prisma_1.prisma.solution.delete({ where: { id: solutionId } });
        res.status(200).json({ message: 'Lahendus kustutatud' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSolution = deleteSolution;
