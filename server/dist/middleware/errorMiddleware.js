"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const client_1 = require("@prisma/client");
const errorMiddleware = (err, req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
exports.errorMiddleware = errorMiddleware;
