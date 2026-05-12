// Sisendandmete valideerimine express-validator abil
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nimi ei tohi olla tühi')
    .isLength({ min: 2 })
    .withMessage('Nimi peab olema vähemalt 2 tähemärki pikk'),
  body('email')
    .isEmail()
    .withMessage('Kehtetu e-posti formaat')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Parool peab olema vähemalt 8 tähemärki pikk')
    .matches(/\d/)
    .withMessage('Parool peab sisaldama vähemalt 1 numbrit')
    .matches(/[A-Z]/)
    .withMessage('Parool peab sisaldama vähemalt 1 suurtähte'),
];

export const loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Kehtetu e-posti formaat')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Parool ei tohi olla tühi'),
];

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  next();
};
