export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF'
  | 'INR'
  | 'CNY'
  | 'SGD'
  | 'AED'
  | 'NZD'
  | 'SEK'
  | 'BRL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

export interface LineItem {
  id: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
}

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  website: string;
  taxId: string; // e.g. VAT / GST / EIN
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  poNumber?: string;
}

export interface PaymentDetails {
  method: 'bank' | 'card' | 'crypto' | 'upi' | 'custom';
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrSwift: string;
  paymentLink?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  upiId?: string;
  additionalNotes?: string;
}

export interface SignatureData {
  type: 'draw' | 'type' | 'upload' | 'none';
  dataUrl?: string;
  typedName?: string;
  signatoryTitle?: string;
  date?: string;
}

export interface InvoiceTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: 'jakarta' | 'outfit' | 'playfair' | 'cinzel' | 'garamond' | 'jetbrains' | 'syne' | 'space';
  showQrCode: boolean;
  showLogo: boolean;
  showTaxCol: boolean;
  showDiscountCol: boolean;
  showSkuCol: boolean;
  showNotes: boolean;
  showTerms: boolean;
  showSignature: boolean;
  showPaymentDetails: boolean;
}

export type DiscountType = 'percentage' | 'flat';

export interface InvoicePricing {
  taxRate: number; // Global tax percentage %
  taxName: string; // 'VAT' | 'Sales Tax' | 'GST' etc.
  discountType?: DiscountType; // 'percentage' or 'flat'
  discountValue?: number; // discount amount or rate
  globalDiscountPercent?: number; // backwards compatibility
  flatDiscount?: number;
  shipping: number;
  amountPaid: number;
  extraFee: number;
}

export interface Invoice {
  id: string;
  templateId: string;
  theme: InvoiceTheme;
  company: CompanyInfo;
  client: ClientInfo;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: CurrencyCode;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: LineItem[];
  pricing: InvoicePricing;
  payment: PaymentDetails;
  notes: string;
  terms: string;
  signature: SignatureData;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'Modern' | 'Corporate' | 'Creative' | 'Technical' | 'Luxury' | 'Specialty';
  description: string;
  tagline: string;
  badge?: string;
  accentHex: string;
  darkHex: string;
  fontPreview: string;
}
