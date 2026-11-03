import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Crown,
  Check,
  Search,
  Sparkles,
  Users,
  Activity,
  Mail,
  Zap,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  MessageCircle,
} from 'lucide-react';
import { UserRecord, UserProfile, LoginNotificationLog } from '../types/auth';
import {
  getAllUsers,
  toggleUserPro,
  preGrantProEmail,
  resetDailyLimits,
  getLoginNotificationLogs,
  generateAdminEmailLink,
  isSuperAdminEmail,
  FREE_DAILY_INVOICE_LIMIT,
  ADMIN_EMAIL,
  getTodayDateString,
} from '../utils/authStorage';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSwitchUser: (user: UserProfile) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [logs, setLogs] = useState<LoginNotificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pro' | 'free'>('all');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'overview'>('users');

  const loadData = () => {
    setLogs(getLoginNotificationLogs());
  };

  useEffect(() => {
    if (!isOpen) return;

    loadData();

    // Real-time Firestore listener for all user accounts across devices
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const firestoreUsers: UserRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserRecord;
          firestoreUsers.push({
            ...data,
            id: docSnap.id,
          });
        });

        const hasAdmin = firestoreUsers.some((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        if (!hasAdmin) {
          firestoreUsers.unshift({
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
          });
        }

        setUsers(firestoreUsers);
      },
      (error) => {
        console.warn('Firestore realtime users sync warning:', error);
        setUsers(getAllUsers());
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTogglePro = async (targetUser: UserRecord) => {
    if (isSuperAdminEmail(targetUser.email)) {
      showToast('Super Admin Pasindu Dushangana always holds permanent Pro & Owner privileges.');
      return;
    }

    const nextState = !targetUser.isPro;
    const emailNorm = targetUser.email.trim().toLowerCase();

    try {
      // 1. Direct real-time Firestore update by normalized email
      await setDoc(
        doc(db, 'users', emailNorm),
        {
          ...targetUser,
          email: emailNorm,
          isPro: nextState,
          role: nextState ? 'pro' : 'user',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 2. Also write by targetUser.id if different
      if (targetUser.id && targetUser.id !== emailNorm) {
        await setDoc(
          doc(db, 'users', targetUser.id),
          {
            isPro: nextState,
            role: nextState ? 'pro' : 'user',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }

      // 3. Update local records & audit
      toggleUserPro(emailNorm, nextState);
      loadData();

      showToast(
        nextState
          ? `✓ Pro features granted to ${targetUser.name || emailNorm} (${emailNorm})! Synced instantly across all devices.`
          : `Pro features revoked for ${targetUser.name || emailNorm} (${emailNorm}).`
      );
    } catch (err) {
      console.error('Error updating Pro status in Firestore:', err);
      toggleUserPro(emailNorm, nextState);
      loadData();
      showToast(
        nextState
          ? `✓ Pro granted locally to ${emailNorm}. Notice: Firestore sync error: ${err instanceof Error ? err.message : 'offline'}`
          : `Pro revoked for ${emailNorm}.`
      );
    }
  };

  const handleAddPreApprovedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    const emailNorm = newEmail.trim().toLowerCase();
    const today = getTodayDateString();

    try {
      const newRec: UserRecord = {
        id: emailNorm,
        email: emailNorm,
        name: newName || emailNorm.split('@')[0],
        role: 'pro',
        isPro: true,
        totalInvoicesCount: 0,
        invoicesToday: 0,
        lastInvoiceDate: today,
        joinedDate: today,
        lastLoginTime: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', emailNorm), newRec, { merge: true });
      preGrantProEmail(emailNorm, newName || undefined);
      loadData();
      setNewEmail('');
      setNewName('');
      showToast(`✓ Pro features successfully granted to ${emailNorm}! Synced live to Firestore.`);
    } catch (err) {
      console.error('Error pre-approving email:', err);
      preGrantProEmail(emailNorm, newName || undefined);
      loadData();
      setNewEmail('');
      setNewName('');
      showToast(`✓ Pro features granted to ${emailNorm}.`);
    }
  };

  const handleResetLimits = () => {
    resetDailyLimits();
    loadData();
    showToast('All free user daily counters have been reset to 0/5 for today.');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'pro') return u.isPro;
    if (filterType === 'free') return !u.isPro && !isSuperAdminEmail(u.email);
    return true;
  });

  const totalUsersCount = users.length;
  const proUsersCount = users.filter((u) => u.isPro).length;
  const freeUsersCount = users.filter((u) => !u.isPro && !isSuperAdminEmail(u.email)).length;
  const todayInvoicesTotal = users.reduce((acc, u) => acc + (u.invoicesToday || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-2 py-1 shadow-md border border-neutral-700 shrink-0">
              <img
                src="/assets/aistudio/image_e019301c.png"
                alt="PD Invoice"
                className="h-8 w-auto object-contain block"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Admin Command Center
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
                    Super Admin
                  </span>
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Master console for <strong className="text-neutral-200">Pasindu Dushangana</strong> (
                <span className="text-indigo-400 font-mono">{ADMIN_EMAIL}</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/94719891483"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="WhatsApp Direct Contact (0719891483)"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp 0719891483</span>
            </a>
            <a
              href={generateAdminEmailLink()}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs border border-neutral-700 transition-colors"
              title="Open email report"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Audit</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {toastMessage}
            </span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stat Overview Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-950/70 border-b border-neutral-800 shrink-0">
          <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalUsersCount}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Registered in database</div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
              <span>Active Pro Users</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300">{proUsersCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">Unlimited daily invoices</div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-indigo-400 text-xs mb-1">
              <span>Free Tier Users</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-300">{freeUsersCount}</div>
            <div className="text-[10px] text-indigo-400/80 mt-0.5">Limited to 5 invoices/day</div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
              <span>Invoices Today</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300">{todayInvoicesTotal}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">Created across platform</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory &amp; Pro Access Ticks</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px]">
                {filteredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Security &amp; Login Audit Logs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px]">
                {logs.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              onClick={handleResetLimits}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 flex items-center gap-1 transition-colors"
              title="Reset today's invoice count for all free accounts"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Free Limits</span>
            </button>
          </div>
        </div>

        {/* TAB 1: USERS DIRECTORY & PRO PERMISSIONS TABLE */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* Quick Add Email Form */}
            <form
              onSubmit={handleAddPreApprovedEmail}
              className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center gap-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300 shrink-0">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Grant Pro Directly:</span>
              </div>
              <input
                type="email"
                placeholder="Enter person's email (e.g. user@client.com)..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-750 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 bg-neutral-900 border border-neutral-750 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Grant Pro Access</span>
              </button>
            </form>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter users by email, name, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setFilterType('pro')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'pro'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Pro ({proUsersCount})
                </button>
                <button
                  onClick={() => setFilterType('free')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'free'
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Free ({freeUsersCount})
                </button>
              </div>
            </div>

            {/* Main Interactive Users Table */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">User / Email</th>
                      <th className="py-3 px-4 font-semibold">Current Tier</th>
                      <th className="py-3 px-4 font-semibold">Today's Invoices</th>
                      <th className="py-3 px-4 font-semibold">Total Made</th>
                      <th className="py-3 px-4 font-semibold text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-300 font-bold">
                          <Crown className="w-3.5 h-3.5" />
                          Pro Access (Click Tick)
                        </span>
                      </th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredUsers.map((user) => {
                      const isSuper = isSuperAdminEmail(user.email);
                      const isFreeAtLimit = !user.isPro && !isSuper && user.invoicesToday >= FREE_DAILY_INVOICE_LIMIT;

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-neutral-900/60 transition-colors ${
                            user.isPro ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          {/* User info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300">
                                  {user.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isSuper && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-400 font-mono">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tier badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                                <Crown className="w-3 h-3 text-amber-400" />
                                Super Admin
                              </span>
                            ) : user.isPro ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                                <Crown className="w-3 h-3 text-amber-400" />
                                Pro Member
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px]">
                                Free Tier (5/day)
                              </span>
                            )}
                          </td>

                          {/* Today's Invoices */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {user.isPro || isSuper ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <Sparkles className="w-3 h-3" />
                                <span>{user.invoicesToday} (Unlimited ∞)</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={isFreeAtLimit ? 'text-red-400 font-bold' : 'text-neutral-300'}>
                                    {user.invoicesToday} / {FREE_DAILY_INVOICE_LIMIT}
                                  </span>
                                  {isFreeAtLimit && (
                                    <span className="text-[10px] text-red-400 bg-red-950/80 px-1 rounded border border-red-800">
                                      Limit Hit
                                    </span>
                                  )}
                                </div>
                                <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      isFreeAtLimit ? 'bg-red-500' : 'bg-indigo-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (user.invoicesToday / FREE_DAILY_INVOICE_LIMIT) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Total Made */}
                          <td className="py-3 px-4 font-mono text-neutral-300">
                            {user.totalInvoicesCount || 0}
                          </td>

                          {/* THE TICK BUTTON: Give them access to Pro features with a click */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isSuper ? (
                              <span className="text-[11px] text-neutral-500 font-medium italic">
                                Permanent Admin
                              </span>
                            ) : (
                              <button
                                onClick={() => handleTogglePro(user)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                  user.isPro
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-1 ring-emerald-400'
                                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
                                }`}
                                title={
                                  user.isPro
                                    ? 'Click to revoke Pro features'
                                    : 'Click tick to grant unlimited Pro features!'
                                }
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center ${
                                    user.isPro ? 'bg-white text-emerald-600' : 'border border-neutral-500'
                                  }`}
                                >
                                  {user.isPro && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <span>{user.isPro ? 'Pro Active' : 'Grant Pro'}</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                onSwitchUser({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  role: user.role,
                                  isPro: user.isPro,
                                  dailyInvoicesCount: user.invoicesToday,
                                  lastInvoiceDate: user.lastInvoiceDate,
                                  createdAt: user.joinedDate,
                                  avatarUrl: user.avatarUrl,
                                });
                                onClose();
                              }}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                              title="Test platform as this user"
                            >
                              <span>Test Session</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-neutral-500 text-xs">
                  No users found matching &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT & LOGIN NOTIFICATIONS FOR pdushangana@gmail.com */}
        {activeTab === 'activity' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Live Event Stream &amp; Dispatch Log
                </h3>
                <p className="text-xs text-neutral-400">
                  Every login, registration, and Pro permission change is routed to{' '}
                  <span className="text-indigo-300 font-mono font-medium">{ADMIN_EMAIL}</span>
                </p>
              </div>

              <a
                href={generateAdminEmailLink()}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Forward Report to Inbox</span>
              </a>
            </div>

            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/50">
              <div className="divide-y divide-neutral-800/80">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 text-xs hover:bg-neutral-900/50 transition-colors flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                          log.event === 'PRO_GRANTED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.event === 'PRO_REVOKED'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : log.event === 'LOGIN'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {log.event}
                      </span>
                      <div>
                        <div className="text-white font-medium">
                          {log.userName} &lt;{log.userEmail}&gt;
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {log.summary}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-1">
                          Client: {log.deviceInfo}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <a
                        href={generateAdminEmailLink(log)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 justify-end mt-1"
                      >
                        <span>Mail Log</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Real-time Pro permission propagation enabled · Active Admin: <strong className="text-neutral-200">Pasindu Dushangana</strong>
            </span>
          </div>

          <div className="text-neutral-300 font-semibold text-[11px]">
            Made By Pasindu Dushangana
          </div>
        </div>
      </div>
    </div>
  );
};
