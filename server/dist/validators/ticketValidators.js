"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.createSolutionValidators = exports.updateTicketValidators = exports.createTicketValidators = void 0;
// Ticketite ja lahenduste sisendi valideerimine express-validator abil
const express_validator_1 = require("express-validator");
const authValidators_1 = require("./authValidators");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return authValidators_1.validate; } });
exports.createTicketValidators = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Pealkiri ei tohi olla tühi')
        .isLength({ min: 5, max: 100 })
        .withMessage('Pealkiri peab olema 5-100 tähemärki pikk'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty()
        .withMessage('Kirjeldus ei tohi olla tühi')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Kirjeldus peab olema 10-1000 tähemärki pikk'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['none', 'low', 'medium', 'high'])
        .withMessage('Priority peab olema none, low, medium või high'),
];
exports.updateTicketValidators = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Pealkiri peab olema 5-100 tähemärki pikk'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Kirjeldus peab olema 10-1000 tähemärki pikk'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isIn(['none', 'low', 'medium', 'high'])
        .withMessage('Priority peab olema none, low, medium või high'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['open', 'in_progress', 'closed', 'archived', 'cancelled'])
        .withMessage('Status peab olema open, in_progress, closed, archived või cancelled'),
    // assigneeId removed: assignments are managed with TicketAssignment
];
exports.createSolutionValidators = [
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('Sisu ei tohi olla tühi')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Sisu peab olema 10-2000 tähemärki pikk'),
];
