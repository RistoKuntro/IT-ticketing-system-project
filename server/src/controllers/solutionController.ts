// Lahenduste lisamise ja kustutamise kontrollerid
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const createSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const { content } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    if (req.user?.role === 'specialist') {
      const isAssigned = await (prisma as any).ticketAssignment.findUnique({
        where: { ticketId_specialistId: { ticketId, specialistId: req.user.id } },
      });

      if (!isAssigned) {
        res.status(403).json({ error: 'Puuduvad õigused' });
        return;
      }
    }

    const ticketResponse = await (prisma as any).ticketResponse.create({
      data: {
        content,
        ticketId: ticket.id,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ ticketResponse });
  } catch (error) {
    next(error);
  }
};

export const deleteSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const solutionId = Number(req.params.solutionId);
    const ticketResponse = await (prisma as any).ticketResponse.findUnique({ where: { id: solutionId } });

    if (!ticketResponse) {
      res.status(404).json({ error: 'Lahendust ei leitud' });
      return;
    }

    await (prisma as any).ticketResponse.delete({ where: { id: solutionId } });
    res.status(200).json({ message: 'Lahendus kustutatud' });
  } catch (error) {
    next(error);
  }
};
