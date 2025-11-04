
# 🔑 POS System - User Credentials
# بيانات دخول نظام نقاط البيع

---

## 📋 **All User Accounts**

All passwords are: **`password123`**

---

## 👑 **ADMIN Users (Full System Access)**

### Admin 1
- **Email:** `admin1@pos.com`
- **Password:** `password123`
- **Role:** Administrator
- **Permissions:** Full system access, user management, settings, reports

### Admin 2
- **Email:** `admin2@pos.com`
- **Password:** `password123`
- **Role:** Administrator
- **Permissions:** Full system access, user management, settings, reports

**Access:** Everything - Dashboard, Products, Sales, Customers, Users, Shifts, Reports, Settings

---

## 💼 **OWNER Users (Business Metrics & Reports)**

### Owner 1
- **Email:** `owner1@pos.com`
- **Password:** `password123`
- **Role:** Business Owner
- **Permissions:** View all reports, analytics, business metrics

### Owner 2
- **Email:** `owner2@pos.com`
- **Password:** `password123`
- **Role:** Business Owner
- **Permissions:** View all reports, analytics, business metrics

**Access:** Executive Dashboard, Sales Reports, Financial Reports, Analytics

---

## 📊 **MANAGER Users (Operations Management)**

### Manager 1
- **Email:** `manager1@pos.com`
- **Password:** `password123`
- **Role:** Store Manager
- **Permissions:** Manage products, inventory, view reports, handle refunds

### Manager 2
- **Email:** `manager2@pos.com`
- **Password:** `password123`
- **Role:** Store Manager
- **Permissions:** Manage products, inventory, view reports, handle refunds

**Access:** Dashboard, Products, Sales History, Customers, Inventory, Shifts, Reports

---

## 💰 **CASHIER Users (POS Terminal Only)**

### Cashier 1
- **Email:** `cashier1@pos.com`
- **Password:** `password123`
- **Role:** Cashier
- **Permissions:** Process sales, open/close shifts, view own shift reports

### Cashier 2
- **Email:** `cashier2@pos.com`
- **Password:** `password123`
- **Role:** Cashier
- **Permissions:** Process sales, open/close shifts, view own shift reports

**Access:** POS Terminal, Customer Lookup, Shift Management (own shifts only)

---

## 📦 **INVENTORY CLERK Users (Stock Management)**

### Inventory Clerk 1
- **Email:** `inventory_clerk1@pos.com`
- **Password:** `password123`
- **Role:** Inventory Clerk
- **Permissions:** Manage products, update stock, receive shipments

### Inventory Clerk 2
- **Email:** `inventory_clerk2@pos.com`
- **Password:** `password123`
- **Role:** Inventory Clerk
- **Permissions:** Manage products, update stock, receive shipments

**Access:** Products, Inventory, Stock Adjustments, Receive Shipments

---

## 🔐 **Security Information**

### Password Policy:
- All demo passwords: `password123`
- **⚠️ IMPORTANT:** Change all passwords in production!
- Minimum 8 characters required
- Passwords are hashed with BCrypt (10 rounds)

### Session:
- JWT tokens expire after 24 hours
- Refresh tokens valid for 7 days
- Automatic logout on token expiration

---

## 📊 **Role Comparison Table**

| Feature | Admin | Owner | Manager | Cashier | Inventory |
|---------|-------|-------|---------|---------|-----------|
| **Dashboard** | ✅ All | ✅ Executive | ✅ Operations | ❌ | ❌ |
| **POS Terminal** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Products CRUD** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Stock Management** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Sales History** | ✅ All | ✅ All | ✅ All | ✅ Own | ❌ |
| **Process Refunds** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Customer Management** | ✅ | ❌ | ✅ | ✅ Lookup | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Shift Management** | ✅ All | ❌ | ✅ All | ✅ Own | ❌ |
| **Reports** | ✅ All | ✅ All | ✅ Most | ❌ | ❌ |
| **Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🎯 **Quick Login Guide**

### For Testing Full Features:
```
Email: admin1@pos.com
Password: password123
```

### For Testing POS Terminal:
```
Email: cashier1@pos.com
Password: password123
```

### For Testing Business Reports:
```
Email: owner1@pos.com
Password: password123
```

### For Testing Inventory:
```
Email: inventory_clerk1@pos.com
Password: password123
```

---

## 🌐 **Access URLs**

| Service | URL |
|---------|-----|
| **Login Page** | http://localhost/auth/login |
| **Dashboard** | http://localhost/dashboard |
| **POS Terminal** | http://localhost/cashier |

---

## 📝 **Demo Data Info**

When you run `./scripts/seed-demo-data.sh`, you get:

- ✅ **10 Users** (2 per role) - listed above
- ✅ **5000 Products** with placeholder images
- ✅ **1000 Customers** (600 Arabic names, 400 English names)
- ✅ **100 Sample Sales** transactions
- ✅ **8 Categories** with subcategories

---

## 🔄 **Change Password**

After login, users can change their password:
1. Click user profile (top right)
2. Select "Change Password"
3. Enter current password: `password123`
4. Enter new password (min 8 characters)
5. Confirm new password

---

## ⚠️ **Production Security Checklist**

Before deploying to production:

- [ ] Change all user passwords
- [ ] Remove demo accounts
- [ ] Enable 2FA (if implemented)
- [ ] Set strong JWT secret in `.env`
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable audit logging
- [ ] Review user permissions
- [ ] Implement password policies

---

## 📞 **Need Help?**

Forgot your password? Contact system administrator:
- Email: `admin1@pos.com`
- Or reset via database if you have access

---

## 🎉 **Ready to Start!**

1. Go to: http://localhost
2. Choose a user from above
3. Login with `password123`
4. Start exploring!

**Happy testing!**
**اختبار سعيد!**
