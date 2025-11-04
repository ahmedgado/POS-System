import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaleService, Sale } from '../services/sale.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">📊 Sales History</h1>
          <button
            (click)="exportToExcel()"
            style="background:#fff;color:#DC3545;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            📥 Export to Excel
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Filters -->
        <section style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <h2 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Filters</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
            <!-- Date From -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">From Date</label>
              <input
                type="date"
                [(ngModel)]="filterDateFrom"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
              />
            </div>

            <!-- Date To -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">To Date</label>
              <input
                type="date"
                [(ngModel)]="filterDateTo"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"
              />
            </div>

            <!-- Payment Method -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">Payment Method</label>
              <select
                [(ngModel)]="filterPaymentMethod"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                <option value="">All</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label style="display:block;font-size:13px;color:#666;font-weight:600;margin-bottom:6px;">Status</label>
              <select
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
                <option value="">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            (click)="clearFilters()"
            style="margin-top:16px;background:#f8f9fa;color:#666;border:1px solid #ddd;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;">
            Clear Filters
          </button>
        </section>

        <!-- Statistics Cards -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Sales</div>
            <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ filteredSales.length }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Revenue</div>
            <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ getTotalRevenue().toFixed(2) }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Avg Order Value</div>
            <div style="font-size:32px;font-weight:700;color:#007bff;">\${{ getAverageOrderValue().toFixed(2) }}</div>
          </div>
        </section>

        <!-- Sales Table -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#333;font-size:16px;font-weight:600;">Sales List</h2>
          </div>

          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">
            Loading sales...
          </div>

          <div *ngIf="!loading && filteredSales.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">📋</div>
            <div style="font-size:16px;">No sales found</div>
          </div>

          <div *ngIf="!loading && filteredSales.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">#</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Order ID</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Date & Time</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Cashier</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Items</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Payment</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                  <th style="padding:16px 24px;text-align:center;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Actions</th>
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
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ getTotalItems(sale) }}</td>
                  <td style="padding:16px 24px;">
                    <span [style.background]="getPaymentMethodColor(sale.paymentMethod)"
                          style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ sale.paymentMethod }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;color:#DC3545;font-weight:700;font-size:16px;">\${{ sale.totalAmount.toFixed(2) }}</td>
                  <td style="padding:16px 24px;">
                    <span [style.background]="getStatusColor(sale.status)"
                          style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ sale.status }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;text-align:center;">
                    <button
                      (click)="viewDetails(sale)"
                      style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-right:8px;">
                      View
                    </button>
                    <button
                      (click)="printReceipt(sale)"
                      style="background:#28a745;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
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
            <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">Order #{{ selectedSale.id }}</h2>
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
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Cashier</div>
                <div style="color:#333;font-weight:600;">{{ getCashierName(selectedSale) }}</div>
              </div>
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Payment Method</div>
                <div style="color:#333;font-weight:600;">{{ selectedSale.paymentMethod }}</div>
              </div>
              <div>
                <div style="color:#666;font-size:13px;margin-bottom:4px;">Status</div>
                <span [style.background]="getStatusColor(selectedSale.status)"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                  {{ selectedSale.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 16px 0;color:#333;font-size:16px;font-weight:600;">Items</h3>
            <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              <div *ngFor="let item of selectedSale.items" style="padding:16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ item.product?.name || 'Unknown Product' }}</div>
                  <div style="color:#666;font-size:13px;">{{ item.quantity }} × \${{ item.unitPrice.toFixed(2) }}</div>
                </div>
                <div style="font-weight:700;color:#DC3545;">\${{ item.totalPrice.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div style="background:#f8f9fa;padding:20px;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">Subtotal:</span>
              <span style="font-weight:600;color:#333;">\${{ selectedSale.subtotal.toFixed(2) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">Tax:</span>
              <span style="font-weight:600;color:#333;">\${{ selectedSale.taxAmount.toFixed(2) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="color:#666;">Discount:</span>
              <span style="font-weight:600;color:#333;">\${{ selectedSale.discountAmount.toFixed(2) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #DC3545;margin-top:12px;">
              <span style="font-size:18px;font-weight:700;color:#333;">Total:</span>
              <span style="font-size:24px;font-weight:700;color:#DC3545;">\${{ selectedSale.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding:20px 24px;border-top:1px solid #eee;display:flex;gap:12px;">
          <button
            (click)="printReceipt(selectedSale)"
            style="flex:1;background:#DC3545;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            Print Receipt
          </button>
          <button
            (click)="closeDetails()"
            style="flex:1;background:#fff;color:#666;border:1px solid #ddd;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            Close
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  viewDetails(sale: Sale) {
    this.selectedSale = sale;
  }

  closeDetails() {
    this.selectedSale = null;
  }

  printReceipt(sale: Sale) {
    alert('Print receipt for Order #' + sale.id);
    // TODO: Implement receipt printing
  }

  exportToExcel() {
    alert('Export to Excel functionality coming soon!');
    // TODO: Implement Excel export
  }
}
