import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { CategoryController } from '../controllers/category.controller';

const router = Router();
const controller = new CategoryController();

// All routes require authentication
router.use(authenticate);

// Category routes
router.get('/', (req, res, next) => controller.getAll(req, res).catch(next));
router.get('/:id', (req, res, next) => controller.getById(req, res).catch(next));
router.post('/', (req, res, next) => controller.create(req, res).catch(next));
router.put('/:id', (req, res, next) => controller.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => controller.delete(req, res).catch(next));
router.patch('/:id/toggle', (req, res, next) => controller.toggleActive(req, res).catch(next));

export default router;
