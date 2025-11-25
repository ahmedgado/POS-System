import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import shiftService from '../services/shift.service';

export class ShiftController {
  // POST /api/shifts/open - Open new shift
  async openShift(req: AuthRequest, res: Response) {
    const { startingCash } = req.body;

    // Check if user already has an open shift
    const existingShift = await prisma.shift.findFirst({
      where: {
        cashierId: req.user!.id,
        status: 'OPEN'
      }
    });

    if (existingShift) {
      throw new AppError('You already have an open shift. Please close it first.', 400);
    }

    // Generate shift number
    const shiftCount = await prisma.shift.count();
    const shiftNumber = `SHIFT-${new Date().getFullYear()}${String(shiftCount + 1).padStart(6, '0')}`;

    // Create shift
    const shift = await prisma.shift.create({
      data: {
        shiftNumber,
        cashierId: req.user!.id,
        startingCash,
        status: 'OPEN',
        autoOpened: false,
        openedBy: req.user!.id // Track who manually opened the shift
      },
      include: {
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SHIFT_OPEN',
        entity: 'Shift',
        entityId: shift.id,
        changes: { shiftNumber, startingCash },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Shift opened: ${shiftNumber} by ${req.user?.email}`);

    return ApiResponse.success(res, shift, 'Shift opened successfully', 201);
  }

  // POST /api/shifts/close - Close current user's open shift
  async closeCurrentShift(req: AuthRequest, res: Response) {
    const { endingCash, notes } = req.body;

    // Find user's open shift
    const shift = await prisma.shift.findFirst({
      where: {
        cashierId: req.user!.id,
        status: 'OPEN'
      }
    });

    if (!shift) {
      throw new AppError('No open shift found', 404);
    }

    // Calculate shift totals using ShiftService (CRITICAL BUG FIX)
    const totals = await shiftService.calculateShiftTotals(shift.id);

    // Calculate expected cash from actual cash payments
    const expectedCash = Number(shift.startingCash) + totals.cashSales;
    const discrepancy = Number(endingCash) - expectedCash;

    // Close shift with all calculated data
    const updatedShift = await prisma.shift.update({
      where: { id: shift.id },
      data: {
        endingCash,
        expectedCash,
        discrepancy,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: req.user!.id,
        notes,

        // Payment method breakdown
        cashSales: totals.cashSales,
        cardSales: totals.cardSales,
        mobileSales: totals.mobileSales,
        splitSales: totals.splitSales,

        // Enhanced statistics
        totalSales: totals.totalSales,
        totalTransactions: totals.totalTransactions,
        totalTips: totals.totalTips,
        totalServiceCharges: totals.totalServiceCharges,
        totalDiscounts: totals.totalDiscounts,
        totalTax: totals.totalTax,
        refundCount: totals.refundCount,
        voidCount: totals.voidCount
      },
      include: {
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SHIFT_CLOSE',
        entity: 'Shift',
        entityId: shift.id,
        changes: {
          endingCash,
          expectedCash,
          discrepancy,
          notes,
          cashSales: totals.cashSales,
          totalSales: totals.totalSales
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Shift closed: ${shift.shiftNumber} by ${req.user?.email} - Discrepancy: $${discrepancy.toFixed(2)}`);

    return ApiResponse.success(res, updatedShift, 'Shift closed successfully');
  }

  // POST /api/shifts/:id/close - Close shift
  async closeShift(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { endingCash, notes } = req.body;

    // Get shift
    const shift = await prisma.shift.findUnique({
      where: { id }
    });

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    if (shift.cashierId !== req.user!.id) {
      throw new AppError('You can only close your own shift', 403);
    }

    if (shift.status !== 'OPEN') {
      throw new AppError('Shift is already closed', 400);
    }

    // Calculate shift totals using ShiftService (CRITICAL BUG FIX)
    const totals = await shiftService.calculateShiftTotals(shift.id);

    // Calculate expected cash from actual cash payments
    const expectedCash = Number(shift.startingCash) + totals.cashSales;
    const discrepancy = Number(endingCash) - expectedCash;

    // Close shift with all calculated data
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        endingCash,
        expectedCash,
        discrepancy,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: req.user!.id,
        notes,

        // Payment method breakdown
        cashSales: totals.cashSales,
        cardSales: totals.cardSales,
        mobileSales: totals.mobileSales,
        splitSales: totals.splitSales,

        // Enhanced statistics
        totalSales: totals.totalSales,
        totalTransactions: totals.totalTransactions,
        totalTips: totals.totalTips,
        totalServiceCharges: totals.totalServiceCharges,
        totalDiscounts: totals.totalDiscounts,
        totalTax: totals.totalTax,
        refundCount: totals.refundCount,
        voidCount: totals.voidCount
      },
      include: {
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SHIFT_CLOSE',
        entity: 'Shift',
        entityId: id,
        changes: {
          shiftNumber: shift.shiftNumber,
          endingCash,
          expectedCash,
          discrepancy,
          cashSales: totals.cashSales,
          totalSales: totals.totalSales,
          totalTransactions: totals.totalTransactions
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Shift closed: ${shift.shiftNumber} - Discrepancy: $${discrepancy.toFixed(2)}`);

    return ApiResponse.success(res, updatedShift, 'Shift closed successfully');
  }

  // GET /api/shifts - Get all shifts
  async getAllShifts(req: AuthRequest, res: Response) {
    const { page = 1, limit = 20, status, cashierId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (cashierId) {
      where.cashierId = String(cashierId);
    }

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({
        where,
        skip,
        take,
        include: {
          cashier: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { openedAt: 'desc' }
      }),
      prisma.shift.count({ where })
    ]);

    // Map shifts to include cashierName and difference fields for frontend
    const mappedShifts = shifts.map((shift: any) => ({
      ...shift,
      cashierName: shift.cashier ? `${shift.cashier.firstName} ${shift.cashier.lastName}` : 'Unknown',
      difference: shift.discrepancy,
      startTime: shift.openedAt,
      endTime: shift.closedAt
    }));

    return ApiResponse.paginated(res, mappedShifts, Number(page), Number(limit), total);
  }

  // GET /api/shifts/:id - Get shift details
  async getShift(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        cashier: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        sales: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: { items: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    return ApiResponse.success(res, shift);
  }

  // GET /api/shifts/current - Get current user's open shift
  async getCurrentShift(req: AuthRequest, res: Response) {
    const shift = await prisma.shift.findFirst({
      where: {
        cashierId: req.user!.id,
        status: 'OPEN'
      },
      include: {
        cashier: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        sales: {
          where: { status: 'COMPLETED' },
          select: {
            totalAmount: true
          }
        }
      }
    });

    if (!shift) {
      return ApiResponse.success(res, null, 'No open shift found');
    }

    // Calculate current totals for open shift
    const totalSales = shift.sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const expectedCash = Number(shift.startingCash) + totalSales; // For now, assume all sales are cash

    // Map database fields to frontend interface
    const mappedShift = {
      ...shift,
      startTime: shift.openedAt,
      endTime: shift.closedAt,
      cashierName: `${shift.cashier.firstName} ${shift.cashier.lastName}`,
      totalSales,
      totalTransactions: shift.sales.length,
      expectedCash,
      difference: shift.discrepancy
    };

    return ApiResponse.success(res, mappedShift);
  }
}
