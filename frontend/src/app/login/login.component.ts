import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;position:relative;overflow:hidden;">
      <!-- Decorative Background Pattern -->
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;opacity:0.03;background-image:repeating-linear-gradient(45deg, transparent, transparent 35px, #d4af37 35px, #d4af37 36px);pointer-events:none;"></div>

      <!-- Login Card -->
      <form (ngSubmit)="onSubmit()" style="background:linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);padding:48px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.2);min-width:380px;width:90%;max-width:480px;border:1px solid rgba(212,175,55,0.15);position:relative;z-index:1;">

        <!-- Logo / Brand -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;padding:16px 32px;background:linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%);border:2px solid #d4af37;border-radius:12px;margin-bottom:16px;">
            <h1 style="color:#d4af37;margin:0;font-size:28px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">St. Regis</h1>
          </div>
          <p style="color:#999;font-size:14px;margin:0;letter-spacing:1px;text-transform:uppercase;">Point of Sale System</p>
        </div>

        <!-- Email Input -->
        <div style="margin-bottom:24px;">
          <label style="display:block;color:#d4af37;font-weight:600;margin-bottom:8px;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">Email / البريد الإلكتروني</label>
          <input [(ngModel)]="email" name="email" type="email" required
            style="width:100%;padding:14px 16px;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:10px;color:#fff;font-size:15px;transition:all 0.3s;box-sizing:border-box;"
            onfocus="this.style.borderColor='#d4af37'; this.style.boxShadow='0 0 0 3px rgba(212,175,55,0.1)'"
            onblur="this.style.borderColor='#3a3a3a'; this.style.boxShadow='none'">
        </div>

        <!-- Password Input -->
        <div style="margin-bottom:32px;">
          <label style="display:block;color:#d4af37;font-weight:600;margin-bottom:8px;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">Password / كلمة المرور</label>
          <input [(ngModel)]="password" name="password" type="password" required
            style="width:100%;padding:14px 16px;background:#0a0a0a;border:2px solid #3a3a3a;border-radius:10px;color:#fff;font-size:15px;transition:all 0.3s;box-sizing:border-box;"
            onfocus="this.style.borderColor='#d4af37'; this.style.boxShadow='0 0 0 3px rgba(212,175,55,0.1)'"
            onblur="this.style.borderColor='#3a3a3a'; this.style.boxShadow='none'">
        </div>

        <!-- Submit Button -->
        <button type="submit" [disabled]="loading"
          style="width:100%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#0a0a0a;border:none;padding:16px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px rgba(212,175,55,0.3);"
          [style.opacity]="loading ? '0.6' : '1'"
          [style.cursor]="loading ? 'not-allowed' : 'pointer'"
          onmouseover="if(!this.disabled) { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(212,175,55,0.4)'; }"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(212,175,55,0.3)';">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>

        <!-- Error Message -->
        <div *ngIf="error" style="margin-top:20px;padding:12px 16px;background:rgba(220,53,69,0.1);border:1px solid rgba(220,53,69,0.3);border-radius:8px;color:#ff6b7a;font-size:14px;text-align:center;">
          {{ error }}
        </div>

        <!-- Demo Credentials -->
        <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
          <p style="color:#666;font-size:12px;margin:0 0 8px 0;letter-spacing:0.5px;">Demo Credentials</p>
          <p style="color:#d4af37;font-size:13px;margin:0;font-family:monospace;">admin&#64;restaurant.com / password123</p>
        </div>
      </form>

      <!-- Footer -->
      <div style="position:absolute;bottom:20px;left:0;right:0;text-align:center;color:#666;font-size:11px;letter-spacing:1px;z-index:1;">
        © 2025 The St. Regis New Capital Cairo. All Rights Reserved.
      </div>
    </div>
  `,
  styles: [`
    input::placeholder {
      color: #666;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        // Get user role and redirect accordingly
        const user = this.auth.currentUser;
        const role = user?.role;

        let redirectUrl = '/app/dashboard'; // Default

        switch (role) {
          case 'CASHIER':
            redirectUrl = '/app/pos'; // Cashiers go to POS
            break;
          case 'WAITER':
            redirectUrl = '/app/restaurant/tables'; // Waiters go to Tables
            break;
          case 'KITCHEN_STAFF':
            redirectUrl = '/app/kds'; // Kitchen staff go to Kitchen Display
            break;
          case 'INVENTORY_CLERK':
            redirectUrl = '/app/products'; // Inventory clerks go to Products
            break;
          case 'OWNER':
            redirectUrl = '/app/reports'; // Owners go to Reports
            break;
          case 'MANAGER':
          case 'ADMIN':
          default:
            redirectUrl = '/app/dashboard'; // Managers and Admins go to Dashboard
            break;
        }

        this.router.navigateByUrl(redirectUrl);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
