const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSystemSettings() {
    try {
        // Check if settings already exist
        const existing = await prisma.systemSettings.findFirst();

        if (existing) {
            console.log('✓ System settings already exist');
            return;
        }

        // Create default settings
        const settings = await prisma.systemSettings.create({
            data: {
                businessName: 'POS System',
                currency: 'USD',
                taxRate: 0.15,
                shiftMode: 'MANUAL',
                shiftStartingCash: 100,
                requireShiftForSales: false,
                inactivityTimeout: 30
            }
        });

        console.log('✓ Created default system settings:', settings.id);
    } catch (error) {
        console.error('Error seeding system settings:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedSystemSettings();
