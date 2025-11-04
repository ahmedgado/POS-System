import { Router } from 'express';
import { body, query } from 'express-validator';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const productController = new ProductController();

// All routes require authentication
router.use(authenticate);

// GET /api/products - Get all products
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('active').optional().isBoolean()
  ]),
  asyncHandler(productController.getAllProducts.bind(productController))
);

// GET /api/products/low-stock - Get low stock products
router.get(
  '/low-stock',
  asyncHandler(productController.getLowStockProducts.bind(productController))
);

// GET /api/products/search - Quick search for POS
router.get(
  '/search',
  validate([
    query('q').notEmpty().withMessage('Search query is required')
  ]),
  asyncHandler(productController.searchProducts.bind(productController))
);

// GET /api/products/:id - Get single product
router.get(
  '/:id',
  asyncHandler(productController.getProduct.bind(productController))
);

// POST /api/products - Create product (Admin, Manager only)
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_CLERK),
  validate([
    body('sku').notEmpty().withMessage('SKU is required'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost').optional().isFloat({ min: 0 }),
    body('taxRate').optional().isFloat({ min: 0, max: 1 }),
    body('stock').optional().isInt({ min: 0 }),
    body('lowStockAlert').optional().isInt({ min: 0 }),
    body('unit').optional().isString()
  ]),
  asyncHandler(productController.createProduct.bind(productController))
);

// PUT /api/products/:id - Update product (Admin, Manager only)
router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_CLERK),
  validate([
    body('sku').optional().notEmpty(),
    body('name').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('cost').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 })
  ]),
  asyncHandler(productController.updateProduct.bind(productController))
);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  asyncHandler(productController.deleteProduct.bind(productController))
);

// POST /api/products/:id/adjust-stock - Adjust stock (Admin, Manager, Inventory Clerk)
router.post(
  '/:id/adjust-stock',
  authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.INVENTORY_CLERK),
  validate([
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('type').isIn(['PURCHASE', 'SALE', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'TRANSFER'])
      .withMessage('Invalid movement type'),
    body('notes').optional().isString()
  ]),
  asyncHandler(productController.adjustStock.bind(productController))
);

export default router;
