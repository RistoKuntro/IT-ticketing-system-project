// Autentimise kontrollerid registreerimiseks, sisselogimiseks ja info pärimiseks
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Sellise e-postiga kasutaja on juba olemas' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    let userRole = await prisma.role.findUnique({ where: { name: 'user' } });
    if (!userRole) {
      userRole = await prisma.role.create({ data: { name: 'user' } });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: userRole.id
      },
      include: { role: true }
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role.name
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Vale e-post või parool' });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Vale e-post või parool' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.name
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Autentimine nõutud' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({ error: 'Kasutajat ei leitud' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};
