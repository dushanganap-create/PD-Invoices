import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Send,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { UserProfile, LoginNotificationLog } from '../types/auth';
import {
  getCurrentUser,
  setCurrentUser,
  recordLoginEvent,
  getLoginNotificationLogs,
  generateAdminEmailLink,
  DEMO_USER,
  SECONDARY_DEMO_USER,
} from '../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile | null) => void;
  invoicesCount: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChange,
  invoicesCount,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo' | 'audit'>('signin');
  const [currentUser, setLocalCurrentUser] = useState<UserProfile | null>(getCurrentUser);
  const [logs, setLogs] = useState<LoginNotificationLog[]>([]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalCurrentUser(getCurrentUser());
      setLogs(getLoginNotificationLogs());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name || 'Valued User',
      email,
      companyName: 'Private Enterprise',
      role: 'Member',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    setLocalCurrentUser(user);
    onUserChange(user);

    // Record login event sent to pdushangana@gmail.com
    const logItem = recordLoginEvent(
      'LOGIN',
      user.email,
      user.name,
      invoicesCount,
      'User authenticated via InvoiceCraft login portal.'
    );
    setLogs((prev) => [logItem, ...prev]);

    setStatusMessage({
      text: `Welcome back, ${user.name}! Login details and activity dispatched to pdushangana@gmail.com.`,
      type: 'success',
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      setStatusMessage({ text: 'Please enter your name and email address', type: 'error' });
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: fullName,
      email,
      companyName: companyName || 'Independent Studio',
      role: 'Account Owner',
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setLocalCurrentUser(newUser);
    onUserChange(newUser);

    // Record registration event sent to pdushangana@gmail.com
    const logItem = recordLoginEvent(
      'REGISTER',
      newUser.email,
      newUser.name,
      invoicesCount,
      `New user account registered (${companyName || 'Independent'}). Dispatched to pdushangana@gmail.com.`
    );
    setLogs((prev) => [logItem, ...prev]);

    setStatusMessage({
      text: `Account created successfully! Account notification routed to pdushangana@gmail.com.`,
      type: 'success',
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSelectDemoUser = (user: UserProfile) => {
    setCurrentUser(user);
    setLocalCurrentUser(user);
    onUserChange(user);

    const logItem = recordLoginEvent(
      'GUEST_ACCESS',
      user.email,
      user.name,
      invoicesCount,
      `Demo profile switched to ${user.name}. Sent to pdushangana@gmail.com.`
    );
    setLogs((prev) => [logItem, ...prev]);

    setStatusMessage({
      text: `Switched to profile: ${user.name}. Notification logged for pdushangana@gmail.com.`,
      type: 'success',
    });

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setLocalCurrentUser(null);
    onUserChange(null);
    setStatusMessage({
      text: 'You have signed out. Working in guest mode.',
      type: 'info',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                User Authentication & Security Portal
              </h2>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Notifications routed to <strong className="text-indigo-300 font-mono">pdushangana@gmail.com</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50 px-6 pt-2">
          <button
            onClick={() => setTab('signin')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'signin'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'signup'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab('demo')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              tab === 'demo'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Demo Profiles
          </button>
          <button
            onClick={() => setTab('audit')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'audit'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin Log</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-900/60 text-indigo-300 text-[10px] font-mono">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                  : 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Current Active Account Card */}
          {currentUser ? (
            <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-normal">
                      Active Session
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">{currentUser.email}</div>
                  {currentUser.companyName && (
                    <div className="text-[10px] text-neutral-500">{currentUser.companyName}</div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg border border-rose-900/60 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-center justify-between">
              <span>Currently in <strong>Guest Mode</strong> (invoices saved locally).</span>
            </div>
          )}

          {/* TAB 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@company.com"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-[11px] text-neutral-300 space-y-1">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Notification Forwarding
                </div>
                <p className="text-neutral-400 text-[10.5px]">
                  All login sessions & invoices automatically notify and synchronize with{' '}
                  <strong className="text-indigo-300 font-mono">pdushangana@gmail.com</strong> for real-time record keeping.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: Create Account */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Samantha Wright"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. samantha@creative.com"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Company / Brand Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Wright Design Co."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[11px] text-neutral-400">
                <span className="text-emerald-400 font-semibold">Automatic Dispatch Notice: </span>
                Upon account creation, your registration record and activity will be logged and transmitted directly to{' '}
                <span className="text-indigo-300 font-mono">pdushangana@gmail.com</span>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Create Account & Start Saving</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: Demo Profiles */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Click any profile below to instantly load their session, saved invoices, and dispatch an authentication report to{' '}
                <strong className="text-indigo-300 font-mono">pdushangana@gmail.com</strong>:
              </p>

              <div
                onClick={() => handleSelectDemoUser(DEMO_USER)}
                className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                    PD
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                      <span>{DEMO_USER.name}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-normal">
                        Admin Creator
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">{DEMO_USER.email}</div>
                    <div className="text-[10px] text-neutral-500">{DEMO_USER.companyName}</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 text-xs bg-indigo-600/20 text-indigo-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Use Profile
                </button>
              </div>

              <div
                onClick={() => handleSelectDemoUser(SECONDARY_DEMO_USER)}
                className="p-3.5 bg-neutral-950 border border-neutral-800 hover:border-indigo-500/60 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {SECONDARY_DEMO_USER.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">{SECONDARY_DEMO_USER.email}</div>
                    <div className="text-[10px] text-neutral-500">{SECONDARY_DEMO_USER.companyName}</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 text-xs bg-indigo-600/20 text-indigo-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Use Profile
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Admin Notification Audit Log */}
          {tab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Dispatched Activity Logs
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Destination: <span className="text-indigo-300 font-mono">pdushangana@gmail.com</span>
                  </p>
                </div>
                <a
                  href={generateAdminEmailLink(logs[0])}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Email</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="p-4 bg-neutral-950 rounded-xl text-center text-xs text-neutral-500">
                    No login activity logs recorded yet.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.event === 'LOGIN'
                                ? 'bg-indigo-400'
                                : log.event === 'REGISTER'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          {log.userName} ({log.userEmail})
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">{log.summary}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Target: {log.destinationEmail} · Event: {log.event}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Credit & Watermark */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            InvoiceCraft Studio
          </span>
          <span className="font-medium tracking-wide text-neutral-300">
            Made By Pasindu Dushangana
          </span>
        </div>
      </div>
    </div>
  );
};
