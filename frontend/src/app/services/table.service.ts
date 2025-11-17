import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Table {
  id: string;
  floorId: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  positionX?: number;
  positionY?: number;
  shape?: 'SQUARE' | 'ROUND' | 'RECTANGLE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  floor?: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private readonly apiUrl = '/api/restaurant/tables';

  constructor(private http: HttpClient) {}

  getTables(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getTableById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTable(table: Partial<Table>): Observable<any> {
    return this.http.post<any>(this.apiUrl, table);
  }

  updateTable(id: string, table: Partial<Table>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, table);
  }

  updateTableStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteTable(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
