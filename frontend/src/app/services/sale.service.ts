import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SaleItem {
  productId: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
  discount?: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface CreateSaleRequest {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount?: number;
    totalPrice: number;
  }[];
  customerId?: string;
  paymentMethod: 'CASH' | 'CARD' | 'SPLIT' | 'STORE_CREDIT';
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  cashReceived?: number;
  changeGiven?: number;
  shiftId?: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: string;
  items: SaleItem[];
  createdAt: string;
  cashier: {
    firstName: string;
    lastName: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly baseUrl = '/api/sales';

  constructor(private http: HttpClient) {}

  createSale(sale: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, sale);
  }

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.baseUrl);
  }

  getSale(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }
}
