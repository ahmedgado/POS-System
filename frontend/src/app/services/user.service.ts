import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_CLERK' | 'KITCHEN_STAFF' | 'WAITER' | 'OWNER';
  active: boolean;
  kitchenStationId?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_CLERK' | 'KITCHEN_STAFF' | 'WAITER' | 'OWNER';
  active: boolean;
  kitchenStationId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_CLERK' | 'KITCHEN_STAFF' | 'WAITER' | 'OWNER';
  active?: boolean;
  kitchenStationId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  update(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/toggle`, { active });
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/reset-password`, { newPassword });
  }
}
