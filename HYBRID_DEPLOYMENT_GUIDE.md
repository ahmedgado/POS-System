# St. Regis POS - Hybrid Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              CLOUD SERVER (Backup & Analytics)          │
│  URL: https://pos.stregiscairo.com                      │
│  - PostgreSQL (Master Database)                         │
│  - Redis                                                 │
│  - Backend API                                           │
│  - Analytics & Reports                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Automatic Sync (When Internet Available)
                   │
┌──────────────────┴──────────────────────────────────────┐
│          RESTAURANT LOCAL SERVER (Primary)              │
│  URL: http://192.168.1.100:3000                         │
│  Hardware: Intel NUC or similar                         │
│  - PostgreSQL (Local Database)                          │
│  - Redis (Local Cache)                                  │
│  - Backend API                                           │
│  - Frontend (Nginx)                                      │
│  - UPS Battery Backup                                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Local Network (No Internet Required)
                   │
┌──────────────────┴──────────────────────────────────────┐
│              POS TERMINALS (Restaurant)                  │
│  - Windows PC / Mac / iPad / Android Tablet             │
│  - Web Browser (Chrome/Safari/Edge)                     │
│  - Connects to: http://192.168.1.100                    │
│  - Works even if internet is down                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Part 1: Local Server Setup (In Restaurant)

### Hardware Requirements

**Mini Server (Recommended: Intel NUC)**
- CPU: Intel i5 or better
- RAM: 8GB minimum (16GB recommended)
- Storage: 256GB SSD (500GB recommended)
- Network: Gigabit Ethernet
- OS: Ubuntu Server 22.04 LTS
- Cost: ~$500

**UPS (Uninterruptible Power Supply)**
- Capacity: 800VA minimum
- Runtime: 15-30 minutes
- Purpose: Protect against power outages
- Cost: ~$100

**Network Equipment**
- Router with Ethernet ports
- Network Switch (if more than 4 terminals)
- WiFi Access Point (optional, for tablets)
- Cost: ~$150

---

### Step 1: Install Ubuntu Server on Local Server

```bash
# Download Ubuntu Server 22.04 LTS
# Create bootable USB
# Install Ubuntu with these settings:
- Hostname: stregis-pos-server
- Username: posadmin
- Install OpenSSH server: Yes
- Install Docker: Yes
```

### Step 2: Install Docker & Docker Compose

```bash
# SSH into the server
ssh posadmin@192.168.1.100

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Deploy POS System on Local Server

```bash
# Create project directory
mkdir -p /home/posadmin/pos-system
cd /home/posadmin/pos-system

# Copy your project files
# (Use git clone or scp to transfer files)
git clone <your-repo> .

# Create environment file for LOCAL deployment
cat > .env << EOF
NODE_ENV=production
PORT=3000

# Local PostgreSQL
DATABASE_URL=postgresql://posuser:SecurePassword123@postgres:5432/pos_local

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloud Sync (will be configured later)
CLOUD_API_URL=https://pos.stregiscairo.com
CLOUD_SYNC_ENABLED=true
CLOUD_SYNC_INTERVAL=300000

# Local Network
LOCAL_NETWORK=true
EOF

# Start services
docker-compose up -d

# Check services are running
docker-compose ps

# Expected output:
# NAME                STATUS              PORTS
# pos-backend         Up 30 seconds       0.0.0.0:3000->3000/tcp
# pos-frontend        Up 30 seconds       0.0.0.0:80->80/tcp
# pos-postgres        Up 30 seconds       5432/tcp
# pos-redis           Up 30 seconds       6379/tcp
```

### Step 4: Configure Static IP for Local Server

```bash
# Edit netplan configuration
sudo nano /etc/netplan/01-netcfg.yaml

# Set static IP:
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:  # Your network interface name
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply

# Verify IP
ip addr show
```

### Step 5: Run Database Migration & Seed Data

```bash
# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed initial data
docker-compose exec backend npm run seed
```

### Step 6: Configure Auto-Start on Boot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Create systemd service for POS
sudo nano /etc/systemd/system/pos-system.service

# Add this content:
[Unit]
Description=St. Regis POS System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/posadmin/pos-system
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=posadmin

[Install]
WantedBy=multi-user.target

# Enable service
sudo systemctl enable pos-system
sudo systemctl start pos-system
```

### Step 7: Setup Automatic Backups

```bash
# Create backup script
sudo nano /home/posadmin/backup-pos.sh

# Add this content:
#!/bin/bash
BACKUP_DIR="/home/posadmin/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U posuser pos_local > $BACKUP_DIR/pos_backup_$DATE.sql

# Backup to USB drive (if mounted)
if [ -d "/media/usb" ]; then
    cp $BACKUP_DIR/pos_backup_$DATE.sql /media/usb/
fi

# Keep only last 30 days of backups
find $BACKUP_DIR -name "pos_backup_*.sql" -mtime +30 -delete

echo "Backup completed: $DATE"

# Make script executable
chmod +x /home/posadmin/backup-pos.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/posadmin/backup-pos.sh") | crontab -
```

---

## ☁️ Part 2: Cloud Server Setup (Backup & Analytics)

### Option A: Using VPS (DigitalOcean, AWS, etc.)

```bash
# 1. Create Ubuntu 22.04 VPS
#    Minimum: 2GB RAM, 2 vCPU, 50GB SSD
#    Cost: ~$20-30/month

# 2. Point your domain to VPS IP
#    DNS A Record: pos.stregiscairo.com -> VPS_IP

# 3. SSH into VPS
ssh root@YOUR_VPS_IP

# 4. Same Docker installation as local server
curl -fsSL https://get.docker.com | sh

# 5. Clone your project
git clone <your-repo> /opt/pos-system
cd /opt/pos-system

# 6. Create environment file for CLOUD deployment
cat > .env << EOF
NODE_ENV=production
PORT=3000

# Cloud PostgreSQL
DATABASE_URL=postgresql://posuser:SecureCloudPassword@postgres:5432/pos_cloud

# Redis
REDIS_URL=redis://redis:6379

# JWT (use same secret as local)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Cloud Mode
LOCAL_NETWORK=false
CLOUD_MODE=true
EOF

# 7. Start services
docker-compose up -d

# 8. Setup SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d pos.stregiscairo.com

# 9. Configure Nginx reverse proxy
# (Nginx config provided in next section)
```

### Nginx Configuration for Cloud Server

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name pos.stregiscairo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name pos.stregiscairo.com;

    ssl_certificate /etc/letsencrypt/live/pos.stregiscairo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pos.stregiscairo.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔄 Part 3: Frontend Configuration (Automatic Backend Switching)

### The frontend is already configured!

**How it works:**

1. **On page load**, the frontend checks:
   - Is local server available at `http://192.168.1.100:3000`?
   - If YES → Use local server (GREEN badge)
   - If NO → Try cloud server at `https://pos.stregiscairo.com`
   - If YES → Use cloud server (BLUE badge)
   - If NO → Show offline warning (RED badge)

2. **Every 15 seconds**, it rechecks availability

3. **Priority**: Always prefers LOCAL server when available

4. **UI Indicator**: Top-right corner shows:
   - 🏠 GREEN = Using local server
   - ☁️ BLUE = Using cloud server
   - ⚠️ RED = No connection

### To Configure Server URLs:

**Method 1: Via UI (Recommended)**
1. Click the status badge (top-right)
2. Click "⚙️ Configure Servers"
3. Enter your URLs:
   - Local: `http://192.168.1.100:3000`
   - Cloud: `https://pos.stregiscairo.com`
4. Click "Save Configuration"

**Method 2: Edit Code**
Edit `frontend/src/app/services/environment.service.ts`:
```typescript
private localBackendUrl = 'http://192.168.1.100:3000'; // Your local IP
private cloudBackendUrl = 'https://pos.stregiscairo.com'; // Your domain
```

---

## 📱 Part 4: POS Terminal Setup

### Windows / Mac Desktop

1. Install Google Chrome or Microsoft Edge
2. Open browser
3. Navigate to: `http://192.168.1.100`
4. Bookmark the page
5. Enable full-screen mode (F11)
6. Done! POS is ready to use

### iPad / Android Tablet

1. Connect to restaurant WiFi
2. Open Safari (iPad) or Chrome (Android)
3. Navigate to: `http://192.168.1.100`
4. Tap Share → "Add to Home Screen"
5. Icon appears like native app
6. Tap to launch in full-screen

---

## 🔧 Part 5: Testing Offline Capability

### Test Scenario 1: Internet Outage

```bash
# On local server, disable internet
sudo ifconfig eth0 down

# On POS terminal:
1. Open browser to http://192.168.1.100
2. Status shows: 🏠 GREEN (local server)
3. Create test order
4. Order saves successfully
5. Check database on local server:
   docker-compose exec postgres psql -U posuser pos_local
   SELECT * FROM sales ORDER BY created_at DESC LIMIT 5;

# Result: ✅ POS works perfectly without internet!

# Re-enable internet
sudo ifconfig eth0 up
```

### Test Scenario 2: Local Server Down (Power Outage without UPS)

```bash
# This is RARE but possible

# Frontend will automatically:
1. Detect local server is down
2. Switch to cloud server
3. Status shows: ☁️ BLUE (cloud server)
4. POS continues working via cloud

# When local server comes back online:
1. Frontend auto-detects it
2. Switches back to local
3. Status shows: 🏠 GREEN again
```

---

## 📊 Part 6: Monitoring & Maintenance

### Daily Checks (Automatic)

- System health check every 15 seconds
- Auto-backup database at 2 AM daily
- Auto-restart on server reboot

### Weekly Checks (Manual)

```bash
# Check disk space
df -h

# Check Docker containers
docker-compose ps

# Check logs for errors
docker-compose logs backend --tail=100
docker-compose logs frontend --tail=100

# Check backup files
ls -lh /home/posadmin/backups/
```

### Monthly Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart Docker containers
docker-compose down
docker-compose up -d

# Clean old Docker images
docker system prune -a
```

---

## 🆘 Troubleshooting

### Issue: Can't connect to local server

```bash
# Check if server is running
ping 192.168.1.100

# Check Docker status
docker-compose ps

# Check firewall
sudo ufw status
sudo ufw allow 80
sudo ufw allow 3000

# Restart services
docker-compose restart
```

### Issue: Status shows RED (offline)

**Check 1: Local server health**
```bash
curl http://192.168.1.100:3000/api/health
# Should return: {"status":"ok"}
```

**Check 2: Cloud server health**
```bash
curl https://pos.stregiscairo.com/api/health
# Should return: {"status":"ok"}
```

### Issue: Slow performance

```bash
# Check server resources
htop

# Check database size
docker-compose exec postgres psql -U posuser -d pos_local -c "SELECT pg_size_pretty(pg_database_size('pos_local'));"

# Vacuum database (cleanup)
docker-compose exec postgres psql -U posuser -d pos_local -c "VACUUM ANALYZE;"
```

---

## 💰 Total Cost Breakdown

### One-Time Costs:
- Local Server (Intel NUC): $500
- UPS Battery: $100
- Network Equipment: $150
- **Total: $750**

### Monthly Costs:
- Cloud VPS: $20-30
- Domain + SSL: $1
- **Total: ~$25/month**

### Return on Investment:
- Without local server: Lost sales during internet outage = Thousands EGP
- With local server: Zero downtime, zero lost sales
- **ROI: 1-2 months**

---

## ✅ Deployment Checklist

- [ ] Local server hardware purchased
- [ ] Ubuntu installed on local server
- [ ] Docker & Docker Compose installed
- [ ] Static IP configured (192.168.1.100)
- [ ] POS system deployed and running
- [ ] Database migrated and seeded
- [ ] Auto-start configured
- [ ] Daily backups configured
- [ ] Cloud VPS created and configured
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Frontend server URLs configured
- [ ] POS terminals connected and tested
- [ ] Offline mode tested
- [ ] Staff trained on system

---

## 📞 Support

For technical support or questions:
- Check logs: `docker-compose logs`
- Restart services: `docker-compose restart`
- Full restart: `docker-compose down && docker-compose up -d`

**Your St. Regis POS system is now ready for 24/7 operation with zero downtime! 🎉**
