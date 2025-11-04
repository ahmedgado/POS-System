import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';

export class UserController {
  async getAll(_req: AuthRequest, res: Response) {
    const users = await prisma.user.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = users.map(user => ({
      ...user,
      active: user.status === 'ACTIVE'
    }));

    // Return array directly for frontend compatibility
    return res.json(formatted);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

  async create(req: AuthRequest, res: Response) {
    const { firstName, lastName, email, phone, password, role, active } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: email } // Use email as username
        ]
      }
    });

    if (existing) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: email, // Use email as username
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        status: active ? 'ACTIVE' : 'INACTIVE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return ApiResponse.success(res, user, 'User created successfully', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { firstName, lastName, email, phone, role, active } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        role,
        status: active !== undefined ? (active ? 'ACTIVE' : 'INACTIVE') : undefined
      },
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

    return ApiResponse.success(res, updated, 'User updated successfully');
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;

    // Prevent deleting own account
    if (req.user?.id === id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id }
    });

    return ApiResponse.success(res, null, 'User deleted successfully');
  }

  async toggleActive(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { active } = req.body;

    // Prevent deactivating own account
    if (req.user?.id === id && !active) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        status: active ? 'ACTIVE' : 'INACTIVE'
      },
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

    return ApiResponse.success(res, updated, 'User status updated');
  }

  async resetPassword(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    });

    return ApiResponse.success(res, null, 'Password reset successfully');
  }
}
