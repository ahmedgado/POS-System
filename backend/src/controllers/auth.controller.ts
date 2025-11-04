import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class AuthController {
  async login(req: AuthRequest, res: Response) {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is inactive or suspended', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const jwtSecret = String(config.jwt.secret);
    const accessTokenOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any };
    const refreshTokenOptions: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as any };

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      jwtSecret,
      refreshTokenOptions
    );

    // Store refresh token in Redis
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`User logged in: ${user.email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return ApiResponse.success(res, {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }, 'Login successful');
  }

  async logout(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (userId) {
      // Remove refresh token from Redis
      await redis.del(`refresh_token:${userId}`);

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          entity: 'User',
          entityId: userId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      logger.info(`User logged out: ${req.user?.email}`);
    }

    return ApiResponse.success(res, null, 'Logout successful');
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not found', 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return ApiResponse.success(res, user);
  }

  async refreshToken(req: AuthRequest, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, String(config.jwt.secret)) as any;
      const userId = decoded.id;

      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${userId}`);
      if (storedToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true
        }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('User not found or inactive', 403);
      }

      // Generate new access token
      const jwtSecret = String(config.jwt.secret);
      const tokenOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any };

      const accessToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        jwtSecret,
        tokenOptions
      );

      return ApiResponse.success(res, { accessToken }, 'Token refreshed');
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new AppError('User not found', 404);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Invalidate all refresh tokens
    await redis.del(`refresh_token:${userId}`);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'User',
        entityId: userId,
        changes: { field: 'password' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    logger.info(`Password changed for user: ${user.email}`);

    return ApiResponse.success(res, null, 'Password changed successfully');
  }
}
