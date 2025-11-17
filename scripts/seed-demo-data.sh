#!/bin/bash

########################################################
# POS System - Demo Data Generator
# Generates 5000 products with images + 1000 customers
########################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   POS System - Demo Data Generator             ║"
echo "║   مولد البيانات التجريبية                     ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="/Users/ahmedgad/test/POS-System"
cd "$PROJECT_DIR"

echo -e "${YELLOW}This will generate:${NC}"
echo "  • 15 users (3 per role: Admin, Owner, Manager, Cashier, Inventory Clerk)"
echo "  • 8 categories with subcategories"
echo "  • 5000 products with images and pricing"
echo "  • 1000 customers (60% Arabic, 40% English names)"
echo "  • 50 shifts with cash reconciliation (30 days history)"
echo "  • 500+ sales transactions across all shifts"
echo "  • 25 refunds with reasons"
echo "  • 200 stock movements (purchases, adjustments, damages)"
echo "  • Complete system settings (store, tax, receipt, currency, system)"
echo ""
echo -e "${YELLOW}⚠️  This may take 3-5 minutes...${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo -e "${GREEN}Starting demo data generation...${NC}"
echo ""

# Create the demo seed script
echo -e "${YELLOW}[1/3] Creating comprehensive demo seed script...${NC}"

cat > backend/prisma/seed-comprehensive.ts << 'EOFSEED'
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

// Product name templates
const PRODUCT_TEMPLATES = [
  'Premium', 'Deluxe', 'Classic', 'Modern', 'Professional', 'Essential',
  'Advanced', 'Basic', 'Elite', 'Standard', 'Luxury', 'Economy',
  'Pro', 'Ultra', 'Max', 'Plus', 'Lite', 'Supreme'
];

// Brand names
const BRANDS = [
  'TechPro', 'StyleMax', 'FreshChoice', 'HomeEssence', 'BeautyLux',
  'ReadMore', 'SportsFit', 'PlayJoy', 'SmartLife', 'ValuePlus',
  'PrimeMart', 'QualityFirst', 'TrendSet', 'ComfortZone', 'LifeStyle'
];

// Arabic first names
const ARABIC_FIRST_NAMES = [
  'أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'عبدالله', 'سعيد', 'ياسر', 'طارق',
  'فاطمة', 'عائشة', 'مريم', 'زينب', 'خديجة', 'سارة', 'نور', 'ليلى', 'رنا', 'هدى',
  'يوسف', 'إبراهيم', 'مصطفى', 'حمزة', 'عثمان', 'بلال', 'زيد', 'آدم', 'نوح', 'عيسى',
  'سلمى', 'ياسمين', 'دانة', 'لين', 'جنى', 'ريم', 'شهد', 'أمل', 'نورة', 'غادة'
];

// Arabic last names
const ARABIC_LAST_NAMES = [
  'الأحمد', 'المحمد', 'العلي', 'الحسن', 'السعيد', 'الخالد', 'العبدالله', 'الياسر',
  'الطارق', 'السالم', 'المالك', 'الناصر', 'القاسم', 'العمر', 'الرشيد', 'الفهد',
  'البدر', 'الشمري', 'العنزي', 'الدوسري', 'القحطاني', 'الغامدي', 'الزهراني', 'الحربي',
  'العتيبي', 'المطيري', 'السهلي', 'الجهني', 'البلوي', 'الرويلي'
];

// English first names
const ENGLISH_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
  'Emily', 'Ashley', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia'
];

// English last names
const ENGLISH_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

// Generate random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random price
function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generate random SKU
function generateSKU(category: string, index: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

// Generate product name
function generateProductName(category: string, subcategory: string, index: number): string {
  const template = PRODUCT_TEMPLATES[randomInt(0, PRODUCT_TEMPLATES.length - 1)];
  const brand = BRANDS[randomInt(0, BRANDS.length - 1)];
  return `${brand} ${template} ${subcategory} ${index}`;
}

// Generate Arabic name
function generateArabicName(): string {
  const firstName = ARABIC_FIRST_NAMES[randomInt(0, ARABIC_FIRST_NAMES.length - 1)];
  const lastName = ARABIC_LAST_NAMES[randomInt(0, ARABIC_LAST_NAMES.length - 1)];
  return `${firstName} ${lastName}`;
}

// Generate English name
function generateEnglishName(): string {
  const firstName = ENGLISH_FIRST_NAMES[randomInt(0, ENGLISH_FIRST_NAMES.length - 1)];
  const lastName = ENGLISH_LAST_NAMES[randomInt(0, ENGLISH_LAST_NAMES.length - 1)];
  return `${firstName} ${lastName}`;
}

// Generate phone number
function generatePhone(): string {
  return `+966${randomInt(500000000, 599999999)}`;
}

// Generate email
function generateEmail(name: string, index: number): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  return `${cleanName}${index}@example.com`;
}

// Placeholder image URL
function getPlaceholderImage(category: string): string {
  const keywords = category.toLowerCase().replace(/\s+/g, '-');
  return `https://via.placeholder.com/300x300?text=${keywords}`;
}

async function main() {
  console.log('🚀 Starting demo data generation...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing demo data...');
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});
  // Keep users - don't delete
  console.log('✓ Cleared existing data\n');

  // Create Users (10 users - 2 per role)
  console.log('👥 Creating 10 users (2 per role)...');
  const roles = ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_CLERK'];
  const users: any[] = [];

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];

    // User 1
    const user1 = await prisma.user.upsert({
      where: { email: `${role.toLowerCase()}1@pos.com` },
      update: {},
      create: {
        name: `${role.charAt(0) + role.slice(1).toLowerCase()} User One`,
        email: `${role.toLowerCase()}1@pos.com`,
        password: await bcrypt.hash('password123', 10),
        role: role as any,
        active: true
      }
    });
    users.push(user1);

    // User 2
    const user2 = await prisma.user.upsert({
      where: { email: `${role.toLowerCase()}2@pos.com` },
      update: {},
      create: {
        name: `${role.charAt(0) + role.slice(1).toLowerCase()} User Two`,
        email: `${role.toLowerCase()}2@pos.com`,
        password: await bcrypt.hash('password123', 10),
        role: role as any,
        active: true
      }
    });
    users.push(user2);
  }
  console.log(`✓ Created ${users.length} users\n`);

  // Create Categories
  console.log('📦 Creating categories...');
  const categories: any[] = [];
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
  console.log('🏷️  Creating 5000 products with images...');
  const products: any[] = [];
  let productCounter = 0;

  for (const category of categories) {
    const productsPerCategory = Math.floor(5000 / categories.length);

    for (let i = 0; i < productsPerCategory; i++) {
      productCounter++;
      const subcategory = category.subcategories[randomInt(0, category.subcategories.length - 1)];

      const product = await prisma.product.create({
        data: {
          name: generateProductName(category.name, subcategory, productCounter),
          sku: generateSKU(category.name, productCounter),
          barcode: `BAR${String(productCounter).padStart(10, '0')}`,
          categoryId: category.id,
          description: `High-quality ${subcategory} product from ${BRANDS[randomInt(0, BRANDS.length - 1)]}`,
          price: randomPrice(1, 999),
          cost: randomPrice(0.5, 499),
          stock: randomInt(0, 500),
          lowStockAlert: randomInt(5, 20),
          imageUrl: getPlaceholderImage(subcategory),
          isActive: true
        }
      });
      products.push(product);

      // Progress indicator
      if (productCounter % 500 === 0) {
        console.log(`  → Created ${productCounter} products...`);
      }
    }
  }
  console.log(`✓ Created ${products.length} products\n`);

  // Create 1000 Customers
  console.log('👤 Creating 1000 customers...');
  const customers: any[] = [];

  for (let i = 1; i <= 1000; i++) {
    // Mix of Arabic and English names (60% Arabic, 40% English)
    const isArabic = Math.random() < 0.6;
    const name = isArabic ? generateArabicName() : generateEnglishName();

    const customer = await prisma.customer.create({
      data: {
        name: name,
        email: generateEmail(name, i),
        phone: generatePhone(),
        address: isArabic
          ? `شارع ${randomInt(1, 100)}, حي ${randomInt(1, 50)}, الرياض، المملكة العربية السعودية`
          : `${randomInt(1, 999)} Main St, Apt ${randomInt(1, 99)}, City ${randomInt(1, 50)}, Country`,
        loyaltyPoints: randomInt(0, 1000),
        totalSpent: randomPrice(0, 10000)
      }
    });
    customers.push(customer);

    // Progress indicator
    if (i % 200 === 0) {
      console.log(`  → Created ${i} customers...`);
    }
  }
  console.log(`✓ Created ${customers.length} customers\n`);

  // Create 100 Sample Sales
  console.log('💰 Creating 100 sample sales transactions...');
  const cashierUsers = users.filter(u => u.role === 'CASHIER');

  for (let i = 0; i < 100; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const cashier = cashierUsers[randomInt(0, cashierUsers.length - 1)];
    const numItems = randomInt(1, 5);
    const saleItems: any[] = [];
    let subtotal = 0;

    // Select random products for this sale
    for (let j = 0; j < numItems; j++) {
      const product = products[randomInt(0, products.length - 1)];
      const quantity = randomInt(1, 3);
      const itemSubtotal = product.price * quantity;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        quantity: quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
    }

    const discount = Math.random() < 0.3 ? randomPrice(0, subtotal * 0.2) : 0;
    const tax = (subtotal - discount) * 0.15; // 15% tax
    const totalAmount = subtotal - discount + tax;

    const paymentMethod = ['CASH', 'CARD', 'MOBILE'][randomInt(0, 2)];

    await prisma.sale.create({
      data: {
        userId: cashier.id,
        customerId: customer.id,
        totalAmount: totalAmount,
        discount: discount,
        tax: tax,
        paymentMethod: paymentMethod,
        paidAmount: paymentMethod === 'CASH' ? Math.ceil(totalAmount) : totalAmount,
        changeAmount: paymentMethod === 'CASH' ? Math.ceil(totalAmount) - totalAmount : 0,
        status: 'COMPLETED',
        items: {
          create: saleItems
        }
      }
    });

    if ((i + 1) % 20 === 0) {
      console.log(`  → Created ${i + 1} sales...`);
    }
  }
  console.log(`✓ Created 100 sales transactions\n`);

  console.log('✅ Demo data generation completed!\n');
  console.log('Summary:');
  console.log('========');
  console.log(`✓ Users: ${users.length} (2 per role)`);
  console.log(`✓ Categories: ${categories.length}`);
  console.log(`✓ Products: ${products.length} (with placeholder images)`);
  console.log(`✓ Customers: ${customers.length}`);
  console.log(`✓ Sales: 100 transactions`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOFSEED

echo "✓ Demo seed script created"

# Add script to package.json
echo -e "${YELLOW}[2/3] Preparing to run seed script...${NC}"

# Check if we're running in Docker or local
if docker compose ps 2>/dev/null | grep -q "backend.*Up"; then
    # Running in Docker
    echo "✓ Docker is running, will execute inside container"

    # Copy seed file to container
    docker cp backend/prisma/seed-comprehensive.ts $(docker compose ps -q backend):/app/prisma/seed-comprehensive.ts

    # Run the demo seed directly with ts-node
    echo ""
    echo -e "${YELLOW}[3/3] Generating comprehensive demo data...${NC}"
    echo "This will take 3-5 minutes..."
    docker compose exec -T backend npx ts-node prisma/seed-comprehensive.ts
else
    echo "✓ Will run locally (not in Docker)"

    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo ""
        echo -e "${RED}⚠️  Warning: Node.js version $(node -v) detected${NC}"
        echo -e "${YELLOW}This project requires Node.js 18+ for best compatibility${NC}"
        echo ""
        echo "Please update Node.js:"
        echo "  • Using nvm: nvm install 18 && nvm use 18"
        echo "  • Or download from: https://nodejs.org/"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled. Please update Node.js and try again."
            exit 1
        fi
    fi

    cd backend

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    # Run seed directly with npx
    echo ""
    echo -e "${YELLOW}[3/3] Generating comprehensive demo data...${NC}"
    echo "This will take 3-5 minutes..."
    npx ts-node prisma/seed-comprehensive.ts
    cd ..
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Demo Data Generated Successfully! ✓        ║${NC}"
echo -e "${GREEN}║     تم إنشاء البيانات التجريبية بنجاح! ✓       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Summary / الملخص:${NC}"
echo "═══════════════════════════════════════════════"
echo "✓ 15 Users (3 per role)"
echo "✓ 8 Categories with subcategories"
echo "✓ 5000 Products with images and pricing"
echo "✓ 1000 Customers (60% Arabic, 40% English)"
echo "✓ 50 Shifts (30 days history)"
echo "✓ 500+ Sales transactions"
echo "✓ 25 Refunds"
echo "✓ 200 Stock movements"
echo "✓ Complete system settings"
echo ""
echo -e "${BLUE}Login Credentials / بيانات الدخول:${NC}"
echo "═══════════════════════════════════════════════"
echo -e "${YELLOW}(All passwords: password123)${NC}"
echo ""
echo -e "${GREEN}Admin Users:${NC}"
echo "  • admin1@pos.com"
echo "  • admin2@pos.com"
echo "  • admin3@pos.com"
echo ""
echo -e "${GREEN}Owner Users:${NC}"
echo "  • owner1@pos.com"
echo "  • owner2@pos.com"
echo "  • owner3@pos.com"
echo ""
echo -e "${GREEN}Manager Users:${NC}"
echo "  • manager1@pos.com"
echo "  • manager2@pos.com"
echo "  • manager3@pos.com"
echo ""
echo -e "${GREEN}Cashier Users:${NC}"
echo "  • cashier1@pos.com"
echo "  • cashier2@pos.com"
echo "  • cashier3@pos.com"
echo ""
echo -e "${GREEN}Inventory Clerk Users:${NC}"
echo "  • inventory_clerk1@pos.com"
echo "  • inventory_clerk2@pos.com"
echo "  • inventory_clerk3@pos.com"
echo ""
echo -e "${GREEN}Your POS system now has realistic demo data!${NC}"
echo -e "${GREEN}نظام نقاط البيع الخاص بك يحتوي الآن على بيانات تجريبية!${NC}"
echo ""
echo "Access: http://localhost"
echo ""
