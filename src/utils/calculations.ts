import { Invoice, LineItem } from '../types/invoice';

export interface InvoiceCalculations {
  subtotal: number;
  totalItemDiscount: number;
  globalDiscountAmount: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  globalTaxRate: number;
  shipping: number;
  extraFee: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
}

export function getItemLineTotal(item: LineItem): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discountPct = Number(item.discountPercent) || 0;
  const base = qty * price;
  return base * (1 - discountPct / 100);
}

export function calculateInvoice(invoice: Invoice): InvoiceCalculations {
  const items = invoice.items || [];
  let subtotal = 0;
  let totalItemDiscount = 0;
  let itemTaxTotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const itemDiscount = Number(item.discountPercent) || 0;
    const itemTax = Number(item.taxPercent) || 0;

    const baseAmount = qty * price;
    const discountVal = baseAmount * (itemDiscount / 100);
    const lineTotalAfterItemDiscount = baseAmount - discountVal;

    subtotal += baseAmount;
    totalItemDiscount += discountVal;

    if (itemTax > 0) {
      itemTaxTotal += lineTotalAfterItemDiscount * (itemTax / 100);
    }
  }

  const baseAfterItemDiscounts = Math.max(0, subtotal - totalItemDiscount);
  
  // Support both percentage-based and flat-rate discounts
  const discountType = invoice.pricing?.discountType || 'percentage';
  const discountRawValue = Number(
    invoice.pricing?.discountValue ?? invoice.pricing?.globalDiscountPercent ?? invoice.pricing?.flatDiscount ?? 0
  );

  let globalDiscountAmount = 0;
  if (discountType === 'flat') {
    globalDiscountAmount = Math.min(baseAfterItemDiscounts, Math.max(0, discountRawValue));
  } else {
    // percentage
    const validPct = Math.min(100, Math.max(0, discountRawValue));
    globalDiscountAmount = baseAfterItemDiscounts * (validPct / 100);
  }

  const subtotalAfterDiscount = Math.max(0, baseAfterItemDiscounts - globalDiscountAmount);

  const globalTaxRate = Math.max(0, Number(invoice.pricing?.taxRate) || 0);
  const globalTaxAmount = subtotalAfterDiscount * (globalTaxRate / 100);
  const totalTax = globalTaxAmount + itemTaxTotal;

  const shipping = Number(invoice.pricing?.shipping) || 0;
  const extraFee = Number(invoice.pricing?.extraFee) || 0;
  const amountPaid = Number(invoice.pricing?.amountPaid) || 0;

  const total = Math.max(0, subtotalAfterDiscount + totalTax + shipping + extraFee);
  const balanceDue = Math.max(0, total - amountPaid);

  return {
    subtotal,
    totalItemDiscount,
    globalDiscountAmount,
    discountType,
    discountValue: discountRawValue,
    subtotalAfterDiscount,
    taxAmount: totalTax,
    globalTaxRate,
    shipping,
    extraFee,
    total,
    amountPaid,
    balanceDue,
  };
}
