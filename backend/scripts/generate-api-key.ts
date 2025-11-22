import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function generateApiKey() {
    const name = process.argv[2] || 'Default Agent';

    // Generate a secure random key
    const key = 'pk_live_' + crypto.randomBytes(24).toString('hex');

    try {
        const apiKey = await prisma.apiKey.create({
            data: {
                key,
                name,
                description: 'Generated via script for print agent'
            }
        });

        console.log('\n✅ API Key Generated Successfully!');
        console.log('----------------------------------------');
        console.log(`Name: ${apiKey.name}`);
        console.log(`Key:  ${apiKey.key}`);
        console.log('----------------------------------------');
        console.log('Use this key in your print agent .env file as API_TOKEN');
        console.log('Note: This key never expires unless you delete it from the database.\n');

    } catch (error) {
        console.error('Error generating key:', error);
    } finally {
        await prisma.$disconnect();
    }
}

generateApiKey();
