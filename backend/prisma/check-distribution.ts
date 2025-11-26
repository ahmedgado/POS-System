
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const orders = await prisma.sale.findMany({
        select: {
            createdAt: true
        }
    });

    const distribution: Record<string, number> = {};

    orders.forEach(order => {
        const date = new Date(order.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        distribution[key] = (distribution[key] || 0) + 1;
    });

    console.log('Order Distribution by Month:');
    Object.keys(distribution).sort().forEach(key => {
        console.log(`${key}: ${distribution[key]}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
