import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // 1. Check for API Key (Permanent Token)
    const apiKey = req.headers['x-api-key'];
    if (apiKey && typeof apiKey === 'string') {
      const keyRecord = await prisma.apiKey.findUnique({
        where: { key: apiKey }
      });

      if (keyRecord && keyRecord.isActive) {
        // Update last used
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: { lastUsedAt: new Date() }
        });

        // Assign a "system" user role for the agent
        req.user = {
          id: 'system-agent',
          username: keyRecord.name,
          email: 'agent@system.local',
          role: 'ADMIN' // Agents need high privileges to update job status
        };
        return next();
      }
    }

    // 2. Check for JWT (User Token)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, String(config.jwt.secret)) as any;

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};
