import { Router } from 'express';
import { body, query } from 'express-validator';
import { ShiftController } from '../controllers/shift.controller';
import { validate } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '@prisma/client';

const router = Router();
const shiftController = new ShiftController();

router.use(authenticate);

// POST /api/shifts/open
router.post(
  '/open',
  authorize(UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN),
  validate([
    body('startingCash').isFloat({ min: 0 }).withMessage('Starting cash must be a positive number')
  ]),
  asyncHandler(shiftController.openShift.bind(shiftController))
);

// POST /api/shifts/:id/close
router.post(
  '/:id/close',
  authorize(UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN),
  validate([
    body('endingCash').isFloat({ min: 0 }).withMessage('Ending cash must be a positive number'),
    body('notes').optional().isString()
  ]),
  asyncHandler(shiftController.closeShift.bind(shiftController))
);

// GET /api/shifts/current
router.get(
  '/current',
  asyncHandler(shiftController.getCurrentShift.bind(shiftController))
);

// GET /api/shifts
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['OPEN', 'CLOSED', 'RECONCILED']),
    query('cashierId').optional().isString()
  ]),
  asyncHandler(shiftController.getAllShifts.bind(shiftController))
);

// GET /api/shifts/:id
router.get(
  '/:id',
  asyncHandler(shiftController.getShift.bind(shiftController))
);

export default router;
