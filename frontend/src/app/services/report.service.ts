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
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  products: {
    id: number;
    name: string;
    sku: string;
    category: string;
    stock: number;
    minStock: number;
    price: number;
    stockValue: number;
    status: string;
  }[];
}

export interface CashierPerformanceData {
  cashiers: {
    id: string;
    name: string;
    totalSales: number;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    shiftsCount: number;
  }[];
}

export interface FinancialReportData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalTax: number;
  totalDiscount: number;
  netRevenue: number;
  revenueByPaymentMethod: {
    method: string;
    revenue: number;
    percentage: number;
  }[];
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
    return this.http.get<CashierPerformanceData>(`${this.baseUrl}/cashier-performance`, {
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
}
