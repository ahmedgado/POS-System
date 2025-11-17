import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Floor Controller - Manage restaurant floors/sections
 */

// Get all floors with their tables
export const getFloors = async (req: Request, res: Response) => {
  try {
    const floors = await prisma.floor.findMany({
      where: { isActive: true },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { tableNumber: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: floors,
      message: `Found ${floors.length} floors`
    });
  } catch (error: any) {
    logger.error('Get floors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch floors',
      error: error.message
    });
  }
};

// Get single floor by ID
export const getFloorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { tableNumber: 'asc' }
        }
      }
    });

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }

    res.json({
      success: true,
      data: floor
    });
  } catch (error: any) {
    logger.error('Get floor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch floor',
      error: error.message
    });
  }
};

// Create new floor
export const createFloor = async (req: Request, res: Response) => {
  try {
    const { name, description, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Floor name is required'
      });
    }

    const floor = await prisma.floor.create({
      data: {
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    logger.info(`Floor created: ${floor.name} (ID: ${floor.id})`);

    res.status(201).json({
      success: true,
      data: floor,
      message: 'Floor created successfully'
    });
  } catch (error: any) {
    logger.error('Create floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create floor',
      error: error.message
    });
  }
};

// Update floor
export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const floor = await prisma.floor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`Floor updated: ${floor.name} (ID: ${floor.id})`);

    res.json({
      success: true,
      data: floor,
      message: 'Floor updated successfully'
    });
  } catch (error: any) {
    logger.error('Update floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update floor',
      error: error.message
    });
  }
};

// Delete floor (soft delete)
export const deleteFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if floor has active tables
    const tablesCount = await prisma.table.count({
      where: { floorId: id, isActive: true }
    });

    if (tablesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete floor with ${tablesCount} active tables. Please deactivate tables first.`
      });
    }

    const floor = await prisma.floor.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Floor deleted (soft): ${floor.name} (ID: ${floor.id})`);

    res.json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete floor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete floor',
      error: error.message
    });
  }
};
