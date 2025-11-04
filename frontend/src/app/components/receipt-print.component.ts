import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ReceiptData {
  saleId: string;
  date: Date;
  cashier: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

@Component({
  selector: 'app-receipt-print',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Receipt Modal -->
    <div *ngIf="show"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;"
         (click)="close()">
      <div style="background:#fff;border-radius:16px;max-width:400px;width:100%;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;" (click)="$event.stopPropagation()">
        <!-- Header Buttons -->
        <div style="padding:16px;border-bottom:1px solid #eee;display:flex;gap:12px;justify-content:flex-end;">
          <button
            (click)="print()"
            style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;">
            🖨️ Print
          </button>
          <button
            (click)="close()"
            style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
            Close
          </button>
        </div>

        <!-- Receipt Content -->
        <div id="receipt-content" style="padding:32px;background:#fff;font-family:monospace;">
          <!-- Store Header -->
          <div style="text-align:center;margin-bottom:24px;border-bottom:2px dashed #333;padding-bottom:16px;">
            <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;">{{ receipt?.storeName || 'POS System' }}</h2>
            <p style="margin:4px 0;font-size:12px;">{{ receipt?.storeAddress || 'Store Address' }}</p>
            <p style="margin:4px 0;font-size:12px;">{{ receipt?.storePhone || 'Phone Number' }}</p>
          </div>

          <!-- Sale Info -->
          <div style="margin-bottom:16px;font-size:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>Receipt #:</span>
              <strong>{{ receipt?.saleId }}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>Date:</span>
              <span>{{ formatDate(receipt?.date) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>Cashier:</span>
              <span>{{ receipt?.cashier }}</span>
            </div>
          </div>

          <!-- Items -->
          <div style="border-top:2px dashed #333;border-bottom:2px dashed #333;padding:12px 0;margin-bottom:16px;">
            <table style="width:100%;font-size:12px;">
              <thead>
                <tr style="border-bottom:1px solid #ddd;">
                  <th style="text-align:left;padding:4px 0;">Item</th>
                  <th style="text-align:center;padding:4px 0;">Qty</th>
                  <th style="text-align:right;padding:4px 0;">Price</th>
                  <th style="text-align:right;padding:4px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of receipt?.items" style="border-bottom:1px solid #eee;">
                  <td style="padding:8px 4px 8px 0;">{{ item.name }}</td>
                  <td style="text-align:center;padding:8px 4px;">{{ item.quantity }}</td>
                  <td style="text-align:right;padding:8px 4px;">\${{ item.price.toFixed(2) }}</td>
                  <td style="text-align:right;padding:8px 0 8px 4px;font-weight:600;">\${{ item.total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="font-size:13px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span>Subtotal:</span>
              <span>\${{ receipt?.subtotal.toFixed(2) }}</span>
            </div>
            <div *ngIf="receipt?.discount && receipt.discount > 0" style="display:flex;justify-content:space-between;margin-bottom:6px;color:#dc3545;">
              <span>Discount:</span>
              <span>-\${{ receipt?.discount.toFixed(2) }}</span>
            </div>
            <div *ngIf="receipt?.tax && receipt.tax > 0" style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span>Tax:</span>
              <span>\${{ receipt?.tax.toFixed(2) }}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:2px solid #333;font-size:16px;font-weight:700;">
              <span>TOTAL:</span>
              <span>\${{ receipt?.total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Payment Info -->
          <div style="margin-bottom:24px;font-size:12px;border-top:2px dashed #333;padding-top:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>Payment Method:</span>
              <strong>{{ receipt?.paymentMethod }}</strong>
            </div>
            <div *ngIf="receipt?.amountPaid" style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>Amount Paid:</span>
              <span>\${{ receipt?.amountPaid.toFixed(2) }}</span>
            </div>
            <div *ngIf="receipt?.change && receipt.change > 0" style="display:flex;justify-content:space-between;font-weight:600;">
              <span>Change:</span>
              <span>\${{ receipt?.change.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Barcode -->
          <div style="text-align:center;margin-bottom:16px;">
            <svg width="200" height="60" style="margin:0 auto;">
              <rect x="10" y="10" width="2" height="40" fill="#000"/>
              <rect x="15" y="10" width="4" height="40" fill="#000"/>
              <rect x="22" y="10" width="2" height="40" fill="#000"/>
              <rect x="27" y="10" width="3" height="40" fill="#000"/>
              <rect x="33" y="10" width="2" height="40" fill="#000"/>
              <rect x="38" y="10" width="4" height="40" fill="#000"/>
              <rect x="45" y="10" width="2" height="40" fill="#000"/>
              <rect x="50" y="10" width="3" height="40" fill="#000"/>
              <rect x="56" y="10" width="2" height="40" fill="#000"/>
              <rect x="61" y="10" width="4" height="40" fill="#000"/>
              <rect x="68" y="10" width="2" height="40" fill="#000"/>
              <rect x="73" y="10" width="3" height="40" fill="#000"/>
              <rect x="79" y="10" width="2" height="40" fill="#000"/>
              <rect x="84" y="10" width="4" height="40" fill="#000"/>
              <rect x="91" y="10" width="2" height="40" fill="#000"/>
              <rect x="96" y="10" width="3" height="40" fill="#000"/>
              <rect x="102" y="10" width="2" height="40" fill="#000"/>
              <rect x="107" y="10" width="4" height="40" fill="#000"/>
              <rect x="114" y="10" width="2" height="40" fill="#000"/>
              <rect x="119" y="10" width="3" height="40" fill="#000"/>
              <rect x="125" y="10" width="2" height="40" fill="#000"/>
              <rect x="130" y="10" width="4" height="40" fill="#000"/>
              <rect x="137" y="10" width="2" height="40" fill="#000"/>
              <rect x="142" y="10" width="3" height="40" fill="#000"/>
              <rect x="148" y="10" width="2" height="40" fill="#000"/>
              <rect x="153" y="10" width="4" height="40" fill="#000"/>
              <rect x="160" y="10" width="2" height="40" fill="#000"/>
              <rect x="165" y="10" width="3" height="40" fill="#000"/>
              <rect x="171" y="10" width="2" height="40" fill="#000"/>
              <rect x="176" y="10" width="4" height="40" fill="#000"/>
              <rect x="183" y="10" width="2" height="40" fill="#000"/>
            </svg>
            <div style="font-size:10px;margin-top:4px;">{{ receipt?.saleId }}</div>
          </div>

          <!-- Footer -->
          <div style="text-align:center;font-size:11px;border-top:2px dashed #333;padding-top:16px;">
            <p style="margin:4px 0;font-weight:600;">Thank you for your purchase!</p>
            <p style="margin:4px 0;">Please come again</p>
            <p style="margin:8px 0 0 0;font-size:10px;color:#666;">Powered by POS System</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      body * {
        visibility: hidden;
      }
      #receipt-content, #receipt-content * {
        visibility: visible;
      }
      #receipt-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
      }
    }
  `]
})
export class ReceiptPrintComponent {
  @Input() receipt: ReceiptData | null = null;
  @Input() show = false;

  close() {
    this.show = false;
  }

  print() {
    window.print();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }
}
