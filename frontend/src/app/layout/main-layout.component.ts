import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslationService, Language } from '../services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div style="display:flex;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <aside style="width:240px;background:#ffffff;border-right:1px solid #eee;display:flex;flex-direction:column;">
        <div style="padding:16px 20px;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:#DC3545;">POS System</span>
          <!-- Language Switcher -->
          <button
            (click)="toggleLanguage()"
            style="background:#f0f0f0;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:#666;">
            {{ currentLang === 'en' ? 'عربي' : 'EN' }}
          </button>
        </div>
        <nav style="padding:8px 8px 16px;overflow-y:auto;">
          <a routerLink="/app/dashboard" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">🏠 {{ t('nav.dashboard') }}</a>
          <a routerLink="/app/pos" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">🛒 {{ t('nav.pos') }}</a>
          <a routerLink="/app/sales" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">📊 {{ t('nav.sales') }}</a>
          <a routerLink="/app/shifts" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">🕐 {{ t('nav.shifts') }}</a>
          <a routerLink="/app/customers" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">👥 {{ t('nav.customers') }}</a>
          <a routerLink="/app/categories" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">🏷️ {{ t('nav.categories') }}</a>
          <a routerLink="/app/products" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">📦 {{ t('nav.products') }}</a>
          <a routerLink="/app/users" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">👤 {{ t('nav.users') }}</a>
          <a routerLink="/app/reports" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">📈 {{ t('nav.reports') }}</a>
          <a routerLink="/app/settings" routerLinkActive="active" style="display:block;padding:10px 12px;border-radius:8px;color:#333;text-decoration:none;">⚙️ {{ t('nav.settings') }}</a>
        </nav>
        <div style="margin-top:auto;padding:16px;">
          <button (click)="logout()" style="width:100%;background:#DC3545;color:#fff;border:none;padding:10px 12px;border-radius:8px;font-weight:700;cursor:pointer;">{{ t('nav.logout') }}</button>
        </div>
      </aside>
      <section style="flex:1;background:#f5f6f8;">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: [`
    a.active {
      background: #DC3545;
      color: #fff !important;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentLang: Language = 'en';

  constructor(
    private auth: AuthService,
    private router: Router,
    private translation: TranslationService
  ) {}

  ngOnInit() {
    this.currentLang = this.translation.getCurrentLanguage();
    this.translation.language$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLanguage() {
    const newLang: Language = this.currentLang === 'en' ? 'ar' : 'en';
    this.translation.setLanguage(newLang);
  }

  t(key: string): string {
    return this.translation.translate(key);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
