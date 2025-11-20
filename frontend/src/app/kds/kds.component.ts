import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitchenService, KitchenStation, GroupedTicket } from '../services/kitchen.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-kds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:calc(100vh - 60px);background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h1 style="margin:0;font-size:28px;font-weight:700;">👨‍🍳 Kitchen Display System</h1>
          <div style="display:flex;gap:12px;align-items:center;">
            <button (click)="filterStatus = ''; loadTickets()"
              [style.background]="filterStatus === '' ? '#c4a75b' : '#fff'"
              [style.color]="filterStatus === '' ? '#1a1a1a' : '#333'"
              style="padding:10px 20px;border:1px solid #c4a75b;border-radius:8px;font-weight:600;cursor:pointer;">
              All
            </button>
            <button (click)="filterStatus = 'NEW'; loadTickets()"
              [style.background]="filterStatus === 'NEW' ? '#FFC107' : '#fff'"
              [style.color]="filterStatus === 'NEW' ? '#1a1a1a' : '#333'"
              style="padding:10px 20px;border:1px solid #FFC107;border-radius:8px;font-weight:600;cursor:pointer;">
              New
            </button>
            <button (click)="filterStatus = 'IN_PROGRESS'; loadTickets()"
              [style.background]="filterStatus === 'IN_PROGRESS' ? '#17a2b8' : '#fff'"
              [style.color]="filterStatus === 'IN_PROGRESS' ? '#fff' : '#333'"
              style="padding:10px 20px;border:1px solid #17a2b8;border-radius:8px;font-weight:600;cursor:pointer;">
              In Progress
            </button>
            <button (click)="filterStatus = 'READY'; loadTickets()"
              [style.background]="filterStatus === 'READY' ? '#28a745' : '#fff'"
              [style.color]="filterStatus === 'READY' ? '#fff' : '#333'"
              style="padding:10px 20px;border:1px solid #28a745;border-radius:8px;font-weight:600;cursor:pointer;">
              Ready
            </button>
            <div style="background:#fff;padding:10px 16px;border-radius:8px;color:#333;font-weight:600;border:1px solid #e5e5e5;">
              Auto-refresh: {{ countdown }}s
            </div>
          </div>
        </div>
      </header>

      <main style="padding: 0 32px 32px 32px;">
        <!-- Loading State -->
        <div *ngIf="loading && groupedTickets.length === 0" style="text-align:center;padding:60px;color:#999;">
          <div style="font-size:48px;margin-bottom:16px;">⏳</div>
          <div style="font-size:18px;">Loading tickets...</div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && groupedTickets.length === 0" style="text-align:center;padding:60px;color:#999;">
          <div style="font-size:48px;margin-bottom:16px;">✅</div>
          <div style="font-size:18px;">No tickets to display</div>
          <div style="font-size:14px;margin-top:8px;">All orders are completed!</div>
        </div>

        <!-- Tickets Grid -->
        <div *ngIf="groupedTickets.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px;">
          <div *ngFor="let ticket of groupedTickets"
            [style.border-left]="getStatusBorder(ticket.status)"
            style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.1);position:relative;">

            <!-- Ticket Header -->
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
              <div>
                <div style="font-size:24px;font-weight:700;color:#333;margin-bottom:4px;">
                  #{{ ticket.orderNumber || ticket.orderId.slice(0, 8) }}
                </div>
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                  <span *ngIf="ticket.tableNumber" style="background:#e5e5e5;color:#333;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;">
                    Table {{ ticket.tableNumber }}
                  </span>
                  <span *ngIf="ticket.station" style="background:#c4a75b;color:#1a1a1a;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;">
                    {{ ticket.station.name }}
                  </span>
                  <span style="color:#999;font-size:12px;">{{ getTimeElapsed(ticket.createdAt) }}</span>
                </div>
              </div>
              <div [style.background]="getStatusColor(ticket.status)"
                style="padding:6px 12px;border-radius:6px;color:#fff;font-size:12px;font-weight:700;">
                {{ ticket.status }}
              </div>
            </div>

            <!-- Ticket Items -->
            <div style="margin-bottom:16px;">
              <div *ngFor="let item of ticket.items" style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
                  <div style="color:#333;font-weight:600;font-size:16px;">
                    {{ item.quantity }}x {{ item.productName }}
                  </div>
                  <div [style.background]="getStatusColor(item.status)"
                    style="padding:4px 8px;border-radius:4px;color:#fff;font-size:11px;font-weight:600;">
                    {{ item.status }}
                  </div>
                </div>
                <div *ngIf="item.modifiers" style="color:#c4a75b;font-size:13px;margin-top:4px;">
                  {{ item.modifiers }}
                </div>
              </div>
            </div>

            <!-- Ticket Notes -->
            <div *ngIf="ticket.notes" style="background:#fffaf0;padding:12px;border-radius:8px;margin-bottom:16px;color:#c4a75b;font-size:13px;font-style:italic;border:1px solid #c4a75b;">
              <strong>Order Notes:</strong> {{ ticket.notes }}
            </div>

            <!-- Action Buttons -->
            <div style="display:flex;gap:8px;">
              <button *ngIf="ticket.status === 'NEW'" (click)="updateTicketStatus(ticket, 'IN_PROGRESS')"
                style="flex:1;padding:12px;border:none;border-radius:8px;background:#17a2b8;color:#fff;font-weight:700;cursor:pointer;font-size:14px;">
                Start Cooking
              </button>
              <button *ngIf="ticket.status === 'IN_PROGRESS'" (click)="updateTicketStatus(ticket, 'READY')"
                style="flex:1;padding:12px;border:none;border-radius:8px;background:#28a745;color:#fff;font-weight:700;cursor:pointer;font-size:14px;">
                Mark Ready
              </button>
              <button *ngIf="ticket.status === 'READY'" (click)="updateTicketStatus(ticket, 'COMPLETED')"
                style="flex:1;padding:12px;border:none;border-radius:8px;background:#6c757d;color:#fff;font-weight:700;cursor:pointer;font-size:14px;">
                Complete
              </button>
              <button (click)="updateTicketStatus(ticket, 'CANCELLED')"
                style="padding:12px 16px;border:none;border-radius:8px;background:#c4a75b;color:#1a1a1a;font-weight:700;cursor:pointer;font-size:14px;">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      transition: all 0.2s;
    }
    button:active {
      transform: translateY(0);
    }
  `]
})
export class KdsComponent implements OnInit, OnDestroy {
  groupedTickets: GroupedTicket[] = [];
  stations: KitchenStation[] = [];
  loading = false;
  filterStatus = '';
  countdown = 10;

  private refreshSubscription?: Subscription;
  private countdownSubscription?: Subscription;

  constructor(private kitchenService: KitchenService) {}

  ngOnInit(): void {
    this.loadStations();
    this.loadTickets();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.countdownSubscription?.unsubscribe();
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

  loadTickets(): void {
    this.loading = true;
    const status = this.filterStatus || undefined;
    this.kitchenService.getTickets(status).subscribe({
      next: (tickets) => {
        this.groupedTickets = this.kitchenService.groupTickets(tickets);
        this.groupedTickets.sort((a, b) => {
          // Sort by status priority: NEW > IN_PROGRESS > READY
          const statusOrder = { NEW: 1, IN_PROGRESS: 2, READY: 3 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 99;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          // Then by creation time (oldest first)
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.loading = false;
      }
    });
  }

  updateTicketStatus(ticket: GroupedTicket, status: string): void {
    // Update all tickets in the group
    let completed = 0;
    const total = ticket.items.length;

    ticket.items.forEach(item => {
      this.kitchenService.updateTicketStatus(item.ticketId, status).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.loadTickets();
            this.resetCountdown();
          }
        },
        error: (error) => {
          console.error('Error updating ticket status:', error);
        }
      });
    });
  }

  startAutoRefresh(): void {
    // Countdown timer
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.countdown = 10;
      }
    });

    // Auto-refresh every 10 seconds
    this.refreshSubscription = interval(10000).pipe(
      switchMap(() => this.kitchenService.getTickets(this.filterStatus || undefined))
    ).subscribe({
      next: (tickets) => {
        this.groupedTickets = this.kitchenService.groupTickets(tickets);
        this.groupedTickets.sort((a, b) => {
          const statusOrder = { NEW: 1, IN_PROGRESS: 2, READY: 3 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 99;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        this.countdown = 10;
      },
      error: (error) => {
        console.error('Error refreshing tickets:', error);
      }
    });
  }

  resetCountdown(): void {
    this.countdown = 10;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'NEW': return '#FFC107';
      case 'IN_PROGRESS': return '#17a2b8';
      case 'READY': return '#28a745';
      case 'COMPLETED': return '#6c757d';
      case 'CANCELLED': return '#c4a75b';
      default: return '#6c757d';
    }
  }

  getStatusBorder(status: string): string {
    return `5px solid ${this.getStatusColor(status)}`;
  }

  getTimeElapsed(createdAt: string): string {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = Math.floor((now - created) / 1000 / 60); // minutes

    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 min ago';
    if (diff < 60) return `${diff} mins ago`;

    const hours = Math.floor(diff / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }
}
