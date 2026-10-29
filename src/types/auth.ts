export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  role?: string;
  createdAt: string;
}

export interface LoginNotificationLog {
  id: string;
  timestamp: string;
  event: 'LOGIN' | 'REGISTER' | 'GUEST_ACCESS' | 'INVOICE_SAVED';
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
