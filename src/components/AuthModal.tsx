import React from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile } from '../types/auth';
import { LogOut, User, Shield, CheckCircle2, X, Sparkles, Lock, Zap, MessageCircle, Crown } from 'lucide-react';

interface AuthModalProps {
  user: UserProfile | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const ADMIN_EMAIL = 'pdushangana@gmail.com';

export const AuthModal: React.FC<AuthModalProps> = ({ user, isOpen = true, onClose }) => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user && !isOpen) {
    return null;
  }

  const isAdmin = user?.email === ADMIN_EMAIL;
  const whatsappUrl = `https://wa.me/94719891483?text=${encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to get the PD Invoice PRO upgrade for just LKR 250! 🚀\n\n💰 Package: PD Invoice PRO (LKR 250)\n✨ Features: 50+ Professional Templates, unlimited invoices, no watermarks.\n\nPlease activate my account. Thank you! ⭐`
  )}`;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative text-center">
        {user && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-850 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-indigo-500 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-5 p-0.5">
          <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
            {user ? (
              <User className="w-8 h-8 text-indigo-400" />
            ) : (
              <Shield className="w-8 h-8 text-amber-400" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {user ? 'Account & Security Center' : 'PD Invoice Enterprise Hub'}
        </h2>
        <p className="text-neutral-400 text-sm mb-6">
          {user
            ? 'Manage your signed-in Google session, security permissions, and PRO status.'
            : 'Sign in securely with Google to unlock 50+ stunning invoice templates, client CRM, multi-currency support, and instant PDF/PNG export.'}
        </p>

        {!user && (
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">50+ Pro Templates</div>
                <div className="text-[11px] text-neutral-400">Modern, luxury & corporate styles</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">LKR 250 PRO Offer</div>
                <div className="text-[11px] text-neutral-400">Instant WhatsApp activation</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Secure Google Auth</div>
                <div className="text-[11px] text-neutral-400">Encrypted OAuth & session sync</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Client CRM & Analytics</div>
                <div className="text-[11px] text-neutral-400">Track paid & pending invoices</div>
              </div>
            </div>
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Signed in as</span>
                {isAdmin ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Super Admin (Owner)
                  </span>
                ) : user.isPro ? (
                  <span className="text-[10px] bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/40 font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> PRO Member
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Free Account
                  </span>
                )}
              </div>
              <div className="font-semibold text-white truncate">{user.name || 'User'}</div>
              <div className="text-xs font-mono text-neutral-400 truncate">{user.email}</div>
            </div>

            {!isAdmin && !user.isPro && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-emerald-950/40 border border-amber-500/30 flex items-center justify-between text-left">
                <div>
                  <div className="text-xs font-bold text-amber-300">Upgrade to PRO (LKR 250)</div>
                  <div className="text-[11px] text-neutral-400">Unlock all 50 templates & unlimited invoices</div>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            )}

            {!isAdmin && user.isPro && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#141E30] to-purple-950/40 border border-indigo-500/30 text-left flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>PRO Membership Active</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">● Live Sync</span>
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Unlimited daily invoices, watermark removed & all 50+ templates unlocked.
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-neutral-800 hover:bg-neutral-750 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full py-3.5 px-6 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
            <div className="text-[11px] text-neutral-500">
              By signing in, you agree to secure cloud invoicing & analytics synchronization.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
