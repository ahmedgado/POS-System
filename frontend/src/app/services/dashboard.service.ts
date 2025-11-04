import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  todaySales: number;
  todayRevenue: number;
  todayOrders: number;
  lowStockProducts: number;
  recentSales: RecentSale[];
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

export interface RecentSale {
  id: string;
  total: number;
  items: number;
  createdAt: string;
  cashierName: string;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

export interface CategorySales {
  category: string;
  total: number;
  percentage: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}
