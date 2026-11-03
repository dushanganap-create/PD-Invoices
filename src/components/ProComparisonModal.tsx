import React from 'react';
import { X, Crown, Check, Sparkles, Zap, MessageCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/auth';

interface ProComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const ProComparisonModal: React.FC<ProComparisonModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  const userEmail = currentUser ? currentUser.email : 'my-account';
  const creativeWhatsAppText = encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to upgrade to PD Invoice PRO for just LKR 250! 🚀\n\n👤 Account Email: ${userEmail}\n💰 Package: PD Invoice PRO (LKR 250)\n✨ Features: Unlimited daily invoices, no watermarks, all 50+ templates unlocked.\n\nPlease activate my account. Thank you! ⭐`
  );
  const whatsappUrl = `https://wa.me/94719891483?text=${creativeWhatsAppText}`;

  const comparisonRows = [
    {
      feature: 'Daily Invoice Creation',
      normal: '5 Invoices per day',
      pro: 'Unlimited (Zero caps)',
    },
    {
      feature: 'Designer Templates',
      normal: '17 Free templates',
      pro: 'All 50+ Pro templates unlocked',
    },
    {
      feature: 'Invoice Watermark',
      normal: '"Made with PD Invoice"',
      pro: '100% Watermark Free',
    },
    {
      feature: 'Client CRM Address Book',
      normal: 'Included',
      pro: 'Included',
    },
    {
      feature: 'Multi-Currency & Tax Engine',
      normal: 'Included',
      pro: 'Included',
    },
    {
      feature: 'Vector PDF & PNG Export',
      normal: 'Included',
      pro: 'Included',
    },
    {
      feature: 'Digital Signature & QR Code',
      normal: 'Included',
      pro: 'Included',
    },
    {
      feature: 'Lifetime Access Price',
      normal: 'Free Forever',
      pro: 'Just LKR 250 (One-time)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-750 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-950/70 via-neutral-900 to-indigo-950/70 border-b border-neutral-800 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg text-white shrink-0">
              <Crown className="w-6 h-6 text-amber-200 fill-current" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                Feature Breakdown
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Normal vs. PD Invoice PRO
              </h2>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950/80 shadow-inner">
            <div className="grid grid-cols-12 bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-4 py-3">
              <div className="col-span-5 sm:col-span-6">Capability</div>
              <div className="col-span-3 sm:col-span-3 text-center">Normal (Free)</div>
              <div className="col-span-4 sm:col-span-3 text-center text-amber-400">PRO Edition</div>
            </div>

            <div className="divide-y divide-neutral-850 text-xs">
              {comparisonRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-neutral-900/40 transition-colors">
                  <div className="col-span-5 sm:col-span-6 font-semibold text-neutral-200">
                    {row.feature}
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center text-neutral-400 font-medium">
                    {row.normal}
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-center font-bold text-amber-300 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{row.pro}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-neutral-900 to-emerald-950/50 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-sm font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Lifetime Activation</span>
              </div>
              <div className="text-xs text-neutral-300 mt-0.5">
                Get full PRO access for just <strong className="text-white font-mono">LKR 250</strong> via WhatsApp chat.
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get PRO · LKR 250</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Cloud &amp; Local Invoicing Suite
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
