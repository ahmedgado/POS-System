# POS System - Bilingual Support (Arabic/English)

## 🌍 Language Support

This POS system supports **Arabic** and **English** with full RTL (Right-to-Left) support for Arabic.

## Features

- ✅ Full Arabic translation
- ✅ Full English translation
- ✅ RTL layout for Arabic
- ✅ LTR layout for English
- ✅ Language switcher in header
- ✅ Persistent language preference
- ✅ Date/Number formatting per locale
- ✅ Arabic fonts (Cairo, Tajawal)

## Implementation

### Angular i18n with ngx-translate

**Packages to install**:
```json
"@ngx-translate/core": "^15.0.0",
"@ngx-translate/http-loader": "^8.0.0",
"@angular/localize": "^17.0.0"
```

### Translation Files Structure

```
frontend/src/assets/i18n/
├── en.json  (English translations)
└── ar.json  (Arabic translations)
```

### RTL/LTR Switching

The app automatically switches between RTL and LTR based on selected language:
- **Arabic**: RTL layout, Arabic fonts
- **English**: LTR layout, Standard fonts

### Supported Languages

| Language | Code | Direction | Font |
|----------|------|-----------|------|
| English  | en   | LTR       | Roboto, System fonts |
| Arabic   | ar   | RTL       | Cairo, Tajawal |

## Translation Keys

### Common Keys
- `app_name`: "نظام نقاط البيع" / "POS System"
- `login`: "تسجيل الدخول" / "Login"
- `logout`: "تسجيل الخروج" / "Logout"
- `save`: "حفظ" / "Save"
- `cancel`: "إلغاء" / "Cancel"
- `delete`: "حذف" / "Delete"
- `edit`: "تعديل" / "Edit"
- `search`: "بحث" / "Search"

### User Roles
- `admin`: "مدير النظام" / "Admin"
- `owner`: "المالك" / "Owner"
- `manager`: "مدير المتجر" / "Manager"
- `cashier`: "كاشير" / "Cashier"
- `inventory_clerk`: "موظف المخزون" / "Inventory Clerk"

### Dashboard
- `dashboard`: "لوحة التحكم" / "Dashboard"
- `today_sales`: "مبيعات اليوم" / "Today's Sales"
- `total_transactions`: "إجمالي المعاملات" / "Total Transactions"
- `low_stock`: "مخزون منخفض" / "Low Stock"
- `top_products`: "المنتجات الأكثر مبيعاً" / "Top Products"

### Products
- `products`: "المنتجات" / "Products"
- `product_name`: "اسم المنتج" / "Product Name"
- `price`: "السعر" / "Price"
- `stock`: "المخزون" / "Stock"
- `category`: "الفئة" / "Category"
- `barcode`: "الباركود" / "Barcode"

### Sales
- `sales`: "المبيعات" / "Sales"
- `new_sale`: "عملية بيع جديدة" / "New Sale"
- `subtotal`: "المجموع الفرعي" / "Subtotal"
- `tax`: "الضريبة" / "Tax"
- `discount`: "الخصم" / "Discount"
- `total`: "الإجمالي" / "Total"
- `payment_method`: "طريقة الدفع" / "Payment Method"
- `cash`: "نقدي" / "Cash"
- `card`: "بطاقة" / "Card"

### Reports
- `reports`: "التقارير" / "Reports"
- `sales_report`: "تقرير المبيعات" / "Sales Report"
- `inventory_report`: "تقرير المخزون" / "Inventory Report"
- `financial_report`: "التقرير المالي" / "Financial Report"
- `export_pdf`: "تصدير PDF" / "Export PDF"
- `export_excel`: "تصدير Excel" / "Export Excel"

### Messages
- `success`: "نجح" / "Success"
- `error`: "خطأ" / "Error"
- `warning`: "تحذير" / "Warning"
- `confirm_delete`: "هل أنت متأكد من الحذف؟" / "Are you sure you want to delete?"
- `saved_successfully`: "تم الحفظ بنجاح" / "Saved successfully"
- `deleted_successfully`: "تم الحذف بنجاح" / "Deleted successfully"

## Date & Number Formatting

### Date Format
- **Arabic**: `DD/MM/YYYY` (e.g., 04/01/2025)
- **English**: `MM/DD/YYYY` (e.g., 01/04/2025)

### Number Format
- **Arabic**: ١٢٣٤٫٥٦ (Arabic-Indic digits)
- **English**: 1234.56 (Western digits)

### Currency
- **Arabic**: "١٢٣٫٥٠ ر.س" (SAR)
- **English**: "$123.50" (USD)

## Fonts

### Arabic Fonts
Primary: **Cairo** (Google Fonts)
```css
font-family: 'Cairo', 'Tajawal', sans-serif;
```

### English Fonts
Primary: **Roboto** (System default)
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

## UI Considerations

### RTL Layout (Arabic)
- Sidebar on the right
- Text aligned right
- Icons mirrored
- Progress bars from right to left
- Dropdown menus open to left

### LTR Layout (English)
- Sidebar on the left
- Text aligned left
- Icons standard
- Progress bars from left to right
- Dropdown menus open to right

## Language Switcher

Located in header, displays:
- 🇬🇧 English
- 🇸🇦 العربية

Clicking switches language and direction immediately.

## Implementation in Components

```typescript
// Example component usage
constructor(private translate: TranslateService) {}

ngOnInit() {
  // Get current language
  const currentLang = this.translate.currentLang;

  // Get translation
  this.translate.get('dashboard.today_sales').subscribe((text: string) => {
    console.log(text); // "مبيعات اليوم" or "Today's Sales"
  });
}

// Switch language
switchLanguage(lang: 'ar' | 'en') {
  this.translate.use(lang);
  localStorage.setItem('language', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}
```

## Files to Create

1. **Translation files**:
   - `src/assets/i18n/en.json`
   - `src/assets/i18n/ar.json`

2. **Language service**:
   - `src/app/services/language.service.ts`

3. **RTL/LTR styles**:
   - `src/styles/rtl.scss`
   - `src/styles/ltr.scss`

4. **Theme with Arabic support**:
   - `src/themes/custom-theme.scss` (with Cairo font)

## Testing

Test the app in both languages:
- ✅ All text translates correctly
- ✅ Layout mirrors properly (RTL/LTR)
- ✅ Numbers format correctly
- ✅ Dates format correctly
- ✅ Currency displays correctly
- ✅ Icons position correctly
- ✅ Forms validate properly
- ✅ Reports generate in correct language

## Notes

- Default language: **Arabic** (since you're in Saudi Arabia)
- Fallback language: **English**
- Language persists in localStorage
- Direction changes on language switch
- All API responses should include language parameter
- PDF reports generate in selected language
- Receipt prints in selected language
- Email notifications use user's preferred language

---

**I'll implement full Arabic/English support when building the frontend!** 🌍
