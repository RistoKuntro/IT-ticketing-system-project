"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../lib/prisma");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Autentimine nõutud' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        res.status(401).json({ error: 'Autentimine nõutud' });
        return;
    }
    try {
        const dbUser = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error('Viga authMiddleware:is', error);
        res.status(500).json({ error: 'Serveri viga autentimisel' });
    }
};
exports.authMiddleware = authMiddleware;
