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
    body('email').optional().isEmail(),
    body('phone').optional().isString()
  ]),
  asyncHandler(customerController.updateCustomer.bind(customerController))
);

// DELETE /api/customers/:id
router.delete(
  '/:id',
  asyncHandler(customerController.deleteCustomer.bind(customerController))
);

export default router;
