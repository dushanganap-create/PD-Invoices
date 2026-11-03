import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  FileText,
  Users,
  TrendingUp,
  Download,
  Share2,
  ChevronDown,
  Menu,
  X,
  Crown,
  Layers,
  BarChart3,
  Globe,
  Coins,
  MessageCircle,
  PenTool,
  SlidersHorizontal,
  Check,
  Printer,
  Eye,
  Building2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { TEMPLATES } from '../data/templateList';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreTemplates: () => void;
  currentUser?: any;
  onGoToApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreTemplates,
  currentUser,
  onGoToApp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'dashboard' | 'studio' | 'templates' | 'crm' | 'signature'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'Minimal', label: 'Minimalist' },
    { id: 'Corporate', label: 'Corporate' },
    { id: 'Creative', label: 'Creative' },
    { id: 'Modern', label: 'Modern' },
    { id: 'Luxury', label: 'Luxury' },
    { id: 'Tech', label: 'Tech & Code' },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES.slice(0, 8)
    : TEMPLATES.filter((t) => t.category.toLowerCase().includes(selectedCategory.toLowerCase()) || t.name.toLowerCase().includes(selectedCategory.toLowerCase())).slice(0, 8);

  const realFeatures = [
    {
      title: '50+ Designer Templates',
      desc: 'Choose from 50+ professionally engineered invoice styles spanning Minimalist, Corporate, Luxury, Bauhaus, and Cyberpunk.',
      icon: FileText,
      badge: '50+ Designs',
    },
    {
      title: 'Real-Time Side-by-Side Studio',
      desc: 'Edit form fields on the left with instantaneous calculations and see changes render live on the vector canvas on the right.',
      icon: SlidersHorizontal,
      badge: 'Instant Math',
    },
    {
      title: 'Digital Signature & Stamp',
      desc: 'Draw your signature directly on screen using the HTML5 signature pad and add authenticated company approval stamps.',
      icon: PenTool,
      badge: 'Draw & Stamp',
    },
    {
      title: 'Vector PDF & Instant Print',
      desc: 'Export high-DPI vector PDFs and trigger pixel-perfect system printing on standard A4 paper with zero layout distortion.',
      icon: Download,
      badge: 'High-DPI',
    },
    {
      title: 'Client CRM & Address Book',
      desc: 'Save recurring client companies, emails, phone numbers, and tax registration IDs for 1-click invoice auto-fill.',
      icon: Users,
      badge: '1-Click Autofill',
    },
    {
      title: 'Invoice History & Version Vault',
      desc: 'Save, search, filter, duplicate, and restore past invoices with live status tracking for Draft, Sent, Paid, and Overdue.',
      icon: Layers,
      badge: 'Full History',
    },
    {
      title: 'Business Revenue Analytics',
      desc: 'Monitor business health with real-time financial metrics: total revenue, collected cash, pending dues, and monthly graphs.',
      icon: BarChart3,
      badge: 'Live Metrics',
    },
    {
      title: '1-Click WhatsApp Sharing',
      desc: 'Generate executive formatted invoice breakdowns and launch WhatsApp with a single tap to send directly to clients.',
      icon: MessageCircle,
      badge: 'Direct Share',
    },
    {
      title: '11+ Global Currencies Engine',
      desc: 'Native support for Sri Lankan Rupee (LKR), USD ($), EUR (€), GBP (£), AUD, CAD, JPY, INR, SGD, AED, and CNY with auto-formatting.',
      icon: Coins,
      badge: 'Multi-Currency',
    },
    {
      title: 'Custom Branding & Watermark',
      desc: 'Upload your company logo, set custom invoice prefixes (e.g. INV-2026-), bank wire instructions, and remove watermarks in Pro.',
      icon: Sparkles,
      badge: 'Brand Control',
    },
  ];

  const faqs = [
    {
      q: 'What is PD Invoice?',
      a: 'PD Invoice is a modern, high-performance SaaS invoicing and business management platform developed under PD NETWORK. It allows businesses, agencies, and freelancers to generate pixel-perfect invoices, track revenue, manage clients, and export vector PDFs.',
    },
    {
      q: 'Is PD Invoice free to use?',
      a: 'Yes! The Free plan provides essential invoice creation (up to 5 invoices per day), access to standard templates, instant vector PDF downloads, and basic invoice status management with the "Made with PD Invoice" watermark.',
    },
    {
      q: 'What extra features come with the Pro version?',
      a: 'Pro unlocks unlimited daily invoice creation, removes all watermarks, provides full access to all 50+ templates, enables digital signature stamping, unlocks full revenue analytics dashboards, and provides priority WhatsApp assistance.',
    },
    {
      q: 'Can I download invoices as PDFs and print them?',
      a: 'Yes, absolutely. PD Invoice features a built-in high-DPI vector PDF rendering engine and a browser print pipeline formatted specifically for standard A4 portrait sheets with zero clipped margins.',
    },
    {
      q: 'How does the Client CRM (Address Book) work?',
      a: 'You can save your frequent clients with their contact person, email, physical billing address, phone, and tax number. When creating a new invoice, you can select any saved client to auto-fill the entire bill-to section in one click.',
    },
    {
      q: 'Can I access and duplicate my previous invoices?',
      a: 'Yes! All created invoices are securely stored in your personal History vault. You can search by invoice number or client name, filter by status (Draft, Sent, Paid, Overdue, Cancelled), and duplicate any past invoice to create a copy instantly.',
    },
    {
      q: 'Which currencies and taxes are supported?',
      a: 'PD Invoice natively supports Sri Lankan Rupee (LKR/Rs.) as well as USD ($), EUR (€), GBP (£), AUD, CAD, JPY, INR, SGD, AED, and CNY. You can customize tax percentages, line-item discounts, and flat shipping fees with instant calculations.',
    },
    {
      q: 'How does WhatsApp sharing work?',
      a: 'With one tap, PD Invoice generates a clean, readable text summary containing the invoice number, client name, total due, payment terms, and bank details, and opens WhatsApp with the message ready to send to your client.',
    },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAction = () => {
    if (currentUser && onGoToApp) {
      onGoToApp();
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-[#080D18] text-[#A7B0C0] font-jakarta selection:bg-[#526DFF] selection:text-white overflow-x-hidden">
      {/* =========================================================================
          PREMIUM FLOATING ROUNDED NAVIGATION BAR (No straight lines, rounded corners)
      ========================================================================= */}
      <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 max-w-6xl mx-auto w-full transition-all duration-300">
        <nav className="rounded-2xl sm:rounded-full bg-[#0D1526]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_45px_rgba(0,0,0,0.65)] px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 ring-1 ring-white/5 transition-all">
          {/* Logo & Product Brand Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="relative bg-white rounded-xl p-1.5 sm:p-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(88,111,255,0.4)]">
                <img
                  src="/assets/aistudio/image_e019301c.png"
                  alt="PD Invoice Logo"
                  className="h-6 w-auto object-contain block"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-outfit font-extrabold tracking-tight text-base sm:text-lg leading-tight group-hover:text-[#8294FF] transition-colors">
                    PD Invoice
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-md bg-[#586FFF]/15 border border-[#586FFF]/30 text-[9px] font-mono font-bold text-[#8294FF]">
                    SAAS
                  </span>
                </div>
                <span className="text-[10px] text-[#718BFF] font-mono tracking-wider font-semibold">
                  A PD NETWORK Product
                </span>
              </div>
            </button>
          </div>

          {/* Nav Links (Desktop Floating Island) */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#A5B1C7]">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Templates</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#586FFF]/25 text-[#8294FF] border border-[#586FFF]/40 font-mono font-bold">
                50+
              </span>
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              FAQ
            </button>
          </div>

          {/* Right CTA Actions */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToApp}
                  className="relative group/btn overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#586FFF] to-[#4259e8] hover:from-[#677dff] hover:to-[#5066f0] text-white font-outfit font-bold text-xs sm:text-sm shadow-lg shadow-[#586FFF]/30 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onSignIn}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#A5B1C7] hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="relative group/btn overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#586FFF] to-[#4056E0] hover:from-[#677dff] hover:to-[#5066f0] text-white font-outfit font-bold text-xs sm:text-sm shadow-lg shadow-[#586FFF]/30 border border-[#8294FF]/30 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Get Started Free</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            {currentUser && (
              <button
                onClick={onGoToApp}
                className="px-3 py-1.5 rounded-full bg-[#586FFF] text-white text-xs font-bold font-outfit"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white rounded-xl bg-[#141E30] border border-white/10 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Floating Rounded Card */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl bg-[#0D1526]/98 border border-white/15 p-5 space-y-2.5 backdrop-blur-2xl animate-fadeIn shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
            <button
              onClick={() => scrollToSection('features')}
              className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl bg-white/[0.03] text-sm font-semibold text-neutral-200 hover:text-[#526DFF] transition-colors"
            >
              <span>Features</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl bg-white/[0.03] text-sm font-semibold text-neutral-200 hover:text-[#526DFF] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>50+ Templates Showcase</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#586FFF]/30 text-[#8294FF] font-bold">PRO</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl bg-white/[0.03] text-sm font-semibold text-neutral-200 hover:text-[#526DFF] transition-colors"
            >
              <span>How It Works</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl bg-white/[0.03] text-sm font-semibold text-neutral-200 hover:text-[#526DFF] transition-colors"
            >
              <span>Pricing &amp; Plans</span>
              <span className="text-[10px] text-amber-300 font-mono">From LKR 250</span>
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl bg-white/[0.03] text-sm font-semibold text-neutral-200 hover:text-[#526DFF] transition-colors"
            >
              <span>Frequently Asked Questions</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onGoToApp) onGoToApp();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#586FFF] to-[#4056E0] text-white font-bold text-sm shadow-lg shadow-[#586FFF]/30 flex items-center justify-center gap-2 cursor-pointer font-outfit"
                >
                  <span>Open Invoice Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignIn();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#141E30] text-white font-semibold text-sm border border-white/10 cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGetStarted();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#586FFF] to-[#4056E0] text-white font-bold text-sm shadow-lg shadow-[#586FFF]/30 flex items-center justify-center gap-2 cursor-pointer font-outfit"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Get Started Free</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION
      ========================================================================= */}
      <section className="relative pt-8 sm:pt-16 pb-20 sm:pb-28 overflow-hidden">
        {/* Soft Breathing Ambient Aurora Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-gradient-to-tr from-[#526DFF]/20 via-[#8294FF]/10 to-transparent blur-[140px] sm:blur-[180px] rounded-full pointer-events-none animate-pulse-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101827]/80 border border-white/15 text-xs sm:text-sm font-medium text-[#8294FF] mb-6 sm:mb-8 backdrop-blur-md shadow-lg shadow-[#586FFF]/10">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-outfit tracking-wide">Designed for modern businesses · 50+ Designer Templates</span>
          </div>

          {/* Main Headline with font-outfit and flowing gradient */}
          <h1 className="font-outfit text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.08]">
            Your Business. Your Invoices.{' '}
            <span className="bg-gradient-to-r from-[#586FFF] via-[#8294FF] to-[#38BDF8] bg-clip-text text-transparent animate-gradient-flow inline-block">
              All Under Control.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 sm:mt-7 text-base sm:text-xl text-[#A5B1C7] max-w-2xl mx-auto font-normal leading-relaxed">
            Create professional invoices, manage customers, track payments and understand your business performance — all from one simple platform.
          </p>

          {/* Hero CTAs with high-end button effects */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <button
              onClick={handleAction}
              className="w-full sm:w-auto relative group/btn overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-[#586FFF] via-[#4d66f5] to-[#4056E0] text-white font-outfit font-extrabold text-sm sm:text-base shadow-[0_4px_24px_rgba(88,111,255,0.4)] hover:shadow-[0_8px_40px_rgba(88,111,255,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-[#8294FF]/40"
            >
              {/* Shimmer light sweep reflection */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{currentUser ? 'Open Invoice Studio' : 'Start for Free'}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-outfit font-semibold text-sm sm:text-base border border-white/10 hover:border-[#586FFF]/50 hover:shadow-[0_4px_20px_rgba(88,111,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore 50+ Templates</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#586FFF]/20 text-[#8294FF] font-mono font-bold">
                LIVE
              </span>
            </button>
          </div>

          {/* Showcase Tabs with < and > marks */}
          <div className="mt-14 sm:mt-16 max-w-3xl mx-auto px-2">
            <HorizontalScrollContainer
              alwaysShowArrows={true}
              arrowSize="sm"
              scrollAmount={200}
              contentClassName="justify-center gap-1.5 sm:gap-2 px-1"
            >
              {[
                { id: 'dashboard', label: 'Revenue Dashboard', icon: BarChart3 },
                { id: 'studio', label: 'Side-by-Side Studio', icon: SlidersHorizontal },
                { id: 'templates', label: '50+ Templates', icon: FileText },
                { id: 'crm', label: 'Client CRM', icon: Users },
                { id: 'signature', label: 'Signature & Stamp', icon: PenTool },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeShowcaseTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcaseTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#526DFF] text-white shadow-md shadow-[#526DFF]/30 ring-1 ring-[#718BFF]/50'
                        : 'bg-white/5 text-[#A7B0C0] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </HorizontalScrollContainer>
          </div>

          {/* Interactive Showcase Mockup Container with Floating Micro-UI Badges */}
          <div className="mt-8 relative max-w-5xl mx-auto">
            {/* Floating Badge 1 (Left - Animated Float) */}
            <div className="hidden xl:flex items-center gap-3 p-3 px-4 rounded-2xl bg-[#0D1526]/95 border border-white/15 shadow-[0_16px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl absolute -left-12 top-20 z-20 animate-float-slow ring-1 ring-white/10 text-left pointer-events-none">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm">
                ✓
              </div>
              <div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold">STATUS: PAID IN FULL</div>
                <div className="text-xs font-bold text-white font-outfit">INV-2026-9812 · Rs. 485,250</div>
              </div>
            </div>

            {/* Floating Badge 2 (Right - Animated Float Delayed) */}
            <div className="hidden xl:flex items-center gap-3 p-3 px-4 rounded-2xl bg-[#0D1526]/95 border border-white/15 shadow-[0_16px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl absolute -right-12 bottom-24 z-20 animate-float-delayed ring-1 ring-white/10 text-left pointer-events-none">
              <div className="w-8 h-8 rounded-xl bg-[#586FFF]/20 text-[#8294FF] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#8294FF] font-bold">HIGH-DPI VECTOR ENGINE</div>
                <div className="text-xs font-bold text-white font-outfit">50+ Authentic Styles</div>
              </div>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 to-white/5 border border-white/15 shadow-2xl backdrop-blur-xl">
              <div className="bg-[#101827] rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-800 text-left">
                {/* Window Header */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="text-[11px] sm:text-xs font-mono text-neutral-400 truncate max-w-[180px] sm:max-w-none">
                  pdinvoice.ai.studio · {activeShowcaseTab.toUpperCase()}
                </div>
                <div className="text-[10px] sm:text-xs text-[#8294FF] font-semibold flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#586FFF] animate-pulse inline-block" />
                  <span>Illustrative Sample Data · Live App Interface</span>
                </div>
              </div>

              {/* TAB 1: Financial Dashboard */}
              {activeShowcaseTab === 'dashboard' && (
                <div className="p-4 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[11px] sm:text-xs text-neutral-400">Total Revenue</div>
                      <div className="text-lg sm:text-2xl font-bold text-white mt-1">Rs. 485,250.00</div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 font-semibold">＋ 18.4% this month</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[11px] sm:text-xs text-neutral-400">Invoices Issued</div>
                      <div className="text-lg sm:text-2xl font-bold text-white mt-1">142 Invoices</div>
                      <div className="text-[10px] sm:text-[11px] text-[#718BFF] mt-1 font-semibold">50+ Templates active</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[11px] sm:text-xs text-neutral-400">Collected Payments</div>
                      <div className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1">Rs. 410,000.00</div>
                      <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">88% Paid ratio</div>
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                      <div className="text-[11px] sm:text-xs text-neutral-400">Pending Dues</div>
                      <div className="text-lg sm:text-2xl font-bold text-amber-400 mt-1">Rs. 75,250.00</div>
                      <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-1">Due within 14 days</div>
                    </div>
                  </div>

                  {/* Monthly Chart and Recent Invoices */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 p-4 sm:p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xs sm:text-sm font-bold text-white">Monthly Revenue Performance</div>
                        <span className="text-[10px] sm:text-xs bg-[#526DFF]/20 text-[#718BFF] px-2 py-0.5 rounded-lg font-mono">
                          LKR Analytics
                        </span>
                      </div>
                      <div className="h-28 sm:h-36 flex items-end gap-2 sm:gap-3 pt-4 border-b border-neutral-800">
                        {[40, 65, 55, 80, 95, 85, 100, 90, 75, 85, 95, 110].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#526DFF] to-[#718BFF] rounded-t-md transition-all hover:opacity-100 opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-[11px] text-neutral-500 pt-2 font-mono">
                        <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                      <div className="text-xs sm:text-sm font-bold text-white">Recent Invoices</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                          <div>
                            <div className="font-semibold text-white">INV-2026-9812</div>
                            <div className="text-[11px] text-neutral-400">Acme Technologies</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">PAID</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                          <div>
                            <div className="font-semibold text-white">INV-2026-9811</div>
                            <div className="text-[11px] text-neutral-400">Nexus Studios Ltd</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">PENDING</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                          <div>
                            <div className="font-semibold text-white">INV-2026-9810</div>
                            <div className="text-[11px] text-neutral-400">Vanguard Logistics</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">PAID</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Side-by-Side Studio */}
              {activeShowcaseTab === 'studio' && (
                <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Mock Editor */}
                  <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Invoice Parameters</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Auto-Calculated</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Invoice Number &amp; Currency</label>
                        <div className="flex gap-2">
                          <input readOnly value="INV-2026-8492" className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs font-mono" />
                          <span className="px-2.5 py-1.5 bg-neutral-800 rounded-lg text-amber-400 font-bold text-xs">LKR (Rs.)</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Client Name</label>
                        <input readOnly value="Hyperion Media Group" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Line Items</label>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center bg-neutral-950 p-2 rounded-lg text-[11px]">
                            <span>Brand Identity System</span>
                            <span className="font-mono text-white">Rs. 85,000</span>
                          </div>
                          <div className="flex justify-between items-center bg-neutral-950 p-2 rounded-lg text-[11px]">
                            <span>Full-Stack SaaS Development</span>
                            <span className="font-mono text-white">Rs. 150,000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Mock Canvas Preview */}
                  <div className="p-4 sm:p-5 rounded-xl bg-white text-neutral-900 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
                        <div>
                          <div className="font-black text-sm text-neutral-950">PD NETWORK</div>
                          <div className="text-[10px] text-neutral-500">Colombo, Sri Lanka</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">INVOICE</div>
                          <div className="text-xs font-black text-indigo-600">INV-2026-8492</div>
                        </div>
                      </div>
                      <div className="mt-3 text-[11px] space-y-1">
                        <div className="text-neutral-500 text-[10px]">BILLED TO:</div>
                        <div className="font-bold text-neutral-800">Hyperion Media Group</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-neutral-200 flex justify-between items-end">
                      <div className="text-[10px] text-neutral-400 font-mono">STATUS: PENDING</div>
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-500">TOTAL DUE</div>
                        <div className="text-base font-black text-neutral-950">Rs. 235,000.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 50+ Templates Showcase */}
              {activeShowcaseTab === 'templates' && (
                <div className="p-4 sm:p-8 space-y-4">
                  <div className="text-xs text-neutral-400 flex items-center justify-between">
                    <span>Selected from over 50 built-in templates</span>
                    <button onClick={() => scrollToSection('templates')} className="text-[#718BFF] font-bold hover:underline cursor-pointer">
                      View all 50+ templates &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TEMPLATES.slice(0, 4).map((tmpl) => (
                      <div key={tmpl.id} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#718BFF] font-bold">
                            {tmpl.category}
                          </span>
                          <div className="font-bold text-white text-xs mt-2">{tmpl.name}</div>
                          <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">{tmpl.description}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] text-amber-400 font-mono">
                          {tmpl.isPro ? '★ Pro Template' : '✓ Free Template'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Client CRM */}
              {activeShowcaseTab === 'crm' && (
                <div className="p-4 sm:p-8 space-y-4">
                  <div className="text-xs text-neutral-400">
                    Built-in Address Book allows instant 1-click client loading:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Acme International', email: 'billing@acme.com', city: 'Colombo 03', tax: 'VAT-982182' },
                      { name: 'Nexus Studios LLC', email: 'accounts@nexus.io', city: 'Kandy, SL', tax: 'TIN-482910' },
                      { name: 'Vanguard Global Corp', email: 'finance@vanguard.lk', city: 'Galle, SL', tax: 'VAT-102938' },
                    ].map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{c.name}</span>
                          <span className="text-[9px] bg-[#526DFF]/20 text-[#718BFF] px-1.5 py-0.5 rounded">Saved CRM</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">{c.email}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{c.city} · {c.tax}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Signature & Stamp */}
              {activeShowcaseTab === 'signature' && (
                <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <span className="text-xs font-bold text-white">Draw Signature on Screen</span>
                    <div className="h-28 rounded-lg bg-neutral-950 border border-dashed border-neutral-700 flex items-center justify-center text-xs text-neutral-500 font-serif italic text-lg text-indigo-300">
                      Authorized Signatory
                    </div>
                    <div className="text-[10px] text-neutral-400">Captured in real-time vector format with zero pixelation.</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <span className="text-xs font-bold text-white">Official Approval Stamp</span>
                    <div className="h-28 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                      <div className="border-2 border-emerald-500/80 rounded-xl px-4 py-2 text-center text-emerald-400 rotate-[-4deg]">
                        <div className="text-[10px] font-black tracking-widest uppercase">OFFICIALLY APPROVED</div>
                        <div className="text-[9px] font-mono">PD INVOICE VERIFIED</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-neutral-400">Included on high-DPI vector PDF exports.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* =========================================================================
          VERIFIED STATISTICS SECTION (Rounded Island Container, No Straight Screen Lines)
      ========================================================================= */}
      <section className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0D1526]/80 border border-white/10 p-6 sm:p-10 backdrop-blur-xl shadow-xl ring-1 ring-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-2 transition-transform hover:-translate-y-1 duration-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-outfit tracking-tight">50+</div>
              <div className="text-xs sm:text-sm text-[#A7B0C0] mt-1.5 font-medium">Designer Templates</div>
            </div>
            <div className="p-2 transition-transform hover:-translate-y-1 duration-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-outfit tracking-tight">11+</div>
              <div className="text-xs sm:text-sm text-[#A7B0C0] mt-1.5 font-medium">Global Currencies (LKR Native)</div>
            </div>
            <div className="p-2 transition-transform hover:-translate-y-1 duration-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 font-outfit tracking-tight">Fast</div>
              <div className="text-xs sm:text-sm text-[#A7B0C0] mt-1.5 font-medium">Vector PDF &amp; Print Engine</div>
            </div>
            <div className="p-2 transition-transform hover:-translate-y-1 duration-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#718BFF] font-outfit tracking-tight">100%</div>
              <div className="text-xs sm:text-sm text-[#A7B0C0] mt-1.5 font-medium">Secure Encrypted Cloud</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES SECTION (STRICTLY REAL FEATURES ONLY)
      ========================================================================= */}
      <section id="features" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#526DFF]/15 text-[#718BFF] text-xs font-bold font-mono uppercase tracking-wider mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything Your Business Needs. In One Place.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A7B0C0] leading-relaxed">
            Every feature shown here is genuinely built into PD Invoice to streamline your client invoicing and accounting workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {realFeatures.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-[#101827] border border-white/10 hover:border-[#526DFF]/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#526DFF]/15 text-[#718BFF] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 group-hover:text-white transition-colors">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#718BFF] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          50+ TEMPLATE SHOWCASE SECTION (Soft Rounded Aesthetics, No Straight Lines)
      ========================================================================= */}
      <section id="templates" className="py-20 sm:py-28 relative overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#586FFF]/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider mb-3">
                Massive Template Gallery
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-outfit">
                50+ Ways to Make Your Business Look Professional.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#A7B0C0] max-w-xl leading-relaxed">
                Choose from modern, corporate, luxury, cyberpunk, and technical designs tailored for every business.
              </p>
            </div>
            <button
              onClick={handleAction}
              className="relative group/btn overflow-hidden px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#586FFF] to-[#4056E0] text-white font-outfit font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(88,111,255,0.35)] hover:shadow-[0_8px_30px_rgba(88,111,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 self-start md:self-auto flex items-center gap-2 border border-[#8294FF]/30"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <span>Open Template Studio</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

          {/* Category Filter Pills (Scrollable with < and > marks) */}
          <div className="mb-8">
            <HorizontalScrollContainer
              arrowSize="sm"
              scrollAmount={200}
              contentClassName="gap-2 pb-2"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#526DFF] text-white shadow-md'
                      : 'bg-white/5 text-[#A7B0C0] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </HorizontalScrollContainer>
          </div>

          {/* Responsive Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-5 rounded-2xl bg-[#101827] border border-white/10 hover:border-[#526DFF] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-[#718BFF] font-bold">
                      {tmpl.category}
                    </span>
                    {tmpl.isPro ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        FREE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#718BFF] transition-colors">{tmpl.name}</h3>
                  <p className="text-xs text-[#A7B0C0] mt-1.5 line-clamp-2">{tmpl.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-mono text-[11px] truncate max-w-[120px]">{tmpl.tagline}</span>
                  <button
                    onClick={handleAction}
                    className="text-[#718BFF] font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    Select &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (3-STEP WORKFLOW)
      ========================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold font-mono uppercase tracking-wider mb-4">
            Intuitive Experience
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Simple 3-Step Invoicing Workflow
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A7B0C0]">
            Generate and dispatch pristine financial documents in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#101827] border border-white/10 text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#526DFF] text-white font-extrabold flex items-center justify-center mx-auto mb-6 font-mono text-sm shadow-md shadow-[#526DFF]/30">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select Your Template</h3>
            <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
              Choose from 50+ designs, add your business name, logo, currency (LKR/USD/EUR), and bank transfer details.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#101827] border border-white/10 text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#526DFF] text-white font-extrabold flex items-center justify-center mx-auto mb-6 font-mono text-sm shadow-md shadow-[#526DFF]/30">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Add Items &amp; Client</h3>
            <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
              Auto-fill from saved CRM clients, enter line items with live automatic tax, discount, and shipping calculations.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#101827] border border-white/10 text-center relative">
            <div className="w-12 h-12 rounded-full bg-[#526DFF] text-white font-extrabold flex items-center justify-center mx-auto mb-6 font-mono text-sm shadow-md shadow-[#526DFF]/30">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Export, Share &amp; Track</h3>
            <p className="text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
              Download crisp vector PDFs, print A4 sheets, dispatch instant WhatsApp summaries, and monitor paid revenue.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING SECTION
      ========================================================================= */}
      <section id="pricing" className="py-20 sm:py-28 bg-[#0c1222]/40 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#526DFF]/15 text-[#718BFF] text-xs font-bold font-mono uppercase tracking-wider mb-4">
              Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Simple Pricing. Powerful Business Tools.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#A7B0C0]">
              Transparent plans tailored for Sri Lankan &amp; global businesses, freelancers, and enterprises.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center gap-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-[#526DFF] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-[#526DFF] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  20% OFF
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Free Plan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#101827] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#718BFF] font-bold">Free Tier</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">Rs. 0</span>
                  <span className="text-xs sm:text-sm text-[#A7B0C0]">/ month</span>
                </div>
                <p className="text-xs text-[#A7B0C0] mt-2">Essential invoicing for independent beginners.</p>

                <div className="mt-8 space-y-3 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 5 invoices created per day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Free template library access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High-DPI vector PDF downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>A4 Browser system printing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>"Made with PD Invoice" watermark</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAction}
                className="mt-8 w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Starter Plan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#101827] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Starter Plan</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingCycle === 'annual' ? 'Rs. 390' : 'Rs. 490'}
                  </span>
                  <span className="text-xs sm:text-sm text-[#A7B0C0]">/ month</span>
                </div>
                <p className="text-xs text-[#A7B0C0] mt-2">For growing freelancers and boutique studios.</p>

                <div className="mt-8 space-y-3 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Expanded template collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Customer CRM address book</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Duplicate and restore past invoices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom business branding &amp; logo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>High-DPI PDF &amp; PNG exports</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAction}
                className="mt-8 w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/25 transition-colors cursor-pointer"
              >
                Select Starter
              </button>
            </div>

            {/* Professional Plan (Most Popular) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#152033] to-[#101827] border-2 border-[#526DFF] flex flex-col justify-between relative shadow-2xl shadow-[#526DFF]/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#526DFF] text-white font-extrabold text-[10px] uppercase tracking-widest rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#718BFF] font-bold">Professional Tier</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingCycle === 'annual' ? 'Rs. 790' : 'Rs. 990'}
                  </span>
                  <span className="text-xs sm:text-sm text-[#A7B0C0]">/ month</span>
                </div>
                <p className="text-xs text-[#A7B0C0] mt-2">Unlimited power for established companies &amp; agencies.</p>

                <div className="mt-8 space-y-3 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 50+ Pro templates completely unlocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited daily invoices (Zero watermark)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full business revenue &amp; payment analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Digital signature pad &amp; official stamp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority WhatsApp support (0719891483)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAction}
                className="mt-8 w-full relative group/btn overflow-hidden py-3.5 rounded-xl bg-gradient-to-r from-[#586FFF] to-[#4056E0] text-white font-outfit font-bold text-xs shadow-lg shadow-[#586FFF]/30 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 border border-[#8294FF]/30"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Get Professional</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION
      ========================================================================= */}
      <section id="faq" className="py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold font-mono uppercase tracking-wider mb-4">
            Answers &amp; Help
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A7B0C0]">
            Everything you need to know about PD Invoice and our billing tools.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#101827] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left font-bold text-white text-xs sm:text-base flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 sm:w-5 h-4 sm:h-5 text-[#718BFF] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-sm text-[#A7B0C0] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERTING CTA SECTION (Rounded Card Island, No Straight Edge)
      ========================================================================= */}
      <section className="py-12 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden text-center bg-gradient-to-b from-[#141E30] to-[#0D1526] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[#586FFF]/15 blur-[100px] pointer-events-none rounded-full" />

          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight font-outfit">
              Ready to Make Your Business More Professional?
            </h2>
            <p className="mt-4 text-sm sm:text-lg text-[#A5B1C7] max-w-xl mx-auto leading-relaxed">
              Start creating beautiful invoices and managing your business with PD Invoice today. No credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <button
                onClick={handleAction}
                className="w-full sm:w-auto relative group/btn overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-[#586FFF] to-[#4056E0] text-white font-outfit font-extrabold text-sm sm:text-base shadow-[0_4px_24px_rgba(88,111,255,0.4)] hover:shadow-[0_8px_40px_rgba(88,111,255,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#8294FF]/40"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
              <button
                onClick={() => {
                  if (currentUser && onGoToApp) onGoToApp();
                  else onSignIn();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-outfit font-semibold text-sm sm:text-base border border-white/10 hover:border-[#586FFF]/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROFESSIONAL MULTI-COLUMN FOOTER
      ========================================================================= */}
      <footer className="bg-[#050810] border-t border-white/10 text-[#A7B0C0] text-xs py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1.5">
                <img
                  src="/assets/aistudio/image_e019301c.png"
                  alt="PD Invoice Logo"
                  className="h-6 w-auto object-contain block"
                />
              </div>
              <span className="text-white font-bold text-sm">PD Invoice</span>
            </div>
            <p className="text-[#A7B0C0] leading-relaxed">
              Professional invoicing and business management, made simple. Designed for modern commerce under PD NETWORK.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-mono">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection('templates')} className="hover:text-white transition-colors cursor-pointer">50+ Templates</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing &amp; Plans</button></li>
              <li><button onClick={handleAction} className="hover:text-white transition-colors cursor-pointer">Studio Dashboard</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-mono">Company</h4>
            <ul className="space-y-2">
              <li><span className="text-neutral-400">About PD Invoice</span></li>
              <li><a href="https://wa.me/94719891483" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">PD NETWORK Official</a></li>
              <li><a href="mailto:support@pdinvoice.ai.studio" className="hover:text-white transition-colors">Direct Support</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider font-mono">Legal &amp; Trust</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer">Help Center</button></li>
              <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer">Terms &amp; Security</button></li>
              <li><span className="text-neutral-400">Enterprise Cloud Encrypted</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-neutral-500 gap-3">
          <div>&copy; 2026 PD Invoice. A PD NETWORK Product. All rights reserved.</div>
          <div className="font-mono text-[11px] text-neutral-400">Crafted with international SaaS precision.</div>
        </div>
      </footer>
    </div>
  );
};
