import { Router } from 'express';
import reportService from '../services/report.service';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get Sales Report Data (JSON)
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: 'COMPLETED'
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by payment method
    const paymentMethods: any = {};
    sales.forEach(sale => {
      if (!paymentMethods[sale.paymentMethod]) {
        paymentMethods[sale.paymentMethod] = { method: sale.paymentMethod, count: 0, total: 0 };
      }
      paymentMethods[sale.paymentMethod].count++;
      paymentMethods[sale.paymentMethod].total += Number(sale.totalAmount);
    });

    res.json({
      totalSales: totalOrders,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      paymentMethods: Object.values(paymentMethods),
      salesByDate: [],
      topProducts: [],
      salesByCategory: []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate Sales Report PDF
router.get('/sales/pdf', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportPDF(req.query, res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Sales Report Excel
router.get('/sales/excel', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportExcel(req.query, res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Inventory Report Excel
router.get('/inventory/excel', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateInventoryReportExcel(res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
