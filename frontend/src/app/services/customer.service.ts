import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: string;  // Changed from number to string (backend uses UUID)
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  loyaltyPoints?: number;
  totalPurchases?: number;
  lastPurchaseDate?: string;
  active: boolean;
  createdAt?: string;
}

export interface LoyaltyBalance {
  customerId: string;
  currentPoints: number;
  lifetimePoints: number;
  pointsValue: number;
}

export interface RedemptionResult {
  pointsRedeemed: number;
  discountAmount: number;
  remainingPoints: number;
}

export interface CustomerAnalytics {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    totalRevenue: number;
    avgCustomerValue: number;
  };
  topCustomersByRevenue: any[];
  topCustomersByFrequency: any[];
}

export interface DashboardInsights {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: any[];
  retentionRate: number;
}

export interface PurchasePatterns {
  mostPurchasedItems: { name: string; count: number }[];
  purchaseFrequency: string;
  preferredTime: string;
}

export interface CustomerGrowth {
  date: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = '/api/customers';

  constructor(private http: HttpClient) { }

  getAll(page: number = 1, limit: number = 25, search: string = ''): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (search) {
      params.search = search;
    }
    return this.http.get<any>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  create(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, customer);
  }

  update(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, customer);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPurchaseHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/purchases`);
  }

  // Quick search for POS autocomplete
  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
  }

  // Get loyalty balance
  getLoyaltyBalance(id: string): Observable<LoyaltyBalance> {
    return this.http.get<LoyaltyBalance>(`${this.baseUrl}/${id}/loyalty`);
  }

  // Redeem loyalty points
  redeemPoints(id: string, points: number): Observable<RedemptionResult> {
    return this.http.post<RedemptionResult>(`${this.baseUrl}/${id}/redeem-points`, { points });
  }

  // Get customer analytics
  getCustomerAnalytics(startDate?: string, endDate?: string): Observable<CustomerAnalytics> {
    let params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<CustomerAnalytics>(`${this.baseUrl}/analytics`, { params });
  }

  // Get dashboard insights
  getDashboardInsights(): Observable<DashboardInsights> {
    return this.http.get<DashboardInsights>(`${this.baseUrl}/dashboard-insights`);
  }

  // Get purchase patterns
  getPurchasePatterns(id: string): Observable<PurchasePatterns> {
    return this.http.get<PurchasePatterns>(`${this.baseUrl}/${id}/patterns`);
  }

  // Get customer growth
  getCustomerGrowth(): Observable<CustomerGrowth[]> {
    return this.http.get<CustomerGrowth[]>(`${this.baseUrl}/growth`);
  }
}
