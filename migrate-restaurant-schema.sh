#!/bin/bash

# Restaurant Schema Migration Script
# Run this to apply the new restaurant features to the database

echo "🍽️  Restaurant POS Schema Migration"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop first."
  exit 1
fi

echo "✅ Docker is running"
echo ""

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

echo ""
echo "🔨 Building backend with new schema..."
docker-compose build backend

echo ""
echo "🚀 Starting database..."
docker-compose up -d db

echo "⏳ Waiting for database to be ready (15 seconds)..."
sleep 15

echo ""
echo "🗄️  Creating migration for restaurant features..."
docker-compose run --rm backend npx prisma migrate dev --name restaurant_features --skip-generate

echo ""
echo "🔄 Generating Prisma Client..."
docker-compose run --rm backend npx prisma generate

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start (10 seconds)..."
sleep 10

echo ""
echo "🎉 Restaurant features schema applied successfully!"
echo ""
echo "======================================"
echo "📋 Summary of Changes:"
echo "======================================"
echo "New Tables Created:"
echo "  - floors (restaurant sections)"
echo "  - tables (dining tables)"
echo "  - modifier_groups (size, extras, etc.)"
echo "  - modifiers (individual options)"
echo "  - product_modifier_groups (link products to modifiers)"
echo "  - sale_item_modifiers (selected modifiers per order)"
echo "  - ingredients (recipe ingredients)"
echo "  - recipes (product recipes)"
echo "  - recipe_items (ingredients per recipe)"
echo "  - kitchen_stations (grill, bar, etc.)"
echo "  - product_kitchen_stations (routing)"
echo "  - kitchen_tickets (kitchen orders)"
echo ""
echo "Enhanced Tables:"
echo "  - sales (added: waiter, table, orderType, orderStatus, serviceCharge, tips, delivery)"
echo "  - sale_items (added: courseType, notes, kitchen timing)"
echo "  - users (added: waiter role)"
echo "  - products (added: modifier, recipe, kitchen station relations)"
echo ""
echo "======================================"
echo "🌐 Services running at:"
echo "======================================"
echo "Frontend: http://localhost:4200"
echo "Backend:  http://localhost:3000"
echo "Database: localhost:5432"
echo ""
echo "======================================"
echo "📝 Next Steps:"
echo "======================================"
echo "1. Open http://localhost:4200 in your browser"
echo "2. Login with existing credentials"
echo "3. Test basic POS functionality (should still work)"
echo "4. Review RESTAURANT_SCHEMA_ADDED.md for implementation guide"
echo "5. Start implementing restaurant features (tables, modifiers, KDS)"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
