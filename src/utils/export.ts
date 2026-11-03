import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice } from '../types/invoice';
import { calculateInvoice } from './calculations';

/**
 * Bulletproof export to PDF using html2canvas & jsPDF.
 * Captures ONLY the isolated invoice element (#invoice-render-sheet).
 * NEVER falls back to window.print() so dev tools/terminals are never shown.
 */
export async function exportToPdf(elementId: string = 'invoice-render-sheet', invoiceNumber: string = 'INV-001'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Invoice sheet element not found for PDF export:', elementId);
    return false;
  }

  try {
    // Save original styles to restore after export
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    const originalMarginBottom = element.style.marginBottom;

    // Temporarily reset zoom/scale transform so html2canvas captures at pristine 1:1 scale
    element.style.transform = 'none';
    element.style.transition = 'none';
    element.style.marginBottom = '0px';

    // Allow browser layout engine to paint unscaled geometry
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture ONLY the invoice element (strictly ignoring outer DOM, dev UI, docks)
    const canvas = await html2canvas(element, {
      scale: 2, // High-DPI retina sharpness
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 850,
      windowWidth: 850,
      ignoreElements: (el) => {
        // Exclude any floating toolbars or elements marked no-print
        return el.classList.contains('no-print') || el.classList.contains('glass-dock');
      },
    });

    // Restore original zoom and transform immediately
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
    element.style.marginBottom = originalMarginBottom;

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering produced zero-dimension image');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Additional pages if invoice content extends beyond 1 A4 page
    while (heightLeft > 5) {
      position = -(pdfHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
    }

    const safeNumber = (invoiceNumber || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
    pdf.save(`${safeNumber}.pdf`);
    return true;
  } catch (err) {
    console.warn('html2canvas PDF export encountered issue, falling back to clean iframe print:', err);
    try {
      printInvoice(elementId);
      return true;
    } catch (e) {
      console.error('Print fallback failed:', e);
      return false;
    }
  }
}

/**
 * Isolated printing function.
 * Creates an isolated hidden iframe containing ONLY the invoice HTML & styles.
 * Guarantees that dev terminal, editor panel, nav bar, and browser UI NEVER appear in print.
 */
export function printInvoice(elementId?: string | unknown): void {
  const targetId = typeof elementId === 'string' ? elementId : 'invoice-render-sheet';
  const element = document.getElementById(targetId);
  if (!element) {
    console.error('Invoice sheet not found for print:', targetId);
    return;
  }

  // Remove any pre-existing print iframe
  const existingFrame = document.getElementById('pd-invoice-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'pd-invoice-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error('Unable to access print iframe document');
    return;
  }

  // Copy all external stylesheets & fonts from head
  let headHtml = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    headHtml += node.outerHTML;
  });

  // Deep clone of invoice element to clean up transforms
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.margin = '0 auto';
  clone.style.width = '100%';
  clone.style.maxWidth = '850px';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  // Remove any .no-print elements inside the clone
  clone.querySelectorAll('.no-print, .glass-dock').forEach((el) => el.remove());

  doc.open();
  doc.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Print Invoice</title>
        ${headHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 12mm 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
          .invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait for images and fonts in the iframe to finish loading before invoking print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print error, falling back:', e);
    } finally {
      // Clean up iframe after print dialog closes
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }
  }, 300);
}

export async function exportToPng(elementId: string, invoiceNumber: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const originalTransform = element.style.transform;
    element.style.transform = 'none';
    await new Promise((resolve) => setTimeout(resolve, 80));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 850,
      windowWidth: 850,
      ignoreElements: (el) => el.classList.contains('no-print') || el.classList.contains('glass-dock'),
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
