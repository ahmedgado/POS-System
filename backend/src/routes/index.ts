import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import saleRoutes from './sale.routes';
import customerRoutes from './customer.routes';
import shiftRoutes from './shift.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import categoryRoutes from './category.routes';
import userRoutes from './user.routes';
import settingsRoutes from './settings.routes';
import restaurantRoutes from './restaurant.routes';
import inventoryRoutes from './inventory.routes';
import kitchenStationRoutes from './kitchen-station.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/customers', customerRoutes);
router.use('/shifts', shiftRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/kitchen-stations', kitchenStationRoutes);

// Restaurant-specific routes
router.use('/restaurant', restaurantRoutes);

export default router;
