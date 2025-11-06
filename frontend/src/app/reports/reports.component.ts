import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportService, SalesReportData, InventoryReportData, CashierPerformanceData, FinancialReportData } from '../services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <h1 style="margin:0;font-size:24px;font-weight:700;">📈 {{ 'reports.title' | translate }}</h1>
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
              style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
            </button>
            <button
              (click)="setQuickDate('today')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.today' | translate }}
            </button>
            <button
              (click)="setQuickDate('week')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.thisWeek' | translate }}
            </button>
            <button
              (click)="setQuickDate('month')"
              style="background:#fff;color:#DC3545;border:2px solid #DC3545;padding:12px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
              {{ 'reports.thisMonth' | translate }}
            </button>
          </div>
        </section>

        <!-- Sales Report Tab -->
        <div *ngIf="activeTab === 'sales' && salesReport">
          <!-- Summary Cards -->
          <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalSales' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ salesReport.totalSales }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalRevenue' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ salesReport.totalRevenue.toFixed(2) }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.totalOrders' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#007bff;">{{ salesReport.totalOrders }}</div>
            </div>
            <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
              <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'reports.avgOrderValue' | translate }}</div>
              <div style="font-size:32px;font-weight:700;color:#ffc107;">\${{ salesReport.averageOrderValue.toFixed(2) }}</div>
            </div>
          </section>

          <!-- Export Buttons -->
          <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:20px 24px;margin-bottom:24px;">
            <div style="display:flex;gap:12px;">
              <button
                (click)="exportPDF('sales')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
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
                <div style="font-size:24px;font-weight:700;color:#DC3545;">\${{ pm.total.toFixed(2) }}</div>
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
                        <span style="color:#999;"> (\${{ item.price.toFixed(2) }})</span>
                      </div>
                    </td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#666;">\${{ txn.subtotal.toFixed(2) }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#DC3545;">\${{ txn.discount.toFixed(2) }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:600;color:#856404;">\${{ txn.tax.toFixed(2) }}</td>
                    <td style="padding:12px 16px;text-align:right;font-weight:700;font-size:14px;color:#28a745;">\${{ txn.total.toFixed(2) }}</td>
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
                    <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ product.revenue.toFixed(2) }}</td>
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
                    <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ cat.revenue.toFixed(2) }}</td>
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
              style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;margin-right:12px;">
              {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
            </button>
            <button
              *ngIf="inventoryReport"
              (click)="exportPDF('inventory')"
              style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;margin-right:12px;">
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
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Products</div>
                <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ inventoryReport.totalProducts }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Stock Value</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ inventoryReport.totalValue.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Low Stock Items</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ inventoryReport.lowStockCount }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Out of Stock</div>
                <div style="font-size:32px;font-weight:700;color:#dc3545;">{{ inventoryReport.outOfStockCount }}</div>
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
                  <div style="font-size:28px;font-weight:700;color:#dc3545;margin-bottom:4px;">{{ inventoryReport.stockStatus.outOfStock }}</div>
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
                      <td style="padding:12px 16px;text-align:right;color:#DC3545;font-weight:600;">{{ cat.count }}</td>
                      <td style="padding:12px 16px;text-align:right;color:#007bff;font-weight:600;">{{ cat.stock }}</td>
                      <td style="padding:12px 16px;text-align:right;color:#28a745;font-weight:600;">\${{ cat.value.toFixed(2) }}</td>
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
                      <td style="padding:12px 24px;text-align:right;font-weight:600;" [style.color]="item.stock <= item.lowStockAlert ? '#dc3545' : '#28a745'">
                        {{ item.stock }}
                      </td>
                      <td style="padding:12px 24px;text-align:right;color:#666;">{{ item.lowStockAlert }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#007bff;">\${{ item.price.toFixed(2) }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#666;">\${{ item.cost.toFixed(2) }}</td>
                      <td style="padding:12px 24px;text-align:right;font-weight:600;color:#28a745;">\${{ item.value.toFixed(2) }}</td>
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
                style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
              </button>
              <button
                *ngIf="cashierReport"
                (click)="exportPDF('cashier')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
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
                <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ cashierReport.totalRevenue.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Orders</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">{{ cashierReport.totalOrders }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Active Cashiers</div>
                <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ cashierReport.activeCashiers }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Avg Revenue/Cashier</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">\${{ cashierReport.averageRevenuePerCashier.toFixed(2) }}</div>
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
                      <td style="padding:12px 24px;text-align:right;color:#DC3545;font-weight:600;">{{ perf.totalSales }}</td>
                      <td style="padding:12px 24px;text-align:right;color:#28a745;font-weight:600;">\${{ perf.totalRevenue.toFixed(2) }}</td>
                      <td style="padding:12px 24px;text-align:right;color:#007bff;font-weight:600;">\${{ perf.averageOrderValue.toFixed(2) }}</td>
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
                style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ loading ? ('common.loading' | translate) : ('reports.generateReport' | translate) }}
              </button>
              <button
                *ngIf="financialReport"
                (click)="exportPDF('financial')"
                style="background:#dc3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
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
                <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ financialReport.totalRevenue.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Cost</div>
                <div style="font-size:32px;font-weight:700;color:#dc3545;">\${{ financialReport.totalCost.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Gross Profit</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">\${{ financialReport.grossProfit.toFixed(2) }}</div>
                <div style="font-size:13px;color:#666;">{{ financialReport.profitMargin.toFixed(1) }}% margin</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #6c5ce7;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Net Profit</div>
                <div style="font-size:32px;font-weight:700;color:#6c5ce7;">\${{ financialReport.netProfit.toFixed(2) }}</div>
              </div>
            </section>

            <!-- Additional Metrics -->
            <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Tax</div>
                <div style="font-size:32px;font-weight:700;color:#ffc107;">\${{ financialReport.totalTax.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #e74c3c;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Discount</div>
                <div style="font-size:32px;font-weight:700;color:#e74c3c;">\${{ financialReport.totalDiscount.toFixed(2) }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #3498db;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Transactions</div>
                <div style="font-size:32px;font-weight:700;color:#3498db;">{{ financialReport.totalTransactions }}</div>
              </div>
              <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #9b59b6;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Avg Transaction Value</div>
                <div style="font-size:32px;font-weight:700;color:#9b59b6;">\${{ financialReport.averageTransactionValue.toFixed(2) }}</div>
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
                    <span style="color:#28a745;font-weight:700;font-size:18px;">\${{ financialReport.totalRevenue.toFixed(2) }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Cost of Goods:</span>
                    <span style="color:#dc3545;font-weight:700;font-size:18px;">-\${{ financialReport.totalCost.toFixed(2) }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid #333;">
                    <span style="color:#333;font-weight:700;">Gross Profit:</span>
                    <span style="color:#007bff;font-weight:700;font-size:18px;">\${{ financialReport.grossProfit.toFixed(2) }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="color:#666;font-weight:600;">Tax Collected:</span>
                    <span style="color:#ffc107;font-weight:700;font-size:18px;">-\${{ financialReport.totalTax.toFixed(2) }}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid #333;">
                    <span style="color:#333;font-weight:700;font-size:18px;">Net Profit:</span>
                    <span style="color:#6c5ce7;font-weight:700;font-size:22px;">\${{ financialReport.netProfit.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
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

  hasReport(): boolean {
    switch (this.activeTab) {
      case 'sales': return !!this.salesReport;
      case 'inventory': return !!this.inventoryReport;
      case 'cashier': return !!this.cashierReport;
      case 'financial': return !!this.financialReport;
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
    if (status === 'Out of Stock') return { bg: '#ffe0e0', text: '#dc3545' };
    if (status === 'Low Stock') return { bg: '#fff3cd', text: '#856404' };
    return { bg: '#d4edda', text: '#155724' };
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
