# Apply Restaurant Schema - Docker Method

## Quick Start (Recommended)

Since you're using Docker to avoid Node.js version issues, here's the simplified approach:

### Method 1: One-Command Migration (Easiest)

```bash
cd /Users/ahmedgad/test/POS-System
./migrate-restaurant-schema.sh
```

This script will:
1. ✅ Stop existing containers
2. ✅ Rebuild backend with new schema
3. ✅ Start database
4. ✅ Create migration automatically
5. ✅ Generate Prisma Client
6. ✅ Start all services
7. ✅ Show summary of changes

**Time:** ~2-3 minutes

---

### Method 2: Manual Docker Commands (If script fails)

```bash
cd /Users/ahmedgad/test/POS-System

# Step 1: Stop everything
docker-compose down

# Step 2: Rebuild backend
docker-compose build backend

# Step 3: Start database only
docker-compose up -d db

# Step 4: Wait for DB (important!)
sleep 15

# Step 5: Create migration
docker-compose run --rm backend npx prisma migrate dev --name restaurant_features

# Step 6: Generate Prisma Client
docker-compose run --rm backend npx prisma generate

# Step 7: Start everything
docker-compose up -d

# Step 8: Check logs
docker-compose logs -f backend
```

---

### Method 3: Complete Fresh Start (If database has issues)

```bash
cd /Users/ahmedgad/test/POS-System

# CAUTION: This deletes ALL data
docker-compose down -v  # -v removes volumes (database data)

# Rebuild and start
docker-compose up --build -d

# Check backend logs
docker-compose logs -f backend
```

---

## Verification Steps

After migration, verify it worked:

### 1. Check Migration Files
```bash
ls -la backend/prisma/migrations/
```

You should see a new folder: `YYYYMMDDHHMMSS_restaurant_features/`

### 2. Check Database Tables
```bash
# Connect to database
docker-compose exec db psql -U postgres -d pos_system

# List tables
\dt

# You should see new tables:
# - floors
# - tables
# - modifier_groups
# - modifiers
# - product_modifier_groups
# - sale_item_modifiers
# - ingredients
# - recipes
# - recipe_items
# - kitchen_stations
# - product_kitchen_stations
# - kitchen_tickets

# Exit psql
\q
```

### 3. Check Backend Logs
```bash
docker-compose logs backend | grep -i "prisma\|migration\|database"
```

Should show:
- ✅ "Database connected successfully"
- ✅ No Prisma errors
- ✅ Server running on port 3000

### 4. Test Frontend
1. Open http://localhost:4200
2. Login (existing credentials should work)
3. Navigate to POS - should load normally
4. Check browser console for errors

---

## Troubleshooting

### Problem: "Column already exists" error

**Solution:** Database already has the schema partially. Reset it:
```bash
docker-compose down -v
docker-compose up --build -d
```

### Problem: "Cannot connect to database"

**Solution:** Database not ready yet:
```bash
# Stop everything
docker-compose down

# Start database only
docker-compose up -d db

# Wait 20 seconds
sleep 20

# Check database is ready
docker-compose exec db pg_isready -U postgres

# If ready, continue with migration
docker-compose run --rm backend npx prisma migrate dev --name restaurant_features
```

### Problem: "Prisma Client not generated"

**Solution:**
```bash
docker-compose run --rm backend npx prisma generate
docker-compose restart backend
```

### Problem: Backend won't start

**Solution:** Check logs:
```bash
docker-compose logs backend --tail=50
```

Common fixes:
```bash
# Rebuild backend
docker-compose build --no-cache backend

# Restart
docker-compose up -d backend
```

---

## What Changed in the Database?

### New Tables (12 tables)
```sql
-- Table management
floors
tables

-- Modifiers
modifier_groups
modifiers
product_modifier_groups
sale_item_modifiers

-- Recipe/BOM
ingredients
recipes
recipe_items

-- Kitchen
kitchen_stations
product_kitchen_stations
kitchen_tickets
```

### Modified Tables (4 tables)
```sql
-- sales table: Added restaurant fields
ALTER TABLE sales ADD COLUMN waiter_id UUID;
ALTER TABLE sales ADD COLUMN table_id UUID;
ALTER TABLE sales ADD COLUMN order_type TEXT DEFAULT 'DINE_IN';
ALTER TABLE sales ADD COLUMN order_status TEXT DEFAULT 'PENDING';
ALTER TABLE sales ADD COLUMN service_charge DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN tip_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN delivery_address TEXT;
ALTER TABLE sales ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN estimated_time TIMESTAMP;

-- sale_items table: Added restaurant fields
ALTER TABLE sale_items ADD COLUMN course_type TEXT;
ALTER TABLE sale_items ADD COLUMN notes TEXT;
ALTER TABLE sale_items ADD COLUMN sent_to_kitchen_at TIMESTAMP;
ALTER TABLE sale_items ADD COLUMN ready_at TIMESTAMP;

-- products table: Added relations (no column changes, just foreign keys)

-- users table: Added relation for waiter role
```

### New Enums
```sql
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY', 'DRIVE_THRU');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING');
CREATE TYPE "KitchenTicketStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'READY', 'SERVED', 'CANCELLED');
```

### Updated Enums
```sql
-- UserRole: Added WAITER, KITCHEN_STAFF
ALTER TYPE "UserRole" ADD VALUE 'WAITER';
ALTER TYPE "UserRole" ADD VALUE 'KITCHEN_STAFF';

-- MovementType: Added WASTE, COMP
ALTER TYPE "MovementType" ADD VALUE 'WASTE';
ALTER TYPE "MovementType" ADD VALUE 'COMP';

-- PaymentMethod: Added MOBILE_WALLET
ALTER TYPE "PaymentMethod" ADD VALUE 'MOBILE_WALLET';
```

---

## Backward Compatibility

✅ **ALL existing data is preserved**

- Existing sales will have default values for new fields
- Existing products still work
- Existing users still work
- POS functionality unchanged (retail mode still works)

Restaurant features are **additive**, not replacing anything.

---

## Testing the Migration

### Basic Test Flow:

```bash
# 1. Start services
./migrate-restaurant-schema.sh

# 2. Access frontend
open http://localhost:4200

# 3. Login (use existing credentials)

# 4. Test existing POS functionality
# - Should work exactly as before
# - Products, customers, sales all intact

# 5. Access API to verify new endpoints ready
curl http://localhost:3000/api/health

# 6. Check new tables exist
docker-compose exec db psql -U postgres -d pos_system -c "SELECT COUNT(*) FROM floors;"
# Should return: 0 (empty but table exists)
```

---

## Next: Seed Restaurant Data

After migration succeeds, optionally add demo restaurant data:

```bash
# Create seed script (to be implemented)
docker-compose run --rm backend npm run seed:restaurant
```

This will create:
- 2 floors (Main Dining, Patio)
- 10 tables (T1-T10)
- 3 modifier groups (Size, Spice Level, Extras)
- 10 modifiers
- 2 kitchen stations (Grill, Bar)
- Sample recipes for 5 products

---

## Migration Complete Checklist

- [ ] Script executed without errors
- [ ] New migration folder created in `backend/prisma/migrations/`
- [ ] Database tables created (verify with `\dt` in psql)
- [ ] Backend starts without errors (`docker-compose logs backend`)
- [ ] Frontend loads at http://localhost:4200
- [ ] Can login with existing credentials
- [ ] POS page loads without errors
- [ ] Existing products/sales/customers visible
- [ ] No console errors in browser

---

## Files Modified

1. `backend/prisma/schema.prisma` - Database schema (250+ lines added)
2. `migrate-restaurant-schema.sh` - Migration automation script (NEW)
3. `RESTAURANT_SCHEMA_ADDED.md` - Implementation guide (NEW)

---

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f backend`
2. Check database: `docker-compose exec db psql -U postgres -d pos_system`
3. Fresh start: `docker-compose down -v && docker-compose up --build -d`

---

**Ready to migrate?**

```bash
cd /Users/ahmedgad/test/POS-System
./migrate-restaurant-schema.sh
```

🚀 Let's transform your POS into a restaurant system!
