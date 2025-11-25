import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

// Food category image mapping using Unsplash food photos
function getCategoryImage(itemName: string, subcategory: string): string {
  const imageMap: { [key: string]: string } = {
    // Cold Mezze
    'Hummus': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
    'Baba Ghanoush': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop',
    'Moutabal': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop',
    'Tabbouleh': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
    'Fattoush': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'Labneh': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop',
    'Muhammara': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&h=300&fit=crop',

    // Hot Mezze
    'Falafel': 'https://images.unsplash.com/photo-1593001874117-7a51960c8e0f?w=400&h=300&fit=crop',
    'Cheese Sambousek': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    'Meat Sambousek': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    'Fried Kibbeh': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    'Grilled Halloumi': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=300&fit=crop',
    'Arayes': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',

    // Soups
    'Lentil Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    'Chicken Soup': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    'Mushroom Soup': 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=300&fit=crop',
    'Tomato Soup': 'https://images.unsplash.com/photo-1622756614310-0c4e5c2a93b9?w=400&h=300&fit=crop',
    'Seafood Soup': 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',

    // Salads
    'Greek Salad': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    'Caesar Salad': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop',
    'Rocca Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'Quinoa Salad': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop',
    'Arabic Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',

    // Grilled
    'Grilled Chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    'Lamb Chops': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    'Beef Steak': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    'Mixed Grill': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    'Shish Tawook': 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    'Kafta': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',

    // Pizza
    'Margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    'Pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    'Hawaiian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    'Four Cheese': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',

    // Burgers
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',

    // Pasta
    'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    'Alfredo': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop',
    'Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',

    // Seafood
    'Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    'Shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    'Sea Bass': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
    'Calamari': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    'Paella': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop',

    // Desserts
    'Baklava': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=300&fit=crop',
    'Kunafa': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    'Cheesecake': 'https://images.unsplash.com/photo-1533134242443-b49e2913dfa0?w=400&h=300&fit=crop',
    'Chocolate Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    'Ice Cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    'Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',

    // Beverages
    'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    'Tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop',
    'Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
    'Smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop',
    'Latte': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    'Orange': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
    'Lemonade': 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400&h=300&fit=crop'
  };

  // Try exact match first
  if (imageMap[itemName]) {
    return imageMap[itemName];
  }

  // Try partial match
  for (const key in imageMap) {
    if (itemName.includes(key) || key.includes(itemName.split(' ')[0])) {
      return imageMap[key];
    }
  }

  // Default food image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
}

async function main() {
  console.log('🍽️  Starting Restaurant Demo Data Generation...\n');

  // Clear ALL existing data (complete database wipe)
  console.log('🗑️  Clearing ALL data from database...');
  await prisma.kitchenTicket.deleteMany({});
  await prisma.saleItemModifier.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.salePayment.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.productModifierGroup.deleteMany({});
  await prisma.modifier.deleteMany({});
  await prisma.modifierGroup.deleteMany({});
  await prisma.productKitchenStation.deleteMany({});
  await prisma.recipeItem.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.kitchenStation.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✓ Cleared ALL data from database\n');

  // Create Users (All Roles)
  console.log('👥 Creating restaurant staff (All Roles)...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  // 1. ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: { password: hashedPassword, role: 'ADMIN', status: 'ACTIVE' },
    create: {
      username: 'admin',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. OWNER
  await prisma.user.upsert({
    where: { email: 'owner@restaurant.com' },
    update: { password: hashedPassword, role: 'OWNER', status: 'ACTIVE' },
    create: {
      username: 'owner',
      email: 'owner@restaurant.com',
      password: hashedPassword,
      firstName: 'Restaurant',
      lastName: 'Owner',
      role: 'OWNER',
      status: 'ACTIVE'
    }
  });

  // 3. MANAGER
  await prisma.user.upsert({
    where: { email: 'manager@restaurant.com' },
    update: { password: hashedPassword, role: 'MANAGER', status: 'ACTIVE' },
    create: {
      username: 'manager',
      email: 'manager@restaurant.com',
      password: hashedPassword,
      firstName: 'Restaurant',
      lastName: 'Manager',
      role: 'MANAGER',
      status: 'ACTIVE'
    }
  });

  // 4. CASHIER
  await prisma.user.upsert({
    where: { email: 'cashier@restaurant.com' },
    update: { password: hashedPassword, role: 'CASHIER', status: 'ACTIVE' },
    create: {
      username: 'cashier',
      email: 'cashier@restaurant.com',
      password: hashedPassword,
      firstName: 'Main',
      lastName: 'Cashier',
      role: 'CASHIER',
      status: 'ACTIVE'
    }
  });

  // 5. WAITER
  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@restaurant.com' },
    update: { password: hashedPassword, role: 'WAITER', status: 'ACTIVE' },
    create: {
      username: 'waiter',
      email: 'waiter@restaurant.com',
      password: hashedPassword,
      firstName: 'Head',
      lastName: 'Waiter',
      role: 'WAITER',
      status: 'ACTIVE'
    }
  });

  // 6. KITCHEN STAFF
  await prisma.user.upsert({
    where: { email: 'kitchen@restaurant.com' },
    update: { password: hashedPassword, role: 'KITCHEN_STAFF', status: 'ACTIVE' },
    create: {
      username: 'kitchen',
      email: 'kitchen@restaurant.com',
      password: hashedPassword,
      firstName: 'Head',
      lastName: 'Chef',
      role: 'KITCHEN_STAFF',
      status: 'ACTIVE'
    }
  });

  // 7. INVENTORY CLERK
  await prisma.user.upsert({
    where: { email: 'inventory@restaurant.com' },
    update: { password: hashedPassword, role: 'INVENTORY_CLERK', status: 'ACTIVE' },
    create: {
      username: 'inventory',
      email: 'inventory@restaurant.com',
      password: hashedPassword,
      firstName: 'Inventory',
      lastName: 'Clerk',
      role: 'INVENTORY_CLERK',
      status: 'ACTIVE'
    }
  });

  // Additional Waiters for demo
  const waiters = [waiter];
  for (let i = 1; i <= 4; i++) {
    const w = await prisma.user.upsert({
      where: { email: `waiter${i}@restaurant.com` },
      update: { password: hashedPassword, role: 'WAITER', status: 'ACTIVE' },
      create: {
        username: `waiter${i}`,
        email: `waiter${i}@restaurant.com`,
        password: hashedPassword,
        firstName: `Waiter`,
        lastName: `${i}`,
        role: 'WAITER',
        status: 'ACTIVE'
      }
    });
    waiters.push(w);
  }
  console.log(`✓ Created all 7 user roles + extra waiters\n`);

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
            imageUrl: getCategoryImage(itemName, subcategory),
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

  // Download and convert images to blob
  console.log('🖼️  Downloading and converting product images to blob...');
  let imageCounter = 0;
  let imageErrors = 0;

  for (const product of products) {
    if (product.imageUrl) {
      try {
        // Fetch image from URL
        const response = await fetch(product.imageUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/jpeg';

          // Update product with image blob
          await prisma.product.update({
            where: { id: product.id },
            data: {
              imageData: buffer,
              imageMimeType: contentType,
              imageUrl: null // Clear the URL since we now have blob
            }
          });

          imageCounter++;
          if (imageCounter % 20 === 0) {
            console.log(`  → Downloaded ${imageCounter} images...`);
          }
        } else {
          // Clear imageUrl even if download fails to avoid redirect issues
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: null }
          });
          imageErrors++;
        }
      } catch (err) {
        // Clear imageUrl even if error occurs to avoid redirect issues
        await prisma.product.update({
          where: { id: product.id },
          data: { imageUrl: null }
        });
        imageErrors++;
        console.log(`  ⚠️  Failed to download image for ${product.name}`);
      }
    }
  }
  console.log(`✓ Converted ${imageCounter} images to blob format`);
  if (imageErrors > 0) {
    console.log(`  ⚠️  ${imageErrors} images failed to download\n`);
  } else {
    console.log('');
  }

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

    // Beverages (Coffee, Tea, Juice, Smoothie) get size modifiers
    if (product.name.includes('Coffee') || product.name.includes('Tea') || product.name.includes('Latte') ||
      product.name.includes('Cappuccino') || product.name.includes('Juice') || product.name.includes('Smoothie')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: sizeGroup.id }
      });
      linkCounter++;
    }

    // Grilled items get cooking style modifiers
    if (product.name.includes('Steak') || product.name.includes('Beef') || product.name.includes('Lamb') ||
      product.name.includes('Chops')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: cookingGroup.id }
      });
      linkCounter++;
    }

    // Spicy items get spice level modifiers
    if (product.name.includes('Chicken') || product.name.includes('Grilled') || product.name.includes('Spicy') ||
      product.name.includes('Kafta') || product.name.includes('Tawook')) {
      await prisma.productModifierGroup.create({
        data: { productId: product.id, modifierGroupId: spiceLevelGroup.id }
      });
      linkCounter++;
    }

    // Burgers and Pizza get extras
    if (product.name.includes('Burger') || product.name.includes('Pizza') || product.name.includes('Pasta')) {
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

  // Create Shifts with new enhanced fields
  console.log('📊 Creating shifts with payment breakdown...');
  const shifts: any[] = [];

  // Create 5 shifts (representing 5 days of operation)
  for (let i = 0; i < 5; i++) {
    const cashier = waiters[randomInt(0, waiters.length - 1)];
    const shiftDate = new Date();
    shiftDate.setDate(shiftDate.getDate() - (4 - i)); // Last 5 days

    const openedAt = new Date(shiftDate);
    openedAt.setHours(8, 0, 0, 0); // 8 AM

    const closedAt = new Date(shiftDate);
    closedAt.setHours(22, 0, 0, 0); // 10 PM

    const startingCash = 100;

    // Simulate realistic shift totals
    const cashSales = randomPrice(500, 1500);
    const cardSales = randomPrice(800, 2000);
    const mobileSales = randomPrice(300, 800);
    const splitSales = randomPrice(200, 600);

    const totalSales = cashSales + cardSales + mobileSales + splitSales;
    const totalTransactions = randomInt(30, 80);
    const totalTips = randomPrice(50, 200);
    const totalServiceCharges = totalSales * 0.05; // 5%
    const totalDiscounts = randomPrice(20, 100);
    const totalTax = totalSales * 0.15; // 15%

    const expectedCash = startingCash + cashSales;
    const endingCash = expectedCash + randomPrice(-10, 10); // Small discrepancy
    const discrepancy = endingCash - expectedCash;

    const shift = await prisma.shift.create({
      data: {
        shiftNumber: `SHIFT-${shiftDate.getFullYear()}${String(i + 1).padStart(6, '0')}`,
        cashierId: cashier.id,
        startingCash,
        endingCash,
        expectedCash,
        discrepancy,
        totalSales,
        totalTransactions,
        status: 'CLOSED',
        openedAt,
        closedAt,

        // Auto-management tracking
        autoOpened: i % 2 === 0, // Alternate between auto and manual
        autoClosed: i % 2 === 0,
        openedBy: i % 2 === 0 ? null : cashier.id,
        closedBy: i % 2 === 0 ? null : cashier.id,

        // Payment method breakdown
        cashSales,
        cardSales,
        mobileSales,
        splitSales,

        // Enhanced statistics
        refundCount: randomInt(0, 3),
        voidCount: randomInt(0, 2),
        totalTips,
        totalServiceCharges,
        totalDiscounts,
        totalTax,

        notes: i % 2 === 0 ? 'Automatically closed by system' : 'Manually closed - all good'
      }
    });

    shifts.push(shift);
  }
  console.log(`✓ Created ${shifts.length} shifts with payment breakdown\n`);

  // Create Sales with restaurant-specific fields
  console.log('💰 Creating sample restaurant orders...');
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];
  const orderStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];

  for (let i = 0; i < 50; i++) {
    const customer = customers[randomInt(0, customers.length - 1)];
    const waiter = waiters[randomInt(0, waiters.length - 1)];
    const orderType = orderTypes[randomInt(0, orderTypes.length - 1)] as any;
    const orderStatus = orderStatuses[randomInt(2, orderStatuses.length - 1)] as any;

    // Assign to a random shift
    const shift = shifts[randomInt(0, shifts.length - 1)];

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
        taxRate: 0.15,
        notes: Math.random() < 0.2 ? 'No onions' : undefined
      });
    }

    const discount = Math.random() < 0.2 ? randomPrice(5, 20) : 0;
    const serviceCharge = orderType === 'DINE_IN' ? subtotal * 0.05 : 0; // 5% service charge
    const tax = (subtotal - discount + serviceCharge) * 0.15; // 15% tax
    const tips = orderType === 'DINE_IN' && Math.random() < 0.7 ? randomPrice(5, 50) : 0;
    const totalAmount = subtotal - discount + serviceCharge + tax + tips;

    const saleNumber = `SALE-${Date.now()}-${i}`;

    // Determine payment method and create payments
    const paymentMethods = ['CASH', 'CARD', 'MOBILE_WALLET'];
    const isSplitPayment = Math.random() < 0.3; // 30% chance of split payment

    let paymentMethod: any;
    const salePayments: any[] = [];

    if (isSplitPayment) {
      // Split payment between 2 methods
      paymentMethod = 'SPLIT';
      const method1 = paymentMethods[randomInt(0, 2)];
      const method2 = paymentMethods[randomInt(0, 2)];
      const amount1 = totalAmount * randomPrice(0.3, 0.7);
      const amount2 = totalAmount - amount1;

      salePayments.push(
        { paymentMethod: method1, amount: amount1 },
        { paymentMethod: method2, amount: amount2 }
      );
    } else {
      // Single payment
      paymentMethod = paymentMethods[randomInt(0, 2)];
      salePayments.push({ paymentMethod, amount: totalAmount });
    }

    await prisma.sale.create({
      data: {
        saleNumber: saleNumber,
        cashierId: waiter.id,
        customerId: Math.random() < 0.7 ? customer.id : null,
        tableId: table?.id,
        shiftId: shift.id, // Link to shift
        totalAmount: totalAmount,
        subtotal: subtotal,
        discountAmount: discount,
        taxAmount: tax,
        serviceCharge: serviceCharge,
        tipAmount: tips,
        orderType: orderType,
        orderStatus: orderStatus,
        waiterId: waiter.id,
        paymentMethod: paymentMethod,
        status: 'COMPLETED' as any,
        notes: Math.random() < 0.1 ? 'Customer allergic to nuts' : undefined,
        items: {
          create: saleItems
        },
        payments: {
          create: salePayments // Create SalePayment records
        }
      }
    });

    if ((i + 1) % 10 === 0) {
      console.log(`  → Created ${i + 1} orders...`);
    }
  }
  console.log(`✓ Created 50 restaurant orders\n`);

  // Update Kitchen Stations with Printer IPs
  console.log('🖨️  Adding printer IPs to kitchen stations...');
  await prisma.kitchenStation.update({
    where: { id: grillStation.id },
    data: { printerIp: '192.168.1.10' }
  });
  await prisma.kitchenStation.update({
    where: { id: coldStation.id },
    data: { printerIp: '192.168.1.11' }
  });
  await prisma.kitchenStation.update({
    where: { id: hotStation.id },
    data: { printerIp: '192.168.1.12' }
  });
  await prisma.kitchenStation.update({
    where: { id: pastaStation.id },
    data: { printerIp: '192.168.1.13' }
  });
  await prisma.kitchenStation.update({
    where: { id: dessertStation.id },
    data: { printerIp: '192.168.1.14' }
  });
  await prisma.kitchenStation.update({
    where: { id: beverageStation.id },
    data: { printerIp: '192.168.1.15' }
  });
  console.log('✓ Added printer IPs to all kitchen stations\n');

  // Create Ingredients for BOM
  console.log('🥕 Creating ingredients for recipes...');

  // Meat & Proteins
  const beefPatty = await prisma.ingredient.create({
    data: { name: 'Beef Patty', unit: 'kg', cost: 45.00, stock: 50, lowStockAlert: 10, isActive: true }
  });
  const chickenBreast = await prisma.ingredient.create({
    data: { name: 'Chicken Breast', unit: 'kg', cost: 25.00, stock: 40, lowStockAlert: 8, isActive: true }
  });
  const lambMeat = await prisma.ingredient.create({
    data: { name: 'Lamb Meat', unit: 'kg', cost: 60.00, stock: 30, lowStockAlert: 5, isActive: true }
  });
  const salmon = await prisma.ingredient.create({
    data: { name: 'Salmon Fillet', unit: 'kg', cost: 80.00, stock: 20, lowStockAlert: 5, isActive: true }
  });
  const shrimp = await prisma.ingredient.create({
    data: { name: 'Shrimp', unit: 'kg', cost: 70.00, stock: 25, lowStockAlert: 5, isActive: true }
  });

  // Vegetables
  const tomato = await prisma.ingredient.create({
    data: { name: 'Tomato', unit: 'kg', cost: 3.50, stock: 100, lowStockAlert: 20, isActive: true }
  });
  const lettuce = await prisma.ingredient.create({
    data: { name: 'Lettuce', unit: 'kg', cost: 4.00, stock: 80, lowStockAlert: 15, isActive: true }
  });
  const onion = await prisma.ingredient.create({
    data: { name: 'Onion', unit: 'kg', cost: 2.50, stock: 120, lowStockAlert: 25, isActive: true }
  });
  const cucumber = await prisma.ingredient.create({
    data: { name: 'Cucumber', unit: 'kg', cost: 3.00, stock: 90, lowStockAlert: 20, isActive: true }
  });
  const mushroom = await prisma.ingredient.create({
    data: { name: 'Mushroom', unit: 'kg', cost: 12.00, stock: 40, lowStockAlert: 10, isActive: true }
  });

  // Dairy & Cheese
  const mozzarella = await prisma.ingredient.create({
    data: { name: 'Mozzarella Cheese', unit: 'kg', cost: 35.00, stock: 60, lowStockAlert: 15, isActive: true }
  });
  const cheddar = await prisma.ingredient.create({
    data: { name: 'Cheddar Cheese', unit: 'kg', cost: 30.00, stock: 50, lowStockAlert: 12, isActive: true }
  });
  const butter = await prisma.ingredient.create({
    data: { name: 'Butter', unit: 'kg', cost: 20.00, stock: 40, lowStockAlert: 10, isActive: true }
  });
  const cream = await prisma.ingredient.create({
    data: { name: 'Heavy Cream', unit: 'liter', cost: 15.00, stock: 35, lowStockAlert: 8, isActive: true }
  });

  // Pantry
  const flour = await prisma.ingredient.create({
    data: { name: 'Flour', unit: 'kg', cost: 5.00, stock: 200, lowStockAlert: 50, isActive: true }
  });
  const pasta = await prisma.ingredient.create({
    data: { name: 'Pasta', unit: 'kg', cost: 8.00, stock: 100, lowStockAlert: 20, isActive: true }
  });
  const rice = await prisma.ingredient.create({
    data: { name: 'Rice', unit: 'kg', cost: 6.00, stock: 150, lowStockAlert: 30, isActive: true }
  });
  const oliveOil = await prisma.ingredient.create({
    data: { name: 'Olive Oil', unit: 'liter', cost: 25.00, stock: 50, lowStockAlert: 10, isActive: true }
  });
  const tomatoSauce = await prisma.ingredient.create({
    data: { name: 'Tomato Sauce', unit: 'liter', cost: 8.00, stock: 80, lowStockAlert: 20, isActive: true }
  });

  // Bakery
  const burgerBun = await prisma.ingredient.create({
    data: { name: 'Burger Bun', unit: 'piece', cost: 0.50, stock: 500, lowStockAlert: 100, isActive: true }
  });
  const pizzaDough = await prisma.ingredient.create({
    data: { name: 'Pizza Dough', unit: 'kg', cost: 4.00, stock: 80, lowStockAlert: 20, isActive: true }
  });

  console.log('✓ Created 20 ingredients\n');

  // Create Recipes for popular items
  console.log('📜 Creating recipes with automatic cost calculation...');
  let recipeCount = 0;

  // Find products to add recipes to
  const beefBurger = products.find(p => p.name === 'Classic Beef Burger');
  const cheeseBurger = products.find(p => p.name === 'Cheese Burger');
  const grilledChicken = products.find(p => p.name === 'Grilled Chicken');
  const beefSteak = products.find(p => p.name === 'Beef Steak');
  const lambChops = products.find(p => p.name === 'Lamb Chops');
  const margheritaPizza = products.find(p => p.name === 'Margherita');
  const pepperoniPizza = products.find(p => p.name === 'Pepperoni');
  const alfredoPasta = products.find(p => p.name === 'Alfredo Pasta');
  const grilledSalmon = products.find(p => p.name === 'Grilled Salmon');

  // Classic Beef Burger Recipe
  if (beefBurger) {
    const recipe = await prisma.recipe.create({
      data: {
        productId: beefBurger.id,
        description: 'Classic beef burger with fresh vegetables',
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        items: {
          create: [
            { ingredientId: beefPatty.id, quantity: 0.15, unit: 'kg' },
            { ingredientId: burgerBun.id, quantity: 1, unit: 'piece' },
            { ingredientId: lettuce.id, quantity: 0.02, unit: 'kg' },
            { ingredientId: tomato.id, quantity: 0.05, unit: 'kg' },
            { ingredientId: onion.id, quantity: 0.02, unit: 'kg' }
          ]
        }
      }
    });
    // Calculate cost: (0.15*45) + (1*0.5) + (0.02*4) + (0.05*3.5) + (0.02*2.5) = 6.75 + 0.5 + 0.08 + 0.175 + 0.05 = 7.555
    await prisma.product.update({
      where: { id: beefBurger.id },
      data: { cost: 7.56 }
    });
    recipeCount++;
  }

  // Cheese Burger Recipe
  if (cheeseBurger) {
    await prisma.recipe.create({
      data: {
        productId: cheeseBurger.id,
        description: 'Beef burger with melted cheddar cheese',
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        items: {
          create: [
            { ingredientId: beefPatty.id, quantity: 0.15, unit: 'kg' },
            { ingredientId: cheddar.id, quantity: 0.03, unit: 'kg' },
            { ingredientId: burgerBun.id, quantity: 1, unit: 'piece' },
            { ingredientId: lettuce.id, quantity: 0.02, unit: 'kg' },
            { ingredientId: tomato.id, quantity: 0.05, unit: 'kg' }
          ]
        }
      }
    });
    // Cost: 7.56 + (0.03*30) = 8.46
    await prisma.product.update({
      where: { id: cheeseBurger.id },
      data: { cost: 8.46 }
    });
    recipeCount++;
  }

  // Grilled Chicken Recipe
  if (grilledChicken) {
    await prisma.recipe.create({
      data: {
        productId: grilledChicken.id,
        description: 'Marinated grilled chicken breast',
        prepTime: 20,
        cookTime: 25,
        servings: 1,
        items: {
          create: [
            { ingredientId: chickenBreast.id, quantity: 0.25, unit: 'kg' },
            { ingredientId: oliveOil.id, quantity: 0.02, unit: 'liter' },
            { ingredientId: onion.id, quantity: 0.05, unit: 'kg' },
            { ingredientId: tomato.id, quantity: 0.08, unit: 'kg' }
          ]
        }
      }
    });
    // Cost: (0.25*25) + (0.02*25) + (0.05*2.5) + (0.08*3.5) = 6.25 + 0.5 + 0.125 + 0.28 = 7.155
    await prisma.product.update({
      where: { id: grilledChicken.id },
      data: { cost: 7.16 }
    });
    recipeCount++;
  }

  // Beef Steak Recipe
  if (beefSteak) {
    await prisma.recipe.create({
      data: {
        productId: beefSteak.id,
        description: 'Premium beef steak with mushroom sauce',
        prepTime: 15,
        cookTime: 20,
        servings: 1,
        items: {
          create: [
            { ingredientId: beefPatty.id, quantity: 0.30, unit: 'kg' },
            { ingredientId: mushroom.id, quantity: 0.08, unit: 'kg' },
            { ingredientId: butter.id, quantity: 0.02, unit: 'kg' },
            { ingredientId: cream.id, quantity: 0.05, unit: 'liter' }
          ]
        }
      }
    });
    // Cost: (0.30*45) + (0.08*12) + (0.02*20) + (0.05*15) = 13.5 + 0.96 + 0.4 + 0.75 = 15.61
    await prisma.product.update({
      where: { id: beefSteak.id },
      data: { cost: 15.61 }
    });
    recipeCount++;
  }

  // Lamb Chops Recipe
  if (lambChops) {
    await prisma.recipe.create({
      data: {
        productId: lambChops.id,
        description: 'Grilled lamb chops with herbs',
        prepTime: 15,
        cookTime: 25,
        servings: 1,
        items: {
          create: [
            { ingredientId: lambMeat.id, quantity: 0.35, unit: 'kg' },
            { ingredientId: oliveOil.id, quantity: 0.02, unit: 'liter' },
            { ingredientId: onion.id, quantity: 0.05, unit: 'kg' }
          ]
        }
      }
    });
    // Cost: (0.35*60) + (0.02*25) + (0.05*2.5) = 21 + 0.5 + 0.125 = 21.625
    await prisma.product.update({
      where: { id: lambChops.id },
      data: { cost: 21.63 }
    });
    recipeCount++;
  }

  // Margherita Pizza Recipe
  if (margheritaPizza) {
    await prisma.recipe.create({
      data: {
        productId: margheritaPizza.id,
        description: 'Classic margherita pizza',
        prepTime: 15,
        cookTime: 12,
        servings: 1,
        items: {
          create: [
            { ingredientId: pizzaDough.id, quantity: 0.25, unit: 'kg' },
            { ingredientId: tomatoSauce.id, quantity: 0.08, unit: 'liter' },
            { ingredientId: mozzarella.id, quantity: 0.15, unit: 'kg' },
            { ingredientId: oliveOil.id, quantity: 0.01, unit: 'liter' }
          ]
        }
      }
    });
    // Cost: (0.25*4) + (0.08*8) + (0.15*35) + (0.01*25) = 1 + 0.64 + 5.25 + 0.25 = 7.14
    await prisma.product.update({
      where: { id: margheritaPizza.id },
      data: { cost: 7.14 }
    });
    recipeCount++;
  }

  // Alfredo Pasta Recipe
  if (alfredoPasta) {
    await prisma.recipe.create({
      data: {
        productId: alfredoPasta.id,
        description: 'Creamy alfredo pasta',
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        items: {
          create: [
            { ingredientId: pasta.id, quantity: 0.15, unit: 'kg' },
            { ingredientId: cream.id, quantity: 0.12, unit: 'liter' },
            { ingredientId: butter.id, quantity: 0.03, unit: 'kg' },
            { ingredientId: mozzarella.id, quantity: 0.05, unit: 'kg' }
          ]
        }
      }
    });
    // Cost: (0.15*8) + (0.12*15) + (0.03*20) + (0.05*35) = 1.2 + 1.8 + 0.6 + 1.75 = 5.35
    await prisma.product.update({
      where: { id: alfredoPasta.id },
      data: { cost: 5.35 }
    });
    recipeCount++;
  }

  // Grilled Salmon Recipe
  if (grilledSalmon) {
    await prisma.recipe.create({
      data: {
        productId: grilledSalmon.id,
        description: 'Grilled salmon with lemon butter',
        prepTime: 15,
        cookTime: 18,
        servings: 1,
        items: {
          create: [
            { ingredientId: salmon.id, quantity: 0.20, unit: 'kg' },
            { ingredientId: butter.id, quantity: 0.02, unit: 'kg' },
            { ingredientId: oliveOil.id, quantity: 0.01, unit: 'liter' }
          ]
        }
      }
    });
    // Cost: (0.20*80) + (0.02*20) + (0.01*25) = 16 + 0.4 + 0.25 = 16.65
    await prisma.product.update({
      where: { id: grilledSalmon.id },
      data: { cost: 16.65 }
    });
    recipeCount++;
  }

  console.log(`✓ Created ${recipeCount} recipes with automatic cost calculation\n`);

  console.log('✅ Restaurant Demo Data Generation Completed!\\n');
  console.log('═══════════════════════════════════════════════');
  console.log('Summary:');
  console.log('═══════════════════════════════════════════════');
  console.log(`✓ Staff Users: 6 (1 admin, 5 waiters)`);
  console.log(`✓ Floors: ${floors.length}`);
  console.log(`✓ Tables: ${tables.length}`);
  console.log(`✓ Kitchen Stations: ${kitchenStations.length} (with printer IPs)`);
  console.log(`✓ Modifier Groups: 4`);
  console.log(`✓ Modifiers: 15`);
  console.log(`✓ Categories: ${RESTAURANT_CATEGORIES.length}`);
  console.log(`✓ Menu Items: ${products.length}`);
  console.log(`✓ Product Images: ${imageCounter} (stored as blob in database)`);
  console.log(`✓ Product-Modifier Links: ${linkCounter}`);
  console.log(`✓ Ingredients: 20`);
  console.log(`✓ Recipes: ${recipeCount} (with automatic cost calculation)`);
  console.log(`✓ Customers: ${customers.length}`);
  console.log(`✓ Orders: 50`);
  console.log('\n');
  console.log('Login Credentials (Password for all: password123):');
  console.log('═══════════════════════════════════════════════');
  console.log('1. ADMIN:           admin@restaurant.com');
  console.log('2. OWNER:           owner@restaurant.com');
  console.log('3. MANAGER:         manager@restaurant.com');
  console.log('4. CASHIER:         cashier@restaurant.com');
  console.log('5. WAITER:          waiter@restaurant.com');
  console.log('6. KITCHEN STAFF:   kitchen@restaurant.com');
  console.log('7. INVENTORY CLERK: inventory@restaurant.com');
  console.log('\nExtra Waiters: waiter1@restaurant.com - waiter4@restaurant.com');
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
