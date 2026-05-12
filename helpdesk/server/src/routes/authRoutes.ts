// Autentimise API marsruudid
import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { registerValidators, loginValidators, validate } from '../validators/authValidators';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.get('/me', authMiddleware, getMe);

export default router;
