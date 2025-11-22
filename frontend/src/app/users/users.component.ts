import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserService, CreateUserRequest, UpdateUserRequest } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height:100vh;background:#f8f6f4;">
      <!-- Header -->
      <header style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);color:#c4a75b;padding:20px 32px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <h1 style="margin:0;font-size:24px;font-weight:700;">👤 Users & Staff Management</h1>
          <button
            (click)="openAddModal()"
            style="background:#c4a75b;color:#1a1a1a;border:none;padding:12px 24px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px;">
            + Add New User
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main style="padding:32px;">
        <!-- Statistics -->
        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #c4a75b;">
            <div style="color:#666;font-size:13px;margin-bottom:8px;">Total Users</div>
            <div style="font-size:32px;font-weight:700;color:#c4a75b;">{{ users.length }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #28a745;">
            <div style="color:#666;font-size:13px;margin-bottom:8px;">Active Users</div>
            <div style="font-size:32px;font-weight:700;color:#28a745;">{{ getActiveCount() }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #007bff;">
            <div style="color:#666;font-size:13px;margin-bottom:8px;">Admins</div>
            <div style="font-size:32px;font-weight:700;color:#007bff;">{{ getRoleCount('ADMIN') }}</div>
          </div>
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #ffc107;">
            <div style="color:#666;font-size:13px;margin-bottom:8px;">Cashiers</div>
            <div style="font-size:32px;font-weight:700;color:#ffc107;">{{ getRoleCount('CASHIER') }}</div>
          </div>
        </section>

        <!-- Filters & Search -->
        <section style="background:#fff;padding:20px 24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:1fr 200px 200px;gap:16px;align-items:end;">
            <div>
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Search</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Search by name, email, or phone..."
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <div>
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Role</label>
              <select
                [(ngModel)]="filterRole"
                (change)="applyFilters()"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OWNER">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Cashier</option>
                <option value="WAITER">Waiter</option>
                <option value="KITCHEN_STAFF">Kitchen Staff</option>
                <option value="INVENTORY_CLERK">Inventory Clerk</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:13px;font-weight:600;color:#666;margin-bottom:8px;">Status</label>
              <select
                [(ngModel)]="filterStatus"
                (change)="applyFilters()"
                style="width:100%;padding:10px 12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Users Table -->
        <section style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);overflow:hidden;">
          <div style="padding:20px 24px;border-bottom:1px solid #eee;">
            <h2 style="margin:0;color:#333;font-size:16px;font-weight:600;">All Users</h2>
          </div>

          <div *ngIf="loading" style="text-align:center;padding:60px 20px;color:#999;">
            Loading users...
          </div>

          <div *ngIf="!loading && filteredUsers.length === 0" style="text-align:center;padding:60px 20px;color:#999;">
            <div style="font-size:48px;margin-bottom:16px;">👤</div>
            <div style="font-size:16px;">No users found</div>
          </div>

          <div *ngIf="!loading && filteredUsers.length > 0" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6;">
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Name</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Email</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Phone</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Role</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Status</th>
                  <th style="padding:16px 24px;text-align:left;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Last Login</th>
                  <th style="padding:16px 24px;text-align:center;font-size:13px;font-weight:700;color:#495057;text-transform:uppercase;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let user of filteredUsers"
                  style="border-bottom:1px solid #f0f0f0;"
                  (mouseenter)="$event.currentTarget.style.background='#f8f9fa'"
                  (mouseleave)="$event.currentTarget.style.background='#fff'">
                  <td style="padding:16px 24px;color:#333;font-weight:600;">{{ user.firstName }} {{ user.lastName }}</td>
                  <td style="padding:16px 24px;color:#666;">{{ user.email }}</td>
                  <td style="padding:16px 24px;color:#666;">{{ user.phone || '-' }}</td>
                  <td style="padding:16px 24px;">
                    <span
                      [style.background]="getRoleBadgeColor(user.role)"
                      style="padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td style="padding:16px 24px;">
                    <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
                      <input
                        type="checkbox"
                        [checked]="user.active"
                        (change)="toggleActive(user)"
                        style="display:none;">
                      <span style="position:relative;width:48px;height:24px;border-radius:12px;transition:background 0.3s;"
                            [style.background]="user.active ? '#28a745' : '#ccc'">
                        <span style="position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform 0.3s;"
                              [style.transform]="user.active ? 'translateX(24px)' : 'translateX(0)'"></span>
                      </span>
                    </label>
                  </td>
                  <td style="padding:16px 24px;color:#666;font-size:13px;">
                    {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
                  </td>
                  <td style="padding:16px 24px;text-align:center;">
                    <div style="display:flex;gap:8px;justify-content:center;">
                      <button
                        (click)="openEditModal(user)"
                        style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                        Edit
                      </button>
                      <button
                        (click)="openResetPasswordModal(user)"
                        style="background:#ffc107;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
                        Reset
                      </button>
                      <button
                        (click)="deleteUser(user.id)"
                        [disabled]="user.id === currentUserId"
                        style="background:#dc3545;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;"
                        [style.opacity]="user.id === currentUserId ? '0.5' : '1'"
                        [style.cursor]="user.id === currentUserId ? 'not-allowed' : 'pointer'">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <!-- Add/Edit User Modal -->
    <div *ngIf="showModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;"
         (click)="closeModal()">
      <div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow-y:auto;" (click)="$event.stopPropagation()">
        <div style="padding:24px;border-bottom:2px solid #c4a75b;">
          <h2 style="margin:0;color:#333;font-size:20px;font-weight:700;">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
        </div>

        <form (submit)="saveUser(); $event.preventDefault()" style="padding:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                First Name <span style="color:#c4a75b;">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formUser.firstName"
                name="firstName"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
            <div>
              <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
                Last Name <span style="color:#c4a75b;">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formUser.lastName"
                name="lastName"
                required
                style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            </div>
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              Email <span style="color:#c4a75b;">*</span>
            </label>
            <input
              type="email"
              [(ngModel)]="formUser.email"
              name="email"
              required
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              Phone
            </label>
            <input
              type="tel"
              [(ngModel)]="formUser.phone"
              name="phone"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              Role <span style="color:#c4a75b;">*</span>
            </label>
            <select
              [(ngModel)]="formUser.role"
              name="role"
              required
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="WAITER">Waiter</option>
              <option value="KITCHEN_STAFF">Kitchen Staff</option>
              <option value="INVENTORY_CLERK">Inventory Clerk</option>
            </select>
          </div>

          <div *ngIf="!isEditMode" style="margin-bottom:20px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              Password <span style="color:#c4a75b;">*</span>
            </label>
            <input
              type="password"
              [(ngModel)]="formUser.password"
              name="password"
              [required]="!isEditMode"
              minlength="6"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            <div style="font-size:12px;color:#666;margin-top:4px;">Minimum 6 characters</div>
          </div>

          <div style="margin-bottom:24px;">
            <label style="display:flex;align-items:center;cursor:pointer;user-select:none;">
              <input
                type="checkbox"
                [(ngModel)]="formUser.active"
                name="active"
                style="margin-right:8px;width:18px;height:18px;cursor:pointer;">
              <span style="font-size:14px;font-weight:600;color:#333;">Active User</span>
            </label>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing"
              style="flex:1;background:#c4a75b;color:#1a1a1a;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;"
              [style.opacity]="processing ? '0.5' : '1'">
              {{ processing ? 'Saving...' : isEditMode ? 'Update User' : 'Create User' }}
            </button>
            <button
              type="button"
              (click)="closeModal()"
              style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div *ngIf="showResetPasswordModal"
         style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;"
         (click)="closeResetPasswordModal()">
      <div style="background:#fff;border-radius:16px;max-width:450px;width:100%;padding:32px;" (click)="$event.stopPropagation()">
        <h2 style="margin:0 0 24px 0;color:#333;font-size:20px;font-weight:700;text-align:center;">🔑 Reset Password</h2>

        <div style="background:#fff3cd;border:1px solid #ffc107;padding:16px;border-radius:8px;margin-bottom:24px;">
          <div style="font-weight:600;color:#856404;margin-bottom:4px;">User: {{ resetPasswordUser?.firstName }} {{ resetPasswordUser?.lastName }}</div>
          <div style="font-size:13px;color:#856404;">{{ resetPasswordUser?.email }}</div>
        </div>

        <form (submit)="resetPassword(); $event.preventDefault()">
          <div style="margin-bottom:24px;">
            <label style="display:block;font-size:14px;font-weight:600;color:#333;margin-bottom:8px;">
              New Password <span style="color:#c4a75b;">*</span>
            </label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              minlength="6"
              style="width:100%;padding:12px;border:2px solid #ddd;border-radius:8px;font-size:14px;outline:none;">
            <div style="font-size:12px;color:#666;margin-top:4px;">Minimum 6 characters</div>
          </div>

          <div style="display:flex;gap:12px;">
            <button
              type="submit"
              [disabled]="processing || !newPassword || newPassword.length < 6"
              style="flex:1;background:#c4a75b;color:#1a1a1a;border:none;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;"
              [style.opacity]="processing || !newPassword || newPassword.length < 6 ? '0.5' : '1'">
              {{ processing ? 'Resetting...' : 'Reset Password' }}
            </button>
            <button
              type="button"
              (click)="closeResetPasswordModal()"
              style="flex:1;background:#fff;color:#666;border:2px solid #ddd;padding:14px;border-radius:8px;font-weight:600;cursor:pointer;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  processing = false;

  showModal = false;
  isEditMode = false;
  editingUserId: number | null = null;

  showResetPasswordModal = false;
  resetPasswordUser: User | null = null;
  newPassword = '';

  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  currentUserId: number;

  formUser: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CASHIER',
    password: '',
    active: true
  };

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.currentUserId = this.authService.currentUser?.id || 0;
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(this.searchTerm));

      const matchesRole = !this.filterRole || user.role === this.filterRole;
      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'active' && user.active) ||
        (this.filterStatus === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  getActiveCount(): number {
    return this.users.filter(u => u.active).length;
  }

  getRoleCount(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      'ADMIN': 'Admin',
      'OWNER': 'Owner',
      'MANAGER': 'Manager',
      'CASHIER': 'Cashier',
      'WAITER': 'Waiter',
      'KITCHEN_STAFF': 'Kitchen Staff',
      'INVENTORY_CLERK': 'Inventory Clerk'
    };
    return labels[role] || role;
  }

  getRoleBadgeColor(role: string): string {
    const colors: any = {
      'ADMIN': '#c4a75b',
      'OWNER': '#9b59b6',
      'MANAGER': '#007bff',
      'CASHIER': '#28a745',
      'WAITER': '#e74c3c',
      'KITCHEN_STAFF': '#e67e22',
      'INVENTORY_CLERK': '#ffc107'
    };
    return colors[role] || '#6c757d';
  }

  openAddModal() {
    this.isEditMode = false;
    this.formUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'CASHIER',
      password: '',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.formUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      active: user.active
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingUserId = null;
  }

  saveUser() {
    this.processing = true;

    if (this.isEditMode && this.editingUserId) {
      const updateData: UpdateUserRequest = {
        firstName: this.formUser.firstName,
        lastName: this.formUser.lastName,
        email: this.formUser.email,
        phone: this.formUser.phone,
        role: this.formUser.role,
        active: this.formUser.active
      };

      this.userService.update(this.editingUserId.toString(), updateData).subscribe({
        next: () => {
          this.processing = false;
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.processing = false;
          console.error('Failed to update user:', err);
          alert('Failed to update user. Please try again.');
        }
      });
    } else {
      const createData: CreateUserRequest = {
        firstName: this.formUser.firstName,
        lastName: this.formUser.lastName,
        email: this.formUser.email,
        phone: this.formUser.phone,
        password: this.formUser.password,
        role: this.formUser.role,
        active: this.formUser.active
      };

      this.userService.create(createData).subscribe({
        next: () => {
          this.processing = false;
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.processing = false;
          console.error('Failed to create user:', err);
          alert('Failed to create user. Please try again.');
        }
      });
    }
  }

  toggleActive(user: User) {
    if (user.id === this.currentUserId) {
      alert('You cannot deactivate your own account!');
      return;
    }

    this.userService.toggleActive(user.id.toString(), !user.active).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to toggle user status:', err);
        alert('Failed to update user status. Please try again.');
      }
    });
  }

  openResetPasswordModal(user: User) {
    this.resetPasswordUser = user;
    this.newPassword = '';
    this.showResetPasswordModal = true;
  }

  closeResetPasswordModal() {
    this.showResetPasswordModal = false;
    this.resetPasswordUser = null;
    this.newPassword = '';
  }

  resetPassword() {
    if (!this.resetPasswordUser || !this.newPassword || this.newPassword.length < 6) {
      return;
    }

    this.processing = true;
    this.userService.resetPassword(this.resetPasswordUser.id.toString(), this.newPassword).subscribe({
      next: () => {
        this.processing = false;
        this.closeResetPasswordModal();
        alert('Password reset successfully!');
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to reset password:', err);
        alert('Failed to reset password. Please try again.');
      }
    });
  }

  deleteUser(id: number) {
    if (id === this.currentUserId) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    this.userService.delete(id.toString()).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user. Please try again.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
