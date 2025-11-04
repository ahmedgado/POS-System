import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { prisma } from '../config/database';
import { Response } from 'express';

export class ReportService {
  // Generate Sales Report PDF
  async generateSalesReportPDF(filters: any, res: Response, language: string = 'en') {
    try {
      const sales = await this.getSalesData(filters);

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');

      doc.pipe(res);

      // Title
      doc.fontSize(20).text(language === 'ar' ? 'تقرير المبيعات' : 'Sales Report', { align: 'center' });
      doc.moveDown();

      // Period
      if (filters.startDate && filters.endDate) {
        doc.fontSize(12).text(
          `${language === 'ar' ? 'الفترة' : 'Period'}: ${filters.startDate} - ${filters.endDate}`,
          { align: 'center' }
        );
      }
      doc.moveDown(2);

      // Summary
      const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
      doc.fontSize(14).text(language === 'ar' ? 'ملخص' : 'Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`${language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}: ${sales.length}`);
      doc.text(`${language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}: $${totalRevenue.toFixed(2)}`);
      doc.moveDown(2);

      // Sales Table Header
      doc.fontSize(14).text(language === 'ar' ? 'تفاصيل المبيعات' : 'Sales Details', { underline: true });
      doc.moveDown(0.5);

      // Table
      sales.slice(0, 50).forEach((sale: any, index: number) => {
        if (index > 0 && index % 15 === 0) {
          doc.addPage();
        }

        doc.fontSize(10);
        doc.text(
          `${index + 1}. ${language === 'ar' ? 'رقم الفاتورة' : 'Sale ID'}: ${sale.id.slice(0, 8)}... | ` +
          `${language === 'ar' ? 'المبلغ' : 'Amount'}: $${Number(sale.totalAmount).toFixed(2)} | ` +
          `${language === 'ar' ? 'طريقة الدفع' : 'Payment'}: ${sale.paymentMethod} | ` +
          `${language === 'ar' ? 'التاريخ' : 'Date'}: ${new Date(sale.createdAt).toLocaleDateString()}`
        );
        doc.moveDown(0.3);
      });

      doc.end();
    } catch (error: any) {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
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
