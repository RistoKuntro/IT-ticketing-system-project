// Rakenduse sisenemispunkt ja Express serveri seadistus
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import userRoutes from './routes/userRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { notFoundHandler } from './middleware/notFoundMiddleware';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Marsruudid
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use(notFoundHandler);

// Globaalne veakäsitleja (peab olema viimane middleware)
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
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