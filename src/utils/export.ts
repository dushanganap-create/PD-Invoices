import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice } from '../types/invoice';
import { calculateInvoice } from './calculations';
import { formatCurrency } from './currency';

export async function exportToPdf(elementId: string, invoiceNumber: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Invoice element not found for PDF export');
    return false;
  }

  try {
    // Store original transform to restore after capturing
    const originalTransform = element.style.transform;
    element.style.transform = 'none';

    // Wait brief frame for layout settling
    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    element.style.transform = originalTransform;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const safeNumber = (invoiceNumber || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
    pdf.save(`${safeNumber}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    // Fallback to print dialog
    window.print();
    return false;
  }
}

export async function exportToPng(elementId: string, invoiceNumber: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const originalTransform = element.style.transform;
    element.style.transform = 'none';
    await new Promise((resolve) => setTimeout(resolve, 50));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    element.style.transform = originalTransform;

    const link = document.createElement('a');
    const safeNumber = (invoiceNumber || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
    link.download = `${safeNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    return false;
  }
}

export function exportToJson(invoice: Invoice) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoice, null, 2));
  const downloadAnchor = document.createElement('a');
  const safeNumber = (invoice.invoiceNumber || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${safeNumber}-data.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCsv(invoice: Invoice) {
  const calc = calculateInvoice(invoice);
  const rows: string[][] = [];

  rows.push(['Invoice Number', invoice.invoiceNumber]);
  rows.push(['Issue Date', invoice.issueDate]);
  rows.push(['Due Date', invoice.dueDate]);
  rows.push(['Company', invoice.company.name]);
  rows.push(['Client', invoice.client.name, invoice.client.company]);
  rows.push([]);
  rows.push(['Item #', 'Description', 'SKU', 'Quantity', 'Unit Price', 'Discount %', 'Tax %', 'Line Total']);

  invoice.items.forEach((item, index) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
    rows.push([
      (index + 1).toString(),
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.sku || '',
      item.quantity.toString(),
      item.unitPrice.toFixed(2),
      (item.discountPercent || 0).toString(),
      (item.taxPercent || 0).toString(),
      lineTotal.toFixed(2),
    ]);
  });

  rows.push([]);
  rows.push(['Subtotal', '', '', '', '', '', '', calc.subtotal.toFixed(2)]);
  if (calc.globalDiscountAmount > 0) {
    rows.push(['Global Discount', '', '', '', '', '', '', `-${calc.globalDiscountAmount.toFixed(2)}`]);
  }
  rows.push([invoice.pricing.taxName || 'Tax', '', '', '', '', '', '', calc.taxAmount.toFixed(2)]);
  if (calc.shipping > 0) {
    rows.push(['Shipping', '', '', '', '', '', '', calc.shipping.toFixed(2)]);
  }
  rows.push(['Grand Total', '', '', '', '', '', '', `${invoice.currency} ${calc.total.toFixed(2)}`]);
  rows.push(['Amount Paid', '', '', '', '', '', '', calc.amountPaid.toFixed(2)]);
  rows.push(['Balance Due', '', '', '', '', '', '', `${invoice.currency} ${calc.balanceDue.toFixed(2)}`]);

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  const safeNumber = (invoice.invoiceNumber || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${safeNumber}-items.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function printInvoice() {
  window.print();
}
