// Ticketite ja lahenduste sisendi valideerimine express-validator abil
import { body } from 'express-validator';
import { validate } from './authValidators';

export const createTicketValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Pealkiri ei tohi olla tühi')
    .isLength({ min: 5, max: 100 })
    .withMessage('Pealkiri peab olema 5-100 tähemärki pikk'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Kirjeldus ei tohi olla tühi')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Kirjeldus peab olema 10-1000 tähemärki pikk'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority peab olema low, medium või high'),
];

export const updateTicketValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Pealkiri peab olema 5-100 tähemärki pikk'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Kirjeldus peab olema 10-1000 tähemärki pikk'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority peab olema low, medium või high'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'closed', 'cancelled'])
    .withMessage('Status peab olema open, in_progress, closed või cancelled'),
  body('assigneeId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('assigneeId peab olema positiivne täisarv'),
];

export const createSolutionValidators = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Sisu ei tohi olla tühi')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Sisu peab olema 10-2000 tähemärki pikk'),
];

export { validate };
