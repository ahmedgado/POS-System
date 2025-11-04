import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;max-width:1400px;margin:0 auto;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">📦 Products Management</h1>
          <button (click)="openAddModal()" style="background:#fff;color:#DC3545;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">+</span> Add Product
          </button>
        </div>
      </header>

      <!-- Search & Filter Bar -->
      <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:16px 32px;">
        <div style="max-width:1400px;margin:0 auto;display:flex;gap:12px;align-items:center;">
          <input
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            placeholder="🔍 Search products by name, SKU, or barcode..."
            style="flex:1;padding:10px 16px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
          <select [(ngModel)]="filterCategory" (change)="onSearch()" style="padding:10px 16px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Food">Food & Beverages</option>
            <option value="Home">Home & Garden</option>
            <option value="Beauty">Beauty & Health</option>
          </select>
          <button (click)="fetch()" style="background:#DC3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">Refresh</button>
        </div>
      </div>

      <!-- Main Content -->
      <main style="padding:32px;max-width:1400px;margin:0 auto;">
        <!-- Loading State -->
        <div *ngIf="loading" style="text-align:center;padding:60px;color:#666;">
          <div style="font-size:32px;margin-bottom:12px;">⏳</div>
          <div>Loading products...</div>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" style="background:#FFF3F3;border:1px solid #FFE0E0;color:#DC3545;padding:16px;border-radius:8px;margin-bottom:24px;">
          <strong>Error:</strong> {{ error }}
        </div>

        <!-- Stats Cards -->
        <div *ngIf="!loading && products.length" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">Total Products</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ filteredProducts.length }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">Total Value</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">\${{ getTotalValue() | number:'1.2-2' }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">Low Stock Items</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ getLowStockCount() }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">Out of Stock</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ getOutOfStockCount() }}</div>
          </div>
        </div>

        <!-- Products Table -->
        <div *ngIf="!loading && filteredProducts.length" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#F8F9FA;border-bottom:2px solid #E5E5E5;">
              <tr>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">#</th>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">Product Name</th>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">SKU</th>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">Category</th>
                <th style="text-align:right;padding:16px;font-weight:600;color:#333;">Price</th>
                <th style="text-align:center;padding:16px;font-weight:600;color:#333;">Stock</th>
                <th style="text-align:center;padding:16px;font-weight:600;color:#333;">Status</th>
                <th style="text-align:center;padding:16px;font-weight:600;color:#333;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts; let i = index" style="border-top:1px solid #F0F0F0;transition:background 0.2s;"
                  onmouseover="this.style.background='#F8F9FA'" onmouseout="this.style.background='#fff'">
                <td style="padding:16px;color:#666;">{{ i + 1 }}</td>
                <td style="padding:16px;">
                  <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ p.name }}</div>
                  <div style="font-size:12px;color:#666;">{{ p.barcode || 'No barcode' }}</div>
                </td>
                <td style="padding:16px;color:#666;font-family:monospace;">{{ p.sku }}</td>
                <td style="padding:16px;">
                  <span style="background:#F0F0F0;color:#666;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                    {{ p.category }}
                  </span>
                </td>
                <td style="padding:16px;text-align:right;font-weight:600;color:#DC3545;">\${{ p.price | number:'1.2-2' }}</td>
                <td style="padding:16px;text-align:center;">
                  <span [style.color]="p.stock <= p.minStock ? '#DC3545' : '#28A745'" style="font-weight:600;">
                    {{ p.stock }}
                  </span>
                </td>
                <td style="padding:16px;text-align:center;">
                  <span *ngIf="p.stock === 0" style="background:#FFE0E0;color:#DC3545;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                    Out of Stock
                  </span>
                  <span *ngIf="p.stock > 0 && p.stock <= p.minStock" style="background:#FFF3CD;color:#856404;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                    Low Stock
                  </span>
                  <span *ngIf="p.stock > p.minStock" style="background:#D4EDDA;color:#155724;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                    In Stock
                  </span>
                </td>
                <td style="padding:16px;text-align:center;">
                  <button (click)="openEditModal(p)" style="background:#DC3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;font-size:12px;">
                    Edit
                  </button>
                  <button (click)="deleteProduct(p.id)" style="background:#6C757D;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !filteredProducts.length && !error" style="text-align:center;padding:80px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <div style="font-size:64px;margin-bottom:16px;">📦</div>
          <h3 style="color:#333;margin-bottom:8px;">No Products Found</h3>
          <p style="color:#666;margin-bottom:24px;">Start by adding your first product or adjust your search filters.</p>
          <button (click)="openAddModal()" style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
            Add First Product
          </button>
        </div>
      </main>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;" (click)="closeModal()">
        <div style="background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.3);width:90%;max-width:600px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
          <div style="padding:24px;border-bottom:1px solid #E5E5E5;">
            <h2 style="margin:0;color:#DC3545;">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          </div>
          <form (ngSubmit)="saveProduct()" style="padding:24px;">
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Product Name *</label>
              <input [(ngModel)]="formProduct.name" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">SKU *</label>
                <input [(ngModel)]="formProduct.sku" name="sku" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Barcode</label>
                <input [(ngModel)]="formProduct.barcode" name="barcode" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Category *</label>
              <select [(ngModel)]="formProduct.category" name="category" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
                <option value="">Select category...</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food & Beverages</option>
                <option value="Home">Home & Garden</option>
                <option value="Beauty">Beauty & Health</option>
              </select>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Description</label>
              <textarea [(ngModel)]="formProduct.description" name="description" rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-family:inherit;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Price (\$) *</label>
                <input [(ngModel)]="formProduct.price" name="price" type="number" step="0.01" min="0" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Cost (\$)</label>
                <input [(ngModel)]="formProduct.cost" name="cost" type="number" step="0.01" min="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Stock *</label>
                <input [(ngModel)]="formProduct.stock" name="stock" type="number" min="0" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Min Stock Alert</label>
                <input [(ngModel)]="formProduct.minStock" name="minStock" type="number" min="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
              <button type="button" (click)="closeModal()" style="background:#6C757D;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
                Cancel
              </button>
              <button type="submit" [disabled]="saving" style="background:#DC3545;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
                {{ saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #DC3545;
      box-shadow: 0 0 0 3px rgba(220,53,69,0.1);
    }
    button:hover:not(:disabled) {
      opacity: 0.9;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  filterCategory = '';

  // Modal
  showModal = false;
  editingProduct: Product | null = null;
  formProduct: any = {};
  saving = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.error = '';
    this.productService.getAll().subscribe({
      next: (list) => {
        this.products = list;
        this.filteredProducts = list;
        this.loading = false;
        this.onSearch(); // Apply any active filters
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSearch() {
    let results = [...this.products];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.filterCategory) {
      results = results.filter(p => p.category?.name === this.filterCategory);
    }

    this.filteredProducts = results;
  }

  getTotalValue(): number {
    return this.filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  getLowStockCount(): number {
    return this.filteredProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert).length;
  }

  getOutOfStockCount(): number {
    return this.filteredProducts.filter(p => p.stock === 0).length;
  }

  openAddModal() {
    this.editingProduct = null;
    this.formProduct = {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 10,
      active: true
    };
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.formProduct = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.formProduct = {};
  }

  saveProduct() {
    this.saving = true;
    const operation = this.editingProduct
      ? this.productService.update(this.editingProduct.id.toString(), this.formProduct)
      : this.productService.create(this.formProduct);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.fetch(); // Refresh list
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save product';
        this.saving = false;
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.delete(id.toString()).subscribe({
      next: () => this.fetch(),
      error: (err) => this.error = err?.error?.message || 'Failed to delete product'
    });
  }
}
