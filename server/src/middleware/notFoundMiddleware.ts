// Middleware, mis tagastab 404 veateate kui marsruuti ei leitud
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ error: 'Resurssi ei leitud' });
};
