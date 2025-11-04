import { Router } from 'express';
import { query } from 'express-validator';
import { DashboardController } from '../controllers/dashboard.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER));

// GET /api/dashboard/stats
router.get(
  '/stats',
  asyncHandler(dashboardController.getDashboardStats.bind(dashboardController))
);

// GET /api/dashboard/sales-trend
router.get(
  '/sales-trend',
  validate([
    query('days').optional().isInt({ min: 1, max: 365 })
  ]),
  asyncHandler(dashboardController.getSalesTrend.bind(dashboardController))
);

// GET /api/dashboard/top-products
router.get(
  '/top-products',
  validate([
    query('limit').optional().isInt({ min: 1, max: 50 })
  ]),
  asyncHandler(dashboardController.getTopProducts.bind(dashboardController))
);

// GET /api/dashboard/recent-transactions
router.get(
  '/recent-transactions',
  validate([
    query('limit').optional().isInt({ min: 1, max: 50 })
  ]),
  asyncHandler(dashboardController.getRecentTransactions.bind(dashboardController))
);

// GET /api/dashboard/sales-by-category
router.get(
  '/sales-by-category',
  asyncHandler(dashboardController.getSalesByCategory.bind(dashboardController))
);

// GET /api/dashboard/payment-methods
router.get(
  '/payment-methods',
  asyncHandler(dashboardController.getPaymentMethodsBreakdown.bind(dashboardController))
);

export default router;
