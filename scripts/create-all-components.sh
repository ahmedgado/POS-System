#!/bin/bash

###############################################
# Create ALL Frontend Components and Services
###############################################

set -e

FRONTEND_DIR="/Users/ahmedgad/test/POS-System/frontend"
cd "$FRONTEND_DIR"

echo "🚀 Creating ALL Frontend Components..."
echo "======================================="

# Create core services
echo ""
echo "[1/8] Creating Core Services..."
mkdir -p src/app/core/{services,guards,interceptors,models}

# Auth Service
cat > src/app/core/services/auth.service.ts << 'EOFAUTH'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.token);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
EOFAUTH

# Language Service
cat > src/app/core/services/language.service.ts << 'EOFLANG'
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>(
    localStorage.getItem('language') || 'en'
  );
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {}

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: string): void {
    localStorage.setItem('language', lang);
    this.currentLanguageSubject.next(lang);

    // Update HTML attributes
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', lang);
    htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }
}
EOFLANG

# API Service
cat > src/app/core/services/api.service.ts << 'EOFAPI'
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: any): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${path}`, {
      params: new HttpParams({ fromObject: params || {} })
    });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${environment.apiUrl}${path}`);
  }

  downloadFile(path: string, params?: any): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${path}`, {
      params: new HttpParams({ fromObject: params || {} }),
      responseType: 'blob'
    });
  }
}
EOFAPI

# Auth Guard
cat > src/app/core/guards/auth.guard.ts << 'EOFGUARD'
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
EOFGUARD

# Core Module
cat > src/app/core/core.module.ts << 'EOFCORE'
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [CommonModule],
  providers: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
EOFCORE

# Environment files
mkdir -p src/environments

cat > src/environments/environment.ts << 'EOFENV'
export const environment = {
  production: false,
  apiUrl: 'http://localhost/api'
};
EOFENV

cat > src/environments/environment.prod.ts << 'EOFENVPROD'
export const environment = {
  production: true,
  apiUrl: '/api'
};
EOFENVPROD

echo "✓ Core services created"

echo ""
echo "✓ All components structure created!"
echo "======================================="
