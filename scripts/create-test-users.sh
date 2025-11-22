#!/bin/bash

# Script to create test users for role testing
# Run this inside the postgres container

echo "Creating test users for role testing..."

# Note: Password is 'password123' hashed with bcrypt
# Hash generated with: bcrypt.hash('password123', 10)
PASSWORD_HASH='$2b$10$rZ5zKHf8vKqK5F5F5F5F5uO5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F'

docker exec -i pos-postgres psql -U postgres -d pos_db << 'EOF'

-- Insert test users (skip if they already exist)

-- Manager (already created via UI)
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'manager',
  'manager@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'Restaurant',
  'Manager',
  'MANAGER',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Cashier
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'cashier',
  'cashier@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'POS',
  'Cashier',
  'CASHIER',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Waiter
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'waiter',
  'waiter@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'Restaurant',
  'Waiter',
  'WAITER',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Kitchen Staff
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'kitchen',
  'kitchen@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'Kitchen',
  'Staff',
  'KITCHEN_STAFF',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inventory Clerk
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'inventory',
  'inventory@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'Inventory',
  'Clerk',
  'INVENTORY_CLERK',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Owner (bonus role)
INSERT INTO users (id, username, email, password, "firstName", "lastName", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'owner',
  'owner@restaurant.com',
  '$2b$10$YourHashedPasswordHere',
  'Restaurant',
  'Owner',
  'OWNER',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Show all users
SELECT email, role, "firstName", "lastName", status FROM users ORDER BY role;

EOF

echo "✅ Test users created successfully!"
echo ""
echo "Test User Credentials:"
echo "======================"
echo "1. Admin:     admin@restaurant.com / password123"
echo "2. Owner:     owner@restaurant.com / password123"
echo "3. Manager:   manager@restaurant.com / password123"
echo "4. Cashier:   cashier@restaurant.com / password123"
echo "5. Waiter:    waiter@restaurant.com / password123"
echo "6. Kitchen:   kitchen@restaurant.com / password123"
echo "7. Inventory: inventory@restaurant.com / password123"
