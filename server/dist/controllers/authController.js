"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.login = exports.register = void 0;
const prisma_1 = require("../lib/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'Sellise e-postiga kasutaja on juba olemas' });
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        let userRole = await prisma_1.prisma.role.findUnique({ where: { name: 'user' } });
        if (!userRole) {
            userRole = await prisma_1.prisma.role.create({ data: { name: 'user' } });
        }
        const newUser = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                roleId: userRole.id
            },
            include: { role: true }
        });
        const token = (0, jwt_1.generateToken)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        if (!user) {
            res.status(401).json({ error: 'Vale e-post või parool' });
            return;
        }
        const isMatch = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Vale e-post või parool' });
            return;
        }
        const token = (0, jwt_1.generateToken)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Autentimine nõutud' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
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
            phone: user.phone ?? null,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Autentimine nõutud' });
            return;
        }
        const { name, email, phone } = req.body;
        // If email provided, ensure it's not taken by another user
        if (email) {
            const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existing && existing.id !== req.user.id) {
                res.status(409).json({ error: 'E-post juba kasutusel' });
                return;
            }
        }
        const updated = await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { name, email, phone }, include: { role: true } });
        res.status(200).json({ user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role.name } });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMe = updateMe;
