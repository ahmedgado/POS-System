import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Restaurant menu categories (Arabic & English)
const RESTAURANT_CATEGORIES = [
  {
    name: 'المقبلات - Appetizers',
    subcategories: ['Cold Mezze', 'Hot Mezze', 'Soups', 'Salads']
  },
  {
    name: 'الأطباق الرئيسية - Main Courses',
    subcategories: ['Grilled', 'Fried', 'Baked', 'Stews', 'Pasta', 'Seafood']
  },
  {
    name: 'البيتزا - Pizza',
    subcategories: ['Classic', 'Specialty', 'Vegetarian', 'Meat Lovers']
  },
  {
    name: 'البرغر - Burgers',
    subcategories: ['Beef', 'Chicken', 'Veggie', 'Premium']
  },
  {
    name: 'الحلويات - Desserts',
    subcategories: ['Arabic Sweets', 'Cakes', 'Ice Cream', 'Pastries']
  },
  {
    name: 'المشروبات - Beverages',
    subcategories: ['Hot Drinks', 'Cold Drinks', 'Fresh Juices', 'Smoothies', 'Soft Drinks']
  }
];

// Restaurant product names
const MENU_ITEMS = {
  'Cold Mezze': ['Hummus', 'Baba Ghanoush', 'Moutabal', 'Tabbouleh', 'Fattoush', 'Labneh', 'Muhammara'],
  'Hot Mezze': ['Falafel', 'Cheese Sambousek', 'Meat Sambousek', 'Fried Kibbeh', 'Grilled Halloumi', 'Arayes'],
  'Soups': ['Lentil Soup', 'Chicken Soup', 'Mushroom Soup', 'Tomato Soup', 'Seafood Soup'],
  'Salads': ['Greek Salad', 'Caesar Salad', 'Rocca Salad', 'Quinoa Salad', 'Arabic Salad'],
  'Grilled': ['Grilled Chicken', 'Lamb Chops', 'Beef Steak', 'Mixed Grill', 'Shish Tawook', 'Kafta'],
  'Fried': ['Fried Chicken', 'Fish & Chips', 'Calamari', 'Shrimp Tempura'],
  'Baked': ['Baked Chicken', 'Lasagna', 'Moussaka', 'Stuffed Vine Leaves'],
  'Stews': ['Chicken Tagine', 'Lamb Stew', 'Okra Stew', 'Green Bean Stew'],
  'Pasta': ['Alfredo Pasta', 'Carbonara', 'Arrabiata', 'Seafood Pasta', 'Pesto Pasta'],
  'Seafood': ['Grilled Salmon', 'Shrimp Scampi', 'Sea Bass', 'Grilled Calamari', 'Paella'],
  'Classic': ['Margherita', 'Pepperoni', 'Hawaiian', 'Four Cheese'],
  'Specialty': ['BBQ Chicken', 'Meat Supreme', 'Vegetarian Supreme', 'Seafood Pizza'],
  'Vegetarian': ['Veggie Delight', 'Mushroom Pizza', 'Spinach & Feta'],
  'Meat Lovers': ['Triple Meat', 'Beef & Bacon', 'Sausage & Pepperoni'],
  'Beef': ['Classic Beef Burger', 'Cheese Burger', 'Mushroom Swiss Burger', 'BBQ Bacon Burger'],
  'Chicken': ['Crispy Chicken Burger', 'Grilled Chicken Burger', 'Spicy Chicken Burger'],
  'Veggie': ['Falafel Burger', 'Veggie Patty Burger', 'Halloumi Burger'],
  'Premium': ['Wagyu Burger', 'Truffle Burger', 'Gourmet Burger'],
  'Arabic Sweets': ['Baklava', 'Kunafa', 'Basbousa', 'Maamoul', 'Qatayef'],
  'Cakes': ['Chocolate Cake', 'Cheesecake', 'Red Velvet', 'Tiramisu', 'Carrot Cake'],
  'Ice Cream': ['Vanilla', 'Chocolate', 'Strawberry', 'Pistachio', 'Mango'],
  'Pastries': ['Croissant', 'Pain au Chocolat', 'Danish Pastry', 'Eclair'],
  'Hot Drinks': ['Arabic Coffee', 'Turkish Coffee', 'Espresso', 'Cappuccino', 'Latte', 'Tea', 'Green Tea'],
  'Cold Drinks': ['Iced Coffee', 'Iced Latte', 'Iced Tea', 'Lemonade'],
  'Fresh Juices': ['Orange', 'Carrot', 'Apple', 'Watermelon', 'Mango', 'Mixed Berry'],
  'Smoothies': ['Berry Smoothie', 'Mango Smoothie', 'Banana Smoothie', 'Tropical Smoothie'],
  'Soft Drinks': ['Cola', 'Diet Cola', 'Lemon Soda', 'Orange Soda', 'Water', 'Sparkling Water']
};

// Arabic & English customer names
const ARABIC_FIRST_NAMES = [
  'أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'عبدالله', 'سعيد', 'ياسر', 'طارق',
  'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سارة', 'نور', 'ليلى', 'رنا', 'هدى'
];

const ARABIC_LAST_NAMES = [
  'الأحمد', 'المحمد', 'العلي', 'الحسن', 'السعيد', 'الخالد', 'العبدالله', 'الياسر',
  'الناصر', 'القاسم', 'العمر', 'الرشيد', 'الفهد', 'الشمري', 'العنزي', 'الدوسري'
];

const ENGLISH_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 'Patricia', 'Jennifer', 'Linda'
];

const ENGLISH_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Rodriguez'
];

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateSKU(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase().replace(/\s/g, '');
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

function generateArabicName(): string {
  const firstName = ARABIC_FIRST_NAMES[randomInt(0, ARABIC_FIRST_NAMES.length - 1)];
  const lastName = ARABIC_LAST_NAMES[randomInt(0, ARABIC_LAST_NAMES.length - 1)];
  return `${firstName} ${lastName}`;
}

function generateEnglishName(): string {
  const firstName = ENGLISH_FIRST_NAMES[randomInt(0, ENGLISH_FIRST_NAMES.length - 1)];
  const lastName = ENGLISH_LAST_NAMES[randomInt(0, ENGLISH_LAST_NAMES.length - 1)];
  return `${firstName} ${lastName}`;
}

function generatePhone(): string {
  return `+966${randomInt(500000000, 599999999)}`;
}

function generateEmail(name: string, index: number): string {
  const cleanName = name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '.');
  return `${cleanName}${index}@restaurant.com`;
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

  // Create Users (Waiters, Chefs, Managers)
  console.log('👥 Creating restaurant staff...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      username: 'admin',
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
          status: ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'OCCUPIED'][randomInt(0, 3)] as any,
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
  const grillStation = await prisma.kitchenStation.create({
    data: {
      name: 'Grill Station - محطة الشواء',
      description: 'All grilled items',
      sortOrder: 1,
      isActive: true
    }
  });

  const coldStation = await prisma.kitchenStation.create({
    data: {
      name: 'Cold Station - المحطة الباردة',
      description: 'Salads and cold appetizers',
      sortOrder: 2,
      isActive: true
    }
  });

  const hotStation = await prisma.kitchenStation.create({
    data: {
      name: 'Hot Station - المحطة الساخنة',
      description: 'Hot appetizers and main courses',
      sortOrder: 3,
      isActive: true
    }
  });

  const pastaStation = await prisma.kitchenStation.create({
    data: {
      name: 'Pasta & Pizza - البيتزا والباستا',
      description: 'Pasta and pizza items',
      sortOrder: 4,
      isActive: true
    }
  });

  const dessertStation = await prisma.kitchenStation.create({
    data: {
      name: 'Dessert Station - محطة الحلويات',
      description: 'All desserts and sweets',
      sortOrder: 5,
      isActive: true
    }
  });

  const beverageStation = await prisma.kitchenStation.create({
    data: {
      name: 'Beverage Bar - بار المشروبات',
      description: 'All drinks and beverages',
      sortOrder: 6,
      isActive: true
    }
  });

  const kitchenStations = [grillStation, coldStation, hotStation, pastaStation, dessertStation, beverageStation];
  console.log(`✓ Created ${kitchenStations.length} kitchen stations\n`);

  // Create Modifier Groups
  console.log('⚙️  Creating modifier groups...');

  const sizeGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Size - الحجم',
      isRequired: true,
      minSelection: 1,
      maxSelection: 1,
      sortOrder: 1,
      isActive: true
    }
  });

  const spiceLevelGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Spice Level - مستوى الحرارة',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      sortOrder: 2,
      isActive: true
    }
  });

  const extrasGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Extras - إضافات',
      isRequired: false,
      minSelection: 0,
      maxSelection: 5,
      sortOrder: 3,
      isActive: true
    }
  });

  const cookingGroup = await prisma.modifierGroup.create({
    data: {
      name: 'Cooking Style - طريقة الطهي',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      sortOrder: 4,
      isActive: true
    }
  });

  console.log('✓ Created 4 modifier groups\n');

  // Create Modifiers
  console.log('🔧 Creating modifiers...');

  // Size modifiers
  await prisma.modifier.createMany({
    data: [
      { groupId: sizeGroup.id, name: 'Small - صغير', priceAdjustment: 0, sortOrder: 1, isDefault: true, isActive: true },
      { groupId: sizeGroup.id, name: 'Medium - وسط', priceAdjustment: 5, sortOrder: 2, isDefault: false, isActive: true },
      { groupId: sizeGroup.id, name: 'Large - كبير', priceAdjustment: 10, sortOrder: 3, isDefault: false, isActive: true },
    ]
  });

  // Spice level modifiers
  await prisma.modifier.createMany({
    data: [
      { groupId: spiceLevelGroup.id, name: 'Mild - خفيف', priceAdjustment: 0, sortOrder: 1, isDefault: true, isActive: true },
      { groupId: spiceLevelGroup.id, name: 'Medium - متوسط', priceAdjustment: 0, sortOrder: 2, isDefault: false, isActive: true },
      { groupId: spiceLevelGroup.id, name: 'Hot - حار', priceAdjustment: 0, sortOrder: 3, isDefault: false, isActive: true },
      { groupId: spiceLevelGroup.id, name: 'Extra Hot - حار جداً', priceAdjustment: 2, sortOrder: 4, isDefault: false, isActive: true },
    ]
  });

  // Extra modifiers
  await prisma.modifier.createMany({
    data: [
      { groupId: extrasGroup.id, name: 'Extra Cheese - جبن إضافي', priceAdjustment: 5, sortOrder: 1, isActive: true },
      { groupId: extrasGroup.id, name: 'Extra Sauce - صوص إضافي', priceAdjustment: 2, sortOrder: 2, isActive: true },
      { groupId: extrasGroup.id, name: 'Bacon - بيكون', priceAdjustment: 8, sortOrder: 3, isActive: true },
      { groupId: extrasGroup.id, name: 'Avocado - أفوكادو', priceAdjustment: 10, sortOrder: 4, isActive: true },
      { groupId: extrasGroup.id, name: 'Mushrooms - فطر', priceAdjustment: 6, sortOrder: 5, isActive: true },
    ]
  });

  // Cooking style modifiers
  await prisma.modifier.createMany({
    data: [
      { groupId: cookingGroup.id, name: 'Rare - نصف استواء', priceAdjustment: 0, sortOrder: 1, isActive: true },
      { groupId: cookingGroup.id, name: 'Medium - متوسط', priceAdjustment: 0, sortOrder: 2, isDefault: true, isActive: true },
      { groupId: cookingGroup.id, name: 'Well Done - كامل الاستواء', priceAdjustment: 0, sortOrder: 3, isActive: true },
    ]
  });

  console.log('✓ Created 15 modifiers\n');

  // Create Categories and Products
  console.log('📦 Creating menu categories and items...');
  const products: any[] = [];
  let productCounter = 0;

  for (const catData of RESTAURANT_CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        description: `${catData.name} menu items`,
        active: true
      }
    });

    for (const subcategory of catData.subcategories) {
      const items = MENU_ITEMS[subcategory as keyof typeof MENU_ITEMS] || [];

      for (const itemName of items) {
        productCounter++;

        // Determine kitchen station based on category
        let stationId = hotStation.id;
        if (catData.name.includes('Appetizers') && subcategory.includes('Cold')) stationId = coldStation.id;
        else if (catData.name.includes('Appetizers') && subcategory.includes('Salad')) stationId = coldStation.id;
        else if (catData.name.includes('Main') && subcategory === 'Grilled') stationId = grillStation.id;
        else if (catData.name.includes('Pizza') || catData.name.includes('Pasta')) stationId = pastaStation.id;
        else if (catData.name.includes('Desserts')) stationId = dessertStation.id;
        else if (catData.name.includes('Beverages')) stationId = beverageStation.id;

        const product = await prisma.product.create({
          data: {
            name: itemName,
            sku: generateSKU(catData.name, productCounter),
            barcode: `MENU${String(productCounter).padStart(8, '0')}`,
            categoryId: category.id,
            description: `Delicious ${itemName} made fresh daily`,
            price: randomPrice(10, 150),
            cost: randomPrice(5, 75),
            stock: 999,
            lowStockAlert: 10,
            unit: 'piece',
            imageUrl: `https://via.placeholder.com/400x300?text=${itemName.replace(/\s/g, '+')}`,
            isActive: true,
            kitchenStations: {
              create: {
                kitchenStationId: stationId
              }
            }
          }
        });
        products.push(product);
      }
    }

    if (productCounter % 20 === 0) {
      console.log(`  → Created ${productCounter} menu items...`);
    }
  }
  console.log(`✓ Created ${products.length} menu items\n`);

  // Link modifiers to products
  console.log('🔗 Linking modifiers to products...');
  let linkCounter = 0;

  for (const product of products) {
    // Pizza and Burgers get size modifiers
    if (product.name.includes('Pizza') || product.name.includes('Burger')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: sizeGroup.id }
      });
      linkCounter++;
    }

    // Grilled items get cooking style modifiers
    if (product.name.includes('Steak') || product.name.includes('Beef') || product.name.includes('Lamb')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: cookingGroup.id }
      });
      linkCounter++;
    }

    // Spicy items get spice level modifiers
    if (product.name.includes('Chicken') || product.name.includes('Grilled')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: spiceLevelGroup.id }
      });
      linkCounter++;
    }

    // Burgers and Pizza get extras
    if (product.name.includes('Burger') || product.name.includes('Pizza')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: extrasGroup.id }
      });
      linkCounter++;
    }
  }
  console.log(`✓ Created ${linkCounter} product-modifier links\n`);

  // Create Customers
  console.log('👤 Creating customers...');
  const customers: any[] = [];

  for (let i = 1; i <= 200; i++) {
    const isArabic = Math.random() < 0.6;
    const name = isArabic ? generateArabicName() : generateEnglishName();

    const nameParts = name.split(' ');
    const customer = await prisma.customer.create({
      data: {
        firstName: nameParts[0] || 'Customer',
        lastName: nameParts.slice(1).join(' ') || `${i}`,
        email: generateEmail(name, i),
        phone: generatePhone(),
        loyaltyPoints: randomInt(0, 500),
        totalSpent: randomPrice(0, 5000)
      }
    });
    customers.push(customer);

    if (i % 50 === 0) {
      console.log(`  → Created ${i} customers...`);
    }
  }
  console.log(`✓ Created ${customers.length} customers\n`);

  // Create Sales with restaurant-specific fields
  console.log('💰 Creating sample restaurant orders...');
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
  const orderStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];

  for (let i = 0; i < 50; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const waiter = waiters[randomInt(0, waiters.length - 1)];
    const orderType = orderTypes[randomInt(0, orderTypes.length - 1)] as any;
    const orderStatus = orderStatuses[randomInt(2, orderStatuses.length - 1)] as any;

    const table = orderType === 'DINE_IN' ? tables[randomInt(0, tables.length - 1)] : null;

    const numItems = randomInt(2, 6);
    const saleItems: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 2);
      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: itemSubtotal,
        notes: Math.random() < 0.2 ? 'No onions' : undefined
      });
    }

    const discount = Math.random() < 0.2 ? randomPrice(5, 20) : 0;
    const serviceCharge = orderType === 'DINE_IN' ? subtotal * 0.05 : 0; // 5% service charge
    const tax = (subtotal - discount + serviceCharge) * 0.15; // 15% tax
    const tips = orderType === 'DINE_IN' && Math.random() < 0.7 ? randomPrice(5, 50) : 0;
    const totalAmount = subtotal - discount + serviceCharge + tax + tips;

    const saleNumber = `SALE-${Date.now()}-${i}`;

    await prisma.sale.create({
      data: {
        saleNumber: saleNumber,
        cashierId: waiter.id,
        customerId: Math.random() < 0.7 ? customer.id : null,
        tableId: table?.id,
        totalAmount: totalAmount,
        subtotal: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        serviceCharge: serviceCharge,
        tipAmount: tips,
        orderType: orderType,
        orderStatus: orderStatus,
        waiterId: waiter.id,
        paymentMethod: ['CASH', 'CARD', 'MOBILE_PAYMENT'][randomInt(0, 2)] as any,
        status: 'COMPLETED' as any,
        notes: Math.random() < 0.1 ? 'Customer allergic to nuts' : undefined,
        items: {
          create: saleItems
        }
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`  → Created ${i + 1} orders...`);
    }
  }
  console.log(`✓ Created 50 restaurant orders\n`);

  console.log('✅ Restaurant Demo Data Generation Completed!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('Summary:');
  console.log('═══════════════════════════════════════════════');
  console.log(`✓ Staff Users: 6 (1 admin, 5 waiters)`);
  console.log(`✓ Floors: ${floors.length}`);
  console.log(`✓ Tables: ${tables.length}`);
  console.log(`✓ Kitchen Stations: ${kitchenStations.length}`);
  console.log(`✓ Modifier Groups: 4`);
  console.log(`✓ Modifiers: 15`);
  console.log(`✓ Categories: ${RESTAURANT_CATEGORIES.length}`);
  console.log(`✓ Menu Items: ${products.length}`);
  console.log(`✓ Product-Modifier Links: ${linkCounter}`);
  console.log(`✓ Customers: ${customers.length}`);
  console.log(`✓ Orders: 50`);
  console.log('\n');
  console.log('Login Credentials:');
  console.log('═══════════════════════════════════════════════');
  console.log('Email: admin@restaurant.com');
  console.log('Password: password123');
  console.log('\nWaiter accounts: waiter1@restaurant.com through waiter5@restaurant.com');
  console.log('Password: password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
