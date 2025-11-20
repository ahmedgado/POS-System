import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface KitchenStation {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KitchenTicket {
  id: string;
  saleId: string;
  saleItemId: string;
  kitchenStationId: string;
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  priority?: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  kitchenStation?: KitchenStation;
  saleItem?: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      imageUrl?: string;
    };
    modifiers?: Array<{
      modifier: {
        name: string;
      };
      quantity: number;
    }>;
    sale: {
      id: string;
      saleNumber: string;
      orderType: string;
      table?: {
        tableNumber: string;
        floor: {
          name: string;
        };
      };
      waiter?: {
        firstName: string;
        lastName: string;
      };
    };
  };
  age?: number;
}

export interface GroupedTicket {
  orderId: string;
  orderNumber: string;
  tableNumber?: string;
  orderType?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  station?: KitchenStation;
  items: Array<{
    ticketId: string;
    productName: string;
    quantity: number;
    modifiers?: string;
    status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  }>;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class KitchenService {
  private readonly baseUrl = '/api/restaurant/kitchen';

  constructor(private http: HttpClient) {}

  // Kitchen Stations
  getStations(): Observable<KitchenStation[]> {
    return this.http.get<any>(`${this.baseUrl}/stations`).pipe(
      map(response => response.data || [])
    );
  }

  createStation(station: Partial<KitchenStation>): Observable<KitchenStation> {
    return this.http.post<any>(`${this.baseUrl}/stations`, station).pipe(
      map(response => response.data)
    );
  }

  updateStation(id: string, station: Partial<KitchenStation>): Observable<KitchenStation> {
    return this.http.put<any>(`${this.baseUrl}/stations/${id}`, station).pipe(
      map(response => response.data)
    );
  }

  deleteStation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stations/${id}`);
  }

  // Kitchen Tickets
  getTickets(status?: string, stationId?: string): Observable<KitchenTicket[]> {
    let params: any = {};
    if (status) params.status = status;
    if (stationId) params.stationId = stationId;
    return this.http.get<any>(`${this.baseUrl}/tickets`, { params }).pipe(
      map(response => response.data || [])
    );
  }

  getStationTickets(stationId: string, status?: string): Observable<KitchenTicket[]> {
    let params: any = {};
    if (status) params.status = status;
    return this.http.get<any>(`${this.baseUrl}/stations/${stationId}/tickets`, { params }).pipe(
      map(response => response.data || [])
    );
  }

  updateTicketStatus(ticketId: string, status: string): Observable<KitchenTicket> {
    return this.http.patch<any>(`${this.baseUrl}/tickets/${ticketId}/status`, { status }).pipe(
      map(response => response.data)
    );
  }

  updateTicketItemStatus(ticketId: string, itemId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tickets/${ticketId}/items/${itemId}/status`, { status }).pipe(
      map(response => response.data)
    );
  }

  // Group tickets by order for display
  groupTickets(tickets: KitchenTicket[]): GroupedTicket[] {
    const grouped = new Map<string, GroupedTicket>();

    tickets.forEach(ticket => {
      if (!ticket.saleItem) return;

      const orderId = ticket.saleItem.sale.id;

      if (!grouped.has(orderId)) {
        grouped.set(orderId, {
          orderId,
          orderNumber: ticket.saleItem.sale.saleNumber,
          tableNumber: ticket.saleItem.sale.table?.tableNumber,
          orderType: ticket.saleItem.sale.orderType,
          status: ticket.status,
          createdAt: ticket.createdAt,
          station: ticket.kitchenStation,
          items: [],
          notes: ticket.notes
        });
      }

      const group = grouped.get(orderId)!;

      // Add item to group
      const modifiersStr = ticket.saleItem.modifiers
        ?.map(m => `${m.quantity > 1 ? m.quantity + 'x ' : ''}${m.modifier.name}`)
        .join(', ');

      group.items.push({
        ticketId: ticket.id,
        productName: ticket.saleItem.product.name,
        quantity: ticket.saleItem.quantity,
        modifiers: modifiersStr,
        status: ticket.status
      });

      // Update group status (use least advanced status - all items must be at same stage)
      const statusOrder = { NEW: 1, IN_PROGRESS: 2, READY: 3, COMPLETED: 4, CANCELLED: 5 };
      const currentOrder = statusOrder[group.status] || 0;
      const ticketOrder = statusOrder[ticket.status] || 0;
      // Use the minimum status (least advanced) so all items must be ready before order is ready
      if (ticketOrder < currentOrder) {
        group.status = ticket.status;
      }
    });

    return Array.from(grouped.values());
  }
}
