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

    // Format sales transactions for detailed view
    const transactions = sales.map(sale => ({
      id: sale.id,
      date: sale.createdAt,
      cashierName: sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName}` : 'N/A',
      customerName: sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'Walk-in',
      items: sale.items.map(item => ({
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        subtotal: item.quantity * Number(item.unitPrice)
      })),
      subtotal: Number(sale.totalAmount) - Number(sale.taxAmount || 0) + Number(sale.discountAmount || 0),
      discount: Number(sale.discountAmount || 0),
      tax: Number(sale.taxAmount || 0),
      total: Number(sale.totalAmount),
      paymentMethod: sale.paymentMethod,
      status: sale.status
    }));

    res.json({
      totalSales: totalOrders,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      paymentMethods: Object.values(paymentMethods),
      transactions,
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
    // Disable compression for PDF responses
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportPDF(req.query, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Sales Report Excel
router.get('/sales/excel', async (req, res) => {
  try {
    // Disable compression for Excel responses
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportExcel(req.query, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Get Inventory Report Data (JSON)
router.get('/inventory', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate totals
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0);
    const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    // Group by category
    const byCategory: any = {};
    products.forEach(p => {
      const cat = p.category.name;
      if (!byCategory[cat]) {
        byCategory[cat] = { category: cat, count: 0, value: 0, stock: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].stock += p.stock;
      byCategory[cat].value += p.stock * Number(p.price);
    });

    // Stock status breakdown
    const stockStatus = {
      inStock: products.filter(p => p.stock > p.lowStockAlert).length,
      lowStock: lowStockCount - outOfStockCount,
      outOfStock: outOfStockCount
    };

    // Format products for detailed view
    const inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category.name,
      stock: p.stock,
      lowStockAlert: p.lowStockAlert,
      price: Number(p.price),
      cost: Number(p.cost || 0),
      value: p.stock * Number(p.price),
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockAlert ? 'Low Stock' : 'In Stock',
      isActive: p.isActive
    }));

    res.json({
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      stockStatus,
      byCategory: Object.values(byCategory),
      inventory
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Cashier Performance Report (JSON)
router.get('/cashier', async (req, res) => {
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
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Group by cashier
    const cashierStats: any = {};
    sales.forEach(sale => {
      const cashierId = sale.cashierId;
      if (!cashierStats[cashierId]) {
        cashierStats[cashierId] = {
          cashierId,
          name: `${sale.cashier.firstName} ${sale.cashier.lastName}`,
          email: sale.cashier.email,
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        };
      }
      cashierStats[cashierId].totalSales++;
      cashierStats[cashierId].totalRevenue += Number(sale.totalAmount);
    });

    // Calculate averages
    const performance = Object.values(cashierStats).map((stat: any) => ({
      ...stat,
      averageOrderValue: stat.totalRevenue / stat.totalSales
    }));

    // Sort by revenue
    performance.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalOrders = sales.length;
    const activeCashiers = Object.keys(cashierStats).length;

    res.json({
      totalRevenue,
      totalOrders,
      activeCashiers,
      averageRevenuePerCashier: activeCashiers > 0 ? totalRevenue / activeCashiers : 0,
      performance
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Financial Report (JSON)
router.get('/financial', async (req, res) => {
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
        items: {
          include: {
            product: {
              select: {
                cost: true
              }
            }
          }
        }
      }
    });

    // Calculate financial metrics
    let totalRevenue = 0;
    let totalCost = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    sales.forEach(sale => {
      totalRevenue += Number(sale.totalAmount);
      totalTax += Number(sale.taxAmount || 0);
      totalDiscount += Number(sale.discountAmount || 0);

      // Calculate cost
      sale.items.forEach(item => {
        totalCost += item.quantity * Number(item.product.cost || 0);
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = grossProfit - totalTax;

    res.json({
      totalRevenue,
      totalCost,
      grossProfit,
      netProfit,
      totalTax,
      totalDiscount,
      profitMargin,
      totalTransactions: sales.length,
      averageTransactionValue: sales.length > 0 ? totalRevenue / sales.length : 0
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate Inventory Report PDF
router.get('/inventory/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    await reportService.generateInventoryReportPDF(res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Inventory Report Excel
router.get('/inventory/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    await reportService.generateInventoryReportExcel(res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Cashier Performance PDF
router.get('/cashier/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateCashierReportPDF({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Cashier Performance Excel
router.get('/cashier/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateCashierReportExcel({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Financial Report PDF
router.get('/financial/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateFinancialReportPDF({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Financial Report Excel
router.get('/financial/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateFinancialReportExcel({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
