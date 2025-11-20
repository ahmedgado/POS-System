import { Request, Response } from 'express';
import { PrismaClient, KitchenTicketStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Kitchen Controller - Kitchen Display System (KDS)
 */

// ==================== KITCHEN STATIONS ====================

// Get all kitchen stations
export const getKitchenStations = async (req: Request, res: Response) => {
  try {
    const stations = await prisma.kitchenStation.findMany({
      where: { isActive: true },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({
      success: true,
      data: stations,
      message: `Found ${stations.length} kitchen stations`
    });
  } catch (error: any) {
    logger.error('Get kitchen stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kitchen stations',
      error: error.message
    });
  }
};

// Create kitchen station
export const createKitchenStation = async (req: Request, res: Response) => {
  try {
    const { name, description, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Station name is required'
      });
    }

    const station = await prisma.kitchenStation.create({
      data: {
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    logger.info(`Kitchen station created: ${station.name} (ID: ${station.id})`);

    res.status(201).json({
      success: true,
      data: station,
      message: 'Kitchen station created successfully'
    });
  } catch (error: any) {
    logger.error('Create kitchen station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create kitchen station',
      error: error.message
    });
  }
};

// Update kitchen station
export const updateKitchenStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    const station = await prisma.kitchenStation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`Kitchen station updated: ${station.name} (ID: ${station.id})`);

    res.json({
      success: true,
      data: station,
      message: 'Kitchen station updated successfully'
    });
  } catch (error: any) {
    logger.error('Update kitchen station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update kitchen station',
      error: error.message
    });
  }
};

// Link product to kitchen station
export const linkProductToStation = async (req: Request, res: Response) => {
  try {
    const { productId, kitchenStationId } = req.body;

    if (!productId || !kitchenStationId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Kitchen Station ID are required'
      });
    }

    // Check if link already exists
    const existing = await prisma.productKitchenStation.findFirst({
      where: { productId, kitchenStationId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This product is already linked to this station'
      });
    }

    const link = await prisma.productKitchenStation.create({
      data: {
        productId,
        kitchenStationId
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        kitchenStation: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Product ${link.product.name} linked to station ${link.kitchenStation.name}`);

    res.status(201).json({
      success: true,
      data: link,
      message: 'Product linked to kitchen station successfully'
    });
  } catch (error: any) {
    logger.error('Link product to station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link product to station',
      error: error.message
    });
  }
};

// Get all product-station links
export const getProductStationLinks = async (req: Request, res: Response) => {
  try {
    const links = await prisma.productKitchenStation.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: {
              select: { name: true }
            }
          }
        },
        kitchenStation: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: links
    });
  } catch (error: any) {
    logger.error('Get product-station links error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product-station links',
      error: error.message
    });
  }
};

// Unlink product from kitchen station
export const unlinkProductFromStation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const link = await prisma.productKitchenStation.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        kitchenStation: { select: { name: true } }
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    await prisma.productKitchenStation.delete({
      where: { id }
    });

    logger.info(`Product ${link.product.name} unlinked from station ${link.kitchenStation.name}`);

    res.json({
      success: true,
      message: 'Product unlinked from kitchen station successfully'
    });
  } catch (error: any) {
    logger.error('Unlink product from station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink product from station',
      error: error.message
    });
  }
};

// ==================== KITCHEN TICKETS ====================

// Get all kitchen tickets (with filters)
export const getKitchenTickets = async (req: Request, res: Response) => {
  try {
    const { stationId, status } = req.query;

    const where: any = {
      ...(stationId && { kitchenStationId: stationId as string })
    };

    // If status filter is provided, use it; otherwise show active tickets only
    if (status) {
      where.status = status as KitchenTicketStatus;
    } else {
      where.status = {
        in: ['NEW', 'IN_PROGRESS', 'READY'] // Don't show COMPLETED or CANCELLED by default
      };
    }

    const tickets = await prisma.kitchenTicket.findMany({
      where,
      include: {
        kitchenStation: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Get sale item details for each ticket
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const saleItem = await prisma.saleItem.findUnique({
          where: { id: ticket.saleItemId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            },
            modifiers: {
              include: {
                modifier: {
                  select: {
                    name: true
                  }
                }
              }
            },
            sale: {
              select: {
                id: true,
                saleNumber: true,
                orderType: true,
                table: {
                  select: {
                    tableNumber: true,
                    floor: {
                      select: { name: true }
                    }
                  }
                },
                waiter: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });

        return {
          ...ticket,
          saleItem,
          age: Math.floor((new Date().getTime() - ticket.createdAt.getTime()) / 60000) // age in minutes
        };
      })
    );

    res.json({
      success: true,
      data: ticketsWithDetails,
      message: `Found ${ticketsWithDetails.length} tickets`
    });
  } catch (error: any) {
    logger.error('Get kitchen tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kitchen tickets',
      error: error.message
    });
  }
};

// Create kitchen ticket (auto-created when order sent to kitchen)
export const createKitchenTicket = async (req: Request, res: Response) => {
  try {
    const { saleId, saleItemId, kitchenStationId, priority, notes } = req.body;

    if (!saleId || !saleItemId || !kitchenStationId) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID, Sale Item ID, and Kitchen Station ID are required'
      });
    }

    const ticket = await prisma.kitchenTicket.create({
      data: {
        saleId,
        saleItemId,
        kitchenStationId,
        status: 'NEW',
        priority: priority || 0,
        notes: notes || null
      },
      include: {
        kitchenStation: true
      }
    });

    logger.info(`Kitchen ticket created for sale ${saleId} at station ${ticket.kitchenStation.name}`);

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Kitchen ticket created successfully'
    });
  } catch (error: any) {
    logger.error('Create kitchen ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create kitchen ticket',
      error: error.message
    });
  }
};

// Update ticket status (bump/start/ready)
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['NEW', 'IN_PROGRESS', 'READY', 'SERVED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status required: NEW, IN_PROGRESS, READY, SERVED, or CANCELLED'
      });
    }

    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'READY' || status === 'SERVED') {
      updateData.completedAt = new Date();
    }

    const ticket = await prisma.kitchenTicket.update({
      where: { id },
      data: updateData,
      include: {
        kitchenStation: true
      }
    });

    // Update sale item status if ticket is ready
    if (status === 'READY') {
      await prisma.saleItem.update({
        where: { id: ticket.saleItemId },
        data: { readyAt: new Date() }
      });
    }

    logger.info(`Kitchen ticket ${id} status updated to ${status}`);

    res.json({
      success: true,
      data: ticket,
      message: `Ticket status updated to ${status}`
    });
  } catch (error: any) {
    logger.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
};

// Bump ticket (mark as complete and ready)
export const bumpTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.kitchenTicket.update({
      where: { id },
      data: {
        status: 'READY',
        completedAt: new Date()
      }
    });

    // Update sale item ready timestamp
    await prisma.saleItem.update({
      where: { id: ticket.saleItemId },
      data: { readyAt: new Date() }
    });

    logger.info(`Kitchen ticket bumped: ${id}`);

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket bumped successfully'
    });
  } catch (error: any) {
    logger.error('Bump ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bump ticket',
      error: error.message
    });
  }
};

// Get tickets for specific station (for KDS screen)
export const getStationTickets = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;

    const tickets = await prisma.kitchenTicket.findMany({
      where: {
        kitchenStationId: stationId,
        status: {
          in: ['NEW', 'IN_PROGRESS']
        }
      },
      include: {
        kitchenStation: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // Get sale item details
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const saleItem = await prisma.saleItem.findUnique({
          where: { id: ticket.saleItemId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            },
            modifiers: {
              include: {
                modifier: {
                  select: {
                    name: true,
                    priceAdjustment: true
                  }
                }
              }
            },
            sale: {
              select: {
                id: true,
                saleNumber: true,
                orderType: true,
                table: {
                  select: {
                    tableNumber: true
                  }
                }
              }
            }
          }
        });

        return {
          ...ticket,
          saleItem,
          age: Math.floor((new Date().getTime() - ticket.createdAt.getTime()) / 60000)
        };
      })
    );

    res.json({
      success: true,
      data: ticketsWithDetails,
      message: `Found ${ticketsWithDetails.length} active tickets`
    });
  } catch (error: any) {
    logger.error('Get station tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch station tickets',
      error: error.message
    });
  }
};
