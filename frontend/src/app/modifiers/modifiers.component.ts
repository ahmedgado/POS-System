import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModifierService, ModifierGroup, Modifier } from '../services/modifier.service';
import { PaginationComponent } from '../components/pagination.component';

@Component({
  selector: 'app-modifiers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div style="min-height:100vh;background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);padding:24px;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 8px 32px rgba(212,175,55,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h1 style="margin:0;color:#1a1a1a;font-size:32px;font-weight:800;letter-spacing:-0.5px;">
              ⚙️ Menu Modifiers
            </h1>
            <p style="margin:8px 0 0 0;color:#2d2d2d;font-size:14px;opacity:0.9;">
              Manage customization options for your menu items
            </p>
          </div>
          <button
            (click)="showGroupModal = true; editingGroup = null; resetGroupForm()"
            style="background:#1a1a1a;color:#d4af37;border:none;padding:14px 28px;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px;box-shadow:0 4px 16px rgba(0,0,0,0.3);transition:all 0.3s ease;"
            (mouseenter)="$event.target.style.transform='translateY(-2px)'"
            (mouseleave)="$event.target.style.transform='translateY(0)'">
            ➕ New Group
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" style="text-align:center;padding:80px 20px;color:#d4af37;">
        <div style="font-size:48px;margin-bottom:16px;">⏳</div>
        <div style="font-size:18px;font-weight:600;">Loading modifiers...</div>
      </div>

      <!-- Modifier Groups Grid -->
      <div *ngIf="!loading" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:24px;">
        <div
          *ngFor="let group of modifierGroups"
          style="background:#2d2d2d;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);border:2px solid #3d3d3d;transition:all 0.3s ease;"
          (mouseenter)="$event.currentTarget.style.borderColor='#d4af37'; $event.currentTarget.style.transform='translateY(-4px)'"
          (mouseleave)="$event.currentTarget.style.borderColor='#3d3d3d'; $event.currentTarget.style.transform='translateY(0)'">

          <!-- Group Header -->
          <div style="background:linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);padding:20px;border-bottom:2px solid #4d4d4d;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
              <div style="flex:1;">
                <h3 style="margin:0 0 8px 0;color:#d4af37;font-size:20px;font-weight:700;">
                  {{ group.name }}
                </h3>
                <p *ngIf="group.description" style="margin:0;color:#999;font-size:13px;">
                  {{ group.description }}
                </p>
              </div>
              <div style="display:flex;gap:8px;">
                <button
                  (click)="editGroup(group)"
                  style="background:#d4af37;color:#1a1a1a;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;"
                  title="Edit Group">
                  ✏️
                </button>
                <button
                  (click)="deleteGroupConfirm(group)"
                  style="background:#dc3545;color:#fff;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;"
                  title="Delete Group">
                  🗑️
                </button>
              </div>
            </div>

            <!-- Group Info Tags -->
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <span style="background:#d4af37;color:#1a1a1a;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">
                {{ group.isRequired ? '⚠️ REQUIRED' : '📌 OPTIONAL' }}
              </span>
              <span *ngIf="group.maxSelection || group.maxSelections" style="background:#4d4d4d;color:#d4af37;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">
                Max: {{ group.maxSelection || group.maxSelections }}
              </span>
              <span style="background:{{ group.isActive ? '#28a745' : '#6c757d' }};color:#fff;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;">
                {{ group.isActive ? '✓ Active' : '✗ Inactive' }}
              </span>
            </div>
          </div>

          <!-- Modifiers List -->
          <div style="padding:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span style="color:#d4af37;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                Options ({{ group.modifiers?.length || 0 }})
              </span>
              <button
                (click)="showModifierModal = true; editingModifier = null; selectedGroupId = group.id; resetModifierForm()"
                style="background:#4d4d4d;color:#d4af37;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;"
                title="Add Option">
                ➕ Add
              </button>
            </div>

            <div *ngIf="!group.modifiers || group.modifiers.length === 0"
                 style="text-align:center;padding:30px;color:#666;font-size:13px;">
              No options added yet
            </div>

            <div *ngFor="let modifier of group.modifiers"
                 style="background:#3d3d3d;padding:12px 16px;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;border:1px solid #4d4d4d;">
              <div style="flex:1;">
                <div style="color:#fff;font-weight:600;font-size:14px;margin-bottom:2px;">
                  {{ modifier.name }}
                </div>
                <div style="color:#d4af37;font-size:13px;font-weight:700;">
                  {{ (modifier.priceAdjustment || modifier.price || 0) === 0 ? 'Free' : '+$' + (+(modifier.priceAdjustment || modifier.price || 0)).toFixed(2) }}
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <span *ngIf="!modifier.isActive" style="color:#dc3545;font-size:11px;font-weight:700;margin-right:8px;">
                  Disabled
                </span>
                <button
                  (click)="editModifier(modifier, group.id)"
                  style="background:#4d4d4d;color:#d4af37;border:none;width:32px;height:32px;border-radius:6px;cursor:pointer;font-size:14px;"
                  title="Edit">
                  ✏️
                </button>
                <button
                  (click)="deleteModifierConfirm(modifier)"
                  style="background:#dc3545;color:#fff;border:none;width:32px;height:32px;border-radius:6px;cursor:pointer;font-size:14px;"
                  title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && modifierGroups.length === 0"
           style="text-align:center;padding:80px 20px;background:#2d2d2d;border-radius:16px;border:2px dashed #4d4d4d;">
        <div style="font-size:64px;margin-bottom:20px;opacity:0.5;">⚙️</div>
        <h2 style="color:#d4af37;margin:0 0 12px 0;font-size:24px;font-weight:700;">No Modifier Groups Yet</h2>
        <p style="color:#999;margin:0 0 24px 0;font-size:14px;">Create your first modifier group to start customizing menu items</p>
        <button
          (click)="showGroupModal = true; editingGroup = null; resetGroupForm()"
          style="background:#d4af37;color:#1a1a1a;border:none;padding:14px 32px;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px;">
          ➕ Create First Group
        </button>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && modifierGroups.length > 0" style="margin-top:24px;">
        <app-pagination
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          [totalCount]="totalCount"
          [totalPages]="totalPages"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)">
        </app-pagination>
      </div>

    </div>

    <!-- Modifier Group Modal -->
    <div *ngIf="showGroupModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(8px);"
         (click)="showGroupModal = false">
      <div style="background:#2d2d2d;border-radius:20px;max-width:600px;width:100%;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:2px solid #d4af37;" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;color:#d4af37;font-size:28px;font-weight:800;text-align:center;">
          {{ editingGroup ? '✏️ Edit Group' : '➕ New Modifier Group' }}
        </h2>

        <form (submit)="saveGroup(); $event.preventDefault()">
          <div style="margin-bottom:20px;">
            <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
              Group Name *
            </label>
            <input
              type="text"
              [(ngModel)]="groupForm.name"
              name="name"
              placeholder="e.g., Size Options, Toppings, Extras"
              required
              style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;"
              [style.border-color]="groupForm.name ? '#d4af37' : '#4d4d4d'">
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
              Description
            </label>
            <textarea
              [(ngModel)]="groupForm.description"
              name="description"
              placeholder="Optional description..."
              rows="2"
              style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;resize:vertical;"></textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div>
              <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                Max Selections
              </label>
              <input
                type="number"
                [(ngModel)]="groupForm.maxSelections"
                name="maxSelections"
                placeholder="0 = unlimited"
                min="0"
                style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;">
            </div>
            <div>
              <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                Sort Order
              </label>
              <input
                type="number"
                [(ngModel)]="groupForm.sortOrder"
                name="sortOrder"
                min="0"
                style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;">
            </div>
          </div>

          <div style="display:flex;gap:16px;margin-bottom:20px;">
            <label style="flex:1;background:#3d3d3d;padding:16px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:12px;border:2px solid"
                   [style.border-color]="groupForm.isRequired ? '#d4af37' : '#4d4d4d'"
                   [style.background]="groupForm.isRequired ? '#d4af3710' : '#3d3d3d'">
              <input
                type="checkbox"
                [(ngModel)]="groupForm.isRequired"
                name="isRequired"
                style="width:20px;height:20px;cursor:pointer;">
              <span style="color:#d4af37;font-weight:700;font-size:14px;">Required Selection</span>
            </label>
            <label style="flex:1;background:#3d3d3d;padding:16px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:12px;border:2px solid"
                   [style.border-color]="groupForm.isActive ? '#28a745' : '#4d4d4d'"
                   [style.background]="groupForm.isActive ? '#28a74510' : '#3d3d3d'">
              <input
                type="checkbox"
                [(ngModel)]="groupForm.isActive"
                name="isActive"
                style="width:20px;height:20px;cursor:pointer;">
              <span style="color:#28a745;font-weight:700;font-size:14px;">Active</span>
            </label>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing || !groupForm.name"
              style="flex:1;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:16px;border-radius:12px;font-weight:800;cursor:pointer;font-size:16px;"
              [style.opacity]="processing || !groupForm.name ? '0.5' : '1'">
              {{ processing ? 'Saving...' : (editingGroup ? 'Update Group' : 'Create Group') }}
            </button>
            <button
              type="button"
              (click)="showGroupModal = false"
              style="flex:1;background:#4d4d4d;color:#fff;border:none;padding:16px;border-radius:12px;font-weight:700;cursor:pointer;font-size:16px;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modifier Modal -->
    <div *ngIf="showModifierModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(8px);"
         (click)="showModifierModal = false">
      <div style="background:#2d2d2d;border-radius:20px;max-width:500px;width:100%;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:2px solid #d4af37;" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;color:#d4af37;font-size:28px;font-weight:800;text-align:center;">
          {{ editingModifier ? '✏️ Edit Option' : '➕ New Option' }}
        </h2>

        <form (submit)="saveModifier(); $event.preventDefault()">
          <div style="margin-bottom:20px;">
            <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
              Option Name *
            </label>
            <input
              type="text"
              [(ngModel)]="modifierForm.name"
              name="name"
              placeholder="e.g., Large, Extra Cheese, Medium Rare"
              required
              style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;"
              [style.border-color]="modifierForm.name ? '#d4af37' : '#4d4d4d'">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div>
              <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                Extra Price *
              </label>
              <input
                type="number"
                [(ngModel)]="modifierForm.price"
                name="price"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;">
            </div>
            <div>
              <label style="display:block;color:#d4af37;font-size:13px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                Sort Order
              </label>
              <input
                type="number"
                [(ngModel)]="modifierForm.sortOrder"
                name="sortOrder"
                min="0"
                style="width:100%;padding:14px;background:#3d3d3d;border:2px solid #4d4d4d;border-radius:10px;color:#fff;font-size:15px;outline:none;">
            </div>
          </div>

          <div style="margin-bottom:20px;">
            <label style="background:#3d3d3d;padding:16px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:12px;border:2px solid"
                   [style.border-color]="modifierForm.isActive ? '#28a745' : '#4d4d4d'"
                   [style.background]="modifierForm.isActive ? '#28a74510' : '#3d3d3d'">
              <input
                type="checkbox"
                [(ngModel)]="modifierForm.isActive"
                name="isActive"
                style="width:20px;height:20px;cursor:pointer;">
              <span style="color:#28a745;font-weight:700;font-size:14px;">Active</span>
            </label>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing || !modifierForm.name || modifierForm.price === null"
              style="flex:1;background:linear-gradient(135deg, #d4af37 0%, #c19a2e 100%);color:#1a1a1a;border:none;padding:16px;border-radius:12px;font-weight:800;cursor:pointer;font-size:16px;"
              [style.opacity]="processing || !modifierForm.name || modifierForm.price === null ? '0.5' : '1'">
              {{ processing ? 'Saving...' : (editingModifier ? 'Update Option' : 'Add Option') }}
            </button>
            <button
              type="button"
              (click)="showModifierModal = false"
              style="flex:1;background:#4d4d4d;color:#fff;border:none;padding:16px;border-radius:12px;font-weight:700;cursor:pointer;font-size:16px;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ModifiersComponent implements OnInit {
  modifierGroups: ModifierGroup[] = [];
  loading = false;
  processing = false;

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalCount = 0;
  totalPages = 1;
  searchTerm = '';

  // Modals
  showGroupModal = false;
  showModifierModal = false;

  // Editing states
  editingGroup: ModifierGroup | null = null;
  editingModifier: Modifier | null = null;
  selectedGroupId: string = '';

  // Forms
  groupForm: Partial<ModifierGroup> = {
    name: '',
    description: '',
    isRequired: false,
    maxSelections: null as any,
    sortOrder: 0,
    isActive: true
  };

  modifierForm: Partial<Modifier> = {
    name: '',
    price: 0,
    sortOrder: 0,
    isActive: true
  };

  constructor(private modifierService: ModifierService) {}

  ngOnInit() {
    this.loadModifierGroups();
  }

  loadModifierGroups() {
    this.loading = true;
    this.modifierService.getModifierGroups(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.modifierGroups = response.data.sort((a, b) => a.sortOrder - b.sortOrder);
        this.totalCount = response.pagination.total;
        this.totalPages = response.pagination.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load modifier groups:', err);
        alert('Failed to load modifier groups');
        this.loading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadModifierGroups();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadModifierGroups();
  }

  resetGroupForm() {
    this.groupForm = {
      name: '',
      description: '',
      isRequired: false,
      maxSelections: null as any,
      sortOrder: 0,
      isActive: true
    };
  }

  resetModifierForm() {
    this.modifierForm = {
      name: '',
      price: 0,
      sortOrder: 0,
      isActive: true
    };
  }

  editGroup(group: ModifierGroup) {
    this.editingGroup = group;
    this.groupForm = { ...group };
    this.showGroupModal = true;
  }

  saveGroup() {
    if (!this.groupForm.name) return;

    this.processing = true;
    const operation = this.editingGroup
      ? this.modifierService.updateModifierGroup(this.editingGroup.id, this.groupForm)
      : this.modifierService.createModifierGroup(this.groupForm);

    operation.subscribe({
      next: () => {
        this.processing = false;
        this.showGroupModal = false;
        this.editingGroup = null;
        this.loadModifierGroups();
      },
      error: (err) => {
        console.error('Failed to save modifier group:', err);
        alert('Failed to save modifier group');
        this.processing = false;
      }
    });
  }

  deleteGroupConfirm(group: ModifierGroup) {
    if (confirm(`Delete "${group.name}" and all its options?`)) {
      this.modifierService.deleteModifierGroup(group.id).subscribe({
        next: () => this.loadModifierGroups(),
        error: (err) => {
          console.error('Failed to delete group:', err);
          alert('Failed to delete group');
        }
      });
    }
  }

  editModifier(modifier: Modifier, groupId: string) {
    this.editingModifier = modifier;
    this.selectedGroupId = groupId;
    this.modifierForm = { ...modifier };
    this.showModifierModal = true;
  }

  saveModifier() {
    if (!this.modifierForm.name || this.modifierForm.price === null) return;

    this.processing = true;
    const data = { ...this.modifierForm, modifierGroupId: this.selectedGroupId };
    const operation = this.editingModifier
      ? this.modifierService.updateModifier(this.editingModifier.id, data)
      : this.modifierService.createModifier(data);

    operation.subscribe({
      next: () => {
        this.processing = false;
        this.showModifierModal = false;
        this.editingModifier = null;
        this.loadModifierGroups();
      },
      error: (err) => {
        console.error('Failed to save modifier:', err);
        alert('Failed to save modifier');
        this.processing = false;
      }
    });
  }

  deleteModifierConfirm(modifier: Modifier) {
    if (confirm(`Delete "${modifier.name}"?`)) {
      this.modifierService.deleteModifier(modifier.id).subscribe({
        next: () => this.loadModifierGroups(),
        error: (err) => {
          console.error('Failed to delete modifier:', err);
          alert('Failed to delete modifier');
        }
      });
    }
  }
}
