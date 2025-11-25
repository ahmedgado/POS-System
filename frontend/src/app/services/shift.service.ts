import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Shift {
  id: string;
  shiftNumber?: string;
  cashierName?: string;
  startTime?: string;
  endTime?: string;
  startingCash?: number;
  endingCash?: number;
  expectedCash?: number;
  difference?: number;
  totalSales?: number;
  totalOrders?: number;
  totalTransactions?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;

  // Payment breakdown
  cashSales?: number;
  cardSales?: number;
  mobileSales?: number;
  splitSales?: number;

  // Auto-management tracking
  autoOpened?: boolean;
  autoClosed?: boolean;
  openedBy?: string;
  closedBy?: string;

  // Enhanced statistics
  totalTips?: number;
  totalServiceCharges?: number;
  totalDiscounts?: number;
  totalTax?: number;
  refundCount?: number;
  voidCount?: number;
}

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly baseUrl = '/api/shifts';

  constructor(private http: HttpClient) { }

  getAll(page: number = 1, limit: number = 25, status?: string): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (status) {
      params.status = status;
    }
    return this.http.get<any>(this.baseUrl, { params });
  }

  getCurrent(): Observable<Shift | null> {
    return this.http.get<any>(`${this.baseUrl}/current`).pipe(
      map(response => response.data || null)
    );
  }

  openShift(startingCash: number, notes?: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.baseUrl}/open`, { startingCash, notes });
  }

  closeShift(endingCash: number, notes?: string): Observable<Shift> {
    return this.http.post<Shift>(`${this.baseUrl}/close`, { endingCash, notes });
  }

  getById(id: string): Observable<Shift> {
    return this.http.get<Shift>(`${this.baseUrl}/${id}`);
  }
}
