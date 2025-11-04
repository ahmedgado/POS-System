import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class SaleController {
  // Create new sale
  async createSale(req: Request, res: Response): Promise<Response> {
    try {
      const { customerId, items, paymentMethod, subtotal, taxAmount, discountAmount, totalAmount, cashReceived, changeGiven, shiftId } = req.body;
      const cashierId = (req as any).user.id;

      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in sale' });
      }

      // Generate sale number
      const saleCount = await prisma.sale.count();
      const saleNumber = `SALE-${new Date().getFullYear()}${String(saleCount + 1).padStart(6, '0')}`;

      // Create sale with items
      const sale = await prisma.$transaction(async (tx: any) => {
        // Create sale
        const newSale = await tx.sale.create({
          data: {
            saleNumber,
            cashierId,
            customerId,
            subtotal,
            taxAmount,
            discountAmount: discountAmount || 0,
            totalAmount,
            paymentMethod,
            cashReceived,
            changeGiven,
            shiftId,
            status: 'COMPLETED'
          }
        });

        // Create sale items and update stock
        for (const item of items) {
          await tx.saleItem.create({
            data: {
              saleId: newSale.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || 0,
              discount: item.discount || 0,
              totalPrice: item.totalPrice
            }
          });

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        // Update customer loyalty points if applicable
        if (customerId) {
          const points = Math.floor(totalAmount / 10); // 1 point per 10 currency units
          await tx.customer.update({
            where: { id: customerId },
            data: {
              loyaltyPoints: {
                increment: points
              }
            }
          });
        }

        return newSale;
      });

      const saleWithItems = await prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true,
          cashier: true
        }
      });

      return res.json(saleWithItems);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Get all sales with filters
  async getSales(req: Request, res: Response) {
    try {
      const { startDate, endDate, userId, customerId, paymentMethod, page = 1, limit = 20 } = req.query;

      const where: any = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      if (userId) where.cashierId = userId;
      if (customerId) where.customerId = customerId;
      if (paymentMethod) where.paymentMethod = paymentMethod;

      const sales = await prisma.sale.findMany({
        where,
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
          customer: true,
          cashier: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      // Convert Decimal fields to numbers for frontend
      const salesWithNumbers = sales.map(sale => ({
        ...sale,
        subtotal: Number(sale.subtotal),
        taxAmount: Number(sale.taxAmount),
        discountAmount: Number(sale.discountAmount),
        totalAmount: Number(sale.totalAmount),
        cashReceived: sale.cashReceived ? Number(sale.cashReceived) : null,
        changeGiven: sale.changeGiven ? Number(sale.changeGiven) : null,
        items: sale.items.map(item => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          discount: Number(item.discount),
          totalPrice: Number(item.totalPrice)
        }))
      }));

      // Return sales array directly for frontend compatibility
      res.json(salesWithNumbers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get sale by ID
  async getSaleById(req: Request, res: Response): Promise<Response> {
    try {
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
          cashier: true,
          shift: true
        }
      });

      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      return res.json(sale);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Process refund
  async processRefund(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason, items: refundItems } = req.body;
      const userId = (req as any).user.id;

      const sale = await prisma.$transaction(async (tx: any) => {
        const originalSale = await tx.sale.findUnique({
          where: { id },
          include: { items: true }
        });

        if (!originalSale) {
          throw new Error('Sale not found');
        }

        if (originalSale.status === 'REFUNDED') {
          throw new Error('Sale already refunded');
        }

        // Create refund record
        await tx.refund.create({
          data: {
            saleId: id,
            amount: originalSale.totalAmount,
            reason,
            approvedBy: userId
          }
        });

        // Update sale status
        const updatedSale = await tx.sale.update({
          where: { id },
          data: {
            status: 'REFUNDED'
          }
        });

        // Restore stock for refunded items
        for (const item of refundItems || originalSale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // Deduct loyalty points if customer
        if (originalSale.customerId) {
          const points = Math.floor(originalSale.totalAmount / 10);
          await tx.customer.update({
            where: { id: originalSale.customerId },
            data: {
              loyaltyPoints: {
                decrement: points
              }
            }
          });
        }

        return updatedSale;
      });

      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get sales statistics
  async getSalesStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const where: any = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const [totalSales, completedSales, refundedSales, totalRevenue] = await Promise.all([
        prisma.sale.count({ where }),
        prisma.sale.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.sale.count({ where: { ...where, status: 'REFUNDED' } }),
        prisma.sale.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { totalAmount: true }
        })
      ]);

      res.json({
        totalSales,
        completedSales,
        refundedSales,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new SaleController();
