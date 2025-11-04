# POS System - Point of Sale Web Application

Modern, cloud-ready Point of Sale system with multi-role access, mobile support, and comprehensive reporting.

## Features

### Core Functionality
- ✅ Sales & Transaction Processing
- ✅ Inventory Management
- ✅ Customer Management & Loyalty
- ✅ Multi-role User Management (Admin, Manager, Cashier, Clerk)
- ✅ Shift Management & Cash Reconciliation
- ✅ Real-time Dashboard & Analytics
- ✅ Comprehensive Reporting (PDF/Excel via JasperReports)
- ✅ Mobile-responsive Design
- ✅ Offline Mode Support (PWA)

### User Roles
- **Admin**: Full system access, configuration, reports
- **Owner**: Executive dashboard, high-level analytics
- **Store Manager**: Inventory, reports, staff management
- **Cashier**: Sales processing, basic operations
- **Inventory Clerk**: Stock management only

## Tech Stack

### Frontend
- Angular 17+
- Nebular Theme (Red/White custom theme)
- Angular Material
- ngx-charts (for analytics)
- TypeScript
- RxJS

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL 15
- Redis (caching & sessions)
- JWT Authentication
- JasperReports (reporting)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy + SSL)
- Cloud-ready (DigitalOcean, AWS, Azure, GCP)

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd POS-System
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

3. **Start the application**
```bash
docker compose up -d
```

4. **Access the application**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

### Default Credentials
- **Admin**: admin@pos.com / admin123
- **Cashier**: cashier@pos.com / cashier123

## Deployment

### DigitalOcean Droplet

1. **Create Ubuntu 22.04 droplet**
2. **Install Docker**
```bash
curl -fsSL https://get.docker.com | sh
```

3. **Clone and deploy**
```bash
git clone <repository-url>
cd POS-System
cp .env.example .env
# Edit .env
docker compose -f docker compose.yml -f docker compose.prod.yml up -d
```

### DigitalOcean App Platform
- Connect GitHub repository
- Auto-deploy from main branch
- Configure environment variables
- Enable SSL

## Project Structure

```
POS-System/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Prisma models
│   │   ├── middleware/   # Auth, validation
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helpers
│   ├── Dockerfile
│   ├── package.json
│   └── prisma/
│       └── schema.prisma
│
├── frontend/             # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/    # Page components
│   │   │   ├── components/ # Shared components
│   │   │   ├── services/ # API services
│   │   │   ├── guards/   # Route guards
│   │   │   ├── models/   # TypeScript interfaces
│   │   │   └── theme/    # Custom red/white theme
│   │   └── assets/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── nginx/                # Reverse proxy
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ssl/
│
├── database/
│   ├── init.sql
│   └── migrations/
│
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── restore.sh
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── docker compose.yml
├── .env.example
└── README.md
```

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Sales
```
POST /api/sales/create
GET  /api/sales/:id
GET  /api/sales/list
POST /api/sales/refund
```

### Reports
```
POST /api/reports/sales
POST /api/reports/inventory
POST /api/reports/financial
POST /api/reports/employee
```

Full API documentation: `/api/docs`

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Performance

- **Startup Time**: < 15 seconds
- **API Response**: < 100ms average
- **Concurrent Users**: 100+ per basic droplet
- **Transactions/sec**: 50-100 TPS

## Support

For issues and questions, please open an issue on GitHub.

## License

MIT License
