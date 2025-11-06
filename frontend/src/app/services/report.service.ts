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

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly baseUrl = '/api/reports';

  constructor(private http: HttpClient) {}

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
}
