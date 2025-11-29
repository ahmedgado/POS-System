import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { SettingsController } from '../controllers/settings.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const controller = new SettingsController();

// Multer configuration for logo upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// Settings routes
router.get('/', (req, res, next) => controller.getAll(req, res).catch(next));
router.put('/store', (req, res, next) => controller.updateStore(req, res).catch(next));
router.put('/tax', (req, res, next) => controller.updateTax(req, res).catch(next));
router.put('/receipt', (req, res, next) => controller.updateReceipt(req, res).catch(next));
router.put('/currency', (req, res, next) => controller.updateCurrency(req, res).catch(next));
router.put('/system', (req, res, next) => controller.updateSystem(req, res).catch(next));

// Shift management settings routes
router.get('/shift', (req, res, next) => controller.getShiftSettings(req, res).catch(next));
router.put('/shift', (req, res, next) => controller.updateShiftSettings(req, res).catch(next));

// Loyalty program settings routes
router.get('/loyalty', (req, res, next) => controller.getLoyaltySettings(req, res).catch(next));
router.put('/loyalty', (req, res, next) => controller.updateLoyaltySettings(req, res).catch(next));

// Logo upload
router.post('/upload-logo', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = `/uploads/logos/${req.file.filename}`;
    return res.json({ success: true, url });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Database backup
router.get('/backup', (_req, res) => {
  res.status(501).json({ success: false, message: 'Database backup not yet implemented' });
});

// Database restore
router.post('/restore', upload.single('backup'), (_req, res) => {
  res.status(501).json({ success: false, message: 'Database restore not yet implemented' });
});

export default router;
