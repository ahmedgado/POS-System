import { PrismaClient, Shift, ShiftMode, SystemSettings } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ShiftService {
    /**
     * Get system settings (cached for performance)
     */
    async getSystemSettings(): Promise<SystemSettings> {
        const settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            throw new AppError('System settings not found. Please run database seed.', 500);
        }

        return settings;
    }

    /**
     * Get or create shift based on system settings
     * This is the main entry point for shift management
     */
    async getOrCreateShift(userId: string): Promise<Shift | null> {
        const settings = await this.getSystemSettings();

        // Check for existing open shift
        const existingShift = await prisma.shift.findFirst({
            where: { cashierId: userId, status: 'OPEN' }
        });

        if (existingShift) {
            return existingShift;
        }

        // Handle based on shift mode
        switch (settings.shiftMode) {
            case 'MANUAL':
                if (settings.requireShiftForSales) {
                    throw new AppError('No open shift. Please open a shift first.', 400);
                }
                return null; // Allow sale without shift if not required

            case 'AUTOMATIC':
            case 'HYBRID':
            case 'ON_DEMAND':
                return await this.autoCreateShift(userId, settings);

            default:
                throw new AppError('Invalid shift mode', 500);
        }
    }

    /**
     * Auto-create shift for a user
     */
    async autoCreateShift(userId: string, settings?: SystemSettings): Promise<Shift> {
        if (!settings) {
            settings = await this.getSystemSettings();
        }

        const shiftCount = await prisma.shift.count();
        const shiftNumber = `SHIFT-${new Date().getFullYear()}${String(shiftCount + 1).padStart(6, '0')}`;

        const shift = await prisma.shift.create({
            data: {
                shiftNumber,
                cashierId: userId,
                startingCash: settings.shiftStartingCash,
                status: 'OPEN',
                autoOpened: true,
                openedBy: userId // Track who triggered auto-open
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

        logger.info(`Auto-created shift: ${shiftNumber} for user ${userId} (mode: ${settings.shiftMode})`);

        return shift;
    }

    /**
     * Auto-open shift on login for AUTOMATIC mode
     * Creates a shift for the first user who logs in after the configured start time
     */
    async autoOpenShiftOnLogin(userId: string): Promise<Shift | null> {
        const settings = await this.getSystemSettings();

        // Only auto-open on login in AUTOMATIC mode
        if (settings.shiftMode !== 'AUTOMATIC') {
            return null;
        }

        // Check if start time is configured
        if (!settings.autoShiftStartTime) {
            return null;
        }

        // Check if user already has an open shift
        const existingShift = await prisma.shift.findFirst({
            where: { cashierId: userId, status: 'OPEN' }
        });

        if (existingShift) {
            return existingShift; // Already has a shift
        }

        // Parse the configured start time
        const now = new Date();
        const [startHour, startMinute] = settings.autoShiftStartTime.split(':').map(Number);
        const startTimeToday = new Date(now);
        startTimeToday.setHours(startHour, startMinute, 0, 0);

        // Check if we're past the start time
        if (now >= startTimeToday) {
            // Check if any shift has been opened today (to ensure only first login creates it)
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);

            const shiftsToday = await prisma.shift.count({
                where: {
                    openedAt: {
                        gte: todayStart
                    }
                }
            });

            // Only create if no shifts have been opened today
            if (shiftsToday === 0) {
                logger.info(`Auto-opening shift for first login of the day: ${userId} (start time: ${settings.autoShiftStartTime})`);
                return await this.autoCreateShift(userId, settings);
            }
        }

        return null;
    }

    /**
     * Calculate shift totals from SalePayment table
     * This fixes the critical bug where split payments weren't counted
     */
    async calculateShiftTotals(shiftId: string): Promise<{
        cashSales: number;
        cardSales: number;
        mobileSales: number;
        splitSales: number;
        totalSales: number;
        totalTransactions: number;
        totalTips: number;
        totalServiceCharges: number;
        totalDiscounts: number;
        totalTax: number;
        refundCount: number;
        voidCount: number;
    }> {
        // Get all sales for this shift
        const sales = await prisma.sale.findMany({
            where: { shiftId, status: 'COMPLETED' },
            include: {
                payments: true // Include SalePayment records
            }
        });

        // Calculate payment method breakdown
        let cashSales = 0;
        let cardSales = 0;
        let mobileSales = 0;
        let splitSales = 0;

        for (const sale of sales) {
            if (sale.payments && sale.payments.length > 0) {
                // Use SalePayment table (new split payment support)
                for (const payment of sale.payments) {
                    switch (payment.paymentMethod) {
                        case 'CASH':
                            cashSales += Number(payment.amount);
                            break;
                        case 'CARD':
                            cardSales += Number(payment.amount);
                            break;
                        case 'MOBILE_WALLET':
                            mobileSales += Number(payment.amount);
                            break;
                    }
                }

                // If multiple payments, count as split
                if (sale.payments.length > 1) {
                    splitSales += Number(sale.totalAmount);
                }
            } else {
                // Fallback to old paymentMethod field for backward compatibility
                switch (sale.paymentMethod) {
                    case 'CASH':
                        cashSales += Number(sale.totalAmount);
                        break;
                    case 'CARD':
                        cardSales += Number(sale.totalAmount);
                        break;
                    case 'MOBILE_WALLET':
                        mobileSales += Number(sale.totalAmount);
                        break;
                    case 'SPLIT':
                        splitSales += Number(sale.totalAmount);
                        break;
                }
            }
        }

        // Calculate other statistics
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalTransactions = sales.length;
        const totalTips = sales.reduce((sum, sale) => sum + Number(sale.tipAmount || 0), 0);
        const totalServiceCharges = sales.reduce((sum, sale) => sum + Number(sale.serviceCharge || 0), 0);
        const totalDiscounts = sales.reduce((sum, sale) => sum + Number(sale.discountAmount || 0), 0);
        const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount || 0), 0);

        // Count refunds and voids
        const refundCount = await prisma.sale.count({
            where: { shiftId, status: 'REFUNDED' }
        });

        const voidCount = await prisma.sale.count({
            where: { shiftId, status: 'VOIDED' }
        });

        return {
            cashSales,
            cardSales,
            mobileSales,
            splitSales,
            totalSales,
            totalTransactions,
            totalTips,
            totalServiceCharges,
            totalDiscounts,
            totalTax,
            refundCount,
            voidCount
        };
    }

    /**
     * Auto-close a shift with proper calculations
     */
    async closeShiftAutomatically(shift: Shift): Promise<Shift> {
        const totals = await this.calculateShiftTotals(shift.id);

        // Calculate expected cash (starting cash + cash sales)
        const expectedCash = Number(shift.startingCash) + totals.cashSales;

        const updatedShift = await prisma.shift.update({
            where: { id: shift.id },
            data: {
                endingCash: expectedCash, // Assume no discrepancy for auto-close
                expectedCash,
                discrepancy: 0,
                status: 'CLOSED',
                closedAt: new Date(),
                autoClosed: true,

                // Update payment breakdown
                cashSales: totals.cashSales,
                cardSales: totals.cardSales,
                mobileSales: totals.mobileSales,
                splitSales: totals.splitSales,

                // Update statistics
                totalSales: totals.totalSales,
                totalTransactions: totals.totalTransactions,
                totalTips: totals.totalTips,
                totalServiceCharges: totals.totalServiceCharges,
                totalDiscounts: totals.totalDiscounts,
                totalTax: totals.totalTax,
                refundCount: totals.refundCount,
                voidCount: totals.voidCount,

                notes: 'Automatically closed by system'
            },
            include: {
                cashier: true
            }
        });

        logger.info(`Auto-closed shift: ${shift.shiftNumber} - Total: $${totals.totalSales}`);

        return updatedShift;
    }

    /**
     * Auto-close shifts based on schedule (for AUTOMATIC mode)
     * Called by cron job
     */
    async autoCloseShifts(): Promise<void> {
        const settings = await this.getSystemSettings();

        if (settings.shiftMode !== 'AUTOMATIC') {
            return; // Only auto-close in AUTOMATIC mode
        }

        if (!settings.autoShiftEndTime) {
            logger.warn('Auto-close time not configured');
            return;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Parse the configured end time
        const [endHour, endMinute] = settings.autoShiftEndTime.split(':').map(Number);
        const endTimeToday = new Date(now);
        endTimeToday.setHours(endHour, endMinute, 0, 0);

        // Only close if we're past the end time
        if (now >= endTimeToday) {
            const openShifts = await prisma.shift.findMany({
                where: {
                    status: 'OPEN',
                    // Only close shifts that were opened before the end time
                    openedAt: {
                        lt: endTimeToday
                    }
                }
            });

            if (openShifts.length > 0) {
                logger.info(`Auto-closing ${openShifts.length} open shifts (scheduled time: ${settings.autoShiftEndTime}, current: ${currentTime})`);

                for (const shift of openShifts) {
                    try {
                        await this.closeShiftAutomatically(shift);
                    } catch (error) {
                        logger.error(`Failed to auto-close shift ${shift.shiftNumber}:`, error);
                    }
                }
            }
        }
    }

    /**
     * Close shifts due to inactivity (for ON_DEMAND mode)
     * Called by cron job
     */
    async closeInactiveShifts(inactivityMinutes?: number): Promise<void> {
        const settings = await this.getSystemSettings();

        if (settings.shiftMode !== 'ON_DEMAND') {
            return; // Only close inactive shifts in ON_DEMAND mode
        }

        const timeout = inactivityMinutes || settings.inactivityTimeout || 30;
        const cutoffTime = new Date(Date.now() - timeout * 60 * 1000);

        // Find shifts where the last sale was before cutoff time
        const inactiveShifts = await prisma.shift.findMany({
            where: {
                status: 'OPEN',
                sales: {
                    every: {
                        createdAt: { lt: cutoffTime }
                    }
                }
            }
        });

        logger.info(`Closing ${inactiveShifts.length} inactive shifts (timeout: ${timeout} minutes)`);

        for (const shift of inactiveShifts) {
            try {
                await this.closeShiftAutomatically(shift);
            } catch (error) {
                logger.error(`Failed to close inactive shift ${shift.shiftNumber}:`, error);
            }
        }
    }
}

export default new ShiftService();
