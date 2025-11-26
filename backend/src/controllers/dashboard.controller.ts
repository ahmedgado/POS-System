import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export class DashboardController {
  // GET /api/dashboard/stats - Get dashboard statistics
  async getDashboardStats(_req: AuthRequest, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Start of the current month (midnight)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = now;
    const monthName = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Get today's sales
    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // Monthly aggregation for overall statistics
    const monthSales = await prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
          lt: monthEnd
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // Get all-time sales
    const totalSalesData = await prisma.sale.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // Get today's total items sold
    const todayItems = await prisma.saleItem.aggregate({
      where: {
        sale: {
          createdAt: {
            gte: today,
            lt: tomorrow
          },
          status: 'COMPLETED'
        }
      },
      _sum: {
        quantity: true
      }
    });

    // Get low stock products
    const lowStockCount = await prisma.product.count({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockAlert
        },
        isActive: true
      }
    });

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });

    // Get recent sales (limit 5)
    const recentSales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'COMPLETED' },
      include: {
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    // Get top products (limit 5)
    const topProductsData = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: product?.name || 'Unknown',
          sold: item._sum.quantity || 0,
          revenue: Number(item._sum.totalPrice) || 0
        };
      })
    );

    // Get sales by category
    const categoryData = await prisma.$queryRaw<any[]>`
      SELECT
        c.name as category,
        COALESCE(SUM(si."totalPrice"), 0) as total
      FROM categories c
      LEFT JOIN products p ON p."categoryId" = c.id
      LEFT JOIN sale_items si ON si."productId" = p.id
      LEFT JOIN sales s ON s.id = si."saleId" AND s.status = 'COMPLETED'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `;

    const totalCategoryRevenue = categoryData.reduce((sum, cat) => sum + Number(cat.total), 0);
    const salesByCategory = categoryData.map((cat) => ({
      category: cat.category,
      total: Number(cat.total),
      percentage: totalCategoryRevenue > 0 ? (Number(cat.total) / totalCategoryRevenue) * 100 : 0
    }));

    const stats = {
      monthName,
      totalSales: monthSales._count,
      totalRevenue: Number(monthSales._sum.totalAmount) || 0,
      totalOrders: monthSales._count,
      totalProducts,
      todaySales: todaySales._count,
      todayRevenue: Number(todaySales._sum.totalAmount) || 0,
      todayOrders: todayItems._sum.quantity || 0,
      lowStockProducts: lowStockCount,
      recentSales: recentSales.map((sale) => ({
        id: sale.id,
        total: Number(sale.totalAmount),
        items: sale._count.items,
        createdAt: sale.createdAt.toISOString(),
        cashierName: `${sale.cashier.firstName} ${sale.cashier.lastName}`
      })),
      topProducts,
      salesByCategory
    };

    return res.json(stats);
  }

  // GET /api/dashboard/sales-trend - Get sales trend data
  async getSalesTrend(req: AuthRequest, res: Response) {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const salesData = await prisma.sale.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    // Group by date
    const trendData = salesData.reduce((acc: any, sale: any) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          count: 0
        };
      }
      acc[date].total += Number(sale._sum.totalAmount) || 0;
      acc[date].count += sale._count;
      return acc;
    }, {});

    const trend = Object.values(trendData);

    return res.json(trend);
  }

  // GET /api/dashboard/top-products - Get top selling products
  async getTopProducts(req: AuthRequest, res: Response) {
    const { limit = 10 } = req.query;

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: Number(limit)
    });

    // Get product details
    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            imageUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        });

        return {
          product,
          quantitySold: item._sum.quantity,
          totalRevenue: Number(item._sum.totalPrice)
        };
      })
    );

    return res.json(productsWithDetails);
  }

  // GET /api/dashboard/recent-transactions - Get recent transactions
  async getRecentTransactions(req: AuthRequest, res: Response) {
    const { limit = 10 } = req.query;

    const transactions = await prisma.sale.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        cashier: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return res.json(transactions);
  }

  // GET /api/dashboard/sales-by-category - Get sales by category
  async getSalesByCategory(_req: AuthRequest, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categoryData = await prisma.$queryRaw`
      SELECT
        c.id,
        c.name,
        COUNT(DISTINCT s.id) as sales_count,
        SUM(si.total_price) as total_revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN sale_items si ON si.product_id = p.id
      LEFT JOIN sales s ON s.id = si.sale_id AND s.status = 'COMPLETED'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `;

    return res.json(categoryData);
  }

  // GET /api/dashboard/payment-methods - Get payment methods breakdown
  async getPaymentMethodsBreakdown(_req: AuthRequest, res: Response) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentData = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      _sum: {
        totalAmount: true
      },
      _count: true
    });

    const breakdown = paymentData.map((item: any) => ({
      method: item.paymentMethod,
      total: Number(item._sum.totalAmount) || 0,
      count: item._count
    }));

    return res.json(breakdown);
  }
}
