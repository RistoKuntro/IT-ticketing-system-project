import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const addFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const userId = req.user!.id;
    const { rating, comment } = req.body as { rating?: number; comment?: string };

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: 'Pilet ei leitud' });
      return;
    }

    if (ticket.creatorId !== userId) {
      res.status(403).json({ error: 'Tagasisidet saab anda ainult oma piletile' });
      return;
    }

    if (ticket.status !== 'closed' || ticket.isArchived) {
      res.status(400).json({ error: 'Feedback saab lisada ainult suletud piletile' });
      return;
    }

    const fb = await prisma.feedback.create({ data: { ticketId, userId, rating: rating ?? 5, comment } });

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { closedAt: new Date() },
    });

    res.status(201).json({ feedback: fb });
  } catch (error) {
    next(error);
  }
};
