export interface ProBusinessProfile {
  legalName?: string;
  tradingName?: string;
  logoUrl?: string;
  taxId?: string;
  industry?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Banking & Wire details
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftBic?: string;
  routingNumber?: string;
  paymentLink?: string;
  cryptoAddress?: string;
  paymentInstructions?: string;

  // Digital Seal & Signature
  signatoryName?: string;
  signatoryTitle?: string;
  signatureDataUrl?: string;
  signatureType?: 'draw' | 'type' | 'upload' | 'none';
  sealText?: string;
  showSeal?: boolean;
  showSignature?: boolean;

  // Invoice Preferences & Defaults
  defaultCurrency?: string;
  defaultTaxPercent?: number;
  defaultTaxLabel?: string;
  defaultPaymentTerms?: string;
  defaultNotes?: string;
  invoicePrefix?: string;
  customWatermark?: string;
  brandColor?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  role: 'admin' | 'pro' | 'user';
  isPro: boolean;
  dailyInvoicesCount: number;
  lastInvoiceDate: string;
  createdAt: string;
  customWatermark?: string;
  proProfile?: ProBusinessProfile;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  role: 'admin' | 'pro' | 'user';
  isPro: boolean;
  totalInvoicesCount: number;
  invoicesToday: number;
  lastInvoiceDate: string;
  joinedDate: string;
  lastLoginTime: string;
  avatarUrl?: string;
  proProfile?: ProBusinessProfile;
}

export interface LoginNotificationLog {
  id: string;
  timestamp: string;
  event: 'LOGIN' | 'REGISTER' | 'GUEST_ACCESS' | 'INVOICE_SAVED' | 'PRO_GRANTED' | 'PRO_REVOKED';
  userEmail: string;
  userName: string;
  destinationEmail: 'pdushangana@gmail.com';
  invoicesCount: number;
  deviceInfo: string;
  summary: string;
}

export interface ClientContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  vatNumber?: string;
  notes?: string;
}

export interface DailyUsageQuota {
  usedToday: number;
  maxPerDay: number;
  remainingToday: number;
  isPro: boolean;
  canCreateNew: boolean;
  date: string;
}
