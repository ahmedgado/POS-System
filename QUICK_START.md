# POS System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- Git installed
- 4GB RAM minimum
- 10GB free disk space

### Step 1: Navigate to Project
```bash
cd /Users/gado/IdeaProjects/POS-System
```

### Step 2: Run Setup Script
```bash
bash scripts/setup-project.sh
```

This script will:
- Install all backend dependencies
- Create Angular frontend project
- Install Nebular Theme
- Setup Docker configurations
- Create all necessary directories

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your preferences (or use defaults for development).

### Step 4: Start the System
```bash
docker compose up -d
```

Wait ~30 seconds for all services to start.

### Step 5: Initialize Database
```bash
# Run migrations
docker compose exec backend npx prisma migrate dev --name init

# Seed initial data
docker compose exec backend npm run prisma:seed
```

### Step 6: Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/health
- **API Docs**: http://localhost/api/docs (coming soon)

### Step 7: Login

Use one of these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pos.com | admin123 |
| Owner | owner@pos.com | owner123 |
| Manager | manager@pos.com | manager123 |
| Cashier | cashier@pos.com | cashier123 |

---

## 📋 Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop System
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### Rebuild After Changes
```bash
docker compose down
docker compose up -d --build
```

### Access Database
```bash
docker compose exec postgres psql -U pos_user -d pos_db
```

### Access Prisma Studio (DB GUI)
```bash
cd backend
npx prisma studio
```

Access at: http://localhost:5555

---

## 🔧 Development Mode

### Backend Development
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3000

### Frontend Development
```bash
cd frontend
npm start
```

Frontend runs on: http://localhost:4200

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop Docker containers
docker compose down
```

### Database Connection Error
```bash
# Reset database
docker compose down -v
docker compose up -d
# Wait 10 seconds
docker compose exec backend npx prisma migrate dev
```

### Clear Everything and Start Fresh
```bash
# Stop and remove all containers, volumes, and networks
docker compose down -v

# Remove node_modules (optional)
rm -rf backend/node_modules frontend/node_modules

# Start setup again
bash scripts/setup-project.sh
docker compose up -d
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📊 System Status Check

```bash
# Check if all services are running
docker compose ps

# Expected output:
# pos-postgres   running   0.0.0.0:5432->5432/tcp
# pos-redis      running   0.0.0.0:6379->6379/tcp
# pos-backend    running   0.0.0.0:3000->3000/tcp
# pos-frontend   running   0.0.0.0:4200->80/tcp
# pos-nginx      running   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## 🎯 Next Steps

1. **Customize Theme**: Edit `frontend/src/themes/custom-theme.scss`
2. **Add Products**: Login as Admin → Products → Add New
3. **Create Users**: Admin → Users → Add New
4. **Test POS**: Login as Cashier → Start Shift → Process Sale
5. **View Reports**: Admin/Owner → Reports → Generate

---

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Project Status](./PROJECT_STATUS.md)
- [API Documentation](./docs/API.md) (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) (coming soon)

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Verify all services are healthy: `docker compose ps`
3. Check environment variables in `.env`
4. Ensure ports 80, 3000, 5432, 6379 are not in use
5. Try fresh install: Clear everything and run setup again

---

**Happy selling! 🎉**
