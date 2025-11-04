# 🎯 Demo Data Generator - README
# مولد البيانات التجريبية

---

## 🚀 **Quick Start**

### Generate 5000 Products + 1000 Customers:

```bash
cd /Users/gado/IdeaProjects/POS-System
./scripts/seed-demo-data.sh
```

**Wait 2-3 minutes.** Done! ✅

---

## 📦 **What Gets Generated**

| Data Type | Quantity | Details |
|-----------|----------|---------|
| **Users** | 10 | 2 per role (Admin, Owner, Manager, Cashier, Inventory) |
| **Categories** | 8 | Electronics, Clothing, Food, Home, Beauty, Books, Sports, Toys |
| **Products** | 5000 | With images, SKUs, barcodes, pricing, stock levels |
| **Customers** | 1000 | 600 Arabic names, 400 English names, with loyalty points |
| **Sales** | 100 | Sample transactions with multiple items |

---

## 👥 **User Accounts Created**

All passwords: **`password123`**

### Admin (Full Access):
- `admin1@pos.com`
- `admin2@pos.com`

### Owner (Business Metrics):
- `owner1@pos.com`
- `owner2@pos.com`

### Manager (Operations):
- `manager1@pos.com`
- `manager2@pos.com`

### Cashier (POS Only):
- `cashier1@pos.com`
- `cashier2@pos.com`

### Inventory (Stock Management):
- `inventory_clerk1@pos.com`
- `inventory_clerk2@pos.com`

**Full credentials in:** `USER_CREDENTIALS.md`

---

## 🏷️ **Product Categories**

1. **Electronics** (Phones, Laptops, Tablets, Accessories, Audio, Gaming)
2. **Clothing** (Men, Women, Kids, Shoes, Accessories, Sports)
3. **Food & Beverages** (Snacks, Drinks, Fresh, Frozen, Bakery, Dairy)
4. **Home & Garden** (Furniture, Decor, Kitchen, Garden, Tools, Lighting)
5. **Beauty & Health** (Skincare, Makeup, Hair, Supplements, Personal Care, Fitness)
6. **Books & Media** (Fiction, Non-Fiction, Educational, Magazines, Music, Movies)
7. **Sports & Outdoors** (Equipment, Apparel, Camping, Cycling, Fitness, Water Sports)
8. **Toys & Games** (Action Figures, Dolls, Board Games, Puzzles, Educational, Outdoor)

---

## 🖼️ **Product Images**

Products include placeholder images from:
```
https://via.placeholder.com/300x300?text={category-name}
```

Example:
- Electronics: `https://via.placeholder.com/300x300?text=phones`
- Clothing: `https://via.placeholder.com/300x300?text=mens-clothing`
- Food: `https://via.placeholder.com/300x300?text=snacks`

**To use real images:**
1. Replace `imageUrl` in database
2. Or update the `getPlaceholderImage()` function in `seed-demo.ts`

---

## 👤 **Customer Data**

### Arabic Names (60%):
- First names: أحمد, محمد, علي, فاطمة, عائشة, مريم, etc.
- Last names: الأحمد, المحمد, العلي, الحسن, السعيد, etc.
- Addresses: Saudi Arabia format

### English Names (40%):
- First names: James, John, Mary, Patricia, etc.
- Last names: Smith, Johnson, Williams, etc.
- Addresses: International format

### Customer Fields:
- Name (bilingual)
- Email (auto-generated)
- Phone (+966 5XX XXX XXX)
- Address (Arabic or English)
- Loyalty Points (0-1000)
- Total Spent ($0-$10,000)

---

## 💰 **Sample Sales**

100 transactions with:
- 1-5 items per sale
- Random products from catalog
- Payment methods: Cash, Card, Mobile
- Discounts: 30% chance (up to 20% off)
- Tax: 15% (configurable)
- Customer assignment
- Cashier assignment

---

## 📊 **Product Details**

Each product includes:
- **Name**: Brand + Template + Subcategory + Number
- **SKU**: Category-based (e.g., ELE-000001, CLO-000123)
- **Barcode**: BAR0000000001 format
- **Category**: Main and subcategory
- **Description**: Auto-generated
- **Price**: $1.00 - $999.00
- **Cost**: $0.50 - $499.00 (for profit calculation)
- **Stock**: 0-500 units
- **Min Stock**: 5-20 units (for alerts)
- **Image URL**: Placeholder
- **Active**: Yes

---

## 🔄 **Re-running the Script**

### ⚠️ **CAUTION:** The script **CLEARS existing data** before generating new data!

It deletes:
- ✅ All sales & sale items
- ✅ All shifts
- ✅ All products
- ✅ All customers
- ✅ All categories
- ❌ KEEPS users (will not delete existing users)

### To keep existing data:

Edit `backend/prisma/seed-demo.ts` and comment out the delete lines:

```typescript
// Comment these out to keep existing data:
// await prisma.saleItem.deleteMany({});
// await prisma.sale.deleteMany({});
// await prisma.product.deleteMany({});
// await prisma.customer.deleteMany({});
// await prisma.category.deleteMany({});
```

---

## ⏱️ **Generation Time**

| Data Type | Approximate Time |
|-----------|------------------|
| Users | < 5 seconds |
| Categories | < 2 seconds |
| Products (5000) | 60-90 seconds |
| Customers (1000) | 30-45 seconds |
| Sales (100) | 15-20 seconds |
| **TOTAL** | **2-3 minutes** |

Progress indicators show during generation.

---

## 🎯 **Use Cases**

### Perfect for:
✅ Testing product search with large catalog
✅ Testing pagination (5000 products = 100+ pages)
✅ Performance testing (database queries)
✅ Demo presentations
✅ Training cashiers
✅ Testing reports with realistic data
✅ UI/UX testing with real volume
✅ Load testing

### Good for:
✅ Development and debugging
✅ Feature testing
✅ Client demonstrations
✅ User acceptance testing (UAT)
✅ Screenshot/video creation

---

## 📈 **Database Size**

After running the script:

| Table | Rows | Approx Size |
|-------|------|-------------|
| users | 10 | 1 KB |
| categories | 8 | < 1 KB |
| products | 5000 | ~2 MB |
| customers | 1000 | ~500 KB |
| sales | 100 | ~50 KB |
| sale_items | 250-500 | ~100 KB |
| **TOTAL** | **~6300** | **~3 MB** |

---

## 🔍 **Searching & Filtering**

With 5000 products, test:

### Search by:
- Product name (e.g., "TechPro")
- SKU (e.g., "ELE-000123")
- Barcode (e.g., "BAR0000000456")
- Category (e.g., "Electronics")
- Subcategory (e.g., "Phones")

### Filter by:
- Price range ($1 - $999)
- Stock status (In Stock, Low Stock, Out of Stock)
- Category
- Brand (TechPro, StyleMax, FreshChoice, etc.)

---

## 🎨 **Customization**

### Change Product Quantity:

Edit `seed-demo.ts`:
```typescript
// Change 5000 to desired number
const productsPerCategory = Math.floor(5000 / categories.length);
```

### Change Customer Quantity:

Edit `seed-demo.ts`:
```typescript
// Change 1000 to desired number
for (let i = 1; i <= 1000; i++) {
```

### Add More Categories:

Edit the `CATEGORIES` array in `seed-demo.ts`

### Change Price Range:

Edit the `randomPrice()` calls:
```typescript
price: randomPrice(1, 999),  // Change min/max
```

---

## 🛠️ **Manual Execution**

If you want to run the seed script manually:

```bash
# From project root
cd /Users/gado/IdeaProjects/POS-System

# If using Docker (recommended)
docker compose exec backend npm run prisma:seed-demo

# If running locally
cd backend
npm run prisma:seed-demo
cd ..
```

---

## 📝 **Troubleshooting**

### Script fails with "Docker not running":
**Solution:** Start Docker Desktop and try again

### "Table not found" error:
**Solution:** Run migrations first:
```bash
docker compose exec backend npx prisma migrate deploy
```

### "Permission denied":
**Solution:** Make script executable:
```bash
chmod +x scripts/seed-demo-data.sh
```

### Takes too long (>5 minutes):
**Solution:**
- Check Docker resources (increase RAM/CPU)
- Reduce product/customer count
- Check database performance

### Out of memory error:
**Solution:**
- Reduce product count to 1000-2000
- Increase Docker memory limit
- Generate data in batches

---

## 🎯 **Best Practices**

### For Development:
- Run once at start
- Use smaller dataset (1000 products, 200 customers)
- Keep data between restarts

### For Testing:
- Run before each test cycle
- Use full dataset (5000 products, 1000 customers)
- Fresh data ensures consistency

### For Demos:
- Run day before demo
- Review generated data
- Test all features with data
- Prepare specific scenarios

### For Production:
- **DO NOT RUN** in production!
- Use real data migration scripts
- Import from existing systems
- Validate all data before import

---

## 📊 **What's Next?**

After generating demo data:

1. **Login** with any user account
2. **Explore Products** - Search through 5000 items
3. **Test POS** - Process sales with demo products
4. **View Reports** - See analytics with 100 sales
5. **Manage Inventory** - Update stock levels
6. **Test Search** - Find products by SKU, name, barcode
7. **Check Performance** - Test pagination, filters
8. **Generate Reports** - PDF/Excel with real data

---

## 🎉 **Ready to Generate!**

Just run:

```bash
./scripts/seed-demo-data.sh
```

And you'll have a fully populated POS system ready for testing!

**Happy testing!**
**اختبار سعيد!**

---

**See also:**
- `USER_CREDENTIALS.md` - Full list of user accounts
- `QUICK_REFERENCE.md` - Quick command reference
- `WORK_COMPLETED.md` - Complete project documentation
