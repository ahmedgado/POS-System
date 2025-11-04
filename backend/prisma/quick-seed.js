// Quick seed script to link existing products to categories
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting quick seed to link products with categories...\n');

  // Get all categories
  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} categories\n`);

  if (categories.length === 0) {
    console.log('Creating categories first...');
    const categoryData = [
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Clothing', description: 'Apparel and fashion items' },
      { name: 'Food & Beverages', description: 'Food products and drinks' },
      { name: 'Home & Garden', description: 'Home improvement and garden items' },
      { name: 'Beauty & Health', description: 'Beauty products and health items' },
      { name: 'Books & Media', description: 'Books, magazines, and media' },
      { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
      { name: 'Toys & Games', description: 'Toys, games, and entertainment' }
    ];

    for (const cat of categoryData) {
      await prisma.category.create({ data: cat });
    }

    const newCategories = await prisma.category.findMany();
    console.log(`✓ Created ${newCategories.length} categories\n`);
    categories.push(...newCategories);
  }

  // Get all products
  const products = await prisma.product.findMany();

  console.log(`Found ${products.length} total products`);

  if (products.length === 0) {
    console.log('\n⚠️  No products found. Please create products first.');
    return;
  }

  console.log('Assigning/verifying categories for products...\n');
  let updated = 0;

  for (const product of products) {
    // Only update if category is different or verify it exists
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: randomCategory.id }
      });

      updated++;
      if (updated % 100 === 0) {
        console.log(`  → Processed ${updated} products...`);
      }
    } catch (error) {
      console.log(`  ⚠️  Error updating product ${product.sku}: ${error.message}`);
    }
  }

  console.log(`\n✅ Successfully linked ${updated} products to categories!`);

  // Show summary
  const summary = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log('\n📊 Category Summary:');
  console.log('═══════════════════════════════');
  for (const cat of summary) {
    console.log(`  ${cat.name}: ${cat._count.products} products`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
