import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { KitchenService, KitchenStation } from '../services/kitchen.service';
import { Product, ProductService } from '../services/product.service';

interface ProductStationLink {
  id: string;
  productId: string;
  kitchenStationId: string;
  product: {
    id: string;
    name: string;
    category: { name: string };
  };
  kitchenStation: {
    id: string;
    name: string;
  };
}

@Component({
  selector: 'app-product-stations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:calc(100vh - 60px);background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <h1 style="margin:0;font-size:24px;font-weight:700;">🍳 Station Assignment</h1>
      </header>

      <main style="padding:32px;">
        <!-- Link Products Section -->
        <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 20px 0;color:#333;">Link Product to Station</h2>

          <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:16px;align-items:end;">
            <div>
              <label style="display:block;font-size:14px;font-weight:600;color:#666;margin-bottom:8px;">Product</label>
              <select [(ngModel)]="selectedProductId" style="width:100%;padding:12px;border:2px solid #e5e5e5;border-radius:8px;font-size:14px;">
                <option value="">Select a product...</option>
                <option *ngFor="let product of products" [value]="product.id">
                  {{ product.name }} ({{ product.category.name }})
                </option>
              </select>
            </div>

            <div>
              <label style="display:block;font-size:14px;font-weight:600;color:#666;margin-bottom:8px;">Kitchen Station</label>
              <select [(ngModel)]="selectedStationId" style="width:100%;padding:12px;border:2px solid #e5e5e5;border-radius:8px;font-size:14px;">
                <option value="">Select a station...</option>
                <option *ngFor="let station of stations" [value]="station.id">
                  {{ station.name }}
                </option>
              </select>
            </div>

            <button (click)="linkProductToStation()"
              [disabled]="!selectedProductId || !selectedStationId || linking"
              style="padding:12px 24px;background:linear-gradient(135deg, #c4a75b 0%, #a38a4a 100%);color:#1a1a1a;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;box-shadow:0 2px 8px rgba(196, 167, 91, 0.3);">
              {{ linking ? 'Linking...' : 'Link' }}
            </button>
          </div>

          <div *ngIf="linkMessage" [style.background]="linkSuccess ? '#d4edda' : '#f8d7da'"
            [style.color]="linkSuccess ? '#155724' : '#721c24'"
            style="margin-top:16px;padding:12px;border-radius:8px;font-size:14px;">
            {{ linkMessage }}
          </div>
        </div>

        <!-- Existing Links -->
        <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 style="font-size:20px;font-weight:700;margin:0;color:#333;">Current Product-Station Links</h2>
            <div style="color:#666;font-size:14px;">{{ links.length }} links</div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" style="text-align:center;padding:40px;color:#999;">
            <div style="font-size:32px;margin-bottom:8px;">⏳</div>
            <div>Loading links...</div>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && links.length === 0" style="text-align:center;padding:40px;color:#999;">
            <div style="font-size:48px;margin-bottom:12px;">🔗</div>
            <div style="font-size:16px;font-weight:600;margin-bottom:4px;">No links yet</div>
            <div style="font-size:14px;">Start by linking products to kitchen stations above</div>
          </div>

          <!-- Links Table -->
          <div *ngIf="!loading && links.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #e5e5e5;">
                  <th style="text-align:left;padding:12px 16px;font-weight:600;color:#666;">Product</th>
                  <th style="text-align:left;padding:12px 16px;font-weight:600;color:#666;">Category</th>
                  <th style="text-align:left;padding:12px 16px;font-weight:600;color:#666;">Kitchen Station</th>
                  <th style="text-align:center;padding:12px 16px;font-weight:600;color:#666;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let link of links" style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:16px;font-weight:600;color:#333;">{{ link.product.name }}</td>
                  <td style="padding:16px;color:#666;">{{ link.product.category.name }}</td>
                  <td style="padding:16px;">
                    <span style="background:#c4a75b;color:#1a1a1a;padding:4px 12px;border-radius:6px;font-size:13px;font-weight:600;">
                      {{ link.kitchenStation.name }}
                    </span>
                  </td>
                  <td style="padding:16px;text-align:center;">
                    <button (click)="unlinkProduct(link.id)" [disabled]="unlinking === link.id"
                      style="background:#c4a75b;color:#1a1a1a;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer;font-size:13px;">
                      {{ unlinking === link.id ? 'Unlinking...' : 'Unlink' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    select:focus, button:focus {
      outline: none;
      border-color: #c4a75b;
    }
    button:not(:disabled):hover {
      opacity: 0.9;
      transform: translateY(-1px);
      transition: all 0.2s;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ProductStationsComponent implements OnInit {
  products: Product[] = [];
  stations: KitchenStation[] = [];
  links: ProductStationLink[] = [];

  selectedProductId = '';
  selectedStationId = '';

  loading = false;
  linking = false;
  unlinking: string | null = null;

  linkMessage = '';
  linkSuccess = false;

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private kitchenService: KitchenService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadStations();
    this.loadLinks();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (response: any) => {
        this.products = response.data || response;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadStations(): void {
    this.kitchenService.getStations().subscribe({
      next: (stations) => {
        this.stations = stations;
      },
      error: (error) => {
        console.error('Error loading stations:', error);
      }
    });
  }

  loadLinks(): void {
    this.loading = true;
    this.http.get<any>('/api/restaurant/kitchen/stations/links').subscribe({
      next: (response) => {
        this.links = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading links:', error);
        this.loading = false;
      }
    });
  }

  linkProductToStation(): void {
    if (!this.selectedProductId || !this.selectedStationId) return;

    this.linking = true;
    this.linkMessage = '';

    this.http.post<any>('/api/restaurant/kitchen/stations/link', {
      productId: this.selectedProductId,
      kitchenStationId: this.selectedStationId
    }).subscribe({
      next: (response) => {
        this.linkSuccess = true;
        this.linkMessage = 'Product linked successfully!';
        this.selectedProductId = '';
        this.selectedStationId = '';
        this.loadLinks();
        this.linking = false;
        setTimeout(() => this.linkMessage = '', 3000);
      },
      error: (error) => {
        this.linkSuccess = false;
        this.linkMessage = error.error?.message || 'Failed to link product';
        this.linking = false;
      }
    });
  }

  unlinkProduct(linkId: string): void {
    if (!confirm('Are you sure you want to unlink this product from the station?')) return;

    this.unlinking = linkId;
    this.http.delete(`/api/restaurant/kitchen/stations/links/${linkId}`).subscribe({
      next: () => {
        this.loadLinks();
        this.unlinking = null;
      },
      error: (error) => {
        console.error('Error unlinking product:', error);
        alert('Failed to unlink product');
        this.unlinking = null;
      }
    });
  }
}
