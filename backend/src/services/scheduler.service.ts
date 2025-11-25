import cron from 'node-cron';
import { logger } from '../utils/logger';
import shiftService from './shift.service';

class SchedulerService {
    private jobs: cron.ScheduledTask[] = [];

    /**
     * Initialize all cron jobs
     */
    initialize() {
        logger.info('Initializing Scheduler Service...');

        // 1. Check for automatic shift open/close (Every minute)
        this.scheduleJob('* * * * *', async () => {
            try {
                // We only auto-close shifts via scheduler. 
                // Auto-opening happens when users interact with the system (getOrCreateShift)
                await shiftService.autoCloseShifts();
            } catch (error) {
                logger.error('Error in auto shift management job:', error);
            }
        });

        // 2. Check for inactive shifts (Every 5 minutes)
        this.scheduleJob('*/5 * * * *', async () => {
            try {
                await shiftService.closeInactiveShifts();
            } catch (error) {
                logger.error('Error in inactive shift check job:', error);
            }
        });

        logger.info(`Scheduler Service initialized with ${this.jobs.length} jobs.`);
    }

    /**
     * Schedule a new job
     */
    private scheduleJob(cronExpression: string, task: () => void) {
        const job = cron.schedule(cronExpression, task, {
            scheduled: true,
            timezone: "UTC" // Or get from system settings if needed, but UTC is safer for backend
        });
        this.jobs.push(job);
    }

    /**
     * Stop all jobs
     */
    stopAll() {
        this.jobs.forEach(job => job.stop());
        logger.info('All scheduler jobs stopped.');
    }
}

export default new SchedulerService();
