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
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <div style="background:#fff;padding:20px 32px;border-bottom:1px solid #E5E5E5;margin-bottom:24px;">
        <div style="max-width:1400px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#333;">🍳 Kitchen Stations</h1>
            <p style="margin:4px 0 0 0;color:#666;font-size:14px;">Manage kitchen stations and printer IPs</p>
          </div>
          <button *ngIf="canEdit()" (click)="openModal()" style="background:#DC3545;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
            + Add Station
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div style="max-width:1400px;margin:0 auto;padding:0 32px;">
        <!-- Stations Table -->
        <div style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#F8F9FA;border-bottom:2px solid #E5E5E5;">
                <th style="padding:16px;text-align:left;font-weight:600;color:#333;">Station Name</th>
                <th style="padding:16px;text-align:left;font-weight:600;color:#333;">Description</th>
                <th style="padding:16px;text-align:left;font-weight:600;color:#333;">Printer IP</th>
                <th style="padding:16px;text-align:center;font-weight:600;color:#333;">Products</th>
                <th style="padding:16px;text-align:center;font-weight:600;color:#333;">Status</th>
                <th *ngIf="canEdit()" style="padding:16px;text-align:center;font-weight:600;color:#333;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let station of stations" style="border-top:1px solid #F0F0F0;">
                <td style="padding:16px;font-weight:600;color:#333;">{{ station.name }}</td>
                <td style="padding:16px;color:#666;">{{ station.description || '-' }}</td>
                <td style="padding:16px;font-family:monospace;color:#666;">{{ station.printerIp || 'Not set' }}</td>
                <td style="padding:16px;text-align:center;color:#666;">{{ station._count?.products || 0 }}</td>
                <td style="padding:16px;text-align:center;">
                  <span [style.background]="station.isActive ? '#D4EDDA' : '#F8D7DA'" 
                        [style.color]="station.isActive ? '#155724' : '#721C24'"
                        style="padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;">
                    {{ station.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td *ngIf="canEdit()" style="padding:16px;text-align:center;">
                  <button (click)="openModal(station)" style="background:#DC3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;">
                    Edit
                  </button>
                  <button (click)="deleteStation(station)" style="background:#6C757D;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
                    Delete
                  </button>
                </td>
              </tr>
              <tr *ngIf="stations.length === 0">
                <td colspan="6" style="padding:40px;text-align:center;color:#999;">
                  No kitchen stations yet. Click "Add Station" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;" (click)="closeModal()">
        <div style="background:#fff;border-radius:12px;width:90%;max-width:500px;padding:24px;" (click)="$event.stopPropagation()">
          <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:700;color:#333;">
            {{ editMode ? 'Edit Station' : 'Add New Station' }}
          </h2>

          <div style="margin-bottom:16px;">
            <label style="display:block;font-weight:600;color:#333;margin-bottom:6px;">Station Name *</label>
            <input [(ngModel)]="formData.name" type="text" placeholder="e.g., Grill Station" 
                   style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block;font-weight:600;color:#333;margin-bottom:6px;">Description</label>
            <textarea [(ngModel)]="formData.description" placeholder="Optional description" rows="2"
                      style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical;"></textarea>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block;font-weight:600;color:#333;margin-bottom:6px;">Printer IP Address</label>
            <input [(ngModel)]="formData.printerIp" type="text" placeholder="e.g., 192.168.1.10" 
                   style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;font-family:monospace;">
            <small style="color:#666;font-size:12px;">IP address of the network printer for this station</small>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block;font-weight:600;color:#333;margin-bottom:6px;">Sort Order</label>
            <input [(ngModel)]="formData.sortOrder" type="number" min="0" 
                   style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
          </div>

          <div *ngIf="editMode" style="margin-bottom:16px;">
            <label style="display:flex;align-items:center;cursor:pointer;">
              <input [(ngModel)]="formData.isActive" type="checkbox" style="margin-right:8px;">
              <span style="font-weight:600;color:#333;">Active</span>
            </label>
          </div>

          <div *ngIf="error" style="background:#FFE0E0;color:#DC3545;padding:12px;border-radius:6px;margin-bottom:16px;font-size:14px;">
            {{ error }}
          </div>

          <div style="display:flex;gap:12px;justify-content:flex-end;">
            <button (click)="closeModal()" style="background:#6C757D;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;">
              Cancel
            </button>
            <button (click)="saveStation()" [disabled]="saving" style="background:#DC3545;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;">
              {{ saving ? 'Saving...' : (editMode ? 'Update' : 'Create') }}
            </button>
          </div>
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
