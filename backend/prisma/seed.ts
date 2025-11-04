import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  console.log('Creating categories...');
  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Drinks and beverages'
    }
  });

  const food = await prisma.category.create({
    data: {
      name: 'Food',
      description: 'Food items'
    }
  });

  const snacks = await prisma.category.create({
    data: {
      name: 'Snacks',
      description: 'Snack items'
    }
  });

  // Create users
  console.log('Creating users...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@pos.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const ownerPassword = await bcrypt.hash('owner123', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@pos.com' },
    update: {},
    create: {
      username: 'owner',
      email: 'owner@pos.com',
      password: ownerPassword,
      firstName: 'Store',
      lastName: 'Owner',
      phone: '+1234567891',
      role: UserRole.OWNER,
      status: UserStatus.ACTIVE
    }
  });

  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@pos.com' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@pos.com',
      password: managerPassword,
      firstName: 'Store',
      lastName: 'Manager',
      phone: '+1234567892',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE
    }
  });

  const cashierPassword = await bcrypt.hash('cashier123', 12);
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {},
    create: {
      username: 'cashier',
      email: 'cashier@pos.com',
      password: cashierPassword,
      firstName: 'John',
      lastName: 'Cashier',
      phone: '+1234567893',
      role: UserRole.CASHIER,
      status: UserStatus.ACTIVE
    }
  });

  // Create sample products
  console.log('Creating products...');

  const products = [
    {
      sku: 'BEV001',
      barcode: '1234567890123',
      name: 'Coca Cola 330ml',
      description: 'Refreshing cola drink',
      categoryId: beverages.id,
      price: 1.50,
      cost: 0.80,
      stock: 100,
      lowStockAlert: 20
    },
    {
      sku: 'BEV002',
      barcode: '1234567890124',
      name: 'Water 500ml',
      description: 'Bottled water',
      categoryId: beverages.id,
      price: 1.00,
      cost: 0.40,
      stock: 150,
      lowStockAlert: 30
    },
    {
      sku: 'FOOD001',
      barcode: '1234567890125',
      name: 'Sandwich',
      description: 'Fresh sandwich',
      categoryId: food.id,
      price: 5.00,
      cost: 2.50,
      stock: 50,
      lowStockAlert: 10
    },
    {
      sku: 'FOOD002',
      barcode: '1234567890126',
      name: 'Pizza Slice',
      description: 'Cheese pizza slice',
      categoryId: food.id,
      price: 3.50,
      cost: 1.50,
      stock: 40,
      lowStockAlert: 10
    },
    {
      sku: 'SNK001',
      barcode: '1234567890127',
      name: 'Chips',
      description: 'Potato chips',
      categoryId: snacks.id,
      price: 2.00,
      cost: 1.00,
      stock: 80,
      lowStockAlert: 15
    },
    {
      sku: 'SNK002',
      barcode: '1234567890128',
      name: 'Chocolate Bar',
      description: 'Milk chocolate',
      categoryId: snacks.id,
      price: 1.50,
      cost: 0.70,
      stock: 120,
      lowStockAlert: 25
    }
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData
    });
  }

  // Create sample customers
  console.log('Creating customers...');

  await prisma.customer.createMany({
    data: [
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567894',
        loyaltyPoints: 150
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1234567895',
        loyaltyPoints: 200
      },
      {
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice.williams@example.com',
        phone: '+1234567896',
        loyaltyPoints: 100
      }
    ],
    skipDuplicates: true
  });

  // Create system settings
  console.log('Creating system settings...');

  const settings = [
    { key: 'store_name', value: 'My Store', category: 'general' },
    { key: 'tax_rate', value: '0.10', category: 'financial' },
    { key: 'currency', value: 'USD', category: 'financial' },
    { key: 'receipt_header', value: 'Thank you for your purchase!', category: 'receipt' },
    { key: 'receipt_footer', value: 'Please come again!', category: 'receipt' },
    { key: 'low_stock_alert_enabled', value: 'true', category: 'inventory' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  console.log('✅ Seeding completed!');
  console.log('');
  console.log('👥 Created users:');
  console.log('   Admin:    admin@pos.com    / admin123');
  console.log('   Owner:    owner@pos.com    / owner123');
  console.log('   Manager:  manager@pos.com  / manager123');
  console.log('   Cashier:  cashier@pos.com  / cashier123');
  console.log('');
  console.log('📦 Created 6 products across 3 categories');
  console.log('👤 Created 3 sample customers');
  console.log('⚙️  Created system settings');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
