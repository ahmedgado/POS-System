import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../utils/response';

export class InventoryController {
    // ==================== INGREDIENTS ====================

    async getIngredients(req: AuthRequest, res: Response) {
        const ingredients = await prisma.ingredient.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
        return ApiResponse.success(res, ingredients);
    }

    async createIngredient(req: AuthRequest, res: Response) {
        const { name, unit, cost, stock, lowStockAlert } = req.body;

        const existing = await prisma.ingredient.findUnique({
            where: { name }
        });

        if (existing) {
            throw new AppError('Ingredient with this name already exists', 400);
        }

        const ingredient = await prisma.ingredient.create({
            data: {
                name,
                unit,
                cost,
                stock: stock || 0,
                lowStockAlert: lowStockAlert || 0
            }
        });

        return ApiResponse.success(res, ingredient, 'Ingredient created successfully', 201);
    }

    async updateIngredient(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const { name, unit, cost, stock, lowStockAlert } = req.body;

        const ingredient = await prisma.ingredient.update({
            where: { id },
            data: {
                name,
                unit,
                cost,
                stock,
                lowStockAlert
            }
        });

        return ApiResponse.success(res, ingredient, 'Ingredient updated successfully');
    }

    async deleteIngredient(req: AuthRequest, res: Response) {
        const { id } = req.params;

        // Soft delete
        await prisma.ingredient.update({
            where: { id },
            data: { isActive: false }
        });

        return ApiResponse.success(res, null, 'Ingredient deleted successfully');
    }

    // ==================== RECIPES ====================

    async getRecipe(req: AuthRequest, res: Response) {
        const { productId } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { productId },
            include: {
                items: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        if (!recipe) {
            return ApiResponse.success(res, null); // No recipe yet
        }

        return ApiResponse.success(res, recipe);
    }

    async updateRecipe(req: AuthRequest, res: Response) {
        const { productId } = req.params;
        const { description, prepTime, cookTime, servings, items } = req.body;
        // items: [{ ingredientId, quantity, unit, notes }]

        // Transaction to handle recipe creation/update and items replacement
        const recipe = await prisma.$transaction(async (tx: any) => {
            // 1. Upsert Recipe Header
            const recipe = await tx.recipe.upsert({
                where: { productId },
                create: {
                    productId,
                    description,
                    prepTime,
                    cookTime,
                    servings: servings || 1
                },
                update: {
                    description,
                    prepTime,
                    cookTime,
                    servings: servings || 1
                }
            });

            // 2. Delete existing items
            await tx.recipeItem.deleteMany({
                where: { recipeId: recipe.id }
            });

            // 3. Create new items
            if (items && items.length > 0) {
                await tx.recipeItem.createMany({
                    data: items.map((item: any) => ({
                        recipeId: recipe.id,
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        unit: item.unit,
                        notes: item.notes
                    }))
                });

                // 4. Calculate total recipe cost and update product cost
                let totalCost = 0;
                for (const item of items) {
                    const ingredient = await tx.ingredient.findUnique({
                        where: { id: item.ingredientId }
                    });
                    if (ingredient) {
                        totalCost += Number(ingredient.cost) * Number(item.quantity);
                    }
                }

                // Update product cost with calculated recipe cost
                await tx.product.update({
                    where: { id: productId },
                    data: { cost: totalCost }
                });
            } else {
                // If no items, set product cost to 0
                await tx.product.update({
                    where: { id: productId },
                    data: { cost: 0 }
                });
            }

            return recipe;
        });

        // Fetch complete recipe to return
        const fullRecipe = await prisma.recipe.findUnique({
            where: { id: recipe.id },
            include: {
                items: {
                    include: {
                        ingredient: true
                    }
                }
            }
        });

        return ApiResponse.success(res, fullRecipe, 'Recipe saved successfully and product cost updated');
    }
}
