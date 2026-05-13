// Tagab, et päringu teinud kasutajal on vajalik roll
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const requireRole = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Autentimine nõutud' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Puuduvad õigused' });
      return;
    }

    next();
  };
};
