# 🚀 POS System - Quick Reference Card
# البطاقة المرجعية السريعة

---

## ⚡ **Deploy in 3 Commands**

```bash
cd /Users/gado/IdeaProjects/POS-System
chmod +x start.sh
./start.sh
```

Wait 3-5 minutes. Done! ✅

---

## 🌐 **Access URLs**

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost/api |
| **Health Check** | http://localhost/health |

---

## 🔑 **Login Credentials**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pos.com | admin123 |
| Owner | owner@pos.com | owner123 |
| Manager | manager@pos.com | manager123 |
| Cashier | cashier@pos.com | cashier123 |

---

## 🛠️ **Common Commands**

```bash
# View all logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Stop system
docker compose down

# Restart system
docker compose restart

# Rebuild and restart
./start.sh

# Access database
docker compose exec backend npx prisma studio
```

---

## 📁 **Key Files**

| File | Purpose |
|------|---------|
| `start.sh` | **Main deployment script** |
| `docker compose.yml` | Service orchestration |
| `.env` | Environment configuration |
| `backend/prisma/schema.prisma` | Database schema |
| `frontend/src/themes/theme.scss` | Red/White theme |

---

## 🎨 **Features**

✅ Bilingual (English + Arabic)
✅ Red & White Theme
✅ Touch-friendly POS Terminal
✅ Admin & Owner Dashboards
✅ PDF & Excel Reports
✅ Mobile Responsive
✅ 100% Docker Containerized

---

## 📊 **Sample Data**

- 4 Users (all roles)
- 6 Products with stock
- 3 Customers with loyalty
- 3 Categories

---

## 🌍 **Languages**

**English:** Default, Roboto font, LTR
**Arabic:** Cairo font, RTL (Right-to-Left)

Switch language in header!

---

## 📖 **Documentation**

1. **START_HERE.md** - Begin here
2. **WORK_COMPLETED.md** - Full summary
3. **DOCKER_DESKTOP_SETUP.md** - Docker guide
4. **README_BILINGUAL.md** - i18n features

---

## 🎯 **Status**

✅ Backend: 100% Complete
✅ Frontend: 100% Complete
✅ Docker: 100% Complete
✅ Docs: 100% Complete
✅ **READY TO DEPLOY!**

---

## 💪 **Tech Stack**

**Backend:** Node.js 20, Express, TypeScript, PostgreSQL 16, Prisma, Redis
**Frontend:** Angular 17, Nebular Theme, ngx-translate, Bootstrap 5
**Infrastructure:** Docker, Nginx, Multi-stage builds

---

## 🚨 **Troubleshooting**

**Problem:** Containers won't start
**Solution:** Check Docker Desktop is running

**Problem:** Port 80 already in use
**Solution:** Stop other services or change ports in docker compose.yml

**Problem:** Database connection failed
**Solution:** Wait 30 seconds for PostgreSQL to initialize

**Problem:** Frontend not loading
**Solution:** Check logs: `docker compose logs -f frontend`

---

## 📞 **Quick Help**

All documentation is in the project root:
```
/Users/gado/IdeaProjects/POS-System/
```

---

## 🎉 **You're Ready!**

Just run `./start.sh` and start selling!

**Happy selling! مبيعات سعيدة!** 🎊
