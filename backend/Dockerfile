# Multi-stage build for Node.js backend
# Using Node.js 20 LTS with Debian (better OpenSSL support for Prisma)

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL and other required libraries for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev for build)
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build && ls -la dist/

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Install dumb-init, curl, and OpenSSL for Prisma
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Create necessary directories
RUN mkdir -p /app/uploads /app/reports/output /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run database sync and start server
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npm run start:prod"]
