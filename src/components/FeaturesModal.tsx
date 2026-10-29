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
} from 'lucide-react';
import { TEMPLATES } from '../data/templateList';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    {
      title: `${TEMPLATES.length} Bespoke Designer Templates`,
      desc: 'Carefully engineered layouts spanning Neo-Brutalist Pop, Matrix Cyberdeck, Luxury Onyx & Gold, Bauhaus, Synthwave, Modern Minimalist, and more.',
      icon: Sparkles,
    },
    {
      title: 'User History & Persistent Storage',
      desc: 'Every invoice is automatically saved to your private history. Search, filter by status, duplicate, and restore past versions with 1 click.',
      icon: FolderOpen,
    },
    {
      title: 'Authentication & Activity Logs',
      desc: 'Secure user login portal with session tracking. All login notifications and access records are systematically routed to pdushangana@gmail.com.',
      icon: ShieldCheck,
    },
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>InvoiceCraft Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                PRO Suite
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Professional billing engine &amp; designer suite · Made By Pasindu Dushangana
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto flex-1">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">
            Watermark: <strong className="text-neutral-200">Made By Pasindu Dushangana</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Explore Studio
          </button>
        </div>
      </div>
    </div>
  );
};
