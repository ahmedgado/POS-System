import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="totalPages > 1" style="display:flex;align-items:center;justify-content:space-between;padding:20px;background:#fff;border-top:1px solid #e5e5e5;">
      <!-- Left: Page Info -->
      <div style="font-size:14px;color:#666;">
        Showing {{ getStartItem() }} - {{ getEndItem() }} of {{ totalCount }} items
      </div>

      <!-- Center: Page Numbers -->
      <div style="display:flex;align-items:center;gap:8px;">
        <!-- Previous Button -->
        <button
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
          [style.opacity]="currentPage === 1 ? '0.5' : '1'"
          [style.cursor]="currentPage === 1 ? 'not-allowed' : 'pointer'"
          style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-weight:600;color:#666;">
          ← Previous
        </button>

        <!-- First Page -->
        <button
          *ngIf="currentPage > 3"
          (click)="goToPage(1)"
          style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-weight:600;color:#666;cursor:pointer;">
          1
        </button>

        <!-- Ellipsis -->
        <span *ngIf="currentPage > 4" style="padding:8px;color:#999;">...</span>

        <!-- Page Numbers (show 5 pages around current) -->
        <button
          *ngFor="let page of getPageNumbers()"
          (click)="goToPage(page)"
          [style.background]="page === currentPage ? '#DC3545' : '#fff'"
          [style.color]="page === currentPage ? '#fff' : '#666'"
          [style.border]="page === currentPage ? 'none' : '1px solid #ddd'"
          style="padding:8px 12px;border-radius:6px;font-weight:600;cursor:pointer;min-width:40px;">
          {{ page }}
        </button>

        <!-- Ellipsis -->
        <span *ngIf="currentPage < totalPages - 3" style="padding:8px;color:#999;">...</span>

        <!-- Last Page -->
        <button
          *ngIf="currentPage < totalPages - 2"
          (click)="goToPage(totalPages)"
          style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-weight:600;color:#666;cursor:pointer;">
          {{ totalPages }}
        </button>

        <!-- Next Button -->
        <button
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          [style.opacity]="currentPage === totalPages ? '0.5' : '1'"
          [style.cursor]="currentPage === totalPages ? 'not-allowed' : 'pointer'"
          style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#fff;font-weight:600;color:#666;">
          Next →
        </button>
      </div>

      <!-- Right: Page Size Selector -->
      <div style="display:flex;align-items:center;gap:8px;">
        <label style="font-size:14px;color:#666;">Items per page:</label>
        <select
          [(ngModel)]="pageSize"
          (change)="onPageSizeChange()"
          style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;cursor:pointer;">
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
          <option [value]="100">100</option>
        </select>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 25;
  @Input() totalCount: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, this.currentPage + 2);

    // Adjust if we're near the beginning
    if (this.currentPage <= 3) {
      end = Math.min(this.totalPages, maxVisible);
    }

    // Adjust if we're near the end
    if (this.currentPage >= this.totalPages - 2) {
      start = Math.max(1, this.totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(): void {
    this.pageSizeChange.emit(this.pageSize);
  }

  getStartItem(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }
}
