const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateSKU(category, index) {
  const prefix = category.substring(0, 3).toUpperCase().replace(/\s/g, '');
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

async function main() {
  console.log('🍽️  Starting Restaurant Demo Data Generation...\n');

  // Clear existing restaurant-specific data
  console.log('🗑️  Clearing existing data...');
  await prisma.kitchenTicket.deleteMany({});
  await prisma.saleItemModifier.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.salePayment.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.productModifierGroup.deleteMany({});
  await prisma.modifier.deleteMany({});
  await prisma.modifierGroup.deleteMany({});
  await prisma.productKitchenStation.deleteMany({});
  await prisma.kitchenStation.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('✓ Cleared existing data\n');

  // Create Staff
  console.log('👥 Creating restaurant staff...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@restaurant.com' } });
  const adminUser = existingAdmin || await prisma.user.create({
    data: {
      username: 'admin_restaurant',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Manager',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const waiters = [];
  for (let i = 1; i <= 5; i++) {
    const waiter = await prisma.user.upsert({
      where: { email: `waiter${i}@restaurant.com` },
      update: {},
      create: {
        username: `waiter${i}`,
        email: `waiter${i}@restaurant.com`,
        password: hashedPassword,
        firstName: `Waiter`,
        lastName: `${i}`,
        role: 'CASHIER',
        status: 'ACTIVE'
      }
    });
    waiters.push(waiter);
  }
  console.log(`✓ Created ${waiters.length + 1} staff members\n`);

  // Create Floors
  console.log('🏢 Creating restaurant floors...');
  const groundFloor = await prisma.floor.create({
    data: {
      name: 'Ground Floor - الدور الأرضي',
      description: 'Main dining area with window seating',
      sortOrder: 1,
      isActive: true
    }
  });

  const firstFloor = await prisma.floor.create({
    data: {
      name: 'First Floor - الدور الأول',
      description: 'Family section with private booths',
      sortOrder: 2,
      isActive: true
    }
  });

  const terrace = await prisma.floor.create({
    data: {
      name: 'Terrace - التراس',
      description: 'Outdoor seating area',
      sortOrder: 3,
      isActive: true
    }
  });

  const floors = [groundFloor, firstFloor, terrace];
  console.log(`✓ Created ${floors.length} floors\n`);

  // Create Tables
  console.log('🪑 Creating tables...');
  const tables = [];
  let tableCounter = 0;

  for (const floor of floors) {
    const tablesPerFloor = floor.name.includes('Terrace') ? 8 : 12;

    for (let i = 1; i <= tablesPerFloor; i++) {
      tableCounter++;
      const table = await prisma.table.create({
        data: {
          floorId: floor.id,
          tableNumber: `T${tableCounter}`,
          capacity: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
          status: ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'OCCUPIED'][randomInt(0, 3)],
          positionX: (i % 4) * 100,
          positionY: Math.floor(i / 4) * 100,
          shape: ['SQUARE', 'ROUND', 'RECTANGLE'][randomInt(0, 2)],
          isActive: true
        }
      });
      tables.push(table);
    }
  }
  console.log(`✓ Created ${tables.length} tables\n`);

  // Create Kitchen Stations
  console.log('🍳 Creating kitchen stations...');
  const stations = [
    { name: 'Grill Station - محطة الشواء', description: 'All grilled items', sortOrder: 1 },
    { name: 'Cold Station - المحطة الباردة', description: 'Salads and cold appetizers', sortOrder: 2 },
    { name: 'Hot Station - المحطة الساخنة', description: 'Hot appetizers and main courses', sortOrder: 3 },
    { name: 'Pasta & Pizza - البيتزا والباستا', description: 'Pasta and pizza items', sortOrder: 4 },
    { name: 'Dessert Station - محطة الحلويات', description: 'All desserts and sweets', sortOrder: 5 },
    { name: 'Beverage Bar - بار المشروبات', description: 'All drinks and beverages', sortOrder: 6 }
  ];

  const kitchenStations = [];
  for (const stationData of stations) {
    const station = await prisma.kitchenStation.create({ data: { ...stationData, isActive: true } });
    kitchenStations.push(station);
  }
  console.log(`✓ Created ${kitchenStations.length} kitchen stations\n`);

  // Create Modifier Groups
  console.log('⚙️  Creating modifier groups...');
  const sizeGroup = await prisma.modifierGroup.create({
    data: { name: 'Size - الحجم', isRequired: true, minSelection: 1, maxSelection: 1, sortOrder: 1, isActive: true }
  });

  const spiceLevelGroup = await prisma.modifierGroup.create({
    data: { name: 'Spice Level - مستوى الحرارة', isRequired: false, minSelection: 0, maxSelection: 1, sortOrder: 2, isActive: true }
  });

  const extrasGroup = await prisma.modifierGroup.create({
    data: { name: 'Extras - إضافات', isRequired: false, minSelection: 0, maxSelection: 5, sortOrder: 3, isActive: true }
  });

  // Create Modifiers
  await prisma.modifier.createMany({
    data: [
      { groupId: sizeGroup.id, name: 'Small - صغير', priceAdjustment: 0, sortOrder: 1, isDefault: true, isActive: true },
      { groupId: sizeGroup.id, name: 'Medium - وسط', priceAdjustment: 5, sortOrder: 2, isDefault: false, isActive: true },
      { groupId: sizeGroup.id, name: 'Large - كبير', priceAdjustment: 10, sortOrder: 3, isDefault: false, isActive: true },
      { groupId: spiceLevelGroup.id, name: 'Mild - خفيف', priceAdjustment: 0, sortOrder: 1, isDefault: true, isActive: true },
      { groupId: spiceLevelGroup.id, name: 'Hot - حار', priceAdjustment: 0, sortOrder: 2, isDefault: false, isActive: true },
      { groupId: extrasGroup.id, name: 'Extra Cheese - جبن إضافي', priceAdjustment: 5, sortOrder: 1, isActive: true },
      { groupId: extrasGroup.id, name: 'Bacon - بيكون', priceAdjustment: 8, sortOrder: 2, isActive: true },
    ]
  });
  console.log('✓ Created modifiers\n');

  // Create Menu Categories & Items
  console.log('📦 Creating menu items...');
  const menuCategories = [
    { name: 'Appetizers - المقبلات', items: ['Hummus', 'Falafel', 'Sambousek', 'Soup', 'Salad'] },
    { name: 'Main Courses - الأطباق الرئيسية', items: ['Grilled Chicken', 'Lamb Chops', 'Beef Steak', 'Shish Tawook', 'Mixed Grill'] },
    { name: 'Pizza - البيتزا', items: ['Margherita', 'Pepperoni', 'Vegetarian', 'BBQ Chicken'] },
    { name: 'Burgers - البرغر', items: ['Cheese Burger', 'Chicken Burger', 'Veggie Burger'] },
    { name: 'Desserts - الحلويات', items: ['Baklava', 'Kunafa', 'Cheesecake', 'Ice Cream'] },
    { name: 'Beverages - المشروبات', items: ['Coffee', 'Tea', 'Fresh Juice', 'Smoothie', 'Soft Drinks'] }
  ];

  const products = [];
  let productCounter = 0;

  for (const catData of menuCategories) {
    const category = await prisma.category.create({
      data: { name: catData.name, description: `${catData.name} menu items`, active: true }
    });

    for (const itemName of catData.items) {
      productCounter++;
      const stationId = kitchenStations[randomInt(0, kitchenStations.length - 1)].id;

      const product = await prisma.product.create({
        data: {
          name: itemName,
          sku: generateSKU(catData.name, productCounter),
          barcode: `MENU${String(productCounter).padStart(8, '0')}`,
          categoryId: category.id,
          description: `Delicious ${itemName}`,
          price: randomPrice(10, 100),
          cost: randomPrice(5, 50),
          stock: 999,
          lowStockAlert: 10,
          unit: 'piece',
          imageUrl: `https://via.placeholder.com/300?text=${itemName.replace(/\s/g, '+')}`,
          isActive: true,
          kitchenStations: {
            create: { kitchenStationId: stationId }
          }
        }
      });
      products.push(product);
    }
  }
  console.log(`✓ Created ${products.length} menu items\n`);

  // Link modifiers to products
  console.log('🔗 Linking modifiers to products...');
  for (const product of products) {
    if (product.name.includes('Pizza') || product.name.includes('Burger')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: sizeGroup.id }
      });
    }
  }
  console.log('✓ Linked modifiers\n');

  // Create Customers
  console.log('👤 Creating customers...');
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        firstName: `Customer`,
        lastName: `${i}`,
        email: `customer${i}@restaurant.com`,
        phone: `+966${randomInt(500000000, 599999999)}`,
        loyaltyPoints: randomInt(0, 500),
        totalSpent: randomPrice(0, 3000)
      }
    });
    customers.push(customer);
  }
  console.log(`✓ Created ${customers.length} customers\n`);

  // Create Sample Orders
  console.log('💰 Creating sample restaurant orders...');
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
  const orderStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];

  for (let i = 0; i < 30; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const waiter = waiters[randomInt(0, waiters.length - 1)];
    const orderType = orderTypes[randomInt(0, orderTypes.length - 1)];
    const orderStatus = orderStatuses[randomInt(2, orderStatuses.length - 1)];
    const table = orderType === 'DINE_IN' ? tables[randomInt(0, tables.length - 1)] : null;

    const numItems = randomInt(2, 4);
    const saleItems = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 2);
      const itemSubtotal = product.price * quantity;
      subtotal += parseFloat(itemSubtotal);

      saleItems.push({
        productId: product.id,
        quantity: quantity,
        unitPrice: product.price,
        taxRate: 0.15,
        totalPrice: itemSubtotal
      });
    }

    const discount = Math.random() < 0.2 ? randomPrice(5, 20) : 0;
    const serviceCharge = orderType === 'DINE_IN' ? subtotal * 0.05 : 0;
    const tax = (subtotal - discount + serviceCharge) * 0.15;
    const tips = orderType === 'DINE_IN' && Math.random() < 0.7 ? randomPrice(5, 30) : 0;
    const totalAmount = subtotal - discount + serviceCharge + tax + tips;

    const saleNumber = `SALE-${Date.now()}-${i}`;

    await prisma.sale.create({
      data: {
        saleNumber: saleNumber,
        cashierId: waiter.id,
        customerId: customer.id,
        tableId: table?.id,
        totalAmount: totalAmount,
        subtotal: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        tipAmount: tips,
        orderStatus: orderStatus,
        waiterId: waiter.id,
        paymentMethod: ['CASH', 'CARD', 'MOBILE_WALLET'][randomInt(0, 2)],
        status: 'COMPLETED',
        items: {
          create: saleItems
        }
      }
    });
  }
  console.log(`✓ Created 30 restaurant orders\n`);

  console.log('✅ Restaurant Demo Data Generation Completed!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('Summary:');
  console.log('═══════════════════════════════════════════════');
  console.log(`✓ Staff Users: 6 (1 admin, 5 waiters)`);
  console.log(`✓ Floors: ${floors.length}`);
  console.log(`✓ Tables: ${tables.length}`);
  console.log(`✓ Kitchen Stations: ${kitchenStations.length}`);
  console.log(`✓ Modifier Groups: 3`);
  console.log(`✓ Menu Items: ${products.length}`);
  console.log(`✓ Customers: ${customers.length}`);
  console.log(`✓ Orders: 30`);
  console.log('\nLogin Credentials:');
  console.log('═══════════════════════════════════════════════');
  console.log('Email: admin@restaurant.com');
  console.log('Password: password123');
  console.log('\nWaiter accounts: waiter1@restaurant.com through waiter5@restaurant.com');
  console.log('Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
