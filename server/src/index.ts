// Rakenduse sisenemispunkt ja Express serveri seadistus
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swaggerConfig";

import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import userRoutes from './routes/userRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { notFoundHandler } from './middleware/notFoundMiddleware';
import { prisma } from './lib/prisma';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Swagger UI — saadaval http://localhost:3001/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "HelpDesk API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    showExtensions: true,
  },
}));

// Swagger JSON spec — saadaval http://localhost:3001/api-docs.json
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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
      console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
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

/*
 * SWAGGER API DOKUMENTATSIOONI KASUTAMINE
 * ========================================
 * 1. Käivita server: npm run dev
 * 2. Ava brauser: http://localhost:3001/api-docs
 * 3. Testi autentimata lõpp-punkte otse (register, login)
 * 4. Logi sisse POST /api/auth/login kaudu — kopeeri token vastusest
 * 5. Klõpsa "Authorize" nuppu (luku ikoon lehe ülaosas)
 * 6. Sisesta: Bearer <saadud-token> (asenda <saadud-token> tegeliku tokeniga)
 * 7. Klõpsa "Authorize" ja "Close"
 * 8. Nüüd saad testida kõiki kaitstud lõpp-punkte
 */