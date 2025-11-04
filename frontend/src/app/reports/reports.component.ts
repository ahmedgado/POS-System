import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, SalesReportData, InventoryReportData, CashierPerformanceData, FinancialReportData } from '../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <h1 style="margin:0;font-size:24px;font-weight:700;">📈 Reports & Analytics</h1>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Report Type Tabs -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;overflow:hidden;">
          <div style="display:flex;border-bottom:2px solid #f0f0f0;">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.id"
              [style.background]="activeTab === tab.id ? '#DC3545' : '#fff'"
              [style.color]="activeTab === tab.id ? '#fff' : '#666'"
              style="flex:1;padding:16px 24px;border:none;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.3s;">
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>
        </section>

        <!-- Date Range Filter -->
        <section *ngIf="activeTab !== 'inventory'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
          <div style="display:flex;gap:16px;align-items:end;">
            <div style="flex:1;">
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Start Date</label>
              <input
                type="date"
                [(ngModel)]="startDate"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <div style="flex:1;">
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">End Date</label>
              <input
                type="date"
                [(ngModel)]="endDate"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <button
              (click)="loadReport()"
              [disabled]="loading"
              style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ loading ? 'Loading...' : 'Generate Report' }}
            </button>
            <button
              (click)="setQuickDate('today')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              Today
            </button>
            <button
              (click)="setQuickDate('week')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              This Week
            </button>
            <button
              (click)="setQuickDate('month')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              This Month
            </button>
          </div>
        </section>

        <!-- Sales Report Tab -->
        <div *ngIf="activeTab === 'sales' && salesReport">
          <!-- Summary Cards -->
          <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Sales</div>
              <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ salesReport.totalSales }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Revenue</div>
              <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ salesReport.totalRevenue.toFixed(2) }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Orders</div>
              <div style="font-size:32px;font-weight:700;color:#007bff;">{{ salesReport.totalOrders }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Avg Order Value</div>
              <div style="font-size:32px;font-weight:700;color:#ffc107;">\${{ salesReport.averageOrderValue.toFixed(2) }}</div>
            </div>
          </section>

          <!-- Export Buttons -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:12px;">
              <button
                (click)="exportPDF('sales')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
                📄 Export PDF
              </button>
              <button
                (click)="exportExcel('sales')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
                📊 Export Excel
              </button>
            </div>
          </section>

          <!-- Payment Methods Breakdown -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:24px;margin-bottom:24px;">
            <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Payment Methods</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
              <div *ngFor="let pm of salesReport.paymentMethods" style="background:#f8f9fa;padding:16px;border-radius:8px;">
                <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ pm.method }}</div>
                <div style="font-size:24px;font-weight:700;color:#DC3545;">\${{ pm.total.toFixed(2) }}</div>
                <div style="font-size:13px;color:#666;">{{ pm.count }} transactions</div>
              </div>
            </div>
          </section>

          <!-- Top Products -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;margin-bottom:24px;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Top Products</h3>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#f8f9fa;">
                <tr>
                  <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Product</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Quantity Sold</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of salesReport.topProducts" style="border-top:1px solid #f0f0f0;">
                  <td style="padding:12px 24px;">{{ product.name }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">{{ product.quantity }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ product.revenue.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- Sales by Category -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Sales by Category</h3>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#f8f9fa;">
                <tr>
                  <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Category</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Sales</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of salesReport.salesByCategory" style="border-top:1px solid #f0f0f0;">
                  <td style="padding:12px 24px;">{{ cat.category }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">{{ cat.sales }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ cat.revenue.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <!-- Inventory Report Tab -->
        <div *ngIf="activeTab === 'inventory'">
          <section style="margin-bottom:24px;">
            <button
              (click)="loadInventoryReport()"
              [disabled]="loading"
              style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;margin-right:12px;">
              {{ loading ? 'Loading...' : 'Generate Report' }}
            </button>
            <button
              *ngIf="inventoryReport"
              (click)="exportPDF('inventory')"
              style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;margin-right:12px;">
              📄 Export PDF
            </button>
            <button
              *ngIf="inventoryReport"
              (click)="exportExcel('inventory')"
              style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
              📊 Export Excel
            </button>
          </section>

          <div *ngIf="inventoryReport">
            <!-- Summary Cards -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Products</div>
                <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ inventoryReport.totalProducts }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Stock Value</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ inventoryReport.totalStockValue.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Low Stock Items</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ inventoryReport.lowStockItems }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Out of Stock</div>
                <div style="font-size:32px;font-weight:700;color:#dc3545;">{{ inventoryReport.outOfStockItems }}</div>
              </div>
            </section>

            <!-- Products Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <div style="padding:20px 24px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Inventory Details</h3>
              </div>
              <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead style="background:#f8f9fa;">
                    <tr>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Product</th>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">SKU</th>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Category</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Stock</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Min Stock</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Price</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Stock Value</th>
                      <th style="text-align:center;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let product of inventoryReport.products" style="border-top:1px solid #f0f0f0;">
                      <td style="padding:12px 24px;">{{ product.name }}</td>
                      <td style="padding:12px 24px;font-family:monospace;color:#666;">{{ product.sku }}</td>
                      <td style="padding:12px 24px;">
                        <span style="background:#f0f0f0;color:#666;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                          {{ product.category }}
                        </span>
                      </td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;" [style.color]="product.stock <= product.minStock ? '#dc3545' : '#28a745'">
                        {{ product.stock }}
                      </td>
                      <td style="padding:12px 24px;text-align:right;color:#666;">{{ product.minStock }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">\${{ product.price.toFixed(2) }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ product.stockValue.toFixed(2) }}</td>
                      <td style="padding:12px 24px;text-align:center;">
                        <span
                          [style.background]="getStatusColor(product.status).bg"
                          [style.color]="getStatusColor(product.status).text"
                          style="padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                          {{ product.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <!-- Cashier Performance Tab -->
        <div *ngIf="activeTab === 'cashier' && cashierReport">
          <!-- Export Buttons -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:12px;">
              <button
                (click)="exportPDF('cashier')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📄 Export PDF
              </button>
              <button
                (click)="exportExcel('cashier')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📊 Export Excel
              </button>
            </div>
          </section>

          <!-- Cashier Performance Table -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Cashier Performance</h3>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#f8f9fa;">
                <tr>
                  <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Cashier</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Total Sales</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Revenue</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Orders</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Avg Order Value</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Shifts</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cashier of cashierReport.cashiers" style="border-top:1px solid #f0f0f0;">
                  <td style="padding:12px 24px;font-weight:600;">{{ cashier.name }}</td>
                  <td style="padding:12px 24px;text-align:right;color:#DC3545;font-weight:600;">{{ cashier.totalSales }}</td>
                  <td style="padding:12px 24px;text-align:right;color:#28a745;font-weight:600;">\${{ cashier.totalRevenue.toFixed(2) }}</td>
                  <td style="padding:12px 24px;text-align:right;color:#007bff;font-weight:600;">{{ cashier.totalOrders }}</td>
                  <td style="padding:12px 24px;text-align:right;color:#ffc107;font-weight:600;">\${{ cashier.averageOrderValue.toFixed(2) }}</td>
                  <td style="padding:12px 24px;text-align:right;color:#666;">{{ cashier.shiftsCount }}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <!-- Financial Report Tab -->
        <div *ngIf="activeTab === 'financial' && financialReport">
          <!-- Summary Cards -->
          <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Revenue</div>
              <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ financialReport.totalRevenue.toFixed(2) }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Cost</div>
              <div style="font-size:32px;font-weight:700;color:#dc3545;">\${{ financialReport.totalCost.toFixed(2) }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Gross Profit</div>
              <div style="font-size:32px;font-weight:700;color:#007bff;">\${{ financialReport.grossProfit.toFixed(2) }}</div>
              <div style="font-size:13px;color:#666;">{{ financialReport.grossProfitMargin.toFixed(1) }}% margin</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">Net Revenue</div>
              <div style="font-size:32px;font-weight:700;color:#ffc107;">\${{ financialReport.netRevenue.toFixed(2) }}</div>
            </div>
          </section>

          <!-- Export Buttons -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:12px;">
              <button
                (click)="exportPDF('financial')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📄 Export PDF
              </button>
              <button
                (click)="exportExcel('financial')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📊 Export Excel
              </button>
            </div>
          </section>

          <!-- Revenue Breakdown -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Revenue by Payment Method</h3>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#f8f9fa;">
                <tr>
                  <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Payment Method</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Revenue</th>
                  <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let method of financialReport.revenueByPaymentMethod" style="border-top:1px solid #f0f0f0;">
                  <td style="padding:12px 24px;">{{ method.method }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ method.revenue.toFixed(2) }}</td>
                  <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">{{ method.percentage.toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align:center;padding:60px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-size:48px;margin-bottom:16px;">⏳</div>
          <div style="color:#666;font-size:16px;">Generating report...</div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !hasReport()" style="text-align:center;padding:80px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-size:64px;margin-bottom:16px;">📊</div>
          <h3 style="color:#333;margin-bottom:8px;">No Report Data</h3>
          <p style="color:#666;margin-bottom:24px;">Select a date range and click "Generate Report" to view analytics.</p>
        </div>
      </main>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  tabs = [
    { id: 'sales', label: 'Sales Report', icon: '📊' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'cashier', label: 'Cashier Performance', icon: '👤' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ];

  activeTab = 'sales';
  loading = false;

  startDate = '';
  endDate = '';

  salesReport: SalesReportData | null = null;
  inventoryReport: InventoryReportData | null = null;
  cashierReport: CashierPerformanceData | null = null;
  financialReport: FinancialReportData | null = null;

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.setQuickDate('today');
  }

  setQuickDate(period: 'today' | 'week' | 'month') {
    const today = new Date();
    this.endDate = today.toISOString().split('T')[0];

    if (period === 'today') {
      this.startDate = this.endDate;
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      this.startDate = weekAgo.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      this.startDate = monthAgo.toISOString().split('T')[0];
    }
  }

  loadReport() {
    if (!this.startDate || !this.endDate) {
      alert('Please select date range');
      return;
    }

    this.loading = true;

    if (this.activeTab === 'sales') {
      this.reportService.getSalesReport(this.startDate, this.endDate).subscribe({
        next: (data) => {
          this.salesReport = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load sales report:', err);
          this.loading = false;
          // Fallback mock data
          this.salesReport = {
            totalSales: 0,
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            paymentMethods: [],
            salesByDate: [],
            topProducts: [],
            salesByCategory: []
          };
        }
      });
    } else if (this.activeTab === 'cashier') {
      this.reportService.getCashierPerformance(this.startDate, this.endDate).subscribe({
        next: (data) => {
          this.cashierReport = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load cashier report:', err);
          this.loading = false;
          this.cashierReport = { cashiers: [] };
        }
      });
    } else if (this.activeTab === 'financial') {
      this.reportService.getFinancialReport(this.startDate, this.endDate).subscribe({
        next: (data) => {
          this.financialReport = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load financial report:', err);
          this.loading = false;
          this.financialReport = {
            totalRevenue: 0,
            totalCost: 0,
            grossProfit: 0,
            grossProfitMargin: 0,
            totalTax: 0,
            totalDiscount: 0,
            netRevenue: 0,
            revenueByPaymentMethod: []
          };
        }
      });
    }
  }

  loadInventoryReport() {
    this.loading = true;
    this.reportService.getInventoryReport().subscribe({
      next: (data) => {
        this.inventoryReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load inventory report:', err);
        this.loading = false;
        this.inventoryReport = {
          totalProducts: 0,
          totalStockValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          products: []
        };
      }
    });
  }

  hasReport(): boolean {
    switch (this.activeTab) {
      case 'sales': return !!this.salesReport;
      case 'inventory': return !!this.inventoryReport;
      case 'cashier': return !!this.cashierReport;
      case 'financial': return !!this.financialReport;
      default: return false;
    }
  }

  getStatusColor(status: string): { bg: string; text: string } {
    if (status === 'Out of Stock') return { bg: '#ffe0e0', text: '#dc3545' };
    if (status === 'Low Stock') return { bg: '#fff3cd', text: '#856404' };
    return { bg: '#d4edda', text: '#155724' };
  }

  exportPDF(type: string) {
    if (type === 'sales') {
      this.reportService.exportSalesReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `sales-report-${this.startDate}-${this.endDate}.pdf`),
        error: (err) => alert('Export failed. PDF export not yet implemented on backend.')
      });
    } else if (type === 'inventory') {
      this.reportService.exportInventoryReportPDF().subscribe({
        next: (blob) => this.downloadFile(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`),
        error: (err) => alert('Export failed. PDF export not yet implemented on backend.')
      });
    } else {
      alert('Export feature coming soon for this report type.');
    }
  }

  exportExcel(type: string) {
    if (type === 'sales') {
      this.reportService.exportSalesReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `sales-report-${this.startDate}-${this.endDate}.xlsx`),
        error: (err) => alert('Export failed. Excel export not yet implemented on backend.')
      });
    } else if (type === 'inventory') {
      this.reportService.exportInventoryReportExcel().subscribe({
        next: (blob) => this.downloadFile(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`),
        error: (err) => alert('Export failed. Excel export not yet implemented on backend.')
      });
    } else {
      alert('Export feature coming soon for this report type.');
    }
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
