import { Request, Response } from 'express';
import { printService, PrintJobData } from '../services/print.service';
import { ApiResponse } from '../utils/response';
import { PrintJobStatus } from '@prisma/client';

export class PrintController {
    /**
     * Get pending print jobs (for print agent)
     * GET /api/print/jobs/pending
     */
    async getPendingJobs(req: Request, res: Response): Promise<void> {
        try {
            const agentId = req.query.agentId as string;
            const limit = parseInt(req.query.limit as string) || 50;

            const jobs = await printService.getPendingJobs(agentId, limit);

            ApiResponse.success(res, jobs, `Found ${jobs.length} pending print jobs`);
        } catch (error: any) {
            console.error('Error fetching pending print jobs:', error);
            ApiResponse.error(res, error.message);
        }
    }

    /**
     * Update print job status (for print agent)
     * PUT /api/print/jobs/:id/status
     */
    async updateJobStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status, agentId, errorMessage } = req.body;

            if (!status || !Object.values(PrintJobStatus).includes(status)) {
                ApiResponse.error(res, 'Invalid status', 400);
                return;
            }

            await printService.updateJobStatus(id, status, agentId, errorMessage);

            ApiResponse.success(res, null, 'Job status updated');
        } catch (error: any) {
            console.error('Error updating job status:', error);
            ApiResponse.error(res, error.message);
        }
    }

    /**
     * Test print endpoint
     * POST /api/print/test
     */
    async testPrint(req: Request, res: Response): Promise<void> {
        try {
            const { kitchenStationId, printerType } = req.body;

            if (!kitchenStationId) {
                ApiResponse.error(res, 'Kitchen station ID is required', 400);
                return;
            }

            const testData: PrintJobData = {
                orderNumber: `TEST-${Date.now()}`,
                tableName: 'Test Table',
                items: [
                    {
                        name: 'Test Item 1',
                        quantity: 2,
                        modifiers: ['Extra Cheese', 'No Onions'],
                        notes: 'This is a test print'
                    },
                    {
                        name: 'Test Item 2',
                        quantity: 1
                    }
                ],
                timestamp: new Date(),
                waiterName: 'Test Waiter'
            };

            await printService.printToStation(
                kitchenStationId,
                testData,
                printerType || 'THERMAL',
                10 // High priority for test
            );

            ApiResponse.success(res, null, 'Test print job queued successfully');
        } catch (error: any) {
            console.error('Error creating test print:', error);
            ApiResponse.error(res, error.message);
        }
    }

    /**
     * Clean up old jobs
     * DELETE /api/print/jobs/cleanup
     */
    async cleanupJobs(req: Request, res: Response): Promise<void> {
        try {
            const daysOld = parseInt(req.query.days as string) || 7;
            const count = await printService.cleanupOldJobs(daysOld);

            ApiResponse.success(res, { deletedCount: count }, `Cleaned up ${count} old print jobs`);
        } catch (error: any) {
            console.error('Error cleaning up jobs:', error);
            ApiResponse.error(res, error.message);
        }
    }
}

export const printController = new PrintController();
