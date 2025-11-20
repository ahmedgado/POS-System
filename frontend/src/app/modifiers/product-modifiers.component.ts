import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModifierService, ModifierGroup } from '../services/modifier.service';
import { ProductService, Product } from '../services/product.service';
import { PaginationComponent } from '../components/pagination.component';

interface ProductWithModifiers extends Product {
  modifierCount?: number;
  assignedModifiers?: ModifierGroup[];
}

@Component({
  selector: 'app-product-modifiers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div style="min-height:100vh;background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🔗 Product Modifiers</h1>
        </div>
      </header>

      <main style="padding:32px;">
        <!-- Search & Filter Bar -->
        <div style="background:#fff;border-radius:16px;padding:24px;margin-bottom:24px;border:1px solid #e5e5e5;">
          <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterProducts()"
              placeholder="🔍 Search products..."
              style="width:100%;padding:14px 20px;background:#f8f9fa;border:2px solid #e5e5e5;border-radius:12px;color:#333;font-size:15px;outline:none;"
              [style.border-color]="searchQuery ? '#c4a75b' : '#e5e5e5'">
            <select
              [(ngModel)]="selectedCategoryFilter"
              (change)="filterProducts()"
              style="padding:14px 20px;background:#f8f9fa;border:2px solid #e5e5e5;border-radius:12px;color:#333;font-size:15px;outline:none;cursor:pointer;">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" style="text-align:center;padding:80px 20px;color:#c4a75b;">
          <div style="font-size:48px;margin-bottom:16px;">⏳</div>
          <div style="font-size:18px;font-weight:600;">Loading products...</div>
        </div>

        <!-- Products Grid -->
        <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px;">
          <div
            *ngFor="let product of filteredProducts"
            style="background:#fff;border-radius:16px;overflow:hidden;border:2px solid #e5e5e5;transition:all 0.3s ease;cursor:pointer;"
            (click)="openProductModifiers(product)"
            (mouseenter)="$event.currentTarget.style.borderColor='#c4a75b'; $event.currentTarget.style.transform='translateY(-4px)'"
            (mouseleave)="$event.currentTarget.style.borderColor='#e5e5e5'; $event.currentTarget.style.transform='translateY(0)'">

            <!-- Product Image -->
            <div style="height:180px;background:#f8f9fa;position:relative;overflow:hidden;">
              <img
                [src]="getProductImageUrl(product.id)"
                [alt]="product.name"
                style="width:100%;height:100%;object-fit:cover;"
                (error)="$event.target.src='https://via.placeholder.com/400x300?text=No+Image'">
              <div style="position:absolute;top:12px;right:12px;background:rgba(196, 167, 91, 0.95);color:#1a1a1a;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;">
                \${{ product.price.toFixed(2) }}
              </div>
            </div>

            <!-- Product Info -->
            <div style="padding:20px;">
              <h3 style="margin:0 0 8px 0;color:#333;font-size:18px;font-weight:700;">
                {{ product.name }}
              </h3>
              <p style="margin:0 0 12px 0;color:#666;font-size:13px;">
                SKU: {{ product.sku }}
              </p>

              <!-- Assigned Modifiers -->
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e5e5;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span style="color:#333;font-size:12px;font-weight:700;text-transform:uppercase;">
                    Modifiers
                  </span>
                  <span style="background:#e5e5e5;color:#333;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">
                    {{ product.modifierCount || 0 }}
                  </span>
                </div>

                <div *ngIf="!product.modifierCount || product.modifierCount === 0"
                     style="text-align:center;padding:12px;color:#999;font-size:12px;">
                  No modifiers assigned
                </div>

                <div *ngIf="product.modifierCount && product.modifierCount > 0"
                     style="display:flex;flex-wrap:wrap;gap:6px;">
                  <span
                    *ngFor="let mod of product.assignedModifiers?.slice(0, 3)"
                    style="background:#e5e5e5;color:#333;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;">
                    {{ mod.name }}
                  </span>
                  <span
                    *ngIf="product.modifierCount > 3"
                    style="background:#e5e5e5;color:#666;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;">
                    +{{ product.modifierCount - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <button
                (click)="openProductModifiers(product); $event.stopPropagation()"
                style="width:100%;margin-top:16px;background:linear-gradient(135deg, #c4a75b 0%, #a38a4a 100%);color:#1a1a1a;border:none;padding:12px;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px;">
                ⚙️ Manage Modifiers
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProducts.length === 0"
             style="text-align:center;padding:80px 20px;background:#fff;border-radius:16px;border:2px dashed #e5e5e5;">
          <div style="font-size:64px;margin-bottom:20px;opacity:0.5;">🔍</div>
          <h2 style="color:#333;margin:0 0 12px 0;font-size:24px;font-weight:700;">No Products Found</h2>
          <p style="color:#666;margin:0;font-size:14px;">Try adjusting your search or filter</p>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading && filteredProducts.length > 0" style="margin-top:24px;">
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
    </div>

    <!-- Product Modifiers Modal -->
    <div *ngIf="showModal && selectedProduct"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(10px);"
         (click)="closeModal()">
      <div style="background:#fff;border-radius:20px;max-width:800px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:3px solid #c4a75b;" (click)="$event.stopPropagation()">

        <!-- Modal Header -->
        <div style="position:sticky;top:0;background:#f8f9fa;padding:24px 32px;border-bottom:2px solid #c4a75b;z-index:10;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h2 style="margin:0 0 8px 0;color:#333;font-size:24px;font-weight:800;">
                ⚙️ {{ selectedProduct.name }}
              </h2>
              <p style="margin:0;color:#666;font-size:13px;">
                Assign modifier groups to customize this item
              </p>
            </div>
            <button
              (click)="closeModal()"
              style="background:#c4a75b;color:#1a1a1a;border:none;width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;">
              ✕
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div style="padding:32px;">

          <!-- Available Modifier Groups -->
          <div *ngIf="availableModifierGroups.length > 0" style="margin-bottom:32px;">
            <h3 style="margin:0 0 16px 0;color:#333;font-size:18px;font-weight:700;">
              📋 Available Modifier Groups
            </h3>
            <div style="display:grid;gap:12px;">
              <div
                *ngFor="let group of availableModifierGroups"
                style="background:#f8f9fa;padding:16px 20px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:2px solid #e5e5e5;transition:all 0.3s ease;"
                (mouseenter)="$event.currentTarget.style.borderColor='#c4a75b'"
                (mouseleave)="$event.currentTarget.style.borderColor='#e5e5e5'">
                <div>
                  <div style="color:#333;font-weight:700;font-size:15px;margin-bottom:4px;">
                    {{ group.name }}
                  </div>
                  <div style="color:#666;font-size:12px;">
                    {{ group.modifiers?.length || 0 }} options
                    <span *ngIf="group.isRequired" style="color:#c4a75b;margin-left:8px;">• Required</span>
                  </div>
                </div>
                <button
                  (click)="assignModifier(group.id)"
                  [disabled]="processing"
                  style="background:linear-gradient(135deg, #c4a75b 0%, #a38a4a 100%);color:#1a1a1a;border:none;padding:10px 20px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;"
                  [style.opacity]="processing ? '0.5' : '1'">
                  ➕ Assign
                </button>
              </div>
            </div>
          </div>

          <!-- Assigned Modifier Groups -->
          <div *ngIf="assignedModifierGroups.length > 0">
            <h3 style="margin:0 0 16px 0;color:#28a745;font-size:18px;font-weight:700;">
              ✅ Assigned Modifier Groups
            </h3>
            <div style="display:grid;gap:12px;">
              <div
                *ngFor="let group of assignedModifierGroups"
                style="background:#f8f9fa;padding:16px 20px;border-radius:12px;border:2px solid #28a745;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                  <div>
                    <div style="color:#28a745;font-weight:700;font-size:15px;margin-bottom:4px;">
                      {{ group.name }}
                    </div>
                    <div style="color:#666;font-size:12px;">
                      {{ group.modifiers?.length || 0 }} options available
                    </div>
                  </div>
                  <button
                    (click)="unassignModifier(group.id)"
                    [disabled]="processing"
                    style="background:#c4a75b;color:#1a1a1a;border:none;padding:8px 16px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12px;"
                    [style.opacity]="processing ? '0.5' : '1'">
                    🗑️ Remove
                  </button>
                </div>

                <!-- Show modifiers in this group -->
                <div *ngIf="group.modifiers && group.modifiers.length > 0"
                     style="display:flex;flex-wrap:wrap;gap:8px;padding-top:12px;border-top:1px solid #e5e5e5;">
                  <span
                    *ngFor="let mod of group.modifiers"
                    style="background:#e5e5e5;color:#333;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;">
                    {{ mod.name }} <span style="color:#28a745;">{{ (mod.priceAdjustment || mod.price || 0) == 0 ? '' : '+$' + (+(mod.priceAdjustment || mod.price || 0)).toFixed(2) }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- No Modifiers State -->
          <div *ngIf="assignedModifierGroups.length === 0 && availableModifierGroups.length === 0"
               style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;opacity:0.5;">⚙️</div>
            <p style="margin:0;font-size:14px;">No modifier groups available.<br>Create modifier groups first.</p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ProductModifiersComponent implements OnInit {
  products: ProductWithModifiers[] = [];
  filteredProducts: ProductWithModifiers[] = [];
  modifierGroups: ModifierGroup[] = [];
  categories: any[] = [];

  loading = false;
  processing = false;
  showModal = false;

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 1;

  searchQuery = '';
  selectedCategoryFilter = '';
  selectedProduct: ProductWithModifiers | null = null;
  private searchTimeout: any;

  assignedModifierGroups: ModifierGroup[] = [];
  availableModifierGroups: ModifierGroup[] = [];

  constructor(
    private modifierService: ModifierService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    Promise.all([
      this.productService.getAll(this.currentPage, this.pageSize, this.searchQuery, this.selectedCategoryFilter).toPromise(),
      this.modifierService.getModifierGroups(1, 1000).toPromise()
    ]).then(([productsResponse, groupsResponse]) => {
      this.products = (productsResponse as any)?.data || [];
      this.totalCount = (productsResponse as any)?.pagination?.total || 0;
      this.totalPages = (productsResponse as any)?.pagination?.totalPages || 1;
      this.modifierGroups = (groupsResponse as any)?.data || groupsResponse || [];
      this.loadProductModifierCounts();
      this.extractCategories();
      this.filteredProducts = this.products;
      this.loading = false;
    }).catch(err => {
      console.error('Failed to load data:', err);
      this.loading = false;
    });
  }

  loadProductModifierCounts() {
    // Load modifier counts for each product
    this.products.forEach(product => {
      this.modifierService.getProductModifiers(product.id).subscribe({
        next: (modifiers) => {
          product.modifierCount = modifiers.length;
          product.assignedModifiers = modifiers;
        },
        error: (err) => console.error('Failed to load modifiers for product:', err)
      });
    });
  }

  extractCategories() {
    const catMap = new Map();
    this.products.forEach(p => {
      if (p.category && !catMap.has(p.category.id)) {
        catMap.set(p.category.id, p.category);
      }
    });
    this.categories = Array.from(catMap.values());
  }

  filterProducts() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadData();
    }, 500);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  openProductModifiers(product: ProductWithModifiers) {
    this.selectedProduct = product;
    this.showModal = true;
    this.loadProductModifiersDetail();
  }

  loadProductModifiersDetail() {
    if (!this.selectedProduct) return;

    console.log('Loading modifiers for product:', this.selectedProduct.id);
    console.log('All modifier groups:', this.modifierGroups.length);

    this.modifierService.getProductModifiers(this.selectedProduct.id).subscribe({
      next: (assigned) => {
        console.log('Assigned modifiers response:', assigned);
        this.assignedModifierGroups = assigned || [];

        // Filter out already assigned groups
        const assignedIds = new Set((assigned || []).map(a => a.id).filter(Boolean));
        this.availableModifierGroups = (this.modifierGroups || []).filter(
          g => !assignedIds.has(g.id)
        );

        console.log('Assigned:', this.assignedModifierGroups.length, 'Available:', this.availableModifierGroups.length);
        console.log('Available groups:', this.availableModifierGroups);
      },
      error: (err) => {
        console.error('Failed to load product modifiers:', err);
        this.assignedModifierGroups = [];
        this.availableModifierGroups = this.modifierGroups || [];
      }
    });
  }

  assignModifier(modifierGroupId: string | undefined) {
    if (!this.selectedProduct || !modifierGroupId) return;

    this.processing = true;
    this.modifierService.linkModifierToProduct({
      productId: this.selectedProduct.id,
      modifierGroupId: modifierGroupId
    }).subscribe({
      next: () => {
        this.processing = false;
        this.loadProductModifiersDetail();
        this.loadProductModifierCounts();
      },
      error: (err) => {
        console.error('Failed to assign modifier:', err);
        alert('Failed to assign modifier: ' + (err.error?.message || err.message));
        this.processing = false;
      }
    });
  }

  unassignModifier(modifierGroupId: string | undefined) {
    if (!this.selectedProduct || !modifierGroupId) return;

    if (!confirm('Remove this modifier group from the product?')) return;

    this.processing = true;
    this.modifierService.unlinkModifierFromProduct(
      this.selectedProduct.id,
      modifierGroupId
    ).subscribe({
      next: () => {
        this.processing = false;
        this.loadProductModifiersDetail();
        this.loadProductModifierCounts();
      },
      error: (err) => {
        console.error('Failed to unassign modifier:', err);
        alert('Failed to unassign modifier');
        this.processing = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  getProductImageUrl(productId: string): string {
    return `/api/products/${productId}/image`;
  }
}
