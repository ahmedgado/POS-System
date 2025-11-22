# Cloud Print System - Complete Setup Guide

## 🎯 Overview

Your POS system now supports **both cloud and on-premise deployments** with a sophisticated print queue system that allows cloud-hosted backends to print to local network printers.

## 📋 System Architecture

```
┌──────────────────────────────────────────────────┐
│          CLOUD/ON-PREMISE BACKEND                 │
│                                                   │
│  ┌─────────────────────────────────────┐         │
│  │  Print Service                       │         │
│  │  - Auto-detects deployment mode      │         │
│  │  - Queues jobs for cloud             │         │
│  │  - Generates PDFs for regular printers│        │
│  └──────────────┬──────────────────────┘         │
│                 │                                 │
│  ┌──────────────▼──────────────────────┐         │
│  │  Print Queue (PostgreSQL)            │         │
│  │  - Job status tracking               │         │
│  │  - Retry logic                       │         │
│  │  - Priority ordering                 │         │
│  └─────────────────────────────────────┘         │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/HTTPS Polling
                   ▼
┌──────────────────────────────────────────────────┐
│    LOCAL PRINT AGENT (Restaurant Computer)        │
│                                                   │
│  - Polls backend every 3 seconds                 │
│  - Downloads pending jobs                        │
│  - Prints to thermal/regular printers            │
│  - Updates job status                            │
│  - Runs on Windows/Mac/Linux/Raspberry Pi        │
└──────────────────┬──────────────────────────────┘
                   │ Local Network (TCP/IP)
                   ▼
┌──────────────────────────────────────────────────┐
│           NETWORK PRINTERS                        │
│                                                   │
│  🖨️ Thermal Printers (ESC/POS)                   │
│     - IP: 192.168.1.10:9100                      │
│     - Protocol: ESC/POS                          │
│                                                   │
│  🖨️ Regular Printers (PDF)                       │
│     - Configured in OS                           │
│     - Prints generated PDFs                      │
└──────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### For On-Premise Deployment

If your backend and printers are on the same network:

1. **Configure Kitchen Stations** with printer IPs
2. **Install Print Agent** on any local computer
3. **Start Agent** - it will handle all printing

### For Cloud Deployment

If your backend is hosted in the cloud:

1. **Configure Kitchen Stations** with printer IPs (local IPs)
2. **Install Print Agent** on a computer in the restaurant
3. **Configure Agent** with cloud backend URL
4. **Start Agent** - it connects to cloud and prints locally

## 📦 Installation

### Step 1: Backend Setup (Already Done!)

The backend now has:
- ✅ PrintJob database model
- ✅ Print Service with PDF generation
- ✅ API endpoints for agent
- ✅ Automatic mode detection

### Step 2: Install Print Agent

Navigate to the print-agent directory:

```bash
cd print-agent
npm install
```

### Step 3: Configure Agent

Copy the example config:

```bash
cp .env.example .env
```

Edit `.env`:

**For Cloud Deployment:**
```env
BACKEND_URL=https://your-cloud-backend.com
API_TOKEN=your-api-token-here
AGENT_ID=restaurant-main-agent
POLL_INTERVAL=3000
```

**For On-Premise Deployment:**
```env
BACKEND_URL=http://192.168.1.100:3000
API_TOKEN=your-api-token-here
AGENT_ID=restaurant-main-agent
POLL_INTERVAL=3000
```

### Step 4: Get API Key (Permanent)

Instead of using a temporary user token, generate a permanent API key:

1. **Run the generator script:**
   ```bash
   # Run this command in your project root
   docker compose exec -u root backend node generate-api-key.js "Restaurant Agent 1"
   ```

2. **Copy the key:**
   Output will look like: `pk_live_1b5a4d98...`

3. **Paste in .env:**
   ```env
   API_TOKEN=pk_live_1b5a4d98...
   ```

   *Note: This key never expires!*

### Step 5: Configure Printers

1. Login to POS
2. Go to **Restaurant → Kitchen Stations**
3. For each station, set:
   - **Printer IP**: e.g., `192.168.1.10`
   - **Printer Type**: Thermal or Regular

### Step 6: Start the Agent

```bash
cd print-agent
npm start
```

You should see:
```
🖨️  POS Print Agent Starting...
📡 Backend: http://localhost:3000
🆔 Agent ID: restaurant-main-agent
⏱️  Poll Interval: 3000ms

✅ Print Agent Started Successfully!
🔄 Polling for print jobs...
```

## 🧪 Testing

### Test Print from Backend

Use the test endpoint:

```bash
curl -X POST http://localhost:3000/api/print/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kitchenStationId": "station-id-here",
    "printerType": "THERMAL"
  }'
```

Or from the frontend (future feature):
1. Go to **Kitchen Stations**
2. Click **Test Print** button
3. Check agent console for output

### Monitor Agent

The agent will show:
- `📥 Found X pending job(s)` - Jobs detected
- `📄 Processing job...` - Printing started
- `✅ Job completed successfully` - Success!
- `❌ Job failed` - Error (with details)

## 🔧 Running as Service

### Windows (PM2)

```bash
npm install -g pm2
pm2 start index.js --name pos-print-agent
pm2 save
pm2 startup
```

### Linux/Mac (PM2)

```bash
npm install -g pm2
pm2 start index.js --name pos-print-agent
pm2 save
pm2 startup
```

### Windows (NSSM Service)

1. Download NSSM from https://nssm.cc/download
2. Run: `nssm install POSPrintAgent`
3. Set Application Path: `C:\Program Files\nodejs\node.exe`
4. Set Arguments: `C:\path\to\print-agent\index.js`
5. Start service: `nssm start POSPrintAgent`

### Linux (systemd)

Create `/etc/systemd/system/pos-print-agent.service`:

```ini
[Unit]
Description=POS Print Agent
After=network.target

[Service]
Type=simple
User=pos
WorkingDirectory=/opt/print-agent
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable pos-print-agent
sudo systemctl start pos-print-agent
sudo systemctl status pos-print-agent
```

## 🖨️ Printer Setup

### Thermal Printers (ESC/POS)

**Supported Printers:**
- Epson TM series
- Star Micronics
- Bixolon
- Most ESC/POS compatible thermal printers

**Configuration:**
1. Connect printer to network
2. Assign static IP (e.g., `192.168.1.10`)
3. Ensure port 9100 is open
4. Test: `telnet 192.168.1.10 9100`

### Regular Network Printers (PDF)

**Configuration:**
1. Install printer in operating system
2. Note the printer name
3. In Kitchen Station settings, use printer name (not IP)
4. Agent will print PDFs to this printer

## 🔍 Troubleshooting

### Agent Can't Connect to Backend

**Error:** `❌ Network Error: Cannot reach backend`

**Solutions:**
- Check `BACKEND_URL` in `.env`
- Verify backend is running
- Check firewall allows outbound HTTPS
- Test: `curl https://your-backend.com/api/health`

### Can't Connect to Printer

**Error:** `❌ Failed to connect to printer at 192.168.1.10`

**Solutions:**
- Ping printer: `ping 192.168.1.10`
- Telnet to port: `telnet 192.168.1.10 9100`
- Check printer is powered on
- Verify IP address is correct
- Check firewall rules

### Authentication Failed

**Error:** `❌ API Error: 401 - Unauthorized`

**Solutions:**
- Verify `API_TOKEN` in `.env`
- Check token hasn't expired
- Regenerate token from admin panel

### Printer Outputs Garbage

**Solutions:**
- Verify printer supports ESC/POS
- Check printer DIP switches/settings
- Try different character encoding
- Update printer firmware

## 📊 Monitoring

### View Print Queue

Check pending jobs:
```bash
curl http://localhost:3000/api/print/jobs/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Clean Up Old Jobs

Remove completed jobs older than 7 days:
```bash
curl -X DELETE http://localhost:3000/api/print/jobs/cleanup?days=7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Security

- **API Token**: Required for all agent requests
- **HTTPS**: Recommended for cloud deployments
- **Firewall**: Only allow agent IP to access backend
- **Token Rotation**: Regenerate tokens periodically

## 📈 Performance

- **Poll Interval**: 3 seconds (configurable)
- **Batch Size**: 10 jobs per poll (configurable)
- **Retry Logic**: 3 attempts per job
- **Timeout**: 30 seconds per print job

## 🆘 Support

### Common Issues

1. **Jobs stuck in PENDING**
   - Agent not running
   - Agent can't reach backend
   - Check agent logs

2. **Jobs stuck in PRINTING**
   - Agent crashed during print
   - Restart agent
   - Jobs will retry

3. **All jobs FAILED**
   - Printer offline
   - Wrong IP address
   - Check printer connectivity

### Logs

Agent logs show:
- Connection status
- Jobs processed
- Errors with details
- Retry attempts

## 🎓 Best Practices

1. **Use Static IPs** for printers
2. **Run Agent as Service** for reliability
3. **Monitor Agent** with PM2 or systemd
4. **Regular Cleanup** of old jobs
5. **Test Prints** after setup
6. **Backup Configuration** (.env file)

## 🔄 Updates

To update the agent:

```bash
cd print-agent
git pull
npm install
pm2 restart pos-print-agent
```

## 📝 License

MIT - See LICENSE file for details
