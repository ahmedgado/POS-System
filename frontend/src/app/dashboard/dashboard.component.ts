import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { DashboardService, DashboardStats } from '../services/dashboard.service';
import { CustomerService, DashboardInsights, CustomerGrowth } from '../services/customer.service';
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
            <h2 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">{{ stats.monthName }}</h2>
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

          <!-- Customer Insights -->
          <section *ngIf="customerInsights" style="margin-bottom:32px;">
            <h2 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">Customer Insights</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
              <!-- Total Customers -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-top:4px solid #6f42c1;">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Customers</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ customerInsights.totalCustomers }}</div>
                <div style="font-size:13px;color:#28a745;margin-top:4px;">+{{ customerInsights.newCustomers }} new this month</div>
              </div>

              <!-- Retention Rate -->
              <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-top:4px solid #17a2b8;">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Retention Rate</div>
                <div style="font-size:28px;font-weight:700;color:#333;">{{ customerInsights.retentionRate }}%</div>
                <div style="font-size:13px;color:#666;margin-top:4px;">Active in last 90 days</div>
              </div>

              <!-- Top Customer -->
              <div *ngIf="customerInsights.topCustomers.length > 0" style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-top:4px solid #fd7e14;">
                <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Top Customer</div>
                <div style="font-size:20px;font-weight:700;color:#333;">{{ customerInsights.topCustomers[0].firstName }} {{ customerInsights.topCustomers[0].lastName }}</div>
                <div style="font-size:13px;color:#666;margin-top:4px;">{{ customerInsights.topCustomers[0].totalSpent | currencyFormat }} spent</div>
              </div>
            </div>
          </section>

          <!-- Customer Growth Chart -->
          <section *ngIf="customerGrowth.length > 0" style="margin-bottom:32px;">
            <h2 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">Customer Growth (Last 12 Months)</h2>
            <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;">
                <div *ngFor="let month of customerGrowth" style="flex:1;min-width:60px;display:flex;flex-direction:column;align-items:center;">
                  <div style="position:relative;height:200px;display:flex;align-items:flex-end;width:100%;">
                    <div 
                      [style.height.px]="month.count > 0 ? (month.count / getMaxGrowth() * 180) : 5"
                      style="width:100%;background:linear-gradient(180deg, #d4af37 0%, #c19a2e 100%);border-radius:8px 8px 0 0;transition:all 0.3s;position:relative;cursor:pointer;"
                      [title]="month.count + ' new customers'">
                      <div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);font-weight:700;color:#d4af37;font-size:14px;white-space:nowrap;">
                        {{ month.count }}
                      </div>
                    </div>
                  </div>
                  <div style="margin-top:8px;font-size:11px;color:#666;font-weight:600;text-align:center;">
                    {{ month.date.substring(5) }}
                  </div>
                </div>
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
                <div style="font-size:13px;color:#888;">{{ formatPercentage(cat.percentage) }}% of total</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  userEmail: string;
  loading = true;
  stats: DashboardStats | null = null;
  customerInsights: DashboardInsights | null = null;
  customerGrowth: CustomerGrowth[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private settingsService: SettingsService,
    private customerService: CustomerService
  ) { }

  ngOnInit() {
    this.userEmail = this.auth.currentUser?.email || '';
    this.settingsService.loadCurrencySettings();
    this.loadStats();
    this.loadCustomerInsights();
    this.loadCustomerGrowth();
  }

  formatPercentage(value: number | string): string {
    const num = Number(value);
    return isNaN(num) ? '0.0' : num.toFixed(1);
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

  loadCustomerInsights() {
    this.customerService.getDashboardInsights().subscribe({
      next: (data) => {
        this.customerInsights = data;
      },
      error: (err) => {
        console.error('Failed to load customer insights:', err);
      }
    });
  }

  getMaxGrowth(): number {
    if (this.customerGrowth.length === 0) return 1;
    return Math.max(...this.customerGrowth.map(m => m.count), 1);
  }

  loadCustomerGrowth() {
    this.customerService.getCustomerGrowth().subscribe({
      next: (data) => {
        this.customerGrowth = data;
      },
      error: (err) => {
        console.error('Failed to load customer growth:', err);
      }
    });
  }
}
