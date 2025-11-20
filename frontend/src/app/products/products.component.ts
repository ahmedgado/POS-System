import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductService } from '../services/product.service';
import { Category, CategoryService } from '../services/category.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';
import { PaginationComponent } from '../components/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe, PaginationComponent],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
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

          <!-- Table Body -->
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <tbody>
                <tr *ngFor="let p of products; let i = index" style="border-top:1px solid #F0F0F0;transition:background 0.2s;"
                    onmouseover="this.style.background='#F8F9FA'" onmouseout="this.style.background='#fff'">
                  <td style="padding:16px;text-align:center;width:50px;">
                    <input type="checkbox" [checked]="isProductSelected(p.id)" (change)="toggleSelectProduct(p.id)" style="width:18px;height:18px;cursor:pointer;">
                  </td>
                  <td style="padding:16px;color:#666;width:50px;">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                  <td style="padding:16px;width:80px;">
                    <img [src]="getProductImageUrl(p.id)"
                         (error)="$event.target.src='https://via.placeholder.com/60x60/ddd/999?text=No+Image'"
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

            <!-- Initial Loading -->
            <div *ngIf="loading" style="text-align:center;padding:60px;color:#666;">
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

          <!-- Pagination -->
          <app-pagination
            [currentPage]="currentPage"
            [pageSize]="pageSize"
            [totalCount]="totalCount"
            [totalPages]="totalPages"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
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
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Product Image</label>
              <div style="display:flex;align-items:start;gap:16px;">
                <!-- Image Preview - Always show -->
                <div style="width:120px;height:120px;border:2px dashed #ddd;border-radius:8px;overflow:hidden;background:#f8f9fa;display:flex;align-items:center;justify-content:center;">
                  <!-- Selected image preview -->
                  <img *ngIf="imagePreview" [src]="imagePreview" style="width:100%;height:100%;object-fit:cover;">
                  <!-- Existing product image -->
                  <img *ngIf="!imagePreview && formProduct.id" [src]="getProductImageUrl(formProduct.id)" style="width:100%;height:100%;object-fit:cover;">
                  <!-- No image placeholder for new products -->
                  <div *ngIf="!imagePreview && !formProduct.id" style="text-align:center;padding:10px;">
                    <div style="font-size:32px;margin-bottom:4px;opacity:0.3;">📷</div>
                    <div style="color:#999;font-size:11px;">No Image</div>
                  </div>
                </div>
                <!-- Upload Button -->
                <div style="flex:1;">
                  <input #fileInput type="file" accept="image/*" (change)="onImageSelected($event)" style="display:none;">
                  <button type="button" (click)="fileInput.click()" style="background:#007BFF;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;margin-bottom:8px;width:100%;">
                    📤 {{ selectedImageFile ? 'Change Image' : 'Upload Image' }}
                  </button>
                  <div *ngIf="selectedImageFile" style="font-size:12px;color:#666;">
                    Selected: {{ selectedImageFile.name }} ({{ (selectedImageFile.size / 1024).toFixed(1) }} KB)
                  </div>
                  <div *ngIf="!selectedImageFile && !formProduct.id" style="font-size:11px;color:#999;">
                    Max size: 5MB. Formats: JPG, PNG, GIF, WebP
                  </div>
                </div>
              </div>
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
  error = '';
  searchTerm = '';
  filterCategory = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 1;

  // Modal
  showModal = false;
  editingProduct: Product | null = null;
  formProduct: any = {};
  saving = false;

  // Bulk delete/inactive
  selectedProducts: Set<string> = new Set();
  deleting = false;
  processing = false;

  // Image upload
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

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

  loadProducts() {
    this.loading = true;
    this.error = '';

    this.productService.getAll(this.currentPage, this.pageSize, this.searchTerm, this.filterCategory).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalCount = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    // Debounce search
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset to first page on search
      this.loadProducts();
    }, 500);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1; // Reset to first page
    this.loadProducts();
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
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  saveProduct() {
    this.saving = true;
    const operation = this.editingProduct
      ? this.productService.update(this.editingProduct.id.toString(), this.formProduct)
      : this.productService.create(this.formProduct);

    operation.subscribe({
      next: (response: any) => {
        const productId = this.editingProduct?.id || response?.data?.id || response?.id;

        // If image was selected, upload it
        if (this.selectedImageFile && productId) {
          this.uploadProductImage(productId);
        } else {
          this.saving = false;
          this.closeModal();
          this.loadProducts(); // Refresh list
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save product';
        this.saving = false;
      }
    });
  }

  uploadProductImage(productId: string) {
    if (!this.selectedImageFile) {
      this.saving = false;
      this.closeModal();
      this.loadProducts();
      return;
    }

    this.productService.uploadImage(productId, this.selectedImageFile).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to upload image:', err);
        this.saving = false;
        this.closeModal();
        this.loadProducts(); // Still close and refresh even if image upload fails
      }
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
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
        this.loadProducts();

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
        this.loadProducts();

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

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      this.selectedImageFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getProductImageUrl(productId: string): string {
    return `/api/products/${productId}/image`;
  }
}
