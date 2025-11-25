import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/response';

export class SettingsController {
  private async getSetting(key: string): Promise<any> {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });
    return setting ? JSON.parse(setting.value) : null;
  }

  private async setSetting(key: string, value: any, category: string): Promise<void> {
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value), category },
      create: { key, value: JSON.stringify(value), category }
    });
  }

  async getAll(_req: AuthRequest, res: Response) {
    const storeSettings = await this.getSetting('store_settings') || {
      storeName: 'POS System',
      storeAddress: '',
      storeCity: '',
      storeCountry: '',
      storePhone: '',
      storeEmail: '',
      storeLogo: '',
      storeWebsite: ''
    };

    const taxSettings = await this.getSetting('tax_settings') || {
      taxEnabled: true,
      taxRate: 15,
      taxLabel: 'VAT',
      taxIncluded: false
    };

    const receiptSettings = await this.getSetting('receipt_settings') || {
      receiptHeader: 'Thank you for shopping with us!',
      receiptFooter: 'Visit us again!',
      showLogo: true,
      showQRCode: true,
      showBarcode: true,
      paperSize: 'thermal'
    };

    const currencySettings = await this.getSetting('currency_settings') || {
      currencyCode: 'USD',
      currencySymbol: '$',
      decimalPlaces: 2,
      thousandSeparator: ',',
      decimalSeparator: '.'
    };

    const systemSettings = await this.getSetting('system_settings') || {
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      timezone: 'UTC',
      lowStockThreshold: 10
    };

    const allSettings = {
      store: storeSettings,
      tax: taxSettings,
      receipt: receiptSettings,
      currency: currencySettings,
      system: systemSettings
    };

    // Return settings object directly for frontend compatibility
    return res.json(allSettings);
  }

  async updateStore(req: AuthRequest, res: Response) {
    const settings = req.body;
    await this.setSetting('store_settings', settings, 'store');
    return ApiResponse.success(res, settings, 'Store settings updated successfully');
  }

  async updateTax(req: AuthRequest, res: Response) {
    const settings = req.body;
    await this.setSetting('tax_settings', settings, 'tax');
    return ApiResponse.success(res, settings, 'Tax settings updated successfully');
  }

  async updateReceipt(req: AuthRequest, res: Response) {
    const settings = req.body;
    await this.setSetting('receipt_settings', settings, 'receipt');
    return ApiResponse.success(res, settings, 'Receipt settings updated successfully');
  }

  async updateCurrency(req: AuthRequest, res: Response) {
    const settings = req.body;
    await this.setSetting('currency_settings', settings, 'currency');
    return ApiResponse.success(res, settings, 'Currency settings updated successfully');
  }

  async updateSystem(req: AuthRequest, res: Response) {
    const settings = req.body;
    await this.setSetting('system_settings', settings, 'system');
    return ApiResponse.success(res, settings, 'System settings updated successfully');
  }

  /**
   * GET /api/settings/shift - Get shift settings from SystemSettings model
   */
  async getShiftSettings(_req: AuthRequest, res: Response) {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      return ApiResponse.error(res, 'System settings not found. Please run database seed.', 500);
    }

    return ApiResponse.success(res, {
      shiftMode: settings.shiftMode,
      autoShiftStartTime: settings.autoShiftStartTime,
      autoShiftEndTime: settings.autoShiftEndTime,
      shiftStartingCash: settings.shiftStartingCash,
      requireShiftForSales: settings.requireShiftForSales,
      inactivityTimeout: settings.inactivityTimeout
    });
  }

  /**
   * PUT /api/settings/shift - Update shift settings
   */
  async updateShiftSettings(req: AuthRequest, res: Response) {
    const {
      shiftMode,
      autoShiftStartTime,
      autoShiftEndTime,
      shiftStartingCash,
      requireShiftForSales,
      inactivityTimeout
    } = req.body;

    // Validate time format if provided
    if (autoShiftStartTime && !this.isValidTimeFormat(autoShiftStartTime)) {
      return ApiResponse.error(res, 'Invalid autoShiftStartTime format. Use HH:MM (e.g., "08:00")', 400);
    }

    if (autoShiftEndTime && !this.isValidTimeFormat(autoShiftEndTime)) {
      return ApiResponse.error(res, 'Invalid autoShiftEndTime format. Use HH:MM (e.g., "22:00")', 400);
    }

    // Validate shift mode
    const validModes = ['MANUAL', 'AUTOMATIC', 'HYBRID', 'ON_DEMAND'];
    if (shiftMode && !validModes.includes(shiftMode)) {
      return ApiResponse.error(res, `Invalid shift mode. Must be one of: ${validModes.join(', ')}`, 400);
    }

    // Get existing settings
    const existingSettings = await prisma.systemSettings.findFirst();

    if (!existingSettings) {
      return ApiResponse.error(res, 'System settings not found', 500);
    }

    // Update settings
    const updatedSettings = await prisma.systemSettings.update({
      where: { id: existingSettings.id },
      data: {
        ...(shiftMode && { shiftMode }),
        ...(autoShiftStartTime !== undefined && { autoShiftStartTime }),
        ...(autoShiftEndTime !== undefined && { autoShiftEndTime }),
        ...(shiftStartingCash !== undefined && { shiftStartingCash }),
        ...(requireShiftForSales !== undefined && { requireShiftForSales }),
        ...(inactivityTimeout !== undefined && { inactivityTimeout })
      }
    });

    return ApiResponse.success(res, {
      shiftMode: updatedSettings.shiftMode,
      autoShiftStartTime: updatedSettings.autoShiftStartTime,
      autoShiftEndTime: updatedSettings.autoShiftEndTime,
      shiftStartingCash: updatedSettings.shiftStartingCash,
      requireShiftForSales: updatedSettings.requireShiftForSales,
      inactivityTimeout: updatedSettings.inactivityTimeout
    }, 'Shift settings updated successfully');
  }

  /**
   * Helper: Validate time format (HH:MM)
   */
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  }
}
