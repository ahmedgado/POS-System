import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer, CustomerService } from '../services/customer.service';
import { PaginationComponent } from '../components/pagination.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">👥 Customers</h1>
          <button
            (click)="openAddModal()"
            style="background:#fff;color:#DC3545;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            ➕ Add Customer
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Search Bar -->
        <section style="background:#fff;padding:20px 24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilter()"
            placeholder="Search by name, phone, or email..."
            style="width:100%;padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
            [style.border-color]="searchTerm ? '#DC3545' : '#ddd'"
          />
        </section>

        <!-- Statistics -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Customers</div>
            <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ customers.length }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Active Customers</div>
            <div style="font-size:32px;font-weight:700;color:#28a745;">{{ getActiveCount() }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Loyalty Points</div>
            <div style="font-size:32px;font-weight:700;color:#007bff;">{{ getTotalLoyaltyPoints() }}</div>
          </div>
        </section>

        <!-- Customers Table -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#333;font-size:16px;font-weight:600;">Customers List</h2>
          </div>

          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">
            Loading customers...
          </div>

          <div *ngIf="!loading && filteredCustomers.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">👥</div>
            <div style="font-size:16px;">No customers found</div>
          </div>

          <div *ngIf="!loading && filteredCustomers.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">#</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Name</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Phone</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Email</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">City</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Loyalty Points</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Total Purchases</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
                  <th style="padding:16px 24px;text-align:center;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.5px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let customer of filteredCustomers; let i = index"
                  style="border-bottom:1px solid #f0f0f0;transition:background 0.2s;"
                  (mouseenter)="$event.currentTarget.style.background='#f8f9fa'"
                  (mouseleave)="$event.currentTarget.style.background='#fff'">
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                  <td style="padding:16px 24px;color:#333;font-weight:600;font-size:14px;">{{ customer.name }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ customer.phone }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ customer.email || '-' }}</td>
                  <td style="padding:16px 24px;color:#666;font-size:14px;">{{ customer.city || '-' }}</td>
                  <td style="padding:16px 24px;color:#007bff;font-weight:700;font-size:14px;">{{ customer.loyaltyPoints || 0 }}</td>
                  <td style="padding:16px 24px;color:#28a745;font-weight:700;font-size:14px;">\${{ (customer.totalPurchases || 0).toFixed(2) }}</td>
                  <td style="padding:16px 24px;">
                    <span
                      [style.background]="customer.active ? '#28a745' : '#dc3545'"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ customer.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;text-align:center;">
                    <button
                      (click)="viewDetails(customer)"
                      style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-right:8px;">
                      👁️ View
                    </button>
                    <button
                      (click)="openEditModal(customer)"
                      style="background:#ffc107;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-right:8px;">
                      ✏️ Edit
                    </button>
                    <button
                      (click)="deleteCustomer(customer.id)"
                      style="background:#dc3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <app-pagination
            *ngIf="!loading && filteredCustomers.length > 0"
            [currentPage]="currentPage"
            [pageSize]="pageSize"
            [totalCount]="totalCount"
            [totalPages]="totalPages"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
        </section>
      </main>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="closeModal()">
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div style="padding:24px;border-bottom:2px solid #DC3545;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">
              {{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}
            </h2>
            <button
              (click)="closeModal()"
              style="background:none;border:none;font-size:28px;color:#999;cursor:pointer;line-height:1;padding:0;width:32px;height:32px;">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div style="padding:24px;">
          <form (submit)="saveCustomer(); $event.preventDefault()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div style="grid-column:1/-1;">
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                  Customer Name <span style="color:#dc3545;">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="formCustomer.name"
                  name="name"
                  placeholder="Enter customer name"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                />
              </div>

              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                  Phone <span style="color:#dc3545;">*</span>
                </label>
                <input
                  type="tel"
                  [(ngModel)]="formCustomer.phone"
                  name="phone"
                  placeholder="e.g., +20 123 456 7890"
                  required
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                />
              </div>

              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                  Email
                </label>
                <input
                  type="email"
                  [(ngModel)]="formCustomer.email"
                  name="email"
                  placeholder="customer@email.com"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                />
              </div>

              <div>
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                  City
                </label>
                <input
                  type="text"
                  [(ngModel)]="formCustomer.city"
                  name="city"
                  placeholder="Enter city"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                />
              </div>

              <div style="grid-column:1/-1;">
                <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                  Address
                </label>
                <textarea
                  [(ngModel)]="formCustomer.address"
                  name="address"
                  placeholder="Enter full address"
                  rows="3"
                  style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;resize:vertical;"
                ></textarea>
              </div>
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:flex;align-items:center;cursor:pointer;">
                <input
                  type="checkbox"
                  [(ngModel)]="formCustomer.active"
                  name="active"
                  style="width:20px;height:20px;cursor:pointer;margin-right:12px;"
                />
                <span style="font-size:14px;font-weight:600;color:#333;">Active Customer</span>
              </label>
            </div>

            <div style="display:flex;gap:12px;">
              <button
                type="submit"
                [disabled]="!formCustomer.name || !formCustomer.phone || saving"
                style="flex:1;background:#DC3545;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;"
                [style.opacity]="!formCustomer.name || !formCustomer.phone || saving ? '0.5' : '1'"
                [style.cursor]="!formCustomer.name || !formCustomer.phone || saving ? 'not-allowed' : 'pointer'">
                {{ saving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create') }}
              </button>
              <button
                type="button"
                (click)="closeModal()"
                style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Customer Details Modal -->
    <div *ngIf="selectedCustomer"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="closeDetails()">
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div style="padding:24px;border-bottom:2px solid #DC3545;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">{{ selectedCustomer.name }}</h2>
            <button
              (click)="closeDetails()"
              style="background:none;border:none;font-size:28px;color:#999;cursor:pointer;line-height:1;padding:0;width:32px;height:32px;">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">Phone</div>
              <div style="color:#333;font-weight:600;">{{ selectedCustomer.phone }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">Email</div>
              <div style="color:#333;font-weight:600;">{{ selectedCustomer.email || '-' }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">City</div>
              <div style="color:#333;font-weight:600;">{{ selectedCustomer.city || '-' }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">Status</div>
              <span
                [style.background]="selectedCustomer.active ? '#28a745' : '#dc3545'"
                style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                {{ selectedCustomer.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div style="grid-column:1/-1;">
              <div style="color:#666;font-size:13px;margin-bottom:4px;">Address</div>
              <div style="color:#333;font-weight:600;">{{ selectedCustomer.address || '-' }}</div>
            </div>
          </div>

          <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Loyalty Points</div>
                <div style="font-size:32px;font-weight:700;color:#007bff;">{{ selectedCustomer.loyaltyPoints || 0 }}</div>
              </div>
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Purchases</div>
                <div style="font-size:32px;font-weight:700;color:#28a745;">\${{ (selectedCustomer.totalPurchases || 0).toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <div *ngIf="selectedCustomer.lastPurchaseDate" style="color:#666;font-size:14px;text-align:center;">
            Last purchase: {{ formatDate(selectedCustomer.lastPurchaseDate) }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding:20px 24px;border-top:1px solid #eee;">
          <button
            (click)="closeDetails()"
            style="width:100%;background:#DC3545;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  saving = false;

  searchTerm = '';
  private searchTimeout: any;

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 1;

  showModal = false;
  editingCustomer: Customer | null = null;
  selectedCustomer: Customer | null = null;

  formCustomer: Partial<Customer> = {
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    active: true
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getAll(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.filteredCustomers = response.data;
        this.totalCount = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadCustomers();
    }, 500);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCustomers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadCustomers();
  }

  getActiveCount(): number {
    return this.customers.filter(c => c.active).length;
  }

  getTotalLoyaltyPoints(): number {
    return this.customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  }

  openAddModal() {
    this.editingCustomer = null;
    this.formCustomer = {
      name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(customer: Customer) {
    this.editingCustomer = customer;
    this.formCustomer = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      address: customer.address,
      active: customer.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCustomer = null;
    this.formCustomer = {
      name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      active: true
    };
  }

  saveCustomer() {
    if (!this.formCustomer.name || !this.formCustomer.phone) return;

    this.saving = true;
    const operation = this.editingCustomer
      ? this.customerService.update(this.editingCustomer.id.toString(), this.formCustomer)
      : this.customerService.create(this.formCustomer);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadCustomers();
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to save customer:', err);
        alert('Failed to save customer. Please try again.');
      }
    });
  }

  deleteCustomer(id: number) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    this.customerService.delete(id.toString()).subscribe({
      next: () => {
        this.loadCustomers();
      },
      error: (err) => {
        console.error('Failed to delete customer:', err);
        alert('Failed to delete customer. Please try again.');
      }
    });
  }

  viewDetails(customer: Customer) {
    this.selectedCustomer = customer;
  }

  closeDetails() {
    this.selectedCustomer = null;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
