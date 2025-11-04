import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, body, param, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]): RequestHandler[] => {
  return [
    ...validations,
    (req: Request, _res: Response, next: NextFunction) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        throw new AppError(errorMessages, 400);
      }

      next();
    }
  ];
};

// Auth validations
export const loginValidation = validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]);

export const changePasswordValidation = validate([
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character')
]);

// Customer validations
export const createCustomerValidation = validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  body('email').optional().isEmail().withMessage('Valid email required')
]);

export const updateCustomerValidation = validate([
  param('id').isInt().withMessage('Valid customer ID required'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required'),
  body('email').optional().isEmail().withMessage('Valid email required')
]);

// Product validations
export const createProductValidation = validate([
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('categoryId').isInt().withMessage('Valid category ID required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
]);

export const updateProductValidation = validate([
  param('id').isInt().withMessage('Valid product ID required'),
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number')
]);

// Sale validations
export const createSaleValidation = validate([
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').isInt().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('paymentMethod').isIn(['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER'])
    .withMessage('Valid payment method required'),
  body('customerId').optional().isInt().withMessage('Valid customer ID required')
]);

// Shift validations
export const startShiftValidation = validate([
  body('openingCash').isFloat({ min: 0 }).withMessage('Opening cash must be a positive number')
]);

export const closeShiftValidation = validate([
  param('id').isInt().withMessage('Valid shift ID required'),
  body('closingCash').isFloat({ min: 0 }).withMessage('Closing cash must be a positive number')
]);
