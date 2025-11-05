import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  description?: string;
  price: number;
  cost?: number;
  taxRate: number;
  stock: number;
  lowStockAlert: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 100, search?: string, category?: string): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ProductsResponse>(this.baseUrl, { params });
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
