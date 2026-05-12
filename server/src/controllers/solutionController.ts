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

    const solution = await prisma.solution.create({
      data: {
        content,
        ticketId: ticket.id,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ solution });
  } catch (error) {
    next(error);
  }
};

export const deleteSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const solutionId = Number(req.params.solutionId);
    const solution = await prisma.solution.findUnique({ where: { id: solutionId } });

    if (!solution) {
      res.status(404).json({ error: 'Lahendust ei leitud' });
      return;
    }

    await prisma.solution.delete({ where: { id: solutionId } });
    res.status(200).json({ message: 'Lahendus kustutatud' });
  } catch (error) {
    next(error);
  }
};
