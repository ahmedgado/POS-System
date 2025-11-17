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
}

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly baseUrl = '/api/shifts';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Shift[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => response.data || [])
    );
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
