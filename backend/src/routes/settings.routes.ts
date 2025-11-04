import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
const controller = new SettingsController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Settings routes
router.get('/', (req, res, next) => controller.getAll(req, res).catch(next));
router.put('/store', (req, res, next) => controller.updateStore(req, res).catch(next));
router.put('/tax', (req, res, next) => controller.updateTax(req, res).catch(next));
router.put('/receipt', (req, res, next) => controller.updateReceipt(req, res).catch(next));
router.put('/currency', (req, res, next) => controller.updateCurrency(req, res).catch(next));
router.put('/system', (req, res, next) => controller.updateSystem(req, res).catch(next));

export default router;
