import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DashboardService, DashboardStats } from '../services/dashboard.service';
import { SettingsService } from '../services/settings.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div style="min-height:100vh;background:#f8f6f4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:24px 40px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">{{ 'dashboard.title' | translate }}</h1>
          <div style="color:#f8f6f4;font-size:15px;">{{ 'dashboard.welcome' | translate }}, {{ userEmail || 'User' }}</div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Loading State -->
        <div *ngIf="loading" style="text-align:center;padding:60px 20px;">
          <div style="font-size:18px;color:#666;">{{ 'common.loading' | translate }}</div>
        </div>

        <!-- Stats Content -->
        <div *ngIf="!loading && stats">
          <!-- Today's KPIs -->
          <section style="margin-bottom:32px;">
            <h2 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">{{ 'dashboard.todayOverview' | translate }}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
              <!-- Today's Sales -->
              <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #d4af37;">
                <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">{{ 'dashboard.todaySales' | translate }}</div>
                <div style="font-size:36px;font-weight:700;color:#d4af37;margin-bottom:6px;">{{ stats.todaySales }}</div>
                <div style="color:#8b7355;font-size:14px;">{{ 'dashboard.ordersCompleted' | translate }}</div>
              </div>

              <!-- Today's Revenue -->
              <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #2d7c3e;">
                <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">{{ 'dashboard.todayRevenue' | translate }}</div>
                <div style="font-size:36px;font-weight:700;color:#2d7c3e;margin-bottom:6px;">{{ stats.todayRevenue | currencyFormat }}</div>
                <div style="color:#8b7355;font-size:14px;">{{ 'dashboard.totalEarnings' | translate }}</div>
              </div>

              <!-- Today's Orders -->
              <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #5a7a9b;">
                <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">{{ 'dashboard.todayOrders' | translate }}</div>
                <div style="font-size:36px;font-weight:700;color:#5a7a9b;margin-bottom:6px;">{{ stats.todayOrders }}</div>
                <div style="color:#8b7355;font-size:14px;">Items sold</div>
              </div>

              <!-- Low Stock Alert -->
              <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #c19a2e;">
                <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">{{ 'dashboard.lowStockItems' | translate }}</div>
                <div style="font-size:36px;font-weight:700;color:#c19a2e;margin-bottom:6px;">{{ stats.lowStockProducts }}</div>
                <div style="color:#8b7355;font-size:14px;">Items need attention</div>
              </div>
            </div>
          </section>

          <!-- Overall Statistics -->
          <section style="margin-bottom:32px;">
            <h2 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">{{ 'dashboard.overallStatistics' | translate }}</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
              <!-- Total Sales -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">{{ 'dashboard.totalSales' | translate }}</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ stats.totalSales }}</div>
              </div>

              <!-- Total Revenue -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">{{ 'dashboard.totalRevenue' | translate }}</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ stats.totalRevenue | currencyFormat }}</div>
              </div>

              <!-- Total Orders -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Orders</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ stats.totalOrders }}</div>
              </div>

              <!-- Total Products -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Products</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ stats.totalProducts }}</div>
              </div>
            </div>
          </section>

          <!-- Two Column Layout -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:24px;">
            <!-- Recent Sales -->
            <section style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              <h3 style="margin:0 0 20px 0;color:#333;font-size:16px;font-weight:600;">{{ 'dashboard.recentSales' | translate }}</h3>
              <div *ngIf="stats.recentSales.length === 0" style="text-align:center;padding:40px 20px;color:#999;">
                {{ 'common.noData' | translate }}
              </div>
              <div *ngFor="let sale of stats.recentSales" style="padding:16px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:600;color:#333;margin-bottom:4px;">Order #{{ sale.id }}</div>
                  <div style="font-size:13px;color:#888;">{{ sale.items }} items • {{ sale.cashierName }}</div>
                </div>
                <div style="font-weight:700;color:#DC3545;font-size:18px;">{{ sale.total | currencyFormat }}</div>
              </div>
            </section>

            <!-- Top Products -->
            <section style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              <h3 style="margin:0 0 20px 0;color:#333;font-size:16px;font-weight:600;">{{ 'dashboard.topProducts' | translate }}</h3>
              <div *ngIf="stats.topProducts.length === 0" style="text-align:center;padding:40px 20px;color:#999;">
                {{ 'common.noData' | translate }}
              </div>
              <div *ngFor="let product of stats.topProducts; let i = index" style="padding:16px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:32px;height:32px;background:#DC3545;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">{{ i + 1 }}</div>
                  <div>
                    <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ product.name }}</div>
                    <div style="font-size:13px;color:#888;">{{ product.sold }} sold</div>
                  </div>
                </div>
                <div style="font-weight:700;color:#28a745;font-size:16px;">{{ product.revenue | currencyFormat }}</div>
              </div>
            </section>
          </div>

          <!-- Sales by Category -->
          <section *ngIf="stats.salesByCategory.length > 0" style="margin-top:24px;background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="margin:0 0 20px 0;color:#333;font-size:16px;font-weight:600;">{{ 'dashboard.salesByCategory' | translate }}</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
              <div *ngFor="let cat of stats.salesByCategory" style="padding:16px;border:1px solid #f0f0f0;border-radius:8px;">
                <div style="font-weight:600;color:#333;margin-bottom:8px;">{{ cat.category }}</div>
                <div style="font-size:24px;font-weight:700;color:#DC3545;margin-bottom:4px;">{{ cat.total | currencyFormat }}</div>
                <div style="font-size:13px;color:#888;">{{ cat.percentage.toFixed(1) }}% of total</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userEmail = this.auth.currentUser?.email ?? '';
  loading = true;
  stats: DashboardStats | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.settingsService.loadCurrencySettings();
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.loading = false;
        // Show mock data for demo purposes
        this.stats = {
          totalSales: 0,
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          todaySales: 0,
          todayRevenue: 0,
          todayOrders: 0,
          lowStockProducts: 0,
          recentSales: [],
          topProducts: [],
          salesByCategory: []
        };
      }
    });
  }
}
