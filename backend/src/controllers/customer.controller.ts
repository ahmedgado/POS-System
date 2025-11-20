import { Request, Response } from 'express';
import { prisma } from '../config/database';

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
      const { firstName, lastName, email, phone, notes, loyaltyPoints } = req.body;

      const customer = await prisma.customer.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          phone,
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
}

export default new CustomerController();
