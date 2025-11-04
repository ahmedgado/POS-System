import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
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

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = '/api/customers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
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
}
