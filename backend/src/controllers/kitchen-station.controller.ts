import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';

export class KitchenStationController {
    // GET /api/kitchen-stations - Get all kitchen stations
    async getAll(req: AuthRequest, res: Response) {
        const stations = await prisma.kitchenStation.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { sortOrder: 'asc' }
        });

        return ApiResponse.success(res, stations);
    }

    // POST /api/kitchen-stations - Create new station
    async create(req: AuthRequest, res: Response) {
        const { name, description, printerIp, sortOrder } = req.body;

        // Check if station with same name exists
        const existing = await prisma.kitchenStation.findUnique({
            where: { name }
        });

        if (existing) {
            throw new AppError('Kitchen station with this name already exists', 400);
        }

        const station = await prisma.kitchenStation.create({
            data: {
                name,
                description,
                printerIp,
                sortOrder: sortOrder || 0
            }
        });

        return ApiResponse.success(res, station, 'Kitchen station created successfully', 201);
    }

    // PUT /api/kitchen-stations/:id - Update station
    async update(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { name, description, printerIp, sortOrder, isActive } = req.body;

        // Check if station exists
        const existing = await prisma.kitchenStation.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new AppError('Kitchen station not found', 404);
        }

        // Check if name is being changed and if it conflicts
        if (name && name !== existing.name) {
            const nameExists = await prisma.kitchenStation.findUnique({
                where: { name }
            });

            if (nameExists) {
                throw new AppError('Kitchen station with this name already exists', 400);
            }
        }

        const station = await prisma.kitchenStation.update({
            where: { id },
            data: {
                name,
                description,
                printerIp,
                sortOrder,
                isActive
            }
        });

        return ApiResponse.success(res, station, 'Kitchen station updated successfully');
    }

    // DELETE /api/kitchen-stations/:id - Delete station
    async delete(req: AuthRequest, res: Response) {
        const { id } = req.params;

        // Check if station exists
        const station = await prisma.kitchenStation.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true, tickets: true }
                }
            }
        });

        if (!station) {
            throw new AppError('Kitchen station not found', 404);
        }

        // Check if station has products or tickets
        if (station._count.products > 0 || station._count.tickets > 0) {
            throw new AppError('Cannot delete station with assigned products or tickets. Deactivate it instead.', 400);
        }

        await prisma.kitchenStation.delete({
            where: { id }
        });

        return ApiResponse.success(res, null, 'Kitchen station deleted successfully');
    }

    // GET /api/kitchen-stations/:id/products - Get products assigned to station
    async getProducts(req: AuthRequest, res: Response) {
        const { id } = req.params;

        const assignments = await prisma.productKitchenStation.findMany({
            where: { kitchenStationId: id },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        const products = assignments.map((a: { product: any }) => a.product);
        return ApiResponse.success(res, products);
    }
}
