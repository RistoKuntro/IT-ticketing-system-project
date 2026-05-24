import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const assignSpecialist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const specialistId = Number(req.params.specialistId);

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    // If specialist assigns co-specialist, ensure they are already assigned or admin
    if (req.user?.role === 'specialist') {
      const isAssigned = await prisma.ticketAssignment.findUnique({ where: { ticketId_specialistId: { ticketId, specialistId: req.user.id } } });
      if (!isAssigned) {
        res.status(403).json({ error: 'Puuduvad õigused määrata spetsialiste sellele piletile' });
        return;
      }
    }

    await prisma.ticketAssignment.create({ data: { ticketId, specialistId } });

    // Optionally set ticket status to in_progress
    if (ticket.status === 'open') {
      await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'in_progress' } });
    }

    res.status(201).json({ message: 'Spetsialist määratud' });
  } catch (error) {
    // handle unique constraint errors gracefully
    if ((error as any).code === 'P2002') {
      res.status(200).json({ message: 'Spetsialist juba määratud' });
      return;
    }
    next(error);
  }
};

export const removeAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const specialistId = Number(req.params.specialistId);

    const assignment = await prisma.ticketAssignment.findUnique({ where: { ticketId_specialistId: { ticketId, specialistId } } });
    if (!assignment) {
      res.status(404).json({ error: 'Määrangut ei leitud' });
      return;
    }

    // specialists can remove themselves; admins can remove anyone
    if (req.user?.role === 'specialist' && req.user.id !== specialistId) {
      res.status(403).json({ error: 'Puuduvad õigused eemaldada teisi spetsialiste' });
      return;
    }

    await prisma.ticketAssignment.delete({ where: { ticketId_specialistId: { ticketId, specialistId } } });
    res.status(200).json({ message: 'Määrang eemaldatud' });
  } catch (error) {
    next(error);
  }
};
