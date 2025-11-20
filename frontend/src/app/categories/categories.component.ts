import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Category, CategoryService } from '../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#d4af37;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🏷️ {{ 'categories.title' | translate }}</h1>
          <button
            (click)="openAddModal()"
            style="background:#fff;color:#DC3545;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            ➕ {{ 'categories.addCategory' | translate }}
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Search & Filter -->
        <section style="background:#fff;padding:20px 24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <div style="display:flex;gap:16px;align-items:center;">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilter()"
              [placeholder]="'common.filter' | translate"
              style="flex:1;padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
              [style.border-color]="searchTerm ? '#DC3545' : '#ddd'"
            />
            <select
              [(ngModel)]="filterActive"
              (change)="applyFilter()"
              style="padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;">
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="true">{{ 'categories.active' | translate }}</option>
              <option value="false">{{ 'categories.inactive' | translate }}</option>
            </select>
          </div>
        </section>

        <!-- Statistics -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">{{ 'categories.totalCategories' | translate }}</div>
            <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ categories.length }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">{{ 'categories.activeCategories' | translate }}</div>
            <div style="font-size:32px;font-weight:700;color:#28a745;">{{ getActiveCount() }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">{{ 'categories.inactive' | translate }}</div>
            <div style="font-size:32px;font-weight:700;color:#dc3545;">{{ getInactiveCount() }}</div>
          </div>
        </section>

        <!-- Categories Grid -->
        <section>
          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">{{ 'common.loading' | translate }}</div>

          <div *ngIf="!loading && filteredCategories.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">🏷️</div>
            <div style="font-size:16px;">{{ 'common.noData' | translate }}</div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:24px;">
            <div
              *ngFor="let category of filteredCategories"
              style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;transition:all 0.2s;border:2px solid transparent;"
              (mouseenter)="$event.currentTarget.style.borderColor='#DC3545'; $event.currentTarget.style.boxShadow='0 4px 20px rgba(220,53,69,0.15)'"
              (mouseleave)="$event.currentTarget.style.borderColor='transparent'; $event.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'">

              <!-- Card Body -->
              <div style="padding:24px;">
                <!-- Header with Title and Toggle -->
                <div style="display:flex;align-items:start;justify-content:space-between;margin-bottom:16px;">
                  <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#333;">{{ category.name }}</h3>
                    <span
                      [style.background]="category.active ? '#E8F5E9' : '#F5F5F5'"
                      [style.color]="category.active ? '#2E7D32' : '#757575'"
                      style="display:inline-block;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                      {{ category.active ? ('categories.active' | translate) : ('categories.inactive' | translate) }}
                    </span>
                  </div>
                  <label style="position:relative;display:inline-block;width:52px;height:28px;flex-shrink:0;">
                    <input
                      type="checkbox"
                      [checked]="category.active"
                      (change)="toggleActive(category)"
                      style="opacity:0;width:0;height:0;">
                    <span
                      [style.background]="category.active ? '#DC3545' : '#ddd'"
                      style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:28px;transition:0.3s;box-shadow:inset 0 1px 3px rgba(0,0,0,0.2);">
                      <span
                        [style.transform]="category.active ? 'translateX(24px)' : 'translateX(0)'"
                        style="position:absolute;content:'';height:24px;width:24px;left:2px;top:2px;background:#fff;border-radius:50%;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                      </span>
                    </span>
                  </label>
                </div>

                <!-- Description -->
                <div style="color:#666;font-size:14px;line-height:1.6;margin-bottom:20px;min-height:42px;overflow:hidden;text-overflow:ellipsis;">
                  <span *ngIf="category.description" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                    {{ category.description }}
                  </span>
                  <span *ngIf="!category.description" style="color:#999;font-style:italic;">
                    {{ 'common.noData' | translate }}
                  </span>
                </div>

                <!-- Products Count Card -->
                <div style="background:linear-gradient(135deg, #DC3545 0%, #c82333 100%);padding:16px;border-radius:12px;margin-bottom:20px;text-align:center;box-shadow:0 4px 8px rgba(220,53,69,0.2);">
                  <div style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px;">{{ 'categories.products' | translate }}</div>
                  <div style="color:#fff;font-weight:800;font-size:32px;line-height:1;">{{ category.productCount || 0 }}</div>
                </div>

                <!-- Action Buttons -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                  <button
                    (click)="openEditModal(category)"
                    style="background:#fff;color:#007bff;border:2px solid #007bff;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;"
                    onmouseover="this.style.background='#007bff'; this.style.color='#fff'"
                    onmouseout="this.style.background='#fff'; this.style.color='#007bff'">
                    <span>✏️</span>
                    <span>{{ 'common.edit' | translate }}</span>
                  </button>
                  <button
                    (click)="deleteCategory(category.id)"
                    [disabled]="(category.productCount || 0) > 0"
                    [style.opacity]="(category.productCount || 0) > 0 ? '0.5' : '1'"
                    [style.cursor]="(category.productCount || 0) > 0 ? 'not-allowed' : 'pointer'"
                    [style.pointerEvents]="(category.productCount || 0) > 0 ? 'none' : 'auto'"
                    style="background:#fff;color:#dc3545;border:2px solid #dc3545;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:6px;"
                    onmouseover="if (!this.disabled) { this.style.background='#dc3545'; this.style.color='#fff'; }"
                    onmouseout="if (!this.disabled) { this.style.background='#fff'; this.style.color='#dc3545'; }">
                    <span>🗑️</span>
                    <span>{{ 'common.delete' | translate }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="closeModal()">
      <div style="background:#fff;border-radius:16px;max-width:500px;width:100%;" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div style="padding:24px;border-bottom:2px solid #DC3545;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">
              {{ editingCategory ? ('common.edit' | translate) + ' ' + ('categories.title' | translate) : ('categories.addCategory' | translate) }}
            </h2>
            <button
              (click)="closeModal()"
              style="background:none;border:none;font-size:28px;color:#999;cursor:pointer;line-height:1;padding:0;width:32px;height:32px;">
              ×
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div style="padding:24px;">
          <form (submit)="saveCategory(); $event.preventDefault()">
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                {{ 'categories.name' | translate }} <span style="color:#dc3545;">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formCategory.name"
                name="name"
                [placeholder]="'categories.name' | translate"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                [style.border-color]="formCategory.name ? '#DC3545' : '#ddd'"
              />
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                {{ 'categories.description' | translate }}
              </label>
              <textarea
                [(ngModel)]="formCategory.description"
                name="description"
                [placeholder]="'categories.description' | translate"
                rows="4"
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;resize:vertical;"
              ></textarea>
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:flex;align-items:center;cursor:pointer;">
                <input
                  type="checkbox"
                  [(ngModel)]="formCategory.active"
                  name="active"
                  style="width:20px;height:20px;cursor:pointer;margin-right:12px;"
                />
                <span style="font-size:14px;font-weight:600;color:#333;">{{ 'categories.active' | translate }}</span>
              </label>
            </div>

            <div style="display:flex;gap:12px;">
              <button
                type="submit"
                [disabled]="!formCategory.name || saving"
                style="flex:1;background:#DC3545;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;"
                [style.opacity]="!formCategory.name || saving ? '0.5' : '1'"
                [style.cursor]="!formCategory.name || saving ? 'not-allowed' : 'pointer'">
                {{ saving ? ('common.loading' | translate) : ('common.save' | translate) }}
              </button>
              <button
                type="button"
                (click)="closeModal()"
                style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                {{ 'common.cancel' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  saving = false;

  searchTerm = '';
  filterActive = '';

  showModal = false;
  editingCategory: Category | null = null;
  formCategory: Partial<Category> = {
    name: '',
    description: '',
    active: true
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.filteredCategories = this.categories.filter(cat => {
      const matchesSearch = !this.searchTerm ||
        cat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesActive = !this.filterActive ||
        (this.filterActive === 'true' && cat.active) ||
        (this.filterActive === 'false' && !cat.active);

      return matchesSearch && matchesActive;
    });
  }

  getActiveCount(): number {
    return this.categories.filter(c => c.active).length;
  }

  getInactiveCount(): number {
    return this.categories.filter(c => !c.active).length;
  }

  openAddModal() {
    this.editingCategory = null;
    this.formCategory = {
      name: '',
      description: '',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.editingCategory = category;
    this.formCategory = {
      name: category.name,
      description: category.description,
      active: category.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCategory = null;
    this.formCategory = {
      name: '',
      description: '',
      active: true
    };
  }

  saveCategory() {
    if (!this.formCategory.name) return;

    this.saving = true;
    const operation = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id.toString(), this.formCategory)
      : this.categoryService.create(this.formCategory);

    operation.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        console.error('Failed to save category:', err);
        alert('Failed to save category. Please try again.');
      }
    });
  }

  toggleActive(category: Category) {
    this.categoryService.toggleActive(category.id.toString(), !category.active).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error('Failed to toggle category:', err);
        alert('Failed to update category status.');
      }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.categoryService.delete(id.toString()).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error('Failed to delete category:', err);
        alert('Failed to delete category. Make sure it has no products.');
      }
    });
  }
}
