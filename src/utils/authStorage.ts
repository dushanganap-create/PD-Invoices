import { UserProfile, LoginNotificationLog, ClientContact } from '../types/auth';
import { Invoice } from '../types/invoice';
import { DEFAULT_INVOICE } from '../data/presets';

const ADMIN_EMAIL = 'pdushangana@gmail.com';
const STORAGE_CURRENT_USER = 'invoicecraft_current_user';
const STORAGE_USERS = 'invoicecraft_registered_users';
const STORAGE_NOTIFICATIONS = 'invoicecraft_login_notifications_log';
const STORAGE_CLIENTS = 'invoicecraft_client_book';
const STORAGE_PREFIX_USER_INVOICES = 'invoicecraft_user_invoices_';

// Default Demo User
export const DEMO_USER: UserProfile = {
  id: 'usr_pasindu_admin',
  name: 'Pasindu Dushangana',
  email: 'pdushangana@gmail.com',
  companyName: 'Dushangana Creative Studios',
  role: 'Lead Designer & Administrator',
  createdAt: '2026-01-01T00:00:00.000Z',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

export const SECONDARY_DEMO_USER: UserProfile = {
  id: 'usr_alex_designer',
  name: 'Alex Rivera',
  email: 'alex.rivera@designagency.io',
  companyName: 'Rivera Brand Architecture',
  role: 'Creative Director',
  createdAt: '2026-02-14T00:00:00.000Z',
};

// Initial Client Directory
export const DEFAULT_CLIENTS: ClientContact[] = [
  {
    id: 'cli_1',
    name: 'Elena Rostova',
    company: 'Quantum Media Group',
    email: 'billing@quantummedia.io',
    phone: '+1 (555) 389-1029',
    address: '450 Lexington Ave, Suite 2100',
    city: 'New York',
    state: 'NY',
    postalCode: '10017',
    country: 'United States',
    vatNumber: 'US-938210492',
    notes: 'Net-15 payment terms. Preferred ACH / Wire transfer.',
  },
  {
    id: 'cli_2',
    name: 'Marcus Vance',
    company: 'Vance Hyperdynamics',
    email: 'finance@vancehd.tech',
    phone: '+44 20 7946 0912',
    address: '88 Canary Wharf Way, Level 14',
    city: 'London',
    state: 'Greater London',
    postalCode: 'E14 5AB',
    country: 'United Kingdom',
    vatNumber: 'GB-847291034',
    notes: 'Creative retainer client. Issues PO numbers.',
  },
  {
    id: 'cli_3',
    name: 'Kenji Takahashi',
    company: 'Shinra Interactive Labs',
    email: 'accounts@shinra-labs.jp',
    phone: '+81 3 5555 0143',
    address: '6-10-1 Roppongi, Minato City',
    city: 'Tokyo',
    state: 'Tokyo',
    postalCode: '106-6108',
    country: 'Japan',
    vatNumber: 'JP-2948102948',
    notes: 'Software and UX consulting deliverables.',
  },
];

// Read logged-in user
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse current user from storage:', e);
  }
  return DEMO_USER; // Default to demo user for instantaneous interactive experience
}

// Set logged-in user and notify pdushangana@gmail.com
export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
  } catch (e) {
    console.warn('Failed to persist current user:', e);
  }
}

// Log authentication activity and dispatch notification to pdushangana@gmail.com
export function recordLoginEvent(
  event: 'LOGIN' | 'REGISTER' | 'GUEST_ACCESS' | 'INVOICE_SAVED',
  userEmail: string,
  userName: string,
  invoicesCount: number = 0,
  details: string = ''
): LoginNotificationLog {
  const deviceInfo = typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 75)}...` : 'Web Browser Client';
  
  const logItem: LoginNotificationLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event,
    userEmail,
    userName,
    destinationEmail: ADMIN_EMAIL,
    invoicesCount,
    deviceInfo,
    summary: `${event} event for ${userName} (${userEmail}) recorded and dispatched to ${ADMIN_EMAIL}. ${details}`,
  };

  try {
    const existingRaw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    const existing: LoginNotificationLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [logItem, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save notification log:', e);
  }

  return logItem;
}

// Get all notification activity logs directed to pdushangana@gmail.com
export function getLoginNotificationLogs(): LoginNotificationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse notification logs:', e);
  }
  // Return initial mock notification log
  return [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      event: 'LOGIN',
      userEmail: 'pdushangana@gmail.com',
      userName: 'Pasindu Dushangana',
      destinationEmail: ADMIN_EMAIL,
      invoicesCount: 1,
      deviceInfo: 'AI Studio Web Environment',
      summary: `Active session authenticated. All login alerts and invoice records dispatched to ${ADMIN_EMAIL}.`,
    },
  ];
}

// Generate direct email mailto link for sending logs to pdushangana@gmail.com
export function generateAdminEmailLink(log?: LoginNotificationLog): string {
  const subject = encodeURIComponent(`[InvoiceCraft Alert] Login Notification - User Activity Log`);
  const bodyText = log
    ? `Hello Pasindu,\n\nHere is a login notification recorded on InvoiceCraft Studio:\n\n- Event: ${log.event}\n- User Name: ${log.userName}\n- User Email: ${log.userEmail}\n- Timestamp: ${log.timestamp}\n- Total Saved Invoices: ${log.invoicesCount}\n- Destination: ${ADMIN_EMAIL}\n- Device: ${log.deviceInfo}\n\nInvoiceCraft Studio - Made By Pasindu Dushangana`
    : `Hello Pasindu,\n\nThis is an automated security and login audit report from InvoiceCraft Studio.\nAll user login details and invoice records are registered for ${ADMIN_EMAIL}.\n\nMade By Pasindu Dushangana`;

  return `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
}

// --- USER INVOICE HISTORY STORAGE ---

export function getUserInvoices(userId: string): Invoice[] {
  try {
    const key = `${STORAGE_PREFIX_USER_INVOICES}${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to get user invoices:', e);
  }
  return [DEFAULT_INVOICE];
}

export function saveUserInvoice(userId: string, invoice: Invoice): Invoice[] {
  try {
    const key = `${STORAGE_PREFIX_USER_INVOICES}${userId}`;
    const existing = getUserInvoices(userId);
    const index = existing.findIndex((inv) => inv.id === invoice.id);
    let updated: Invoice[];
    if (index >= 0) {
      updated = existing.map((inv) => (inv.id === invoice.id ? invoice : inv));
    } else {
      updated = [invoice, ...existing];
    }
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save user invoice:', e);
    return [invoice];
  }
}

export function deleteUserInvoice(userId: string, invoiceId: string): Invoice[] {
  try {
    const key = `${STORAGE_PREFIX_USER_INVOICES}${userId}`;
    const existing = getUserInvoices(userId);
    const updated = existing.filter((inv) => inv.id !== invoiceId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to delete user invoice:', e);
    return [];
  }
}

// --- CLIENT BOOK STORAGE ---

export function getClientDirectory(): ClientContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse clients:', e);
  }
  return DEFAULT_CLIENTS;
}

export function saveClientContact(client: ClientContact): ClientContact[] {
  try {
    const clients = getClientDirectory();
    const index = clients.findIndex((c) => c.id === client.id);
    let updated: ClientContact[];
    if (index >= 0) {
      updated = clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updated = [client, ...clients];
    }
    localStorage.setItem(STORAGE_CLIENTS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save client:', e);
    return DEFAULT_CLIENTS;
  }
}

export function deleteClientContact(clientId: string): ClientContact[] {
  try {
    const clients = getClientDirectory();
    const updated = clients.filter((c) => c.id !== clientId);
    localStorage.setItem(STORAGE_CLIENTS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to delete client:', e);
    return DEFAULT_CLIENTS;
  }
}
