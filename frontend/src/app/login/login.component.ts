import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#DC3545 0%,#FF6B7A 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <form (ngSubmit)="onSubmit()" style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.2);min-width:320px;width:90%;max-width:420px;">
        <h1 style="color:#DC3545;margin-top:0;margin-bottom:24px;text-align:center;">POS Login</h1>
        <label style="display:block;color:#444;font-weight:600;margin-bottom:6px;">Email / البريد الإلكتروني</label>
        <input [(ngModel)]="email" name="email" type="email" required style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;">
        <label style="display:block;color:#444;font-weight:600;margin-bottom:6px;">Password / كلمة المرور</label>
        <input [(ngModel)]="password" name="password" type="password" required style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:8px;margin-bottom:16px;">
        <button type="submit" [disabled]="loading" style="width:100%;background:#DC3545;color:#fff;border:none;padding:12px 16px;border-radius:8px;font-weight:700;cursor:pointer;">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
        <p *ngIf="error" style="color:#d9534f;margin-top:12px;">{{ error }}</p>
        <div style="margin-top:16px;color:#666;font-size:12px;">Try: admin1&#64;pos.com / password123</div>
      </form>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true; this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}
