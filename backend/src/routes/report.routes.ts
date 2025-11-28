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

// ==================== DRAWER-PULL REPORT ====================

// Get Drawer-Pull Report Data (JSON)
router.get('/drawer-pull/:shiftId', async (req, res) => {
  try {
    const { shiftId } = req.params;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        cashier: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    const sales = await prisma.sale.findMany({
      where: {
        shiftId,
        status: 'COMPLETED'
      }
    });

    // Calculate sales by payment method
    const cashSales = sales.filter(s => s.paymentMethod === 'CASH');
    const cardSales = sales.filter(s => s.paymentMethod === 'CARD');
    const mobileWallet = sales.filter(s => s.paymentMethod === 'MOBILE_WALLET');

    const cashSalesTotal = cashSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const cardSalesTotal = cardSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const mobileWalletTotal = mobileWallet.reduce((sum, s) => sum + Number(s.totalAmount), 0);

    const expectedCash = Number(shift.startingCash) + cashSalesTotal;
    const actualCash = Number(shift.endingCash || 0);
    const difference = actualCash - expectedCash;

    let overShort: 'OVER' | 'SHORT' | 'BALANCED' = 'BALANCED';
    if (difference > 0.01) overShort = 'OVER';
    else if (difference < -0.01) overShort = 'SHORT';

    res.json({
      shift: {
        id: shift.id,
        cashierName: `${shift.cashier.firstName} ${shift.cashier.lastName}`,
        cashierId: shift.cashier.id,
        startTime: shift.openedAt,
        endTime: shift.closedAt,
        status: shift.status
      },
      cashFlow: {
        openingCash: Number(shift.startingCash),
        cashSales: cashSalesTotal,
        expectedCash,
        actualCash,
        difference,
        overShort
      },
      salesBreakdown: {
        cashSales: { count: cashSales.length, total: cashSalesTotal },
        cardSales: { count: cardSales.length, total: cardSalesTotal },
        mobileWallet: { count: mobileWallet.length, total: mobileWalletTotal },
        totalSales: { count: sales.length, total: sales.reduce((sum, s) => sum + Number(s.totalAmount), 0) }
      },
      transactions: sales.map(s => ({
        time: s.createdAt,
        saleNumber: s.saleNumber,
        amount: Number(s.totalAmount),
        paymentMethod: s.paymentMethod
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate Drawer-Pull Report PDF
router.get('/drawer-pull/:shiftId/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { shiftId } = req.params;
    await reportService.generateDrawerPullReportPDF(shiftId, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Drawer-Pull Report Excel
router.get('/drawer-pull/:shiftId/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { shiftId } = req.params;
    await reportService.generateDrawerPullReportExcel(shiftId, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// ==================== SERVER PRODUCTIVITY REPORT ====================

// Get Server Productivity Report Data (JSON)
router.get('/server-productivity', async (req, res) => {
  try {
    const { startDate, endDate, waiterId } = req.query;

    const where: any = {
      status: 'COMPLETED',
      waiterId: { not: null }
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

    if (waiterId) {
      where.waiterId = waiterId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        waiter: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Group by waiter
    const waiterStats: any = {};
    sales.forEach(sale => {
      const wId = sale.waiterId!;
      if (!waiterStats[wId]) {
        waiterStats[wId] = {
          waiterId: wId,
          name: `${sale.waiter!.firstName} ${sale.waiter!.lastName}`,
          totalSales: 0,
          totalRevenue: 0,
          totalTips: 0,
          avgCheckSize: 0,
          tablesServed: new Set()
        };
      }
      waiterStats[wId].totalSales++;
      waiterStats[wId].totalRevenue += Number(sale.totalAmount);
      waiterStats[wId].totalTips += Number(sale.tipAmount || 0);
      if (sale.tableId) {
        waiterStats[wId].tablesServed.add(sale.tableId);
      }
    });

    // Calculate averages
    const servers = Object.values(waiterStats).map((stat: any) => ({
      ...stat,
      avgCheckSize: stat.totalRevenue / stat.totalSales,
      tablesServed: stat.tablesServed.size
    }));

    // Sort by revenue
    servers.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    const totalRevenue = servers.reduce((sum, s: any) => sum + s.totalRevenue, 0);
    const totalTips = servers.reduce((sum, s: any) => sum + s.totalTips, 0);

    res.json({
      servers,
      topPerformer: servers[0] || null,
      totalRevenue,
      totalTips
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate Server Productivity Report PDF
router.get('/server-productivity/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate, waiterId } = req.query;
    await reportService.generateServerProductivityReportPDF({ startDate, endDate, waiterId }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// Generate Server Productivity Report Excel
router.get('/server-productivity/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate, waiterId } = req.query;
    await reportService.generateServerProductivityReportExcel({ startDate, endDate, waiterId }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// ==================== HOURLY INCOME REPORT ====================

router.get('/hourly-income', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = { status: 'COMPLETED' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const sales = await prisma.sale.findMany({ where });

    const hourlyStats: any = {};
    sales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;

      if (!hourlyStats[hourKey]) {
        hourlyStats[hourKey] = { hour: hourKey, salesCount: 0, revenue: 0, avgCheck: 0 };
      }
      hourlyStats[hourKey].salesCount++;
      hourlyStats[hourKey].revenue += Number(sale.totalAmount);
    });

    const hourlyBreakdown = Object.values(hourlyStats).map((stat: any) => ({
      ...stat,
      avgCheck: stat.revenue / stat.salesCount
    }));

    hourlyBreakdown.sort((a: any, b: any) => a.hour.localeCompare(b.hour));

    const totalRevenue = hourlyBreakdown.reduce((sum: any, h: any) => sum + h.revenue, 0);
    const peakHour = hourlyBreakdown.reduce((max: any, h: any) =>
      h.revenue > (max?.revenue || 0) ? h : max, null);

    res.json({ hourlyBreakdown, totalRevenue, peakHour });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/hourly-income/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateHourlyIncomeReportPDF({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/hourly-income/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateHourlyIncomeReportExcel({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// ==================== CARD TRANSACTIONS REPORT ====================

router.get('/card-transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where: any = {
      status: 'COMPLETED',
      paymentMethod: { in: ['CARD', 'MOBILE_WALLET'] }
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = sales.map(sale => ({
      date: sale.createdAt,
      saleNumber: sale.saleNumber,
      paymentMethod: sale.paymentMethod,
      amount: Number(sale.totalAmount),
      cashierName: `${sale.cashier.firstName} ${sale.cashier.lastName}`
    }));

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions,
      totalTransactions: transactions.length,
      totalAmount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/card-transactions/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateCardTransactionsReportPDF({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/card-transactions/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate } = req.query;
    await reportService.generateCardTransactionsReportExcel({ startDate, endDate }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

// ==================== JOURNAL REPORT ====================

router.get('/journal', async (req, res) => {
  try {
    const { startDate, endDate, includeRefunds } = req.query;
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (includeRefunds === 'false') {
      where.status = { not: 'REFUNDED' };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = sales.map(sale => ({
      time: sale.createdAt,
      saleNumber: sale.saleNumber,
      orderType: sale.orderType,
      paymentMethod: sale.paymentMethod,
      amount: Number(sale.totalAmount),
      status: sale.status,
      cashierName: `${sale.cashier.firstName} ${sale.cashier.lastName}`
    }));

    const totalAmount = transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      transactions,
      totalTransactions: transactions.length,
      totalAmount
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/journal/pdf', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate, includeRefunds } = req.query;
    await reportService.generateJournalReportPDF({ startDate, endDate, includeRefunds }, res, language);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

router.get('/journal/excel', async (req, res) => {
  try {
    res.setHeader('Content-Encoding', 'identity');
    const language = req.query.language as string || 'en';
    const { startDate, endDate, includeRefunds } = req.query;
    await reportService.generateJournalReportExcel({ startDate, endDate, includeRefunds }, res, language);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
