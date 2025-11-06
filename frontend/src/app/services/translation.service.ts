import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<Language>('en');
  public language$ = this.currentLanguage.asObservable();

  private translations: Translations = {
    // Navigation
    'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
    'nav.pos': { en: 'POS Terminal', ar: 'نقطة البيع' },
    'nav.sales': { en: 'Sales', ar: 'المبيعات' },
    'nav.shifts': { en: 'Shifts', ar: 'الورديات' },
    'nav.customers': { en: 'Customers', ar: 'العملاء' },
    'nav.categories': { en: 'Categories', ar: 'الفئات' },
    'nav.products': { en: 'Products', ar: 'المنتجات' },
    'nav.users': { en: 'Users', ar: 'المستخدمين' },
    'nav.reports': { en: 'Reports', ar: 'التقارير' },
    'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
    'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج' },

    // Common
    'common.save': { en: 'Save', ar: 'حفظ' },
    'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
    'common.delete': { en: 'Delete', ar: 'حذف' },
    'common.edit': { en: 'Edit', ar: 'تعديل' },
    'common.add': { en: 'Add', ar: 'إضافة' },
    'common.search': { en: 'Search', ar: 'بحث' },
    'common.filter': { en: 'Filter', ar: 'تصفية' },
    'common.export': { en: 'Export', ar: 'تصدير' },
    'common.print': { en: 'Print', ar: 'طباعة' },
    'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
    'common.noData': { en: 'No data available', ar: 'لا توجد بيانات' },
    'common.confirm': { en: 'Confirm', ar: 'تأكيد' },
    'common.yes': { en: 'Yes', ar: 'نعم' },
    'common.no': { en: 'No', ar: 'لا' },
    'common.close': { en: 'Close', ar: 'إغلاق' },
    'common.total': { en: 'Total', ar: 'المجموع' },
    'common.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
    'common.tax': { en: 'Tax', ar: 'الضريبة' },
    'common.discount': { en: 'Discount', ar: 'الخصم' },
    'common.price': { en: 'Price', ar: 'السعر' },
    'common.quantity': { en: 'Quantity', ar: 'الكمية' },
    'common.date': { en: 'Date', ar: 'التاريخ' },
    'common.time': { en: 'Time', ar: 'الوقت' },
    'common.status': { en: 'Status', ar: 'الحالة' },
    'common.actions': { en: 'Actions', ar: 'الإجراءات' },

    // Dashboard
    'dashboard.title': { en: 'Dashboard', ar: 'لوحة التحكم' },
    'dashboard.todaySales': { en: "Today's Sales", ar: 'مبيعات اليوم' },
    'dashboard.totalRevenue': { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
    'dashboard.totalOrders': { en: 'Total Orders', ar: 'إجمالي الطلبات' },
    'dashboard.lowStock': { en: 'Low Stock Items', ar: 'منتجات قليلة المخزون' },

    // POS
    'pos.title': { en: 'POS Terminal', ar: 'نقطة البيع' },
    'pos.products': { en: 'Products', ar: 'المنتجات' },
    'pos.cart': { en: 'Shopping Cart', ar: 'سلة التسوق' },
    'pos.payment': { en: 'Payment', ar: 'الدفع' },
    'pos.cash': { en: 'Cash', ar: 'نقدي' },
    'pos.card': { en: 'Card', ar: 'بطاقة' },
    'pos.mobile': { en: 'Mobile', ar: 'محفظة إلكترونية' },
    'pos.completeSale': { en: 'Complete Sale', ar: 'إتمام البيع' },
    'pos.clearCart': { en: 'Clear Cart', ar: 'إفراغ السلة' },
    'pos.change': { en: 'Change', ar: 'الباقي' },
    'pos.amountPaid': { en: 'Amount Paid', ar: 'المبلغ المدفوع' },

    // Products
    'products.title': { en: 'Products Management', ar: 'إدارة المنتجات' },
    'products.addProduct': { en: 'Add Product', ar: 'إضافة منتج' },
    'products.productName': { en: 'Product Name', ar: 'اسم المنتج' },
    'products.category': { en: 'Category', ar: 'الفئة' },
    'products.sku': { en: 'SKU', ar: 'رمز المنتج' },
    'products.barcode': { en: 'Barcode', ar: 'الباركود' },
    'products.stock': { en: 'Stock', ar: 'المخزون' },
    'products.minStock': { en: 'Min Stock', ar: 'الحد الأدنى' },
    'products.inStock': { en: 'In Stock', ar: 'متوفر' },
    'products.outOfStock': { en: 'Out of Stock', ar: 'نفد المخزون' },
    'products.lowStock': { en: 'Low Stock', ar: 'مخزون منخفض' },

    // Customers
    'customers.title': { en: 'Customers Management', ar: 'إدارة العملاء' },
    'customers.addCustomer': { en: 'Add Customer', ar: 'إضافة عميل' },
    'customers.name': { en: 'Name', ar: 'الاسم' },
    'customers.email': { en: 'Email', ar: 'البريد الإلكتروني' },
    'customers.phone': { en: 'Phone', ar: 'الهاتف' },
    'customers.address': { en: 'Address', ar: 'العنوان' },
    'customers.loyaltyPoints': { en: 'Loyalty Points', ar: 'نقاط الولاء' },

    // Users
    'users.title': { en: 'Users & Staff Management', ar: 'إدارة المستخدمين والموظفين' },
    'users.addUser': { en: 'Add User', ar: 'إضافة مستخدم' },
    'users.firstName': { en: 'First Name', ar: 'الاسم الأول' },
    'users.lastName': { en: 'Last Name', ar: 'اسم العائلة' },
    'users.role': { en: 'Role', ar: 'الدور' },
    'users.admin': { en: 'Admin', ar: 'مدير' },
    'users.manager': { en: 'Manager', ar: 'مشرف' },
    'users.cashier': { en: 'Cashier', ar: 'كاشير' },
    'users.active': { en: 'Active', ar: 'نشط' },
    'users.inactive': { en: 'Inactive', ar: 'غير نشط' },

    // Sales
    'sales.title': { en: 'Sales History', ar: 'سجل المبيعات' },
    'sales.saleId': { en: 'Sale ID', ar: 'رقم البيع' },
    'sales.paymentMethod': { en: 'Payment Method', ar: 'طريقة الدفع' },
    'sales.totalAmount': { en: 'Total Amount', ar: 'المبلغ الإجمالي' },

    // Reports
    'reports.title': { en: 'Reports & Analytics', ar: 'التقارير والتحليلات' },
    'reports.sales': { en: 'Sales Report', ar: 'تقرير المبيعات' },
    'reports.inventory': { en: 'Inventory', ar: 'المخزون' },
    'reports.cashier': { en: 'Cashier Performance', ar: 'أداء الكاشير' },
    'reports.financial': { en: 'Financial', ar: 'مالي' },
    'reports.generate': { en: 'Generate Report', ar: 'إنشاء التقرير' },

    // Settings
    'settings.title': { en: 'Settings & Configuration', ar: 'الإعدادات والتهيئة' },
    'settings.store': { en: 'Store Info', ar: 'معلومات المتجر' },
    'settings.tax': { en: 'Tax', ar: 'الضريبة' },
    'settings.receipt': { en: 'Receipt', ar: 'الفاتورة' },
    'settings.currency': { en: 'Currency', ar: 'العملة' },
    'settings.system': { en: 'System', ar: 'النظام' },
    'settings.backup': { en: 'Backup', ar: 'النسخ الاحتياطي' },

    // Login
    'login.title': { en: 'POS Login', ar: 'تسجيل الدخول' },
    'login.email': { en: 'Email', ar: 'البريد الإلكتروني' },
    'login.password': { en: 'Password', ar: 'كلمة المرور' },
    'login.signIn': { en: 'Sign In', ar: 'دخول' },
    'login.signingIn': { en: 'Signing in...', ar: 'جاري الدخول...' },
  };

  constructor(private translateService: TranslateService) {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      this.currentLanguage.next(savedLang);
      this.translateService.use(savedLang);
    } else {
      this.translateService.use('en');
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.next(lang);
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }

  translate(key: string): string {
    // First try ngx-translate (JSON files)
    const translated = this.translateService.instant(key);
    if (translated !== key) {
      return translated;
    }

    // Fallback to hardcoded translations
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[this.getCurrentLanguage()];
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }
}
