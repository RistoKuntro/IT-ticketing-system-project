// Piletite kontrollimise ja haldamise loogika
import { Request, Response, NextFunction } from 'express';
import { Prisma, TicketStatus, Priority } from '@prisma/client';
import { prisma } from '../lib/prisma';

const ticketInclude = {
  creator: { select: { id: true, name: true, email: true, phone: true } },
  assignments: { include: { specialist: { select: { id: true, name: true, email: true, phone: true } } } },
  responses: {
    include: { author: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  feedbacks: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
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

    if (req.user?.role === 'specialist') {
      const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
      // Specialist should see tickets they created OR tickets assigned to them
      where.AND = [
        ...existingAnd,
        {
          OR: [
            { assignments: { some: { specialistId: req.user.id } } },
            { creatorId: req.user.id },
          ],
        } as any,
      ];
    } else if (req.user?.role !== 'admin') {
      where.creatorId = req.user?.id;
    }

    const visibilityFilter = { isArchived: false, status: { not: 'archived' } } as any;
    if (Array.isArray(where.AND)) {
      where.AND = [...where.AND, visibilityFilter];
    } else if (where.AND) {
      where.AND = [where.AND, visibilityFilter];
    } else {
      where.AND = [visibilityFilter];
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

    if (req.user?.role === 'specialist') {
      const isAssigned = await (prisma as any).ticketAssignment.findUnique({
        where: { ticketId_specialistId: { ticketId, specialistId: req.user.id } },
      });

      // allow if assigned OR if specialist is the creator
      if (!isAssigned && ticket.creatorId !== req.user?.id) {
        res.status(403).json({ error: 'Puuduvad õigused' });
        return;
      }
    } else if (req.user?.role !== 'admin' && ticket.creatorId !== req.user?.id) {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    const ticketRecord = ticket as any;
    if (req.user?.role !== 'admin' && ticketRecord.isArchived) {
      res.status(403).json({ error: 'Arhiveeritud pileti avamine pole lubatud' });
      return;
    }

    res.status(200).json({ ticket });
  } catch (error) {
    next(error);
  }
};

export const getArchivedTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    let where: any = {};

    if (user.role === 'admin') {
      where.status = 'archived';
    } else if (user.role === 'specialist') {
      // specialist should see archived tickets they created OR assigned to them
      where = {
        status: 'archived',
        OR: [
          { assignments: { some: { specialistId: user.id } } },
          { creatorId: user.id },
        ],
      };
    } else {
      // regular user
      where = { creatorId: user.id, status: 'archived' };
    }

    const tickets = await prisma.ticket.findMany({ where, include: ticketInclude, orderBy: { closedAt: 'desc' } as any });
    res.status(200).json({ tickets });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        status: 'open',
        // priority left to admin; default applies
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

    const { title, description, priority, status } = req.body as {
      title?: string;
      description?: string;
      priority?: Priority;
      status?: TicketStatus | 'archived';
    };

    const isCreator = ticket.creatorId === req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const isSpecialist = req.user?.role === 'specialist';
    const canManageAll = isAdmin || isSpecialist;

    if (!canManageAll && !isCreator) {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    const updateData: Prisma.TicketUpdateInput & { isArchived?: boolean; closedAt?: Date | null } = {};

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
        } else if (status === 'archived') {
          updateData.status = 'archived' as TicketStatus;
          updateData.isArchived = true;
          updateData.closedAt = new Date();
        } else {
          updateData.status = status;
          updateData.closedAt = null;
          updateData.isArchived = false;
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

    await (prisma as any).ticketResponse.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });

    res.status(200).json({ message: 'Pilet kustutatud' });
  } catch (error) {
    next(error);
  }
};
