import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslationService, Language } from '../services/translation.service';
import { CommonModule } from '@angular/common';
import { BackendStatusComponent } from '../components/backend-status.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, BackendStatusComponent],
  template: `
    <div style="display:flex;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;background:#f8f6f4;">
      <!-- Backend Status Indicator -->
      <app-backend-status></app-backend-status>
      <aside style="width:260px;background:linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);border-right:1px solid #3a3a3a;display:flex;flex-direction:column;box-shadow:4px 0 24px rgba(0,0,0,0.3);">
        <div style="padding:24px;border-bottom:1px solid #3a3a3a;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:700;color:#d4af37;font-size:18px;letter-spacing:1px;">ST. REGIS POS</span>
          <!-- Language Switcher -->
          <button
            (click)="toggleLanguage()"
            style="background:rgba(212,175,55,0.15);border:1px solid #d4af37;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#d4af37;transition:all 0.2s;"
            (mouseenter)="$event.target.style.background='rgba(212,175,55,0.25)'"
            (mouseleave)="$event.target.style.background='rgba(212,175,55,0.15)'">
            {{ currentLang === 'en' ? 'عربي' : 'EN' }}
          </button>
        </div>
        <nav style="padding:16px 12px;overflow-y:auto;flex:1;">
          <!-- Dashboard - Admin, Owner, Manager only -->
          <a *ngIf="hasAccess(['ADMIN', 'OWNER', 'MANAGER'])" routerLink="/app/dashboard" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🏠 {{ t('nav.dashboard') }}</a>
          
          <!-- POS - Cashier, Waiter, Manager, Admin -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'CASHIER', 'WAITER'])" routerLink="/app/pos" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🛒 {{ t('nav.pos') }}</a>
          
          <!-- Sales - Cashier, Manager, Admin -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'CASHIER'])" routerLink="/app/sales" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">📊 {{ t('nav.sales') }}</a>
          
          <!-- Shifts - Cashier, Manager, Admin -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'CASHIER'])" routerLink="/app/shifts" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🕐 {{ t('nav.shifts') }}</a>
          
          <!-- Customers - All except Kitchen Staff -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'INVENTORY_CLERK'])" routerLink="/app/customers" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">👥 {{ t('nav.customers') }}</a>
          
          <!-- Categories - Admin, Manager, Inventory Clerk -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'INVENTORY_CLERK'])" routerLink="/app/categories" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🏷️ {{ t('nav.categories') }}</a>
          
          <!-- Products - Admin, Manager, Inventory Clerk, Cashier (view only) -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'INVENTORY_CLERK', 'CASHIER'])" routerLink="/app/products" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">📦 {{ t('nav.products') }}</a>
          
          <!-- Ingredients - Admin, Manager, Inventory Clerk -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'INVENTORY_CLERK'])" routerLink="/app/ingredients" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🥕 Ingredients</a>
          
          <!-- Restaurant Section - Admin, Manager, Waiter -->
          <div *ngIf="hasAccess(['ADMIN', 'MANAGER', 'WAITER'])" style="margin:20px 0 12px 0;padding:0 16px;">
            <div style="font-size:11px;font-weight:700;color:#d4af37;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Restaurant</div>
          </div>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/floors" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🏢 Floors</a>
          <!-- Admin/Manager: Full table management -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/tables" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🪑 Tables</a>
          <!-- Waiter: Read-only table layout -->
          <a *ngIf="userRole === 'WAITER'" routerLink="/app/table-layout" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🪑 Table Layout</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/modifiers" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">⚙️ Modifiers</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/product-modifiers" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🔗 Product Modifiers</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/kitchen-stations" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🍳 Kitchen Stations</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/restaurant/product-stations" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">🔗 Station Assignment</a>
          
          <!-- Kitchen Display - Kitchen Staff, Manager, Admin -->
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'KITCHEN_STAFF'])" routerLink="/app/kds" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">👨‍🍳 Kitchen Display</a>
          
          <!-- System Section - Admin, Manager, Owner -->
          <div *ngIf="hasAccess(['ADMIN', 'MANAGER', 'OWNER'])" style="margin:20px 0 12px 0;padding:0 16px;">
            <div style="font-size:11px;font-weight:700;color:#d4af37;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">System</div>
          </div>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/users" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">👤 {{ t('nav.users') }}</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER', 'OWNER'])" routerLink="/app/reports" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">📈 {{ t('nav.reports') }}</a>
          <a *ngIf="hasAccess(['ADMIN', 'MANAGER'])" routerLink="/app/settings" routerLinkActive="active" style="display:block;padding:12px 16px;border-radius:10px;color:#f8f6f4;text-decoration:none;margin-bottom:6px;font-weight:500;font-size:15px;transition:all 0.2s;">⚙️ {{ t('nav.settings') }}</a>
        </nav>
      </aside>
      <section style="flex:1;background:#f8f6f4;display:flex;flex-direction:column;">
        <!-- Top Banner with User Info and Logout -->
        <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:12px 32px;display:flex;justify-content:flex-end;align-items:center;gap:16px;box-shadow:0 2px 4px rgba(0,0,0,0.05);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="text-align:right;">
              <div style="font-weight:600;color:#333;font-size:14px;">{{ userName }}</div>
              <div style="font-size:12px;color:#666;">{{ userRole }}</div>
            </div>
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;">
              {{ userInitials }}
            </div>
          </div>
          <button (click)="logout()" style="background:linear-gradient(135deg, #DC3545 0%, #c82333 100%);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(220,53,69,0.3);transition:all 0.2s;"
          (mouseenter)="$event.target.style.transform='translateY(-2px)';$event.target.style.boxShadow='0 4px 12px rgba(220,53,69,0.4)'"
          (mouseleave)="$event.target.style.transform='translateY(0)';$event.target.style.boxShadow='0 2px 8px rgba(220,53,69,0.3)'">
            🚪 {{ t('nav.logout') }}
          </button>
        </div>
        <!-- Main Content Area -->
        <div style="flex:1;overflow-y:auto;">
          <router-outlet></router-outlet>
        </div>
      </section>
    </div>
  `,
  styles: [`
    a.active {
      background: linear-gradient(135deg, #d4af37 0%, #c19a2e 100%) !important;
      color: #1a1a1a !important;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(212,175,55,0.4);
    }
    a:hover:not(.active) {
      background: rgba(212,175,55,0.15);
      transform: translateX(4px);
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentLang: Language = 'en';
  userRole: string = '';
  userName: string = '';
  userInitials: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private translation: TranslationService
  ) { }

  ngOnInit() {
    this.currentLang = this.translation.getCurrentLanguage();
    this.translation.language$.subscribe(lang => {
      this.currentLang = lang;
    });

    // Get current user role and info
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.userRole = currentUser.role;
      this.userName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username || currentUser.email;

      // Generate initials
      const firstName = currentUser.firstName || '';
      const lastName = currentUser.lastName || '';
      if (firstName && lastName) {
        this.userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      } else if (firstName) {
        this.userInitials = firstName.substring(0, 2).toUpperCase();
      } else if (currentUser.username) {
        this.userInitials = currentUser.username.substring(0, 2).toUpperCase();
      } else {
        this.userInitials = currentUser.email.substring(0, 2).toUpperCase();
      }
    }
  }

  hasAccess(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.userRole);
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
