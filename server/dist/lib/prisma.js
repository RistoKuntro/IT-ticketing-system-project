"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Prisma kliendi singleton, et vältida mitut ühendust arenduses
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
