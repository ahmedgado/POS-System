const { PrismaClient, UserRole, UserStatus, PaymentMethod, SaleStatus, ShiftStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Product categories with subcategories
const CATEGORIES = [
  { name: 'Electronics', subcategories: ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Gaming'] },
  { name: 'Clothing', subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories', 'Sports'] },
  { name: 'Food & Beverages', subcategories: ['Snacks', 'Drinks', 'Fresh', 'Frozen', 'Bakery', 'Dairy'] },
  { name: 'Home & Garden', subcategories: ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Tools', 'Lighting'] },
  { name: 'Beauty & Health', subcategories: ['Skincare', 'Makeup', 'Hair', 'Supplements', 'Personal Care', 'Fitness'] },
  { name: 'Books & Media', subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Magazines', 'Music', 'Movies'] },
  { name: 'Sports & Outdoors', subcategories: ['Equipment', 'Apparel', 'Camping', 'Cycling', 'Fitness', 'Water Sports'] },
  { name: 'Toys & Games', subcategories: ['Action Figures', 'Dolls', 'Board Games', 'Puzzles', 'Educational', 'Outdoor'] }
];

const PRODUCT_TEMPLATES = [
  'Premium', 'Deluxe', 'Classic', 'Modern', 'Professional', 'Essential',
  'Advanced', 'Basic', 'Elite', 'Standard', 'Luxury', 'Economy',
  'Pro', 'Ultra', 'Max', 'Plus', 'Lite', 'Supreme'
];

const BRANDS = [
  'TechPro', 'StyleMax', 'FreshChoice', 'HomeEssence', 'BeautyLux',
  'ReadMore', 'SportsFit', 'PlayJoy', 'SmartLife', 'ValuePlus',
  'PrimeMart', 'QualityFirst', 'TrendSet', 'ComfortZone', 'LifeStyle'
];

const ARABIC_FIRST_NAMES = [
  'أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'عبدالله', 'سعيد', 'ياسر', 'طارق',
  'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سارة', 'نور', 'ليلى', 'رنا', 'هدى',
  'يوسف', 'إبراهيم', 'مصطفى', 'حمزة', 'عثمان', 'بلال', 'زيد', 'آدم', 'نوح', 'عيسى',
  'سلمى', 'ياسمين', 'دانة', 'لين', 'جنى', 'ريم', 'شهد', 'أمل', 'نورة', 'غادة'
];

const ARABIC_LAST_NAMES = [
  'الأحمد', 'المحمد', 'العلي', 'الحسن', 'السعيد', 'الخالد', 'العبدالله', 'الياسر',
  'الطارق', 'السالم', 'المالك', 'الناصر', 'القاسم', 'العمر', 'الرشيد', 'الفهد',
  'البدر', 'الشمري', 'العنزي', 'الدوسري', 'القحطاني', 'الغامدي', 'الزهراني', 'الحربي',
  'العتيبي', 'المطيري', 'السهلي', 'الجهني', 'البلوي', 'الرويلي'
];

const ENGLISH_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
  'Emily', 'Ashley', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia'
];

const ENGLISH_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateSKU(category, index) {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

function generateProductName(category, subcategory, index) {
  const template = PRODUCT_TEMPLATES[randomInt(0, PRODUCT_TEMPLATES.length - 1)];
  const brand = BRANDS[randomInt(0, BRANDS.length - 1)];
  return `${brand} ${template} ${subcategory} ${index}`;
}

function generateArabicName() {
  return {
    firstName: ARABIC_FIRST_NAMES[randomInt(0, ARABIC_FIRST_NAMES.length - 1)],
    lastName: ARABIC_LAST_NAMES[randomInt(0, ARABIC_LAST_NAMES.length - 1)]
  };
}

function generateEnglishName() {
  return {
    firstName: ENGLISH_FIRST_NAMES[randomInt(0, ENGLISH_FIRST_NAMES.length - 1)],
    lastName: ENGLISH_LAST_NAMES[randomInt(0, ENGLISH_LAST_NAMES.length - 1)]
  };
}

function generatePhone() {
  return `+966${randomInt(500000000, 599999999)}`;
}

function generateEmail(firstName, lastName, index) {
  const cleanFirst = firstName.replace(/[^\w]/g, '').toLowerCase();
  const cleanLast = lastName.replace(/[^\w]/g, '').toLowerCase();
  return `${cleanFirst}.${cleanLast}${index}@example.com`;
}

function getPlaceholderImage(category) {
  const keywords = category.toLowerCase().replace(/\s+/g, '+');
  return `https://via.placeholder.com/400x400/0066cc/ffffff?text=${keywords}`;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🚀 Starting comprehensive demo data generation...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.auditLog.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✓ Cleared existing data\n');

  // Create Users (3 per role)
  console.log('👥 Creating 15 users (3 per role)...');
  const roles = [UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER, UserRole.INVENTORY_CLERK];
  const users = [];

  for (const role of roles) {
    for (let i = 1; i <= 3; i++) {
      const name = generateEnglishName();
      const user = await prisma.user.upsert({
        where: { email: `${role.toLowerCase()}${i}@pos.com` },
        update: {},
        create: {
          username: `${role.toLowerCase()}${i}`,
          email: `${role.toLowerCase()}${i}@pos.com`,
          password: await bcrypt.hash('password123', 12),
          firstName: name.firstName,
          lastName: name.lastName,
          phone: generatePhone(),
          role,
          status: UserStatus.ACTIVE
        }
      });
      users.push(user);
    }
  }
  console.log(`✓ Created ${users.length} users\n`);

  // Create System Settings
  console.log('⚙️  Creating system settings...');
  await prisma.setting.createMany({
    data: [
      {
        key: 'store_settings',
        value: JSON.stringify({
          storeName: 'Super POS Store',
          storeAddress: '123 Main Street',
          storeCity: 'Riyadh',
          storeCountry: 'Saudi Arabia',
          storePhone: '+966 11 234 5678',
          storeEmail: 'store@pos.com',
          storeLogo: '',
          storeWebsite: 'https://pos.store'
        }),
        category: 'store'
      },
      {
        key: 'tax_settings',
        value: JSON.stringify({
          taxEnabled: true,
          taxRate: 15,
          taxLabel: 'VAT',
          taxIncluded: false
        }),
        category: 'tax'
      },
      {
        key: 'receipt_settings',
        value: JSON.stringify({
          receiptHeader: 'Thank you for shopping with us!',
          receiptFooter: 'Visit us again!',
          showLogo: true,
          showQRCode: true,
          showBarcode: true,
          paperSize: 'thermal'
        }),
        category: 'receipt'
      },
      {
        key: 'currency_settings',
        value: JSON.stringify({
          currencyCode: 'SAR',
          currencySymbol: '﷼',
          decimalPlaces: 2,
          thousandSeparator: ',',
          decimalSeparator: '.'
        }),
        category: 'currency'
      },
      {
        key: 'system_settings',
        value: JSON.stringify({
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '12h',
          timezone: 'Asia/Riyadh',
          lowStockThreshold: 10
        }),
        category: 'system'
      }
    ]
  });
  console.log('✓ Created system settings\n');

  // Create Categories
  console.log('📦 Creating categories...');
  const categories = [];
  for (const cat of CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        description: `${cat.name} products including ${cat.subcategories.join(', ')}`
      }
    });
    categories.push({ ...category, subcategories: cat.subcategories });
  }
  console.log(`✓ Created ${categories.length} categories\n`);

  // Create 5000 Products
  console.log('🏷️  Creating 5000 products...');
  const products = [];
  let productCounter = 0;

  for (const category of categories) {
    const productsPerCategory = Math.floor(5000 / categories.length);

    for (let i = 0; i < productsPerCategory; i++) {
      productCounter++;
      const subcategory = category.subcategories[randomInt(0, category.subcategories.length - 1)];
      const price = randomPrice(5, 999);
      const cost = randomPrice(2, price * 0.7);

      const product = await prisma.product.create({
        data: {
          sku: generateSKU(category.name, productCounter),
          barcode: `BAR${String(productCounter).padStart(10, '0')}`,
          name: generateProductName(category.name, subcategory, productCounter),
          description: `High-quality ${subcategory} product from ${BRANDS[randomInt(0, BRANDS.length - 1)]}`,
          categoryId: category.id,
          price,
          cost,
          taxRate: 0.15,
          stock: randomInt(0, 500),
          lowStockAlert: randomInt(5, 20),
          unit: 'piece',
          imageUrl: getPlaceholderImage(subcategory),
          isActive: true
        }
      });
      products.push(product);

      if (productCounter % 500 === 0) {
        console.log(`  → Created ${productCounter} products...`);
      }
    }
  }
  console.log(`✓ Created ${products.length} products\n`);

  // Create 1000 Customers
  console.log('👤 Creating 1000 customers...');
  const customers = [];

  for (let i = 1; i <= 1000; i++) {
    const isArabic = Math.random() < 0.6;
    const name = isArabic ? generateArabicName() : generateEnglishName();

    const customer = await prisma.customer.create({
      data: {
        firstName: name.firstName,
        lastName: name.lastName,
        email: generateEmail(name.firstName, name.lastName, i),
        phone: generatePhone(),
        loyaltyPoints: randomInt(0, 1000),
        storeCredit: randomPrice(0, 500),
        totalSpent: randomPrice(100, 10000),
        visitCount: randomInt(1, 50),
        lastVisit: getRandomDate(new Date(2024, 0, 1), new Date())
      }
    });
    customers.push(customer);

    if (i % 200 === 0) {
      console.log(`  → Created ${i} customers...`);
    }
  }
  console.log(`✓ Created ${customers.length} customers\n`);

  // Create Shifts and Sales
  console.log('💰 Creating shifts and sales...');
  const cashierUsers = users.filter(u => u.role === UserRole.CASHIER);
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  let totalSales = 0;
  let shiftCounter = 0;

  // Create 50 shifts (some open, most closed) and 500 sales
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const shiftsPerDay = randomInt(1, 3);

    for (let s = 0; s < shiftsPerDay; s++) {
      shiftCounter++;
      const cashier = cashierUsers[randomInt(0, cashierUsers.length - 1)];
      const shiftDate = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const startingCash = randomPrice(500, 1000);
      const isOpen = dayOffset === 0 && s === shiftsPerDay - 1; // Last shift of today is open

      const shift = await prisma.shift.create({
        data: {
          shiftNumber: `SHIFT-${today.getFullYear()}${String(shiftCounter).padStart(6, '0')}`,
          cashierId: cashier.id,
          startingCash,
          status: isOpen ? ShiftStatus.OPEN : ShiftStatus.CLOSED,
          openedAt: shiftDate,
          closedAt: isOpen ? null : new Date(shiftDate.getTime() + 8 * 60 * 60 * 1000)
        }
      });

      // Create 5-15 sales per shift
      const salesPerShift = randomInt(5, 15);

      for (let i = 0; i < salesPerShift; i++) {
        totalSales++;
        const customer = customers[randomInt(0, customers.length - 1)];
        const numItems = randomInt(1, 7);
        const saleItems = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const product = products[randomInt(0, products.length - 1)];
          const quantity = randomInt(1, 3);
          const unitPrice = Number(product.price);
          const taxRate = Number(product.taxRate);
          const discount = Math.random() < 0.2 ? randomPrice(0, unitPrice * 0.1) : 0;
          const totalPrice = (unitPrice - discount) * quantity * (1 + taxRate);
          subtotal += unitPrice * quantity;

          saleItems.push({
            productId: product.id,
            quantity,
            unitPrice,
            taxRate,
            discount,
            totalPrice
          });
        }

        const discountAmount = Math.random() < 0.3 ? randomPrice(0, subtotal * 0.1) : 0;
        const taxAmount = (subtotal - discountAmount) * 0.15;
        const totalAmount = subtotal - discountAmount + taxAmount;
        const paymentMethod = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.SPLIT][randomInt(0, 2)];
        const cashReceived = paymentMethod === PaymentMethod.CASH ? Math.ceil(totalAmount / 10) * 10 : totalAmount;
        const changeGiven = paymentMethod === PaymentMethod.CASH ? cashReceived - totalAmount : 0;

        await prisma.sale.create({
          data: {
            saleNumber: `SALE-${today.getFullYear()}${String(totalSales).padStart(8, '0')}`,
            cashierId: cashier.id,
            customerId: customer.id,
            shiftId: shift.id,
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            paymentMethod,
            cashReceived,
            changeGiven,
            status: SaleStatus.COMPLETED,
            createdAt: new Date(shiftDate.getTime() + randomInt(0, 7 * 60 * 60 * 1000)),
            items: {
              create: saleItems
            }
          }
        });

        // Update shift totals
        await prisma.shift.update({
          where: { id: shift.id },
          data: {
            totalSales: { increment: totalAmount },
            totalTransactions: { increment: 1 }
          }
        });
      }

      // Close shift with cash reconciliation
      if (!isOpen) {
        const shiftSales = await prisma.sale.findMany({
          where: { shiftId: shift.id, paymentMethod: PaymentMethod.CASH }
        });
        const totalCashSales = shiftSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const expectedCash = Number(startingCash) + totalCashSales;
        const endingCash = expectedCash + randomPrice(-20, 20); // Small variance
        const discrepancy = endingCash - expectedCash;

        await prisma.shift.update({
          where: { id: shift.id },
          data: {
            endingCash,
            expectedCash,
            discrepancy
          }
        });
      }

      if (shiftCounter % 10 === 0) {
        console.log(`  → Created ${shiftCounter} shifts with ${totalSales} sales...`);
      }
    }
  }
  console.log(`✓ Created ${shiftCounter} shifts and ${totalSales} sales\n`);

  // Create some refunds (5% of sales)
  console.log('🔄 Creating refunds...');
  const allSales = await prisma.sale.findMany({ take: 25 });
  for (const sale of allSales) {
    await prisma.refund.create({
      data: {
        saleId: sale.id,
        amount: sale.totalAmount,
        reason: ['Defective product', 'Wrong item', 'Customer changed mind', 'Product not as described'][randomInt(0, 3)],
        approvedBy: users.find(u => u.role === UserRole.MANAGER)?.id || users[0].id
      }
    });

    await prisma.sale.update({
      where: { id: sale.id },
      data: { status: SaleStatus.REFUNDED }
    });
  }
  console.log(`✓ Created ${allSales.length} refunds\n`);

  // Create Stock Movements
  console.log('📊 Creating stock movements...');
  for (let i = 0; i < 200; i++) {
    const product = products[randomInt(0, products.length - 1)];
    const movementType = ['PURCHASE', 'ADJUSTMENT', 'DAMAGE', 'RETURN'][randomInt(0, 3)];
    const quantity = randomInt(1, 50);

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: movementType,
        quantity,
        notes: `${movementType} - Batch ${randomInt(1000, 9999)}`,
        createdBy: users[randomInt(0, users.length - 1)].id
      }
    });
  }
  console.log('✓ Created 200 stock movements\n');

  console.log('✅ Comprehensive demo data generation completed!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('📊 Summary:');
  console.log('═══════════════════════════════════════════════');
  console.log(`✓ Users: ${users.length} (3 per role)`);
  console.log(`✓ Categories: ${categories.length} with subcategories`);
  console.log(`✓ Products: ${products.length} (with images)`);
  console.log(`✓ Customers: ${customers.length} (60% Arabic, 40% English)`);
  console.log(`✓ Shifts: ${shiftCounter} (30 days history)`);
  console.log(`✓ Sales: ${totalSales} transactions`);
  console.log(`✓ Refunds: ${allSales.length} refunds`);
  console.log(`✓ Stock Movements: 200 movements`);
  console.log(`✓ System Settings: All configured`);
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
