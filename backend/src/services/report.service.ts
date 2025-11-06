import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { prisma } from '../config/database';
import { Response } from 'express';

export class ReportService {
  // Generate Sales Report PDF
  async generateSalesReportPDF(filters: any, res: Response, language: string = 'en') {
    const sales = await this.getSalesData(filters);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');

    doc.pipe(res);

    // Title with background
    doc.rect(40, 40, doc.page.width - 80, 60).fill('#DC3545');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
      .text(language === 'ar' ? 'تقرير المبيعات' : 'Sales Report', 40, 55, {
        width: doc.page.width - 80,
        align: 'center'
      });

    // Period
    if (filters.startDate && filters.endDate) {
      doc.fontSize(12).text(
        `${language === 'ar' ? 'الفترة' : 'Period'}: ${filters.startDate} - ${filters.endDate}`,
        40, 75, { width: doc.page.width - 80, align: 'center' }
      );
    }

    // Summary Section
    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
    const avgOrder = sales.length > 0 ? totalRevenue / sales.length : 0;

    doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold')
      .text(language === 'ar' ? 'الملخص' : 'Summary', 40, 120);

    // Summary boxes
    const summaryY = 145;
    const boxWidth = (doc.page.width - 100) / 3;

    // Total Sales Box
    doc.rect(40, summaryY, boxWidth, 60).fillAndStroke('#F8F9FA', '#E0E0E0');
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
      .text(language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales', 45, summaryY + 10, { width: boxWidth - 10 });
    doc.fillColor('#DC3545').fontSize(20).font('Helvetica-Bold')
      .text(sales.length.toString(), 45, summaryY + 28, { width: boxWidth - 10 });

    // Total Revenue Box
    doc.rect(50 + boxWidth, summaryY, boxWidth, 60).fillAndStroke('#F8F9FA', '#E0E0E0');
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
      .text(language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue', 55 + boxWidth, summaryY + 10, { width: boxWidth - 10 });
    doc.fillColor('#28A745').fontSize(20).font('Helvetica-Bold')
      .text(`$${totalRevenue.toFixed(2)}`, 55 + boxWidth, summaryY + 28, { width: boxWidth - 10 });

    // Average Order Box
    doc.rect(60 + boxWidth * 2, summaryY, boxWidth, 60).fillAndStroke('#F8F9FA', '#E0E0E0');
    doc.fillColor('#666666').fontSize(10).font('Helvetica')
      .text(language === 'ar' ? 'متوسط الطلب' : 'Avg Order', 65 + boxWidth * 2, summaryY + 10, { width: boxWidth - 10 });
    doc.fillColor('#007BFF').fontSize(20).font('Helvetica-Bold')
      .text(`$${avgOrder.toFixed(2)}`, 65 + boxWidth * 2, summaryY + 28, { width: boxWidth - 10 });

    // Payment Methods Split
    const paymentSplitY = summaryY + 80;
    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold')
      .text(language === 'ar' ? 'توزيع طرق الدفع' : 'Payment Methods Split', 40, paymentSplitY);

    // Calculate payment methods breakdown
    const paymentMethods: any = {};
    sales.forEach((sale: any) => {
      if (!paymentMethods[sale.paymentMethod]) {
        paymentMethods[sale.paymentMethod] = { total: 0, count: 0 };
      }
      paymentMethods[sale.paymentMethod].total += Number(sale.totalAmount);
      paymentMethods[sale.paymentMethod].count++;
    });

    // Draw payment method boxes
    let pmY = paymentSplitY + 25;
    const pmBoxWidth = (doc.page.width - 100) / Object.keys(paymentMethods).length;
    let pmX = 40;

    Object.entries(paymentMethods).forEach(([method, data]: [string, any]) => {
      doc.rect(pmX, pmY, pmBoxWidth - 10, 50).fillAndStroke('#F8F9FA', '#E0E0E0');
      doc.fillColor('#666666').fontSize(9).font('Helvetica')
        .text(method, pmX + 5, pmY + 8, { width: pmBoxWidth - 20, align: 'center' });
      doc.fillColor('#28A745').fontSize(16).font('Helvetica-Bold')
        .text(`$${data.total.toFixed(2)}`, pmX + 5, pmY + 22, { width: pmBoxWidth - 20, align: 'center' });
      doc.fillColor('#999999').fontSize(8).font('Helvetica')
        .text(`${data.count} ${language === 'ar' ? 'معاملة' : 'transactions'}`, pmX + 5, pmY + 40, { width: pmBoxWidth - 20, align: 'center' });
      pmX += pmBoxWidth;
    });

    // Table Header
    let tableTop = pmY + 70;
    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold')
      .text(language === 'ar' ? 'تفاصيل المعاملات' : 'Transaction Details', 40, tableTop);

    tableTop += 30;

    // Draw table
    this.drawTableHeader(doc, tableTop, language);

    let currentY = tableTop + 25;
    let pageNumber = 1;

    // Add page number to first page
    this.drawPageFooter(doc, pageNumber, language);

    sales.forEach((sale: any, index: number) => {
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        pageNumber++;
        currentY = 50;
        this.drawTableHeader(doc, currentY, language);
        this.drawPageFooter(doc, pageNumber, language);
        currentY += 25;
      }

      this.drawTableRow(doc, currentY, sale, index + 1, language);
      currentY += 45;
    });

    doc.end();
  }

  private drawTableHeader(doc: any, y: number, language: string) {
    doc.rect(40, y, doc.page.width - 80, 25).fill('#F8F9FA');

    doc.fillColor('#333333').fontSize(9).font('Helvetica-Bold');
    doc.text(language === 'ar' ? '#' : '#', 45, y + 8, { width: 30 });
    doc.text(language === 'ar' ? 'رقم الفاتورة' : 'Sale ID', 80, y + 8, { width: 80 });
    doc.text(language === 'ar' ? 'التاريخ' : 'Date', 165, y + 8, { width: 70 });
    doc.text(language === 'ar' ? 'العميل' : 'Customer', 240, y + 8, { width: 100 });
    doc.text(language === 'ar' ? 'المبلغ' : 'Total', 345, y + 8, { width: 70, align: 'right' });
    doc.text(language === 'ar' ? 'الدفع' : 'Payment', 420, y + 8, { width: 110 });
  }

  private drawTableRow(doc: any, y: number, sale: any, index: number, language: string) {
    // Draw row background (alternating)
    if (index % 2 === 0) {
      doc.rect(40, y, doc.page.width - 80, 45).fill('#FAFAFA');
    }

    doc.fillColor('#333333').fontSize(9).font('Helvetica');

    // Index
    doc.text(index.toString(), 45, y + 5, { width: 30 });

    // Sale ID
    doc.fillColor('#666666').fontSize(8).font('Helvetica')
      .text(sale.id.slice(0, 8) + '...', 80, y + 5, { width: 80 });

    // Date
    doc.fillColor('#333333').fontSize(8)
      .text(new Date(sale.createdAt).toLocaleDateString(), 165, y + 5, { width: 70 });

    // Customer
    const customerName = sale.customer
      ? `${sale.customer.firstName} ${sale.customer.lastName}`
      : (language === 'ar' ? 'زائر' : 'Walk-in');
    doc.text(customerName, 240, y + 5, { width: 100 });

    // Total Amount (highlighted)
    doc.fillColor('#28A745').fontSize(10).font('Helvetica-Bold')
      .text(`$${Number(sale.totalAmount).toFixed(2)}`, 345, y + 5, { width: 70, align: 'right' });

    // Payment Method (badge style)
    doc.fillColor('#666666').fontSize(8).font('Helvetica')
      .text(sale.paymentMethod, 420, y + 5, { width: 110 });

    // Items summary
    if (sale.items && sale.items.length > 0) {
      doc.fillColor('#999999').fontSize(7).font('Helvetica')
        .text(
          `${sale.items.length} ${language === 'ar' ? 'منتجات' : 'items'}: ${sale.items.slice(0, 2).map((item: any) => item.product.name).join(', ')}${sale.items.length > 2 ? '...' : ''}`,
          80, y + 20, { width: 430 }
        );
    }

    // Cashier
    const cashierName = sale.cashier
      ? `${sale.cashier.firstName} ${sale.cashier.lastName}`
      : 'N/A';
    doc.fillColor('#999999').fontSize(7)
      .text(`${language === 'ar' ? 'الكاشير' : 'Cashier'}: ${cashierName}`, 80, y + 32, { width: 200 });
  }

  private drawPageFooter(doc: any, pageNumber: number, language: string) {
    doc.fontSize(8).fillColor('#999999').font('Helvetica')
      .text(
        `${language === 'ar' ? 'صفحة' : 'Page'} ${pageNumber}`,
        40, doc.page.height - 50, { width: doc.page.width - 80, align: 'center' }
      );
  }

  // Generate Sales Report Excel
  async generateSalesReportExcel(filters: any, res: Response, language: string = 'en') {
    try {
      const sales = await this.getSalesData(filters);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(language === 'ar' ? 'المبيعات' : 'Sales');

      // Headers
      worksheet.columns = [
        { header: language === 'ar' ? 'رقم الفاتورة' : 'Sale ID', key: 'id', width: 15 },
        { header: language === 'ar' ? 'التاريخ' : 'Date', key: 'date', width: 15 },
        { header: language === 'ar' ? 'اسم العميل' : 'Customer', key: 'customer', width: 20 },
        { header: language === 'ar' ? 'اسم الموظف' : 'Cashier', key: 'cashier', width: 20 },
        { header: language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount', key: 'total', width: 15 },
        { header: language === 'ar' ? 'الخصم' : 'Discount', key: 'discount', width: 12 },
        { header: language === 'ar' ? 'الضريبة' : 'Tax', key: 'tax', width: 12 },
        { header: language === 'ar' ? 'طريقة الدفع' : 'Payment Method', key: 'payment', width: 15 },
        { header: language === 'ar' ? 'الحالة' : 'Status', key: 'status', width: 12 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC3545' }
      };

      // Add data
      sales.forEach((sale: any) => {
        const customerName = sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : 'N/A';
        const cashierName = sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName}` : 'N/A';

        worksheet.addRow({
          id: sale.id.slice(0, 8),
          date: new Date(sale.createdAt).toLocaleDateString(),
          customer: customerName,
          cashier: cashierName,
          total: Number(sale.totalAmount),
          discount: Number(sale.discountAmount || 0),
          tax: Number(sale.taxAmount || 0),
          payment: sale.paymentMethod,
          status: sale.status
        });
      });

      // Summary row
      worksheet.addRow({});
      const summaryRow = worksheet.addRow({
        id: language === 'ar' ? 'المجموع' : 'TOTAL',
        total: sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0),
        discount: sales.reduce((sum: number, sale: any) => sum + Number(sale.discountAmount || 0), 0),
        tax: sales.reduce((sum: number, sale: any) => sum + Number(sale.taxAmount || 0), 0)
      });
      summaryRow.font = { bold: true };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      throw new Error(`Failed to generate Excel report: ${error.message}`);
    }
  }

  // Generate Inventory Report
  async generateInventoryReportExcel(res: Response, language: string = 'en') {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(language === 'ar' ? 'المخزون' : 'Inventory');

      worksheet.columns = [
        { header: language === 'ar' ? 'رمز المنتج' : 'SKU', key: 'sku', width: 15 },
        { header: language === 'ar' ? 'اسم المنتج' : 'Product Name', key: 'name', width: 30 },
        { header: language === 'ar' ? 'الفئة' : 'Category', key: 'category', width: 20 },
        { header: language === 'ar' ? 'الكمية المتاحة' : 'Stock', key: 'stock', width: 12 },
        { header: language === 'ar' ? 'السعر' : 'Price', key: 'price', width: 12 },
        { header: language === 'ar' ? 'القيمة الإجمالية' : 'Total Value', key: 'totalValue', width: 15 }
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC3545' }
      };

      products.forEach((product: any) => {
        worksheet.addRow({
          sku: product.sku,
          name: product.name,
          category: product.category?.name || 'N/A',
          stock: product.stock,
          price: Number(product.price),
          totalValue: product.stock * Number(product.price)
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      throw new Error(`Failed to generate inventory report: ${error.message}`);
    }
  }

  async generateInventoryReportPDF(res: Response, language: string = 'en') {
    const products = await prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' }
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');
    doc.pipe(res);

    doc.rect(40, 40, doc.page.width - 80, 60).fill('#DC3545');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
      .text(language === 'ar' ? 'تقرير المخزون' : 'Inventory Report', 40, 55, {
        width: doc.page.width - 80, align: 'center'
      });

    doc.fillColor('#000000').fontSize(12).font('Helvetica');
    let currentY = 120;

    const totalValue = products.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0);
    const lowStock = products.filter(p => p.stock <= p.lowStockAlert).length;

    doc.fontSize(14).font('Helvetica-Bold').text('Summary', 40, currentY);
    currentY += 25;
    doc.fontSize(11).font('Helvetica')
      .text(`Total Products: ${products.length}`, 40, currentY)
      .text(`Total Value: $${totalValue.toFixed(2)}`, 200, currentY)
      .text(`Low Stock: ${lowStock}`, 400, currentY);

    currentY += 40;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Product', 40, currentY).text('Category', 180, currentY).text('Stock', 280, currentY)
      .text('Price', 340, currentY).text('Value', 410, currentY).text('Status', 480, currentY);
    currentY += 20;

    doc.fontSize(9).font('Helvetica');
    products.forEach((p, i) => {
      if (currentY > doc.page.height - 100) { doc.addPage(); currentY = 40; }
      const status = p.stock === 0 ? 'Out' : p.stock <= p.lowStockAlert ? 'Low' : 'OK';
      if (i % 2 === 0) { doc.rect(40, currentY - 5, doc.page.width - 80, 15).fill('#f8f9fa'); doc.fillColor('#000000'); }
      doc.text(p.name.substring(0, 20), 40, currentY).text(p.category.name.substring(0, 15), 180, currentY)
        .text(p.stock.toString(), 280, currentY).text(`$${Number(p.price).toFixed(2)}`, 340, currentY)
        .text(`$${(p.stock * Number(p.price)).toFixed(2)}`, 410, currentY).text(status, 480, currentY);
      currentY += 20;
    });
    doc.end();
  }

  async generateCashierReportPDF(filters: any, res: Response, language: string = 'en') {
    const where: any = { status: 'COMPLETED' };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) { const end = new Date(filters.endDate); end.setHours(23, 59, 59, 999); where.createdAt.lte = end; }
    }

    const sales = await prisma.sale.findMany({ where, include: { cashier: true } });
    const cashierStats: any = {};
    sales.forEach(sale => {
      if (!cashierStats[sale.cashierId]) {
        cashierStats[sale.cashierId] = { name: `${sale.cashier.firstName} ${sale.cashier.lastName}`, email: sale.cashier.email, totalSales: 0, totalRevenue: 0 };
      }
      cashierStats[sale.cashierId].totalSales++;
      cashierStats[sale.cashierId].totalRevenue += Number(sale.totalAmount);
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=cashier-report.pdf');
    doc.pipe(res);

    doc.rect(40, 40, doc.page.width - 80, 60).fill('#DC3545');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
      .text(language === 'ar' ? 'تقرير أداء الموظفين' : 'Cashier Performance', 40, 55, { width: doc.page.width - 80, align: 'center' });

    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
    let currentY = 130;
    doc.text('Cashier', 40, currentY).text('Email', 180, currentY).text('Sales', 350, currentY)
      .text('Revenue', 420, currentY).text('Avg Order', 500, currentY);
    currentY += 20;

    doc.fontSize(9).font('Helvetica');
    Object.values(cashierStats).forEach((perf: any, i: number) => {
      if (currentY > doc.page.height - 100) { doc.addPage(); currentY = 40; }
      if (i % 2 === 0) { doc.rect(40, currentY - 5, doc.page.width - 80, 15).fill('#f8f9fa'); doc.fillColor('#000000'); }
      doc.text(perf.name.substring(0, 20), 40, currentY).text(perf.email.substring(0, 25), 180, currentY)
        .text(perf.totalSales.toString(), 350, currentY).text(`$${perf.totalRevenue.toFixed(2)}`, 420, currentY)
        .text(`$${(perf.totalRevenue / perf.totalSales).toFixed(2)}`, 500, currentY);
      currentY += 20;
    });
    doc.end();
  }

  async generateFinancialReportPDF(filters: any, res: Response, language: string = 'en') {
    const where: any = { status: 'COMPLETED' };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) { const end = new Date(filters.endDate); end.setHours(23, 59, 59, 999); where.createdAt.lte = end; }
    }

    const sales = await prisma.sale.findMany({ where, include: { items: { include: { product: { select: { cost: true } } } } } });
    let totalRevenue = 0, totalCost = 0, totalTax = 0, totalDiscount = 0;
    sales.forEach(sale => {
      totalRevenue += Number(sale.totalAmount);
      totalTax += Number(sale.taxAmount || 0);
      totalDiscount += Number(sale.discountAmount || 0);
      sale.items.forEach(item => { totalCost += item.quantity * Number(item.product.cost || 0); });
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalTax;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    doc.pipe(res);

    doc.rect(40, 40, doc.page.width - 80, 60).fill('#DC3545');
    doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
      .text(language === 'ar' ? 'التقرير المالي' : 'Financial Report', 40, 55, { width: doc.page.width - 80, align: 'center' });

    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('Financial Summary', 40, 130);
    let currentY = 160;
    const items = [
      { label: 'Total Revenue', value: totalRevenue, color: '#28a745' },
      { label: 'Cost of Goods', value: totalCost, color: '#dc3545' },
      { label: 'Gross Profit', value: grossProfit, color: '#007bff' },
      { label: 'Tax Collected', value: totalTax, color: '#ffc107' },
      { label: 'Net Profit', value: netProfit, color: '#6c5ce7' }
    ];

    doc.fontSize(11).font('Helvetica');
    items.forEach(item => {
      doc.fillColor('#666').text(item.label + ':', 80, currentY);
      doc.fillColor(item.color).font('Helvetica-Bold').text(`$${item.value.toFixed(2)}`, 350, currentY, { align: 'right' });
      doc.font('Helvetica'); currentY += 25;
    });

    currentY += 20;
    doc.fillColor('#666').text(`Profit Margin: ${profitMargin.toFixed(1)}%`, 80, currentY);
    currentY += 20;
    doc.text(`Total Transactions: ${sales.length}`, 80, currentY);
    doc.end();
  }

  async generateCashierReportExcel(filters: any, res: Response, _language: string = 'en') {
    const where: any = { status: 'COMPLETED' };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) { const end = new Date(filters.endDate); end.setHours(23, 59, 59, 999); where.createdAt.lte = end; }
    }

    const sales = await prisma.sale.findMany({ where, include: { cashier: true } });
    const cashierStats: any = {};
    sales.forEach(sale => {
      if (!cashierStats[sale.cashierId]) {
        cashierStats[sale.cashierId] = { name: `${sale.cashier.firstName} ${sale.cashier.lastName}`, email: sale.cashier.email, totalSales: 0, totalRevenue: 0 };
      }
      cashierStats[sale.cashierId].totalSales++;
      cashierStats[sale.cashierId].totalRevenue += Number(sale.totalAmount);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cashier Performance');
    worksheet.columns = [
      { header: 'Cashier', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Total Sales', key: 'totalSales', width: 15 },
      { header: 'Total Revenue', key: 'totalRevenue', width: 18 },
      { header: 'Average Order', key: 'avgOrder', width: 20 }
    ];

    Object.values(cashierStats).forEach((stat: any) => {
      worksheet.addRow({ name: stat.name, email: stat.email, totalSales: stat.totalSales, totalRevenue: stat.totalRevenue, avgOrder: stat.totalRevenue / stat.totalSales });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=cashier-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  async generateFinancialReportExcel(filters: any, res: Response, _language: string = 'en') {
    const where: any = { status: 'COMPLETED' };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) { const end = new Date(filters.endDate); end.setHours(23, 59, 59, 999); where.createdAt.lte = end; }
    }

    const sales = await prisma.sale.findMany({ where, include: { items: { include: { product: { select: { cost: true } } } } } });
    let totalRevenue = 0, totalCost = 0, totalTax = 0, totalDiscount = 0;
    sales.forEach(sale => {
      totalRevenue += Number(sale.totalAmount);
      totalTax += Number(sale.taxAmount || 0);
      totalDiscount += Number(sale.discountAmount || 0);
      sale.items.forEach(item => { totalCost += item.quantity * Number(item.product.cost || 0); });
    });

    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalTax;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Report');
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    worksheet.addRow({ metric: 'Total Revenue', value: totalRevenue });
    worksheet.addRow({ metric: 'Cost of Goods', value: totalCost });
    worksheet.addRow({ metric: 'Gross Profit', value: grossProfit });
    worksheet.addRow({ metric: 'Tax Collected', value: totalTax });
    worksheet.addRow({ metric: 'Net Profit', value: netProfit });
    worksheet.addRow({ metric: 'Total Discount', value: totalDiscount });
    worksheet.addRow({ metric: 'Profit Margin (%)', value: profitMargin });
    worksheet.addRow({ metric: 'Total Transactions', value: sales.length });
    worksheet.addRow({ metric: 'Average Transaction', value: totalRevenue / sales.length || 0 });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  // Helper: Get sales data with filters
  private async getSalesData(filters: any) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters.cashierId) where.cashierId = filters.cashierId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
    if (filters.status) where.status = filters.status;

    return await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        cashier: true,
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new ReportService();
