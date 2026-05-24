// Kontrollib JWT tokeni kehtivust ja lisab kasutaja andmed päringusse
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autentimine nõutud' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Autentimine nõutud' });
    return;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!dbUser) {
      res.status(401).json({ error: 'Kasutajat ei leitud' });
      return;
    }

    req.user = {
      ...decoded,
      role: dbUser.role.name
    };
    
    next();
  } catch (error) {
    console.error('Viga authMiddleware:is', error);
    res.status(500).json({ error: 'Serveri viga autentimisel' });
  }
};
