#!/usr/bin/env node

const axios = require('axios');
const escpos = require('escpos');
const Network = require('escpos-network');
const { print } = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const config = {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
    apiToken: process.env.API_TOKEN || '',
    agentId: process.env.AGENT_ID || `agent-${require('os').hostname()}`,
    pollInterval: parseInt(process.env.POLL_INTERVAL) || 3000, // 3 seconds
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3
};

console.log('🖨️  POS Print Agent Starting...');
console.log(`📡 Backend: ${config.backendUrl}`);
console.log(`🆔 Agent ID: ${config.agentId}`);
console.log(`⏱️  Poll Interval: ${config.pollInterval}ms`);
console.log('');

// API Client
const headers = {};
if (config.apiToken.startsWith('pk_live_')) {
    headers['X-API-Key'] = config.apiToken;
} else {
    headers['Authorization'] = `Bearer ${config.apiToken}`;
}

const api = axios.create({
    baseURL: `${config.backendUrl}/api`,
    headers
});

/**
 * Print to thermal printer using ESC/POS
 */
async function printThermal(printerIp, data) {
    return new Promise((resolve, reject) => {
        const device = new Network(printerIp, 9100); // Default ESC/POS port
        const printer = new escpos.Printer(device);

        device.open(async (error) => {
            if (error) {
                return reject(new Error(`Failed to connect to printer at ${printerIp}: ${error.message}`));
            }

            try {
                // Print header
                printer
                    .font('a')
                    .align('ct')
                    .style('bu')
                    .size(2, 2)
                    .text('KITCHEN TICKET')
                    .size(1, 1)
                    .style('normal')
                    .text('')
                    .text(`Order #${data.orderNumber}`)
                    .text('');

                if (data.tableName) {
                    printer.text(`Table: ${data.tableName}`).text('');
                }

                printer
                    .text(new Date(data.timestamp).toLocaleString())
                    .text('')
                    .drawLine()
                    .text('');

                // Print items
                printer.align('lt');
                data.items.forEach(item => {
                    printer
                        .style('b')
                        .text(`${item.quantity}x ${item.name}`)
                        .style('normal');

                    if (item.modifiers && item.modifiers.length > 0) {
                        item.modifiers.forEach(mod => {
                            printer.text(`   + ${mod}`);
                        });
                    }

                    if (item.notes) {
                        printer.text(`   Note: ${item.notes}`);
                    }

                    printer.text('');
                });

                // Print footer
                printer
                    .text('')
                    .drawLine()
                    .align('ct');

                if (data.waiterName) {
                    printer.text(`Waiter: ${data.waiterName}`);
                }

                printer
                    .text(`Printed: ${new Date().toLocaleString()}`)
                    .text('')
                    .text('')
                    .cut()
                    .close(() => {
                        console.log(`✅ Thermal print completed to ${printerIp}`);
                        resolve();
                    });

            } catch (err) {
                device.close();
                reject(err);
            }
        });
    });
}

/**
 * Print PDF to regular network printer
 */
async function printRegular(pdfUrl, printerIp) {
    try {
        // Download PDF
        const pdfPath = path.join(__dirname, 'temp', `print-${Date.now()}.pdf`);
        const tempDir = path.dirname(pdfPath);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const response = await axios.get(`${config.backendUrl}${pdfUrl}`, {
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(pdfPath, response.data);

        // Print using system printer
        // Note: pdf-to-printer requires printer name, not IP
        // For IP-based printing, you'd need to configure the printer in the OS first
        await print(pdfPath, {
            printer: printerIp, // This should be printer name from OS
            silent: true
        });

        // Clean up
        fs.unlinkSync(pdfPath);

        console.log(`✅ PDF print completed to ${printerIp}`);
    } catch (error) {
        throw new Error(`PDF print failed: ${error.message}`);
    }
}

/**
 * Process a single print job
 */
async function processJob(job) {
    console.log(`📄 Processing job ${job.id} for station: ${job.kitchenStation.name}`);

    try {
        // Update status to PRINTING
        await api.put(`/print/jobs/${job.id}/status`, {
            status: 'PRINTING',
            agentId: config.agentId
        });

        // Print based on type
        if (job.printerType === 'THERMAL') {
            await printThermal(job.printerIp, job.documentData);
        } else if (job.printerType === 'REGULAR') {
            if (!job.pdfUrl) {
                throw new Error('PDF URL not provided for regular printer');
            }
            await printRegular(job.pdfUrl, job.printerIp);
        }

        // Update status to COMPLETED
        await api.put(`/print/jobs/${job.id}/status`, {
            status: 'COMPLETED',
            agentId: config.agentId
        });

        console.log(`✅ Job ${job.id} completed successfully`);
        return true;

    } catch (error) {
        console.error(`❌ Job ${job.id} failed:`, error.message);

        // Update status to FAILED
        await api.put(`/print/jobs/${job.id}/status`, {
            status: 'FAILED',
            agentId: config.agentId,
            errorMessage: error.message
        });

        return false;
    }
}

/**
 * Poll for pending jobs
 */
async function pollJobs() {
    try {
        const response = await api.get('/print/jobs/pending', {
            params: {
                agentId: config.agentId,
                limit: 10
            }
        });

        const jobs = response.data.data || [];

        if (jobs.length > 0) {
            console.log(`📥 Found ${jobs.length} pending job(s)`);

            for (const job of jobs) {
                await processJob(job);
            }
        }

    } catch (error) {
        if (error.response) {
            console.error(`❌ API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.error(`❌ Network Error: Cannot reach backend at ${config.backendUrl}`);
        } else {
            console.error(`❌ Error: ${error.message}`);
        }
    }
}

/**
 * Main loop
 */
async function main() {
    console.log('✅ Print Agent Started Successfully!');
    console.log('🔄 Polling for print jobs...\n');

    // Start polling
    setInterval(pollJobs, config.pollInterval);

    // Initial poll
    pollJobs();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down print agent...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down print agent...');
    process.exit(0);
});

// Start the agent
main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
