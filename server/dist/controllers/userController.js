"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                role: { select: { id: true, name: true } },
            },
        });
        res.status(200).json({
            users: users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body;
        if (!role) {
            res.status(400).json({ error: 'Roll on kohustuslik' });
            return;
        }
        const roleRecord = await prisma_1.prisma.role.findUnique({ where: { name: role } });
        if (!roleRecord) {
            res.status(404).json({ error: 'Rolli ei leitud' });
            return;
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { roleId: roleRecord.id },
            include: { role: true },
        });
        res.status(200).json({
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
