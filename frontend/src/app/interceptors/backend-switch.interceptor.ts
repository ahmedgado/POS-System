import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { EnvironmentService } from '../services/environment.service';

@Injectable()
export class BackendSwitchInterceptor implements HttpInterceptor {
  constructor(private envService: EnvironmentService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get current backend URL
    const backend = this.envService.getCurrentBackend();

    // Only intercept API calls (not external resources)
    if (req.url.startsWith('/api/')) {
      const apiUrl = `${backend.url}${req.url}`;

      // Clone request with full backend URL
      const modifiedReq = req.clone({
        url: apiUrl
      });

      return next.handle(modifiedReq).pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            // Only retry on network errors, not on 4xx/5xx
            if (error instanceof HttpErrorResponse && error.status === 0) {
              console.log(`Retry attempt ${retryCount} for ${apiUrl}`);
              return throwError(() => error);
            }
            throw error;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0) {
            // Network error - backend might be down
            console.error(`Network error with ${backend.type} backend:`, error.message);

            // Trigger backend detection (it will auto-switch if another is available)
            this.envService['detectAvailableBackend']();
          }

          return throwError(() => error);
        })
      );
    }

    // For non-API requests, pass through unchanged
    return next.handle(req);
  }
}
