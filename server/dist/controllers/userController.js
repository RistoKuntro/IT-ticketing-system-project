"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUser = exports.updateUserRole = exports.getSpecialists = exports.getAllUsers = void 0;
const prisma_1 = require("../lib/prisma");
const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const getSpecialists = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSpecialists = getSpecialists;
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
                phone: updatedUser.phone,
                role: updatedUser.role,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        await prisma_1.prisma.user.delete({ where: { id: userId } });
        res.status(200).json({ message: 'Kasutaja kustutatud' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const updateUser = async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        const { name, email, phone, role } = req.body;
        const data = {};
        if (typeof name !== 'undefined')
            data.name = name;
        if (typeof email !== 'undefined')
            data.email = email;
        if (typeof phone !== 'undefined')
            data.phone = phone;
        if (typeof role !== 'undefined') {
            const roleRecord = await prisma_1.prisma.role.findUnique({ where: { name: role } });
            if (!roleRecord) {
                res.status(404).json({ error: 'Rolli ei leitud' });
                return;
            }
            data.roleId = roleRecord.id;
        }
        const updatedUser = await prisma_1.prisma.user.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
