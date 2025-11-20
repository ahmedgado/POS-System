import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ModifierGroup {
  id?: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  maxSelections?: number;
  sortOrder: number;
  isActive: boolean;
  modifiers?: Modifier[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Modifier {
  id?: string;
  groupId?: string;
  modifierGroupId?: string;
  name: string;
  description?: string;
  price?: number;
  priceAdjustment?: number;
  isDefault?: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductModifier {
  productId: string;
  modifierGroupId: string;
  productName?: string;
  groupName?: string;
}

@Injectable({ providedIn: 'root' })
export class ModifierService {
  private readonly baseUrl = '/api/restaurant';

  constructor(private http: HttpClient) {}

  // Modifier Groups
  getModifierGroups(page: number = 1, limit: number = 25, search: string = ''): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (search) {
      params.search = search;
    }
    return this.http.get<any>(`${this.baseUrl}/modifiers/groups`, { params });
  }

  getModifierGroupById(id: string): Observable<ModifierGroup> {
    return this.http.get<any>(`${this.baseUrl}/modifiers/groups/${id}`).pipe(
      map(response => response.data)
    );
  }

  createModifierGroup(group: Partial<ModifierGroup>): Observable<ModifierGroup> {
    return this.http.post<any>(`${this.baseUrl}/modifiers/groups`, group).pipe(
      map(response => response.data)
    );
  }

  updateModifierGroup(id: string, group: Partial<ModifierGroup>): Observable<ModifierGroup> {
    return this.http.put<any>(`${this.baseUrl}/modifiers/groups/${id}`, group).pipe(
      map(response => response.data)
    );
  }

  deleteModifierGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/modifiers/groups/${id}`);
  }

  // Individual Modifiers
  getModifiers(): Observable<Modifier[]> {
    return this.http.get<any>(`${this.baseUrl}/modifiers`).pipe(
      map(response => response.data || [])
    );
  }

  createModifier(modifier: Partial<Modifier>): Observable<Modifier> {
    return this.http.post<any>(`${this.baseUrl}/modifiers`, modifier).pipe(
      map(response => response.data)
    );
  }

  updateModifier(id: string, modifier: Partial<Modifier>): Observable<Modifier> {
    return this.http.put<any>(`${this.baseUrl}/modifiers/${id}`, modifier).pipe(
      map(response => response.data)
    );
  }

  deleteModifier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/modifiers/${id}`);
  }

  // Product-Modifier Links
  getProductModifiers(productId: string): Observable<ModifierGroup[]> {
    return this.http.get<any>(`${this.baseUrl}/products/${productId}/modifiers`).pipe(
      map(response => {
        // Backend returns { data: { productId, productName, modifierGroups: [...] } }
        if (response.data && response.data.modifierGroups) {
          return response.data.modifierGroups;
        }
        return response.data || [];
      })
    );
  }

  linkModifierToProduct(data: { productId: string; modifierGroupId: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/modifiers/link`, data).pipe(
      map(response => response.data)
    );
  }

  unlinkModifierFromProduct(productId: string, modifierGroupId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${productId}/modifiers/${modifierGroupId}`);
  }
}
