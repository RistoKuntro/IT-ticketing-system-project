// Globaalne vigade käsitleja, mis töötleb ka Prisma spetsiifilisi vigu
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Sellise e-postiga kasutaja on juba olemas' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Kirjet ei leitud' });
      return;
    }
  }

  const message = process.env.NODE_ENV === 'development' ? err.message : 'Serveri sisemine viga';
  res.status(500).json({ error: message });
};
