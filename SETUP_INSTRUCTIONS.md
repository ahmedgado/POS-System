# POS System - Setup Instructions

## ⚠️ Important: Node.js Version

Your system is currently running **Node.js v14.21.3**, but this project requires **Node.js v18 or higher**.

### Update Node.js

#### Option 1: Using Homebrew (Recommended for macOS)
```bash
# Install/Update Node.js
brew update
brew install node@20

# or update if already installed
brew upgrade node

# Verify installation
node --version  # Should show v18.x or v20.x
npm --version   # Should show v9.x or v10.x
```

#### Option 2: Using NVM (Node Version Manager)
```bash
# Install NVM if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
```

#### Option 3: Download from nodejs.org
Visit https://nodejs.org/ and download the LTS version (v20.x)

---

## 🚀 Complete Setup Steps

### 1. Update Node.js
Follow the steps above to update Node.js to v18 or higher.

### 2. Navigate to Project
```bash
cd /Users/gado/IdeaProjects/POS-System
```

### 3. Configure Environment
```bash
cp .env.example .env
```

You can use the defaults for development, or customize as needed.

### 4. Run Setup Script
```bash
bash scripts/setup-project.sh
```

This will:
- ✅ Install all backend dependencies
- ✅ Generate Prisma client
- ✅ Create Angular frontend project
- ✅ Install Nebular Theme (Red/White)
- ✅ Setup all Docker configurations
- ✅ Create necessary directories

**Estimated time**: 5-10 minutes (depending on internet speed)

### 5. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
```

**Recommended Development Settings** (already in .env.example):
```env
NODE_ENV=development
DB_NAME=pos_db
DB_USER=pos_user
DB_PASSWORD=pos_password_123
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
STORE_NAME=My Store
STORE_TAX_RATE=0.10
```

### 6. Start Docker Services
```bash
docker compose up -d
```

Wait ~30 seconds for all services to initialize.

**Check if services are running**:
```bash
docker compose ps
```

You should see:
- ✅ pos-postgres (healthy)
- ✅ pos-redis (healthy)
- ✅ pos-backend (healthy)
- ✅ pos-frontend (healthy)
- ✅ pos-nginx (running)

### 7. Initialize Database
```bash
# Run database migrations
docker compose exec backend npx prisma migrate dev --name init

# Seed initial data (users, products, categories)
docker compose exec backend npm run prisma:seed
```

### 8. Access the Application

🎉 **Your POS System is now running!**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **Backend API** | http://localhost/api | REST API |
| **Health Check** | http://localhost/health | System status |
| **Prisma Studio** | http://localhost:5555 | Database GUI |

### 9. Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@pos.com | admin123 | Full system access |
| **Owner** | owner@pos.com | owner123 | Executive dashboard, reports |
| **Manager** | manager@pos.com | manager123 | Inventory, reports, staff |
| **Cashier** | cashier@pos.com | cashier123 | POS terminal only |

---

## 📊 What's Included

### Backend (Already Configured)
- ✅ Node.js + Express + TypeScript
- ✅ PostgreSQL database
- ✅ Prisma ORM
- ✅ Redis cache
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Error handling
- ✅ Logging system
- ✅ API routes structure

### Database (Already Created)
- ✅ Users (with roles)
- ✅ Products & Categories
- ✅ Sales & Transactions
- ✅ Customers & Loyalty
- ✅ Shifts & Cash Management
- ✅ Audit Logs
- ✅ System Settings

### Sample Data (Seeded)
- ✅ 4 Users (Admin, Owner, Manager, Cashier)
- ✅ 3 Categories (Beverages, Food, Snacks)
- ✅ 6 Products with stock
- ✅ 3 Sample customers
- ✅ System settings

### Frontend (Ready to Customize)
- ✅ Angular 17+ project
- ✅ Nebular Theme
- ✅ Red/White color scheme (ready to apply)
- ✅ Responsive design setup
- ✅ Docker configuration

---

## 🎨 Next: Building the UI

The backend is complete and running. Now we need to build the frontend UI:

### 1. Login Page (Red/White Theme)
### 2. Cashier Terminal (POS Interface)
   - Touch-friendly buttons
   - Product search
   - Shopping cart
   - Payment processing

### 3. Admin Dashboard
   - Sales charts
   - KPIs
   - Recent transactions
   - Alerts

### 4. Owner Dashboard
   - Executive metrics
   - Financial overview
   - Multi-period comparisons

### 5. Management Pages
   - Products management
   - Inventory control
   - Customer management
   - User management
   - Shift management
   - Reports (PDF/Excel)

---

## 🔧 Development Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Restart Services
```bash
docker compose restart
```

### Stop System
```bash
docker compose down
```

### Rebuild After Changes
```bash
docker compose down
docker compose up -d --build
```

### Backend Development (without Docker)
```bash
cd backend
npm run dev
```

### Frontend Development (without Docker)
```bash
cd frontend
npm start
```

### Access Database
```bash
# Using Prisma Studio (GUI)
cd backend
npx prisma studio

# Using psql (command line)
docker compose exec postgres psql -U pos_user -d pos_db
```

---

## 🐛 Troubleshooting

### "Node version not supported" Error
- Update Node.js to v18+ (see instructions above)
- Verify: `node --version`

### "Port already in use" Error
```bash
# Find what's using the port
lsof -i :80    # Frontend/Nginx
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop other services or change ports in .env
```

### Database Connection Error
```bash
# Reset database
docker compose down -v
docker compose up -d postgres redis
# Wait 10 seconds
docker compose up -d backend frontend nginx
docker compose exec backend npx prisma migrate dev
docker compose exec backend npm run prisma:seed
```

### Backend Won't Start
```bash
# Check logs
docker compose logs backend

# Rebuild backend
docker compose down
docker compose up -d --build backend
```

### Frontend Build Fails
```bash
cd frontend
rm -rf node_modules .angular
npm install
npm start
```

---

## 📚 Documentation

- **README.md** - Project overview
- **QUICK_START.md** - Quick start guide
- **PROJECT_STATUS.md** - Development progress
- **SETUP_INSTRUCTIONS.md** - This file

---

## ✅ Checklist

Before proceeding with UI development:

- [ ] Node.js v18+ installed
- [ ] Docker running
- [ ] All services healthy (`docker compose ps`)
- [ ] Database migrated
- [ ] Sample data seeded
- [ ] Can access http://localhost
- [ ] Can login with test credentials
- [ ] Backend API responding (http://localhost/api/health)

---

## 🎯 Ready to Build the UI?

Once all services are running and you can access the application, we'll build:

1. **Red/White Theme** - Custom Nebular theme
2. **Login Page** - Clean, professional login
3. **Cashier Terminal** - Full POS interface
4. **Dashboards** - Admin & Owner views with charts
5. **Management** - All CRUD operations
6. **Reports** - PDF & Excel generation

**Let me know when you're ready, and I'll start building the Angular components!** 🚀
