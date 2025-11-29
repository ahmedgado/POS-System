import { prisma } from '../config/database';

export interface LoyaltyConfig {
    pointsPerDollar: number;      // e.g., 1 point per $1
    pointsToRedeem: number;        // e.g., 100 points minimum
    redemptionValue: number;       // e.g., 100 points = $10
}

export interface LoyaltyBalance {
    customerId: string;
    currentPoints: number;
    lifetimePoints: number;
    pointsValue: number;
}

export interface RedemptionResult {
    pointsRedeemed: number;
    discountAmount: number;
    remainingPoints: number;
}

export class LoyaltyService {
    // Cache for loyalty configuration
    private configCache: LoyaltyConfig | null = null;
    private configCacheTime: number = 0;
    private readonly CACHE_TTL = 60000; // 1 minute cache

    /**
     * Get loyalty configuration from database (with caching)
     */
    private async getConfig(): Promise<LoyaltyConfig> {
        const now = Date.now();

        // Return cached config if still valid
        if (this.configCache && (now - this.configCacheTime) < this.CACHE_TTL) {
            return this.configCache;
        }

        // Fetch from database
        const settings = await prisma.systemSettings.findFirst();

        if (!settings) {
            // Return defaults if no settings found
            this.configCache = {
                pointsPerDollar: 1,
                pointsToRedeem: 100,
                redemptionValue: 10
            };
        } else {
            this.configCache = {
                pointsPerDollar: Number(settings.loyaltyPointsPerDollar),
                pointsToRedeem: settings.loyaltyPointsToRedeem,
                redemptionValue: Number(settings.loyaltyRedemptionValue)
            };
        }

        this.configCacheTime = now;
        return this.configCache;
    }

    /**
     * Calculate points earned for a purchase amount
     */
    async calculatePointsEarned(amount: number): Promise<number> {
        const config = await this.getConfig();
        return Math.floor(amount * config.pointsPerDollar);
    }

    /**
     * Calculate dollar value of points
     */
    async getPointsValue(points: number): Promise<number> {
        const config = await this.getConfig();
        return (points / config.pointsToRedeem) * config.redemptionValue;
    }

    /**
     * Add points to customer account
     */
    async addPoints(customerId: string, points: number): Promise<void> {
        await prisma.customer.update({
            where: { id: customerId },
            data: {
                loyaltyPoints: {
                    increment: points
                }
            }
        });
    }

    /**
     * Redeem points for discount
     * Returns the discount amount and updates customer points
     */
    async redeemPoints(customerId: string, pointsToRedeem: number): Promise<RedemptionResult> {
        const config = await this.getConfig();

        // Validate minimum redemption
        if (pointsToRedeem < config.pointsToRedeem) {
            throw new Error(`Minimum ${config.pointsToRedeem} points required to redeem`);
        }

        // Get customer
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: { loyaltyPoints: true }
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Check if customer has enough points
        if (customer.loyaltyPoints < pointsToRedeem) {
            throw new Error(`Insufficient points. Customer has ${customer.loyaltyPoints} points`);
        }

        // Calculate discount
        const discountAmount = await this.getPointsValue(pointsToRedeem);

        // Deduct points
        await prisma.customer.update({
            where: { id: customerId },
            data: {
                loyaltyPoints: {
                    decrement: pointsToRedeem
                }
            }
        });

        return {
            pointsRedeemed: pointsToRedeem,
            discountAmount,
            remainingPoints: customer.loyaltyPoints - pointsToRedeem
        };
    }

    /**
     * Get customer loyalty balance
     */
    async getLoyaltyBalance(customerId: string): Promise<LoyaltyBalance> {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                loyaltyPoints: true
            }
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return {
            customerId: customer.id,
            currentPoints: customer.loyaltyPoints,
            lifetimePoints: customer.loyaltyPoints, // TODO: Track separately if needed
            pointsValue: await this.getPointsValue(customer.loyaltyPoints)
        };
    }

    /**
     * Get loyalty configuration (public method)
     */
    async getLoyaltyConfig(): Promise<LoyaltyConfig> {
        return this.getConfig();
    }

    /**
     * Clear configuration cache (useful after settings update)
     */
    clearCache(): void {
        this.configCache = null;
        this.configCacheTime = 0;
    }
}

export default new LoyaltyService();
