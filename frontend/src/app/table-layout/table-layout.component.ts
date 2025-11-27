import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableService, Table } from '../services/table.service';
import { FloorService, Floor } from '../services/floor.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-table-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div style="min-height:calc(100vh - 60px);background:#f8f6f4;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;">
      
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 24px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:0.5px;">{{ 'tableLayout.title' | translate }}</h1>
          <div style="font-size:14px;color:#f8f6f4;font-weight:500;">{{ waiterName }}</div>
        </div>
      </header>

      <!-- Floor Selector -->
      <div style="background:#fff;border-bottom:1px solid #e5e0db;padding:16px 24px;">
        <div style="max-width:1400px;margin:0 auto;display:flex;gap:12px;overflow-x:auto;">
          <button
            *ngFor="let floor of floors"
            (click)="selectFloor(floor.id)"
            [style.background]="selectedFloorId === floor.id ? 'linear-gradient(135deg, #d4af37 0%, #c19a2e 100%)' : '#ffffff'"
            [style.color]="selectedFloorId === floor.id ? '#ffffff' : '#1a1a1a'"
            [style.border]="selectedFloorId === floor.id ? 'none' : '1px solid #e5e0db'"
            style="padding:12px 24px;border-radius:24px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.08);transition:all 0.2s;">
            {{ floor.name }}
          </button>
        </div>
      </div>

      <!-- Info Banner -->
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:24px auto;max-width:1400px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;">ℹ️</span>
          <span style="color:#856404;font-size:14px;font-weight:500;">{{ 'tableLayout.selectTable' | translate }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" style="text-align:center;padding:60px;max-width:1400px;margin:0 auto;">
        <div style="font-size:48px;margin-bottom:16px;">⏳</div>
        <div style="color:#666;font-size:16px;">{{ 'common.loading' | translate }}</div>
      </div>

      <!-- Table Layout -->
      <div *ngIf="!loading" style="max-width:1400px;margin:0 auto;padding:24px;">
        <div style="background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.08);padding:32px;overflow:auto;">
          <div style="position:relative;min-height:800px;min-width:1200px;border:2px dashed #e5e0db;border-radius:8px;padding:16px;">
          
          <!-- Legend -->
          <div style="display:flex;gap:24px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e0db;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:20px;height:20px;background:#28a745;border-radius:4px;"></div>
              <span style="font-size:13px;color:#666;font-weight:500;">{{ 'tableLayout.available' | translate }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:20px;height:20px;background:#dc3545;border-radius:4px;"></div>
              <span style="font-size:13px;color:#666;font-weight:500;">{{ 'tableLayout.occupied' | translate }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:20px;height:20px;background:#17a2b8;border-radius:4px;"></div>
              <span style="font-size:13px;color:#666;font-weight:500;">Cleaning</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:20px;height:20px;background:#ffc107;border-radius:4px;"></div>
              <span style="font-size:13px;color:#666;font-weight:500;">{{ 'tableLayout.reserved' | translate }}</span>
            </div>
          </div>

          <!-- Tables -->
          <div *ngIf="filteredTables.length === 0" style="text-align:center;padding:60px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">🪑</div>
            <div style="font-size:16px;">No tables on this floor</div>
          </div>

          <div *ngFor="let table of filteredTables"
               (click)="openPOSWithTable(table)"
               [style.left.px]="table.positionX || 0"
               [style.top.px]="table.positionY || 0"
               [style.background]="getStatusColor(table.status)"
               style="position:absolute;width:80px;height:80px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.2s;user-select:none;cursor:pointer;"
               (mouseenter)="$event.currentTarget.style.transform = 'scale(1.05)'"
               (mouseleave)="$event.currentTarget.style.transform = 'scale(1)'">
            <div style="font-size:18px;margin-bottom:4px;">{{ table.tableNumber }}</div>
            <div style="font-size:11px;opacity:0.9;">👥 {{ table.capacity }}</div>
          </div>
        </div>
      </div>

      <!-- Status Change Modal -->
      <div *ngIf="showStatusModal" 
           style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
           (click)="closeStatusModal()">
        <div style="background:#fff;border-radius:16px;padding:32px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);"
             (click)="$event.stopPropagation()">
          <h2 style="margin:0 0 16px 0;font-size:20px;color:#1a1a1a;">Change Table Status</h2>
          <p style="margin:0 0 24px 0;color:#666;font-size:14px;">
            Table {{ selectedTable?.tableNumber }} - Current: {{ selectedTable?.status }}
          </p>

          <div style="display:flex;flex-direction:column;gap:12px;">
            <button
              *ngIf="selectedTable?.status !== 'AVAILABLE'"
              (click)="updateTableStatus('AVAILABLE')"
              style="padding:14px;background:#28a745;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.opacity='0.9'"
              (mouseleave)="$event.currentTarget.style.opacity='1'">
              ✓ Mark as Available
            </button>

            <button
              *ngIf="selectedTable?.status !== 'OCCUPIED'"
              (click)="updateTableStatus('OCCUPIED')"
              style="padding:14px;background:#dc3545;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.opacity='0.9'"
              (mouseleave)="$event.currentTarget.style.opacity='1'">
              🍽️ Mark as Occupied
            </button>

            <button
              *ngIf="selectedTable?.status !== 'CLEANING'"
              (click)="updateTableStatus('CLEANING')"
              style="padding:14px;background:#17a2b8;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.opacity='0.9'"
              (mouseleave)="$event.currentTarget.style.opacity='1'">
              🧹 Mark as Cleaning
            </button>

            <button
              (click)="closeStatusModal()"
              style="padding:14px;background:#6c757d;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.opacity='0.9'"
              (mouseleave)="$event.currentTarget.style.opacity='1'">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TableLayoutComponent implements OnInit {
  floors: Floor[] = [];
  tables: Table[] = [];
  filteredTables: Table[] = [];
  selectedFloorId: string | null = null;
  loading = false;
  waiterName = '';
  selectedTable: Table | null = null;
  showStatusModal = false;

  constructor(
    private tableService: TableService,
    private floorService: FloorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.waiterName = this.authService.currentUser?.firstName || 'Waiter';
  }

  ngOnInit(): void {
    this.loadFloors();
    this.loadTables();
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe({
      next: (response) => {
        this.floors = (response.data || []).filter((f: Floor) => f.isActive);
        if (this.floors.length > 0 && !this.selectedFloorId) {
          this.selectedFloorId = this.floors[0].id;
          this.filterTablesByFloor();
        }
      },
      error: (err) => console.error('Failed to load floors:', err)
    });
  }

  loadTables(): void {
    this.loading = true;
    this.tableService.getTables().subscribe({
      next: (response) => {
        this.tables = (response.data || []).filter((t: Table) => t.isActive);
        this.filterTablesByFloor();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tables:', err);
        this.loading = false;
      }
    });
  }

  selectFloor(floorId: string): void {
    this.selectedFloorId = floorId;
    this.filterTablesByFloor();
  }

  filterTablesByFloor(): void {
    if (this.selectedFloorId) {
      this.filteredTables = this.tables.filter(t => t.floorId === this.selectedFloorId);
    } else {
      this.filteredTables = this.tables;
    }
  }

  openPOSWithTable(table: Table, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (table.status === 'AVAILABLE') {
      // Navigate to POS with table pre-selected
      this.router.navigate(['/app/pos'], {
        queryParams: {
          tableId: table.id,
          orderType: 'DINE_IN'
        }
      });
    } else {
      // Show status change modal for non-available tables
      this.selectedTable = table;
      this.showStatusModal = true;
    }
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedTable = null;
  }

  updateTableStatus(newStatus: string): void {
    if (!this.selectedTable) return;

    this.tableService.updateTableStatus(this.selectedTable.id, newStatus).subscribe({
      next: () => {
        // Update local table status
        const table = this.tables.find(t => t.id === this.selectedTable!.id);
        if (table) {
          table.status = newStatus as any;
        }
        this.filterTablesByFloor();
        this.closeStatusModal();
      },
      error: (err) => {
        console.error('Failed to update table status:', err);
        alert('Failed to update table status');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#28a745';
      case 'OCCUPIED': return '#dc3545';
      case 'RESERVED': return '#ffc107';
      case 'CLEANING': return '#17a2b8';
      default: return '#6c757d';
    }
  }
}
