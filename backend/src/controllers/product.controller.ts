import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class ProductController {
  // GET /api/products - Get products with pagination
  async getAllProducts(req: AuthRequest, res: Response) {
    const { page = 1, limit = 100, search, category, active } = req.query;

    // Validate and cap the limit to prevent performance issues
    const requestedLimit = Number(limit);
    const maxLimit = 500; // Maximum allowed limit
    const take = Math.min(requestedLimit, maxLimit);
    const skip = (Number(page) - 1) * take;

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

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

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

    // Return with pagination metadata
    return res.json({
      data: productsWithNumbers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        hasMore: skip + products.length < totalCount
      }
    });
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

    // Validate required fields
    if (!categoryId) {
      throw new AppError('Category is required. Please select a category for this product.', 400);
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      throw new AppError('Selected category does not exist', 400);
    }

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

    // Convert Decimal fields to numbers for frontend
    const productWithNumbers = {
      ...product,
      cost: product.cost ? Number(product.cost) : null,
      price: Number(product.price),
      taxRate: Number(product.taxRate)
    };

    return ApiResponse.success(res, productWithNumbers, 'Product created successfully', 201);
  }

  // PUT /api/products/:id - Update product
  async updateProduct(req: AuthRequest, res: Response) {
    const { id } = req.params;
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
      imageUrl,
      isActive
    } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    // Validate categoryId if being updated
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!categoryExists) {
        throw new AppError('Selected category does not exist', 400);
      }
    }

    // Check SKU uniqueness if changed
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku }
      });

      if (skuExists) {
        throw new AppError('Product with this SKU already exists', 400);
      }
    }

    // Check barcode uniqueness if changed
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findUnique({
        where: { barcode }
      });

      if (barcodeExists) {
        throw new AppError('Product with this barcode already exists', 400);
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {};
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode || null;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (stock !== undefined) updateData.stock = stock;
    if (lowStockAlert !== undefined) updateData.lowStockAlert = lowStockAlert;
    if (unit !== undefined) updateData.unit = unit;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

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

    // Convert Decimal fields to numbers for frontend
    const productWithNumbers = {
      ...product,
      cost: product.cost ? Number(product.cost) : null,
      price: Number(product.price),
      taxRate: Number(product.taxRate)
    };

    return ApiResponse.success(res, productWithNumbers, 'Product updated successfully');
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

  // POST /api/products/bulk-delete - Bulk delete products
  async bulkDeleteProducts(req: AuthRequest, res: Response) {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Product IDs array is required', 400);
    }

    // Limit bulk delete to 100 products at a time
    if (ids.length > 100) {
      throw new AppError('Cannot delete more than 100 products at once', 400);
    }

    // Get all products to check if they exist and if they can be deleted
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true }
    });

    if (products.length === 0) {
      throw new AppError('No products found with the provided IDs', 404);
    }

    // Check which products have sales records
    const productsWithSales = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: { productId: { in: ids } },
      _count: { productId: true }
    });

    const productIdsWithSales = new Set(productsWithSales.map(item => item.productId));

    // Check which products have stock movements
    const productsWithStockMovements = await prisma.stockMovement.groupBy({
      by: ['productId'],
      where: { productId: { in: ids } },
      _count: { productId: true }
    });

    const productIdsWithStockMovements = new Set(productsWithStockMovements.map(item => item.productId));

    // Combine both sets - products that have either sales or stock movements cannot be deleted
    const unableToDeleteIdsSet = new Set([...productIdsWithSales, ...productIdsWithStockMovements]);

    // Filter products that can be deleted (no sales and no stock movements)
    const deletableIds = products
      .filter(p => !unableToDeleteIdsSet.has(p.id))
      .map(p => p.id);

    const unableToDeleteIds = products
      .filter(p => unableToDeleteIdsSet.has(p.id))
      .map(p => p.id);

    // Delete products that can be deleted
    let deletedCount = 0;
    if (deletableIds.length > 0) {
      const result = await prisma.product.deleteMany({
        where: { id: { in: deletableIds } }
      });
      deletedCount = result.count;

      // Log audit for bulk delete
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'DELETE',
          entity: 'Product',
          entityId: 'bulk',
          changes: {
            deletedIds: deletableIds,
            deletedCount,
            unableToDeleteCount: unableToDeleteIds.length
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      logger.info(`Bulk delete: ${deletedCount} products deleted by ${req.user?.email}`);
    }

    // Return response with details
    return ApiResponse.success(res, {
      deletedCount,
      unableToDeleteCount: unableToDeleteIds.length,
      unableToDeleteIds,
      message: unableToDeleteIds.length > 0
        ? `${deletedCount} products deleted. ${unableToDeleteIds.length} products cannot be deleted because they have sales or stock movement records.`
        : `${deletedCount} products deleted successfully.`
    }, 'Bulk delete completed');
  }

  // POST /api/products/bulk-inactive - Bulk deactivate products
  async bulkInactiveProducts(req: AuthRequest, res: Response) {
    const { ids, active = false } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Product IDs array is required', 400);
    }

    // Limit bulk operation to 100 products at a time
    if (ids.length > 100) {
      throw new AppError('Cannot update more than 100 products at once', 400);
    }

    // Get all products to check if they exist
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, isActive: true }
    });

    if (products.length === 0) {
      throw new AppError('No products found with the provided IDs', 404);
    }

    // Update all products to inactive/active
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: active }
    });

    // Log audit for bulk inactive
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Product',
        entityId: 'bulk',
        changes: {
          updatedIds: ids,
          updatedCount: result.count,
          isActive: active
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Bulk ${active ? 'activate' : 'deactivate'}: ${result.count} products by ${req.user?.email}`);

    // Return response with details
    return ApiResponse.success(res, {
      updatedCount: result.count,
      message: `${result.count} products ${active ? 'activated' : 'deactivated'} successfully.`
    }, `Bulk ${active ? 'activate' : 'deactivate'} completed`);
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
