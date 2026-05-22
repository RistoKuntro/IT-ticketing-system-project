"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getAllTickets = void 0;
const prisma_1 = require("../lib/prisma");
const ticketInclude = {
    creator: { select: { id: true, name: true, email: true } },
    assignee: { select: { id: true, name: true, email: true } },
    solutions: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
    },
};
const getAllTickets = async (req, res, next) => {
    try {
        const { status, priority, search } = req.query;
        const where = {};
        if (status && typeof status === 'string') {
            where.status = status;
        }
        if (priority && typeof priority === 'string') {
            where.priority = priority;
        }
        if (search && typeof search === 'string' && search.trim().length > 0) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (req.user?.role !== 'admin' && req.user?.role !== 'specialist') {
            where.creatorId = req.user?.id;
        }
        const [tickets, total] = await Promise.all([
            prisma_1.prisma.ticket.findMany({ where, include: ticketInclude }),
            prisma_1.prisma.ticket.count({ where }),
        ]);
        res.status(200).json({ tickets, total });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTickets = getAllTickets;
const getTicketById = async (req, res, next) => {
    try {
        const ticketId = Number(req.params.id);
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId }, include: ticketInclude });
        if (!ticket) {
            res.status(404).json({ error: 'Pilet ei leitud' });
            return;
        }
        if (req.user?.role !== 'admin' && req.user?.role !== 'specialist' && ticket.creatorId !== req.user?.id) {
            res.status(403).json({ error: 'Puuduvad õigused' });
            return;
        }
        res.status(200).json({ ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.getTicketById = getTicketById;
const createTicket = async (req, res, next) => {
    try {
        const { title, description, priority } = req.body;
        const ticket = await prisma_1.prisma.ticket.create({
            data: {
                title,
                description,
                status: 'open',
                priority: (priority ?? 'medium'),
                creatorId: req.user.id,
            },
            include: ticketInclude,
        });
        res.status(201).json({ ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.createTicket = createTicket;
const updateTicket = async (req, res, next) => {
    try {
        const ticketId = Number(req.params.id);
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ error: 'Pilet ei leitud' });
            return;
        }
        const { title, description, priority, status, assigneeId } = req.body;
        const isCreator = ticket.creatorId === req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const isSpecialist = req.user?.role === 'specialist';
        const canManageAll = isAdmin || isSpecialist;
        if (!canManageAll && !isCreator) {
            res.status(403).json({ error: 'Puuduvad õigused' });
            return;
        }
        const updateData = {};
        if (isCreator && !canManageAll) {
            if (ticket.status !== 'open') {
                res.status(403).json({ error: 'Puuduvad õigused' });
                return;
            }
            if (typeof title !== 'undefined') {
                updateData.title = title;
            }
            if (typeof description !== 'undefined') {
                updateData.description = description;
            }
            if (typeof priority !== 'undefined') {
                updateData.priority = priority;
            }
            if (status === 'cancelled') {
                updateData.status = 'cancelled';
            }
        }
        if (canManageAll) {
            if (typeof title !== 'undefined') {
                updateData.title = title;
            }
            if (typeof description !== 'undefined') {
                updateData.description = description;
            }
            if (typeof priority !== 'undefined') {
                updateData.priority = priority;
            }
            if (typeof status !== 'undefined') {
                updateData.status = status;
            }
            if (typeof assigneeId !== 'undefined') {
                if (assigneeId === null) {
                    updateData.assignee = { disconnect: true };
                }
                else {
                    updateData.assignee = { connect: { id: assigneeId } };
                }
            }
        }
        const updatedTicket = await prisma_1.prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
            include: ticketInclude,
        });
        res.status(200).json({ ticket: updatedTicket });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTicket = updateTicket;
const deleteTicket = async (req, res, next) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Puuduvad õigused' });
            return;
        }
        const ticketId = Number(req.params.id);
        const ticket = await prisma_1.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            res.status(404).json({ error: 'Pilet ei leitud' });
            return;
        }
        await prisma_1.prisma.solution.deleteMany({ where: { ticketId } });
        await prisma_1.prisma.ticket.delete({ where: { id: ticketId } });
        res.status(200).json({ message: 'Pilet kustutatud' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTicket = deleteTicket;
