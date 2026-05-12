"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Autentimise API marsruudid
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authValidators_1 = require("../validators/authValidators");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authValidators_1.registerValidators, authValidators_1.validate, authController_1.register);
router.post('/login', authValidators_1.loginValidators, authValidators_1.validate, authController_1.login);
router.get('/me', authMiddleware_1.authMiddleware, authController_1.getMe);
exports.default = router;
