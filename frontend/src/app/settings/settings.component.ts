import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, AllSettings, StoreSettings, TaxSettings, ReceiptSettings, CurrencySettings, SystemSettings } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <h1 style="margin:0;font-size:24px;font-weight:700;">⚙️ Settings & Configuration</h1>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;max-width:1200px;margin:0 auto;">
        <!-- Settings Tabs -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;overflow:hidden;">
          <div style="display:flex;border-bottom:2px solid #f0f0f0;overflow-x:auto;">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.id"
              [style.background]="activeTab === tab.id ? '#c4a75b' : '#fff'"
              [style.color]="activeTab === tab.id ? '#1a1a1a' : '#666'"
              style="flex:1;min-width:150px;padding:16px 24px;border:none;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.3s;white-space:nowrap;">
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>
        </section>

        <!-- Store Information Tab -->
        <div *ngIf="activeTab === 'store'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">Store Information</h3>
          <form (submit)="saveStoreSettings(); $event.preventDefault()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Store Name *</label>
                <input
                  type="text"
                  [(ngModel)]="storeSettings.storeName"
                  name="storeName"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Phone *</label>
                <input
                  type="tel"
                  [(ngModel)]="storeSettings.storePhone"
                  name="storePhone"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Email *</label>
              <input
                type="email"
                [(ngModel)]="storeSettings.storeEmail"
                name="storeEmail"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Address *</label>
              <input
                type="text"
                [(ngModel)]="storeSettings.storeAddress"
                name="storeAddress"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">City *</label>
                <input
                  type="text"
                  [(ngModel)]="storeSettings.storeCity"
                  name="storeCity"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Country *</label>
                <input
                  type="text"
                  [(ngModel)]="storeSettings.storeCountry"
                  name="storeCountry"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Website</label>
              <input
                type="url"
                [(ngModel)]="storeSettings.storeWebsite"
                name="storeWebsite"
                placeholder="https://example.com"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Store Logo</label>
              <input
                type="file"
                (change)="onLogoSelect($event)"
                accept="image/*"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;">
              <div *ngIf="storeSettings.storeLogo" style="margin-top:12px;">
                <img [src]="storeSettings.storeLogo" alt="Store Logo" style="max-width:200px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </div>

            <button
              type="submit"
              [disabled]="saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              {{ saving ? 'Saving...' : 'Save Store Settings' }}
            </button>
          </form>
        </div>

        <!-- Tax Settings Tab -->
        <div *ngIf="activeTab === 'tax'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">Tax Configuration</h3>
          <form (submit)="saveTaxSettings(); $event.preventDefault()">
            <div style="margin-bottom:24px;">
              <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                <input
                  type="checkbox"
                  [(ngModel)]="taxSettings.taxEnabled"
                  name="taxEnabled"
                  style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
                <span style="font-size:16px;font-weight:600;color:#333;">Enable Tax</span>
              </label>
            </div>

            <div *ngIf="taxSettings.taxEnabled">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div>
                  <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Tax Rate (%) *</label>
                  <input
                    type="number"
                    [(ngModel)]="taxSettings.taxRate"
                    name="taxRate"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                </div>
                <div>
                  <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Tax Label *</label>
                  <input
                    type="text"
                    [(ngModel)]="taxSettings.taxLabel"
                    name="taxLabel"
                    placeholder="VAT, GST, Sales Tax, etc."
                    required
                    style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                </div>
              </div>

              <div style="margin-bottom:24px;">
                <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                  <input
                    type="checkbox"
                    [(ngModel)]="taxSettings.taxIncluded"
                    name="taxIncluded"
                    style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
                  <span style="font-size:14px;color:#666;">Tax Included in Product Prices</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              {{ saving ? 'Saving...' : 'Save Tax Settings' }}
            </button>
          </form>
        </div>

        <!-- Receipt Settings Tab -->
        <div *ngIf="activeTab === 'receipt'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">Receipt Configuration</h3>
          <form (submit)="saveReceiptSettings(); $event.preventDefault()">
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Receipt Header</label>
              <textarea
                [(ngModel)]="receiptSettings.receiptHeader"
                name="receiptHeader"
                rows="3"
                placeholder="Thank you for shopping with us!"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:inherit;"></textarea>
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Receipt Footer</label>
              <textarea
                [(ngModel)]="receiptSettings.receiptFooter"
                name="receiptFooter"
                rows="3"
                placeholder="Visit us again!"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:inherit;"></textarea>
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Paper Size</label>
              <select
                [(ngModel)]="receiptSettings.paperSize"
                name="paperSize"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                <option value="thermal">Thermal (80mm)</option>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            <div style="margin-bottom:12px;">
              <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                <input
                  type="checkbox"
                  [(ngModel)]="receiptSettings.showLogo"
                  name="showLogo"
                  style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
                <span style="font-size:14px;color:#666;">Show Logo on Receipt</span>
              </label>
            </div>

            <div style="margin-bottom:12px;">
              <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                <input
                  type="checkbox"
                  [(ngModel)]="receiptSettings.showBarcode"
                  name="showBarcode"
                  style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
                <span style="font-size:14px;color:#666;">Show Barcode</span>
              </label>
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                <input
                  type="checkbox"
                  [(ngModel)]="receiptSettings.showQRCode"
                  name="showQRCode"
                  style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
                <span style="font-size:14px;color:#666;">Show QR Code</span>
              </label>
            </div>

            <button
              type="submit"
              [disabled]="saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              {{ saving ? 'Saving...' : 'Save Receipt Settings' }}
            </button>
          </form>
        </div>

        <!-- Currency Settings Tab -->
        <div *ngIf="activeTab === 'currency'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">Currency Configuration</h3>
          <form (submit)="saveCurrencySettings(); $event.preventDefault()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Currency Code *</label>
                <input
                  type="text"
                  [(ngModel)]="currencySettings.currencyCode"
                  name="currencyCode"
                  placeholder="USD, EUR, GBP, etc."
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Currency Symbol *</label>
                <input
                  type="text"
                  [(ngModel)]="currencySettings.currencySymbol"
                  name="currencySymbol"
                  placeholder="$, €, £, etc."
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Decimal Places</label>
                <select
                  [(ngModel)]="currencySettings.decimalPlaces"
                  name="decimalPlaces"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option [value]="0">0</option>
                  <option [value]="2">2</option>
                  <option [value]="3">3</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Thousand Separator</label>
                <select
                  [(ngModel)]="currencySettings.thousandSeparator"
                  name="thousandSeparator"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value=",">, (comma)</option>
                  <option value=".">. (period)</option>
                  <option value=" ">  (space)</option>
                  <option value="">None</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Decimal Separator</label>
                <select
                  [(ngModel)]="currencySettings.decimalSeparator"
                  name="decimalSeparator"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value=".">. (period)</option>
                  <option value=",">, (comma)</option>
                </select>
              </div>
            </div>

            <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:24px;">
              <div style="font-size:13px;color:#666;margin-bottom:8px;">Preview:</div>
              <div style="font-size:20px;font-weight:700;color:#c4a75b;">
                {{ formatCurrencyPreview(1234567.89) }}
              </div>
            </div>

            <button
              type="submit"
              [disabled]="saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              {{ saving ? 'Saving...' : 'Save Currency Settings' }}
            </button>
          </form>
        </div>

        <!-- System Settings Tab -->
        <div *ngIf="activeTab === 'system'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">System Configuration</h3>
          <form (submit)="saveSystemSettings(); $event.preventDefault()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Language</label>
                <select
                  [(ngModel)]="systemSettings.language"
                  name="language"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Time Format</label>
                <select
                  [(ngModel)]="systemSettings.timeFormat"
                  name="timeFormat"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value="12h">12 Hour (AM/PM)</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Date Format</label>
                <select
                  [(ngModel)]="systemSettings.dateFormat"
                  name="dateFormat"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Timezone</label>
                <select
                  [(ngModel)]="systemSettings.timezone"
                  name="timezone"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Chicago">Central Time (US)</option>
                  <option value="America/Denver">Mountain Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Riyadh">Riyadh</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">Low Stock Threshold</label>
              <input
                type="number"
                [(ngModel)]="systemSettings.lowStockThreshold"
                name="lowStockThreshold"
                min="0"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              <div style="font-size:12px;color:#666;margin-top:4px;">Alert when product stock falls below this number</div>
            </div>

            <button
              type="submit"
              [disabled]="saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              {{ saving ? 'Saving...' : 'Save System Settings' }}
            </button>
          </form>
        </div>

        <!-- Backup Tab -->
        <div *ngIf="activeTab === 'backup'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:32px;">
          <h3 style="margin:0 0 24px 0;color:#333;font-size:18px;font-weight:600;">Database Backup & Restore</h3>

          <!-- Backup Section -->
          <div style="margin-bottom:32px;padding-bottom:32px;border-bottom:2px solid #f0f0f0;">
            <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Backup Database</h4>
            <p style="color:#666;margin-bottom:16px;">Download a backup of your database. This includes all products, sales, customers, and settings.</p>
            <button
              (click)="backupDatabase()"
              [disabled]="saving"
              style="background:#28a745;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ saving ? 'Creating Backup...' : '💾 Download Backup' }}
            </button>
          </div>

          <!-- Restore Section -->
          <div>
            <h4 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Restore Database</h4>
            <div style="background:#fff3cd;border:1px solid #ffc107;padding:16px;border-radius:8px;margin-bottom:16px;">
              <div style="font-weight:600;color:#856404;margin-bottom:4px;">⚠️ Warning</div>
              <div style="font-size:13px;color:#856404;">Restoring a backup will overwrite all current data. This action cannot be undone.</div>
            </div>
            <input
              type="file"
              (change)="onBackupFileSelect($event)"
              accept=".sql,.json,.backup"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:16px;">
            <button
              (click)="restoreDatabase()"
              [disabled]="!backupFile || saving"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;"
              [style.opacity]="!backupFile || saving ? '0.5' : '1'">
              {{ saving ? 'Restoring...' : '🔄 Restore Database' }}
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" style="position:fixed;top:24px;right:24px;background:#28a745;color:#fff;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;animation:slideIn 0.3s;">
          ✓ {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" style="position:fixed;top:24px;right:24px;background:#c4a75b;color:#1a1a1a;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;animation:slideIn 0.3s;">
          ✗ {{ errorMessage }}
        </div>
      </main>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  tabs = [
    { id: 'store', label: 'Store Info', icon: '🏪' },
    { id: 'tax', label: 'Tax', icon: '💰' },
    { id: 'receipt', label: 'Receipt', icon: '🧾' },
    { id: 'currency', label: 'Currency', icon: '💵' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'backup', label: 'Backup', icon: '💾' }
  ];

  activeTab = 'store';
  saving = false;
  successMessage = '';
  errorMessage = '';

  storeSettings: StoreSettings = {
    storeName: '',
    storeAddress: '',
    storeCity: '',
    storeCountry: '',
    storePhone: '',
    storeEmail: '',
    storeLogo: '',
    storeWebsite: ''
  };

  taxSettings: TaxSettings = {
    taxEnabled: true,
    taxRate: 15,
    taxLabel: 'VAT',
    taxIncluded: false
  };

  receiptSettings: ReceiptSettings = {
    receiptHeader: 'Thank you for shopping with us!',
    receiptFooter: 'Visit us again!',
    showLogo: true,
    showQRCode: true,
    showBarcode: true,
    paperSize: 'thermal'
  };

  currencySettings: CurrencySettings = {
    currencyCode: 'USD',
    currencySymbol: '$',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.'
  };

  systemSettings: SystemSettings = {
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    timezone: 'UTC',
    lowStockThreshold: 10
  };

  logoFile: File | null = null;
  backupFile: File | null = null;

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getAllSettings().subscribe({
      next: (settings) => {
        this.storeSettings = settings.store;
        this.taxSettings = settings.tax;
        this.receiptSettings = settings.receipt;
        this.currencySettings = settings.currency;
        this.systemSettings = settings.system;
      },
      error: (err) => {
        console.error('Failed to load settings:', err);
        // Keep default values
      }
    });
  }

  saveStoreSettings() {
    this.saving = true;

    // Upload logo first if selected
    if (this.logoFile) {
      this.settingsService.uploadLogo(this.logoFile).subscribe({
        next: (result) => {
          this.storeSettings.storeLogo = result.url;
          this.updateStoreSettings();
        },
        error: (err) => {
          this.saving = false;
          this.showError('Failed to upload logo');
        }
      });
    } else {
      this.updateStoreSettings();
    }
  }

  private updateStoreSettings() {
    this.settingsService.updateStoreSettings(this.storeSettings).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Store settings saved successfully');
        this.logoFile = null;
      },
      error: (err) => {
        this.saving = false;
        this.showError('Failed to save store settings');
      }
    });
  }

  saveTaxSettings() {
    this.saving = true;
    this.settingsService.updateTaxSettings(this.taxSettings).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Tax settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Failed to save tax settings');
      }
    });
  }

  saveReceiptSettings() {
    this.saving = true;
    this.settingsService.updateReceiptSettings(this.receiptSettings).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Receipt settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Failed to save receipt settings');
      }
    });
  }

  saveCurrencySettings() {
    this.saving = true;
    this.settingsService.updateCurrencySettings(this.currencySettings).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('Currency settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Failed to save currency settings');
      }
    });
  }

  saveSystemSettings() {
    this.saving = true;
    this.settingsService.updateSystemSettings(this.systemSettings).subscribe({
      next: () => {
        this.saving = false;
        this.showSuccess('System settings saved successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Failed to save system settings');
      }
    });
  }

  onLogoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.storeSettings.storeLogo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onBackupFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.backupFile = file;
    }
  }

  backupDatabase() {
    this.saving = true;
    this.settingsService.backupDatabase().subscribe({
      next: (blob) => {
        this.saving = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.sql`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showSuccess('Backup downloaded successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Backup failed. Feature not yet implemented on backend.');
      }
    });
  }

  restoreDatabase() {
    if (!this.backupFile) return;

    if (!confirm('Are you sure you want to restore the database? This will overwrite all current data and cannot be undone.')) {
      return;
    }

    this.saving = true;
    this.settingsService.restoreDatabase(this.backupFile).subscribe({
      next: (result) => {
        this.saving = false;
        this.backupFile = null;
        this.showSuccess('Database restored successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showError('Restore failed. Feature not yet implemented on backend.');
      }
    });
  }

  formatCurrencyPreview(amount: number): string {
    const parts = amount.toFixed(this.currencySettings.decimalPlaces).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.currencySettings.thousandSeparator);
    return this.currencySettings.currencySymbol + parts.join(this.currencySettings.decimalSeparator);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
