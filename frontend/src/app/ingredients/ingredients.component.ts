import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, Ingredient } from '../services/inventory.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;max-width:1600px;margin:0 auto;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🥕 Ingredients</h1>
          <button *ngIf="canEdit()" (click)="openModal()" style="background:#fff;color:#DC3545;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">
            + Add Ingredient
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;max-width:1600px;margin:0 auto;">
        <!-- Error -->
        <div *ngIf="error" style="background:#FFF3F3;border:1px solid #FFE0E0;color:#DC3545;padding:16px;border-radius:8px;margin-bottom:24px;">
          <strong>Error:</strong> {{ error }}
        </div>

        <!-- Table -->
        <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="background:#F8F9FA;">
              <tr>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">Name</th>
                <th style="text-align:left;padding:16px;font-weight:600;color:#333;">Unit</th>
                <th style="text-align:right;padding:16px;font-weight:600;color:#333;">Cost/Unit</th>
                <th style="text-align:right;padding:16px;font-weight:600;color:#333;">Stock</th>
                <th style="text-align:right;padding:16px;font-weight:600;color:#333;">Low Alert</th>
                <th *ngIf="canEdit()" style="text-align:center;padding:16px;font-weight:600;color:#333;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of ingredients" style="border-top:1px solid #F0F0F0;">
                <td style="padding:16px;font-weight:600;color:#333;">{{ item.name }}</td>
                <td style="padding:16px;color:#666;">{{ item.unit }}</td>
                <td style="padding:16px;text-align:right;color:#666;">\${{ toNumber(item.cost).toFixed(2) }}</td>
                <td style="padding:16px;text-align:right;font-weight:600;" [style.color]="toNumber(item.stock) <= toNumber(item.lowStockAlert) ? '#DC3545' : '#28A745'">
                  {{ toNumber(item.stock) }}
                </td>
                <td style="padding:16px;text-align:right;color:#666;">{{ toNumber(item.lowStockAlert) }}</td>
                <td *ngIf="canEdit()" style="padding:16px;text-align:center;">
                  <button (click)="openModal(item)" style="background:#DC3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;margin-right:6px;">Edit</button>
                  <button (click)="deleteItem(item)" style="background:#6C757D;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Delete</button>
                </td>
              </tr>
              <tr *ngIf="!loading && ingredients.length === 0">
                <td [attr.colspan]="canEdit() ? 6 : 5" style="padding:60px;text-align:center;color:#666;">
                  No ingredients found. Click "Add Ingredient" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <!-- Modal -->
      <div *ngIf="showModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;" (click)="closeModal()">
        <div style="background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.3);width:90%;max-width:500px;" (click)="$event.stopPropagation()">
          <div style="padding:24px;border-bottom:1px solid #E5E5E5;">
            <h2 style="margin:0;color:#DC3545;">{{ editingItem ? 'Edit' : 'Add' }} Ingredient</h2>
          </div>
          <form (ngSubmit)="saveItem()" style="padding:24px;">
            <div style="margin-bottom:16px;">
              <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Name *</label>
              <input [(ngModel)]="formData.name" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Unit *</label>
                <input [(ngModel)]="formData.unit" name="unit" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Cost/Unit (\$) *</label>
                <input [(ngModel)]="formData.cost" name="cost" type="number" step="0.01" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Stock *</label>
                <input [(ngModel)]="formData.stock" name="stock" type="number" step="0.01" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
              <div>
                <label style="display:block;font-weight:600;color:#333;margin-bottom:8px;">Low Alert</label>
                <input [(ngModel)]="formData.lowStockAlert" name="lowAlert" type="number" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
              </div>
            </div>
            <div style="display:flex;gap:12px;justify-content:flex-end;">
              <button type="button" (click)="closeModal()" style="background:#6C757D;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">Cancel</button>
              <button type="submit" [disabled]="saving" style="background:#DC3545;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:600;cursor:pointer;">
                {{ saving ? 'Saving...' : (editingItem ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input:focus, select:focus {
      outline: none;
      border-color: #DC3545;
      box-shadow: 0 0 0 3px rgba(220,53,69,0.1);
    }
    button:hover:not(:disabled) { opacity: 0.9; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class IngredientsComponent implements OnInit {
  ingredients: Ingredient[] = [];
  loading = false;
  error = '';
  showModal = false;
  editingItem: Ingredient | null = null;
  saving = false;
  formData: any = {
    name: '',
    unit: '',
    cost: 0,
    stock: 0,
    lowStockAlert: 10,
    isActive: true
  };

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadIngredients();
  }

  canEdit(): boolean {
    const role = this.authService.currentUser?.role;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'INVENTORY_CLERK';
  }

  loadIngredients() {
    this.loading = true;
    this.inventoryService.getIngredients().subscribe({
      next: (data) => {
        this.ingredients = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load ingredients';
        this.loading = false;
      }
    });
  }

  openModal(item?: Ingredient) {
    this.editingItem = item || null;
    this.formData = item ? { ...item } : {
      name: '',
      unit: '',
      cost: 0,
      stock: 0,
      lowStockAlert: 10,
      isActive: true
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingItem = null;
    this.formData = {
      name: '',
      unit: '',
      cost: 0,
      stock: 0,
      lowStockAlert: 10,
      isActive: true
    };
  }

  saveItem() {
    this.saving = true;
    const operation = this.editingItem
      ? this.inventoryService.updateIngredient(this.editingItem.id, this.formData)
      : this.inventoryService.createIngredient(this.formData);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadIngredients();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to save ingredient';
        this.saving = false;
      }
    });
  }

  deleteItem(item: Ingredient) {
    if (!confirm(`Delete ${item.name}?`)) return;

    this.inventoryService.deleteIngredient(item.id).subscribe({
      next: () => this.loadIngredients(),
      error: (err) => this.error = err?.error?.message || 'Failed to delete ingredient'
    });
  }

  toNumber(value: any): number {
    return Number(value || 0);
  }
}
