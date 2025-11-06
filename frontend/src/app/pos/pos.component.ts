import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductService } from '../services/product.service';
import { SaleService, CreateSaleRequest } from '../services/sale.service';
import { AuthService } from '../services/auth.service';
import { Category, CategoryService } from '../services/category.service';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div style="display:flex;height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

      <!-- Left Panel - Products -->
      <div style="flex:1;display:flex;flex-direction:column;background:#fff;border-right:1px solid #ddd;">
        <!-- Header -->
        <header style="background:#DC3545;color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:20px;font-weight:700;">🛒 {{ 'pos.title' | translate }}</h1>
          <div style="font-size:14px;">{{ cashierName }}</div>
        </header>

        <!-- Search Bar -->
        <div style="padding:16px;border-bottom:1px solid #eee;">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            [placeholder]="'pos.searchPlaceholder' | translate"
            style="width:100%;padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
            [style.border-color]="searchTerm ? '#DC3545' : '#ddd'"
            autofocus
          />
        </div>

        <!-- Category Filter -->
        <div style="padding:12px 16px;border-bottom:1px solid #eee;display:flex;gap:8px;overflow-x:auto;">
          <button
            (click)="filterCategory = ''; onSearch()"
            [style.background]="filterCategory === '' ? '#DC3545' : '#fff'"
            [style.color]="filterCategory === '' ? '#fff' : '#333'"
            style="padding:8px 16px;border:1px solid #ddd;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">
            {{ 'pos.allCategories' | translate }}
          </button>
          <button
            *ngFor="let cat of categories"
            (click)="filterCategory = cat.name; onSearch()"
            [style.background]="filterCategory === cat.name ? '#DC3545' : '#fff'"
            [style.color]="filterCategory === cat.name ? '#fff' : '#333'"
            style="padding:8px 16px;border:1px solid #ddd;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">
            {{ cat.name }}
          </button>
        </div>

        <!-- Products Grid -->
        <div style="flex:1;overflow-y:auto;padding:16px;">
          <div *ngIf="loading" style="text-align:center;padding:40px;color:#999;">{{ 'common.loading' | translate }}</div>

          <div *ngIf="!loading && filteredProducts.length === 0" style="text-align:center;padding:40px;color:#999;">
            {{ 'pos.noProducts' | translate }}
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
            <div
              *ngFor="let product of filteredProducts"
              (click)="addToCart(product)"
              style="background:#fff;border:2px solid #eee;border-radius:12px;padding:12px;cursor:pointer;text-align:center;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.borderColor='#DC3545'; $event.currentTarget.style.transform='translateY(-2px)'"
              (mouseleave)="$event.currentTarget.style.borderColor='#eee'; $event.currentTarget.style.transform='translateY(0)'">
              <div style="width:100%;height:80px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                <img
                  [src]="product.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'"
                  [alt]="product.name"
                  style="max-width:100%;max-height:100%;object-fit:contain;border-radius:6px;"
                  (error)="$event.target.src='https://via.placeholder.com/100x100?text=No+Image'">
              </div>
              <div style="font-weight:600;color:#333;margin-bottom:4px;font-size:13px;line-height:1.3;">{{ product.name }}</div>
              <div style="color:#888;font-size:11px;margin-bottom:8px;">{{ product.sku }}</div>
              <div style="color:#DC3545;font-weight:700;font-size:16px;">\${{ product.price.toFixed(2) }}</div>
              <div style="color:#888;font-size:11px;margin-top:4px;">{{ 'pos.stock' | translate }}: {{ product.stock }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Cart -->
      <div style="width:420px;display:flex;flex-direction:column;background:#fff;">
        <!-- Cart Header -->
        <div style="background:#f8f9fa;padding:16px 20px;border-bottom:2px solid #DC3545;">
          <h2 style="margin:0;font-size:18px;font-weight:700;color:#333;">{{ 'pos.shoppingCart' | translate }}</h2>
          <div style="color:#666;font-size:13px;margin-top:4px;">{{ cartItems.length }} {{ 'pos.items' | translate }}</div>
        </div>

        <!-- Cart Items -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          <div *ngIf="cartItems.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">🛒</div>
            <div style="font-size:16px;">{{ 'pos.emptyCart' | translate }}</div>
            <div style="font-size:13px;margin-top:8px;">{{ 'pos.addProducts' | translate }}</div>
          </div>

          <div *ngFor="let item of cartItems; let i = index" style="background:#f8f9fa;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
              <div style="flex:1;">
                <div style="font-weight:600;color:#333;margin-bottom:4px;">{{ item.name }}</div>
                <div style="color:#666;font-size:12px;">\${{ item.price.toFixed(2) }} {{ 'pos.each' | translate }}</div>
              </div>
              <button
                (click)="removeFromCart(i)"
                style="background:#dc3545;color:#fff;border:none;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:16px;line-height:1;">
                ×
              </button>
            </div>

            <div style="display:flex;align-items:center;gap:12px;">
              <div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:6px;padding:4px;">
                <button
                  (click)="updateQuantity(i, item.quantity - 1)"
                  style="background:#fff;border:1px solid #ddd;width:32px;height:32px;border-radius:4px;cursor:pointer;font-size:18px;font-weight:700;line-height:1;">
                  -
                </button>
                <input
                  type="number"
                  [(ngModel)]="item.quantity"
                  (change)="updateQuantity(i, item.quantity)"
                  style="width:50px;text-align:center;border:none;font-weight:700;font-size:14px;"
                  min="1"
                />
                <button
                  (click)="updateQuantity(i, item.quantity + 1)"
                  style="background:#DC3545;border:none;width:32px;height:32px;border-radius:4px;cursor:pointer;color:#fff;font-size:18px;font-weight:700;line-height:1;">
                  +
                </button>
              </div>
              <div style="flex:1;text-align:right;">
                <div style="font-weight:700;color:#DC3545;font-size:16px;">\${{ item.subtotal.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div style="border-top:2px solid #eee;padding:16px 20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#666;font-size:14px;">
            <span>{{ 'pos.subtotal' | translate }}:</span>
            <span style="font-weight:600;">\${{ getSubtotal().toFixed(2) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#666;font-size:14px;">
            <span>{{ 'pos.tax' | translate }} ({{ taxRate * 100 }}%):</span>
            <span style="font-weight:600;">\${{ getTax().toFixed(2) }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;color:#666;font-size:14px;">
            <span>{{ 'pos.discount' | translate }}:</span>
            <input
              type="number"
              [(ngModel)]="discountAmount"
              (change)="calculateTotal()"
              placeholder="0.00"
              style="width:80px;text-align:right;padding:4px 8px;border:1px solid #ddd;border-radius:4px;font-weight:600;"
              min="0"
            />
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #DC3545;margin-top:12px;">
            <span style="font-size:18px;font-weight:700;color:#333;">{{ 'pos.total' | translate }}:</span>
            <span style="font-size:24px;font-weight:700;color:#DC3545;">\${{ getTotal().toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Method -->
        <div style="padding:16px 20px;border-top:1px solid #eee;">
          <div style="font-weight:600;color:#333;margin-bottom:12px;font-size:14px;">{{ 'pos.paymentMethod' | translate }}:</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
            <button
              (click)="paymentMethod = 'CASH'"
              [style.background]="paymentMethod === 'CASH' ? '#DC3545' : '#fff'"
              [style.color]="paymentMethod === 'CASH' ? '#fff' : '#333'"
              [style.border]="paymentMethod === 'CASH' ? '2px solid #DC3545' : '2px solid #ddd'"
              style="padding:12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">
              💵 {{ 'pos.cash' | translate }}
            </button>
            <button
              (click)="paymentMethod = 'CARD'"
              [style.background]="paymentMethod === 'CARD' ? '#DC3545' : '#fff'"
              [style.color]="paymentMethod === 'CARD' ? '#fff' : '#333'"
              [style.border]="paymentMethod === 'CARD' ? '2px solid #DC3545' : '2px solid #ddd'"
              style="padding:12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">
              💳 {{ 'pos.card' | translate }}
            </button>
            <button
              (click)="paymentMethod = 'MOBILE'"
              [style.background]="paymentMethod === 'MOBILE' ? '#DC3545' : '#fff'"
              [style.color]="paymentMethod === 'MOBILE' ? '#fff' : '#333'"
              [style.border]="paymentMethod === 'MOBILE' ? '2px solid #DC3545' : '2px solid #ddd'"
              style="padding:12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;">
              📱 {{ 'pos.mobile' | translate }}
            </button>
          </div>
        </div>

        <!-- Cash Payment Details -->
        <div *ngIf="paymentMethod === 'CASH'" style="padding:0 20px 16px 20px;">
          <div style="margin-bottom:8px;">
            <label style="font-size:13px;color:#666;font-weight:600;">{{ 'pos.amountPaid' | translate }}:</label>
            <input
              type="number"
              [(ngModel)]="amountPaid"
              (input)="calculateChange()"
              placeholder="0.00"
              style="width:100%;padding:10px;border:2px solid #ddd;border-radius:6px;font-size:16px;font-weight:600;margin-top:4px;"
              min="0"
            />
          </div>
          <div *ngIf="amountPaid > 0" style="display:flex;justify-content:space-between;padding:12px;background:#f8f9fa;border-radius:6px;">
            <span style="font-weight:600;color:#333;">{{ 'pos.change' | translate }}:</span>
            <span style="font-weight:700;color:#28a745;font-size:18px;">\${{ getChange().toFixed(2) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="padding:16px 20px;background:#f8f9fa;border-top:1px solid #eee;">
          <button
            (click)="completeSale()"
            [disabled]="cartItems.length === 0 || processing"
            style="width:100%;background:#DC3545;color:#fff;border:none;padding:16px;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;margin-bottom:8px;"
            [style.opacity]="cartItems.length === 0 || processing ? '0.5' : '1'"
            [style.cursor]="cartItems.length === 0 || processing ? 'not-allowed' : 'pointer'">
            {{ processing ? ('pos.processing' | translate) : ('pos.completeSale' | translate) }}
          </button>
          <button
            (click)="clearCart()"
            [disabled]="cartItems.length === 0"
            style="width:100%;background:#fff;color:#dc3545;border:2px solid #dc3545;padding:12px;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;"
            [style.opacity]="cartItems.length === 0 ? '0.5' : '1'"
            [style.cursor]="cartItems.length === 0 ? 'not-allowed' : 'pointer'">
            {{ 'pos.clearCart' | translate }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div *ngIf="showSuccessModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="closeSuccessModal()">
      <div style="background:#fff;border-radius:16px;padding:40px;max-width:400px;text-align:center;" (click)="$event.stopPropagation()">
        <div style="font-size:64px;margin-bottom:16px;">✅</div>
        <h2 style="margin:0 0 16px 0;color:#28a745;font-size:24px;">{{ 'pos.saleCompleted' | translate }}</h2>
        <div style="color:#666;margin-bottom:24px;">
          <div style="font-size:16px;margin-bottom:8px;">{{ 'pos.total' | translate }}: <strong style="color:#DC3545;font-size:20px;">\${{ lastSaleTotal.toFixed(2) }}</strong></div>
          <div *ngIf="paymentMethod === 'CASH' && lastSaleChange > 0" style="font-size:14px;">
            {{ 'pos.change' | translate }}: <strong style="color:#28a745;">\${{ lastSaleChange.toFixed(2) }}</strong>
          </div>
        </div>
        <button
          (click)="closeSuccessModal()"
          style="background:#DC3545;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
          {{ 'pos.newSale' | translate }}
        </button>
      </div>
    </div>
  `
})
export class POSComponent implements OnInit {
  cashierName = '';
  searchTerm = '';
  filterCategory = '';
  categories: Category[] = [];

  products: Product[] = [];
  filteredProducts: Product[] = [];
  cartItems: CartItem[] = [];

  loading = false;
  processing = false;

  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' = 'CASH';
  taxRate = 0.15; // 15% tax
  discountAmount = 0;
  amountPaid = 0;

  showSuccessModal = false;
  lastSaleTotal = 0;
  lastSaleChange = 0;

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.cashierName = this.authService.currentUser?.firstName || 'Cashier';
  }

  ngOnInit() {
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
    this.productService.getAll(1, 500).subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term);

      const matchesCategory = !this.filterCategory || p.category?.name === this.filterCategory;

      return matchesSearch && matchesCategory;
    });
  }

  addToCart(product: Product) {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const existingItem = this.cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        alert(`Only ${product.stock} units available!`);
        return;
      }
      existingItem.quantity++;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      this.cartItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      });
    }

    this.calculateTotal();
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateTotal();
  }

  updateQuantity(index: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeFromCart(index);
      return;
    }

    const item = this.cartItems[index];
    const product = this.products.find(p => p.id === item.productId);

    if (product && newQuantity > product.stock) {
      alert(`Only ${product.stock} units available!`);
      item.quantity = product.stock;
    } else {
      item.quantity = newQuantity;
    }

    item.subtotal = item.quantity * item.price;
    this.calculateTotal();
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() - this.discountAmount;
  }

  getChange(): number {
    return Math.max(0, this.amountPaid - this.getTotal());
  }

  calculateTotal() {
    // Trigger change detection
  }

  calculateChange() {
    // Trigger change detection
  }

  clearCart() {
    if (confirm('Clear all items from cart?')) {
      this.cartItems = [];
      this.discountAmount = 0;
      this.amountPaid = 0;
      this.calculateTotal();
    }
  }

  completeSale() {
    if (this.cartItems.length === 0) return;

    if (this.paymentMethod === 'CASH' && this.amountPaid < this.getTotal()) {
      alert('Insufficient payment amount!');
      return;
    }

    this.processing = true;

    const saleRequest: CreateSaleRequest = {
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        taxRate: this.taxRate,
        discount: 0,
        totalPrice: item.subtotal
      })),
      paymentMethod: this.paymentMethod === 'MOBILE' ? 'CARD' : this.paymentMethod,
      subtotal: this.getSubtotal(),
      taxAmount: this.getTax(),
      discountAmount: this.discountAmount,
      totalAmount: this.getTotal(),
      cashReceived: this.paymentMethod === 'CASH' ? this.amountPaid : undefined,
      changeGiven: this.paymentMethod === 'CASH' ? this.getChange() : undefined
    };

    this.saleService.createSale(saleRequest).subscribe({
      next: (sale) => {
        this.processing = false;
        this.lastSaleTotal = this.getTotal();
        this.lastSaleChange = this.getChange();
        this.showSuccessModal = true;
        this.loadProducts(); // Reload products to get updated stock
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to complete sale:', err);
        alert('Failed to complete sale. Please try again.');
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.cartItems = [];
    this.discountAmount = 0;
    this.amountPaid = 0;
    this.paymentMethod = 'CASH';
    this.searchTerm = '';
    this.filterCategory = '';
    this.onSearch();
  }
}
