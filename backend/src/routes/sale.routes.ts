import { Router } from 'express';
import { body, query } from 'express-validator';
import { SaleController } from '../controllers/sale.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const saleController = new SaleController();

router.use(authenticate);

// POST /api/sales
router.post(
  '/',
  authorize(UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN),
  validate([
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
    body('items.*.totalPrice').isFloat({ min: 0 }).withMessage('Total price must be positive'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be positive'),
    body('taxAmount').isFloat({ min: 0 }).withMessage('Tax amount must be positive'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('paymentMethod').isIn(['CASH', 'CARD', 'SPLIT', 'STORE_CREDIT', 'MOBILE_WALLET']).withMessage('Invalid payment method'),
    body('customerId').optional().isString(),
    body('shiftId').optional().isString()
  ]),
  asyncHandler(saleController.createSale.bind(saleController))
);

// GET /api/sales
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['COMPLETED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOIDED']),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('cashierId').optional().isString()
  ]),
  asyncHandler(saleController.getSales.bind(saleController))
);

// GET /api/sales/:id
router.get(
  '/:id',
  asyncHandler(saleController.getSaleById.bind(saleController))
);

// POST /api/sales/:id/refund
router.post(
  '/:id/refund',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  validate([
    body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be positive'),
    body('reason').notEmpty().withMessage('Refund reason is required')
  ]),
  asyncHandler(saleController.processRefund.bind(saleController))
);

export default router;
