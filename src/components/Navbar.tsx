import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Printer,
  Download,
  FolderOpen,
  Plus,
  Layers,
  ChevronDown,
  Users,
  TrendingUp,
  User,
  Shield,
  Crown,
  Zap,
  MessageCircle,
  Columns,
  Eye,
  SlidersHorizontal,
  X,
  Coins,
  Check,
  Copy,
  FileCheck,
  LayoutGrid,
  FilePlus,
  Building2,
  Sliders,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Invoice, CurrencyCode } from '../types/invoice';
import { UserProfile, DailyUsageQuota } from '../types/auth';
import { INVOICE_PRESETS } from '../data/presets';
import { TEMPLATES } from '../data/templateList';
import { exportToPdf, printInvoice } from '../utils/export';
import { isSuperAdminEmail, FREE_DAILY_INVOICE_LIMIT } from '../utils/authStorage';
import { CURRENCIES, formatCurrency } from '../utils/currency';
import { calculateInvoice } from '../utils/calculations';

interface NavbarProps {
  currentInvoice: Invoice;
  savedInvoices: Invoice[];
  currentUser: UserProfile | null;
  quota?: DailyUsageQuota;
  onSelectPreset: (presetId: string) => void;
  onOpenTemplates: () => void;
  onNewInvoice: () => void;
  onLoadSavedInvoice: (id: string) => void;
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  onOpenClients: () => void;
  onOpenAnalytics: () => void;
  onOpenAdminDashboard: () => void;
  onOpenProLimit: (feature?: string) => void;
  activeView: 'split' | 'editor' | 'preview';
  onToggleView: (view: 'split' | 'editor' | 'preview') => void;
  onUpdateCurrency?: (currency: CurrencyCode) => void;
  onDuplicateInvoice?: () => void;
  onOpenProComparison: () => void;
  onGoHome?: () => void;
  onOpenProProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentInvoice,
  savedInvoices,
  currentUser,
  quota,
  onSelectPreset,
  onOpenTemplates,
  onNewInvoice,
  onLoadSavedInvoice,
  onOpenGuide,
  onOpenAuth,
  onOpenHistory,
  onOpenClients,
  onOpenAnalytics,
  onOpenAdminDashboard,
  onOpenProLimit,
  activeView,
  onToggleView,
  onUpdateCurrency,
  onDuplicateInvoice,
  onOpenProComparison,
  onGoHome,
  onOpenProProfile,
}) => {
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  const [othersMenuOpen, setOthersMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const othersMenuRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  const isAdmin = isSuperAdminEmail(currentUser?.email);
  const isPro = Boolean(currentUser?.isPro || isAdmin);
  const usedToday = quota ? quota.usedToday : currentUser?.dailyInvoicesCount || 0;

  const calc = calculateInvoice(currentInvoice);
  const currConfig = CURRENCIES[currentInvoice.currency] || CURRENCIES.LKR;

  const whatsappUrl = `https://wa.me/94719891483?text=${encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to get the PD Invoice PRO upgrade for just LKR 250! 🚀\n\n👤 Account Email: ${
      currentUser?.email || 'my-account'
    }\n💰 Package: PD Invoice PRO (LKR 250)\n\nPlease activate my account. Thank you! ⭐`
  )}`;

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (othersMenuRef.current && !othersMenuRef.current.contains(target)) {
        setOthersMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(target)) {
        setCurrencyMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOthersMenuOpen(false);
        setCurrencyMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
            colors: ['#586FFF', '#8294FF', '#10C997', '#F5B942'],
          });
        } catch (e) {}
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySummary = async () => {
    const summaryText = `📄 INVOICE #${currentInvoice.invoiceNumber}\nClient: ${currentInvoice.client.name}\nTotal: ${formatCurrency(
      calc.total,
      currentInvoice.currency
    )}\nStatus: ${currentInvoice.status.toUpperCase()}\nDue Date: ${currentInvoice.dueDate}\nCreated with PD Invoice · PD NETWORK`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (e) {}
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-[#101827]/95 backdrop-blur-2xl border-b border-[#141E30] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.9)] transition-all">
      {/* Subtle Ambient Brand Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#586FFF]/40 via-[#8294FF]/80 to-[#586FFF]/40 opacity-90 pointer-events-none" />

      {/* Main Clean Navigation Bar */}
      <div className="h-16 px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-3 max-w-[1920px] mx-auto">
        {/* =========================================================================
            LEFT SECTION: Brand Logo & Current Invoice Status Pill
        ========================================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onGoHome) onGoHome();
              else window.location.href = '/';
            }}
            className="flex items-center gap-2.5 shrink-0 group focus:outline-hidden cursor-pointer text-left"
            title="Return to PD Invoice Home"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-[#586FFF]/20 rounded-xl blur-xs group-hover:blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative bg-white rounded-xl px-2.5 py-1.5 shadow-md border border-white/60 flex items-center justify-center transition-all group-hover:scale-105">
                <img
                  src="/assets/aistudio/image_e019301c.png"
                  alt="PD Invoice Logo"
                  className="h-7 w-auto object-contain block"
                />
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-white font-extrabold text-sm tracking-tight leading-none">
                PD Invoice
              </span>
              <span className="text-[10px] text-[#8294FF] font-mono tracking-wider font-semibold">
                Studio
              </span>
            </div>
          </button>

          <div className="hidden xl:block h-6 w-px bg-[#19253A]" />

          {/* Quick Invoice Pill */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#141E30] border border-[#19253A] text-xs">
            <span className="font-mono font-bold text-white tracking-wide">
              {currentInvoice.invoiceNumber}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase font-mono ${
                currentInvoice.status === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : currentInvoice.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : currentInvoice.status === 'overdue'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {currentInvoice.status}
            </span>
          </div>
        </div>

        {/* =========================================================================
            CENTER SECTION: View Switcher (Split / Editor / Preview) & Currency
        ========================================================================= */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented View Switcher */}
          <div className="hidden md:flex items-center bg-[#141E30] p-1 rounded-xl border border-[#19253A] shadow-inner">
            <button
              onClick={() => onToggleView('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'split'
                  ? 'bg-[#586FFF] text-white shadow-md shadow-[#586FFF]/30'
                  : 'text-[#A5B1C7] hover:text-white hover:bg-[#19253A]'
              }`}
              title="Split View: Form on left, live invoice canvas on right"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => onToggleView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'editor'
                  ? 'bg-[#586FFF] text-white shadow-md shadow-[#586FFF]/30'
                  : 'text-[#A5B1C7] hover:text-white hover:bg-[#19253A]'
              }`}
              title="Focus solely on form fields"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => onToggleView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'preview'
                  ? 'bg-[#586FFF] text-white shadow-md shadow-[#586FFF]/30'
                  : 'text-[#A5B1C7] hover:text-white hover:bg-[#19253A]'
              }`}
              title="Focus on live canvas & print sheet"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Currency Pill / Selector */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Switch Currency"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentInvoice.currency === 'LKR' ? '🇱🇰 LKR' : `${currentInvoice.currency} (${currConfig.symbol})`}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#A5B1C7] transition-transform ${currencyMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {currencyMenuOpen && (
              <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-60 bg-[#101827] border border-[#19253A] rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[#A5B1C7] tracking-wider">
                  Select Currency
                </div>
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {Object.values(CURRENCIES).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        if (onUpdateCurrency) onUpdateCurrency(c.code);
                        setCurrencyMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentInvoice.currency === c.code
                          ? 'bg-[#586FFF] text-white font-bold'
                          : 'text-[#A5B1C7] hover:bg-[#19253A] hover:text-white'
                      }`}
                    >
                      <span>
                        {c.code} ({c.symbol}) — {c.name}
                      </span>
                      {currentInvoice.currency === c.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT SECTION: Templates, Download PDF, Others Menu Bar, & Account
        ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Templates Modal Button */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141E30] hover:bg-[#19253A] text-white rounded-xl text-xs font-semibold border border-[#19253A] transition-all cursor-pointer shadow-xs"
            title="Choose from 50+ professionally designed templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8294FF]" />
            <span className="hidden sm:inline">Templates</span>
            <span className="text-[10px] font-mono font-bold bg-[#586FFF]/20 text-[#8294FF] px-1.5 py-0.2 rounded">
              50+
            </span>
          </button>

          {/* Download PDF (Primary CTA) */}
          <button
            onClick={handleQuickPdf}
            disabled={isExporting}
            className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-[#586FFF] hover:bg-[#475ce6] rounded-xl transition-all whitespace-nowrap shadow-md shadow-[#586FFF]/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 hover:scale-[1.02]"
            title="Generate and download vector PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* =========================================================================
              THE "OTHERS" MENU BAR
              Clean dedicated dropdown containing all other tools & utilities
          ========================================================================= */}
          <div className="relative" ref={othersMenuRef}>
            <button
              onClick={() => setOthersMenuOpen(!othersMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                othersMenuOpen
                  ? 'bg-[#19253A] border-[#586FFF] text-white ring-2 ring-[#586FFF]/30'
                  : 'bg-[#141E30] border-[#19253A] text-[#A5B1C7] hover:text-white hover:bg-[#19253A]'
              }`}
              title="Others: Presets, Clients, Analytics, History, Pro Business Profile & Utilities"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#8294FF]" />
              <span className="hidden sm:inline">Others</span>
              <ChevronDown
                className={`w-3 h-3 text-[#A5B1C7] transition-transform ${othersMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Others Menu Dropdown Hub */}
            {othersMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[#0D1526] border border-[#19253A] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-3 z-50 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#19253A]">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-[#8294FF]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Others Menu &bull; Tools
                    </span>
                  </div>
                  <button
                    onClick={() => setOthersMenuOpen(false)}
                    className="p-1 text-[#A5B1C7] hover:text-white rounded-lg hover:bg-[#19253A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. HIGHLIGHT: PRO BUSINESS PROFILE STUDIO */}
                <button
                  onClick={() => {
                    setOthersMenuOpen(false);
                    if (onOpenProProfile) onOpenProProfile();
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#141E30] to-purple-950/40 border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#586FFF] to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
                      <Crown className="w-4 h-4 text-amber-300 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-white group-hover:text-[#8294FF] transition-colors">
                          Pro Business Profile Studio
                        </span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          PRO
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A5B1C7] mt-0.5 leading-snug">
                        Company legal name, high-res logo, digital seal, signature pad &amp; wire details auto-fill.
                      </p>
                    </div>
                  </div>
                </button>

                {/* 2. PRIMARY TOOLS GRID */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Client Book */}
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      onOpenClients();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] text-left transition-all group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Client CRM</div>
                      <div className="text-[10px] text-[#A5B1C7]">Address book</div>
                    </div>
                  </button>

                  {/* Saved Invoices */}
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] text-left transition-all group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Invoice Vault</div>
                      <div className="text-[10px] text-[#A5B1C7]">{savedInvoices.length} drafts</div>
                    </div>
                  </button>

                  {/* Revenue Analytics */}
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      onOpenAnalytics();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] text-left transition-all group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Analytics</div>
                      <div className="text-[10px] text-[#A5B1C7]">Revenue &amp; stats</div>
                    </div>
                  </button>

                  {/* Print Invoice */}
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      printInvoice();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] text-left transition-all group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-[#8294FF] flex items-center justify-center shrink-0">
                      <Printer className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Print Sheet</div>
                      <div className="text-[10px] text-[#A5B1C7]">Clean A4 print</div>
                    </div>
                  </button>
                </div>

                {/* 3. INVOICE ACTIONS: NEW & DUPLICATE */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#19253A]">
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      onNewInvoice();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-xs font-semibold text-white border border-[#19253A] transition-all cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>New Blank</span>
                  </button>

                  {onDuplicateInvoice && (
                    <button
                      onClick={() => {
                        setOthersMenuOpen(false);
                        onDuplicateInvoice();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-xs font-semibold text-white border border-[#19253A] transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Duplicate</span>
                    </button>
                  )}
                </div>

                {/* Presets List */}
                <div className="pt-2 border-t border-[#19253A] space-y-1">
                  <div className="px-1 text-[10px] uppercase font-bold text-[#A5B1C7] tracking-wider">
                    Quick-Load Presets
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {INVOICE_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onSelectPreset(preset.id);
                          setOthersMenuOpen(false);
                        }}
                        className="p-2 rounded-lg bg-[#141E30]/60 hover:bg-[#19253A] text-left transition-colors cursor-pointer text-xs"
                      >
                        <div className="font-semibold text-white truncate">{preset.title}</div>
                        <div className="text-[10px] text-[#A5B1C7] truncate">{preset.category}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Master Center */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setOthersMenuOpen(false);
                      onOpenAdminDashboard();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Super Admin Master Center</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                )}

                {/* VIP Pro Upgrade Prompt if not pro */}
                {!isPro && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#141E30] to-emerald-500/15 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-amber-300">Upgrade to PRO (LKR 250)</div>
                      <div className="text-[10px] text-[#A5B1C7]">No watermarks &amp; 50 templates</div>
                    </div>
                    <button
                      onClick={() => {
                        setOthersMenuOpen(false);
                        onOpenProComparison();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      View Pro
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account / Sign In Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#141E30] hover:bg-[#19253A] text-neutral-200 rounded-xl border border-[#19253A] text-xs transition-all shadow-xs cursor-pointer"
            title="User Profile & Security Center"
          >
            {currentUser ? (
              <>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-xs ${
                    isAdmin
                      ? 'bg-amber-600 ring-1 ring-amber-400'
                      : isPro
                      ? 'bg-gradient-to-tr from-[#586FFF] to-purple-600 ring-1 ring-indigo-400/50'
                      : 'bg-indigo-600'
                  }`}
                >
                  {currentUser?.name?.slice(0, 2).toUpperCase() ?? 'PD'}
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="font-semibold text-white max-w-[80px] truncate">
                    {currentUser?.name?.split(' ')[0] ?? 'User'}
                  </span>
                  {isPro && !isAdmin && (
                    <Crown className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                  )}
                </div>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#A5B1C7]" />
                <span className="font-semibold text-white">Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
