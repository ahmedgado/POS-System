import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface ApiResponse {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: any;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api/auth';
  private readonly ACCESS = 'accessToken';
  private readonly REFRESH = 'refreshToken';
  private readonly USER = 'currentUser';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<ApiResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            localStorage.setItem(this.ACCESS, res.data.accessToken);
            if (res.data.refreshToken) localStorage.setItem(this.REFRESH, res.data.refreshToken);
            localStorage.setItem(this.USER, JSON.stringify(res.data.user));
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS);
    localStorage.removeItem(this.REFRESH);
    localStorage.removeItem(this.USER);
  }

  get token(): string | null {
    return localStorage.getItem(this.ACCESS);
  }

  get currentUser(): any | null {
    const raw = localStorage.getItem(this.USER);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }
}
