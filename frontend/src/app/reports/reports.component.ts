import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportService, SalesReportData, InventoryReportData, CashierPerformanceData, FinancialReportData, DrawerPullReportData, ServerProductivityReportData, HourlyIncomeReportData, CardTransactionsReportData, JournalReportData } from '../services/report.service';
import { ShiftService, Shift } from '../services/shift.service';
import { UserService, User } from '../services/user.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div style="background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <h1 style="margin:0;font-size:24px;font-weight:700;">📈 {{ 'reports.title' | translate }}</h1>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Report Type Tabs -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;overflow:hidden;">
          <div style="display:flex;border-bottom:2px solid #f0f0f0;overflow-x:auto;">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.id"
              [style.background]="activeTab === tab.id ? '#c4a75b' : '#fff'"
              [style.color]="activeTab === tab.id ? '#1a1a1a' : '#666'"
              style="min-width:120px;padding:16px 24px;border:none;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.3s;white-space:nowrap;">
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>
        </section>

        <!-- Date Range Filter -->
        <section *ngIf="activeTab === 'sales'" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
          <div style="display:flex;gap:16px;align-items:end;">
            <div style="flex:1;">
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
              <input
                type="date"
                [(ngModel)]="startDate"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <div style="flex:1;">
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
              <input
                type="date"
                [(ngModel)]="endDate"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <button
              (click)="loadReport()"
              [disabled]="loading"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
            </button>
            <button
              (click)="setQuickDate('today')"
              style="background:#fff;color:#c4a75b;border:2px solid #c4a75b;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.today' | translate }}
            </button>
            <button
              (click)="setQuickDate('week')"
              style="background:#fff;color:#c4a75b;border:2px solid #c4a75b;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.thisWeek' | translate }}
            </button>
            <button
              (click)="setQuickDate('month')"
              style="background:#fff;color:#c4a75b;border:2px solid #c4a75b;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.thisMonth' | translate }}
            </button>
          </div>
        </section>

        <!-- Sales Report Tab -->
        <div *ngIf="activeTab === 'sales' && salesReport">
          <!-- Summary Cards -->
          <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalSales' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ salesReport.totalSales }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalRevenue' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#28a745;">{{ salesReport.totalRevenue | currencyFormat }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalOrders' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#007bff;">{{ salesReport.totalOrders }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.avgOrderValue' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ salesReport.averageOrderValue | currencyFormat }}</div>
            </div>
          </section>

          <!-- Export Buttons -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:12px;">
              <button
                (click)="exportPDF('sales')"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
                📄 {{ 'reports.exportPDF' | translate }}
              </button>
              <button
                (click)="exportExcel('sales')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
                📊 {{ 'reports.exportExcel' | translate }}
              </button>
            </div>
          </section>

          <!-- Payment Methods Breakdown -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:24px;margin-bottom:24px;">
            <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">{{ 'sales.paymentMethod' | translate }}</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
              <div *ngFor="let pm of salesReport.paymentMethods" style="background:#f8f9fa;padding:16px;border-radius:8px;">
                <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ pm.method }}</div>
                <div style="font-size:24px;font-weight:700;color:#c4a75b;">{{ pm.total | currencyFormat }}</div>
                <div style="font-size:13px;color:#666;">{{ pm.count }} transactions</div>
              </div>
            </div>
          </section>

          <!-- Detailed Sales Transactions -->
          <section *ngIf="salesReport.transactions && salesReport.transactions.length > 0" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;margin-bottom:24px;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">{{ 'reports.detailedTransactions' | translate }}</h3>
            </div>
            <div style="overflow-x:auto;max-height:600px;overflow-y:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
                  <tr>
                    <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.saleId' | translate }}</th>
                    <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.date' | translate }}</th>
                    <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.cashier' | translate }}</th>
                    <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.customer' | translate }}</th>
                    <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.items' | translate }}</th>
                    <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.subtotal' | translate }}</th>
                    <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.discount' | translate }}</th>
                    <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.tax' | translate }}</th>
                    <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.total' | translate }}</th>
                    <th style="text-align:center;padding:12px 16px;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid #E5E5E5;">{{ 'sales.paymentMethod' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let txn of salesReport.transactions; let i = index" style="border-top:1px solid #f0f0f0;transition:background 0.2s;" onmouseover="this.style.background='#F8F9FA'" onmouseout="this.style.background='#fff'">
                    <td style="padding:12px 16px;font-family:monospace;font-size:12px;color:#666;">{{ txn.id.slice(0,8) }}...</td>
                    <td style="padding:12px 16px;font-size:13px;color:#333;">{{ formatDate(txn.date) }}</td>
                    <td style="padding:12px 16px;font-size:13px;color:#333;">{{ txn.cashierName }}</td>
                    <td style="padding:12px 16px;font-size:13px;color:#333;">{{ txn.customerName }}</td>
                    <td style="padding:12px 16px;font-size:12px;color:#666;">
                      <div *ngFor="let item of txn.items" style="margin-bottom:4px;">
                        <span style="font-weight:600;color:#333;">{{ item.quantity }}x</span> {{ item.productName }}
                        <span style="color:#999;"> ({{ item.price | currencyFormat }})</span>
                      </div>
                    </td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#666;">{{ txn.subtotal | currencyFormat }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#c4a75b;">{{ txn.discount | currencyFormat }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#a38a4a;">{{ txn.tax | currencyFormat }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#28a745;">{{ txn.total | currencyFormat }}</td>
                    <td style="padding:12px 16px;text-align:center;">
                      <span style="background:#f0f0f0;color:#666;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;">
                        {{ txn.paymentMethod }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Top Products -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;margin-bottom:24px;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">{{ 'dashboard.topProducts' | translate }}</h3>
            </div>
            <div style="overflow-y:auto;overflow-x:auto;max-height:600px;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
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
                    <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">{{ product.revenue | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Sales by Category -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
            <div style="padding:20px 24px;border-bottom:1px solid #eee;">
              <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">{{ 'dashboard.salesByCategory' | translate }}</h3>
            </div>
            <div style="overflow-y:auto;overflow-x:auto;max-height:600px;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
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
                    <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">{{ cat.revenue | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Inventory Report Tab -->
        <div *ngIf="activeTab === 'inventory'">
          <section style="margin-bottom:24px;">
            <button
              (click)="loadInventoryReport()"
              [disabled]="loading"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;margin-right:12px;">
              {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
            </button>
            <button
              *ngIf="inventoryReport"
              (click)="exportPDF('inventory')"
              style="background:#c4a75b;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;margin-right:12px;">
              📄 {{ 'reports.exportPDF' | translate }}
            </button>
            <button
              *ngIf="inventoryReport"
              (click)="exportExcel('inventory')"
              style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
              📊 {{ 'reports.exportExcel' | translate }}
            </button>
          </section>

          <div *ngIf="inventoryReport">
            <!-- Summary Cards -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Products</div>
                <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ inventoryReport.totalProducts }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Stock Value</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">{{ inventoryReport.totalValue | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Low Stock Items</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ inventoryReport.lowStockCount }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Out of Stock</div>
                <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ inventoryReport.outOfStockCount }}</div>
              </div>
            </section>

            <!-- Stock Status Breakdown -->
            <section style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
              <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Stock Status</h3>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                <div style="text-align:center;padding:16px;background:#f8f9fa;border-radius:8px;">
                  <div style="font-size:28px;font-weight:700;color:#28a745;margin-bottom:4px;">{{ inventoryReport.stockStatus.inStock }}</div>
                  <div style="font-size:12px;color:#666;">In Stock</div>
                </div>
                <div style="text-align:center;padding:16px;background:#f8f9fa;border-radius:8px;">
                  <div style="font-size:28px;font-weight:700;color:#ffc107;margin-bottom:4px;">{{ inventoryReport.stockStatus.lowStock }}</div>
                  <div style="font-size:12px;color:#666;">Low Stock</div>
                </div>
                <div style="text-align:center;padding:16px;background:#f8f9fa;border-radius:8px;">
                  <div style="font-size:28px;font-weight:700;color:#c4a75b;margin-bottom:4px;">{{ inventoryReport.stockStatus.outOfStock }}</div>
                  <div style="font-size:12px;color:#666;">Out of Stock</div>
                </div>
              </div>
            </section>

            <!-- Category Breakdown -->
            <section style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
              <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Inventory by Category</h3>
              <div style="overflow-y:auto;overflow-x:auto;max-height:600px;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
                    <tr>
                      <th style="text-align:left;padding:12px 16px;font-size:13px;font-weight:600;color:#666;">Category</th>
                      <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;">Products</th>
                      <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;">Total Stock</th>
                      <th style="text-align:right;padding:12px 16px;font-size:13px;font-weight:600;color:#666;">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let cat of inventoryReport.byCategory" style="border-top:1px solid #f0f0f0;">
                      <td style="padding:12px 16px;font-weight:600;">{{ cat.category }}</td>
                      <td style="padding:12px 16px;text-align:right;color:#c4a75b;font-weight:600;">{{ cat.count }}</td>
                      <td style="padding:12px 16px;text-align:right;color:#007bff;font-weight:600;">{{ cat.stock }}</td>
                      <td style="padding:12px 16px;text-align:right;color:#28a745;font-weight:600;">{{ cat.value | currencyFormat }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Products Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <div style="padding:20px 24px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Inventory Details</h3>
              </div>
              <div style="overflow-y:auto;overflow-x:auto;max-height:600px;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
                    <tr>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Product</th>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">SKU</th>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Category</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Stock</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Low Alert</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Price</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Cost</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Stock Value</th>
                      <th style="text-align:center;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of inventoryReport.inventory" style="border-top:1px solid #f0f0f0;">
                      <td style="padding:12px 24px;">{{ item.name }}</td>
                      <td style="padding:12px 24px;font-family:monospace;color:#666;">{{ item.sku }}</td>
                      <td style="padding:12px 24px;">
                        <span style="background:#f0f0f0;color:#666;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                          {{ item.category }}
                        </span>
                      </td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;" [style.color]="item.stock <= item.lowStockAlert ? '#c4a75b' : '#28a745'">
                        {{ item.stock }}
                      </td>
                      <td style="padding:12px 24px;text-align:right;color:#666;">{{ item.lowStockAlert }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">{{ item.price | currencyFormat }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#666;">{{ item.cost | currencyFormat }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">{{ item.value | currencyFormat }}</td>
                      <td style="padding:12px 24px;text-align:center;">
                        <span
                          [style.background]="getStatusColor(item.status).bg"
                          [style.color]="getStatusColor(item.status).text"
                          style="padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                          {{ item.status }}
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
        <div *ngIf="activeTab === 'cashier'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input
                  type="date"
                  [(ngModel)]="startDate"
                  style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button
                (click)="loadCashierReport()"
                [disabled]="loading"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
              </button>
              <button
                *ngIf="cashierReport"
                (click)="exportPDF('cashier')"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📄 {{ 'reports.exportPDF' | translate }}
              </button>
              <button
                *ngIf="cashierReport"
                (click)="exportExcel('cashier')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📊 {{ 'reports.exportExcel' | translate }}
              </button>
            </div>
          </section>

          <div *ngIf="cashierReport">
            <!-- Summary Cards -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Revenue</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">{{ cashierReport.totalRevenue | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Orders</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">{{ cashierReport.totalOrders }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Active Cashiers</div>
                <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ cashierReport.activeCashiers }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Avg Revenue/Cashier</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ cashierReport.averageRevenuePerCashier | currencyFormat }}</div>
              </div>
            </section>

            <!-- Cashier Performance Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <div style="padding:20px 24px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Cashier Performance</h3>
              </div>
              <div style="overflow-y:auto;overflow-x:auto;max-height:600px;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead style="background:#f8f9fa;position:sticky;top:0;z-index:1;">
                    <tr>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Cashier</th>
                      <th style="text-align:left;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Email</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Total Sales</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Revenue</th>
                      <th style="text-align:right;padding:12px 24px;font-size:13px;font-weight:600;color:#666;">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let perf of cashierReport.performance" style="border-top:1px solid #f0f0f0;">
                      <td style="padding:12px 24px;font-weight:600;">{{ perf.name }}</td>
                      <td style="padding:12px 24px;color:#666;">{{ perf.email }}</td>
                      <td style="padding:12px 24px;text-align:right;color:#c4a75b;font-weight:600;">{{ perf.totalSales }}</td>
                      <td style="padding:12px 24px;text-align:right;color:#28a745;font-weight:600;">{{ perf.totalRevenue | currencyFormat }}</td>
                      <td style="padding:12px 24px;text-align:right;color:#007bff;font-weight:600;">{{ perf.averageOrderValue | currencyFormat }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <!-- Financial Report Tab -->
        <div *ngIf="activeTab === 'financial'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input
                  type="date"
                  [(ngModel)]="startDate"
                  style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button
                (click)="loadFinancialReport()"
                [disabled]="loading"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
              </button>
              <button
                *ngIf="financialReport"
                (click)="exportPDF('financial')"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📄 {{ 'reports.exportPDF' | translate }}
              </button>
              <button
                *ngIf="financialReport"
                (click)="exportExcel('financial')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📊 {{ 'reports.exportExcel' | translate }}
              </button>
            </div>
          </section>

          <div *ngIf="financialReport">
            <!-- Summary Cards -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Revenue</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">{{ financialReport.totalRevenue | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Cost</div>
                <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ financialReport.totalCost | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Gross Profit</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">{{ financialReport.grossProfit | currencyFormat }}</div>
                <div style="font-size:13px;color:#666;">{{ financialReport.profitMargin.toFixed(1) }}% margin</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #6c5ce7;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Net Profit</div>
                <div style="font-size:32px;font-weight:700;color:#6c5ce7;">{{ financialReport.netProfit | currencyFormat }}</div>
              </div>
            </section>

            <!-- Additional Metrics -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Tax</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ financialReport.totalTax | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #e74c3c;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Discount</div>
                <div style="font-size:32px;font-weight:700;color:#e74c3c;">{{ financialReport.totalDiscount | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #3498db;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Transactions</div>
                <div style="font-size:32px;font-weight:700;color:#3498db;">{{ financialReport.totalTransactions }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #9b59b6;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Avg Transaction Value</div>
                <div style="font-size:32px;font-weight:700;color:#9b59b6;">{{ financialReport.averageTransactionValue | currencyFormat }}</div>
              </div>
            </section>

            <!-- Financial Summary Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <div style="padding:20px 24px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Financial Summary</h3>
              </div>
              <div style="padding:24px;">
                <div style="display:grid;gap:16px;">
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Revenue:</span>
                    <span style="color:#28a745;font-weight:700;font-size:18px;">{{ financialReport.totalRevenue | currencyFormat }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Cost of Goods:</span>
                    <span style="color:#c4a75b;font-weight:700;font-size:18px;">-{{ financialReport.totalCost | currencyFormat }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid #333;">
                    <span style="color:#333;font-weight:700;">Gross Profit:</span>
                    <span style="color:#007bff;font-weight:700;font-size:18px;">{{ financialReport.grossProfit | currencyFormat }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Tax Collected:</span>
                    <span style="color:#ffc107;font-weight:700;font-size:18px;">-{{ financialReport.totalTax | currencyFormat }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid #333;">
                    <span style="color:#333;font-weight:700;font-size:18px;">Net Profit:</span>
                    <span style="color:#6c5ce7;font-weight:700;font-size:22px;">{{ financialReport.netProfit | currencyFormat }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Drawer-Pull Report Section -->
        <div *ngIf="activeTab === 'drawer-pull'" (click)="shifts.length === 0 ? loadShifts() : null">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Select Shift</label>
                <select
                  [(ngModel)]="selectedShiftId"
                  (focus)="loadShifts()"
                  style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;background:#fff;cursor:pointer;">
                  <option value="">-- Select a Shift --</option>
                  <option *ngFor="let shift of shifts" [value]="shift.id">
                    Shift #{{ shift.shiftNumber }} - {{ shift.cashierName || 'Unknown' }} - {{ shift.startTime | date:'short' }}
                  </option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button
                (click)="loadDrawerPullReport()"
                [disabled]="loading || !selectedShiftId"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : 'Generate Report' }}
              </button>
              <button
                *ngIf="drawerPullReport"
                (click)="exportPDF('drawer-pull')"
                style="background:#c4a75b;color:#1a1a1a;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📄 {{ 'reports.exportPDF' | translate }}
              </button>
              <button
                *ngIf="drawerPullReport"
                (click)="exportExcel('drawer-pull')"
                style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
                📊 {{ 'reports.exportExcel' | translate }}
              </button>
            </div>
          </section>

          <div *ngIf="drawerPullReport">
            <!-- Shift Info Card -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:24px;margin-bottom:24px;">
              <h3 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:600;">Shift Information</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                <div>
                  <div style="color:#666;font-size:13px;margin-bottom:4px;">Cashier</div>
                  <div style="font-weight:600;color:#333;">{{ drawerPullReport.shift.cashierName }}</div>
                </div>
                <div>
                  <div style="color:#666;font-size:13px;margin-bottom:4px;">Start Time</div>
                  <div style="font-weight:600;color:#333;">{{ drawerPullReport.shift.startTime | date:'short' }}</div>
                </div>
                <div>
                  <div style="color:#666;font-size:13px;margin-bottom:4px;">End Time</div>
                  <div style="font-weight:600;color:#333;">{{ drawerPullReport.shift.endTime ? (drawerPullReport.shift.endTime | date:'short') : 'Ongoing' }}</div>
                </div>
                <div>
                  <div style="color:#666;font-size:13px;margin-bottom:4px;">Status</div>
                  <div style="font-weight:600;color:#333;">{{ drawerPullReport.shift.status }}</div>
                </div>
              </div>
            </section>

            <!-- Cash Flow Summary Cards -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #666;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Opening Cash</div>
                <div style="font-size:32px;font-weight:700;color:#666;">{{ drawerPullReport.cashFlow.openingCash | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Cash Sales</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">{{ drawerPullReport.cashFlow.cashSales | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Expected Cash</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">{{ drawerPullReport.cashFlow.expectedCash | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #6c5ce7;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Actual Cash</div>
                <div style="font-size:32px;font-weight:700;color:#6c5ce7;">{{ drawerPullReport.cashFlow.actualCash | currencyFormat }}</div>
              </div>
              <div [style.background]="'#fff'" [style.padding]="'20px'" [style.border-radius]="'12px'" [style.box-shadow]="'0 2px 8px rgba(0,0,0,0.05)'" [style.border-left]="drawerPullReport.cashFlow.overShort === 'BALANCED' ? '4px solid #28a745' : drawerPullReport.cashFlow.overShort === 'OVER' ? '4px solid #ffc107' : '4px solid #dc3545'">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Difference</div>
                <div [style.font-size]="'32px'" [style.font-weight]="'700'" [style.color]="drawerPullReport.cashFlow.overShort === 'BALANCED' ? '#28a745' : drawerPullReport.cashFlow.overShort === 'OVER' ? '#ffc107' : '#dc3545'">
                  {{ drawerPullReport.cashFlow.difference | currencyFormat }}
                </div>
                <div [style.font-size]="'14px'" [style.font-weight]="'600'" [style.color]="drawerPullReport.cashFlow.overShort === 'BALANCED' ? '#28a745' : drawerPullReport.cashFlow.overShort === 'OVER' ? '#ffc107' : '#dc3545'">
                  {{ drawerPullReport.cashFlow.overShort }}
                </div>
              </div>
            </section>

            <!-- Sales Breakdown -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;margin-bottom:24px;">
              <div style="padding:20px 24px;border-bottom:1px solid #eee;">
                <h3 style="margin:0;color:#333;font-size:16px;font-weight:600;">Sales Breakdown</h3>
              </div>
              <div style="padding:24px;">
                <div style="display:grid;gap:16px;">
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Cash Sales:</span>
                    <span style="color:#28a745;font-weight:700;font-size:18px;">
                      {{ drawerPullReport.salesBreakdown.cashSales.count }} transactions - {{ drawerPullReport.salesBreakdown.cashSales.total | currencyFormat }}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Card Sales:</span>
                    <span style="color:#007bff;font-weight:700;font-size:18px;">
                      {{ drawerPullReport.salesBreakdown.cardSales.count }} transactions - {{ drawerPullReport.salesBreakdown.cardSales.total | currencyFormat }}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Mobile Wallet:</span>
                    <span style="color:#6c5ce7;font-weight:700;font-size:18px;">
                      {{ drawerPullReport.salesBreakdown.mobileWallet.count }} transactions - {{ drawerPullReport.salesBreakdown.mobileWallet.total | currencyFormat }}
                    </span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid #333;">
                    <span style="color:#333;font-weight:700;font-size:18px;">Total Sales:</span>
                    <span style="color:#c4a75b;font-weight:700;font-size:22px;">
                      {{ drawerPullReport.salesBreakdown.totalSales.count }} transactions - {{ drawerPullReport.salesBreakdown.totalSales.total | currencyFormat }}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Server Productivity Report Section -->
        <div *ngIf="activeTab === 'server-productivity'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input type="date" [(ngModel)]="startDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input type="date" [(ngModel)]="endDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Waiter ID (Optional)</label>
                <select [(ngModel)]="selectedWaiterId" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;background:#fff;">
                  <option value="">All Waiters</option>
                  <option *ngFor="let waiter of waiters" [value]="waiter.id">
                    {{ waiter.firstName }} {{ waiter.lastName }}
                  </option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <button (click)="loadServerProductivityReport()" [disabled]="loading" style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : 'Generate Report' }}
              </button>
              <button *ngIf="serverProductivityReport" (click)="exportPDF('server-productivity')" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export PDF
              </button>
              <button *ngIf="serverProductivityReport" (click)="exportExcel('server-productivity')" style="background:#fff;color:#2e7d32;border:1px solid #2e7d32;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export Excel
              </button>
            </div>
          </section>

          <div *ngIf="serverProductivityReport">
            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Revenue</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ serverProductivityReport.totalRevenue | currencyFormat }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #2e7d32;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Tips</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ serverProductivityReport.totalTips | currencyFormat }}</div>
              </div>
              <div *ngIf="serverProductivityReport.topPerformer" style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #6c5ce7;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Top Performer</div>
                <div style="font-size:20px;font-weight:700;color:#1a1a1a;">{{ serverProductivityReport.topPerformer.name }}</div>
                <div style="font-size:14px;color:#666;">{{ serverProductivityReport.topPerformer.totalRevenue | currencyFormat }}</div>
              </div>
            </div>

            <!-- Data Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;border-bottom:2px solid #eee;">
                  <tr>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Rank</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Waiter</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Sales Count</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Revenue</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Tips</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Avg Check</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let server of serverProductivityReport.servers" style="border-bottom:1px solid #f0f0f0;color:#333;">
                    <td style="padding:16px;font-weight:600;">#{{ server.rank }}</td>
                    <td style="padding:16px;">{{ server.name }}</td>
                    <td style="padding:16px;text-align:right;">{{ server.totalSales }}</td>
                    <td style="padding:16px;text-align:right;font-weight:600;">{{ server.totalRevenue | currencyFormat }}</td>
                    <td style="padding:16px;text-align:right;color:#2e7d32;">{{ server.totalTips | currencyFormat }}</td>
                    <td style="padding:16px;text-align:right;">{{ server.avgCheckSize | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>

        <!-- Hourly Income Report Section -->
        <div *ngIf="activeTab === 'hourly-income'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input type="date" [(ngModel)]="startDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input type="date" [(ngModel)]="endDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <button (click)="loadHourlyIncomeReport()" [disabled]="loading" style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : 'Generate Report' }}
              </button>
              <button *ngIf="hourlyIncomeReport" (click)="exportPDF('hourly-income')" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export PDF
              </button>
              <button *ngIf="hourlyIncomeReport" (click)="exportExcel('hourly-income')" style="background:#fff;color:#2e7d32;border:1px solid #2e7d32;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export Excel
              </button>
            </div>
          </section>

          <div *ngIf="hourlyIncomeReport">
            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Revenue</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ hourlyIncomeReport.totalRevenue | currencyFormat }}</div>
              </div>
              <div *ngIf="hourlyIncomeReport.peakHour" style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ff9800;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Peak Hour</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ hourlyIncomeReport.peakHour.hour }}</div>
                <div style="font-size:14px;color:#666;">{{ hourlyIncomeReport.peakHour.revenue | currencyFormat }}</div>
              </div>
            </div>

            <!-- Data Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;border-bottom:2px solid #eee;">
                  <tr>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Hour</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Sales Count</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Revenue</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Avg Check</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let hour of hourlyIncomeReport.hourlyBreakdown" style="border-bottom:1px solid #f0f0f0;color:#333;">
                    <td style="padding:16px;font-weight:600;">{{ hour.hour }}</td>
                    <td style="padding:16px;text-align:right;">{{ hour.salesCount }}</td>
                    <td style="padding:16px;text-align:right;font-weight:600;">{{ hour.revenue | currencyFormat }}</td>
                    <td style="padding:16px;text-align:right;">{{ hour.avgCheck | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>

        <!-- Card Transactions Report Section -->
        <div *ngIf="activeTab === 'card-transactions'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input type="date" [(ngModel)]="startDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input type="date" [(ngModel)]="endDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <button (click)="loadCardTransactionsReport()" [disabled]="loading" style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : 'Generate Report' }}
              </button>
              <button *ngIf="cardTransactionsReport" (click)="exportPDF('card-transactions')" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export PDF
              </button>
              <button *ngIf="cardTransactionsReport" (click)="exportExcel('card-transactions')" style="background:#fff;color:#2e7d32;border:1px solid #2e7d32;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export Excel
              </button>
            </div>
          </section>

          <div *ngIf="cardTransactionsReport">
            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Transactions</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ cardTransactionsReport.totalTransactions }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Amount</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ cardTransactionsReport.totalAmount | currencyFormat }}</div>
              </div>
            </div>

            <!-- Data Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;border-bottom:2px solid #eee;">
                  <tr>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Date</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Sale #</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Method</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Cashier</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of cardTransactionsReport.transactions" style="border-bottom:1px solid #f0f0f0;color:#333;">
                    <td style="padding:16px;">{{ tx.date | date:'short' }}</td>
                    <td style="padding:16px;">{{ tx.saleNumber }}</td>
                    <td style="padding:16px;">
                      <span [style.background]="tx.paymentMethod === 'CARD' ? '#e3f2fd' : '#f3e5f5'"
                            [style.color]="tx.paymentMethod === 'CARD' ? '#1565c0' : '#7b1fa2'"
                            style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;">
                        {{ tx.paymentMethod }}
                      </span>
                    </td>
                    <td style="padding:16px;">{{ tx.cashierName }}</td>
                    <td style="padding:16px;text-align:right;font-weight:600;">{{ tx.amount | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </div>

        <!-- Journal Report Section -->
        <div *ngIf="activeTab === 'journal'">
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:16px;align-items:end;margin-bottom:16px;">
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.startDate' | translate }}</label>
                <input type="date" [(ngModel)]="startDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
              <div style="flex:1;">
                <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">{{ 'reports.endDate' | translate }}</label>
                <input type="date" [(ngModel)]="endDate" style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <button (click)="loadJournalReport()" [disabled]="loading" style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : 'Generate Report' }}
              </button>
              <button *ngIf="journalReport" (click)="exportPDF('journal')" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export PDF
              </button>
              <button *ngIf="journalReport" (click)="exportExcel('journal')" style="background:#fff;color:#2e7d32;border:1px solid #2e7d32;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Export Excel
              </button>
            </div>
          </section>

          <div *ngIf="journalReport">
            <!-- Summary Cards -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:24px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Transactions</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ journalReport.totalTransactions }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #2d2d2d;">
                <div style="font-size:13px;color:#666;margin-bottom:8px;">Total Amount</div>
                <div style="font-size:24px;font-weight:700;color:#1a1a1a;">{{ journalReport.totalAmount | currencyFormat }}</div>
              </div>
            </div>

            <!-- Data Table -->
            <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead style="background:#f8f9fa;border-bottom:2px solid #eee;">
                  <tr>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Time</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Sale #</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Type</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Method</th>
                    <th style="padding:16px;text-align:left;font-size:13px;color:#666;">Status</th>
                    <th style="padding:16px;text-align:right;font-size:13px;color:#666;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of journalReport.transactions" style="border-bottom:1px solid #f0f0f0;color:#333;">
                    <td style="padding:16px;">{{ tx.time | date:'short' }}</td>
                    <td style="padding:16px;">{{ tx.saleNumber }}</td>
                    <td style="padding:16px;">{{ tx.orderType }}</td>
                    <td style="padding:16px;">{{ tx.paymentMethod }}</td>
                    <td style="padding:16px;">
                      <span [style.background]="tx.status === 'COMPLETED' ? '#e8f5e9' : '#ffebee'"
                            [style.color]="tx.status === 'COMPLETED' ? '#2e7d32' : '#c62828'"
                            style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;">
                        {{ tx.status }}
                      </span>
                    </td>
                    <td style="padding:16px;text-align:right;font-weight:600;">{{ tx.amount | currencyFormat }}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
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
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'drawer-pull', label: 'Drawer Pull', icon: '💵' },
    { id: 'server-productivity', label: 'Server Productivity', icon: '👤' },
    { id: 'hourly-income', label: 'Hourly Income', icon: '⏰' },
    { id: 'card-transactions', label: 'Card Transactions', icon: '💳' },
    { id: 'journal', label: 'Journal', icon: '📋' }
  ];

  activeTab = 'sales';
  loading = false;

  startDate = '';
  endDate = '';

  salesReport: SalesReportData | null = null;
  inventoryReport: InventoryReportData | null = null;
  cashierReport: CashierPerformanceData | null = null;
  financialReport: FinancialReportData | null = null;
  drawerPullReport: DrawerPullReportData | null = null;
  serverProductivityReport: ServerProductivityReportData | null = null;
  hourlyIncomeReport: HourlyIncomeReportData | null = null;
  cardTransactionsReport: CardTransactionsReportData | null = null;
  journalReport: JournalReportData | null = null;

  selectedShiftId = '';
  shifts: Shift[] = [];

  selectedWaiterId = '';
  waiters: User[] = [];

  constructor(
    private reportService: ReportService,
    private shiftService: ShiftService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.setQuickDate('today');
    this.loadWaiters();
  }

  loadWaiters() {
    this.userService.getAll().subscribe({
      next: (users) => {
        // Filter for waiters, or show all if you prefer. 
        // The user request implies they want to select a waiter.
        // Let's include waiters and maybe admins/managers who might serve?
        // For now, let's just filter by role 'WAITER' as per the plan, 
        // but maybe it's safer to show all active users or filter by roles that can be waiters.
        // The plan said "fetch waiters on init".
        this.waiters = users.filter(u => u.role === 'WAITER' && u.active);
      },
      error: (err) => console.error('Failed to load waiters', err)
    });
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
    this.reportService.getSalesReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.salesReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load sales report:', err);
        this.loading = false;
        this.salesReport = {
          totalSales: 0,
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          paymentMethods: [],
          transactions: [],
          salesByDate: [],
          topProducts: [],
          salesByCategory: []
        };
      }
    });
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
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          stockStatus: {
            inStock: 0,
            lowStock: 0,
            outOfStock: 0
          },
          byCategory: [],
          inventory: []
        };
      }
    });
  }

  loadCashierReport() {
    if (!this.startDate || !this.endDate) {
      alert('Please select date range');
      return;
    }

    this.loading = true;
    this.reportService.getCashierPerformance(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.cashierReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cashier report:', err);
        this.loading = false;
        this.cashierReport = {
          totalRevenue: 0,
          totalOrders: 0,
          activeCashiers: 0,
          averageRevenuePerCashier: 0,
          performance: []
        };
      }
    });
  }

  loadFinancialReport() {
    if (!this.startDate || !this.endDate) {
      alert('Please select date range');
      return;
    }

    this.loading = true;
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
          netProfit: 0,
          totalTax: 0,
          totalDiscount: 0,
          profitMargin: 0,
          totalTransactions: 0,
          averageTransactionValue: 0
        };
      }
    });
  }

  loadDrawerPullReport() {
    if (!this.selectedShiftId) {
      return;
    }

    this.loading = true;
    this.reportService.getDrawerPullReport(this.selectedShiftId).subscribe({
      next: (data) => {
        this.drawerPullReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load drawer-pull report:', err);
        this.loading = false;
        alert('Failed to load drawer-pull report. Please check the shift ID and try again.');
      }
    });
  }

  loadShifts() {
    this.shiftService.getAll(1, 50, 'CLOSED').subscribe({
      next: (response) => {
        this.shifts = response.data || [];
      },
      error: (err) => {
        console.error('Failed to load shifts:', err);
        this.shifts = [];
      }
    });
  }


  loadServerProductivityReport() {
    this.loading = true;
    this.reportService.getServerProductivityReport(this.startDate, this.endDate, this.selectedWaiterId).subscribe({
      next: (data) => {
        this.serverProductivityReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load server productivity report:', err);
        this.loading = false;
        alert('Failed to load report.');
      }
    });
  }

  loadHourlyIncomeReport() {
    this.loading = true;
    this.reportService.getHourlyIncomeReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.hourlyIncomeReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load hourly income report:', err);
        this.loading = false;
        alert('Failed to load report.');
      }
    });
  }

  loadCardTransactionsReport() {
    this.loading = true;
    this.reportService.getCardTransactionsReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.cardTransactionsReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load card transactions report:', err);
        this.loading = false;
        alert('Failed to load report.');
      }
    });
  }

  loadJournalReport() {
    this.loading = true;
    this.reportService.getJournalReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.journalReport = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load journal report:', err);
        this.loading = false;
        alert('Failed to load report.');
      }
    });
  }

  hasReport(): boolean {
    switch (this.activeTab) {
      case 'sales': return !!this.salesReport;
      case 'inventory': return !!this.inventoryReport;
      case 'cashier': return !!this.cashierReport;
      case 'financial': return !!this.financialReport;
      case 'drawer-pull': return !!this.drawerPullReport;
      case 'server-productivity': return !!this.serverProductivityReport;
      case 'hourly-income': return !!this.hourlyIncomeReport;
      case 'card-transactions': return !!this.cardTransactionsReport;
      case 'journal': return !!this.journalReport;
      default: return false;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusColor(status: string): { bg: string; text: string } {
    if (status === 'Out of Stock') return { bg: '#c4a75b', text: '#1a1a1a' };
    if (status === 'Low Stock') return { bg: '#a38a4a', text: '#1a1a1a' };
    return { bg: '#28a745', text: '#fff' };
  }

  exportPDF(type: string) {
    if (type === 'sales') {
      this.reportService.exportSalesReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `sales-report-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'inventory') {
      this.reportService.exportInventoryReportPDF().subscribe({
        next: (blob) => this.downloadFile(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'cashier') {
      this.reportService.exportCashierPerformancePDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `cashier-report-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'financial') {
      this.reportService.exportFinancialReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `financial-report-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'drawer-pull') {
      this.reportService.exportDrawerPullReportPDF(this.selectedShiftId).subscribe({
        next: (blob) => this.downloadFile(blob, `drawer-pull-${this.selectedShiftId}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'server-productivity') {
      this.reportService.exportServerProductivityReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `server-productivity-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'hourly-income') {
      this.reportService.exportHourlyIncomeReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `hourly-income-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'card-transactions') {
      this.reportService.exportCardTransactionsReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `card-transactions-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'journal') {
      this.reportService.exportJournalReportPDF(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `journal-${this.startDate}-${this.endDate}.pdf`),
        error: (_err) => alert('Export failed.')
      });
    } else {
      alert('Export feature coming soon for this report type.');
    }
  }

  exportExcel(type: string) {
    if (type === 'sales') {
      this.reportService.exportSalesReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `sales-report-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'inventory') {
      this.reportService.exportInventoryReportExcel().subscribe({
        next: (blob) => this.downloadFile(blob, `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'cashier') {
      this.reportService.exportCashierPerformanceExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `cashier-report-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'financial') {
      this.reportService.exportFinancialReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `financial-report-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'drawer-pull') {
      this.reportService.exportDrawerPullReportExcel(this.selectedShiftId).subscribe({
        next: (blob) => this.downloadFile(blob, `drawer-pull-${this.selectedShiftId}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'server-productivity') {
      this.reportService.exportServerProductivityReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `server-productivity-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'hourly-income') {
      this.reportService.exportHourlyIncomeReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `hourly-income-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'card-transactions') {
      this.reportService.exportCardTransactionsReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `card-transactions-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
      });
    } else if (type === 'journal') {
      this.reportService.exportJournalReportExcel(this.startDate, this.endDate).subscribe({
        next: (blob) => this.downloadFile(blob, `journal-${this.startDate}-${this.endDate}.xlsx`),
        error: (_err) => alert('Export failed.')
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
