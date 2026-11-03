import React from 'react';
import {
  X,
  Sparkles,
  Printer,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  PenTool,
  QrCode,
  Users,
  TrendingUp,
  FolderOpen,
  Crown,
  Zap,
} from 'lucide-react';
import { TEMPLATES } from '../data/templateList';
import { ADMIN_EMAIL, FREE_DAILY_INVOICE_LIMIT } from '../utils/authStorage';
import { auth } from '../firebase';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;

  const features = [
    ...(isAdmin
      ? [
          {
            title: 'Admin Command Center (pdushangana@gmail.com)',
            desc: `Exclusive control hub for Pasindu Dushangana. Shows all registered emails and lets the admin grant or revoke Pro features in real-time by clicking a tick.`,
            icon: Crown,
            highlight: true,
          },
        ]
      : []),
    {
      title: `Free vs Pro Daily Invoice Quotas`,
      desc: `Normal free users can create up to ${FREE_DAILY_INVOICE_LIMIT} invoices per calendar day. Pro accounts enjoy unlimited daily creation with zero caps.`,
      icon: Zap,
      highlight: true,
    },
    {
      title: `${TEMPLATES.length} Bespoke Designer Templates`,
      desc: 'Carefully engineered layouts spanning Neo-Brutalist Pop, Matrix Cyberdeck, Luxury Onyx & Gold, Swiss Bauhaus, Synthwave, Modern Minimalist, and more.',
      icon: Sparkles,
    },
    {
      title: 'User History & Persistent Storage',
      desc: 'Every invoice is automatically saved to your private history. Search, filter by status, duplicate, and restore past versions with 1 click.',
      icon: FolderOpen,
    },
    ...(isAdmin
      ? [
          {
            title: `Security Logging & Alerts to ${ADMIN_EMAIL}`,
            desc: `Every login, registration, and permission change is tracked and transmitted directly to ${ADMIN_EMAIL} for centralized audit logs.`,
            icon: ShieldCheck,
          },
        ]
      : []),
    {
      title: 'Client Address Book (CRM)',
      desc: 'Save frequently billed clients and organizations. 1-click auto-fill client names, emails, addresses, and tax IDs directly into active invoices.',
      icon: Users,
    },
    {
      title: 'Financial Revenue & Analytics',
      desc: 'Real-time financial dashboard displaying total billed revenue, collected payments, outstanding receivables, and top clients.',
      icon: TrendingUp,
    },
    {
      title: 'Instant Print & Vector PDF Export',
      desc: 'Export high-DPI retina PDFs or trigger direct system printing with clean media stylesheets that strip UI chrome.',
      icon: Download,
    },
    {
      title: 'Digital Signature Studio',
      desc: 'Draw signatures directly with pen smoothing, generate stylish calligraphy script signatures, or upload transparent PNG seals.',
      icon: PenTool,
    },
    {
      title: 'Dynamic Payment QR Code',
      desc: 'Scannable vector QR code automatically generated from direct Stripe, PayPal, or crypto payment links.',
      icon: QrCode,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1 shadow-sm border border-neutral-700 shrink-0">
              <img
                src="/assets/aistudio/image_e019301c.png"
                alt="PD Invoice"
                className="h-7 w-auto object-contain block"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>PD Invoice Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  PRO: JUST LKR 250
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Professional billing engine &amp; designer suite · PD Invoice Studio
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

        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                  feat.highlight
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    feat.highlight ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-indigo-400'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <span>{feat.title}</span>
                    {feat.highlight && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Highlight
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-neutral-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400">
            Need custom enterprise features? Chat on WhatsApp:{' '}
            <a
              href={`https://wa.me/94719891483?text=${encodeURIComponent(
                'Hi PD Invoice Support! 👋 I would like to get PD Invoice PRO for just LKR 250. Please activate unlimited invoices and remove watermark! 🚀'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              0719891483
            </a>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-semibold text-xs transition-colors"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
