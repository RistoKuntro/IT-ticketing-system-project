"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "IT Helpdesk API",
            version: "1.0.0",
            description: "IT-toe piletisüsteemi REST API dokumentatsioon. Kasuta /api/auth/login lõpp-punkti tokeni saamiseks, seejärel klõpsa 'Authorize' ja sisesta: Bearer <saadud-token>",
            contact: {
                name: "Helpdesk API Support",
            },
        },
        servers: [
            {
                url: "http://localhost:3001",
                description: "Arendusserver",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Sisesta JWT token. Saa token /api/auth/login kaudu.",
                },
            },
            schemas: {
                Role: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "admin", enum: ["admin", "user"] },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Mari Mets" },
                        email: { type: "string", format: "email", example: "mari@helpdesk.com" },
                        role: { "$ref": "#/components/schemas/Role" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                AuthUser: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Mari Mets" },
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["admin", "user"] },
                    },
                },
                TicketResponse: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        content: { type: "string", example: "Lahendasin probleemi toitekaablit vahetades." },
                        ticketId: { type: "integer", example: 1 },
                        author: { "$ref": "#/components/schemas/AuthUser" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                Ticket: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        title: { type: "string", example: "Arvuti ei käivitu" },
                        description: { type: "string", example: "Hommikust saati ei tule tööle, ekraan must." },
                        status: {
                            type: "string",
                            enum: ["open", "in_progress", "closed", "archived", "cancelled"],
                            example: "open",
                        },
                        priority: {
                            type: "string",
                            enum: ["none", "low", "medium", "high"],
                            example: "none",
                        },
                        creator: { "$ref": "#/components/schemas/AuthUser" },
                        isArchived: { type: "boolean", example: false },
                        closedAt: { type: ["string", "null"], format: "date-time" },
                        responses: {
                            type: "array",
                            items: { "$ref": "#/components/schemas/TicketResponse" },
                        },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        error: { type: "string", example: "Vigane päring" },
                    },
                },
                ValidationError: {
                    type: "object",
                    properties: {
                        errors: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    field: { type: "string" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/swagger/paths/*.ts"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
