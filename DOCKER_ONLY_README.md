# ✅ POS System - 100% Docker Desktop Solution

## Your Mac's Node.js Will NOT Be Touched! 🎉

Everything runs in latest Docker containers. No local Node.js needed!

---

## 🐳 What's in Docker

### Latest Versions (All Alpine - Lightweight)

```
├── PostgreSQL 16-alpine      (Latest PostgreSQL)
├── Redis alpine              (Latest Redis)
├── Node.js 20-alpine         (Latest LTS)
├── Nginx alpine              (Latest Nginx)
└── Angular 17+               (Built in Node.js 20)
```

**Total containers**: 5
**Total time to start**: 2-3 minutes (first time)

---

## 🚀 Start Command

```bash
cd /Users/gado/IdeaProjects/POS-System
cp .env.example .env
docker compose up -d --build
```

That's it! Everything builds and runs in Docker.

---

## 🎯 What Happens

1. **Docker pulls** latest images (Node 20, PostgreSQL 16, Redis, Nginx)
2. **Backend builds** inside Node 20 container
   - npm install (all dependencies)
   - Prisma generate
   - TypeScript compile
   - Production image created
3. **Frontend builds** inside Node 20 container
   - Angular CLI installs
   - npm install
   - ng build --prod
   - Nginx serves static files
4. **All services start** with health checks
5. **Nginx proxy** routes traffic

---

## ✅ After Start

```bash
# Initialize database
docker compose exec backend npx prisma migrate dev --name init

# Seed sample data
docker compose exec backend npm run prisma:seed

# Create translations
bash scripts/create-translations.sh
```

---

## 🌐 Access

- **Frontend**: http://localhost
- **Backend**: http://localhost/api
- **Health**: http://localhost/health

Login: `admin@pos.com` / `admin123`

---

## 📋 Package Versions (Inside Containers)

### Backend Container
```json
{
  "node": "20.x.x",
  "npm": "10.x.x",
  "@prisma/client": "^5.7.0",
  "express": "^4.18.2",
  "typescript": "^5.3.3",
  "pdfkit": "^0.15.0",
  "exceljs": "^4.4.0"
}
```

### Frontend Container
```json
{
  "node": "20.x.x",
  "npm": "10.x.x",
  "@angular/core": "^17.0.0",
  "@nebular/theme": "latest",
  "ngx-translate": "^15.0.0"
}
```

**Your Mac**: Node v14.21.3 (untouched, not used)

---

## 🔄 Development Workflow

### 1. Make Code Changes

Edit files normally in your editor:
- `backend/src/` - Backend code
- `frontend/src/` - Frontend code

### 2. Rebuild Container

```bash
# Backend changes
docker compose up -d --build backend

# Frontend changes
docker compose up -d --build frontend
```

### 3. View Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 🛠️ Useful Commands

### Container Management

```bash
# Start all
docker compose up -d

# Stop all
docker compose down

# Restart all
docker compose restart

# View status
docker compose ps

# View logs
docker compose logs -f
```

### Database Operations

```bash
# Prisma Studio (DB GUI)
docker compose exec backend npx prisma studio
# Open http://localhost:5555

# Run migrations
docker compose exec backend npx prisma migrate dev

# Seed data
docker compose exec backend npm run prisma:seed

# PostgreSQL shell
docker compose exec postgres psql -U pos_user -d pos_db
```

### Backend Operations

```bash
# Shell access
docker compose exec backend sh

# Install new package
# 1. Add to backend/package.json
# 2. Rebuild: docker compose up -d --build backend

# Run TypeScript
docker compose exec backend npm run dev

# Run tests
docker compose exec backend npm test
```

### Frontend Operations

```bash
# Shell access
docker compose exec frontend sh

# Install new package
# 1. Add to frontend/package.json
# 2. Rebuild: docker compose up -d --build frontend

# Development mode
docker compose exec frontend npm start
```

---

## 🔍 Health Checks

All containers have health checks:

```bash
# Backend health
curl http://localhost/api/health

# Check all containers
docker compose ps

# Should show "(healthy)" status
```

---

## 💾 Data Persistence

Data persists in Docker volumes:

```bash
# List volumes
docker volume ls | grep pos

# Backup database
docker compose exec postgres pg_dump -U pos_user pos_db > backup.sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U pos_user pos_db

# Remove volumes (WARNING: Deletes all data)
docker compose down -v
```

---

## 🧹 Cleanup

```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove images too
docker compose down -v --rmi all

# Clean Docker system
docker system prune -a --volumes
```

---

## 🚨 Troubleshooting

### Port Conflicts

```bash
# Find what's using port 80
lsof -i :80

# Use different ports in .env
FRONTEND_PORT=8080
BACKEND_PORT=4000
```

### Containers Won't Start

```bash
# Check Docker Desktop is running
# View logs for errors
docker compose logs

# Nuclear option (fresh start)
docker compose down -v
docker system prune -a --volumes
docker compose up -d --build
```

### Build Fails

```bash
# No cache rebuild
docker compose build --no-cache backend
docker compose up -d

# Check logs
docker compose logs backend
```

### Database Issues

```bash
# Reset database
docker compose down -v
docker compose up -d postgres redis
# Wait 30 seconds
docker compose up -d backend
docker compose exec backend npx prisma migrate dev
```

---

## 📊 Resource Usage

Typical resource usage:

- **CPU**: 5-10% (idle)
- **RAM**: ~1.5 GB total
- **Disk**: ~2 GB (images + volumes)

Docker Desktop settings:
- Recommended RAM: 4 GB minimum
- Recommended CPUs: 2 minimum

---

## 🎯 Advantages of Docker-Only Approach

✅ **No Node.js conflicts** with your system
✅ **Latest versions** always in containers
✅ **Same environment** everywhere (dev, staging, prod)
✅ **Easy rollback** - just use old image
✅ **No "works on my machine"** problems
✅ **Clean uninstall** - just delete containers
✅ **Multiple projects** can use different Node versions
✅ **Production-ready** from day one

---

## 🌍 Bilingual Support

Runs in containers with full support for:
- ✅ Arabic (RTL)
- ✅ English (LTR)
- ✅ 200+ translations each
- ✅ Automatic direction switching
- ✅ Arabic fonts (Cairo)

---

## 🎨 Theme

Red & White theme ready:
- Primary: #DC3545 (Red)
- Background: #FFFFFF (White)
- Responsive design
- Touch-friendly

---

## 📦 What's Included

### Backend (Ready)
- ✅ Node.js 20 + Express
- ✅ PostgreSQL 16
- ✅ Redis cache
- ✅ JWT auth
- ✅ Prisma ORM
- ✅ 11 database models
- ✅ Sample data

### Frontend (Structure Ready)
- ✅ Angular 17+
- ✅ Nebular Theme
- ✅ ngx-translate
- ✅ Translation files
- 🚧 UI components (to build)

---

## 🎉 Ready to Go!

```bash
# Start everything
docker compose up -d --build

# Initialize
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run prisma:seed

# Access
open http://localhost

# Login
# Email: admin@pos.com
# Password: admin123
```

**Your system Node.js (v14.21.3) stays untouched!** 🎊

Everything runs in Node.js 20 containers! 🐳

---

**Next**: Build the frontend UI! 🚀
