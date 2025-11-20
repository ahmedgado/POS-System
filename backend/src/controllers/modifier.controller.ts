import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Modifier Controller - Manage product modifiers (customizations)
 */

// ==================== MODIFIER GROUPS ====================

// Get all modifier groups with their modifiers
export const getModifierGroups = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 25, search } = req.query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const totalCount = await prisma.modifierGroup.count({ where });

    const groups = await prisma.modifierGroup.findMany({
      where,
      include: {
        modifiers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    res.json({
      success: true,
      data: groups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
        hasMore: (Number(page) * Number(limit)) < totalCount
      },
      message: `Found ${groups.length} modifier groups`
    });
  } catch (error: any) {
    logger.error('Get modifier groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modifier groups',
      error: error.message
    });
  }
};

// Get single modifier group by ID
export const getModifierGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const group = await prisma.modifierGroup.findUnique({
      where: { id },
      include: {
        modifiers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Modifier group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error: any) {
    logger.error('Get modifier group by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modifier group',
      error: error.message
    });
  }
};

// Create modifier group
export const createModifierGroup = async (req: Request, res: Response) => {
  try {
    const { name, description, isRequired, minSelection, maxSelection, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Modifier group name is required'
      });
    }

    const group = await prisma.modifierGroup.create({
      data: {
        name,
        description: description || null,
        isRequired: isRequired || false,
        minSelection: minSelection || 0,
        maxSelection: maxSelection || null,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    logger.info(`Modifier group created: ${group.name} (ID: ${group.id})`);

    res.status(201).json({
      success: true,
      data: group,
      message: 'Modifier group created successfully'
    });
  } catch (error: any) {
    logger.error('Create modifier group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create modifier group',
      error: error.message
    });
  }
};

// Update modifier group
export const updateModifierGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, isRequired, minSelection, maxSelection, sortOrder, isActive } = req.body;

    const group = await prisma.modifierGroup.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isRequired !== undefined && { isRequired }),
        ...(minSelection !== undefined && { minSelection }),
        ...(maxSelection !== undefined && { maxSelection }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    });

    logger.info(`Modifier group updated: ${group.name} (ID: ${group.id})`);

    res.json({
      success: true,
      data: group,
      message: 'Modifier group updated successfully'
    });
  } catch (error: any) {
    logger.error('Update modifier group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update modifier group',
      error: error.message
    });
  }
};

// Delete modifier group (soft delete)
export const deleteModifierGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if group has modifiers
    const modifiersCount = await prisma.modifier.count({
      where: { groupId: id, isActive: true }
    });

    if (modifiersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete modifier group with ${modifiersCount} active modifiers. Please deactivate modifiers first.`
      });
    }

    const group = await prisma.modifierGroup.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Modifier group deleted (soft): ${group.name} (ID: ${group.id})`);

    res.json({
      success: true,
      message: 'Modifier group deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete modifier group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete modifier group',
      error: error.message
    });
  }
};

// ==================== MODIFIERS ====================

// Get all modifiers (with optional group filter)
export const getModifiers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.query;

    const modifiers = await prisma.modifier.findMany({
      where: {
        isActive: true,
        ...(groupId && { groupId: groupId as string })
      },
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { group: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: modifiers,
      message: `Found ${modifiers.length} modifiers`
    });
  } catch (error: any) {
    logger.error('Get modifiers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modifiers',
      error: error.message
    });
  }
};

// Create modifier
export const createModifier = async (req: Request, res: Response) => {
  try {
    const { groupId, name, priceAdjustment, isDefault, sortOrder } = req.body;

    if (!groupId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and modifier name are required'
      });
    }

    const modifier = await prisma.modifier.create({
      data: {
        groupId,
        name,
        priceAdjustment: priceAdjustment || 0,
        isDefault: isDefault || false,
        sortOrder: sortOrder || 0,
        isActive: true
      },
      include: {
        group: true
      }
    });

    logger.info(`Modifier created: ${modifier.name} in group ${modifier.group.name} (ID: ${modifier.id})`);

    res.status(201).json({
      success: true,
      data: modifier,
      message: 'Modifier created successfully'
    });
  } catch (error: any) {
    logger.error('Create modifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create modifier',
      error: error.message
    });
  }
};

// Update modifier
export const updateModifier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, priceAdjustment, isDefault, sortOrder, isActive } = req.body;

    const modifier = await prisma.modifier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(priceAdjustment !== undefined && { priceAdjustment }),
        ...(isDefault !== undefined && { isDefault }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        group: true
      }
    });

    logger.info(`Modifier updated: ${modifier.name} (ID: ${modifier.id})`);

    res.json({
      success: true,
      data: modifier,
      message: 'Modifier updated successfully'
    });
  } catch (error: any) {
    logger.error('Update modifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update modifier',
      error: error.message
    });
  }
};

// Delete modifier (soft delete)
export const deleteModifier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const modifier = await prisma.modifier.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info(`Modifier deleted (soft): ${modifier.name} (ID: ${modifier.id})`);

    res.json({
      success: true,
      message: 'Modifier deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete modifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete modifier',
      error: error.message
    });
  }
};

// ==================== PRODUCT-MODIFIER LINKS ====================

// Get modifiers for a specific product
export const getProductModifiers = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        modifierGroups: product.modifierGroups.map(pg => pg.modifierGroup)
      }
    });
  } catch (error: any) {
    logger.error('Get product modifiers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product modifiers',
      error: error.message
    });
  }
};

// Link modifier group to product
export const linkModifierToProduct = async (req: Request, res: Response) => {
  try {
    const { productId, modifierGroupId } = req.body;

    if (!productId || !modifierGroupId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Modifier Group ID are required'
      });
    }

    // Check if link already exists
    const existing = await prisma.productModifierGroup.findFirst({
      where: { productId, modifierGroupId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This modifier group is already linked to this product'
      });
    }

    const link = await prisma.productModifierGroup.create({
      data: {
        productId,
        modifierGroupId
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        modifierGroup: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Modifier group ${link.modifierGroup.name} linked to product ${link.product.name}`);

    res.status(201).json({
      success: true,
      data: link,
      message: 'Modifier group linked to product successfully'
    });
  } catch (error: any) {
    logger.error('Link modifier to product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link modifier to product',
      error: error.message
    });
  }
};

// Unlink modifier group from product
export const unlinkModifierFromProduct = async (req: Request, res: Response) => {
  try {
    const { productId, modifierGroupId } = req.params;

    const link = await prisma.productModifierGroup.findFirst({
      where: { productId, modifierGroupId }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    await prisma.productModifierGroup.delete({
      where: { id: link.id }
    });

    logger.info(`Modifier group unlinked from product (Product: ${productId}, Group: ${modifierGroupId})`);

    res.json({
      success: true,
      message: 'Modifier group unlinked from product successfully'
    });
  } catch (error: any) {
    logger.error('Unlink modifier from product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlink modifier from product',
      error: error.message
    });
  }
};
