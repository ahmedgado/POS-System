#!/bin/bash

# Define Docker Hub username
DOCKER_USER="gado"

echo "🚀 Starting build and push process for $DOCKER_USER (Target: linux/amd64)..."

# 1. Backend
echo "📦 Building Backend..."
docker build --platform linux/amd64 -t $DOCKER_USER/pos-backend:latest ./backend
echo "⬆️ Pushing Backend..."
docker push $DOCKER_USER/pos-backend:latest

# 2. Frontend
echo "📦 Building Frontend..."
docker build --platform linux/amd64 -t $DOCKER_USER/pos-frontend:latest ./frontend
echo "⬆️ Pushing Frontend..."
docker push $DOCKER_USER/pos-frontend:latest

# 3. Nginx
echo "📦 Building Nginx..."
docker build --platform linux/amd64 -t $DOCKER_USER/pos-nginx:latest ./nginx
echo "⬆️ Pushing Nginx..."
docker push $DOCKER_USER/pos-nginx:latest

echo "✅ All images pushed successfully!"
