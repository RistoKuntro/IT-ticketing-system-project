"use strict";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autentimine ja kasutajahaldus
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registreeri uus kasutaja
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Mari Mets
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mari@helpdesk.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Parool123!
 *     responses:
 *       201:
 *         description: Kasutaja loodud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       409:
 *         description: E-post on juba kasutusel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Valideerimise viga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Logi sisse ja saa JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@helpdesk.com
 *               password:
 *                 type: string
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: Edukas sisselogimine
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *                 token:
 *                   type: string
 *       401:
 *         description: Vale e-post või parool
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Tagasta praeguse kasutaja andmed
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kasutaja andmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Autentimine nõutud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
exports.default = {};
