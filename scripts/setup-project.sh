#!/bin/bash

# Complete POS System Setup Script
# This script sets up both backend and frontend

set -e

PROJECT_ROOT="/Users/gado/IdeaProjects/POS-System"
cd "$PROJECT_ROOT"

echo "🚀 Setting up POS System..."
echo "================================"

# ==================== BACKEND SETUP ====================
echo ""
echo "📦 Setting up Backend..."
cd "$PROJECT_ROOT/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo "✅ Backend dependencies already installed"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create necessary directories
mkdir -p logs uploads reports/templates reports/output

echo "✅ Backend setup complete!"

# ==================== FRONTEND SETUP ====================
echo ""
echo "🎨 Setting up Frontend..."
cd "$PROJECT_ROOT"

# Check if frontend directory has Angular project
if [ ! -f "frontend/package.json" ]; then
  echo "Creating Angular project..."

  # Install Angular CLI globally if not present
  if ! command -v ng &> /dev/null; then
    echo "Installing Angular CLI..."
    npm install -g @angular/cli
  fi

  # Create Angular project
  ng new frontend --routing=true --style=scss --skip-git=true --directory=frontend-temp

  # Move files to frontend directory
  mv frontend-temp/* frontend/ 2>/dev/null || true
  mv frontend-temp/.* frontend/ 2>/dev/null || true
  rm -rf frontend-temp

  cd frontend

  # Install Nebular and dependencies
  echo "Installing Nebular Theme and dependencies..."
  npm install --save @nebular/theme @nebular/eva-icons @angular/cdk @angular/animations
  npm install --save eva-icons @nebular/auth @nebular/security
  npm install --save ngx-charts @swimlane/ngx-charts d3
  npm install --save chart.js ng2-charts

  echo "✅ Frontend created successfully!"
else
  echo "✅ Frontend already exists"
  cd frontend

  if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
  else
    echo "✅ Frontend dependencies already installed"
  fi
fi

# ==================== CREATE FRONTEND STRUCTURE ====================
echo ""
echo "📁 Creating frontend structure..."

mkdir -p src/app/{pages,components,services,guards,models,interceptors}
mkdir -p src/app/pages/{login,cashier,dashboard,products,sales,customers,users,shifts,reports,settings}
mkdir -p src/app/components/{sidebar,header,loading}
mkdir -p src/assets/images
mkdir -p src/themes

echo "✅ Frontend structure created!"

# ==================== ENVIRONMENT FILES ====================
echo ""
echo "🔧 Creating environment files..."

# Create environment files
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'POS System'
};
EOF

cat > src/environments/environment.prod.ts << 'EOF'
export const environment = {
  production: true,
  apiUrl: '/api',
  appName: 'POS System'
};
EOF

echo "✅ Environment files created!"

# ==================== CREATE DOCKER FILES ====================
echo ""
echo "🐳 Creating Docker configuration..."

cd "$PROJECT_ROOT/frontend"

cat > Dockerfile << 'EOF'
# Multi-stage build for Angular

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Angular app
RUN npm run build -- --configuration production

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder
COPY --from=builder /app/dist/frontend /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF

cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
EOF

cat > .dockerignore << 'EOF'
node_modules
dist
.angular
npm-debug.log
.git
.gitignore
README.md
.vscode
.idea
*.md
e2e
EOF

echo "✅ Docker files created!"

# ==================== CREATE NGINX REVERSE PROXY ====================
echo ""
echo "🌐 Setting up Nginx reverse proxy..."

cd "$PROJECT_ROOT/nginx"

cat > Dockerfile << 'EOF'
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
EOF

cat > nginx.conf << 'EOF'
events {
    worker_connections 2048;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Upstream backends
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:3000;
    }

    # HTTP Server (redirect to HTTPS in production)
    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # Backend API
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login_limit burst=5 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }

    # HTTPS Server (for production with SSL certificates)
    # Uncomment and configure SSL certificates for production
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers HIGH:!aNULL:!MD5;
    #     ssl_prefer_server_ciphers on;
    #
    #     # Same location blocks as HTTP server
    # }
}
EOF

mkdir -p ssl
echo "✅ Nginx reverse proxy configured!"

# ==================== SUMMARY ====================
echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📂 Project Structure:"
echo "  ✅ Backend (Node.js + Express + Prisma)"
echo "  ✅ Frontend (Angular + Nebular)"
echo "  ✅ Database (PostgreSQL)"
echo "  ✅ Cache (Redis)"
echo "  ✅ Proxy (Nginx)"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Configure environment:"
echo "   cp .env.example .env"
echo "   # Edit .env with your settings"
echo ""
echo "2. Start the system:"
echo "   docker compose up -d"
echo ""
echo "3. Run database migrations:"
echo "   docker compose exec backend npx prisma migrate dev --name init"
echo ""
echo "4. Create admin user:"
echo "   docker compose exec backend npm run prisma:seed"
echo ""
echo "5. Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   Health Check: http://localhost/health"
echo ""
echo "📚 Documentation:"
echo "   README.md - Project overview"
echo "   PROJECT_STATUS.md - Current status"
echo ""
echo "Happy coding! 🎉"
