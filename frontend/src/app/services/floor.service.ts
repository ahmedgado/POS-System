import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Floor {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tables?: Table[];
}

export interface Table {
  id: string;
  floorId: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  positionX?: number;
  positionY?: number;
  shape?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  private readonly apiUrl = '/api/restaurant/floors';

  constructor(private http: HttpClient) {}

  getFloors(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getFloorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createFloor(floor: Partial<Floor>): Observable<any> {
    return this.http.post<any>(this.apiUrl, floor);
  }

  updateFloor(id: string, floor: Partial<Floor>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, floor);
  }

  deleteFloor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getFloorLayout(floorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${floorId}/layout`);
  }
}
