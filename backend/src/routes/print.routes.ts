import { Router } from 'express';
import { printController } from '../controllers/print.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';

const router = Router();

// All print routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/print/jobs/pending
 * @desc    Get pending print jobs (for print agent)
 * @access  Public (agent uses API key in query)
 */
router.get('/jobs/pending', (req, res) => printController.getPendingJobs(req, res));

/**
 * @route   PUT /api/print/jobs/:id/status
 * @desc    Update print job status (for print agent)
 * @access  Public (agent uses API key)
 */
router.put('/jobs/:id/status', (req, res) => printController.updateJobStatus(req, res));

/**
 * @route   POST /api/print/test
 * @desc    Test print to a kitchen station
 * @access  Admin, Manager
 */
router.post('/test', authorize('ADMIN', 'MANAGER'), (req, res) => printController.testPrint(req, res));

/**
 * @route   DELETE /api/print/jobs/cleanup
 * @desc    Clean up old completed/failed jobs
 * @access  Admin
 */
router.delete('/jobs/cleanup', authorize('ADMIN'), (req, res) => printController.cleanupJobs(req, res));

export default router;
