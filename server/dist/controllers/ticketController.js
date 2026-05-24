"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getArchivedTickets = exports.getTicketById = exports.getAllTickets = void 0;
const prisma_1 = require("../lib/prisma");
const ticketInclude = {
    creator: { select: { id: true, name: true, email: true, phone: true } },
    assignments: { include: { specialist: { select: { id: true, name: true, email: true, phone: true } } } },
    responses: {
        include: { author: { select: { id: true, name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'asc' },
    },
    feedbacks: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
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
        if (req.user?.role === 'specialist') {
            const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
            where.AND = [...existingAnd, { assignments: { some: { specialistId: req.user.id } } }];
        }
        else if (req.user?.role !== 'admin') {
            where.creatorId = req.user?.id;
        }
        const visibilityFilter = { isArchived: false, status: { not: 'archived' } };
        if (Array.isArray(where.AND)) {
            where.AND = [...where.AND, visibilityFilter];
        }
        else if (where.AND) {
            where.AND = [where.AND, visibilityFilter];
        }
        else {
            where.AND = [visibilityFilter];
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
        if (req.user?.role === 'specialist') {
            const isAssigned = await prisma_1.prisma.ticketAssignment.findUnique({
                where: { ticketId_specialistId: { ticketId, specialistId: req.user.id } },
            });
            if (!isAssigned) {
                res.status(403).json({ error: 'Puuduvad õigused' });
                return;
            }
        }
        else if (req.user?.role !== 'admin' && ticket.creatorId !== req.user?.id) {
            res.status(403).json({ error: 'Puuduvad õigused' });
            return;
        }
        const ticketRecord = ticket;
        if (req.user?.role !== 'admin' && ticketRecord.isArchived) {
            res.status(403).json({ error: 'Arhiveeritud pileti avamine pole lubatud' });
            return;
        }
        res.status(200).json({ ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.getTicketById = getTicketById;
const getArchivedTickets = async (req, res, next) => {
    try {
        const user = req.user;
        let where = {};
        if (user.role === 'admin') {
            where.status = 'archived';
        }
        else if (user.role === 'specialist') {
            where = {
                status: 'archived',
                assignments: { some: { specialistId: user.id } },
            };
        }
        else {
            // regular user
            where = { creatorId: user.id, status: 'archived' };
        }
        const tickets = await prisma_1.prisma.ticket.findMany({ where, include: ticketInclude, orderBy: { closedAt: 'desc' } });
        res.status(200).json({ tickets });
    }
    catch (error) {
        next(error);
    }
};
exports.getArchivedTickets = getArchivedTickets;
const createTicket = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const ticket = await prisma_1.prisma.ticket.create({
            data: {
                title,
                description,
                status: 'open',
                // priority left to admin; default applies
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
        const { title, description, priority, status } = req.body;
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
            // Only admin may change priority
            if (isAdmin && typeof priority !== 'undefined') {
                updateData.priority = priority;
            }
            if (typeof status !== 'undefined') {
                if (status === 'closed') {
                    updateData.status = status;
                    updateData.closedAt = new Date();
                    updateData.isArchived = false;
                }
                else if (status === 'archived') {
                    updateData.status = 'archived';
                    updateData.isArchived = true;
                    updateData.closedAt = new Date();
                }
                else {
                    updateData.status = status;
                    updateData.closedAt = null;
                    updateData.isArchived = false;
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
        await prisma_1.prisma.ticketResponse.deleteMany({ where: { ticketId } });
        await prisma_1.prisma.ticket.delete({ where: { id: ticketId } });
        res.status(200).json({ message: 'Pilet kustutatud' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTicket = deleteTicket;
