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
}
