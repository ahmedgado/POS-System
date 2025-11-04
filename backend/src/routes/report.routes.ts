import { Router } from 'express';
import reportService from '../services/report.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate Sales Report PDF
router.get('/sales/pdf', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportPDF(req.query, res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Sales Report Excel
router.get('/sales/excel', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateSalesReportExcel(req.query, res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Inventory Report Excel
router.get('/inventory/excel', async (req, res) => {
  try {
    const language = req.query.language as string || 'en';
    await reportService.generateInventoryReportExcel(res, language);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
