import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  asyncHandler(authController.login.bind(authController))
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout.bind(authController))
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  asyncHandler(authController.refreshToken.bind(authController))
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ]),
  asyncHandler(authController.changePassword.bind(authController))
);

export default router;
