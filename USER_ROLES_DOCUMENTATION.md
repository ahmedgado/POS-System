# User Roles & Permissions Documentation

## 📋 Available Roles

Based on the Prisma schema, the system has **7 distinct roles**:

1. **ADMIN** - Full system access
2. **OWNER** - Business owner access
3. **MANAGER** - Management access
4. **CASHIER** - Point of sale operations
5. **WAITER** - Restaurant service staff
6. **KITCHEN_STAFF** - Kitchen operations
7. **INVENTORY_CLERK** - Inventory management

---

## 🔐 Role Permissions Matrix

### **1. ADMIN (Administrator)**
**Full system access - Can do everything**

| Feature | Permissions |
|---------|------------|
| **Users** | ✅ Create, Read, Update, Delete, Toggle Active, Reset Password |
| **Products** | ✅ Full CRUD + Bulk operations |
| **Categories** | ✅ Full CRUD |
| **Sales** | ✅ View all, Create, Void |
| **Shifts** | ✅ Full management |
| **Dashboard** | ✅ Full access to all analytics |
| **Settings** | ✅ Full system configuration |
| **Reports** | ✅ All reports |
| **Customers** | ✅ Full CRUD |
| **Modifiers** | ✅ Full CRUD |
| **Tables/Floors** | ✅ Full management |
| **Kitchen** | ✅ View and manage |

---

### **2. OWNER**
**Business owner - Similar to Admin but focused on business operations**

| Feature | Permissions |
|---------|------------|
| **Dashboard** | ✅ Full access to analytics |
| **Reports** | ✅ All financial and operational reports |
| **Sales** | ✅ View all sales data |
| **Users** | ❌ Cannot manage users (Admin only) |
| **Settings** | ❌ Limited access |
| **Products** | ✅ View, limited editing |

---

### **3. MANAGER**
**Store/Restaurant Manager - Day-to-day operations**

| Feature | Permissions |
|---------|------------|
| **Users** | ✅ View users, Update users (cannot create/delete) |
| **Products** | ✅ Create, Read, Update (cannot delete) |
| **Categories** | ✅ Full CRUD |
| **Sales** | ✅ View all, Void sales |
| **Shifts** | ✅ Full management |
| **Dashboard** | ✅ Full access |
| **Settings** | ✅ View and update |
| **Reports** | ✅ All reports |
| **Customers** | ✅ Full CRUD |
| **Modifiers** | ✅ Full CRUD |
| **Tables/Floors** | ✅ Full management |
| **Kitchen** | ✅ View and manage |

---

### **4. CASHIER**
**Point of Sale Operations - Limited to sales transactions**

| Feature | Permissions |
|---------|------------|
| **POS** | ✅ Create sales, Process payments |
| **Sales** | ✅ View own sales only |
| **Shifts** | ✅ Open/Close own shifts |
| **Customers** | ✅ View, Create (basic info) |
| **Products** | ✅ View only (for POS) |
| **Dashboard** | ❌ No access |
| **Reports** | ❌ No access |
| **Settings** | ❌ No access |
| **Users** | ❌ No access |

---

### **5. WAITER**
**Restaurant Service Staff - Table service and orders**

| Feature | Permissions |
|---------|------------|
| **Tables** | ✅ View table status, Assign orders to tables |
| **Orders** | ✅ Create orders, Send to kitchen |
| **Sales** | ✅ View own sales (tables served) |
| **Customers** | ✅ View, Create basic info |
| **Products** | ✅ View menu items |
| **Kitchen** | ✅ View order status |
| **POS** | ⚠️ Limited - Can create orders but may need manager approval for payment |
| **Dashboard** | ❌ No access |
| **Reports** | ❌ No access |

---

### **6. KITCHEN_STAFF**
**Kitchen Operations - Food preparation**

| Feature | Permissions |
|---------|------------|
| **Kitchen Display** | ✅ View tickets, Update status (New → In Progress → Ready) |
| **Orders** | ✅ View order details and special instructions |
| **Products** | ✅ View recipes and ingredients |
| **Inventory** | ⚠️ View only (for ingredient availability) |
| **POS** | ❌ No access |
| **Sales** | ❌ No access |
| **Dashboard** | ❌ No access |
| **Reports** | ❌ No access |

---

### **7. INVENTORY_CLERK**
**Inventory Management - Stock control**

| Feature | Permissions |
|---------|------------|
| **Products** | ✅ Create, Read, Update stock levels |
| **Categories** | ✅ View, Create |
| **Stock Movements** | ✅ Full CRUD (Purchase, Adjustment, Damage, etc.) |
| **Ingredients** | ✅ Full CRUD |
| **Recipes** | ✅ View, Update |
| **Reports** | ✅ Inventory reports only |
| **Sales** | ❌ No access |
| **POS** | ❌ No access |
| **Dashboard** | ❌ No access |

---

## 🔍 Detailed Permission Breakdown

### **User Management**
```typescript
GET    /api/users          → ADMIN, MANAGER
POST   /api/users          → ADMIN only
PUT    /api/users/:id      → ADMIN, MANAGER
DELETE /api/users/:id      → ADMIN only
PATCH  /api/users/:id/toggle → ADMIN only
POST   /api/users/:id/reset-password → ADMIN only
```

### **Product Management**
```typescript
GET    /api/products       → ALL ROLES (view)
POST   /api/products       → ADMIN, MANAGER, INVENTORY_CLERK
PUT    /api/products/:id   → ADMIN, MANAGER, INVENTORY_CLERK
DELETE /api/products/:id   → ADMIN only
PATCH  /api/products/:id/stock → ADMIN, MANAGER, INVENTORY_CLERK
POST   /api/products/bulk  → ADMIN only
GET    /api/products/low-stock → ADMIN, MANAGER
```

### **Sales Management**
```typescript
GET    /api/sales          → ADMIN, MANAGER, CASHIER (own sales)
POST   /api/sales          → CASHIER, MANAGER, ADMIN
POST   /api/sales/:id/void → MANAGER, ADMIN only
GET    /api/sales/report   → ADMIN, MANAGER only
```

### **Shift Management**
```typescript
GET    /api/shifts         → CASHIER, MANAGER, ADMIN
POST   /api/shifts/open    → CASHIER, MANAGER, ADMIN
POST   /api/shifts/close   → CASHIER, MANAGER, ADMIN
GET    /api/shifts/current → CASHIER, MANAGER, ADMIN
```

### **Dashboard & Analytics**
```typescript
GET    /api/dashboard      → ADMIN, OWNER, MANAGER only
```

### **Settings**
```typescript
GET    /api/settings       → ADMIN, MANAGER
PUT    /api/settings       → ADMIN, MANAGER
```

---

## 🧪 Testing Checklist

### **Test User Accounts Needed:**
1. ✅ **admin@restaurant.com** (ADMIN) - Already exists
2. ⚠️ **manager@restaurant.com** (MANAGER) - Need to create
3. ⚠️ **cashier@restaurant.com** (CASHIER) - Need to create
4. ⚠️ **waiter@restaurant.com** (WAITER) - Need to create
5. ⚠️ **kitchen@restaurant.com** (KITCHEN_STAFF) - Need to create
6. ⚠️ **inventory@restaurant.com** (INVENTORY_CLERK) - Need to create

### **Test Scenarios:**

#### **Scenario 1: ADMIN Access**
- [ ] Login as admin
- [ ] Access all menu items
- [ ] Create a new user
- [ ] Delete a product
- [ ] View all reports
- [ ] Modify system settings

#### **Scenario 2: MANAGER Access**
- [ ] Login as manager
- [ ] Cannot create users (should fail)
- [ ] Can update existing users
- [ ] Can create/edit products
- [ ] Cannot delete products (should fail)
- [ ] Can view all sales
- [ ] Can void a sale

#### **Scenario 3: CASHIER Access**
- [ ] Login as cashier
- [ ] Can access POS
- [ ] Can create sales
- [ ] Cannot access dashboard (should redirect)
- [ ] Cannot access reports (should show error)
- [ ] Can open/close own shift

#### **Scenario 4: WAITER Access**
- [ ] Login as waiter
- [ ] Can view tables
- [ ] Can create orders
- [ ] Can assign orders to tables
- [ ] Cannot access admin features
- [ ] Can view own sales only

#### **Scenario 5: KITCHEN_STAFF Access**
- [ ] Login as kitchen staff
- [ ] Can access Kitchen Display
- [ ] Can update ticket status
- [ ] Cannot access POS
- [ ] Cannot view sales data

#### **Scenario 6: INVENTORY_CLERK Access**
- [ ] Login as inventory clerk
- [ ] Can manage products
- [ ] Can update stock levels
- [ ] Can view inventory reports
- [ ] Cannot access sales data
- [ ] Cannot access POS

---

## 🚨 Security Notes

1. **Password Requirements**: All users should have strong passwords
2. **Session Management**: Sessions expire after inactivity
3. **Audit Logging**: All actions are logged with user ID
4. **Role Enforcement**: Backend validates roles on every API call
5. **Frontend Guards**: Routes are protected based on user role

---

## 📝 Recommendations

1. **Create test users** for each role to verify permissions
2. **Document role changes** when modifying permissions
3. **Regular audits** of user access levels
4. **Training** for each role on their specific features
5. **Principle of least privilege** - Give minimum necessary access

---

## 🔄 Role Assignment Workflow

1. **New Employee Onboarding**:
   - Admin creates user account
   - Assigns appropriate role
   - Provides training for role-specific features
   - User changes password on first login

2. **Role Changes**:
   - Manager requests role change
   - Admin approves and updates
   - User is notified
   - Access is immediately updated

3. **Employee Departure**:
   - Admin deactivates account (don't delete for audit trail)
   - User status set to INACTIVE or SUSPENDED
   - All active sessions terminated
