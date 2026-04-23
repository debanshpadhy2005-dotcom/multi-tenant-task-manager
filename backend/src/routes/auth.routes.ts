import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator,
} from '../validators/auth.validator';

/**
 * Authentication Routes
 */
const router = Router();
const authController = new AuthController();

// Public routes (rate limiting removed for development)
router.post('/register', validate(registerValidator), authController.register);
router.post('/login', validate(loginValidator), authController.login);
router.post('/refresh', validate(refreshTokenValidator), authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.post('/change-password', authenticate, validate(changePasswordValidator), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
