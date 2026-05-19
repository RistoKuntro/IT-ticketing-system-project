"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Rakenduse sisenemispunkt ja Express serveri seadistus
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const notFoundMiddleware_1 = require("./middleware/notFoundMiddleware");
const prisma_1 = require("./lib/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Marsruudid
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tickets', ticketRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use(notFoundMiddleware_1.notFoundHandler);
// Globaalne veakäsitleja (peab olema viimane middleware)
app.use(errorMiddleware_1.errorMiddleware);
const startServer = async () => {
    try {
        await prisma_1.prisma.$connect();
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
/*
Testimine curl-iga:

# Registreerimine
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test1234!"}'

# Sisselogimine
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'

# Oma andmete vaatamine (asenda TOKEN tegeliku tokeniga)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
*/ 
