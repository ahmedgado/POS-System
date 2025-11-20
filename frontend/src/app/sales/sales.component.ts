import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SaleService, Sale } from '../services/sale.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div style="min-height:100vh;background:#f8f6f4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:24px 40px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">📊 {{ 'sales.title' | translate }}</h1>
          <button
            (click)="exportToExcel()"
            style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:12px 24px;border-radius:10px;font-weight:600;cursor:pointer;font-size:14px;box-shadow:0 4px 12px rgba(212,175,55,0.3);transition:all 0.2s;"
            (mouseenter)="$event.target.style.transform='translateY(-2px)';$event.target.style.boxShadow='0 6px 16px rgba(212,175,55,0.4)'"
            (mouseleave)="$event.target.style.transform='translateY(0)';$event.target.style.boxShadow='0 4px 12px rgba(212,175,55,0.3)'">
            📥 {{ 'common.export' | translate }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Filters -->
        <section style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <h2 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">{{ 'common.filter' | translate }}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
            <!-- Date From -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">{{ 'reports.startDate' | translate }}</label>
              <input
                type="date"
                [(ngModel)]="filterDateFrom"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
              />
            </div>

            <!-- Date To -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">{{ 'reports.endDate' | translate }}</label>
              <input
                type="date"
                [(ngModel)]="filterDateTo"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
              />
            </div>

            <!-- Payment Method -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">{{ 'sales.paymentMethod' | translate }}</label>
              <select
                [(ngModel)]="filterPaymentMethod"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                <option value="">{{ 'common.all' | translate }}</option>
                <option value="CASH">{{ 'pos.cash' | translate }}</option>
                <option value="CARD">{{ 'pos.card' | translate }}</option>
                <option value="MOBILE">{{ 'pos.mobile' | translate }}</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">{{ 'sales.status' | translate }}</label>
              <select
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                <option value="">{{ 'common.all' | translate }}</option>
                <option value="COMPLETED">{{ 'sales.completed' | translate }}</option>
                <option value="REFUNDED">{{ 'sales.refunded' | translate }}</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            (click)="clearFilters()"
            style="margin-top:16px;background:#f8f9fa;color:#666;border:1px solid #ddd;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">
            {{ 'common.filter' | translate }}
          </button>
        </section>

        <!-- Statistics Cards -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #d4af37;">
            <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">{{ 'sales.totalSales' | translate }}</div>
            <div style="font-size:36px;font-weight:700;color:#d4af37;">{{ filteredSales.length }}</div>
          </div>

          <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #2d2d2d;">
            <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">{{ 'sales.totalRevenue' | translate }}</div>
            <div style="font-size:36px;font-weight:700;color:#2d2d2d;">{{ getTotalRevenue() | currencyFormat }}</div>
          </div>

          <div style="background:#ffffff;padding:28px;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border-left:5px solid #c19a2e;">
            <div style="color:#8b7355;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">{{ 'sales.averageOrder' | translate }}</div>
            <div style="font-size:36px;font-weight:700;color:#c19a2e;">{{ getAverageOrderValue() | currencyFormat }}</div>
          </div>
        </section>

        <!-- Sales Table -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#333;font-size:16px;font-weight:600;">{{ 'sales.title' | translate }}</h2>
          </div>

          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">
            {{ 'common.loading' | translate }}
          </div>

          <div *ngIf="!loading && filteredSales.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">📋</div>
            <div style="font-size:16px;">{{ 'common.noData' | translate }}</div>
          </div>

          <div *ngIf="!loading && filteredSales.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:linear-gradient(135deg, #f8f6f4 0%, #faf9f7 100%);border-bottom:2px solid #d4af37;">
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">#</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.saleId' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.date' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.cashier' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Order Type</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.items' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.paymentMethod' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'pos.total' | translate }}</th>
                  <th style="padding:18px 24px;text-align:left;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.status' | translate }}</th>
                  <th style="padding:18px 24px;text-align:center;font-size:12px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">{{ 'sales.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let sale of filteredSales; let i = index"
                  style="border-bottom:1px solid #f0f0f0;transition:background 0.2s;"
                  (mouseenter)="$event.currentTarget.style.background='#f8f9fa'"
                  (mouseleave)="$event.currentTarget.style.background='#fff'">
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ i + 1 }}</td>
                  <td style="padding:16px 24px;color:#333;font-weight:600;font-size:14px;">#{{ sale.id }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ formatDate(sale.createdAt) }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ getCashierName(sale) }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">
                    <span *ngIf="sale.orderType" [style.background]="getOrderTypeColor(sale.orderType)"
                          style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;color:#fff;">
                      {{ sale.orderType }}
                    </span>
                    <span *ngIf="!sale.orderType" style="color:#999;">-</span>
                  </td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ getTotalItems(sale) }}</td>
                  <td style="padding:16px 24px;">
                    <span [style.background]="getPaymentMethodColor(sale.paymentMethod)"
                          style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ sale.paymentMethod }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;color:#DC3545;font-weight:700;font-size:16px;">{{ sale.totalAmount | currencyFormat }}</td>
                  <td style="padding:16px 24px;">
                    <span [style.background]="getStatusColor(sale.status)"
                          style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ sale.status }}
                    </span>
                  </td>
                  <td style="padding:18px 24px;text-align:center;">
                    <button
                      (click)="viewDetails(sale)"
                      style="background:linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);color:#d4af37;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;margin-right:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:all 0.2s;"
                      (mouseenter)="$event.target.style.transform='translateY(-1px)';$event.target.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'"
                      (mouseleave)="$event.target.style.transform='translateY(0)';$event.target.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'">
                      View
                    </button>
                    <button
                      (click)="printReceipt(sale)"
                      style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(212,175,55,0.3);transition:all 0.2s;"
                      (mouseenter)="$event.target.style.transform='translateY(-1px)';$event.target.style.boxShadow='0 4px 12px rgba(212,175,55,0.4)'"
                      (mouseleave)="$event.target.style.transform='translateY(0)';$event.target.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                      Print
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <!-- Sale Details Modal -->
    <div *ngIf="selectedSale"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="closeDetails()">
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div style="padding:24px;border-bottom:2px solid #DC3545;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">{{ 'sales.saleId' | translate }} #{{ selectedSale.id }}</h2>
            <button
              (click)="closeDetails()"
              style="background:none;border:none;font-size:28px;color:#999;cursor:pointer;line-height:1;padding:0;width:32px;height:32px;">
              ×
            </button>
          </div>
          <div style="color:#666;font-size:14px;margin-top:8px;">{{ formatDate(selectedSale.createdAt) }}</div>
        </div>

        <!-- Modal Content -->
        <div style="padding:24px;">
          <!-- Sale Info -->
          <div style="margin-bottom:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'sales.cashier' | translate }}</div>
                <div style="color:#333;font-weight:600;">{{ getCashierName(selectedSale) }}</div>
              </div>
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'sales.paymentMethod' | translate }}</div>
                <div style="color:#333;font-weight:600;">{{ selectedSale.paymentMethod }}</div>
              </div>
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'sales.status' | translate }}</div>
                <span [style.background]="getStatusColor(selectedSale.status)"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                  {{ selectedSale.status }}
                </span>
              </div>
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Order Type</div>
                <span *ngIf="selectedSale.orderType" [style.background]="getOrderTypeColor(selectedSale.orderType)"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                  {{ selectedSale.orderType }}
                </span>
                <span *ngIf="!selectedSale.orderType" style="color:#999;">-</span>
              </div>
              <div *ngIf="selectedSale.table">
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Table</div>
                <div style="color:#d4af37;font-weight:600;">
                  {{ selectedSale.table.floor?.name }} - {{ selectedSale.table.tableNumber }}
                </div>
              </div>
              <div *ngIf="selectedSale.waiter">
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Waiter</div>
                <div style="color:#333;font-weight:600;">
                  {{ selectedSale.waiter.firstName }} {{ selectedSale.waiter.lastName }}
                </div>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">{{ 'sales.items' | translate }}</h3>
            <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              <div *ngFor="let item of selectedSale.items" style="padding:16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ item.product?.name || 'Unknown Product' }}</div>
                  <div style="color:#666;font-size:13px;">{{ item.quantity }} × {{ item.unitPrice | currencyFormat }}</div>
                </div>
                <div style="font-weight:700;color:#DC3545;">{{ item.totalPrice | currencyFormat }}</div>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">{{ 'pos.subtotal' | translate }}:</span>
              <span style="font-weight:600;color:#333;">{{ selectedSale.subtotal | currencyFormat }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">{{ 'pos.tax' | translate }}:</span>
              <span style="font-weight:600;color:#333;">{{ selectedSale.taxAmount | currencyFormat }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">{{ 'pos.discount' | translate }}:</span>
              <span style="font-weight:600;color:#333;">{{ selectedSale.discountAmount | currencyFormat }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #DC3545;margin-top:12px;">
              <span style="font-size:18px;font-weight:700;color:#333;">{{ 'pos.total' | translate }}:</span>
              <span style="font-size:24px;font-weight:700;color:#DC3545;">{{ selectedSale.totalAmount | currencyFormat }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding:20px 24px;border-top:1px solid #eee;display:flex;gap:12px;">
          <button
            (click)="printReceipt(selectedSale)"
            style="flex:1;background:#DC3545;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            {{ 'sales.actions' | translate }}
          </button>
          <button
            (click)="closeDetails()"
            style="flex:1;background:#fff;color:#666;border:1px solid #ddd;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            {{ 'common.close' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  loading = false;

  filterDateFrom = '';
  filterDateTo = '';
  filterPaymentMethod = '';
  filterStatus = '';

  selectedSale: Sale | null = null;

  constructor(private saleService: SaleService) {}

  ngOnInit() {
    this.loadSales();
  }

  loadSales() {
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.filteredSales = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load sales:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredSales = this.sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const dateFrom = this.filterDateFrom ? new Date(this.filterDateFrom) : null;
      const dateTo = this.filterDateTo ? new Date(this.filterDateTo + 'T23:59:59') : null;

      const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
      const matchesDateTo = !dateTo || saleDate <= dateTo;
      const matchesPayment = !this.filterPaymentMethod || sale.paymentMethod === this.filterPaymentMethod;
      const matchesStatus = !this.filterStatus || sale.status === this.filterStatus;

      return matchesDateFrom && matchesDateTo && matchesPayment && matchesStatus;
    });
  }

  clearFilters() {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterPaymentMethod = '';
    this.filterStatus = '';
    this.filteredSales = this.sales;
  }

  getTotalRevenue(): number {
    return this.filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }

  getAverageOrderValue(): number {
    if (this.filteredSales.length === 0) return 0;
    return this.getTotalRevenue() / this.filteredSales.length;
  }

  getTotalItems(sale: Sale): number {
    return sale.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCashierName(sale: Sale): string {
    return `${sale.cashier.firstName} ${sale.cashier.lastName}`;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return '-';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }

// Format: DD/MM/YYYY, HH:MM AM/PM
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  }

  getPaymentMethodColor(method: string): string {
    switch (method) {
      case 'CASH': return '#28a745';
      case 'CARD': return '#007bff';
      case 'MOBILE': return '#6f42c1';
      default: return '#6c757d';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'REFUNDED': return '#ffc107';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getOrderTypeColor(orderType: string): string {
    switch (orderType) {
      case 'DINE_IN': return '#d4af37';
      case 'TAKEAWAY': return '#5a7a9b';
      case 'DELIVERY': return '#c19a2e';
      case 'DRIVE_THRU': return '#8e44ad';
      default: return '#6c757d';
    }
  }

  viewDetails(sale: Sale) {
    this.selectedSale = sale;
  }

  closeDetails() {
    this.selectedSale = null;
  }

  printReceipt(sale: Sale) {
    const tableInfo = sale.table
      ? `<div style="margin-bottom:8px;"><strong>Table:</strong> ${sale.table.floor?.name} - ${sale.table.tableNumber}</div>`
      : '';

    const orderTypeLabel = sale.orderType || 'N/A';
    const waiterInfo = sale.waiter
      ? `<div style="margin-bottom:8px;"><strong>Waiter:</strong> ${sale.waiter.firstName} ${sale.waiter.lastName}</div>`
      : '';

    const itemsHtml = sale.items.map(item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.product?.name || 'Unknown'}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${item.unitPrice.toFixed(2)} EGP</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${item.totalPrice.toFixed(2)} EGP</td>
      </tr>
    `).join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt #${sale.saleNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #d4af37;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #666;
            font-size: 12px;
          }
          .info-section {
            margin-bottom: 20px;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
          }
          .order-type {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 11px;
            color: #fff;
            background: #5a7a9b;
          }
          table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 8px 0;
            border-bottom: 2px solid #d4af37;
            color: #333;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
          td {
            font-size: 13px;
            color: #333;
          }
          .totals {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 2px solid #eee;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .grand-total {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #d4af37;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 700;
            color: #d4af37;
          }
          .footer {
            text-align: center;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ST. REGIS POS</div>
          <div class="subtitle">The St. Regis New Capital</div>
        </div>

        <div class="info-section">
          <div style="margin-bottom:8px;"><strong>Receipt #:</strong> ${sale.saleNumber}</div>
          <div style="margin-bottom:8px;"><strong>Date:</strong> ${this.formatDate(sale.createdAt)}</div>
          <div style="margin-bottom:8px;"><strong>Cashier:</strong> ${this.getCashierName(sale)}</div>
          ${tableInfo}
          ${waiterInfo}
          <div style="margin-bottom:8px;">
            <strong>Order Type:</strong>
            <span class="order-type" style="background:${this.getOrderTypeColor(orderTypeLabel)};">${orderTypeLabel}</span>
          </div>
          ${sale.customer ? `<div style="margin-bottom:8px;"><strong>Customer:</strong> ${sale.customer.firstName} ${sale.customer.lastName}</div>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${sale.subtotal.toFixed(2)} EGP</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>${sale.taxAmount.toFixed(2)} EGP</span>
          </div>
          ${sale.discountAmount > 0 ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-${sale.discountAmount.toFixed(2)} EGP</span>
          </div>
          ` : ''}
          <div class="grand-total">
            <span>TOTAL:</span>
            <span>${sale.totalAmount.toFixed(2)} EGP</span>
          </div>
          <div class="total-row" style="margin-top:12px;">
            <span>Payment Method:</span>
            <span style="font-weight:600;">${sale.paymentMethod}</span>
          </div>
        </div>

        <div class="footer">
          <div>Thank you for your visit!</div>
          <div style="margin-top:8px;">www.thestregisnewcapital.com</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  exportToExcel() {
    alert('Export to Excel functionality coming soon!');
    // TODO: Implement Excel export
  }
}
