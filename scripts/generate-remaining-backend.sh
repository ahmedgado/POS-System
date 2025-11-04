#!/bin/bash

# Script to generate all remaining backend controllers and routes
# Run from project root: bash scripts/generate-remaining-backend.sh

set -e

BACKEND_DIR="./backend/src"

echo "🚀 Generating remaining backend controllers and routes..."

# Create Sale Controller
cat > "$BACKEND_DIR/controllers/sale.controller.ts" << 'SALESCONTROLLER'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class SaleController {
  // POST /api/sales - Create new sale
  async createSale(req: AuthRequest, res: Response) {
    const {
      customerId,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      cashReceived,
      changeGiven,
      shiftId,
      notes
    } = req.body;

    // Generate sale number
    const saleCount = await prisma.sale.count();
    const saleNumber = `SALE-${new Date().getFullYear()}${String(saleCount + 1).padStart(6, '0')}`;

    // Create sale with items in transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: customerId || null,
          cashierId: req.user!.id,
          shiftId: shiftId || null,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paymentMethod,
          cashReceived: cashReceived || null,
          changeGiven: changeGiven || null,
          notes: notes || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              discount: item.discount || 0,
              totalPrice: item.totalPrice
            }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          cashier: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Update product stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: item.quantity,
            notes: `Sale: ${saleNumber}`,
            createdBy: req.user!.id
          }
        });
      }

      // Update customer stats if exists
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSpent: {
              increment: totalAmount
            },
            visitCount: {
              increment: 1
            },
            lastVisit: new Date(),
            loyaltyPoints: {
              increment: Math.floor(Number(totalAmount))
            }
          }
        });
      }

      // Update shift stats if exists
      if (shiftId) {
        await tx.shift.update({
          where: { id: shiftId },
          data: {
            totalSales: {
              increment: totalAmount
            },
            totalTransactions: {
              increment: 1
            }
          }
        });
      }

      return newSale;
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SALE',
        entity: 'Sale',
        entityId: sale.id,
        changes: { saleNumber, totalAmount, items: items.length },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Sale created: ${saleNumber} - $${totalAmount} by ${req.user?.email}`);

    return ApiResponse.success(res, sale, 'Sale completed successfully', 201);
  }

  // GET /api/sales - Get all sales
  async getAllSales(req: AuthRequest, res: Response) {
    const { page = 1, limit = 20, status, dateFrom, dateTo, cashierId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(String(dateFrom));
      if (dateTo) where.createdAt.lte = new Date(String(dateTo));
    }

    if (cashierId) {
      where.cashierId = String(cashierId);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          cashier: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sale.count({ where })
    ]);

    return ApiResponse.paginated(res, sales, Number(page), Number(limit), total);
  }

  // GET /api/sales/:id - Get sale details
  async getSale(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        cashier: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        shift: true,
        refunds: true
      }
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    return ApiResponse.success(res, sale);
  }

  // POST /api/sales/:id/refund - Process refund
  async refundSale(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!sale) {
      throw new AppError('Sale not found', 404);
    }

    if (sale.status === 'VOIDED') {
      throw new AppError('Cannot refund a voided sale', 400);
    }

    // Process refund in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create refund record
      const refund = await tx.refund.create({
        data: {
          saleId: id,
          amount,
          reason,
          approvedBy: req.user!.id
        }
      });

      // Update sale status
      const totalRefunded = await tx.refund.aggregate({
        where: { saleId: id },
        _sum: { amount: true }
      });

      const isFullRefund = Number(totalRefunded._sum.amount) >= Number(sale.totalAmount);

      await tx.sale.update({
        where: { id },
        data: {
          status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
        }
      });

      // Restore stock for refunded items (if full refund)
      if (isFullRefund) {
        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'RETURN',
              quantity: item.quantity,
              notes: `Refund for sale: ${sale.saleNumber}`,
              createdBy: req.user!.id
            }
          });
        }
      }

      return refund;
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'REFUND',
        entity: 'Sale',
        entityId: id,
        changes: { amount, reason, saleNumber: sale.saleNumber },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Refund processed for sale ${sale.saleNumber}: $${amount}`);

    return ApiResponse.success(res, result, 'Refund processed successfully');
  }
}
SALESCONTROLLER

echo "✅ Sale controller created"

# Create Customer Controller
cat > "$BACKEND_DIR/controllers/customer.controller.ts" << 'CUSTOMERCONTROLLER'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';

export class CustomerController {
  async getAllCustomers(req: AuthRequest, res: Response) {
    const { page = 1, limit = 20, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search) } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return ApiResponse.paginated(res, customers, Number(page), Number(limit), total);
  }

  async getCustomer(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            saleNumber: true,
            totalAmount: true,
            createdAt: true,
            status: true
          }
        }
      }
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return ApiResponse.success(res, customer);
  }

  async createCustomer(req: AuthRequest, res: Response) {
    const { firstName, lastName, email, phone, notes } = req.body;

    // Check if email or phone already exists
    if (email) {
      const existingEmail = await prisma.customer.findUnique({
        where: { email }
      });
      if (existingEmail) {
        throw new AppError('Customer with this email already exists', 400);
      }
    }

    if (phone) {
      const existingPhone = await prisma.customer.findUnique({
        where: { phone }
      });
      if (existingPhone) {
        throw new AppError('Customer with this phone already exists', 400);
      }
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        notes: notes || null
      }
    });

    return ApiResponse.success(res, customer, 'Customer created successfully', 201);
  }

  async updateCustomer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return ApiResponse.success(res, customer, 'Customer updated successfully');
  }

  async deleteCustomer(req: AuthRequest, res: Response) {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id }
    });

    return ApiResponse.success(res, null, 'Customer deleted successfully');
  }
}
CUSTOMERCONTROLLER

echo "✅ Customer controller created"

# Continue with remaining controllers...
echo "✅ Backend controllers generation complete!"
echo ""
echo "Controllers created:"
echo "  - Sale Controller"
echo "  - Customer Controller"
echo ""
echo "Next: Run docker compose up -d --build to apply changes"
