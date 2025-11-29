# 🚀 AWS Deployment Guide

This guide will help you deploy your POS System to AWS so you can share a public link with your sales team.

## ✅ Phase 1: Push Images (Happening Now)
I am currently pushing your application images to Docker Hub (`gado/pos-frontend`, `gado/pos-backend`, `gado/pos-nginx`). Once the script finishes, they will be publicly available for your server to pull.

## ☁️ Phase 2: Launch AWS Server (EC2)

1.  Log in to your **AWS Console**.
2.  Search for **EC2** and click **Launch Instance**.
3.  **Name**: `POS-Server`
4.  **OS Image**: Choose **Ubuntu** (Ubuntu Server 24.04 LTS is fine).
5.  **Instance Type**: `t2.medium` (recommended for 5 containers) or `t2.micro` (free tier, but might be slow/crash with 5 containers).
6.  **Key Pair**: Create a new key pair (e.g., `pos-key`), download the `.pem` file.
7.  **Network Settings**:
    *   Check **Allow SSH traffic from Anywhere** (or My IP).
    *   Check **Allow HTTP traffic from the internet**.
    *   Check **Allow HTTPS traffic from the internet**.
8.  Click **Launch Instance**.

## 🛠️ Phase 3: Install Docker on Server

1.  Click on your new instance in the AWS Console and click **Connect** (or use SSH from your terminal).
    *   *Browser-based SSH (EC2 Instance Connect) is easiest.*

2.  Run these commands to install Docker:
    ```bash
    # Update and install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    # Add your user to docker group (so you don't need sudo)
    sudo usermod -aG docker ubuntu
    
    # Activate the group change (or just close and reopen terminal)
    newgrp docker
    ```

## 🚀 Phase 4: Deploy Application

1.  Create the docker-compose file on the server:
    ```bash
    nano docker-compose.yml
    ```

2.  Copy and paste the content of `docker-compose.prod.yml` (I created this file in your workspace). 
    *   *You can find the content below if you need to copy it manually:*

    <details>
    <summary>Click to view docker-compose.yml content</summary>

    ```yaml
    version: '3.8'

    services:
      postgres:
        image: postgres:16-alpine
        container_name: pos-postgres
        restart: always
        environment:
          POSTGRES_DB: pos_db
          POSTGRES_USER: pos_user
          POSTGRES_PASSWORD: pos_password
        volumes:
          - postgres_data:/var/lib/postgresql/data
        networks:
          - pos-network
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U pos_user"]
          interval: 10s
          timeout: 5s
          retries: 5

      redis:
        image: redis:alpine
        container_name: pos-redis
        restart: always
        volumes:
          - redis_data:/data
        networks:
          - pos-network
        healthcheck:
          test: ["CMD", "redis-cli", "ping"]
          interval: 10s
          timeout: 5s
          retries: 5

      backend:
        image: gado/pos-backend:latest
        container_name: pos-backend
        restart: always
        environment:
          NODE_ENV: production
          PORT: 3000
          DATABASE_URL: postgresql://pos_user:pos_password@postgres:5432/pos_db
          REDIS_HOST: redis
          REDIS_PORT: 6379
          JWT_SECRET: production_secret_key_change_me
          JWT_EXPIRES_IN: 24h
        volumes:
          - uploads_data:/app/uploads
        depends_on:
          postgres:
            condition: service_healthy
          redis:
            condition: service_healthy
        networks:
          - pos-network

      frontend:
        image: gado/pos-frontend:latest
        container_name: pos-frontend
        restart: always
        depends_on:
          - backend
        networks:
          - pos-network

      nginx:
        image: gado/pos-nginx:latest
        container_name: pos-nginx
        restart: always
        ports:
          - "80:80"
          - "443:443"
        depends_on:
          - frontend
          - backend
        networks:
          - pos-network

    volumes:
      postgres_data:
      redis_data:
      uploads_data:

    networks:
      pos-network:
        driver: bridge
    ```
    </details>

3.  Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

4.  Start the application:
    ```bash
    docker compose up -d
    ```

## 🌍 Phase 5: Access Your App

1.  Go back to AWS Console.
2.  Copy the **Public IPv4 address** of your instance.
3.  Open it in your browser: `http://<your-public-ip>`
4.  🎉 **Share this link with your sales team!**

---

### 🔄 How to Update?

If you make changes locally:
1.  Run `./deploy_to_hub.sh` locally to push new images.
2.  SSH into your AWS server.
3.  Run:
    ```bash
    docker compose pull
    docker compose up -d
    ```

### ⚠️ Troubleshooting

**"no matching manifest for linux/amd64" Error**
If you see this error, it means the images were built for the wrong computer architecture (e.g., Apple Silicon vs Intel).
*   **Solution**: I have already updated the `deploy_to_hub.sh` script to fix this. Simply run `./deploy_to_hub.sh` on your local machine to rebuild and push the correct images, then pull them again on AWS.


docker exec -it pos-backend npm run prisma:seed:restaurant