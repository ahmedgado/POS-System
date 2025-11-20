import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Shift, ShiftService } from '../services/shift.service';
import { AuthService } from '../services/auth.service';
import { PaginationComponent } from '../components/pagination.component';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PaginationComponent],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🕐 {{ 'shifts.title' | translate }}</h1>
          <div style="color:rgba(255,255,255,0.9);">{{ cashierName }}</div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Current Shift Status -->
        <section style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <h2 style="margin:0 0 20px 0;color:#333;font-size:18px;font-weight:600;">{{ 'shifts.currentShift' | translate }}</h2>

          <!-- No Active Shift -->
          <div *ngIf="!currentShift && !loading" style="text-align:center;padding:40px 20px;">
            <div style="font-size:64px;margin-bottom:16px;">🕐</div>
            <div style="font-size:18px;color:#666;margin-bottom:24px;">{{ 'shifts.noActiveShift' | translate }}</div>
            <button
              (click)="showOpenShiftModal = true"
              style="background:#28a745;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
              🔓 {{ 'shifts.openNewShift' | translate }}
            </button>
          </div>

          <!-- Active Shift -->
          <div *ngIf="currentShift">
            <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:#fff;padding:24px;border-radius:12px;margin-bottom:24px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-size:14px;opacity:0.9;margin-bottom:8px;">{{ 'shifts.shiftStarted' | translate }}</div>
                  <div style="font-size:24px;font-weight:700;">{{ formatTime(currentShift.startTime) }}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:14px;opacity:0.9;margin-bottom:8px;">{{ 'shifts.startingCash' | translate }}</div>
                  <div style="font-size:24px;font-weight:700;">\${{ toNumber(currentShift.startingCash).toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">
              <div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.totalSales' | translate }}</div>
                <div style="font-size:28px;font-weight:700;color:#DC3545;">{{ currentShift.totalSales || 0 }}</div>
              </div>
              <div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.totalOrders' | translate }}</div>
                <div style="font-size:28px;font-weight:700;color:#007bff;">{{ currentShift.totalTransactions || currentShift.totalOrders || 0 }}</div>
              </div>
              <div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.expectedCash' | translate }}</div>
                <div style="font-size:28px;font-weight:700;color:#28a745;">\${{ toNumber(currentShift.expectedCash).toFixed(2) }}</div>
              </div>
            </div>

            <div style="text-align:center;">
              <button
                (click)="showCloseShiftModal = true"
                style="background:#dc3545;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
                🔒 {{ 'shifts.closeShift' | translate }}
              </button>
            </div>
          </div>
        </section>

        <!-- Shift History -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#333;font-size:16px;font-weight:600;">{{ 'shifts.shiftHistory' | translate }}</h2>
          </div>

          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">
            {{ 'common.loading' | translate }}...
          </div>

          <div *ngIf="!loading && shifts.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">📋</div>
            <div style="font-size:16px;">{{ 'common.noData' | translate }}</div>
          </div>

          <div *ngIf="!loading && shifts.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">#</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.cashier' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.startTime' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.endTime' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.startingCash' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.endingCash' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.difference' | translate }}</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.status' | translate }}</th>
                  <th style="padding:16px 24px;text-align:center;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">{{ 'shifts.actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let shift of shifts; let i = index"
                  style="border-bottom:1px solid #f0f0f0;"
                  (mouseenter)="$event.currentTarget.style.background='#f8f9fa'"
                  (mouseleave)="$event.currentTarget.style.background='#fff'">
                  <td style="padding:16px 24px;color:#666;">{{ i + 1 }}</td>
                  <td style="padding:16px 24px;color:#333;font-weight:600;">{{ shift.cashierName }}</td>
                  <td style="padding:16px 24px;color:#666;">{{ formatTime(shift.startTime) }}</td>
                  <td style="padding:16px 24px;color:#666;">{{ shift.endTime ? formatTime(shift.endTime) : '-' }}</td>
                  <td style="padding:16px 24px;color:#28a745;font-weight:700;">\${{ toNumber(shift.startingCash).toFixed(2) }}</td>
                  <td style="padding:16px 24px;color:#007bff;font-weight:700;">{{ shift.endingCash ? '$' + toNumber(shift.endingCash).toFixed(2) : '-' }}</td>
                  <td style="padding:16px 24px;font-weight:700;" [style.color]="getDifferenceColor(shift.difference)">
                    {{ shift.difference !== undefined ? (shift.difference >= 0 ? '+' : '') + '$' + toNumber(shift.difference).toFixed(2) : '-' }}
                  </td>
                  <td style="padding:16px 24px;">
                    <span
                      [style.background]="shift.status === 'OPEN' ? '#28a745' : '#6c757d'"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ shift.status }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;text-align:center;">
                    <button
                      (click)="viewShiftDetails(shift)"
                      style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                      {{ 'common.view' | translate }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <app-pagination
            *ngIf="!loading && shifts.length > 0"
            [currentPage]="currentPage"
            [pageSize]="pageSize"
            [totalCount]="totalCount"
            [totalPages]="totalPages"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
        </section>
      </main>
    </div>

    <!-- Open Shift Modal -->
    <div *ngIf="showOpenShiftModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="showOpenShiftModal = false">
      <div style="background:#fff;border-radius:16px;max-width:500px;width:100%;padding:32px;" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;color:#333;font-size:24px;font-weight:700;text-align:center;">🔓 {{ 'shifts.openNewShift' | translate }}</h2>

        <form (submit)="openShift(); $event.preventDefault()">
          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              {{ 'shifts.startingCash' | translate }} <span style="color:#dc3545;">*</span>
            </label>
            <input
              type="number"
              [(ngModel)]="startingCash"
              name="startingCash"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              style="width:100%;padding:14px;border:2px solid #ddd;border-radius:8px;font-size:18px;font-weight:700;outline:none;"
            />
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              {{ 'shifts.notes' | translate }}
            </label>
            <textarea
              [(ngModel)]="openNotes"
              name="notes"
              [placeholder]="'shifts.addNotes' | translate"
              rows="3"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;resize:vertical;"
            ></textarea>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing || !startingCash || startingCash < 0"
              style="flex:1;background:#28a745;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;"
              [style.opacity]="processing || !startingCash || startingCash < 0 ? '0.5' : '1'">
              {{ processing ? ('common.loading' | translate) + '...' : ('shifts.openNewShift' | translate) }}
            </button>
            <button
              type="button"
              (click)="showOpenShiftModal = false"
              style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;">
              {{ 'common.cancel' | translate }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div *ngIf="showCloseShiftModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="showCloseShiftModal = false">
      <div style="background:#fff;border-radius:16px;max-width:500px;width:100%;padding:32px;" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;color:#333;font-size:24px;font-weight:700;text-align:center;">🔒 {{ 'shifts.closeShift' | translate }}</h2>

        <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;text-align:center;">
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.startingCash' | translate }}</div>
              <div style="font-size:20px;font-weight:700;color:#28a745;">\${{ toNumber(currentShift?.startingCash).toFixed(2) }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.expectedCash' | translate }}</div>
              <div style="font-size:20px;font-weight:700;color:#007bff;">\${{ toNumber(currentShift?.expectedCash).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <form (submit)="closeShift(); $event.preventDefault()">
          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              {{ 'shifts.actualCash' | translate }} <span style="color:#dc3545;">*</span>
            </label>
            <input
              type="number"
              [(ngModel)]="endingCash"
              name="endingCash"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              (input)="calculateDifference()"
              style="width:100%;padding:14px;border:2px solid #ddd;border-radius:8px;font-size:18px;font-weight:700;outline:none;"
            />
          </div>

          <div *ngIf="endingCash > 0" style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:24px;text-align:center;">
            <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.difference' | translate }}</div>
            <div style="font-size:28px;font-weight:700;" [style.color]="getDifferenceColor(calculatedDifference)">
              {{ calculatedDifference >= 0 ? '+' : '' }}\${{ calculatedDifference.toFixed(2) }}
            </div>
            <div style="font-size:12px;color:#666;margin-top:4px;">
              {{ calculatedDifference === 0 ? '✅ Perfect balance!' : calculatedDifference > 0 ? '⬆️ Overage' : '⬇️ Shortage' }}
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              {{ 'shifts.notes' | translate }} (Optional)
            </label>
            <textarea
              [(ngModel)]="closeNotes"
              name="notes"
              [placeholder]="'shifts.addNotes' | translate"
              rows="3"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;resize:vertical;"
            ></textarea>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing || !endingCash || endingCash < 0"
              style="flex:1;background:#dc3545;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;"
              [style.opacity]="processing || !endingCash || endingCash < 0 ? '0.5' : '1'">
              {{ processing ? (('common.loading' | translate) + '...') : ('shifts.closeShift' | translate) }}
            </button>
            <button
              type="button"
              (click)="showCloseShiftModal = false"
              style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;">
              {{ 'common.cancel' | translate }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift Details Modal -->
    <div *ngIf="selectedShift"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="selectedShift = null">
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;" (click)="$event.stopPropagation()">
        <div style="padding:24px;border-bottom:2px solid #DC3545;">
          <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">{{ 'shifts.shiftHistory' | translate }}</h2>
        </div>

        <div style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.cashier' | translate }}</div>
              <div style="color:#333;font-weight:600;">{{ selectedShift.cashierName }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.status' | translate }}</div>
              <span [style.background]="selectedShift.status === 'OPEN' ? '#28a745' : '#6c757d'"
                    style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                {{ selectedShift.status }}
              </span>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.startTime' | translate }}</div>
              <div style="color:#333;font-weight:600;">{{ formatTime(selectedShift.startTime) }}</div>
            </div>
            <div>
              <div style="color:#666;font-size:13px;margin-bottom:4px;">{{ 'shifts.endTime' | translate }}</div>
              <div style="color:#333;font-weight:600;">{{ selectedShift.endTime ? formatTime(selectedShift.endTime) : 'Ongoing' }}</div>
            </div>
          </div>

          <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px;">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.startingCash' | translate }}</div>
                <div style="font-size:24px;font-weight:700;color:#28a745;">\${{ toNumber(selectedShift.startingCash).toFixed(2) }}</div>
              </div>
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.endingCash' | translate }}</div>
                <div style="font-size:24px;font-weight:700;color:#007bff;">
                  {{ selectedShift.endingCash ? '$' + toNumber(selectedShift.endingCash).toFixed(2) : '-' }}
                </div>
              </div>
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.expectedCash' | translate }}</div>
                <div style="font-size:24px;font-weight:700;color:#6c757d;">
                  {{ selectedShift.expectedCash ? '$' + toNumber(selectedShift.expectedCash).toFixed(2) : '-' }}
                </div>
              </div>
              <div style="text-align:center;">
                <div style="color:#666;font-size:13px;margin-bottom:8px;">{{ 'shifts.difference' | translate }}</div>
                <div style="font-size:24px;font-weight:700;" [style.color]="getDifferenceColor(selectedShift.difference)">
                  {{ selectedShift.difference !== undefined ? (selectedShift.difference >= 0 ? '+' : '') + '$' + toNumber(selectedShift.difference).toFixed(2) : '-' }}
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="selectedShift.notes" style="background:#fff3cd;border:1px solid #ffc107;padding:16px;border-radius:8px;">
            <div style="font-weight:600;color:#856404;margin-bottom:8px;">{{ 'shifts.notes' | translate }}:</div>
            <div style="color:#856404;">{{ selectedShift.notes }}</div>
          </div>
        </div>

        <div style="padding:20px 24px;border-top:1px solid #eee;">
          <button
            (click)="selectedShift = null"
            style="width:100%;background:#DC3545;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer;">
            {{ 'common.close' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ShiftsComponent implements OnInit {
  shifts: Shift[] = [];
  currentShift: Shift | null = null;
  selectedShift: Shift | null = null;
  loading = false;
  processing = false;

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 1;

  showOpenShiftModal = false;
  showCloseShiftModal = false;

  startingCash = 0;
  endingCash = 0;
  calculatedDifference = 0;
  openNotes = '';
  closeNotes = '';

  cashierName = '';

  constructor(
    private shiftService: ShiftService,
    private authService: AuthService
  ) {
    this.cashierName = this.authService.currentUser?.firstName || 'Cashier';
  }

  ngOnInit() {
    this.loadCurrentShift();
    this.loadShifts();
  }

  loadCurrentShift() {
    this.shiftService.getCurrent().subscribe({
      next: (shift) => {
        this.currentShift = shift;
      },
      error: (err) => {
        console.error('Failed to load current shift:', err);
      }
    });
  }

  loadShifts() {
    this.loading = true;
    this.shiftService.getAll(this.currentPage, this.pageSize, 'CLOSED').subscribe({
      next: (response) => {
        this.shifts = response.data || [];
        this.totalCount = response.pagination?.total || 0;
        this.totalPages = response.pagination?.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load shifts:', err);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadShifts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadShifts();
  }

  openShift() {
    if (!this.startingCash || this.startingCash < 0) return;

    this.processing = true;
    this.shiftService.openShift(this.startingCash, this.openNotes).subscribe({
      next: (shift) => {
        this.processing = false;
        this.currentShift = shift;
        this.showOpenShiftModal = false;
        this.startingCash = 0;
        this.openNotes = '';
        this.loadShifts();
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to open shift:', err);
        alert('Failed to open shift. Please try again.');
      }
    });
  }

  closeShift() {
    if (!this.endingCash || this.endingCash < 0) return;

    this.processing = true;
    this.shiftService.closeShift(this.endingCash, this.closeNotes).subscribe({
      next: () => {
        this.processing = false;
        this.currentShift = null;
        this.showCloseShiftModal = false;
        this.endingCash = 0;
        this.closeNotes = '';
        this.calculatedDifference = 0;
        this.loadShifts();
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to close shift:', err);
        alert('Failed to close shift. Please try again.');
      }
    });
  }

  calculateDifference() {
    if (this.currentShift && this.endingCash > 0) {
      this.calculatedDifference = this.endingCash - (this.currentShift.expectedCash || 0);
    } else {
      this.calculatedDifference = 0;
    }
  }

  getDifferenceColor(difference?: number): string {
    if (difference === undefined || difference === null) return '#6c757d';
    if (difference === 0) return '#28a745';
    if (difference > 0) return '#007bff';
    return '#dc3545';
  }

  viewShiftDetails(shift: Shift) {
    this.selectedShift = shift;
  }

  formatTime(dateString: string | null | undefined): string {
    if (!dateString) {
      return '-';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }

      // Format: MM/DD/YYYY, HH:MM AM/PM
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '-';
    }
  }

  toNumber(value: any): number {
    return Number(value) || 0;
  }
}
