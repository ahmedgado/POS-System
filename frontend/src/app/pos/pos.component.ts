import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Product, ProductService } from '../services/product.service';
import { SaleService, CreateSaleRequest } from '../services/sale.service';
import { AuthService } from '../services/auth.service';
import { Category, CategoryService } from '../services/category.service';
import { CurrencyFormatPipe } from '../pipes/currency-format.pipe';
import { TableService, Table } from '../services/table.service';
import { FloorService, Floor } from '../services/floor.service';
import { ShiftService, Shift } from '../services/shift.service';
import { ModifierService, ModifierGroup, Modifier } from '../services/modifier.service';
import { SettingsService, ShiftSettings } from '../services/settings.service';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  modifiers?: SelectedModifier[];
  modifierTotal?: number;
}

interface SelectedModifier {
  modifierId: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div style="display:flex;min-height:calc(100vh - 60px);background:#f8f6f4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;">

      <!-- Left Panel - Products -->
      <div style="flex:1;display:flex;flex-direction:column;background:#ffffff;border-right:1px solid #e5e0db;">
        <!-- Header -->
        <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <h1 style="margin:0;font-size:22px;font-weight:600;letter-spacing:0.5px;">{{ 'pos.title' | translate }}</h1>
          <div style="display:flex;align-items:center;gap:16px;">
            <div *ngIf="currentShift" style="background:#4caf50;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;">
              <span style="width:8px;height:8px;background:white;border-radius:50%;"></span>
              SHIFT OPEN
            </div>
            <div *ngIf="!currentShift && shiftSettings?.shiftMode === 'MANUAL'" 
                 (click)="openShift()"
                 style="background:#f44336;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all 0.2s;"
                 (mouseenter)="$event.currentTarget.style.opacity='0.9'"
                 (mouseleave)="$event.currentTarget.style.opacity='1'">
              <span style="width:8px;height:8px;background:white;border-radius:50%;animation:pulse 1.5s infinite;"></span>
              OPEN SHIFT
            </div>
            <div style="font-size:14px;color:#f8f6f4;font-weight:500;">{{ cashierName }}</div>
          </div>
        </header>

        <!-- Search Bar -->
        <div style="padding:20px 24px;border-bottom:1px solid #e5e0db;background:#fafaf9;">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            [placeholder]="'pos.searchPlaceholder' | translate"
            style="width:100%;padding:14px 18px;border:1px solid #d4af37;border-radius:12px;font-size:15px;outline:none;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s;"
            [style.border-color]="searchTerm ? '#d4af37' : '#e5e0db'"
            [style.box-shadow]="searchTerm ? '0 4px 12px rgba(212,175,55,0.2)' : '0 1px 3px rgba(0,0,0,0.08)'"
            autofocus
          />
        </div>

        <!-- Category Filter -->
        <div style="padding:16px 24px;border-bottom:1px solid #e5e0db;display:flex;gap:10px;overflow-x:auto;background:#fafaf9;">
          <button
            (click)="filterCategory = ''; onSearch()"
            [style.background]="filterCategory === '' ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
            [style.color]="filterCategory === '' ? '#ffffff' : '#1a1a1a'"
            [style.border]="filterCategory === '' ? 'none' : '1px solid #e5e0db'"
            style="padding:10px 20px;border-radius:24px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
            {{ 'pos.allCategories' | translate }}
          </button>
          <button
            *ngFor="let cat of categories"
            (click)="filterCategory = cat.name; onSearch()"
            [style.background]="filterCategory === cat.name ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
            [style.color]="filterCategory === cat.name ? '#ffffff' : '#1a1a1a'"
            [style.border]="filterCategory === cat.name ? 'none' : '1px solid #e5e0db'"
            style="padding:10px 20px;border-radius:24px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
            {{ cat.name }}
          </button>
        </div>

        <!-- Products Grid -->
        <div style="flex:1;overflow-y:auto;padding:24px;background:#fafaf9;">
          <div *ngIf="loading" style="text-align:center;padding:40px;color:#8b7355;">{{ 'common.loading' | translate }}</div>

          <div *ngIf="!loading && filteredProducts.length === 0" style="text-align:center;padding:40px;color:#8b7355;">
            {{ 'pos.noProducts' | translate }}
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;">
            <div
              *ngFor="let product of paginatedProducts"
              (click)="addToCart(product)"
              style="background:#ffffff;border:1px solid #e5e0db;border-radius:16px;padding:14px;cursor:pointer;text-align:center;transition:all 0.3s;box-shadow:0 2px 8px rgba(0,0,0,0.06);"
              (mouseenter)="$event.currentTarget.style.borderColor='#d4af37'; $event.currentTarget.style.transform='translateY(-4px)'; $event.currentTarget.style.boxShadow='0 8px 24px rgba(212,175,55,0.15)'"
              (mouseleave)="$event.currentTarget.style.borderColor='#e5e0db'; $event.currentTarget.style.transform='translateY(0)'; $event.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'">
              <div style="width:100%;height:90px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fafaf9;border-radius:12px;">
                <img
                  [src]="getProductImageUrl(product.id)"
                  [alt]="product.name"
                  style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;"
                  (error)="$event.target.src='https://via.placeholder.com/120x120?text=No+Image'">
              </div>
              <div style="font-weight:600;color:#1a1a1a;margin-bottom:6px;font-size:14px;line-height:1.4;">{{ product.name }}</div>
              <div style="color:#8b7355;font-size:11px;margin-bottom:10px;">{{ product.sku }}</div>
              <div style="color:#d4af37;font-weight:700;font-size:17px;">{{ product.price | currencyFormat }}</div>
              <div style="color:#8b7355;font-size:11px;margin-top:6px;">{{ 'pos.stock' | translate }}: {{ product.stock }}</div>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="totalPages > 1" style="margin-top:24px;display:flex;align-items:center;justify-content:center;gap:8px;">
            <button 
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;border:none;width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:18px;font-weight:700;transition:all 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.15);"
              [style.opacity]="currentPage === 1 ? '0.3' : '1'"
              [style.cursor]="currentPage === 1 ? 'not-allowed' : 'pointer'">
              ‹
            </button>
            
            <div style="display:flex;gap:6px;">
              <button 
                *ngFor="let page of [].constructor(totalPages); let i = index"
                (click)="goToPage(i + 1)"
                [style.background]="currentPage === i + 1 ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'"
                [style.color]="currentPage === i + 1 ? '#ffffff' : '#d4af37'"
                style="border:none;min-width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:15px;font-weight:700;padding:0 12px;transition:all 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                {{ i + 1 }}
              </button>
            </div>

            <button 
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;border:none;width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:18px;font-weight:700;transition:all 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.15);"
              [style.opacity]="currentPage === totalPages ? '0.3' : '1'"
              [style.cursor]="currentPage === totalPages ? 'not-allowed' : 'pointer'">
              ›
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel - Cart -->
      <div style="width:440px;display:flex;flex-direction:column;background:#ffffff;border-left:1px solid #e5e0db;">
        <!-- Cart Header -->
        <div style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);padding:20px 24px;border-bottom:1px solid #d4af37;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h2 style="margin:0;font-size:20px;font-weight:600;color:#d4af37;letter-spacing:0.5px;">{{ 'pos.shoppingCart' | translate }}</h2>
            <div style="color:#f8f6f4;font-size:14px;margin-top:6px;font-weight:500;">{{ cartItems.length }} {{ 'pos.items' | translate }}</div>
          </div>
          <button 
            (click)="toggleSplitMode()"
            [style.background]="splitMode ? '#d4af37' : 'transparent'"
            [style.color]="splitMode ? '#1a1a1a' : '#d4af37'"
            style="border:1px solid #d4af37;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;">
            {{ splitMode ? 'Cancel Split' : 'Split Bill' }}
          </button>
        </div>

        <!-- Restaurant Order Type & Table Selection -->
        <div style="padding:20px 24px;border-bottom:1px solid #e5e0db;background:#fafaf9;">
          <div style="font-weight:600;color:#1a1a1a;margin-bottom:12px;font-size:14px;letter-spacing:0.3px;">Order Type</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
            <button
              (click)="orderType = 'DINE_IN'; showTableSelector = true"
              [style.background]="orderType === 'DINE_IN' ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
              [style.color]="orderType === 'DINE_IN' ? '#ffffff' : '#1a1a1a'"
              [style.border]="orderType === 'DINE_IN' ? 'none' : '1px solid #e5e0db'"
              style="padding:10px 8px;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
              🍽️ Dine In
            </button>
            <button
              (click)="orderType = 'TAKEAWAY'; selectedTableId = null; selectedTable = null; showTableSelector = false"
              [style.background]="orderType === 'TAKEAWAY' ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
              [style.color]="orderType === 'TAKEAWAY' ? '#ffffff' : '#1a1a1a'"
              [style.border]="orderType === 'TAKEAWAY' ? 'none' : '1px solid #e5e0db'"
              style="padding:10px 8px;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
              🥡 Takeaway
            </button>
            <button
              (click)="orderType = 'DELIVERY'; selectedTableId = null; selectedTable = null; showTableSelector = false"
              [style.background]="orderType === 'DELIVERY' ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
              [style.color]="orderType === 'DELIVERY' ? '#ffffff' : '#1a1a1a'"
              [style.border]="orderType === 'DELIVERY' ? 'none' : '1px solid #e5e0db'"
              style="padding:10px 8px;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
              🚗 Delivery
            </button>
          </div>

          <div *ngIf="showTableSelector && orderType === 'DINE_IN'" style="margin-top:12px;">
            <div style="font-weight:600;color:#1a1a1a;margin-bottom:10px;font-size:13px;">Select Table</div>
            <select
              [ngModel]="selectedTableId"
              (ngModelChange)="onTableSelect($event)"
              style="width:100%;padding:12px 14px;border:1px solid #d4af37;border-radius:10px;font-size:14px;background:#ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.06);">
              <option [value]="null">No Table</option>
              <option *ngFor="let table of tables" [value]="table.id">
                {{ table.floor?.name }} - {{ table.tableNumber }} ({{ table.capacity }} seats)
              </option>
            </select>
            <div *ngIf="selectedTable" style="margin-top:12px;padding:12px;background:linear-gradient(135deg, #f0e6d2 0%, #f8f6f4 100%);border-radius:10px;font-size:13px;color:#1a1a1a;border:1px solid #d4af37;">
              ✓ Table: {{ selectedTable.tableNumber }} | Floor: {{ selectedTable.floor?.name }} | {{ selectedTable.capacity }} seats
            </div>
          </div>
        </div>

        <!-- Cart Items -->
        <div style="flex:1;overflow-y:auto;padding:16px 20px;">
          <div *ngIf="cartItems.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">🛒</div>
            <div style="font-size:16px;">{{ 'pos.emptyCart' | translate }}</div>
            <div style="font-size:13px;margin-top:8px;">{{ 'pos.addProducts' | translate }}</div>
          </div>

          <div *ngFor="let item of cartItems; let i = index" 
               [style.border-color]="splitMode && selectedForSplit.has(i) ? '#d4af37' : '#e5e0db'"
               [style.background]="splitMode && selectedForSplit.has(i) ? '#f0e6d2' : 'linear-gradient(135deg, #fafaf9 0%, #f8f6f4 100%)'"
               style="border:1px solid;border-radius:12px;padding:14px;margin-bottom:14px;transition:all 0.2s;">
            
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
              <div *ngIf="splitMode" style="margin-right:12px;display:flex;align-items:center;">
                <input type="checkbox" [checked]="selectedForSplit.has(i)" (change)="toggleItemSplit(i)" style="width:20px;height:20px;accent-color:#d4af37;cursor:pointer;">
              </div>
              <div style="flex:1;">
                <div style="font-weight:600;color:#1a1a1a;margin-bottom:6px;">{{ item.name }}</div>
                <div style="color:#8b7355;font-size:13px;">{{ item.price | currencyFormat }} {{ 'pos.each' | translate }}</div>
                <div *ngIf="item.modifiers && item.modifiers.length > 0" style="margin-top:6px;padding:6px 10px;background:#f0e6d2;border-radius:6px;font-size:11px;">
                  <div *ngFor="let mod of item.modifiers" style="color:#6d5a45;margin-bottom:2px;">
                    + {{ mod.name }} <span *ngIf="mod.price > 0">({{ mod.price | currencyFormat }})</span>
                  </div>
                </div>
              </div>
              <button
                *ngIf="!splitMode"
                (click)="removeFromCart(i)"
                style="background:linear-gradient(135deg, #8b7355 0%, #6d5a45 100%);color:#fff;border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                ×
              </button>
            </div>

            <div style="display:flex;align-items:center;gap:12px;">
              <div *ngIf="!splitMode" style="display:flex;align-items:center;gap:10px;background:#ffffff;border-radius:10px;padding:6px;border:1px solid #e5e0db;">
                <button
                  (click)="updateQuantity(i, item.quantity - 1)"
                  style="background:#ffffff;border:1px solid #d4af37;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:18px;font-weight:700;line-height:1;color:#d4af37;">
                  -
                </button>
                <input
                  type="number"
                  [(ngModel)]="item.quantity"
                  (change)="updateQuantity(i, item.quantity)"
                  style="width:50px;text-align:center;border:none;font-weight:700;font-size:15px;color:#1a1a1a;"
                  min="1"
                />
                <button
                  (click)="updateQuantity(i, item.quantity + 1)"
                  style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;color:#fff;font-size:18px;font-weight:700;line-height:1;">
                  +
                </button>
              </div>
              <div *ngIf="splitMode" style="font-weight:600;color:#1a1a1a;font-size:14px;">
                Qty: {{ item.quantity }}
              </div>
              <div style="flex:1;text-align:right;">
                <div style="font-weight:700;color:#d4af37;font-size:18px;">{{ item.subtotal | currencyFormat }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div style="border-top:1px solid #e5e0db;padding:20px 24px;background:#ffffff;">
          <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;">
            <span>{{ 'pos.subtotal' | translate }}:</span>
            <span style="font-weight:600;color:#1a1a1a;">{{ getSubtotal() | currencyFormat }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;">
            <span>{{ 'pos.tax' | translate }} ({{ taxRate * 100 }}%):</span>
            <span style="font-weight:600;color:#1a1a1a;">{{ getTax() | currencyFormat }}</span>
          </div>
          
          <!-- Service Charge & Tips -->
          <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;align-items:center;">
            <span>Service Charge (%):</span>
            <input
              type="number"
              [(ngModel)]="serviceChargeRate"
              (change)="calculateTotal()"
              placeholder="0"
              style="width:80px;text-align:right;padding:6px 10px;border:1px solid #e5e0db;border-radius:8px;font-weight:600;"
              min="0"
              step="0.01"
            />
          </div>
          <div *ngIf="getServiceCharge() > 0" style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;">
            <span>Service Charge Amount:</span>
            <span style="font-weight:600;color:#1a1a1a;">{{ getServiceCharge() | currencyFormat }}</span>
          </div>

          <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;align-items:center;">
            <span>Tip Amount:</span>
            <input
              type="number"
              [(ngModel)]="tipAmount"
              (change)="calculateTotal()"
              placeholder="0.00"
              style="width:100px;text-align:right;padding:6px 10px;border:1px solid #e5e0db;border-radius:8px;font-weight:600;"
              min="0"
            />
          </div>

          <div style="display:flex;justify-content:space-between;margin-bottom:14px;color:#8b7355;font-size:15px;align-items:center;">
            <span>{{ 'pos.discount' | translate }}:</span>
            <input
              type="number"
              [(ngModel)]="discountAmount"
              (change)="calculateTotal()"
              placeholder="0.00"
              style="width:100px;text-align:right;padding:6px 10px;border:1px solid #d4af37;border-radius:8px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.06);"
              min="0"
            />
          </div>

          <div style="display:flex;justify-content:space-between;padding-top:16px;border-top:2px solid #d4af37;margin-top:14px;">
            <span style="font-size:19px;font-weight:700;color:#1a1a1a;letter-spacing:0.3px;">{{ 'pos.total' | translate }}:</span>
            <span style="font-size:26px;font-weight:700;color:#d4af37;">{{ getTotal() | currencyFormat }}</span>
          </div>
        </div>

        <!-- Payment Section -->
        <div *ngIf="!splitMode" style="padding:20px 24px;border-top:1px solid #e5e0db;background:#fafaf9;">
          <!-- Added Payments List -->
          <div *ngIf="payments.length > 0" style="margin-bottom:16px;">
            <div style="font-weight:600;color:#1a1a1a;margin-bottom:8px;font-size:14px;">Payments Added:</div>
            <div *ngFor="let p of payments; let i = index" style="display:flex;justify-content:space-between;align-items:center;background:#fff;padding:8px 12px;border-radius:8px;border:1px solid #e5e0db;margin-bottom:6px;">
              <span style="font-weight:500;color:#1a1a1a;">{{ p.method }}</span>
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-weight:600;color:#1a1a1a;">{{ p.amount | currencyFormat }}</span>
                <button (click)="removePayment(i)" style="border:none;background:none;color:#d32f2f;cursor:pointer;font-weight:700;">×</button>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:14px;">
              <span>Total Paid: <strong style="color:#2d7c3e;">{{ getTotalPaid() | currencyFormat }}</strong></span>
              <span>Remaining: <strong style="color:#d32f2f;">{{ getRemainingAmount() | currencyFormat }}</strong></span>
            </div>
          </div>

          <!-- Add Payment Controls -->
          <div *ngIf="getRemainingAmount() > 0">
            <div style="font-weight:600;color:#1a1a1a;margin-bottom:10px;font-size:14px;">Add Payment</div>
            <div style="display:flex;gap:10px;margin-bottom:10px;">
              <input
                type="number"
                [(ngModel)]="amountPaid"
                placeholder="Amount"
                style="flex:1;padding:12px;border:1px solid #d4af37;border-radius:10px;font-size:16px;font-weight:600;"
                [value]="getRemainingAmount()"
              />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
              <button (click)="addPayment('CASH', amountPaid || getRemainingAmount())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">💵 Cash</button>
              <button (click)="addPayment('CARD', amountPaid || getRemainingAmount())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">💳 Card</button>
              <button (click)="addPayment('MOBILE_WALLET', amountPaid || getRemainingAmount())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">📱 Mobile</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="padding:20px 24px;background:linear-gradient(135deg, #fafaf9 0%, #f8f6f4 100%);border-top:1px solid #e5e0db;">
          <button
            *ngIf="!splitMode"
            (click)="completeSale()"
            [disabled]="cartItems.length === 0 || processing"
            style="width:100%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#ffffff;border:none;padding:18px;border-radius:12px;font-weight:700;font-size:17px;cursor:pointer;margin-bottom:10px;box-shadow:0 4px 12px rgba(212,175,55,0.3);"
            [style.opacity]="cartItems.length === 0 || processing ? '0.5' : '1'"
            [style.cursor]="cartItems.length === 0 || processing ? 'not-allowed' : 'pointer'">
            {{ processing ? ('pos.processing' | translate) : ('pos.completeSale' | translate) }}
          </button>

          <button
            *ngIf="splitMode"
            (click)="paySplitItems()"
            [disabled]="selectedForSplit.size === 0 || processing"
            style="width:100%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#ffffff;border:none;padding:18px;border-radius:12px;font-weight:700;font-size:17px;cursor:pointer;margin-bottom:10px;box-shadow:0 4px 12px rgba(212,175,55,0.3);"
            [style.opacity]="selectedForSplit.size === 0 || processing ? '0.5' : '1'"
            [style.cursor]="selectedForSplit.size === 0 || processing ? 'not-allowed' : 'pointer'">
            Pay Selected Items ({{ selectedForSplit.size }})
          </button>

          <button
            (click)="clearCart()"
            [disabled]="cartItems.length === 0"
            style="width:100%;background:#ffffff;color:#8b7355;border:1px solid #e5e0db;padding:14px;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.06);"
            [style.opacity]="cartItems.length === 0 ? '0.5' : '1'"
            [style.cursor]="cartItems.length === 0 ? 'not-allowed' : 'pointer'">
            {{ 'pos.clearCart' | translate }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div *ngIf="showSuccessModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(26,26,26,0.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="closeSuccessModal()">
      <div style="background:#ffffff;border-radius:24px;padding:48px;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid #d4af37;" (click)="$event.stopPropagation()">
        <div style="font-size:72px;margin-bottom:20px;">✅</div>
        <h2 style="margin:0 0 20px 0;color:#2d7c3e;font-size:26px;font-weight:700;letter-spacing:0.5px;">{{ 'pos.saleCompleted' | translate }}</h2>
        <div style="color:#8b7355;margin-bottom:32px;">
          <div style="font-size:17px;margin-bottom:12px;">{{ 'pos.total' | translate }}: <strong style="color:#d4af37;font-size:24px;font-weight:700;">{{ lastSaleTotal | currencyFormat }}</strong></div>
          <div *ngIf="paymentMethod === 'CASH' && lastSaleChange > 0" style="font-size:16px;color:#2d7c3e;">
            {{ 'pos.change' | translate }}: <strong style="font-weight:700;">{{ lastSaleChange | currencyFormat }}</strong>
          </div>
        </div>
        <button
          (click)="closeSuccessModal()"
          style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#ffffff;border:none;padding:16px 40px;border-radius:12px;font-weight:700;cursor:pointer;font-size:16px;box-shadow:0 4px 16px rgba(212,175,55,0.4);">
          {{ 'pos.newSale' | translate }}
        </button>
      </div>
    </div>

    <!-- Modifier Selection Modal -->
    <div *ngIf="showModifierModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(26,26,26,0.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="closeModifierModal()">
      <div style="background:#ffffff;border-radius:24px;padding:32px;max-width:550px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid #d4af37;" (click)="$event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #d4af37;">
          <h2 style="margin:0;color:#1a1a1a;font-size:22px;font-weight:700;">Customize {{ selectedProduct?.name }}</h2>
          <button
            (click)="closeModifierModal()"
            style="background:#f0e6d2;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:20px;color:#8b7355;font-weight:700;">
            ×
          </button>
        </div>

        <div *ngFor="let group of productModifiers" style="margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <span style="font-weight:700;color:#1a1a1a;font-size:16px;">{{ group.name }}</span>
              <span *ngIf="group.isRequired" style="color:#d4af37;margin-left:6px;font-size:12px;font-weight:600;">(Required)</span>
            </div>
            <span *ngIf="group.maxSelection || group.maxSelections" style="font-size:12px;color:#8b7355;">Max {{ group.maxSelection || group.maxSelections }}</span>
          </div>

          <div *ngFor="let modifier of group.modifiers" style="margin-bottom:8px;">
            <label style="display:flex;align-items:center;padding:12px;background:#fafaf9;border:1px solid #e5e0db;border-radius:10px;cursor:pointer;transition:all 0.2s;"
                   [style.border-color]="isModifierSelected(group.id!, modifier.id!) ? '#d4af37' : '#e5e0db'"
                   [style.background]="isModifierSelected(group.id!, modifier.id!) ? '#f0e6d2' : '#fafaf9'">
              <input
                type="checkbox"
                [checked]="isModifierSelected(group.id!, modifier.id!)"
                (change)="toggleModifier(group.id!, modifier, group)"
                style="width:20px;height:20px;margin-right:12px;accent-color:#d4af37;cursor:pointer;"
              />
              <div style="flex:1;">
                <div style="font-weight:600;color:#1a1a1a;font-size:14px;">{{ modifier.name }}</div>
                <div *ngIf="modifier.description" style="font-size:12px;color:#8b7355;margin-top:2px;">{{ modifier.description }}</div>
              </div>
              <div *ngIf="(modifier.priceAdjustment || modifier.price || 0) > 0" style="font-weight:700;color:#d4af37;font-size:15px;">
                +{{ (+(modifier.priceAdjustment || modifier.price || 0)) | currencyFormat }}
              </div>
            </label>
          </div>
        </div>

        <div style="border-top:2px solid #e5e0db;padding-top:20px;margin-top:20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:16px;">
            <span style="color:#8b7355;">Item Price:</span>
            <span style="font-weight:600;color:#1a1a1a;">{{ selectedProduct?.price | currencyFormat }}</span>
          </div>
          <div *ngIf="getModifierTotal() > 0" style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:16px;">
            <span style="color:#8b7355;">Modifiers:</span>
            <span style="font-weight:600;color:#1a1a1a;">{{ getModifierTotal() | currencyFormat }}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:20px;font-size:19px;padding-top:12px;border-top:1px solid #e5e0db;">
            <span style="font-weight:700;color:#1a1a1a;">Total:</span>
            <span style="font-weight:700;color:#d4af37;font-size:24px;">{{ (selectedProduct?.price || 0) + getModifierTotal() | currencyFormat }}</span>
          </div>
          <button
            (click)="confirmModifierSelection()"
            style="width:100%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#ffffff;border:none;padding:16px;border-radius:12px;font-weight:700;font-size:17px;cursor:pointer;box-shadow:0 4px 12px rgba(212,175,55,0.3);">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
    <!-- Split Payment Modal -->
    <div *ngIf="showSplitPaymentModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(26,26,26,0.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="closeSplitPaymentModal()">
      <div style="background:#ffffff;border-radius:24px;padding:32px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid #d4af37;" (click)="$event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #d4af37;">
          <h2 style="margin:0;color:#1a1a1a;font-size:22px;font-weight:700;">Pay Selected Items</h2>
          <button
            (click)="closeSplitPaymentModal()"
            style="background:#f0e6d2;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:20px;color:#8b7355;font-weight:700;">
            ×
          </button>
        </div>

        <div style="margin-bottom:24px;">
          <div style="font-size:16px;color:#1a1a1a;margin-bottom:8px;">Selected Items: <strong>{{ splitCartItems.length }}</strong></div>
          <div style="font-size:24px;color:#d4af37;font-weight:700;">Total: {{ splitTotalAmount | currencyFormat }}</div>
        </div>

        <!-- Added Payments List -->
        <div *ngIf="splitPayments.length > 0" style="margin-bottom:16px;background:#fafaf9;padding:12px;border-radius:12px;border:1px solid #e5dfdbff;">
          <div style="font-weight:600;color:#1a1a1a;margin-bottom:8px;font-size:14px;">Payments Added:</div>
          <div *ngFor="let p of splitPayments; let i = index" style="display:flex;justify-content:space-between;align-items:center;background:#fff;padding:8px 12px;border-radius:8px;border:1px solid #e5e0db;margin-bottom:6px;">
            <span style="font-weight:500;color:#1a1a1a;">{{ p.method }}</span>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-weight:600;color:#1a1a1a;">{{ p.amount | currencyFormat }}</span>
              <button (click)="removeSplitPayment(i)" style="border:none;background:none;color:#d32f2f;cursor:pointer;font-weight:700;">×</button>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:14px;">
            <span>Total Paid: <strong style="color:#2d7c3e;">{{ getSplitTotalPaid() | currencyFormat }}</strong></span>
            <span>Remaining: <strong style="color:#d32f2f;">{{ getSplitRemaining() | currencyFormat }}</strong></span>
          </div>
        </div>

        <!-- Add Payment Controls -->
        <div *ngIf="getSplitRemaining() > 0" style="margin-bottom:24px;">
          <div style="font-weight:600;color:#1a1a1a;margin-bottom:10px;font-size:14px;">Add Payment</div>
          <div style="display:flex;gap:10px;margin-bottom:10px;">
            <input
              type="number"
              [(ngModel)]="splitAmountPaid"
              placeholder="Amount"
              style="flex:1;padding:12px;border:1px solid #d4af37;border-radius:10px;font-size:16px;font-weight:600;"
              [value]="getSplitRemaining()"
            />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
            <button (click)="addSplitPayment('CASH', splitAmountPaid || getSplitRemaining())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">💵 Cash</button>
            <button (click)="addSplitPayment('CARD', splitAmountPaid || getSplitRemaining())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">💳 Card</button>
            <button (click)="addSplitPayment('MOBILE_WALLET', splitAmountPaid || getSplitRemaining())" style="padding:10px;background:#fff;border:1px solid #d4af37;border-radius:8px;color:#d4af37;font-weight:600;cursor:pointer;">📱 Mobile</button>
          </div>
        </div>

        <button
          (click)="completeSplitSale()"
          [disabled]="processing || getSplitRemaining() > 0"
          style="width:100%;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#ffffff;border:none;padding:16px;border-radius:12px;font-weight:700;font-size:17px;cursor:pointer;box-shadow:0 4px 12px rgba(212,175,55,0.3);"
          [style.opacity]="processing || getSplitRemaining() > 0 ? '0.5' : '1'"
          [style.cursor]="processing || getSplitRemaining() > 0 ? 'not-allowed' : 'pointer'">
          {{ processing ? 'Processing...' : 'Complete Payment' }}
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
  paginatedProducts: Product[] = [];
  cartItems: CartItem[] = [];

  loading = false;
  processing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_WALLET' = 'CASH';
  taxRate = 0.15; // 15% tax
  discountAmount = 0;
  amountPaid = 0;

  showSuccessModal = false;
  lastSaleTotal = 0;
  lastSaleChange = 0;

  // Restaurant features
  floors: Floor[] = [];
  tables: Table[] = [];
  selectedTableId: string | null = null;
  selectedTable: Table | null = null;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' = 'TAKEAWAY';
  showTableSelector = false;
  currentShift: Shift | null = null;

  // Modifier selection
  showModifierModal = false;
  selectedProduct: Product | null = null;
  productModifiers: ModifierGroup[] = [];
  selectedModifiers: Map<string, SelectedModifier[]> = new Map();

  shiftSettings: ShiftSettings | null = null;

  constructor(
    private productService: ProductService,
    private saleService: SaleService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private tableService: TableService,
    private floorService: FloorService,
    private shiftService: ShiftService,
    private modifierService: ModifierService,
    private settingsService: SettingsService
  ) {
    this.cashierName = this.authService.currentUser?.firstName || 'Cashier';
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.loadTablesAndFloors();
    this.loadCurrentShift();
    this.loadShiftSettings();
  }

  loadShiftSettings() {
    this.settingsService.getShiftSettings().subscribe({
      next: (response) => {
        this.shiftSettings = response.data;
      },
      error: (err) => console.error('Failed to load shift settings:', err)
    });
  }

  loadCurrentShift() {
    this.shiftService.getCurrent().subscribe({
      next: (shift) => {
        this.currentShift = shift;
      },
      error: (err) => console.error('Failed to load current shift:', err)
    });
  }

  openShift() {
    if (confirm('Open a new shift?')) {
      // Use default starting cash from settings or prompt?
      // For simplicity, use settings value or 0
      const startingCash = this.shiftSettings?.shiftStartingCash || 0;

      this.shiftService.openShift(startingCash).subscribe({
        next: (shift) => {
          this.currentShift = shift;
          alert('Shift opened successfully!');
        },
        error: (err) => {
          console.error('Failed to open shift:', err);
          alert('Failed to open shift: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  loadTablesAndFloors() {
    this.floorService.getFloors().subscribe({
      next: (response) => {
        this.floors = response.data || [];
      },
      error: (err) => console.error('Failed to load floors:', err)
    });

    this.tableService.getTables().subscribe({
      next: (response) => {
        this.tables = (response.data || []).filter((t: Table) => t.isActive && t.status === 'AVAILABLE');
      },
      error: (err) => console.error('Failed to load tables:', err)
    });
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
        this.updatePagination();
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

    // Reset to first page when searching
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  addToCart(product: Product) {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }

    // Check if product has modifiers
    this.modifierService.getProductModifiers(product.id).subscribe({
      next: (modifiers) => {
        if (modifiers && modifiers.length > 0) {
          // Show modifier selection modal
          this.selectedProduct = product;
          this.productModifiers = modifiers;
          this.selectedModifiers.clear();
          this.showModifierModal = true;
        } else {
          // Add directly to cart without modifiers
          this.addItemToCart(product, []);
        }
      },
      error: (err) => {
        console.error('Failed to load modifiers:', err);
        // Add to cart anyway if modifier fetch fails
        this.addItemToCart(product, []);
      }
    });
  }

  addItemToCart(product: Product, modifiers: SelectedModifier[]) {
    const existingItem = this.cartItems.find(item =>
      item.productId === product.id &&
      JSON.stringify(item.modifiers || []) === JSON.stringify(modifiers)
    );

    const modifierTotal = modifiers.reduce((sum, m) => sum + m.price, 0);
    const itemPrice = product.price + modifierTotal;

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        alert(`Only ${product.stock} units available!`);
        return;
      }
      existingItem.quantity++;
      existingItem.subtotal = existingItem.quantity * itemPrice;
    } else {
      this.cartItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: itemPrice,
        modifiers: modifiers.length > 0 ? modifiers : undefined,
        modifierTotal: modifierTotal > 0 ? modifierTotal : undefined
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



  getChange(): number {
    return Math.max(0, this.amountPaid - this.getTotal());
  }

  calculateTotal() {
    // Trigger change detection
  }

  calculateChange() {
    // Trigger change detection
  }

  onTableSelect(tableId: string | null) {
    this.selectedTableId = tableId;
    if (tableId) {
      this.selectedTable = this.tables.find(t => t.id === tableId) || null;
    } else {
      this.selectedTable = null;
    }
  }

  clearCart() {
    if (confirm('Clear all items from cart?')) {
      this.cartItems = [];
      this.discountAmount = 0;
      this.amountPaid = 0;
      this.selectedTableId = null;
      this.selectedTable = null;
      this.calculateTotal();
    }
  }

  // Payment & Splitting
  payments: { method: string, amount: number }[] = [];
  serviceChargeRate = 0;
  serviceChargeAmount = 0;
  tipAmount = 0;

  splitMode = false;
  selectedForSplit: Set<number> = new Set(); // Set of cart item indices

  // ... existing methods ...

  getServiceCharge(): number {
    return this.getSubtotal() * this.serviceChargeRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getServiceCharge() + this.tipAmount - this.discountAmount;
  }

  getTotalPaid(): number {
    return this.payments.reduce((sum, p) => sum + p.amount, 0);
  }

  getRemainingAmount(): number {
    return Math.max(0, this.getTotal() - this.getTotalPaid());
  }

  addPayment(method: string, amount: number) {
    if (amount <= 0) return;
    this.payments.push({ method, amount });
    this.amountPaid = 0; // Reset input
  }

  removePayment(index: number) {
    this.payments.splice(index, 1);
  }

  toggleSplitMode() {
    this.splitMode = !this.splitMode;
    this.selectedForSplit.clear();
  }

  toggleItemSplit(index: number) {
    if (this.selectedForSplit.has(index)) {
      this.selectedForSplit.delete(index);
    } else {
      this.selectedForSplit.add(index);
    }
  }

  showSplitPaymentModal = false;
  splitCartItems: CartItem[] = [];
  splitTotalAmount = 0;
  splitPayments: { method: string, amount: number }[] = [];
  splitAmountPaid = 0;

  paySplitItems() {
    if (this.selectedForSplit.size === 0) return;

    // Create a temporary cart with selected items
    this.splitCartItems = this.cartItems.filter((_, index) => this.selectedForSplit.has(index));

    // Calculate total for split items
    const splitSubtotal = this.splitCartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const splitTax = splitSubtotal * this.taxRate;
    this.splitTotalAmount = splitSubtotal + splitTax; // Add service charge/tip logic if needed later

    this.splitPayments = [];
    this.splitAmountPaid = 0;
    this.showSplitPaymentModal = true;
  }

  addSplitPayment(method: string, amount: number) {
    if (amount <= 0) return;
    this.splitPayments.push({ method, amount });
    this.splitAmountPaid = 0;
  }

  removeSplitPayment(index: number) {
    this.splitPayments.splice(index, 1);
  }

  getSplitTotalPaid(): number {
    return this.splitPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  getSplitRemaining(): number {
    return Math.max(0, this.splitTotalAmount - this.getSplitTotalPaid());
  }

  closeSplitPaymentModal() {
    this.showSplitPaymentModal = false;
    this.splitCartItems = [];
    this.splitPayments = [];
  }

  completeSplitSale() {
    // Check for shift requirement
    if (this.shiftSettings?.shiftMode === 'MANUAL' && this.shiftSettings?.requireShiftForSales && !this.currentShift) {
      alert('A shift must be open to process sales. Please open a shift first.');
      return;
    }

    const totalPaid = this.getSplitTotalPaid();

    // Auto-add cash if no payments but amount entered (or if exact amount needed)
    if (this.splitPayments.length === 0 && this.splitAmountPaid > 0) {
      this.addSplitPayment('CASH', this.splitAmountPaid);
    } else if (this.splitPayments.length === 0) {
      // If still 0, maybe they want to pay full with one method? 
      // For now require explicit add, or we can auto-add remaining as cash if they click complete?
      // Let's enforce adding payment.
    }

    // Re-calculate after potential auto-add
    const finalTotalPaid = this.getSplitTotalPaid();

    if (finalTotalPaid < this.splitTotalAmount) {
      alert(`Insufficient payment! Remaining: ${(this.splitTotalAmount - finalTotalPaid).toFixed(2)}`);
      return;
    }

    this.processing = true;

    const saleRequest: CreateSaleRequest = {
      items: this.splitCartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        taxRate: this.taxRate,
        discount: 0,
        totalPrice: item.subtotal
      })),
      paymentMethod: this.splitPayments.length > 1 ? 'SPLIT' : (this.splitPayments[0]?.method as any || 'CASH'),
      payments: this.splitPayments.map(p => ({ paymentMethod: p.method, amount: p.amount })),
      subtotal: this.splitCartItems.reduce((sum, item) => sum + item.subtotal, 0),
      taxAmount: this.splitCartItems.reduce((sum, item) => sum + item.subtotal, 0) * this.taxRate,
      discountAmount: 0,
      totalAmount: this.splitTotalAmount,
      cashReceived: this.splitPayments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0),
      changeGiven: Math.max(0, finalTotalPaid - this.splitTotalAmount),
      shiftId: this.currentShift?.id?.toString() || undefined,
      tableId: this.selectedTableId || undefined,
      orderType: this.orderType,
      status: 'COMPLETED'
    } as any;

    this.saleService.createSale(saleRequest).subscribe({
      next: (sale) => {
        this.processing = false;
        // Remove paid items from main cart
        this.cartItems = this.cartItems.filter((_, index) => !this.selectedForSplit.has(index));
        this.selectedForSplit.clear();
        this.splitMode = false;
        this.closeSplitPaymentModal();
        this.calculateTotal();
        this.preserveCartOnClose = true; // Split sale, keep remaining items
        this.showSuccessModal = true; // Reuse success modal? Or simple alert?
        this.lastSaleTotal = this.splitTotalAmount;
        this.lastSaleChange = saleRequest.changeGiven || 0;
        // We need to be careful reusing showSuccessModal because it resets cart on close.
        // We DON'T want to reset the whole cart, just the split items are gone.
        // So let's just show an alert or a specific success message.
        alert(`Split Sale Completed! Change: ${(saleRequest.changeGiven || 0).toFixed(2)}`);
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to process split sale:', err);
        alert('Failed to process split payment.');
      }
    });
  }

  completeSale() {
    if (this.cartItems.length === 0) return;

    // Check for shift requirement
    if (this.shiftSettings?.shiftMode === 'MANUAL' && this.shiftSettings?.requireShiftForSales && !this.currentShift) {
      alert('A shift must be open to process sales. Please open a shift first.');
      return;
    }

    // If no payments added but amountPaid > 0 (single cash payment flow), add it
    if (this.payments.length === 0 && this.amountPaid > 0) {
      this.addPayment('CASH', this.amountPaid);
    }

    const totalPaid = this.getTotalPaid();
    const total = this.getTotal();

    if (totalPaid < total) {
      alert(`Insufficient payment! Remaining: ${(total - totalPaid).toFixed(2)}`);
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
      paymentMethod: this.payments.length > 1 ? 'SPLIT' : (this.payments[0]?.method as any || 'CASH'),
      payments: this.payments.map(p => ({ paymentMethod: p.method, amount: p.amount })),
      subtotal: this.getSubtotal(),
      taxAmount: this.getTax(),
      discountAmount: this.discountAmount,
      totalAmount: total,
      cashReceived: this.payments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0),
      changeGiven: Math.max(0, totalPaid - total),
      shiftId: this.currentShift?.id?.toString() || undefined,
      tableId: this.selectedTableId || undefined,
      orderType: this.orderType,
      tipAmount: this.tipAmount,
      serviceCharge: this.getServiceCharge()
    };

    this.saleService.createSale(saleRequest).subscribe({
      next: (sale) => {
        this.processing = false;
        this.lastSaleTotal = total;
        this.lastSaleChange = saleRequest.changeGiven || 0;
        this.preserveCartOnClose = false; // Full sale, clear cart
        this.showSuccessModal = true;
        this.loadProducts();
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to complete sale:', err);
        alert('Failed to complete sale. Please try again.');
      }
    });
  }

  preserveCartOnClose = false;

  closeSuccessModal() {
    this.showSuccessModal = false;
    if (!this.preserveCartOnClose) {
      this.cartItems = [];
      this.discountAmount = 0;
      this.amountPaid = 0;
      this.paymentMethod = 'CASH';
      this.selectedTableId = null;
      this.selectedTable = null;
    }
    this.preserveCartOnClose = false; // Reset flag
    this.searchTerm = '';
    this.filterCategory = '';
    this.loadTablesAndFloors(); // Reload to get updated table statuses
    this.onSearch();
  }

  toggleModifier(groupId: string, modifier: Modifier, group: ModifierGroup) {
    const groupModifiers = this.selectedModifiers.get(groupId) || [];
    const existingIndex = groupModifiers.findIndex(m => m.modifierId === modifier.id);
    const maxSelections = group.maxSelection || group.maxSelections || 999;
    const modifierPrice = +(modifier.priceAdjustment || modifier.price || 0);

    if (existingIndex !== -1) {
      // Remove modifier
      groupModifiers.splice(existingIndex, 1);
    } else {
      // Check max selections for radio-style groups
      if (maxSelections === 1) {
        // Clear previous selection (radio behavior)
        this.selectedModifiers.set(groupId, [{
          modifierId: modifier.id!,
          name: modifier.name,
          price: modifierPrice
        }]);
        return;
      }

      // Check if max selections reached
      if (groupModifiers.length >= maxSelections) {
        alert(`You can only select up to ${maxSelections} options for ${group.name}`);
        return;
      }

      // Add modifier
      groupModifiers.push({
        modifierId: modifier.id!,
        name: modifier.name,
        price: modifierPrice
      });
    }

    this.selectedModifiers.set(groupId, groupModifiers);
  }

  isModifierSelected(groupId: string, modifierId: string): boolean {
    const groupModifiers = this.selectedModifiers.get(groupId) || [];
    return groupModifiers.some(m => m.modifierId === modifierId);
  }

  confirmModifierSelection() {
    // Validate required groups
    for (const group of this.productModifiers) {
      if (group.isRequired) {
        const selections = this.selectedModifiers.get(group.id!) || [];
        if (selections.length === 0) {
          alert(`Please select at least one option for ${group.name}`);
          return;
        }
      }
    }

    // Flatten all selected modifiers into a single array
    const allModifiers: SelectedModifier[] = [];
    this.selectedModifiers.forEach((modifiers) => {
      allModifiers.push(...modifiers);
    });

    // Add to cart with modifiers
    if (this.selectedProduct) {
      this.addItemToCart(this.selectedProduct, allModifiers);
    }

    this.closeModifierModal();
  }

  closeModifierModal() {
    this.showModifierModal = false;
    this.selectedProduct = null;
    this.productModifiers = [];
    this.selectedModifiers.clear();
  }

  getModifierTotal(): number {
    let total = 0;
    this.selectedModifiers.forEach((modifiers) => {
      total += modifiers.reduce((sum, m) => sum + m.price, 0);
    });
    return total;
  }

  getProductImageUrl(productId: string): string {
    return `/api/products/${productId}/image`;
  }
}
