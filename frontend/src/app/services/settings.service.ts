import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface StoreSettings {
  id?: number;
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeCountry: string;
  storePhone: string;
  storeEmail: string;
  storeLogo?: string;
  storeWebsite?: string;
}

export interface TaxSettings {
  id?: number;
  taxEnabled: boolean;
  taxRate: number;
  taxLabel: string;
  taxIncluded: boolean;
}

export interface ReceiptSettings {
  id?: number;
  receiptHeader: string;
  receiptFooter: string;
  showLogo: boolean;
  showQRCode: boolean;
  showBarcode: boolean;
  paperSize: 'thermal' | 'a4' | 'letter';
}

export interface CurrencySettings {
  id?: number;
  currencyCode: string;
  currencySymbol: string;
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
}

export interface SystemSettings {
  id?: number;
  language: 'en' | 'ar';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  lowStockThreshold: number;
}

export interface ShiftSettings {
  shiftMode: 'MANUAL' | 'AUTOMATIC' | 'HYBRID' | 'ON_DEMAND';
  autoShiftStartTime: string | null;
  autoShiftEndTime: string | null;
  shiftStartingCash: number;
  requireShiftForSales: boolean;
  inactivityTimeout: number;
}

export interface LoyaltySettings {
  loyaltyPointsPerDollar: number;
  loyaltyPointsToRedeem: number;
  loyaltyRedemptionValue: number;
}

export interface AllSettings {
  store: StoreSettings;
  tax: TaxSettings;
  receipt: ReceiptSettings;
  currency: CurrencySettings;
  system: SystemSettings;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly baseUrl = '/api/settings';
  private currencyCache: CurrencySettings | null = null;

  constructor(private http: HttpClient) {
    // Load from localStorage first
    const cached = localStorage.getItem('currencySettings');
    if (cached) {
      try {
        this.currencyCache = JSON.parse(cached);
      } catch (e) {
        this.setDefaultCurrency();
      }
    } else {
      this.setDefaultCurrency();
    }
  }

  private setDefaultCurrency() {
    this.currencyCache = {
      currencyCode: 'USD',
      currencySymbol: '$',
      decimalPlaces: 2,
      thousandSeparator: ',',
      decimalSeparator: '.'
    };
  }

  loadCurrencySettings() {
    this.getAllSettings().subscribe({
      next: (settings) => {
        this.currencyCache = settings.currency;
        localStorage.setItem('currencySettings', JSON.stringify(settings.currency));
      },
      error: () => {
        this.setDefaultCurrency();
      }
    });
  }

  getCurrencySettings(): CurrencySettings | null {
    return this.currencyCache;
  }

  getAllSettings(): Observable<AllSettings> {
    return this.http.get<AllSettings>(this.baseUrl);
  }

  updateStoreSettings(settings: StoreSettings): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(`${this.baseUrl}/store`, settings);
  }

  updateTaxSettings(settings: TaxSettings): Observable<TaxSettings> {
    return this.http.put<TaxSettings>(`${this.baseUrl}/tax`, settings);
  }

  updateReceiptSettings(settings: ReceiptSettings): Observable<ReceiptSettings> {
    return this.http.put<ReceiptSettings>(`${this.baseUrl}/receipt`, settings);
  }

  updateCurrencySettings(settings: CurrencySettings): Observable<CurrencySettings> {
    return this.http.put<CurrencySettings>(`${this.baseUrl}/currency`, settings).pipe(
      tap(result => {
        this.currencyCache = result;
        localStorage.setItem('currencySettings', JSON.stringify(result));
      })
    );
  }

  updateSystemSettings(settings: SystemSettings): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.baseUrl}/system`, settings);
  }

  uploadLogo(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload-logo`, formData);
  }

  backupDatabase(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/backup`, { responseType: 'blob' });
  }

  restoreDatabase(file: File): Observable<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('backup', file);
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/restore`, formData);
  }

  // Shift Management Settings
  getShiftSettings(): Observable<{ data: ShiftSettings }> {
    return this.http.get<{ data: ShiftSettings }>(`${this.baseUrl}/shift`);
  }

  updateShiftSettings(settings: Partial<ShiftSettings>): Observable<{ data: ShiftSettings; message: string }> {
    return this.http.put<{ data: ShiftSettings; message: string }>(`${this.baseUrl}/shift`, settings);
  }

  // Loyalty Program Settings
  getLoyaltySettings(): Observable<{ data: LoyaltySettings }> {
    return this.http.get<{ data: LoyaltySettings }>(`${this.baseUrl}/loyalty`);
  }

  updateLoyaltySettings(settings: Partial<LoyaltySettings>): Observable<{ data: LoyaltySettings; message: string }> {
    return this.http.put<{ data: LoyaltySettings; message: string }>(`${this.baseUrl}/loyalty`, settings);
  }
}
