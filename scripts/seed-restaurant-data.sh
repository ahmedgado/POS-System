#!/bin/bash

########################################################
# Restaurant POS System - Demo Data Generator
# Generates complete restaurant data with menu items,
# tables, modifiers, kitchen stations, and orders
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
echo "║   Restaurant POS - Demo Data Generator         ║"
echo "║   مولد بيانات نظام نقاط البيع للمطاعم         ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="/Users/ahmedgad/test/POS-System"
cd "$PROJECT_DIR"

echo -e "${YELLOW}This will generate complete restaurant data:${NC}"
echo "  • 6 Staff users (1 admin, 5 waiters)"
echo "  • 3 Floors (Ground, First Floor, Terrace)"
echo "  • 32 Tables across all floors"
echo "  • 6 Kitchen Stations (Grill, Cold, Hot, Pasta/Pizza, Dessert, Beverage)"
echo "  • 4 Modifier Groups with 15 modifiers"
echo "  • 6 Menu Categories (Appetizers, Mains, Pizza, Burgers, Desserts, Beverages)"
echo "  • 150+ Menu items with Arabic & English names"
echo "  • Product-Modifier links for customization"
echo "  • 200 Customers (60% Arabic, 40% English names)"
echo "  • 50 Sample restaurant orders (Dine-in, Takeaway, Delivery)"
echo ""
echo -e "${YELLOW}⚠️  This will CLEAR existing data and may take 2-3 minutes...${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo -e "${GREEN}Starting restaurant demo data generation...${NC}"
echo ""

# Check if Docker is running
if docker compose ps 2>/dev/null | grep -q "backend.*Up"; then
    echo -e "${GREEN}✓ Docker is running${NC}"

    # Run the restaurant seed script
    echo ""
    echo -e "${YELLOW}Generating comprehensive restaurant data...${NC}"
    echo "This will take 2-3 minutes..."
    echo ""

    docker compose exec -T backend node prisma/seed-restaurant-demo.js

    SEED_EXIT_CODE=$?

    if [ $SEED_EXIT_CODE -eq 0 ]; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  Restaurant Demo Data Generated Successfully! ║${NC}"
        echo -e "${GREEN}║  تم إنشاء بيانات المطعم التجريبية بنجاح!      ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${BLUE}Login Credentials / بيانات الدخول:${NC}"
        echo "═══════════════════════════════════════════════"
        echo -e "${GREEN}Admin:${NC}"
        echo "  Email: admin@restaurant.com"
        echo "  Password: password123"
        echo ""
        echo -e "${GREEN}Waiters (5 accounts):${NC}"
        echo "  Email: waiter1@restaurant.com through waiter5@restaurant.com"
        echo "  Password: password123"
        echo ""
        echo -e "${GREEN}Access your restaurant POS at:${NC} http://localhost"
        echo ""
    else
        echo ""
        echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║           Error During Data Generation         ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Please check the error messages above.${NC}"
        echo ""
        exit 1
    fi
else
    echo -e "${RED}⚠️  Docker is not running!${NC}"
    echo ""
    echo "Please start Docker first:"
    echo "  docker compose up -d"
    echo ""
    exit 1
fi
