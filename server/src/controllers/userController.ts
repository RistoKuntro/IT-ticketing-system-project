// Admini kasutajate haldamise kontrollerid
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getSpecialists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { name: 'specialist' } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body as { role?: string };

    if (!role) {
      res.status(400).json({ error: 'Roll on kohustuslik' });
      return;
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      res.status(404).json({ error: 'Rolli ei leitud' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: roleRecord.id },
      include: { role: true },
    });

    res.status(200).json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    await prisma.user.delete({ where: { id: userId } });
    res.status(200).json({ message: 'Kasutaja kustutatud' });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { name, email, phone, role } = req.body;

    const data: any = {};
    if (typeof name !== 'undefined') data.name = name;
    if (typeof email !== 'undefined') data.email = email;
    if (typeof phone !== 'undefined') data.phone = phone;

    if (typeof role !== 'undefined') {
      const roleRecord = await prisma.role.findUnique({ where: { name: role } });
      if (!roleRecord) {
        res.status(404).json({ error: 'Rolli ei leitud' });
        return;
      }
      data.roleId = roleRecord.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      include: { role: true },
    });
    
    res.status(200).json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch(error) {
    next(error);
  }
};
