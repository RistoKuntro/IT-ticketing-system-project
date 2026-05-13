"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.loginValidators = exports.registerValidators = void 0;
// Sisendandmete valideerimine express-validator abil
const express_validator_1 = require("express-validator");
exports.registerValidators = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Nimi ei tohi olla tühi')
        .isLength({ min: 2 })
        .withMessage('Nimi peab olema vähemalt 2 tähemärki pikk'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Kehtetu e-posti formaat')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Parool peab olema vähemalt 8 tähemärki pikk')
        .matches(/\d/)
        .withMessage('Parool peab sisaldama vähemalt 1 numbrit')
        .matches(/[A-Z]/)
        .withMessage('Parool peab sisaldama vähemalt 1 suurtähte'),
];
exports.loginValidators = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Kehtetu e-posti formaat')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Parool ei tohi olla tühi'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.validate = validate;
