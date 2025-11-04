# POS System - Docker Desktop Setup
## No Node.js Installation Required! 🐳

Everything runs in Docker - your OS Node.js won't be touched!

---

## ✅ Prerequisites

1. **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running (whale icon in menu bar)

2. **Git** (for cloning if needed)

That's it! No Node.js, npm, or any other dependencies needed on your Mac!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Verify Docker is Running

```bash
docker --version
# Should show: Docker version 24.x or higher

docker compose --version
# Should show: Docker Compose version 2.x or higher
```

### Step 2: Navigate to Project

```bash
cd /Users/gado/IdeaProjects/POS-System
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

You can use the defaults in `.env` or customize them. Default values work fine for development.

### Step 4: Build and Start All Services

```bash
# Build and start all containers
docker compose up -d --build
```

This will:
- ✅ Download latest images (Node.js 20, PostgreSQL 16, Redis, Nginx)
- ✅ Build backend (inside container)
- ✅ Build frontend (inside container)
- ✅ Start all 5 services
- ✅ Create networks and volumes

**Wait ~2-3 minutes** for first build.

### Step 5: Check Status

```bash
docker compose ps
```

You should see all services running:
```
NAME            STATUS          PORTS
pos-postgres    Up (healthy)    0.0.0.0:5432->5432/tcp
pos-redis       Up (healthy)    0.0.0.0:6379->6379/tcp
pos-backend     Up (healthy)    0.0.0.0:3000->3000/tcp
pos-frontend    Up (healthy)    0.0.0.0:4200->80/tcp
pos-nginx       Up              0.0.0.0:80->80/tcp
```

### Step 6: Initialize Database

```bash
# Run database migrations
docker compose exec backend npx prisma migrate dev --name init

# Seed sample data
docker compose exec backend npm run prisma:seed
```

### Step 7: Create Translation Files

```bash
docker compose exec backend sh -c "mkdir -p /app/../frontend/src/assets/i18n"
bash scripts/create-translations.sh
```

### Step 8: Access Application

🎉 **Your POS System is running!**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **Backend API** | http://localhost/api | REST API |
| **Health Check** | http://localhost/health | System status |

### Step 9: Login

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@pos.com | admin123 |
| **Owner** | owner@pos.com | owner123 |
| **Manager** | manager@pos.com | manager123 |
| **Cashier** | cashier@pos.com | cashier123 |

---

## 📊 What's Running in Docker

### Container Details

1. **pos-postgres** (PostgreSQL 16)
   - Latest PostgreSQL database
   - Port: 5432
   - Volume: Persistent data storage

2. **pos-redis** (Redis Latest)
   - Latest Redis cache
   - Port: 6379
   - Session storage & caching

3. **pos-backend** (Node.js 20)
   - Latest Node.js 20 LTS
   - Express + TypeScript
   - Prisma ORM
   - Port: 3000

4. **pos-frontend** (Angular + Nginx)
   - Angular app with Nginx
   - Red/White theme
   - Arabic/English support
   - Port: 4200

5. **pos-nginx** (Nginx Latest)
   - Reverse proxy
   - Load balancer
   - SSL ready
   - Port: 80, 443

---

## 🔧 Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop System

```bash
docker compose down
```

### Start System

```bash
docker compose up -d
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build backend
```

### Access Container Shell

```bash
# Backend shell
docker compose exec backend sh

# PostgreSQL shell
docker compose exec postgres psql -U pos_user -d pos_db

# Redis CLI
docker compose exec redis redis-cli
```

### Install New npm Packages (Backend)

```bash
# Add package to backend/package.json, then rebuild
docker compose up -d --build backend
```

### Database Operations

```bash
# Run migrations
docker compose exec backend npx prisma migrate dev

# Generate Prisma client
docker compose exec backend npx prisma generate

# Open Prisma Studio (DB GUI)
docker compose exec backend npx prisma studio
# Then open http://localhost:5555

# Seed database
docker compose exec backend npm run prisma:seed

# Reset database (WARNING: Deletes all data)
docker compose exec backend npx prisma migrate reset
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :80
lsof -i :3000
lsof -i :5432

# Stop Docker containers
docker compose down
```

### Containers Not Starting

```bash
# Check Docker Desktop is running
# Look for whale icon in menu bar

# View detailed logs
docker compose logs

# Remove and recreate
docker compose down -v
docker compose up -d --build
```

### Database Connection Error

```bash
# Reset database
docker compose down -v
docker compose up -d
# Wait 30 seconds for database to initialize
docker compose exec backend npx prisma migrate dev
docker compose exec backend npm run prisma:seed
```

### Backend Build Fails

```bash
# Clean rebuild
docker compose down
docker compose build --no-cache backend
docker compose up -d
```

### Frontend Build Fails

```bash
# Check if frontend directory exists
ls -la frontend/

# If empty, create Angular app in Docker
docker run --rm -v $(pwd)/frontend:/app -w /app node:20-alpine sh -c "npm install -g @angular/cli && ng new . --skip-git --routing --style=scss"
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

---

## 🔍 Health Checks

Check if all services are healthy:

```bash
# Backend health
curl http://localhost/api/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":123,"environment":"production"}
```

---

## 📦 Version Information

All services use **latest stable versions**:

| Service | Version | Image |
|---------|---------|-------|
| Node.js | 20 LTS | node:20-alpine |
| PostgreSQL | 16 | postgres:16-alpine |
| Redis | Latest | redis:alpine |
| Nginx | Latest | nginx:alpine |
| Angular | 17+ | Built in container |

---

## 🎯 Development Workflow

### 1. Make Code Changes

Edit files in:
- `backend/src/` - Backend code
- `frontend/src/` - Frontend code

### 2. Rebuild Services

```bash
# Backend changes
docker compose up -d --build backend

# Frontend changes
docker compose up -d --build frontend

# Both
docker compose up -d --build
```

### 3. View Logs

```bash
docker compose logs -f backend
```

### 4. Test Changes

Access http://localhost and test your changes.

---

## 🌐 Access Services

### From Your Mac (Host)

- Frontend: http://localhost
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### From Inside Containers

- Frontend: http://frontend:80
- Backend: http://backend:3000
- PostgreSQL: postgres:5432
- Redis: redis:6379

---

## 💾 Data Persistence

Your data is stored in Docker volumes:

```bash
# List volumes
docker volume ls | grep pos

# Backup database
docker compose exec postgres pg_dump -U pos_user pos_db > backup.sql

# Restore database
cat backup.sql | docker compose exec -T postgres psql -U pos_user pos_db
```

---

## 🚀 Production Deployment

For production, update `docker compose.yml`:

1. Set strong passwords in `.env`
2. Enable SSL in Nginx
3. Use managed databases (DigitalOcean, AWS RDS)
4. Set `NODE_ENV=production`

---

## 📝 Summary

✅ **No Node.js installation needed** on your Mac
✅ **Everything runs in Docker containers**
✅ **Latest versions** of all services
✅ **Easy to rebuild** and update
✅ **Consistent environment** across all machines
✅ **One command** to start/stop everything

---

## 🎉 You're Ready!

Run these commands to start:

```bash
cd /Users/gado/IdeaProjects/POS-System
cp .env.example .env
docker compose up -d --build
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run prisma:seed
```

Then open http://localhost and login with `admin@pos.com` / `admin123`

**Happy coding! 🚀**
