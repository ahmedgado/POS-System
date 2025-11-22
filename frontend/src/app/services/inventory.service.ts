import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Ingredient {
    id: string;
    name: string;
    unit: string;
    cost: number;
    stock: number;
    lowStockAlert: number;
    isActive: boolean;
}

export interface RecipeItem {
    id?: string;
    ingredientId: string;
    ingredient?: Ingredient;
    quantity: number;
    unit: string;
}

export interface Recipe {
    id: string;
    productId: string;
    servings: number;
    items: RecipeItem[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private apiUrl = '/api/inventory';

    constructor(private http: HttpClient) { }

    // Ingredients
    getIngredients(): Observable<Ingredient[]> {
        return this.http.get<ApiResponse<Ingredient[]>>(`${this.apiUrl}/ingredients`)
            .pipe(map(response => response.data));
    }

    createIngredient(data: Partial<Ingredient>): Observable<Ingredient> {
        return this.http.post<ApiResponse<Ingredient>>(`${this.apiUrl}/ingredients`, data)
            .pipe(map(response => response.data));
    }

    updateIngredient(id: string, data: Partial<Ingredient>): Observable<Ingredient> {
        return this.http.put<ApiResponse<Ingredient>>(`${this.apiUrl}/ingredients/${id}`, data)
            .pipe(map(response => response.data));
    }

    deleteIngredient(id: string): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/ingredients/${id}`)
            .pipe(map(() => undefined));
    }

    // Recipes
    getRecipe(productId: string): Observable<Recipe> {
        return this.http.get<ApiResponse<Recipe>>(`${this.apiUrl}/recipes/${productId}`)
            .pipe(map(response => response.data));
    }

    updateRecipe(productId: string, data: Partial<Recipe>): Observable<Recipe> {
        return this.http.put<ApiResponse<Recipe>>(`${this.apiUrl}/recipes/${productId}`, data)
            .pipe(map(response => response.data));
    }
}
