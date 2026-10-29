import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Printer,
  Download,
  FolderOpen,
  Plus,
  Layers,
  ChevronDown,
  HelpCircle,
  Users,
  TrendingUp,
  User,
  Shield,
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { UserProfile } from '../types/auth';
import { INVOICE_PRESETS } from '../data/presets';
import { TEMPLATES } from '../data/templateList';
import { exportToPdf, printInvoice } from '../utils/export';

interface NavbarProps {
  currentInvoice: Invoice;
  savedInvoices: Invoice[];
  currentUser: UserProfile | null;
  onSelectPreset: (presetId: string) => void;
  onOpenTemplates: () => void;
  onNewInvoice: () => void;
  onLoadSavedInvoice: (id: string) => void;
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  onOpenClients: () => void;
  onOpenAnalytics: () => void;
  activeView: 'split' | 'editor' | 'preview';
  onToggleView: (view: 'split' | 'editor' | 'preview') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentInvoice,
  savedInvoices,
  currentUser,
  onSelectPreset,
  onOpenTemplates,
  onNewInvoice,
  onLoadSavedInvoice,
  onOpenGuide,
  onOpenAuth,
  onOpenHistory,
  onOpenClients,
  onOpenAnalytics,
  activeView,
  onToggleView,
}) => {
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickPdf = async () => {
    setIsExporting(true);
    try {
      const ok = await exportToPdf('invoice-render-sheet', currentInvoice.invoiceNumber);
      if (ok) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
          });
        } catch (e) {}
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="no-print h-16 bg-neutral-900 border-b border-neutral-800 px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 z-40 sticky top-0 shadow-md">
      {/* Zone 1: Wordmark + Watermark badge + Split View segmented toggle */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <a
          href="/"
          className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
            IC
          </span>
          <span className="hidden sm:inline">InvoiceCraft</span>
        </a>

        {/* Creator Watermark Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-[10px] text-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-neutral-200 tracking-wide uppercase">
            Made By Pasindu Dushangana
          </span>
        </div>

        {/* View Switcher: Split (Both Sides) vs Details vs Preview */}
        <div className="flex items-center bg-neutral-800 p-0.5 rounded-lg border border-neutral-700">
          <button
            onClick={() => onToggleView('split')}
            className={`px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'split' ? 'bg-indigo-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
            title="Side-by-Side: Form on left, live preview on right"
          >
            <span className="hidden sm:inline">Side-by-Side</span>
            <span className="sm:hidden">Split</span>
          </button>
          <button
            onClick={() => onToggleView('editor')}
            className={`px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
            title="Focus on editing details"
          >
            Details
          </button>
          <button
            onClick={() => onToggleView('preview')}
            className={`px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeView === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
            }`}
            title="Focus on invoice preview"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation Links & Feature Modals */}
      <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-neutral-300">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{TEMPLATES.length} Designs</span>
        </button>

        {/* User History Button */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>My History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-mono">
            {savedInvoices.length}
          </span>
        </button>

        {/* Client Address Book */}
        <button
          onClick={onOpenClients}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clients</span>
        </button>

        {/* Financial Analytics */}
        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>Analytics</span>
        </button>

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setPresetsOpen(!presetsOpen)}
            className="flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Presets</span>
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>

          {presetsOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Load Realistic Industry Invoice
              </div>
              {INVOICE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setPresetsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-800 text-neutral-200 hover:text-white flex flex-col transition-colors"
                >
                  <span className="font-semibold text-white">{preset.title}</span>
                  <span className="text-[11px] text-neutral-400 truncate">{preset.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onNewInvoice}
          className="flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Blank</span>
        </button>
      </nav>

      {/* Zone 3: User Authentication & Export Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile History / Features buttons */}
        <button
          onClick={onOpenHistory}
          className="xl:hidden p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          title="Invoice History"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={onOpenTemplates}
          className="xl:hidden p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          title="Browse Templates"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </button>

        {/* User Account / Login Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-lg border border-neutral-700 text-xs transition-all shadow-xs"
          title="Authentication & Security Portal"
        >
          {currentUser ? (
            <>
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium text-white max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-medium">Sign In</span>
            </>
          )}
        </button>

        <button
          onClick={printInvoice}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 hover:text-white rounded-lg border border-neutral-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        <button
          onClick={handleQuickPdf}
          disabled={isExporting}
          className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    </header>
  );
};
