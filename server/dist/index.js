"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Rakenduse sisenemispunkt ja Express serveri seadistus
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerConfig_1 = require("./swagger/swaggerConfig");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const notFoundMiddleware_1 = require("./middleware/notFoundMiddleware");
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Swagger UI — saadaval http://localhost:3001/api-docs
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.swaggerSpec, {
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
    res.send(swaggerConfig_1.swaggerSpec);
});
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
            console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
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
