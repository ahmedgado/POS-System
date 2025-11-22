import { Router } from 'express';
import { KitchenStationController } from '../controllers/kitchen-station.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new KitchenStationController();

// All routes require authentication
router.use(authenticate);

// GET /api/kitchen-stations - Get all stations
router.get('/',
    authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN_STAFF),
    asyncHandler(controller.getAll.bind(controller))
);

// POST /api/kitchen-stations - Create station
router.post('/',
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    asyncHandler(controller.create.bind(controller))
);

// PUT /api/kitchen-stations/:id - Update station
router.put('/:id',
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    asyncHandler(controller.update.bind(controller))
);

// DELETE /api/kitchen-stations/:id - Delete station
router.delete('/:id',
    authorize(UserRole.ADMIN, UserRole.MANAGER),
    asyncHandler(controller.delete.bind(controller))
);

// GET /api/kitchen-stations/:id/products - Get products for station
router.get('/:id/products',
    authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.KITCHEN_STAFF),
    asyncHandler(controller.getProducts.bind(controller))
);

export default router;
