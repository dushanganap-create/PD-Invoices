import React from 'react';
import {
  X,
  Crown,
  Sparkles,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, DailyUsageQuota } from '../types/auth';
import { ADMIN_EMAIL, FREE_DAILY_INVOICE_LIMIT } from '../utils/authStorage';

interface ProLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  quota?: DailyUsageQuota;
  reason?: 'daily_limit' | 'pro_template' | 'pro_feature';
  featureName?: string;
  onSwitchToAdmin?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const ProLimitModal: React.FC<ProLimitModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  quota,
  reason = 'daily_limit',
  featureName = 'Exclusive Pro Feature',
  onSwitchToAdmin,
  onOpenAdminDashboard,
}) => {
  if (!isOpen) return null;

  const used = quota ? quota.usedToday : FREE_DAILY_INVOICE_LIMIT;
  const userEmail = currentUser ? currentUser.email : 'guest@client.io';
  const userName = currentUser ? currentUser.name : 'Valued Client';
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  // Creative pre-filled message for WhatsApp number 0719891483
  const creativeWhatsAppText = encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to get the PD Invoice PRO upgrade for just LKR 250! 🚀\n\n👤 Account Email: ${userEmail}\n💰 Price: LKR 250\n✨ Features Requested:\n  • Unlimited daily invoices\n  • Remove watermark from invoices\n  • Unlock all 50 designer templates\n\nPlease send me the payment instructions or activate my account. Thank you! 🌟📄`
  );
  const whatsappUrl = `https://wa.me/94719891483?text=${creativeWhatsAppText}`;

  const mailSubject = encodeURIComponent(`[Pro Upgrade Request - LKR 250] Enable Pro Features for ${userEmail}`);
  const mailBody = encodeURIComponent(
    `Hello PD Invoice Support,\n\nI would like to request Pro access on PD Invoice for LKR 250.\n\n- User Name: ${userName}\n- User Email: ${userEmail}\n- Invoices Generated Today: ${used}/${FREE_DAILY_INVOICE_LIMIT}\n\nPlease click the Pro tick for my account in the Admin Command Center.\n\nThank you!\n${userName}`
  );
  const mailtoUrl = `mailto:${ADMIN_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  const isDailyLimit = reason === 'daily_limit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Banner with Pricing Highlight */}
        <div className="p-5 bg-gradient-to-br from-amber-950/60 via-neutral-900 to-indigo-950/60 border-b border-neutral-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg text-white shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                PD Invoice PRO Upgrade
              </div>
              <h2 className="text-xl font-bold text-white">
                {isDailyLimit ? 'Daily Free Limit Reached' : `Unlock "${featureName}"`}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
            {isDailyLimit
              ? `You have reached your free tier limit of ${FREE_DAILY_INVOICE_LIMIT} invoices generated today. Upgrade to PRO for just LKR 250 to unlock unlimited daily invoices, remove all watermarks, and access all 50 designer templates.`
              : `"${featureName}" is an exclusive PRO template/feature. Upgrade your account to instantly unlock all professional studio capabilities.`}
          </p>

          {/* Pricing Highlight Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-neutral-950 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-300">Lifetime PRO Access</div>
              <div className="text-lg font-black text-white">LKR 250 <span className="text-xs text-neutral-400 font-normal">/ one-time</span></div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Instant WhatsApp Activation</span>
            </a>
          </div>

          {/* Contact Support Options */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Quick Support &amp; Activation
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:0719891483"
                className="py-2 px-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call 0719891483</span>
              </a>

              <a
                href={mailtoUrl}
                className="py-2 px-3 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
                title="Email Support"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Support</span>
              </a>
            </div>

            {isAdmin && onSwitchToAdmin && (
              <button
                onClick={() => {
                  onSwitchToAdmin();
                  onClose();
                }}
                className="w-full py-2 px-3 bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-700/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                title="Switch to Owner view to test granting Pro with a tick"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin View (Switch to {ADMIN_EMAIL})</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 px-5">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pro Plan: Just LKR 250
          </span>
          <span className="text-neutral-300 font-semibold">
            PD Invoice Studio
          </span>
        </div>
      </div>
    </div>
  );
};
