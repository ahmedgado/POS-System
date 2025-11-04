import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class ProductController {
  // GET /api/products - Get all products with pagination
  async getAllProducts(req: AuthRequest, res: Response) {
    const { page = 1, limit = 20, search, category, active } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { sku: { contains: String(search), mode: 'insensitive' } },
        { barcode: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categoryId = String(category);
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    // Get products with category
    const products = await prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert Decimal fields to numbers for frontend
    const productsWithNumbers = products.map(product => ({
      ...product,
      cost: product.cost ? Number(product.cost) : null,
      price: Number(product.price),
      taxRate: Number(product.taxRate)
    }));

    // Return products array directly for frontend compatibility
    return res.json(productsWithNumbers);
  }

  // GET /api/products/:id - Get single product
  async getProduct(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return ApiResponse.success(res, product);
  }

  // POST /api/products - Create product
  async createProduct(req: AuthRequest, res: Response) {
    const {
      sku,
      barcode,
      name,
      description,
      categoryId,
      price,
      cost,
      taxRate,
      stock,
      lowStockAlert,
      unit,
      imageUrl
    } = req.body;

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingSku) {
      throw new AppError('Product with this SKU already exists', 400);
    }

    // Check if barcode exists (if provided)
    if (barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: { barcode }
      });

      if (existingBarcode) {
        throw new AppError('Product with this barcode already exists', 400);
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        sku,
        barcode: barcode || null,
        name,
        description,
        categoryId,
        price,
        cost: cost || null,
        taxRate: taxRate || 0.10,
        stock: stock || 0,
        lowStockAlert: lowStockAlert || 10,
        unit: unit || 'piece',
        imageUrl: imageUrl || null
      },
      include: {
        category: true
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        changes: product,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Product created: ${product.name} by ${req.user?.email}`);

    return ApiResponse.success(res, product, 'Product created successfully', 201);
  }

  // PUT /api/products/:id - Update product
  async updateProduct(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    // Check SKU uniqueness if changed
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku }
      });

      if (skuExists) {
        throw new AppError('Product with this SKU already exists', 400);
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Product',
        entityId: product.id,
        changes: { before: existingProduct, after: product },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Product updated: ${product.name} by ${req.user?.email}`);

    return ApiResponse.success(res, product, 'Product updated successfully');
  }

  // DELETE /api/products/:id - Delete product
  async deleteProduct(req: AuthRequest, res: Response) {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if product is used in any sales
    const salesCount = await prisma.saleItem.count({
      where: { productId: id }
    });

    if (salesCount > 0) {
      throw new AppError('Cannot delete product that has been sold. Consider deactivating it instead.', 400);
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
        changes: product,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Product deleted: ${product.name} by ${req.user?.email}`);

    return ApiResponse.success(res, null, 'Product deleted successfully');
  }

  // GET /api/products/low-stock - Get low stock products
  async getLowStockProducts(_req: AuthRequest, res: Response) {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockAlert
        },
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { stock: 'asc' }
    });

    return ApiResponse.success(res, products);
  }

  // POST /api/products/:id/adjust-stock - Adjust stock
  async adjustStock(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { quantity, type, notes } = req.body;

    // Get product
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Calculate new stock
    let newStock = product.stock;

    if (type === 'PURCHASE' || type === 'RETURN' || type === 'ADJUSTMENT') {
      newStock += quantity;
    } else if (type === 'SALE' || type === 'DAMAGE' || type === 'TRANSFER') {
      newStock -= quantity;
    }

    // Update product stock and create movement record in transaction
    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { stock: newStock }
      }),
      prisma.stockMovement.create({
        data: {
          productId: id,
          type,
          quantity,
          notes,
          createdBy: req.user!.id
        }
      })
    ]);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Product',
        entityId: id,
        changes: {
          field: 'stock',
          from: product.stock,
          to: newStock,
          type,
          quantity
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Stock adjusted for ${product.name}: ${product.stock} -> ${newStock} (${type})`);

    return ApiResponse.success(res, {
      product: updatedProduct,
      movement
    }, 'Stock adjusted successfully');
  }

  // GET /api/products/search - Quick search for POS
  async searchProducts(req: AuthRequest, res: Response) {
    const { q } = req.query;

    if (!q || String(q).length < 2) {
      return ApiResponse.success(res, []);
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: String(q), mode: 'insensitive' } },
          { sku: { contains: String(q), mode: 'insensitive' } },
          { barcode: { equals: String(q) } }
        ]
      },
      select: {
        id: true,
        sku: true,
        barcode: true,
        name: true,
        price: true,
        taxRate: true,
        stock: true,
        unit: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 10,
      orderBy: { name: 'asc' }
    });

    return ApiResponse.success(res, products);
  }
}
