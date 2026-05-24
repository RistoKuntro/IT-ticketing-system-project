import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
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
        Solution: {
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
              enum: ["open", "in_progress", "closed", "cancelled"],
              example: "open",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              example: "high",
            },
            creator: { "$ref": "#/components/schemas/AuthUser" },
            assignee: {
              oneOf: [
                { "$ref": "#/components/schemas/AuthUser" },
                { type: "null" },
              ],
            },
            solutions: {
              type: "array",
              items: { "$ref": "#/components/schemas/Solution" },
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

export const swaggerSpec = swaggerJsdoc(options);