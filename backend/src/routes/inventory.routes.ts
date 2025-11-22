import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const controller = new InventoryController();

// All inventory routes require authentication
router.use(authenticate);

// Ingredients
router.get('/ingredients', authorize('ADMIN', 'MANAGER', 'INVENTORY_CLERK'), controller.getIngredients);
router.post('/ingredients', authorize('ADMIN', 'MANAGER', 'INVENTORY_CLERK'), controller.createIngredient);
router.put('/ingredients/:id', authorize('ADMIN', 'MANAGER', 'INVENTORY_CLERK'), controller.updateIngredient);
router.delete('/ingredients/:id', authorize('ADMIN', 'MANAGER'), controller.deleteIngredient);

// Recipes
router.get('/recipes/:productId', authorize('ADMIN', 'MANAGER', 'KITCHEN_STAFF', 'INVENTORY_CLERK'), controller.getRecipe);
router.put('/recipes/:productId', authorize('ADMIN', 'MANAGER', 'INVENTORY_CLERK'), controller.updateRecipe);

export default router;
