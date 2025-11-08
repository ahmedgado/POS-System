import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductService } from '../services/product.service';
import { Category, CategoryService } from '../services/category.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;max-width:1600px;margin:0 auto;">
          <div style="display:flex;align-items:center;gap:16px;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">📦 {{ 'products.title' | translate }}</h1>
            <span *ngIf="selectedProducts.size > 0" style="background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;">
              {{ selectedProducts.size }} {{ 'products.selected' | translate }}
            </span>
          </div>
          <div style="display:flex;gap:12px;">
            <button *ngIf="selectedProducts.size > 0" (click)="bulkInactive()" [disabled]="processing" style="background:#fff;color:#FFA500;border:2px solid #FFA500;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <span style="font-size:18px;">⏸️</span> {{ processing ? ('products.deactivating' | translate) : ('products.bulkInactive' | translate) }}
            </button>
            <button *ngIf="selectedProducts.size > 0" (click)="bulkDelete()" [disabled]="deleting" style="background:#fff;color:#dc3545;border:2px solid #dc3545;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <span style="font-size:18px;">🗑️</span> {{ deleting ? ('products.deleting' | translate) : ('products.bulkDelete' | translate) }}
            </button>
            <button (click)="openAddModal()" style="background:#fff;color:#DC3545;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
              <span style="font-size:18px;">+</span> {{ 'products.addProduct' | translate }}
            </button>
          </div>
        </div>
      </header>

      <!-- Search & Filter Bar -->
      <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:16px 32px;">
        <div style="max-width:1600px;margin:0 auto;display:flex;gap:12px;align-items:center;">
          <input
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            [placeholder]="'products.searchPlaceholder' | translate"
            style="flex:1;padding:10px 16px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
          <select [(ngModel)]="filterCategory" (change)="onSearchChange()" style="padding:10px 16px;border:1px solid #ddd;border-radius:8px;font-size:14px;">
            <option value="">{{ 'common.all' | translate }} {{ 'products.category' | translate }}</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <!-- Main Content -->
      <main style="padding:32px;max-width:1600px;margin:0 auto;">
        <!-- Stats Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">{{ 'products.totalProducts' | translate }}</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ totalCount }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">{{ 'products.totalValue' | translate }}</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ getTotalValue() | currencyFormat }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">{{ 'products.lowStock' | translate }}</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ getLowStockCount() }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="font-size:12px;color:#666;margin-bottom:4px;">{{ 'products.outOfStock' | translate }}</div>
            <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ getOutOfStockCount() }}</div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" style="background:#FFF3F3;border:1px solid #FFE0E0;color:#DC3545;padding:16px;border-radius:8px;margin-bottom:24px;">
          <strong>Error:</strong> {{ error }}
        </div>

        <!-- Products Table with Fixed Height Scroll -->
        <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Table Header (Fixed) -->
          <div style="overflow-x:auto;border-bottom:2px solid #E5E5E5;">
            <table style="width:100%;border-collapse:collapse;">
              <thead style="background:#F8F9FA;">
                <tr>
                  <th style="text-align:center;padding:16px;font-weight:600;color:#333;width:50px;">
                    <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll($event)" style="width:18px;height:18px;cursor:pointer;">
                  </th>
                  <th style="text-align:left;padding:16px;font-weight:600;color:#333;width:50px;">#</th>
                  <th style="text-align:left;padding:16px;font-weight:600;color:#333;width:80px;">{{ 'products.image' | translate }}</th>
                  <th style="text-align:left;padding:16px;font-weight:600;color:#333;min-width:200px;">{{ 'products.name' | translate }}</th>
                  <th style="text-align:left;padding:16px;font-weight:600;color:#333;width:120px;">{{ 'products.sku' | translate }}</th>
                  <th style="text-align:left;padding:16px;font-weight:600;color:#333;width:150px;">{{ 'products.category' | translate }}</th>
                  <th style="text-align:right;padding:16px;font-weight:600;color:#333;width:100px;">{{ 'products.price' | translate }}</th>
                  <th style="text-align:center;padding:16px;font-weight:600;color:#333;width:80px;">{{ 'products.stock' | translate }}</th>
                  <th style="text-align:center;padding:16px;font-weight:600;color:#333;width:120px;">{{ 'products.status' | translate }}</th>
                  <th style="text-align:center;padding:16px;font-weight:600;color:#333;width:180px;">{{ 'products.actions' | translate }}</th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Scrollable Table Body -->
          <div (scroll)="onScroll($event)" style="overflow-y:auto;overflow-x:auto;max-height:600px;">
            <table style="width:100%;border-collapse:collapse;">
              <tbody>
                <tr *ngFor="let p of products; let i = index" style="border-top:1px solid #F0F0F0;transition:background 0.2s;"
                    onmouseover="this.style.background='#F8F9FA'" onmouseout="this.style.background='#fff'">
                  <td style="padding:16px;text-align:center;width:50px;">
                    <input type="checkbox" [checked]="isProductSelected(p.id)" (change)="toggleSelectProduct(p.id)" style="width:18px;height:18px;cursor:pointer;">
                  </td>
                  <td style="padding:16px;color:#666;width:50px;">{{ i + 1 }}</td>
                  <td style="padding:16px;width:80px;">
                    <img [src]="p.imageUrl || 'https://via.placeholder.com/60x60/ddd/999?text=No+Image'"
                         [alt]="p.name"
                         style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #E5E5E5;">
                  </td>
                  <td style="padding:16px;min-width:200px;">
                    <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ p.name }}</div>
                    <div style="font-size:12px;color:#666;">{{ p.barcode || ('products.noBarcode' | translate) }}</div>
                  </td>
                  <td style="padding:16px;color:#666;font-family:monospace;width:120px;">{{ p.sku }}</td>
                  <td style="padding:16px;width:150px;">
                    <span style="background:#F0F0F0;color:#666;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                      {{ p.category?.name || 'N/A' }}
                    </span>
                  </td>
                  <td style="padding:16px;text-align:right;font-weight:600;color:#DC3545;width:100px;">{{ p.price | currencyFormat }}</td>
                  <td style="padding:16px;text-align:center;width:80px;">
                    <span [style.color]="p.stock <= p.lowStockAlert ? '#DC3545' : '#28A745'" style="font-weight:600;">
                      {{ p.stock }}
                    </span>
                  </td>
                  <td style="padding:16px;text-align:center;width:120px;">
                    <span *ngIf="p.stock === 0" style="background:#FFE0E0;color:#DC3545;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                      {{ 'products.outOfStock' | translate }}
                    </span>
                    <span *ngIf="p.stock > 0 && p.stock <= p.lowStockAlert" style="background:#FFF3CD;color:#856404;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                      {{ 'products.lowStock' | translate }}
                    </span>
                    <span *ngIf="p.stock > p.lowStockAlert" style="background:#D4EDDA;color:#155724;padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                      {{ 'products.inStock' | translate }}
                    </span>
                  </td>
                  <td style="padding:16px;text-align:center;width:180px;">
                    <button (click)="openEditModal(p)" style="background:#DC3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;font-size:12px;">
                      {{ 'products.edit' | translate }}
                    </button>
                    <button (click)="deleteProduct(p.id)" style="background:#6C757D;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">
                      {{ 'products.delete' | translate }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Loading More Indicator -->
          <div *ngIf="loadingMore" style="text-align:center;padding:24px;color:#666;">
            <div style="font-size:24px;margin-bottom:8px;">⏳</div>
            <div>{{ 'common.loading' | translate }}...</div>
          </div>

          <!-- End of List -->
          <div *ngIf="!hasMore && products.length > 0" style="text-align:center;padding:24px;color:#999;font-size:14px;">
            {{ 'products.endOfList' | translate }} ({{ 'products.showing' | translate }} {{ products.length }} {{ 'products.of' | translate }} {{ totalCount }})
          </div>

          <!-- Initial Loading -->
          <div *ngIf="loading && products.length === 0" style="text-align:center;padding:60px;color:#666;">
            <div style="font-size:32px;margin-bottom:12px;">⏳</div>
            <div>{{ 'common.loading' | translate }}...</div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && products.length === 0 && !error" style="text-align:center;padding:80px;">
            <div style="font-size:64px;margin-bottom:16px;">📦</div>
            <h3 style="color:#333;margin-bottom:8px;">{{ 'common.noData' | translate }}</h3>
            <button (click)="openAddModal()" style="background:#DC3545;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
              {{ 'products.addProduct' | translate }}
            </button>
          </div>
        </div>
      </main>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;" (click)="closeModal()">
        <div style="background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.3);width:90%;max-width:600px;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
          <div style="padding:24px;border-bottom:1px solid #E5E5E5;">
            <h2 style="margin:0;color:#DC3545;">{{ editingProduct ? ('products.editProduct' | translate) : ('products.addNewProduct' | translate) }}</h2>
          </div>
          <form (ngSubmit)="saveProduct()" style="padding:24px;">
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.name' | translate }} *</label>
              <input [(ngModel)]="formProduct.name" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.sku' | translate }} *</label>
                <input [(ngModel)]="formProduct.sku" name="sku" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.barcode' | translate }}</label>
                <input [(ngModel)]="formProduct.barcode" name="barcode" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.category' | translate }} *</label>
              <select [(ngModel)]="formProduct.categoryId" name="categoryId" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
                <option value="">{{ 'products.selectCategory' | translate }}</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.description' | translate }}</label>
              <textarea [(ngModel)]="formProduct.description" name="description" rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-family:inherit;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.price' | translate }} (\$) *</label>
                <input [(ngModel)]="formProduct.price" name="price" type="number" step="0.01" min="0" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.cost' | translate }} (\$)</label>
                <input [(ngModel)]="formProduct.cost" name="cost" type="number" step="0.01" min="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.stock' | translate }} *</label>
                <input [(ngModel)]="formProduct.stock" name="stock" type="number" min="0" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.minStock' | translate }}</label>
                <input [(ngModel)]="formProduct.lowStockAlert" name="lowStockAlert" type="number" min="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="margin-bottom:24px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">{{ 'products.imageUrl' | translate }}</label>
              <input [(ngModel)]="formProduct.imageUrl" name="imageUrl" type="url" placeholder="https://example.com/image.jpg" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
              <button type="button" (click)="closeModal()" style="background:#6C757D;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" [disabled]="saving" style="background:#DC3545;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
                {{ saving ? ('products.saving' | translate) : (editingProduct ? ('products.update' | translate) : ('products.create' | translate)) }}
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
  categories: Category[] = [];
  loading = false;
  loadingMore = false;
  error = '';
  searchTerm = '';
  filterCategory = '';

  // Pagination
  currentPage = 1;
  pageSize = 100;
  totalCount = 0;
  hasMore = true;

  // Modal
  showModal = false;
  editingProduct: Product | null = null;
  formProduct: any = {};
  saving = false;

  // Bulk delete/inactive
  selectedProducts: Set<string> = new Set();
  deleting = false;
  processing = false;

  private searchTimeout: any;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data.filter(c => c.active);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadProducts(reset: boolean = false) {
    if (reset) {
      this.currentPage = 1;
      this.products = [];
    }

    if (this.currentPage === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.error = '';

    this.productService.getAll(this.currentPage, this.pageSize, this.searchTerm, this.filterCategory).subscribe({
      next: (response) => {
        if (reset) {
          this.products = response.data;
        } else {
          this.products = [...this.products, ...response.data];
        }

        this.totalCount = response.pagination.total;
        this.hasMore = response.pagination.hasMore;
        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load products';
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  onSearchChange() {
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadProducts(true);
    }, 500);
  }

  onScroll(event: any): void {
    if (this.loadingMore || !this.hasMore) return;

    const element = event.target;
    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;

    // Load more when user scrolls to 80% of container
    if (scrollPosition >= scrollHeight * 0.8) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert).length;
  }

  getOutOfStockCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }

  openAddModal() {
    this.editingProduct = null;
    this.formProduct = {
      name: '',
      sku: '',
      barcode: '',
      categoryId: '',
      description: '',
      price: 0,
      cost: 0,
      stock: 0,
      lowStockAlert: 10,
      imageUrl: '',
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.formProduct = {
      ...product,
      categoryId: product.category?.id || product.categoryId
    };
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
        this.loadProducts(true); // Refresh list
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save product';
        this.saving = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(true),
      error: (err) => this.error = err?.error?.message || 'Failed to delete product'
    });
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      if (this.products.length > 100) {
        alert('Cannot select more than 100 products at once. Only the first 100 products will be selected.');
        this.products.slice(0, 100).forEach(p => this.selectedProducts.add(p.id));
        event.target.checked = false;
      } else {
        this.products.forEach(p => this.selectedProducts.add(p.id));
      }
    } else {
      this.selectedProducts.clear();
    }
  }

  toggleSelectProduct(productId: string) {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts.has(productId);
  }

  isAllSelected(): boolean {
    return this.products.length > 0 && this.selectedProducts.size === this.products.length;
  }

  bulkDelete() {
    if (this.selectedProducts.size === 0) {
      alert('Please select products to delete');
      return;
    }

    if (this.selectedProducts.size > 100) {
      alert('Cannot delete more than 100 products at once. Please select fewer products.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${this.selectedProducts.size} products?`)) {
      return;
    }

    this.deleting = true;
    const idsArray = Array.from(this.selectedProducts);

    this.productService.bulkDelete(idsArray).subscribe({
      next: (response) => {
        this.deleting = false;
        this.selectedProducts.clear();
        this.loadProducts(true);

        // Show message about results
        if (response.data && response.data.unableToDeleteCount > 0) {
          alert(response.data.message);
        }
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || 'Failed to delete products';
        alert(this.error);
        console.error(err);
      }
    });
  }

  bulkInactive() {
    if (this.selectedProducts.size === 0) {
      alert('Please select products to deactivate');
      return;
    }

    if (this.selectedProducts.size > 100) {
      alert('Cannot update more than 100 products at once. Please select fewer products.');
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${this.selectedProducts.size} products? They will not appear in POS or new orders.`)) {
      return;
    }

    this.processing = true;
    const idsArray = Array.from(this.selectedProducts);

    this.productService.bulkInactive(idsArray, false).subscribe({
      next: (response) => {
        this.processing = false;
        this.selectedProducts.clear();
        this.loadProducts(true);

        if (response.data && response.data.message) {
          alert(response.data.message);
        }
      },
      error: (err) => {
        this.processing = false;
        this.error = err?.error?.message || 'Failed to deactivate products';
        alert(this.error);
        console.error(err);
      }
    });
  }
}
