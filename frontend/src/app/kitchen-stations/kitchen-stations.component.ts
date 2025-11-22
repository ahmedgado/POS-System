import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface KitchenStation {
  id: string;
  name: string;
  description?: string;
  printerIp?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

@Component({
  selector: 'app-kitchen-stations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🍳 Kitchen Stations</h1>
          <button *ngIf="canEdit()" (click)="openModal()" 
                  style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            + Add Station
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
      <div style="background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
              <th style="padding:20px;text-align:left;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Station Name</th>
              <th style="padding:20px;text-align:left;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Description</th>
              <th style="padding:20px;text-align:left;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Printer IP</th>
              <th style="padding:20px;text-align:center;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Products</th>
              <th style="padding:20px;text-align:center;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Status</th>
              <th *ngIf="canEdit()" style="padding:20px;text-align:center;font-weight:700;color:#d4af37;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let station of stations; let i = index" 
                [style.background]="i % 2 === 0 ? '#fff' : '#f8f6f4'"
                style="border-bottom:1px solid #e5e5e5;transition:all 0.2s;"
                (mouseenter)="$event.currentTarget.style.background='#fff9e6'"
                (mouseleave)="$event.currentTarget.style.background=i % 2 === 0 ? '#fff' : '#f8f6f4'">
              <td style="padding:20px;font-weight:600;color:#1a1a1a;font-size:15px;">{{ station.name }}</td>
              <td style="padding:20px;color:#666;font-size:14px;">{{ station.description || '-' }}</td>
              <td style="padding:20px;font-family:'Courier New',monospace;color:#d4af37;font-weight:600;font-size:14px;">{{ station.printerIp || 'Not set' }}</td>
              <td style="padding:20px;text-align:center;">
                <span style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;">
                  {{ station._count?.products || 0 }}
                </span>
              </td>
              <td style="padding:20px;text-align:center;">
                <span [style.background]="station.isActive ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'" 
                      style="color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;">
                  {{ station.isActive ? '✓ Active' : '✗ Inactive' }}
                </span>
              </td>
              <td *ngIf="canEdit()" style="padding:20px;text-align:center;">
                <div style="display:flex;gap:8px;justify-content:center;">
                  <button (click)="openModal(station)" 
                          style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;"
                          (mouseenter)="$event.target.style.transform='translateY(-2px)'"
                          (mouseleave)="$event.target.style.transform='translateY(0)'">
                    ✏️ Edit
                  </button>
                  <button (click)="deleteStation(station)" 
                          style="background:linear-gradient(135deg, #dc3545 0%, #c82333 100%);color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px;transition:all 0.2s;"
                          (mouseenter)="$event.target.style.transform='translateY(-2px)'"
                          (mouseleave)="$event.target.style.transform='translateY(0)'">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="stations.length === 0">
              <td colspan="6" style="padding:60px;text-align:center;color:#999;font-size:16px;">
                <div style="font-size:48px;margin-bottom:16px;">🍳</div>
                <div style="font-weight:600;margin-bottom:8px;">No kitchen stations yet</div>
                <div>Click "Add Station" to create your first station</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </main>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);" (click)="closeModal()">
      <div style="background:#fff;border-radius:20px;width:90%;max-width:600px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.3);" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;font-size:28px;font-weight:700;color:#1a1a1a;display:flex;align-items:center;gap:12px;">
          <span style="font-size:32px;">{{ editMode ? '✏️' : '➕' }}</span>
          {{ editMode ? 'Edit Station' : 'Add New Station' }}
        </h2>

        <div style="margin-bottom:20px;">
          <label style="display:block;font-weight:700;color:#1a1a1a;margin-bottom:8px;font-size:14px;">Station Name *</label>
          <input [(ngModel)]="formData.name" type="text" placeholder="e.g., Grill Station" 
                 style="width:100%;padding:14px;border:2px solid #e5e5e5;border-radius:10px;font-size:15px;transition:all 0.2s;"
                 (focus)="$event.target.style.borderColor='#d4af37'"
                 (blur)="$event.target.style.borderColor='#e5e5e5'">
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block;font-weight:700;color:#1a1a1a;margin-bottom:8px;font-size:14px;">Description</label>
          <textarea [(ngModel)]="formData.description" placeholder="Optional description" rows="3"
                    style="width:100%;padding:14px;border:2px solid #e5e5e5;border-radius:10px;font-size:15px;resize:vertical;transition:all 0.2s;"
                    (focus)="$event.target.style.borderColor='#d4af37'"
                    (blur)="$event.target.style.borderColor='#e5e5e5'"></textarea>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block;font-weight:700;color:#1a1a1a;margin-bottom:8px;font-size:14px;">🖨️ Printer IP Address</label>
          <input [(ngModel)]="formData.printerIp" type="text" placeholder="e.g., 192.168.1.10" 
                 style="width:100%;padding:14px;border:2px solid #e5e5e5;border-radius:10px;font-size:15px;font-family:'Courier New',monospace;transition:all 0.2s;"
                 (focus)="$event.target.style.borderColor='#d4af37'"
                 (blur)="$event.target.style.borderColor='#e5e5e5'">
          <small style="color:#666;font-size:13px;margin-top:6px;display:block;">IP address of the network printer for this station</small>
        </div>

        <div style="margin-bottom:20px;">
          <label style="display:block;font-weight:700;color:#1a1a1a;margin-bottom:8px;font-size:14px;">Sort Order</label>
          <input [(ngModel)]="formData.sortOrder" type="number" min="0" 
                 style="width:100%;padding:14px;border:2px solid #e5e5e5;border-radius:10px;font-size:15px;transition:all 0.2s;"
                 (focus)="$event.target.style.borderColor='#d4af37'"
                 (blur)="$event.target.style.borderColor='#e5e5e5'">
        </div>

        <div *ngIf="editMode" style="margin-bottom:24px;">
          <label style="display:flex;align-items:center;cursor:pointer;padding:12px;background:#f8f6f4;border-radius:10px;">
            <input [(ngModel)]="formData.isActive" type="checkbox" style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
            <span style="font-weight:700;color:#1a1a1a;font-size:15px;">Active Station</span>
          </label>
        </div>

        <div *ngIf="error" style="background:linear-gradient(135deg, #dc3545 0%, #c82333 100%);color:#fff;padding:16px;border-radius:10px;margin-bottom:20px;font-size:14px;font-weight:600;">
          ⚠️ {{ error }}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button (click)="closeModal()" 
                  style="background:#e5e5e5;color:#666;border:none;padding:14px 28px;border-radius:10px;cursor:pointer;font-weight:700;font-size:15px;transition:all 0.2s;"
                  (mouseenter)="$event.target.style.background='#d5d5d5'"
                  (mouseleave)="$event.target.style.background='#e5e5e5'">
            Cancel
          </button>
          <button (click)="saveStation()" [disabled]="saving" 
                  style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:14px 28px;border-radius:10px;cursor:pointer;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(212,175,55,0.3);transition:all 0.2s;"
                  [style.opacity]="saving ? '0.6' : '1'"
                  [style.cursor]="saving ? 'not-allowed' : 'pointer'"
                  (mouseenter)="!saving && ($event.target.style.transform='translateY(-2px)');!saving && ($event.target.style.boxShadow='0 6px 16px rgba(212,175,55,0.4)')"
                  (mouseleave)="$event.target.style.transform='translateY(0)';$event.target.style.boxShadow='0 4px 12px rgba(212,175,55,0.3)'">
            {{ saving ? '⏳ Saving...' : (editMode ? '💾 Update' : '➕ Create') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class KitchenStationsComponent implements OnInit {
  stations: KitchenStation[] = [];
  showModal = false;
  editMode = false;
  saving = false;
  error = '';
  userRole = '';
  formData: any = {
    name: '',
    description: '',
    printerIp: '',
    sortOrder: 0,
    isActive: true
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.userRole = currentUser.role;
    }
    this.loadStations();
  }

  hasAccess(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.userRole);
  }

  canEdit(): boolean {
    return this.hasAccess(['ADMIN', 'MANAGER']);
  }

  loadStations() {
    this.http.get<any>('/api/kitchen-stations').subscribe({
      next: (response) => {
        this.stations = response.data || [];
      },
      error: (err) => {
        console.error('Failed to load stations', err);
      }
    });
  }

  openModal(station?: KitchenStation) {
    this.editMode = !!station;
    if (station) {
      this.formData = { ...station };
    } else {
      this.formData = {
        name: '',
        description: '',
        printerIp: '',
        sortOrder: 0,
        isActive: true
      };
    }
    this.error = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.formData = {
      name: '',
      description: '',
      printerIp: '',
      sortOrder: 0,
      isActive: true
    };
    this.error = '';
  }

  saveStation() {
    if (!this.formData.name) {
      this.error = 'Station name is required';
      return;
    }

    this.saving = true;
    this.error = '';

    const request = this.editMode
      ? this.http.put<any>(`/api/kitchen-stations/${this.formData.id}`, this.formData)
      : this.http.post<any>('/api/kitchen-stations', this.formData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadStations();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Failed to save station';
      }
    });
  }

  deleteStation(station: KitchenStation) {
    if (!confirm(`Delete "${station.name}"? This cannot be undone.`)) return;

    this.http.delete(`/api/kitchen-stations/${station.id}`).subscribe({
      next: () => this.loadStations(),
      error: (err) => {
        alert(err?.error?.message || 'Failed to delete station');
      }
    });
  }
}
