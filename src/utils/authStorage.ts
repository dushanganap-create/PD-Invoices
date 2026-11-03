import { UserProfile, UserRecord, LoginNotificationLog, ClientContact, DailyUsageQuota } from '../types/auth';
import { Invoice } from '../types/invoice';
import { DEFAULT_INVOICE } from '../data/presets';
import { db } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export const ADMIN_EMAIL = 'pdushangana@gmail.com';
export const FREE_DAILY_INVOICE_LIMIT = 5;

const STORAGE_CURRENT_USER = 'invoicecraft_current_user';
const STORAGE_USERS = 'invoicecraft_registered_users_v2';
const STORAGE_NOTIFICATIONS = 'invoicecraft_login_notifications_log_v2';
const STORAGE_CLIENTS = 'invoicecraft_client_book';
const STORAGE_PREFIX_USER_INVOICES = 'invoicecraft_user_invoices_';
const STORAGE_DAILY_USAGE_PREFIX = 'invoicecraft_daily_usage_';

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Default Super Admin User (Pasindu Dushangana)
export const DEMO_ADMIN: UserProfile = {
  id: 'usr_pasindu_admin',
  name: 'Pasindu Dushangana',
  email: ADMIN_EMAIL,
  companyName: 'Dushangana Creative Studios',
  role: 'admin',
  isPro: true,
  dailyInvoicesCount: 0,
  lastInvoiceDate: getTodayDateString(),
  createdAt: '2026-01-01T00:00:00.000Z',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

// Initial Registered users: only the real Super Admin
const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr_pasindu_admin',
    email: ADMIN_EMAIL,
    name: 'Pasindu Dushangana',
    companyName: 'Dushangana Creative Studios',
    role: 'admin',
    isPro: true,
    totalInvoicesCount: 0,
    invoicesToday: 0,
    lastInvoiceDate: getTodayDateString(),
    joinedDate: '2026-01-01',
    lastLoginTime: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
];

// Initial Client Directory: Start with zero sample data (clean client book)
export const DEFAULT_CLIENTS: ClientContact[] = [];

// Determine if an email belongs to Super Admin
export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Known sample demo IDs to purge from previous sessions
const DUMMY_IDS = new Set([
  'usr_alex_designer',
  'usr_elena_quantum',
  'usr_marcus_vance',
  'usr_sarah_chen',
  'usr_kenji_t',
  'usr_david_miller',
]);

// --- REGISTERED USERS MANAGEMENT ---

export function getAllUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any mock/sample users from older builds
        const realUsers = parsed.filter(
          (u) => !DUMMY_IDS.has(u.id) && !u.email.includes('@designagency.io') && !u.email.includes('@quantummedia.io')
        );
        // Ensure admin is always present
        const hasAdmin = realUsers.some((u) => isSuperAdminEmail(u.email));
        if (!hasAdmin) {
          realUsers.unshift(INITIAL_USERS[0]);
        }
        localStorage.setItem(STORAGE_USERS, JSON.stringify(realUsers));
        return realUsers;
      }
    }
  } catch (e) {
    console.warn('Failed to parse all users:', e);
  }
  // Initialize with only admin
  try {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(INITIAL_USERS));
  } catch (e) {}
  return INITIAL_USERS;
}

export function saveUsers(users: UserRecord[]): void {
  try {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('invoicecraft_users_changed', { detail: users }));
  } catch (e) {
    console.warn('Failed to save users:', e);
  }
}

// Register or update user record in directory
export function upsertUserRecord(profile: Partial<UserProfile> & { email: string; name?: string }): UserRecord {
  const users = getAllUsers();
  const emailNorm = profile.email.trim().toLowerCase();
  const isAdmin = emailNorm === ADMIN_EMAIL.toLowerCase();
  const today = getTodayDateString();

  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === emailNorm);

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    // Check if daily counter needs rollover
    const sameDay = existing.lastInvoiceDate === today;
    const updated: UserRecord = {
      ...existing,
      name: profile.name || existing.name,
      companyName: profile.companyName || existing.companyName,
      lastLoginTime: new Date().toISOString(),
      role: isAdmin ? 'admin' : existing.isPro ? 'pro' : 'user',
      isPro: isAdmin ? true : existing.isPro,
      invoicesToday: sameDay ? existing.invoicesToday : 0,
      lastInvoiceDate: today,
    };
    users[existingIndex] = updated;
    saveUsers(users);
    try {
      setDoc(doc(db, 'users', updated.email), updated, { merge: true }).catch(() => {});
    } catch (e) {}
    return updated;
  } else {
    const newRecord: UserRecord = {
      id: profile.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: emailNorm,
      name: profile.name || emailNorm.split('@')[0],
      companyName: profile.companyName || 'Freelance & Business',
      role: isAdmin ? 'admin' : profile.isPro ? 'pro' : 'user',
      isPro: isAdmin ? true : Boolean(profile.isPro),
      totalInvoicesCount: 0,
      invoicesToday: 0,
      lastInvoiceDate: today,
      joinedDate: today,
      lastLoginTime: new Date().toISOString(),
      avatarUrl: profile.avatarUrl,
    };
    users.unshift(newRecord);
    saveUsers(users);
    try {
      setDoc(doc(db, 'users', newRecord.email), newRecord, { merge: true }).catch(() => {});
    } catch (e) {}
    return newRecord;
  }
}

// Toggle Pro status for an email (used directly by the admin tick button)
export function toggleUserPro(emailOrId: string, grantPro: boolean): UserRecord | null {
  const users = getAllUsers();
  const emailNorm = emailOrId.trim().toLowerCase();
  const target = users.find(
    (u) => u.email.toLowerCase() === emailNorm || u.id === emailOrId
  );

  const finalEmail = (target ? target.email : emailNorm).trim().toLowerCase();

  // Cannot downgrade super admin
  if (isSuperAdminEmail(finalEmail)) {
    return target || null;
  }

  const today = getTodayDateString();
  const updated: UserRecord = target
    ? {
        ...target,
        email: finalEmail,
        isPro: grantPro,
        role: grantPro ? 'pro' : 'user',
      }
    : {
        id: emailOrId.startsWith('usr_') ? emailOrId : `usr_${Date.now()}`,
        email: finalEmail,
        name: finalEmail.split('@')[0],
        companyName: 'Freelance & Business',
        role: grantPro ? 'pro' : 'user',
        isPro: grantPro,
        totalInvoicesCount: 0,
        invoicesToday: 0,
        lastInvoiceDate: today,
        joinedDate: today,
        lastLoginTime: new Date().toISOString(),
      };

  const newUsers = target
    ? users.map((u) => (u.id === target.id || u.email.toLowerCase() === finalEmail ? updated : u))
    : [updated, ...users];

  saveUsers(newUsers);

  try {
    setDoc(doc(db, 'users', finalEmail), updated, { merge: true }).catch((err) => {
      console.warn('Firestore toggleUserPro error:', err);
    });
  } catch (e) {}

  // If the currently active logged-in user is this user, update current user too
  const current = getCurrentUser();
  if (current && current.email.toLowerCase() === finalEmail) {
    const updatedCurrent: UserProfile = {
      ...current,
      isPro: grantPro,
      role: grantPro ? 'pro' : 'user',
    };
    setCurrentUser(updatedCurrent);
  }

  // Record audit log for pdushangana@gmail.com
  recordLoginEvent(
    grantPro ? 'PRO_GRANTED' : 'PRO_REVOKED',
    finalEmail,
    updated.name,
    updated.totalInvoicesCount,
    `Admin Pasindu Dushangana ${grantPro ? 'granted' : 'revoked'} Pro features for user ${finalEmail}.`
  );

  return updated;
}

// Pre-grant Pro to any email
export function preGrantProEmail(email: string, name?: string): UserRecord {
  const users = getAllUsers();
  const emailNorm = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === emailNorm);

  if (existing) {
    return toggleUserPro(existing.email, true) || existing;
  }

  const today = getTodayDateString();
  const newRecord: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: emailNorm,
    name: name || emailNorm.split('@')[0],
    role: 'pro',
    isPro: true,
    totalInvoicesCount: 0,
    invoicesToday: 0,
    lastInvoiceDate: today,
    joinedDate: today,
    lastLoginTime: new Date().toISOString(),
  };

  users.unshift(newRecord);
  saveUsers(users);

  try {
    setDoc(doc(db, 'users', emailNorm), newRecord, { merge: true }).catch((err) => {
      console.warn('Firestore preGrantProEmail error:', err);
    });
  } catch (e) {}

  recordLoginEvent(
    'PRO_GRANTED',
    emailNorm,
    newRecord.name,
    0,
    `Admin Pasindu Dushangana pre-approved Pro features for ${emailNorm}.`
  );

  return newRecord;
}

// --- CURRENT USER SESSION ---

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      // Ensure admin retains isPro and admin role
      if (isSuperAdminEmail(parsed.email)) {
        parsed.role = 'admin';
        parsed.isPro = true;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse current user from storage:', e);
  }
  // Default to Pasindu Dushangana as admin
  return DEMO_ADMIN;
}

export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      if (isSuperAdminEmail(user.email)) {
        user.role = 'admin';
        user.isPro = true;
      }
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
      upsertUserRecord(user);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER);
    }
    window.dispatchEvent(new CustomEvent('invoicecraft_current_user_changed', { detail: user }));
  } catch (e) {
    console.warn('Failed to persist current user:', e);
  }
}

// --- DAILY USAGE & QUOTA MANAGEMENT (5 PER DAY FOR FREE USERS) ---

export function getDailyQuota(user: UserProfile | null): DailyUsageQuota {
  const today = getTodayDateString();

  if (!user) {
    // Guest user treated like a free user
    const guestKey = `${STORAGE_DAILY_USAGE_PREFIX}guest_${today}`;
    const used = parseInt(localStorage.getItem(guestKey) || '0', 10);
    return {
      usedToday: used,
      maxPerDay: FREE_DAILY_INVOICE_LIMIT,
      remainingToday: Math.max(0, FREE_DAILY_INVOICE_LIMIT - used),
      isPro: false,
      canCreateNew: used < FREE_DAILY_INVOICE_LIMIT,
      date: today,
    };
  }

  // Super Admin or Pro User: UNLIMITED
  const isSuper = isSuperAdminEmail(user.email);
  if (isSuper || user.isPro || user.role === 'admin' || user.role === 'pro') {
    return {
      usedToday: user.dailyInvoicesCount || 0,
      maxPerDay: Infinity,
      remainingToday: Infinity,
      isPro: true,
      canCreateNew: true,
      date: today,
    };
  }

  // Normal Free User: 5 invoices per day
  const key = `${STORAGE_DAILY_USAGE_PREFIX}${user.id}_${today}`;
  let used = 0;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      used = parseInt(raw, 10);
    } else {
      // Check user record
      const users = getAllUsers();
      const rec = users.find((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (rec && rec.lastInvoiceDate === today) {
        used = rec.invoicesToday;
      }
    }
  } catch (e) {
    used = 0;
  }

  return {
    usedToday: used,
    maxPerDay: FREE_DAILY_INVOICE_LIMIT,
    remainingToday: Math.max(0, FREE_DAILY_INVOICE_LIMIT - used),
    isPro: false,
    canCreateNew: used < FREE_DAILY_INVOICE_LIMIT,
    date: today,
  };
}

// Record when an invoice is created or duplicated
export function recordInvoiceCreated(user: UserProfile | null): { allowed: boolean; quota: DailyUsageQuota } {
  const quota = getDailyQuota(user);

  if (!quota.canCreateNew && !quota.isPro) {
    return { allowed: false, quota };
  }

  const today = getTodayDateString();
  const nextUsed = quota.usedToday + 1;

  if (user) {
    const key = `${STORAGE_DAILY_USAGE_PREFIX}${user.id}_${today}`;
    try {
      localStorage.setItem(key, nextUsed.toString());
    } catch (e) {}

    // Update in users registry
    const users = getAllUsers();
    const updatedUsers = users.map((u) => {
      if (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) {
        return {
          ...u,
          invoicesToday: nextUsed,
          totalInvoicesCount: (u.totalInvoicesCount || 0) + 1,
          lastInvoiceDate: today,
        };
      }
      return u;
    });
    saveUsers(updatedUsers);

    // Update current user state
    const updatedCurrent: UserProfile = {
      ...user,
      dailyInvoicesCount: nextUsed,
      lastInvoiceDate: today,
    };
    try {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedCurrent));
    } catch (e) {}
  } else {
    const guestKey = `${STORAGE_DAILY_USAGE_PREFIX}guest_${today}`;
    try {
      localStorage.setItem(guestKey, nextUsed.toString());
    } catch (e) {}
  }

  const updatedQuota: DailyUsageQuota = {
    ...quota,
    usedToday: nextUsed,
    remainingToday: quota.isPro ? Infinity : Math.max(0, FREE_DAILY_INVOICE_LIMIT - nextUsed),
    canCreateNew: quota.isPro || nextUsed < FREE_DAILY_INVOICE_LIMIT,
  };

  window.dispatchEvent(new CustomEvent('invoicecraft_quota_updated', { detail: updatedQuota }));

  return { allowed: true, quota: updatedQuota };
}

// Reset daily limit (Admin utility)
export function resetDailyLimits(): void {
  const today = getTodayDateString();
  const users = getAllUsers();
  const updated = users.map((u) => ({
    ...u,
    invoicesToday: 0,
    lastInvoiceDate: today,
  }));
  saveUsers(updated);
}

// --- LOGGING & ALERTS FOR pdushangana@gmail.com ---

export function recordLoginEvent(
  event: 'LOGIN' | 'REGISTER' | 'GUEST_ACCESS' | 'INVOICE_SAVED' | 'PRO_GRANTED' | 'PRO_REVOKED',
  userEmail: string,
  userName: string,
  invoicesCount: number = 0,
  details: string = ''
): LoginNotificationLog {
  const deviceInfo = typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 60)}...` : 'AI Studio Client';

  const logItem: LoginNotificationLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event,
    userEmail,
    userName,
    destinationEmail: ADMIN_EMAIL,
    invoicesCount,
    deviceInfo,
    summary: `${event} recorded for ${userName} (${userEmail}) -> sent to ${ADMIN_EMAIL}. ${details}`,
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

export function getLoginNotificationLogs(): LoginNotificationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse notification logs:', e);
  }
  return [];
}

export function generateAdminEmailLink(log?: LoginNotificationLog): string {
  const subject = encodeURIComponent(`[InvoiceCraft Master] User Activity & Pro Status Report`);
  const bodyText = log
    ? `Hello Pasindu,\n\nHere is a security and access log on InvoiceCraft Studio:\n\n- Event: ${log.event}\n- User Name: ${log.userName}\n- User Email: ${log.userEmail}\n- Timestamp: ${log.timestamp}\n- Total Invoices: ${log.invoicesCount}\n- Admin Inbox: ${ADMIN_EMAIL}\n- Device: ${log.deviceInfo}\n\nInvoiceCraft Studio - Made By Pasindu Dushangana`
    : `Hello Pasindu,\n\nThis is an automated activity report for ${ADMIN_EMAIL}.\nAll user login details and invoice records are synchronized.\n\nMade By Pasindu Dushangana`;

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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const realClients = parsed.filter(
          (c) => c.id !== 'cli_1' && c.id !== 'cli_2' && c.id !== 'cli_3' && !c.email?.includes('@quantummedia.io')
        );
        return realClients;
      }
    }
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
