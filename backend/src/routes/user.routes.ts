import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// All routes require authentication
router.use(authenticate);

// User management routes (Admin/Manager only)
router.get('/', authorize('ADMIN', 'MANAGER'), (req, res, next) => controller.getAll(req, res).catch(next));
router.get('/:id', (req, res, next) => controller.getById(req, res).catch(next));
router.post('/', authorize('ADMIN'), (req, res, next) => controller.create(req, res).catch(next));
router.put('/:id', authorize('ADMIN', 'MANAGER'), (req, res, next) => controller.update(req, res).catch(next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => controller.delete(req, res).catch(next));
router.patch('/:id/toggle', authorize('ADMIN'), (req, res, next) => controller.toggleActive(req, res).catch(next));
router.post('/:id/reset-password', authorize('ADMIN'), (req, res, next) => controller.resetPassword(req, res).catch(next));

export default router;
