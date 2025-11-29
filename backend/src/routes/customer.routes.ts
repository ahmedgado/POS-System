import { Router } from 'express';
import { body, query } from 'express-validator';
import { CustomerController } from '../controllers/customer.controller';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const customerController = new CustomerController();

router.use(authenticate);

// GET /api/customers
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString()
  ]),
  asyncHandler(customerController.getCustomers.bind(customerController))
);

// GET /api/customers/search - Quick search for POS
router.get(
  '/search',
  validate([
    query('q').optional().isString()
  ]),
  asyncHandler(customerController.searchCustomers.bind(customerController))
);

// GET /api/customers/analytics - Customer analytics
router.get(
  '/analytics',
  asyncHandler(customerController.getCustomerAnalytics.bind(customerController))
);

// GET /api/customers/dashboard-insights - Dashboard widgets
router.get(
  '/dashboard-insights',
  asyncHandler(customerController.getDashboardInsights.bind(customerController))
);

// GET /api/customers/growth - Customer growth metrics
router.get(
  '/growth',
  asyncHandler(customerController.getCustomerGrowth.bind(customerController))
);

// GET /api/customers/:id/patterns - Purchase patterns
router.get(
  '/:id/patterns',
  asyncHandler(customerController.getPurchasePatterns.bind(customerController))
);

// GET /api/customers/:id/purchases - Purchase history
router.get(
  '/:id/purchases',
  asyncHandler(customerController.getPurchaseHistory.bind(customerController))
);

// GET /api/customers/:id
router.get(
  '/:id',
  asyncHandler(customerController.getCustomerById.bind(customerController))
);

// POST /api/customers
router.post(
  '/',
  validate([
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isString(),
    body('notes').optional().isString()
  ]),
  asyncHandler(customerController.createCustomer.bind(customerController))
);

// PUT /api/customers/:id
router.put(
  '/:id',
  validate([
    body('firstName').optional().notEmpty(),
    body('lastName').optional().notEmpty(),
    body('email').optional({ nullable: true }).isEmail(),
    body('phone').optional().isString(),
    body('city').optional({ nullable: true }).isString(),
    body('address').optional({ nullable: true }).isString(),
    body('active').optional().isBoolean(),
    body('notes').optional({ nullable: true }).isString()
  ]),
  asyncHandler(customerController.updateCustomer.bind(customerController))
);

// DELETE /api/customers/:id
router.delete(
  '/:id',
  asyncHandler(customerController.deleteCustomer.bind(customerController))
);

// GET /api/customers/:id/loyalty - Get loyalty balance
router.get(
  '/:id/loyalty',
  asyncHandler(customerController.getLoyaltyBalance.bind(customerController))
);

// POST /api/customers/:id/redeem-points - Redeem loyalty points
router.post(
  '/:id/redeem-points',
  validate([
    body('points').isInt({ min: 1 }).withMessage('Valid points amount required')
  ]),
  asyncHandler(customerController.redeemPoints.bind(customerController))
);

export default router;
