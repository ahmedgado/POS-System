# Quick Guide: Creating Test Users for All Roles

## 🚀 How to Create Test Users

### Step 1: Access Users Page
1. Open browser: http://localhost
2. Login as: **admin@restaurant.com** / **password123**
3. Navigate to: **Users** (in sidebar)
4. Click: **"+ Add New User"** button

---

## 📝 Test Users to Create

### 1. Owner
```
First Name:    Restaurant
Last Name:     Owner
Email:         owner@restaurant.com
Phone:         (optional)
Role:          OWNER
Password:      password123
Active:        ✓ Yes
```

### 2. Cashier
```
First Name:    POS
Last Name:     Cashier
Email:         cashier@restaurant.com
Phone:         (optional)
Role:          CASHIER
Password:      password123
Active:        ✓ Yes
```

### 3. Waiter
```
First Name:    Service
Last Name:     Waiter
Email:         waiter@restaurant.com
Phone:         (optional)
Role:          WAITER
Password:      password123
Active:        ✓ Yes
```

### 4. Kitchen Staff
```
First Name:    Kitchen
Last Name:     Staff
Email:         kitchen@restaurant.com
Phone:         (optional)
Role:          KITCHEN_STAFF
Password:      password123
Active:        ✓ Yes
```

### 5. Inventory Clerk
```
First Name:    Inventory
Last Name:     Clerk
Email:         inventory@restaurant.com
Phone:         (optional)
Role:          INVENTORY_CLERK
Password:      password123
Active:        ✓ Yes
```

---

## ✅ Already Created

- ✅ **Admin** - admin@restaurant.com (ADMIN)
- ✅ **Manager** - manager@restaurant.com (MANAGER)

---

## 🧪 After Creating All Users

You should have **7 total users** with these roles:

| Email | Role | Badge Color |
|-------|------|-------------|
| admin@restaurant.com | ADMIN | 🟡 Gold |
| owner@restaurant.com | OWNER | 🟣 Purple |
| manager@restaurant.com | MANAGER | 🔵 Blue |
| cashier@restaurant.com | CASHIER | 🟢 Green |
| waiter@restaurant.com | WAITER | 🔴 Red |
| kitchen@restaurant.com | KITCHEN_STAFF | 🟠 Orange |
| inventory@restaurant.com | INVENTORY_CLERK | 🟡 Yellow |

All passwords: **password123**

---

## 🔍 Testing Role Permissions

After creating all users, test each role:

### Test 1: Admin Access
- Login as: admin@restaurant.com
- Should see: ALL menu items
- Can: Create/edit/delete everything

### Test 2: Manager Access
- Login as: manager@restaurant.com
- Should see: Most features except user creation
- Cannot: Delete products, create new users

### Test 3: Cashier Access
- Login as: cashier@restaurant.com
- Should see: POS, Sales (own only)
- Cannot: Access dashboard, reports, settings

### Test 4: Waiter Access
- Login as: waiter@restaurant.com
- Should see: Tables, Orders, POS (limited)
- Cannot: Access admin features

### Test 5: Kitchen Staff Access
- Login as: kitchen@restaurant.com
- Should see: Kitchen Display only
- Cannot: Access POS, sales data

### Test 6: Inventory Clerk Access
- Login as: inventory@restaurant.com
- Should see: Products, Stock, Inventory reports
- Cannot: Access POS, sales

### Test 7: Owner Access
- Login as: owner@restaurant.com
- Should see: Dashboard, Reports, Analytics
- Cannot: Manage users (admin only)

---

## 📊 Expected Results

After all users are created, the Users page should show:
- **Total Users**: 7
- **Active Users**: 7
- **Admins**: 1
- **Cashiers**: 1
- **Managers**: 1
- **Waiters**: 1
- **Kitchen Staff**: 1
- **Inventory Clerks**: 1
- **Owners**: 1

---

## 🎯 Next Steps

1. Create all 5 remaining users (should take ~5 minutes)
2. Verify all users appear in the list
3. Test logging in as each role
4. Document any permission issues found
5. Update role permissions if needed

---

## 💡 Tips

- Use the same password (password123) for all test users for easy testing
- Each role should have a different colored badge
- You can filter users by role using the dropdown
- You can toggle users active/inactive with the switch
- You can reset passwords using the "Reset" button

---

## ⚠️ Important Notes

- Don't delete the admin user (you can't delete yourself)
- Don't deactivate the admin user
- Keep at least one admin active at all times
- All test users use the same password for convenience
- In production, use strong unique passwords
