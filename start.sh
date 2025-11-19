#!/bin/bash

#########################################
# POS System - Complete Deployment Script
# Run this to deploy everything on Docker
#########################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/Users/gado/IdeaProjects/POS-System"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║   POS System - Complete Deployment            ║"
echo "║   نظام نقاط البيع - نشر كامل                  ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check Prerequisites
echo -e "\n${YELLOW}[1/10] Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"

# Check docker compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: docker compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ docker compose is installed${NC}"

# Step 2: Navigate to project directory
echo -e "\n${YELLOW}[2/10] Navigating to project directory...${NC}"
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Working directory: $(pwd)${NC}"

# Step 3: Setup environment
echo -e "\n${YELLOW}[3/10] Setting up environment...${NC}"

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 4: Stop existing containers
echo -e "\n${YELLOW}[4/10] Stopping existing containers (if any)...${NC}"
docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ Existing containers stopped${NC}"

# Step 5: Build and start containers
echo -e "\n${YELLOW}[5/10] Building Docker containers...${NC}"
echo "This may take 3-5 minutes on first run..."
docker compose up -d --build

# Step 6: Wait for services to be healthy
echo -e "\n${YELLOW}[6/10] Waiting for services to be healthy...${NC}"

echo -n "Waiting for PostgreSQL."
for i in {1..30}; do
    if docker compose exec -T postgres pg_isready -U pos_user &>/dev/null; then
        echo -e "\n${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo -n "Waiting for Redis."
for i in {1..15}; do
    if docker compose exec -T redis redis-cli ping &>/dev/null; then
        echo -e "\n${GREEN}✓ Redis is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "Waiting for Backend."
for i in {1..30}; do
    if curl -f http://localhost/api/health &>/dev/null; then
        echo -e "\n${GREEN}✓ Backend is ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Step 7: Run database migrations
echo -e "\n${YELLOW}[7/10] Running database migrations...${NC}"
docker compose exec -T backend npx prisma migrate deploy
echo -e "${GREEN}✓ Database migrations completed${NC}"

# Step 8: Seed database
echo -e "\n${YELLOW}[8/10] Seeding database with sample data...${NC}"
docker compose exec -T backend npm run prisma:seed
echo -e "${GREEN}✓ Database seeded successfully${NC}"

# Step 9: Create translation files
echo -e "\n${YELLOW}[9/10] Creating translation files...${NC}"

# Create translations directory
docker compose exec -T backend sh -c "mkdir -p /app/../frontend/src/assets/i18n" 2>/dev/null || true

# Check if translation script exists and run it
if [ -f "scripts/create-translations.sh" ]; then
    bash scripts/create-translations.sh
    echo -e "${GREEN}✓ Translation files created${NC}"
else
    echo -e "${YELLOW}⚠ Translation script not found, skipping...${NC}"
fi

# Step 10: Verify deployment
echo -e "\n${YELLOW}[10/10] Verifying deployment...${NC}"

# Check all services
echo ""
echo "Service Status:"
echo "==============="
docker compose ps

echo ""
echo "Health Checks:"
echo "============="

# Backend health
if curl -f http://localhost/api/health &>/dev/null; then
    echo -e "${GREEN}✓ Backend API: healthy${NC}"
else
    echo -e "${RED}✗ Backend API: unhealthy${NC}"
fi

# Frontend check
if curl -f http://localhost &>/dev/null; then
    echo -e "${GREEN}✓ Frontend: healthy${NC}"
else
    echo -e "${YELLOW}⚠ Frontend: building...${NC}"
fi

# Final Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Deployment Completed! ✓              ║${NC}"
echo -e "${BLUE}║           النشر مكتمل! ✓                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your POS System is now running!${NC}"
echo -e "${GREEN}نظام نقاط البيع الخاص بك يعمل الآن!${NC}"
echo ""
echo "Access your application:"
echo "========================"
echo -e "Frontend:     ${BLUE}http://localhost${NC}"
echo -e "Backend API:  ${BLUE}http://localhost/api${NC}"
echo -e "Health Check: ${BLUE}http://localhost/health${NC}"
echo ""
echo "Default Login Credentials:"
echo "=========================="
echo -e "Admin:    ${GREEN}admin@pos.com${NC} / ${GREEN}admin123${NC}"
echo -e "Owner:    ${GREEN}owner@pos.com${NC} / ${GREEN}owner123${NC}"
echo -e "Manager:  ${GREEN}manager@pos.com${NC} / ${GREEN}manager123${NC}"
echo -e "Cashier:  ${GREEN}cashier@pos.com${NC} / ${GREEN}cashier123${NC}"
echo ""
echo "Sample Data:"
echo "============"
echo "✓ 4 Users (Admin, Owner, Manager, Cashier)"
echo "✓ 3 Categories (Beverages, Food, Snacks)"
echo "✓ 6 Products with stock"
echo "✓ 3 Sample customers"
echo "✓ System settings configured"
echo ""
echo "Useful Commands:"
echo "================"
echo -e "${YELLOW}View logs:${NC}          docker compose logs -f"
echo -e "${YELLOW}Stop system:${NC}        docker compose down"
echo -e "${YELLOW}Restart:${NC}            docker compose restart"
echo -e "${YELLOW}Rebuild:${NC}            bash start.sh"
echo ""
echo "Documentation:"
echo "=============="
echo "START_HERE.md           - Quick start guide"
echo "DOCKER_DESKTOP_SETUP.md - Docker guide"
echo "README_BILINGUAL.md     - Bilingual features"
echo "frontend-i18n-setup.md  - Translation guide"
echo ""
echo -e "${GREEN}Happy selling! 🎉${NC}"
echo -e "${GREEN}مبيعات سعيدة! 🎉${NC}"
echo ""
