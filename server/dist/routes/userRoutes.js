"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Admini kasutajate nimekirja ja rolli uuendamise marsruudid
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), userController_1.getAllUsers);
router.get('/specialists', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin', 'specialist'), userController_1.getSpecialists);
router.put('/:id/role', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), userController_1.updateUserRole);
router.put('/:id', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), userController_1.updateUser);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, roleMiddleware_1.requireRole)('admin'), userController_1.deleteUser);
exports.default = router;
