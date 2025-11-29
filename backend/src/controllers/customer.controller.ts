import { Request, Response } from 'express';
import { prisma } from '../config/database';
import loyaltyService from '../services/loyalty.service';

export class CustomerController {
  // Create customer
  async createCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, email, phone, notes } = req.body;

      // Check if customer with email or phone already exists
      if (email) {
        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
          return res.status(400).json({ message: 'Customer with this email already exists' });
        }
      }

      const customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          notes
        }
      });

      return res.status(201).json(customer);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Get all customers
  async getCustomers(req: Request, res: Response) {
    try {
      const { search, page = 1, limit = 25 } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } }
        ];
      }

      // Get total count
      const totalCount = await prisma.customer.count({ where });

      const customers = await prisma.customer.findMany({
        where,
        include: {
          sales: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      // Convert Decimal fields to numbers for frontend
      const customersWithNumbers = customers.map(customer => ({
        ...customer,
        storeCredit: Number(customer.storeCredit),
        totalSpent: Number(customer.totalSpent),
        sales: customer.sales.map(sale => ({
          ...sale,
          totalAmount: Number(sale.totalAmount)
        }))
      }));

      // Return with pagination metadata
      res.json({
        data: customersWithNumbers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
          hasMore: (Number(page) * Number(limit)) < totalCount
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get customer by ID
  async getCustomerById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          sales: {
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
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Calculate total spent
      const totalSpent = customer.sales.reduce((sum: number, sale: any) => {
        return sale.status === 'COMPLETED' ? sum + sale.totalAmount : sum;
      }, 0);

      return res.json({
        ...customer,
        totalSpent,
        totalPurchases: customer.sales.filter((s: any) => s.status === 'COMPLETED').length
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Update customer
  async updateCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, city, address, active, notes, loyaltyPoints } = req.body;

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          phone,
          city,
          address,
          active,
          notes,
          loyaltyPoints
        }
      });

      return res.json(customer);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Customer not found' });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  // Delete customer
  async deleteCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Check if customer has sales
      const salesCount = await prisma.sale.count({
        where: { customerId: id }
      });

      if (salesCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete customer with existing sales. Consider deactivating instead.'
        });
      }

      await prisma.customer.delete({
        where: { id }
      });

      return res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Customer not found' });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  // Get customer purchase history
  async getPurchaseHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const where: any = { customerId: id, status: 'COMPLETED' };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const sales = await prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Quick search customers (for POS autocomplete)
  async searchCustomers(req: Request, res: Response) {
    try {
      const { q } = req.query;

      const where: any = {};

      if (q) {
        where.OR = [
          { firstName: { contains: q as string, mode: 'insensitive' } },
          { lastName: { contains: q as string, mode: 'insensitive' } },
          { phone: { contains: q as string } },
          { email: { contains: q as string, mode: 'insensitive' } }
        ];
      }

      const customers = await prisma.customer.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          loyaltyPoints: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });

      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get loyalty balance
  async getLoyaltyBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const balance = await loyaltyService.getLoyaltyBalance(id);
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Redeem loyalty points
  async redeemPoints(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { points } = req.body;

      const result = await loyaltyService.redeemPoints(id, points);
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('Insufficient') || error.message.includes('Minimum')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

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

      // Get all customers with their sales
      const customers = await prisma.customer.findMany({
        include: {
          sales: {
            where: {
              status: 'COMPLETED',
              ...where
            },
            select: {
              totalAmount: true,
              createdAt: true
            }
          }
        }
      });

      // Calculate metrics for each customer
      const customerMetrics = customers.map(customer => {
        const completedSales = customer.sales;
        const totalSpent = completedSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const visitCount = completedSales.length;
        const avgOrderValue = visitCount > 0 ? totalSpent / visitCount : 0;

        // Calculate days since last purchase
        const lastPurchase = completedSales.length > 0
          ? completedSales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
          : null;
        const daysSinceLastPurchase = lastPurchase
          ? Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          totalSpent,
          visitCount,
          avgOrderValue,
          loyaltyPoints: customer.loyaltyPoints,
          lastPurchase,
          daysSinceLastPurchase
        };
      });

      // Sort by total spent
      const topCustomersByRevenue = [...customerMetrics]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      // Sort by visit frequency
      const topCustomersByFrequency = [...customerMetrics]
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 10);

      // Calculate summary stats
      const totalCustomers = customers.length;
      const activeCustomers = customerMetrics.filter(c => c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase <= 30).length;
      const totalRevenue = customerMetrics.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      res.json({
        summary: {
          totalCustomers,
          activeCustomers,
          totalRevenue,
          avgCustomerValue
        },
        topCustomersByRevenue,
        topCustomersByFrequency
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  // Get dashboard insights
  async getDashboardInsights(req: Request, res: Response) {
    try {
      // 1. Total Customers
      const totalCustomers = await prisma.customer.count();

      // 2. New Customers (This Month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const newCustomers = await prisma.customer.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      });

      // 3. Top 5 Customers by Revenue (All Time)
      const topCustomers = await prisma.customer.findMany({
        take: 5,
        orderBy: {
          totalSpent: 'desc'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          totalSpent: true,
          visitCount: true
        }
      });

      // 4. Retention Rate (Active customers in last 90 days / Total customers)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const activeCustomers = await prisma.customer.count({
        where: {
          lastVisit: {
            gte: ninetyDaysAgo
          }
        }
      });

      const retentionRate = totalCustomers > 0
        ? Math.round((activeCustomers / totalCustomers) * 100)
        : 0;

      res.json({
        totalCustomers,
        newCustomers,
        topCustomers,
        retentionRate
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  // Get customer purchase patterns
  async getPurchasePatterns(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get all completed sales for this customer
      const sales = await prisma.sale.findMany({
        where: {
          customerId: id,
          status: 'COMPLETED'
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (sales.length === 0) {
        return res.json({
          mostPurchasedItems: [],
          purchaseFrequency: 'No purchases yet',
          preferredTime: 'N/A'
        });
      }

      // 1. Most Purchased Items
      const itemCounts: { [key: string]: { name: string, count: number } } = {};
      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.product) {
            if (!itemCounts[item.productId]) {
              itemCounts[item.productId] = { name: item.product.name, count: 0 };
            }
            itemCounts[item.productId].count += item.quantity;
          }
        });
      });

      const mostPurchasedItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 2. Purchase Frequency Analysis
      const totalSales = sales.length;
      const firstSale = sales[sales.length - 1].createdAt;
      const lastSale = sales[0].createdAt;
      const daysSinceFirstSale = Math.max(1, Math.ceil((lastSale.getTime() - firstSale.getTime()) / (1000 * 60 * 60 * 24)));
      const frequency = totalSales / daysSinceFirstSale; // sales per day

      let frequencyText = '';
      if (frequency >= 1) {
        frequencyText = 'Daily';
      } else if (frequency >= 0.14) { // approx once a week
        frequencyText = 'Weekly';
      } else if (frequency >= 0.03) { // approx once a month
        frequencyText = 'Monthly';
      } else {
        frequencyText = 'Occasional';
      }

      // 3. Time-based Patterns (Preferred Days/Hours)
      const hourCounts: { [key: number]: number } = {};
      const dayCounts: { [key: number]: number } = {};

      sales.forEach(sale => {
        const date = new Date(sale.createdAt);
        const hour = date.getHours();
        const day = date.getDay();

        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const preferredHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0];
      const preferredDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0];

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const preferredTime = `${days[Number(preferredDay)]}s around ${preferredHour}:00`;

      res.json({
        mostPurchasedItems,
        purchaseFrequency: frequencyText,
        preferredTime
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get customer growth metrics
  async getCustomerGrowth(req: Request, res: Response) {
    try {
      // Get new customers grouped by month for the last 12 months
      const today = new Date();
      const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);

      const customers = await prisma.customer.findMany({
        where: {
          createdAt: {
            gte: twelveMonthsAgo
          }
        },
        select: {
          createdAt: true
        }
      });

      const growthData: { [key: string]: number } = {};

      // Initialize last 12 months with 0
      for (let i = 0; i < 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        growthData[key] = 0;
      }

      // Count customers per month
      customers.forEach(customer => {
        const d = new Date(customer.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (growthData[key] !== undefined) {
          growthData[key]++;
        }
      });

      // Convert to array and sort
      const result = Object.entries(growthData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new CustomerController();
