import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

// Floor Controllers
import {
  getFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor
} from '../controllers/floor.controller';

// Table Controllers
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getFloorLayout,
  updateTableLayout
} from '../controllers/table.controller';

// Modifier Controllers
import {
  getModifierGroups,
  getModifierGroupById,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  getModifiers,
  createModifier,
  updateModifier,
  deleteModifier,
  getProductModifiers,
  linkModifierToProduct,
  unlinkModifierFromProduct
} from '../controllers/modifier.controller';

// Kitchen Controllers
import {
  getKitchenStations,
  createKitchenStation,
  updateKitchenStation,
  linkProductToStation,
  getProductStationLinks,
  unlinkProductFromStation,
  getKitchenTickets,
  createKitchenTicket,
  updateTicketStatus,
  bumpTicket,
  getStationTickets
} from '../controllers/kitchen.controller';

const router = Router();

// ==================== FLOOR ROUTES ====================
router.get('/floors', authenticate, getFloors);
router.get('/floors/:id', authenticate, getFloorById);
router.post('/floors', authenticate, createFloor);
router.put('/floors/:id', authenticate, updateFloor);
router.delete('/floors/:id', authenticate, deleteFloor);

// ==================== TABLE ROUTES ====================
router.get('/tables', authenticate, getTables);
router.get('/tables/:id', authenticate, getTableById);
router.post('/tables', authenticate, createTable);
router.put('/tables/:id', authenticate, updateTable);
router.patch('/tables/:id/status', authenticate, updateTableStatus);
router.patch('/tables/layout', authenticate, updateTableLayout);
router.delete('/tables/:id', authenticate, deleteTable);
router.get('/floors/:floorId/layout', authenticate, getFloorLayout);

// ==================== MODIFIER ROUTES ====================
// Modifier Groups
router.get('/modifiers/groups', authenticate, getModifierGroups);
router.get('/modifiers/groups/:id', authenticate, getModifierGroupById);
router.post('/modifiers/groups', authenticate, createModifierGroup);
router.put('/modifiers/groups/:id', authenticate, updateModifierGroup);
router.delete('/modifiers/groups/:id', authenticate, deleteModifierGroup);

// Individual Modifiers
router.get('/modifiers', authenticate, getModifiers);
router.post('/modifiers', authenticate, createModifier);
router.put('/modifiers/:id', authenticate, updateModifier);
router.delete('/modifiers/:id', authenticate, deleteModifier);

// Product-Modifier Links
router.get('/products/:productId/modifiers', authenticate, getProductModifiers);
router.post('/products/modifiers/link', authenticate, linkModifierToProduct);
router.delete('/products/:productId/modifiers/:modifierGroupId', authenticate, unlinkModifierFromProduct);

// ==================== KITCHEN ROUTES ====================
// Kitchen Stations
router.get('/kitchen/stations', authenticate, getKitchenStations);
router.post('/kitchen/stations', authenticate, createKitchenStation);
router.put('/kitchen/stations/:id', authenticate, updateKitchenStation);

// Product-Station Links
router.get('/kitchen/stations/links', authenticate, getProductStationLinks);
router.post('/kitchen/stations/link', authenticate, linkProductToStation);
router.delete('/kitchen/stations/links/:id', authenticate, unlinkProductFromStation);

// Kitchen Tickets (KDS)
router.get('/kitchen/tickets', authenticate, getKitchenTickets);
router.get('/kitchen/stations/:stationId/tickets', authenticate, getStationTickets);
router.post('/kitchen/tickets', authenticate, createKitchenTicket);
router.patch('/kitchen/tickets/:id/status', authenticate, updateTicketStatus);
router.post('/kitchen/tickets/:id/bump', authenticate, bumpTicket);

export default router;
