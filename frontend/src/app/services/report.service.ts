import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalesReportData {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  transactions: {
    id: string;
    date: string;
    cashierName: string;
    customerName: string;
    items: {
      productName: string;
      sku: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    status: string;
  }[];
  salesByDate: {
    date: string;
    sales: number;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  salesByCategory: {
    category: string;
    sales: number;
    revenue: number;
  }[];
}

export interface InventoryReportData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  byCategory: {
    category: string;
    count: number;
    value: number;
    stock: number;
  }[];
  inventory: {
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    lowStockAlert: number;
    price: number;
    cost: number;
    value: number;
    status: string;
    isActive: boolean;
  }[];
}

export interface CashierPerformanceData {
  totalRevenue: number;
  totalOrders: number;
  activeCashiers: number;
  averageRevenuePerCashier: number;
  performance: {
    cashierId: string;
    name: string;
    email: string;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
  }[];
}

export interface FinancialReportData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  totalTax: number;
  totalDiscount: number;
  profitMargin: number;
  totalTransactions: number;
  averageTransactionValue: number;
}

export interface DrawerPullReportData {
  shift: {
    id: string;
    cashierName: string;
    cashierId: string;
    startTime: Date;
    endTime: Date | null;
    status: string;
  };
  cashFlow: {
    openingCash: number;
    cashSales: number;
    expectedCash: number;
    actualCash: number;
    difference: number;
    overShort: 'OVER' | 'SHORT' | 'BALANCED';
  };
  salesBreakdown: {
    cashSales: { count: number; total: number };
    cardSales: { count: number; total: number };
    mobileWallet: { count: number; total: number };
    totalSales: { count: number; total: number };
  };
  transactions: {
    time: Date;
    saleNumber: string;
    amount: number;
    paymentMethod: string;
  }[];
}

export interface ServerProductivityReportData {
  servers: {
    waiterId: string;
    name: string;
    totalSales: number;
    totalRevenue: number;
    totalTips: number;
    avgCheckSize: number;
    tablesServed: number;
    rank: number;
  }[];
  topPerformer: any;
  totalRevenue: number;
  totalTips: number;
}

export interface HourlyIncomeReportData {
  hourlyBreakdown: {
    hour: string;
    salesCount: number;
    revenue: number;
    avgCheck: number;
  }[];
  totalRevenue: number;
  peakHour: {
    hour: string;
    revenue: number;
  } | null;
}

export interface CardTransactionsReportData {
  transactions: {
    date: Date;
    saleNumber: string;
    paymentMethod: string;
    amount: number;
    cashierName: string;
  }[];
  totalTransactions: number;
  totalAmount: number;
}

export interface JournalReportData {
  transactions: {
    time: Date;
    saleNumber: string;
    orderType: string;
    paymentMethod: string;
    amount: number;
    status: string;
    cashierName: string;
  }[];
  totalTransactions: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = '/api/reports';

  constructor(private http: HttpClient) { }

  getSalesReport(startDate: string, endDate: string): Observable<SalesReportData> {
    return this.http.get<SalesReportData>(`${this.baseUrl}/sales`, {
      params: { startDate, endDate }
    });
  }

  getInventoryReport(): Observable<InventoryReportData> {
    return this.http.get<InventoryReportData>(`${this.baseUrl}/inventory`);
  }

  getCashierPerformance(startDate: string, endDate: string): Observable<CashierPerformanceData> {
    return this.http.get<CashierPerformanceData>(`${this.baseUrl}/cashier`, {
      params: { startDate, endDate }
    });
  }

  getFinancialReport(startDate: string, endDate: string): Observable<FinancialReportData> {
    return this.http.get<FinancialReportData>(`${this.baseUrl}/financial`, {
      params: { startDate, endDate }
    });
  }

  exportSalesReportPDF(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/sales/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportSalesReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/sales/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportInventoryReportPDF(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventory/pdf`, {
      responseType: 'blob'
    });
  }

  exportInventoryReportExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventory/excel`, {
      responseType: 'blob'
    });
  }

  exportCashierPerformancePDF(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/cashier/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportCashierPerformanceExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/cashier/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportFinancialReportPDF(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/financial/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportFinancialReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/financial/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  // ==================== DRAWER-PULL REPORT ====================

  getDrawerPullReport(shiftId: string): Observable<DrawerPullReportData> {
    return this.http.get<DrawerPullReportData>(`${this.baseUrl}/drawer-pull/${shiftId}`);
  }

  exportDrawerPullReportPDF(shiftId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/drawer-pull/${shiftId}/pdf`, {
      responseType: 'blob'
    });
  }

  exportDrawerPullReportExcel(shiftId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/drawer-pull/${shiftId}/excel`, {
      responseType: 'blob'
    });
  }

  // ==================== SERVER PRODUCTIVITY REPORT ====================

  getServerProductivityReport(startDate: string, endDate: string, waiterId?: string): Observable<ServerProductivityReportData> {
    let params: any = { startDate, endDate };
    if (waiterId) params.waiterId = waiterId;
    return this.http.get<ServerProductivityReportData>(`${this.baseUrl}/server-productivity`, { params });
  }

  exportServerProductivityReportPDF(startDate: string, endDate: string, waiterId?: string): Observable<Blob> {
    let params: any = { startDate, endDate };
    if (waiterId) params.waiterId = waiterId;
    return this.http.get(`${this.baseUrl}/server-productivity/pdf`, { params, responseType: 'blob' });
  }

  exportServerProductivityReportExcel(startDate: string, endDate: string, waiterId?: string): Observable<Blob> {
    let params: any = { startDate, endDate };
    if (waiterId) params.waiterId = waiterId;
    return this.http.get(`${this.baseUrl}/server-productivity/excel`, { params, responseType: 'blob' });
  }

  // ==================== HOURLY INCOME REPORT ====================

  getHourlyIncomeReport(startDate: string, endDate: string): Observable<HourlyIncomeReportData> {
    return this.http.get<HourlyIncomeReportData>(`${this.baseUrl}/hourly-income`, {
      params: { startDate, endDate }
    });
  }

  exportHourlyIncomeReportPDF(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/hourly-income/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportHourlyIncomeReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/hourly-income/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  // ==================== CARD TRANSACTIONS REPORT ====================

  getCardTransactionsReport(startDate: string, endDate: string): Observable<CardTransactionsReportData> {
    return this.http.get<CardTransactionsReportData>(`${this.baseUrl}/card-transactions`, {
      params: { startDate, endDate }
    });
  }

  exportCardTransactionsReportPDF(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/card-transactions/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  exportCardTransactionsReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/card-transactions/excel`, {
      params: { startDate, endDate },
      responseType: 'blob'
    });
  }

  // ==================== JOURNAL REPORT ====================

  getJournalReport(startDate: string, endDate: string, includeRefunds: boolean = true): Observable<JournalReportData> {
    return this.http.get<JournalReportData>(`${this.baseUrl}/journal`, {
      params: { startDate, endDate, includeRefunds: includeRefunds.toString() }
    });
  }

  exportJournalReportPDF(startDate: string, endDate: string, includeRefunds: boolean = true): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/journal/pdf`, {
      params: { startDate, endDate, includeRefunds: includeRefunds.toString() },
      responseType: 'blob'
    });
  }

  exportJournalReportExcel(startDate: string, endDate: string, includeRefunds: boolean = true): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/journal/excel`, {
      params: { startDate, endDate, includeRefunds: includeRefunds.toString() },
      responseType: 'blob'
    });
  }
}
