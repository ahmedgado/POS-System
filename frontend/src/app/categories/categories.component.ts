import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryService } from '../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <!-- Header -->
      <header style="background:#DC3545;color:#fff;padding:20px 32px;box-shadow:0 2px 8px rgba(220,53,69,0.15);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">🏷️ Categories</h1>
          <button
            (click)="openAddModal()"
            style="background:#fff;color:#DC3545;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            ➕ Add Category
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
              placeholder="Search categories..."
              style="flex:1;padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
              [style.border-color]="searchTerm ? '#DC3545' : '#ddd'"
            />
            <select
              [(ngModel)]="filterActive"
              (change)="applyFilter()"
              style="padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:14px;">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </section>

        <!-- Statistics -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #DC3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Total Categories</div>
            <div style="font-size:32px;font-weight:700;color:#DC3545;">{{ categories.length }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Active</div>
            <div style="font-size:32px;font-weight:700;color:#28a745;">{{ getActiveCount() }}</div>
          </div>

          <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #dc3545;">
            <div style="color:#666;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Inactive</div>
            <div style="font-size:32px;font-weight:700;color:#dc3545;">{{ getInactiveCount() }}</div>
          </div>
        </section>

        <!-- Categories Grid -->
        <section>
          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">Loading categories...</div>

          <div *ngIf="!loading && filteredCategories.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">🏷️</div>
            <div style="font-size:16px;">No categories found</div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">
            <div
              *ngFor="let category of filteredCategories"
              style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;transition:all 0.2s;"
              (mouseenter)="$event.currentTarget.style.transform='translateY(-4px)'; $event.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'"
              (mouseleave)="$event.currentTarget.style.transform='translateY(0)'; $event.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'">

              <!-- Card Header -->
              <div [style.background]="category.active ? '#DC3545' : '#6c757d'" style="padding:16px 20px;color:#fff;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <h3 style="margin:0;font-size:18px;font-weight:700;">{{ category.name }}</h3>
                  <label style="position:relative;display:inline-block;width:48px;height:24px;">
                    <input
                      type="checkbox"
                      [checked]="category.active"
                      (change)="toggleActive(category)"
                      style="opacity:0;width:0;height:0;">
                    <span
                      [style.background]="category.active ? '#28a745' : '#ccc'"
                      style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:24px;transition:0.3s;">
                      <span
                        [style.transform]="category.active ? 'translateX(24px)' : 'translateX(0)'"
                        style="position:absolute;content:'';height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s;">
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Card Body -->
              <div style="padding:20px;">
                <div style="color:#666;font-size:14px;line-height:1.6;margin-bottom:16px;min-height:40px;">
                  {{ category.description || 'No description' }}
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid #eee;">
                  <div>
                    <div style="color:#999;font-size:12px;margin-bottom:4px;">Products</div>
                    <div style="color:#333;font-weight:700;font-size:20px;">{{ category.productCount || 0 }}</div>
                  </div>
                  <div style="display:flex;gap:8px;">
                    <button
                      (click)="openEditModal(category)"
                      style="background:#007bff;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                      ✏️ Edit
                    </button>
                    <button
                      (click)="deleteCategory(category.id)"
                      [disabled]="(category.productCount || 0) > 0"
                      [style.opacity]="(category.productCount || 0) > 0 ? '0.5' : '1'"
                      [style.cursor]="(category.productCount || 0) > 0 ? 'not-allowed' : 'pointer'"
                      style="background:#dc3545;color:#fff;border:none;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;">
                      🗑️
                    </button>
                  </div>
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
              {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
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
                Category Name <span style="color:#dc3545;">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formCategory.name"
                name="name"
                placeholder="Enter category name"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;"
                [style.border-color]="formCategory.name ? '#DC3545' : '#ddd'"
              />
            </div>

            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                Description
              </label>
              <textarea
                [(ngModel)]="formCategory.description"
                name="description"
                placeholder="Enter category description (optional)"
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
                <span style="font-size:14px;font-weight:600;color:#333;">Active</span>
              </label>
            </div>

            <div style="display:flex;gap:12px;">
              <button
                type="submit"
                [disabled]="!formCategory.name || saving"
                style="flex:1;background:#DC3545;color:#fff;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;"
                [style.opacity]="!formCategory.name || saving ? '0.5' : '1'"
                [style.cursor]="!formCategory.name || saving ? 'not-allowed' : 'pointer'">
                {{ saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create') }}
              </button>
              <button
                type="button"
                (click)="closeModal()"
                style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
                Cancel
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
