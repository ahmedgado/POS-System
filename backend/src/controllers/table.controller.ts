import { Request, Response } from 'express';
import { PrismaClient, TableStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Table Controller - Manage restaurant tables
 */

// Get all tables (with optional floor filter)
export const getTables = async (req: Request, res: Response) => {
  try {
    const { floorId, status } = req.query;

    const tables = await prisma.table.findMany({
      where: {
        isActive: true,
        ...(floorId && { floorId: floorId as string }),
        ...(status && { status: status as TableStatus })
      },
      include: {
        floor: true,
        sales: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { floor: { sortOrder: 'asc' } },
        { tableNumber: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: tables,
      message: `Found ${tables.length} tables`
    });
  } catch (error: any) {
    logger.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: error.message
    });
  }
};

// Get single table by ID
export const getTableById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        floor: true,
        sales: {
          where: {
            orderStatus: {
              in: ['PENDING', 'PREPARING', 'READY', 'SERVED']
            }
          },
          include: {
            items: {
              include: {
                product: true,
                modifiers: {
                  include: {
                    modifier: true
                  }
                }
              }
            },
            waiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });
  } catch (error: any) {
    logger.error('Get table by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table',
      error: error.message
    });
  }
};

// Create new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { floorId, tableNumber, capacity, positionX, positionY, shape } = req.body;

    if (!floorId || !tableNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Floor ID, table number, and capacity are required'
      });
    }

    // Check if table number already exists for this floor
    const existing = await prisma.table.findFirst({
      where: {
        floorId,
        tableNumber,
        isActive: true
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableNumber} already exists on this floor`
      });
    }

    const table = await prisma.table.create({
      data: {
        floorId,
        tableNumber,
        capacity,
        positionX: positionX || null,
        positionY: positionY || null,
        shape: shape || 'CIRCLE',
        status: 'AVAILABLE',
        isActive: true
      },
      include: {
        floor: true
      }
    });

    logger.info(`Table created: ${table.tableNumber} on floor ${table.floor.name} (ID: ${table.id})`);

    res.status(201).json({
      success: true,
      data: table,
      message: 'Table created successfully'
    });
  } catch (error: any) {
    logger.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create table',
      error: error.message
    });
  }
};

// Update table
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, status, positionX, positionY, shape, isActive } = req.body;

    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(tableNumber && { tableNumber }),
        ...(capacity && { capacity }),
        ...(status && { status }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
        ...(shape && { shape }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        floor: true
      }
    });

    logger.info(`Table updated: ${table.tableNumber} (ID: ${table.id})`);

    res.json({
      success: true,
      data: table,
      message: 'Table updated successfully'
    });
  } catch (error: any) {
    logger.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update table',
      error: error.message
    });
  }
};

// Update table status (separate endpoint for quick status changes)
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: AVAILABLE, OCCUPIED, RESERVED, or CLEANING'
      });
    }

    const table = await prisma.table.update({
      where: { id },
      data: { status },
      include: {
        floor: true
      }
    });

    logger.info(`Table status updated: ${table.tableNumber} -> ${status}`);

    res.json({
      success: true,
      data: table,
      message: `Table status updated to ${status}`
    });
  } catch (error: any) {
    logger.error('Update table status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update table status',
      error: error.message
    });
  }
};

// Delete table (soft delete)
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if table has active orders
    const activeOrders = await prisma.sale.count({
      where: {
        tableId: id,
        orderStatus: {
          in: ['PENDING', 'PREPARING', 'READY', 'SERVED']
        }
      }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete table with ${activeOrders} active orders`
      });
    }

    const table = await prisma.table.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Table deleted (soft): ${table.tableNumber} (ID: ${table.id})`);

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete table',
      error: error.message
    });
  }
};

// Get table layout for floor plan (all tables with positions)
export const getFloorLayout = async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: {
        tables: {
          where: { isActive: true },
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            status: true,
            positionX: true,
            positionY: true,
            shape: true
          }
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
      data: {
        floor: {
          id: floor.id,
          name: floor.name,
          description: floor.description
        },
        tables: floor.tables
      }
    });
  } catch (error: any) {
    logger.error('Get floor layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch floor layout',
      error: error.message
    });
  }
};
