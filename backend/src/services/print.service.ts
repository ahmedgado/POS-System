import { PrismaClient, PrintJobStatus, PrinterType } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface PrintJobData {
    orderNumber: string;
    tableName?: string;
    items: Array<{
        name: string;
        quantity: number;
        modifiers?: string[];
        notes?: string;
    }>;
    timestamp: Date;
    waiterName?: string;
}

export class PrintService {
    private deploymentMode: 'cloud' | 'onpremise';

    constructor() {
        // Detect deployment mode from environment
        this.deploymentMode = (process.env.DEPLOYMENT_MODE as 'cloud' | 'onpremise') || 'onpremise';
    }

    /**
     * Main method to print to a kitchen station
     * Automatically detects mode and queues or prints directly
     */
    async printToStation(
        kitchenStationId: string,
        data: PrintJobData,
        printerType: PrinterType = 'THERMAL',
        priority: number = 0
    ): Promise<void> {
        const station = await prisma.kitchenStation.findUnique({
            where: { id: kitchenStationId }
        });

        if (!station) {
            throw new Error(`Kitchen station ${kitchenStationId} not found`);
        }

        if (!station.printerIp) {
            throw new Error(`Kitchen station ${station.name} has no printer IP configured`);
        }

        if (this.deploymentMode === 'cloud') {
            // Cloud mode: Queue the job for local agent
            await this.queuePrintJob(kitchenStationId, station.printerIp, data, printerType, priority);
        } else {
            // On-premise mode: Print directly (not implemented in this version)
            // For now, we'll queue it anyway and let the agent handle it
            await this.queuePrintJob(kitchenStationId, station.printerIp, data, printerType, priority);
        }
    }

    /**
     * Queue a print job for the local agent to pick up
     */
    private async queuePrintJob(
        kitchenStationId: string,
        printerIp: string,
        data: PrintJobData,
        printerType: PrinterType,
        priority: number
    ): Promise<void> {
        let pdfUrl: string | undefined;

        // Generate PDF for regular printers
        if (printerType === 'REGULAR') {
            pdfUrl = await this.generatePDF(data);
        }

        await prisma.printJob.create({
            data: {
                kitchenStationId,
                printerIp,
                printerType,
                documentData: data as any,
                pdfUrl,
                priority,
                status: 'PENDING'
            }
        });
    }

    /**
     * Generate PDF for regular printers
     */
    private async generatePDF(data: PrintJobData): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `ticket-${Date.now()}.pdf`;
                const filePath = path.join(process.cwd(), 'uploads', 'tickets', fileName);

                // Ensure directory exists
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const doc = new PDFDocument({ size: [226.77, 500], margin: 10 }); // 80mm width
                const stream = fs.createWriteStream(filePath);

                doc.pipe(stream);

                // Header
                doc.fontSize(16).font('Helvetica-Bold').text('KITCHEN TICKET', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').text(`Order #${data.orderNumber}`, { align: 'center' });

                if (data.tableName) {
                    doc.text(`Table: ${data.tableName}`, { align: 'center' });
                }

                doc.fontSize(10).text(new Date(data.timestamp).toLocaleString(), { align: 'center' });
                doc.moveDown(1);

                // Line separator
                doc.moveTo(10, doc.y).lineTo(216.77, doc.y).stroke();
                doc.moveDown(0.5);

                // Items
                doc.fontSize(11).font('Helvetica-Bold');
                data.items.forEach(item => {
                    doc.text(`${item.quantity}x ${item.name}`, { continued: false });

                    if (item.modifiers && item.modifiers.length > 0) {
                        doc.fontSize(9).font('Helvetica');
                        item.modifiers.forEach(mod => {
                            doc.text(`   + ${mod}`);
                        });
                        doc.fontSize(11).font('Helvetica-Bold');
                    }

                    if (item.notes) {
                        doc.fontSize(9).font('Helvetica-Oblique');
                        doc.text(`   Note: ${item.notes}`);
                        doc.fontSize(11).font('Helvetica-Bold');
                    }

                    doc.moveDown(0.3);
                });

                // Footer
                doc.moveDown(1);
                doc.moveTo(10, doc.y).lineTo(216.77, doc.y).stroke();
                doc.moveDown(0.5);

                if (data.waiterName) {
                    doc.fontSize(9).font('Helvetica').text(`Waiter: ${data.waiterName}`, { align: 'center' });
                }

                doc.fontSize(8).text(`Printed: ${new Date().toLocaleString()}`, { align: 'center' });

                doc.end();

                stream.on('finish', () => {
                    resolve(`/uploads/tickets/${fileName}`);
                });

                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get pending print jobs for agent (used by print agent)
     */
    async getPendingJobs(agentId?: string, limit: number = 50): Promise<any[]> {
        return await prisma.printJob.findMany({
            where: {
                status: 'PENDING',
                attempts: {
                    lt: prisma.printJob.fields.maxAttempts
                }
            },
            include: {
                kitchenStation: {
                    select: {
                        id: true,
                        name: true,
                        printerIp: true
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' }
            ],
            take: limit
        });
    }

    /**
     * Update job status (used by print agent)
     */
    async updateJobStatus(
        jobId: string,
        status: PrintJobStatus,
        agentId?: string,
        errorMessage?: string
    ): Promise<void> {
        const updateData: any = {
            status,
            attempts: {
                increment: status === 'FAILED' ? 1 : 0
            }
        };

        if (agentId) {
            updateData.agentId = agentId;
        }

        if (status === 'PRINTING') {
            updateData.pickedUpAt = new Date();
        } else if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        } else if (status === 'FAILED') {
            updateData.failedAt = new Date();
            updateData.errorMessage = errorMessage;
        }

        await prisma.printJob.update({
            where: { id: jobId },
            data: updateData
        });
    }

    /**
     * Clean up old completed/failed jobs
     */
    async cleanupOldJobs(daysOld: number = 7): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.printJob.deleteMany({
            where: {
                OR: [
                    { status: 'COMPLETED', completedAt: { lt: cutoffDate } },
                    { status: 'FAILED', failedAt: { lt: cutoffDate } }
                ]
            }
        });

        return result.count;
    }
}

export const printService = new PrintService();
