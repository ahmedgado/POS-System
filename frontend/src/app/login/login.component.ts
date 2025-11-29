import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <!-- Background Image with Overlay -->
      <div class="background-image"></div>
      <div class="overlay"></div>
      
      <!-- Animated Particles -->
      <div class="particles">
        <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
        <div class="particle" style="left: 20%; animation-delay: 2s;"></div>
        <div class="particle" style="left: 30%; animation-delay: 4s;"></div>
        <div class="particle" style="left: 40%; animation-delay: 1s;"></div>
        <div class="particle" style="left: 50%; animation-delay: 3s;"></div>
        <div class="particle" style="left: 60%; animation-delay: 5s;"></div>
        <div class="particle" style="left: 70%; animation-delay: 2.5s;"></div>
        <div class="particle" style="left: 80%; animation-delay: 4.5s;"></div>
        <div class="particle" style="left: 90%; animation-delay: 1.5s;"></div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <form (ngSubmit)="onSubmit()" class="login-form">
          
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="logo-emblem">
              <div class="logo-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="url(#gold-gradient)" stroke-width="2"/>
                  <path d="M30 10 L35 25 L50 25 L38 35 L43 50 L30 40 L17 50 L22 35 L10 25 L25 25 Z" fill="url(#gold-gradient)"/>
                  <defs>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#f4e4c1;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#d4af37;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#c19a2e;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <h1 class="brand-name">The St. Regis</h1>
            <p class="brand-subtitle">New Capital Cairo</p>
            <div class="divider"></div>
            <p class="system-name">Point of Sale System</p>
          </div>

          <!-- Email Input -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-icon">✉</span>
              <span>Email Address</span>
            </label>
            <div class="input-wrapper">
              <input 
                [(ngModel)]="email" 
                name="email" 
                type="email" 
                required
                class="input-field"
                placeholder="Enter your email"
                autocomplete="email">
              <div class="input-border"></div>
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-group">
            <label class="input-label">
              <span class="label-icon">🔒</span>
              <span>Password</span>
            </label>
            <div class="input-wrapper">
              <input 
                [(ngModel)]="password" 
                name="password" 
                type="password" 
                required
                class="input-field"
                placeholder="Enter your password"
                autocomplete="current-password">
              <div class="input-border"></div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" [disabled]="loading" class="submit-btn">
            <span class="btn-content">
              <span class="btn-text">{{ loading ? 'Signing In...' : 'Sign In' }}</span>
              <span class="btn-icon">→</span>
            </span>
            <div class="btn-shine"></div>
          </button>

          <!-- Error Message -->
          <div *ngIf="error" class="error-message">
            <span class="error-icon">⚠</span>
            <span>{{ error }}</span>
          </div>

          <!-- Demo Credentials -->
          <div class="demo-section">
            <p class="demo-title">Demo Credentials</p>
            <div class="demo-credentials">
              <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">admin&#64;restaurant.com</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Password:</span>
                <span class="credential-value">password123</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© 2025 The St. Regis New Capital Cairo. All Rights Reserved.</p>
        <p class="footer-tagline">Where Luxury Meets Excellence</p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');

    /* Container */
    .login-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      font-family: 'Montserrat', sans-serif;
    }

    /* Background Image */
    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/assets/hotel-background.png') center/cover no-repeat;
      z-index: 0;
    }


    /* Overlay */
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(10, 10, 10, 0.85) 0%, 
        rgba(30, 20, 10, 0.75) 50%, 
        rgba(10, 10, 10, 0.85) 100%);
      backdrop-filter: blur(3px);
      z-index: 1;
    }

    /* Animated Particles */
    .particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 2;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      bottom: -10px;
      width: 3px;
      height: 3px;
      background: radial-gradient(circle, #d4af37 0%, transparent 70%);
      border-radius: 50%;
      animation: float 15s infinite ease-in-out;
      opacity: 0.6;
      box-shadow: 0 0 10px #d4af37;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-100vh) translateX(50px);
        opacity: 0;
      }
    }

    /* Login Card */
    .login-card {
      position: relative;
      z-index: 10;
      width: 90%;
      max-width: 520px;
      animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .login-form {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 2px solid rgba(212, 175, 55, 0.3);
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .login-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(212, 175, 55, 0.5) 50%, 
        transparent 100%);
    }

    /* Logo Section */
    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-emblem {
      display: inline-block;
      margin-bottom: 20px;
      animation: glow 3s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% {
        filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
      }
      50% {
        filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.8));
      }
    }

    .logo-icon {
      display: inline-block;
      padding: 15px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
      border-radius: 50%;
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(135deg, #f4e4c1 0%, #d4af37 50%, #c19a2e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 8px 0;
      letter-spacing: 2px;
      text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
    }

    .brand-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #d4af37;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 0 0 20px 0;
      opacity: 0.9;
    }

    .divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
      margin: 0 auto 16px;
    }

    .system-name {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }

    /* Input Groups */
    .input-group {
      margin-bottom: 28px;
    }

    .input-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d4af37;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .label-icon {
      font-size: 16px;
      opacity: 0.8;
    }

    .input-wrapper {
      position: relative;
    }

    .input-field {
      width: 100%;
      padding: 16px 20px;
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
      color: #fff;
      font-size: 15px;
      font-family: 'Montserrat', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      outline: none;
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .input-field:focus {
      background: rgba(0, 0, 0, 0.4);
      border-color: #d4af37;
      box-shadow: 
        0 0 0 4px rgba(212, 175, 55, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }

    .input-border {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #d4af37, #f4e4c1);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 2px;
    }

    .input-field:focus + .input-border {
      width: 100%;
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #d4af37 0%, #c19a2e 50%, #d4af37 100%);
      background-size: 200% 100%;
      border: none;
      border-radius: 12px;
      color: #0a0a0a;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 
        0 4px 15px rgba(212, 175, 55, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      margin-top: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      background-position: 100% 0;
      transform: translateY(-3px);
      box-shadow: 
        0 8px 25px rgba(212, 175, 55, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .btn-icon {
      font-size: 20px;
      transition: transform 0.3s;
    }

    .submit-btn:hover:not(:disabled) .btn-icon {
      transform: translateX(5px);
    }

    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.3), 
        transparent);
      transition: left 0.5s;
    }

    .submit-btn:hover:not(:disabled) .btn-shine {
      left: 100%;
    }

    /* Error Message */
    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding: 14px 18px;
      background: rgba(220, 53, 69, 0.15);
      border: 1px solid rgba(220, 53, 69, 0.4);
      border-radius: 10px;
      color: #ff6b7a;
      font-size: 14px;
      animation: shake 0.5s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    .error-icon {
      font-size: 18px;
    }

    /* Demo Section */
    .demo-section {
      margin-top: 32px;
      padding-top: 28px;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
    }

    .demo-title {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin: 0 0 16px 0;
    }

    .demo-credentials {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 10px;
      padding: 16px;
    }

    .credential-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .credential-item:not(:last-child) {
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }

    .credential-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      font-weight: 500;
    }

    .credential-value {
      color: #d4af37;
      font-size: 13px;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      text-align: center;
      z-index: 10;
    }

    .footer p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
      letter-spacing: 1px;
      margin: 4px 0;
    }

    .footer-tagline {
      color: rgba(212, 175, 55, 0.6);
      font-style: italic;
      font-size: 10px;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      .login-form {
        padding: 36px 28px;
      }

      .brand-name {
        font-size: 36px;
      }

      .brand-subtitle {
        font-size: 12px;
      }
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
