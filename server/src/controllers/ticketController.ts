// Piletite kontrollimise ja haldamise loogika
import { Request, Response, NextFunction } from 'express';
import { Prisma, TicketStatus, Priority } from '@prisma/client';
import { prisma } from '../lib/prisma';

const ticketInclude = {
  creator: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  solutions: {
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

type TicketWithRelations = Prisma.TicketGetPayload<{
  include: typeof ticketInclude;
}>;

export const getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, priority, search } = req.query;
    const where: Prisma.TicketWhereInput = {};

    if (status && typeof status === 'string') {
      where.status = status as TicketStatus;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority as Priority;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (req.user?.role !== 'admin') {
      where.creatorId = req.user?.id;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({ where, include: ticketInclude }),
      prisma.ticket.count({ where }),
    ]);

    res.status(200).json({ tickets, total });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: ticketInclude });

    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    if (req.user?.role !== 'admin' && ticket.creatorId !== req.user?.id) {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, priority } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: 'open',
        priority: (priority ?? 'medium') as Priority,
        creatorId: req.user!.id,
      },
      include: ticketInclude,
    });

    res.status(201).json({ ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    const { title, description, priority, status, assigneeId } = req.body as {
      title?: string;
      description?: string;
      priority?: Priority;
      status?: TicketStatus;
      assigneeId?: number | null;
    };

    const isCreator = ticket.creatorId === req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin && !isCreator) {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    const updateData: Prisma.TicketUpdateInput = {};

    if (isCreator && !isAdmin) {
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

    if (isAdmin) {
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
        } else {
          updateData.assignee = { connect: { id: assigneeId } };
        }
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: ticketInclude,
    });

    res.status(200).json({ ticket: updatedTicket });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    const ticketId = Number(req.params.id);
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    await prisma.solution.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });

    res.status(200).json({ message: 'Pilet kustutatud' });
  } catch (error) {
    next(error);
  }
};
