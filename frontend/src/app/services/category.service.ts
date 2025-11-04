import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  productCount?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  update(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string, active: boolean): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/${id}/toggle`, { active });
  }
}
