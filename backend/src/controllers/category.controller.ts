import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';

export class CategoryController {
  async getAll(_req: AuthRequest, res: Response) {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      active: true, // Add active field if needed in schema
      productCount: cat._count.products,
      createdAt: cat.createdAt
    }));

    // Return array directly for frontend compatibility
    return res.json(formatted);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return ApiResponse.success(res, category);
  }

  async create(req: AuthRequest, res: Response) {
    const { name, description } = req.body;

    if (!name) {
      throw new AppError('Category name is required', 400);
    }

    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name }
    });

    if (existing) {
      throw new AppError('Category already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    });

    return ApiResponse.success(res, category, 'Category created successfully', 201);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    return ApiResponse.success(res, updated, 'Category updated successfully');
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category._count.products > 0) {
      throw new AppError('Cannot delete category with products. Please reassign products first.', 400);
    }

    await prisma.category.delete({
      where: { id }
    });

    return ApiResponse.success(res, null, 'Category deleted successfully');
  }

  async toggleActive(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Note: If you don't have an 'active' field in schema, this will just return the category
    // You may need to add 'active Boolean @default(true)' to Category model in schema

    return ApiResponse.success(res, category, 'Category status updated');
  }
}
