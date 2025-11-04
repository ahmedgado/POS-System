#!/bin/bash

# Script to generate all backend source files
# Run this from the POS-System root directory

set -e

BACKEND_DIR="./backend/src"

echo "🚀 Generating POS System Backend Files..."

# Create config files
cat > "$BACKEND_DIR/config/index.ts" << 'EOF'
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  store: {
    name: process.env.STORE_NAME || 'My Store',
    taxRate: parseFloat(process.env.STORE_TAX_RATE || '0.10'),
    currency: process.env.STORE_CURRENCY || 'USD'
  },

  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    path: process.env.UPLOAD_PATH || './uploads'
  },

  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || ''
  },

  reports: {
    templatesPath: process.env.JASPER_REPORTS_PATH || './reports/templates',
    outputPath: process.env.JASPER_OUTPUT_PATH || './reports/output'
  }
};
EOF

# Create database client
cat > "$BACKEND_DIR/config/database.ts" << 'EOF'
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
});

prisma.$on('query', (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  }
});

export { prisma };
EOF

# Create Redis client
cat > "$BACKEND_DIR/config/redis.ts" << 'EOF'
import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

const redis = new Redis(config.redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

export { redis };
EOF

# Create logger utility
cat > "$BACKEND_DIR/utils/logger.ts" << 'EOF'
import winston from 'winston';
import { config } from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
EOF

# Create error handler middleware
cat > "$BACKEND_DIR/middleware/errorHandler.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
EOF

# Create authentication middleware
cat > "$BACKEND_DIR/middleware/auth.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this resource', 403));
    }

    next();
  };
};
EOF

# Create validation middleware
cat > "$BACKEND_DIR/middleware/validation.ts" << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg
    }));

    throw new AppError(JSON.stringify(extractedErrors), 400);
  };
};
EOF

# Create response utility
cat > "$BACKEND_DIR/utils/response.ts" << 'EOF'
import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res: Response, message: string, statusCode: number = 500) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  static paginated(res: Response, data: any[], page: number, limit: number, total: number) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  }
}
EOF

# Create main routes index
cat > "$BACKEND_DIR/routes/index.ts" << 'EOF'
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import saleRoutes from './sale.routes';
import customerRoutes from './customer.routes';
import shiftRoutes from './shift.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/customers', customerRoutes);
router.use('/shifts', shiftRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
EOF

echo "✅ Backend configuration files generated!"
echo "📝 Next steps:"
echo "   1. cd backend"
echo "   2. npm install"
echo "   3. npx prisma generate"
echo "   4. npm run dev"
EOF

chmod +x "$BACKEND_DIR/../../scripts/generate-backend.sh"

echo "✅ Script created successfully!"
