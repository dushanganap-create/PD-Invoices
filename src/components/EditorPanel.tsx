import React, { useState } from 'react';
import {
  Building2,
  User,
  FileText,
  ListPlus,
  CreditCard,
  Palette,
  SlidersHorizontal,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Hash,
  Percent,
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  Download,
  Printer,
  Calendar,
  Share2,
  HelpCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Crown,
} from 'lucide-react';
import { Invoice, LineItem, CurrencyCode } from '../types/invoice';
import { UserProfile } from '../types/auth';
import { CURRENCIES, formatCurrency } from '../utils/currency';
import { calculateInvoice } from '../utils/calculations';
import { TEMPLATES } from '../data/templateList';
import { SignaturePad } from './SignaturePad';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface EditorPanelProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  onOpenTemplates: () => void;
  onOpenClients?: () => void;
  onQuickPdf?: () => void;
  onDuplicate?: () => void;
  onPrint?: () => void;
  onOpenProProfile?: () => void;
  currentUser?: UserProfile | null;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  invoice,
  onChange,
  onOpenTemplates,
  onOpenClients,
  onQuickPdf,
  onDuplicate,
  onPrint,
  onOpenProProfile,
  currentUser,
}) => {
  // Step-based workflow: 1 to 6 or 'all'
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSinglePageView, setIsSinglePageView] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const calc = calculateInvoice(invoice);
  const currentTemplate = TEMPLATES.find((t) => t.id === invoice.templateId) || TEMPLATES[0];

  // Helper updates
  const updateInvoice = (field: keyof Invoice, value: any) => {
    onChange({
      ...invoice,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateNested = (
    parent: 'company' | 'client' | 'pricing' | 'payment' | 'theme',
    field: string,
    value: any
  ) => {
    onChange({
      ...invoice,
      [parent]: {
        ...(invoice[parent] as any),
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAutofillFromProProfile = () => {
    const pro = currentUser?.proProfile;
    if (!pro) {
      if (onOpenProProfile) onOpenProProfile();
      return;
    }

    onChange({
      ...invoice,
      company: {
        ...invoice.company,
        name: pro.tradingName || pro.legalName || invoice.company.name,
        logoUrl: pro.logoUrl || invoice.company.logoUrl,
        email: pro.email || invoice.company.email,
        phone: pro.phone || invoice.company.phone,
        website: pro.website || invoice.company.website,
        address: pro.address || invoice.company.address,
        city: pro.city || invoice.company.city,
        state: pro.state || invoice.company.state,
        postalCode: pro.postalCode || invoice.company.postalCode,
        country: pro.country || invoice.company.country,
        taxId: pro.taxId || invoice.company.taxId,
      },
      payment: {
        ...invoice.payment,
        bankName: pro.bankName || invoice.payment.bankName,
        accountName: pro.accountName || invoice.payment.accountName,
        accountNumber: pro.accountNumber || invoice.payment.accountNumber,
        routingOrSwift: pro.swiftBic || pro.routingNumber || invoice.payment.routingOrSwift,
        paymentLink: pro.paymentLink || invoice.payment.paymentLink,
      },
      signature: {
        ...invoice.signature,
        typedName: pro.signatoryName || invoice.signature.typedName,
        signatoryTitle: pro.signatoryTitle || invoice.signature.signatoryTitle,
        dataUrl: pro.signatureDataUrl || invoice.signature.dataUrl,
        type: pro.signatureType || invoice.signature.type,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Line item helpers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: 'Professional Consulting / Development Services',
      sku: '',
      quantity: 1,
      unitPrice: 150,
      discountPercent: 0,
      taxPercent: 0,
    };
    updateInvoice('items', [...invoice.items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    updateInvoice('items', updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) return;
    const updated = invoice.items.filter((_, idx) => idx !== index);
    updateInvoice('items', updated);
  };

  const handleDuplicateItem = (index: number) => {
    const target = invoice.items[index];
    const duplicated: LineItem = {
      ...target,
      id: `item-${Date.now()}`,
      description: `${target.description} (Copy)`,
    };
    const updated = [...invoice.items];
    updated.splice(index + 1, 0, duplicated);
    updateInvoice('items', updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === invoice.items.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...invoice.items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateInvoice('items', updated);
  };

  // Generate next random invoice number
  const randomizeInvoiceNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = invoice.invoiceNumber.split('-')[0] || 'INV';
    updateInvoice('invoiceNumber', `${prefix}-2026-${randomNum}`);
  };

  // Quick summary copy
  const handleCopySummary = async () => {
    const summaryText = `📄 INVOICE #${invoice.invoiceNumber}\nClient: ${invoice.client.name}\nTotal: ${formatCurrency(calc.total, invoice.currency)}\nDue: ${invoice.dueDate}\nStatus: ${invoice.status.toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (e) {}
  };

  // Calculate workflow completion progress
  const stepChecks = [
    Boolean(invoice.company.name && invoice.company.email),
    Boolean(invoice.client.name),
    Boolean(invoice.invoiceNumber && invoice.issueDate && invoice.dueDate),
    Boolean(invoice.items.length > 0 && invoice.items[0].description),
    Boolean(invoice.payment.bankName || invoice.payment.paymentLink || invoice.notes),
    Boolean(invoice.templateId),
  ];
  const completedCount = stepChecks.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  const stepsConfig = [
    {
      num: 1,
      title: 'Business Details',
      desc: 'Company name, logo, contact & tax ID',
      icon: Building2,
      isDone: stepChecks[0],
    },
    {
      num: 2,
      title: 'Customer Details',
      desc: 'Client info, address & CRM lookup',
      icon: User,
      isDone: stepChecks[1],
    },
    {
      num: 3,
      title: 'Invoice Information',
      desc: 'Invoice #, dates, currency & terms',
      icon: FileText,
      isDone: stepChecks[2],
    },
    {
      num: 4,
      title: 'Products & Services',
      desc: 'Line items, rates, tax & discounts',
      icon: ListPlus,
      isDone: stepChecks[3],
    },
    {
      num: 5,
      title: 'Payment & Signature',
      desc: 'Bank wire, QR pay, notes & sign pad',
      icon: CreditCard,
      isDone: stepChecks[4],
    },
    {
      num: 6,
      title: 'Design & Finalize',
      desc: 'Template, fonts, PDF export & share',
      icon: Palette,
      isDone: stepChecks[5],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#080D19] text-[#F8FAFF] select-text">
      {/* =========================================================================
          STUDIO TOP HEADER: Template preview, progress & view mode toggle
      ========================================================================= */}
      <div className="px-4 py-3 bg-[#101827] border-b border-[#141E30] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
              style={{ backgroundColor: currentTemplate.accentHex }}
            />
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {currentTemplate.name}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#A5B1C7]">
            <span aria-hidden="true">·</span>
            <span>{currentTemplate.category}</span>
            {currentTemplate.isPro && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                PRO
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#141E30] rounded-xl border border-white/5 text-xs text-[#A5B1C7]">
            <span>{completedCount}/6 steps</span>
            <div className="w-16 h-1.5 bg-[#080D19] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#586FFF] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-[#8294FF]">{progressPercent}%</span>
          </div>

          {/* Single Page vs Step-by-Step Toggle */}
          <button
            onClick={() => setIsSinglePageView(!isSinglePageView)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSinglePageView
                ? 'bg-[#19253A] border-[#586FFF] text-white shadow-sm'
                : 'bg-[#141E30] border-white/10 text-[#A5B1C7] hover:text-white'
            }`}
            title="Toggle between 6-step guided wizard and full scrollable view"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSinglePageView ? 'Step Mode' : 'Single Page'}
            </span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="px-3 py-1.5 bg-[#586FFF] hover:bg-[#475ce6] text-white rounded-lg text-xs font-bold shadow-md shadow-[#586FFF]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>50+ Templates</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          STEP STEPPER RAIL: Clearly numbered steps (1 to 6) with < and > marks
      ========================================================================= */}
      {!isSinglePageView && (
        <div className="bg-[#101827]/60 border-b border-[#141E30] px-2 sm:px-3 py-2 shrink-0">
          <HorizontalScrollContainer contentClassName="gap-1.5" arrowSize="xs">
            {stepsConfig.map((s) => {
              const isActive = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#586FFF] text-white font-bold shadow-md shadow-[#586FFF]/30 ring-1 ring-[#8294FF]/50'
                      : s.isDone
                      ? 'bg-[#141E30] text-emerald-400 hover:bg-[#19253A] border border-emerald-500/20'
                      : 'bg-[#141E30]/70 text-[#A5B1C7] hover:text-white hover:bg-[#141E30]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white text-[#080D19]'
                        : s.isDone
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'bg-[#19253A] text-[#A5B1C7]'
                    }`}
                  >
                    {s.isDone && !isActive ? '✓' : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </HorizontalScrollContainer>
        </div>
      )}

      {/* =========================================================================
          CENTRAL INVOICE EDITING WORKSPACE
      ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* =====================================================================
            STEP 1: BUSINESS DETAILS
        ===================================================================== */}
        {(isSinglePageView || currentStep === 1) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Business Details</h3>
                  <p className="text-xs text-[#A5B1C7]">Your company name, branding, and contact address</p>
                </div>
              </div>
              <span className="text-xs text-[#A5B1C7]">Step 1 of 6</span>
            </div>

            {/* Pro Profile Autofill Quick Action */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#141E30] to-purple-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser?.proProfile?.tradingName || currentUser?.proProfile?.legalName
                      ? `Pro Profile: ${currentUser?.proProfile?.tradingName || currentUser?.proProfile?.legalName}`
                      : 'Pro Business Profile Studio'}
                  </div>
                  <div className="text-[10px] text-[#A5B1C7] truncate">
                    {currentUser?.proProfile
                      ? 'One-click load: logo, tax ID, wire details & signature'
                      : 'Save your business credentials & defaults to the cloud'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {currentUser?.proProfile ? (
                  <button
                    type="button"
                    onClick={handleAutofillFromProProfile}
                    className="px-2.5 py-1.5 bg-[#586FFF] hover:bg-[#475ce6] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill</span>
                  </button>
                ) : null}
                {onOpenProProfile && (
                  <button
                    type="button"
                    onClick={onOpenProProfile}
                    className="px-2.5 py-1.5 bg-[#19253A] hover:bg-[#20314d] text-[#8294FF] rounded-lg text-xs font-semibold transition-all border border-indigo-500/25 cursor-pointer"
                  >
                    {currentUser?.proProfile ? 'Edit Profile' : 'Setup Profile'}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                  Company / Freelancer Name <span className="text-[#586FFF]">*</span>
                </label>
                <input
                  type="text"
                  value={invoice.company.name}
                  onChange={(e) => updateNested('company', 'name', e.target.value)}
                  placeholder="e.g. Acme Creative Studios Inc."
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] focus:ring-1 focus:ring-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Billing Email</label>
                  <input
                    type="email"
                    value={invoice.company.email}
                    onChange={(e) => updateNested('company', 'email', e.target.value)}
                    placeholder="billing@yourdomain.com"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={invoice.company.phone}
                    onChange={(e) => updateNested('company', 'phone', e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={invoice.company.address}
                  onChange={(e) => updateNested('company', 'address', e.target.value)}
                  placeholder="100 Silicon Boulevard, Suite 400"
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">City</label>
                  <input
                    type="text"
                    value={invoice.company.city}
                    onChange={(e) => updateNested('company', 'city', e.target.value)}
                    placeholder="San Francisco"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">State / Province</label>
                  <input
                    type="text"
                    value={invoice.company.state}
                    onChange={(e) => updateNested('company', 'state', e.target.value)}
                    placeholder="CA"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={invoice.company.postalCode}
                    onChange={(e) => updateNested('company', 'postalCode', e.target.value)}
                    placeholder="94105"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Tax / VAT / Business Reg ID
                  </label>
                  <input
                    type="text"
                    value={invoice.company.taxId}
                    onChange={(e) => updateNested('company', 'taxId', e.target.value)}
                    placeholder="e.g. VAT-US-892102"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Business Website</label>
                  <input
                    type="text"
                    value={invoice.company.website}
                    onChange={(e) => updateNested('company', 'website', e.target.value)}
                    placeholder="https://yourdomain.com"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Logo Image URL (Optional)</label>
                <input
                  type="text"
                  value={invoice.company.logoUrl || ''}
                  onChange={(e) => updateNested('company', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                />
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
                >
                  <span>Continue to Customer Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STEP 2: CUSTOMER DETAILS
        ===================================================================== */}
        {(isSinglePageView || currentStep === 2) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customer Details</h3>
                  <p className="text-xs text-[#A5B1C7]">Recipient contact, address and Purchase Order</p>
                </div>
              </div>

              {onOpenClients && (
                <button
                  type="button"
                  onClick={onOpenClients}
                  className="px-3 py-1.5 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#8294FF] hover:text-white border border-[#586FFF]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open Saved Address Book to select customer in 1 click"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Choose from Address Book</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Customer Full Name / Attention <span className="text-[#586FFF]">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoice.client.name}
                    onChange={(e) => updateNested('client', 'name', e.target.value)}
                    placeholder="e.g. Johnathan Vance"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Customer Company / Organization
                  </label>
                  <input
                    type="text"
                    value={invoice.client.company}
                    onChange={(e) => updateNested('client', 'company', e.target.value)}
                    placeholder="e.g. Nexus Global Enterprises"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Customer Email</label>
                  <input
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) => updateNested('client', 'email', e.target.value)}
                    placeholder="client.billing@nexus.com"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Customer Phone</label>
                  <input
                    type="text"
                    value={invoice.client.phone}
                    onChange={(e) => updateNested('client', 'phone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Billing Street Address</label>
                <input
                  type="text"
                  value={invoice.client.address}
                  onChange={(e) => updateNested('client', 'address', e.target.value)}
                  placeholder="742 Evergreen Terrace, Floor 12"
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">City</label>
                  <input
                    type="text"
                    value={invoice.client.city}
                    onChange={(e) => updateNested('client', 'city', e.target.value)}
                    placeholder="New York"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">State / Province</label>
                  <input
                    type="text"
                    value={invoice.client.state}
                    onChange={(e) => updateNested('client', 'state', e.target.value)}
                    placeholder="NY"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={invoice.client.postalCode}
                    onChange={(e) => updateNested('client', 'postalCode', e.target.value)}
                    placeholder="10001"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Purchase Order (PO) Number</label>
                <input
                  type="text"
                  value={invoice.client.poNumber || ''}
                  onChange={(e) => updateNested('client', 'poNumber', e.target.value)}
                  placeholder="e.g. PO-2026-9812"
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#A5B1C7]/40 outline-none"
                />
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#A5B1C7] hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
                >
                  <span>Continue to Invoice Info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STEP 3: INVOICE INFORMATION
        ===================================================================== */}
        {(isSinglePageView || currentStep === 3) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Invoice Information</h3>
                  <p className="text-xs text-[#A5B1C7]">Invoice identifier, currency, dates and status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={randomizeInvoiceNumber}
                className="text-xs text-[#8294FF] hover:text-white flex items-center gap-1 cursor-pointer font-medium"
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Randomize #</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Invoice Number <span className="text-[#586FFF]">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#A5B1C7]">
                      Currency <span className="text-[#586FFF]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => updateInvoice('currency', 'LKR')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        invoice.currency === 'LKR'
                          ? 'bg-amber-500 text-neutral-950 font-black ring-1 ring-amber-400'
                          : 'bg-[#141E30] text-amber-300 hover:bg-[#19253A] border border-amber-500/30'
                      }`}
                      title="Quick Set: Sri Lankan Rupee (LKR - Rs.)"
                    >
                      <span>🇱🇰 LKR (Rs.)</span>
                    </button>
                  </div>
                  <select
                    value={invoice.currency}
                    onChange={(e) => updateInvoice('currency', e.target.value as CurrencyCode)}
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-medium text-white outline-none cursor-pointer"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code === 'LKR' ? '★ 🇱🇰 ' : ''}{c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#A5B1C7]">Issue Date</label>
                    <button
                      type="button"
                      onClick={() => updateInvoice('issueDate', new Date().toISOString().split('T')[0])}
                      className="text-[10px] text-[#8294FF] hover:underline"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => updateInvoice('issueDate', e.target.value)}
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#A5B1C7]">Payment Due Date</label>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#8294FF]">
                      <button
                        type="button"
                        onClick={() =>
                          updateInvoice(
                            'dueDate',
                            new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
                          )
                        }
                        className="hover:underline"
                      >
                        +14d
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateInvoice(
                            'dueDate',
                            new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                          )
                        }
                        className="hover:underline"
                      >
                        +30d
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoice('dueDate', e.target.value)}
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Payment Terms</label>
                  <select
                    value={invoice.paymentTerms}
                    onChange={(e) => updateInvoice('paymentTerms', e.target.value)}
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 14 Days">Net 14 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="50% Upfront, 50% on Completion">50% Upfront, 50% Completion</option>
                    <option value="Custom Term">Custom Term</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Invoice Status</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['draft', 'pending', 'paid', 'overdue'] as Invoice['status'][]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateInvoice('status', st)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          invoice.status === st
                            ? st === 'paid'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : st === 'overdue'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : st === 'pending'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-neutral-600 text-white shadow-sm'
                            : 'bg-[#141E30] text-[#A5B1C7] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#A5B1C7] hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
                >
                  <span>Continue to Products & Services</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STEP 4: PRODUCTS & SERVICES (ITEMS & TOTALS)
        ===================================================================== */}
        {(isSinglePageView || currentStep === 4) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-5">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Products & Services ({invoice.items.length})
                  </h3>
                  <p className="text-xs text-[#A5B1C7]">Add line items, adjust rates, taxes, and discounts</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Quick Service Suggestions with < and > marks */}
            <HorizontalScrollContainer contentClassName="gap-1.5" arrowSize="xs" className="w-full">
              <span className="text-[10px] font-bold text-[#A5B1C7] uppercase font-mono tracking-wider shrink-0 mr-1">
                Quick Add:
              </span>
              {[
                { name: 'UI/UX Design & Architecture', price: 250 },
                { name: 'Full-Stack Web Development', price: 500 },
                { name: 'Strategic Business Consultation', price: 150 },
                { name: 'Monthly Maintenance Retainer', price: 350 },
                { name: 'Cloud Infrastructure Setup', price: 300 },
                { name: 'Cybersecurity Audit & Penetration Testing', price: 450 },
                { name: 'Technical SEO & Content Strategy', price: 200 },
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const newItem: LineItem = {
                      id: `item-${Date.now()}-${i}`,
                      description: sug.name,
                      sku: '',
                      quantity: 1,
                      unitPrice: sug.price,
                      discountPercent: 0,
                      taxPercent: 0,
                    };
                    updateInvoice('items', [...invoice.items, newItem]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#141E30] hover:bg-[#19253A] border border-[#19253A] hover:border-[#586FFF]/40 text-[11px] text-[#A5B1C7] hover:text-white transition-all whitespace-nowrap cursor-pointer shrink-0"
                >
                  + {sug.name}
                </button>
              ))}
            </HorizontalScrollContainer>

            {/* Line items list */}
            <div className="space-y-3.5">
              {invoice.items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <div
                    key={item.id || index}
                    className="p-4 bg-[#141E30] rounded-xl border border-[#19253A] hover:border-[#586FFF]/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#19253A] text-[10px] font-mono font-bold text-[#A5B1C7] flex items-center justify-center shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Item or service description (e.g. Website UI/UX Design)"
                          className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3 py-2 text-xs font-medium text-white placeholder-[#A5B1C7]/40 outline-none"
                        />
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-[#A5B1C7] hover:text-white disabled:opacity-20 rounded-lg hover:bg-[#19253A] cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === invoice.items.length - 1}
                          className="p-1.5 text-[#A5B1C7] hover:text-white disabled:opacity-20 rounded-lg hover:bg-[#19253A] cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(index)}
                          className="p-1.5 text-[#A5B1C7] hover:text-white rounded-lg hover:bg-[#19253A] cursor-pointer"
                          title="Duplicate Item"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={invoice.items.length <= 1}
                          className="p-1.5 text-[#A5B1C7] hover:text-rose-400 disabled:opacity-20 rounded-lg hover:bg-[#19253A] cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#A5B1C7] mb-1">Quantity</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-2.5 py-1.5 text-xs font-mono text-white text-right outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#A5B1C7] mb-1">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-2.5 py-1.5 text-xs font-mono text-white text-right outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#A5B1C7] mb-1">Disc %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || ''}
                          onChange={(e) => handleUpdateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-2.5 py-1.5 text-xs font-mono text-white text-right outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#A5B1C7] mb-1">Line Total</label>
                        <div className="px-2.5 py-1.5 bg-[#080D19] border border-[#19253A] rounded-xl text-xs font-mono font-bold text-emerald-400 text-right truncate">
                          {formatCurrency(itemTotal, invoice.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global Tax & Discount Settings */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tax Block */}
              <div className="p-4 bg-[#141E30] rounded-xl border border-[#19253A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#8294FF]" />
                    <span className="text-xs font-bold text-white">Global Tax Rate</span>
                  </div>
                  {calc.taxAmount > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{formatCurrency(calc.taxAmount, invoice.currency)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={invoice.pricing.taxName}
                    onChange={(e) => updateNested('pricing', 'taxName', e.target.value)}
                    placeholder="Tax Name (VAT, GST)"
                    className="bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={invoice.pricing.taxRate || ''}
                      onChange={(e) => updateNested('pricing', 'taxRate', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right outline-none"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-[#A5B1C7]">%</span>
                  </div>
                </div>
              </div>

              {/* Discount Block */}
              <div className="p-4 bg-[#141E30] rounded-xl border border-[#19253A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#8294FF]" />
                    <span className="text-xs font-bold text-white">Global Discount</span>
                  </div>
                  {calc.globalDiscountAmount > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      -{formatCurrency(calc.globalDiscountAmount, invoice.currency)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const curVal = invoice.pricing.discountValue ?? invoice.pricing.globalDiscountPercent ?? 0;
                      onChange({
                        ...invoice,
                        pricing: {
                          ...invoice.pricing,
                          discountType: 'percentage',
                          discountValue: curVal,
                          globalDiscountPercent: curVal,
                        },
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      (invoice.pricing.discountType || 'percentage') === 'percentage'
                        ? 'bg-[#586FFF] text-white'
                        : 'bg-[#101827] text-[#A5B1C7] hover:text-white'
                    }`}
                  >
                    Percent (%)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const curVal = invoice.pricing.discountValue ?? invoice.pricing.flatDiscount ?? 0;
                      onChange({
                        ...invoice,
                        pricing: {
                          ...invoice.pricing,
                          discountType: 'flat',
                          discountValue: curVal,
                          flatDiscount: curVal,
                        },
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      invoice.pricing.discountType === 'flat'
                        ? 'bg-[#586FFF] text-white'
                        : 'bg-[#101827] text-[#A5B1C7] hover:text-white'
                    }`}
                  >
                    Flat ({invoice.currency})
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      invoice.pricing.discountValue ??
                      (invoice.pricing.discountType === 'flat'
                        ? invoice.pricing.flatDiscount
                        : invoice.pricing.globalDiscountPercent) ??
                      ''
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onChange({
                        ...invoice,
                        pricing: {
                          ...invoice.pricing,
                          discountValue: val,
                          globalDiscountPercent:
                            (invoice.pricing.discountType || 'percentage') === 'percentage' ? val : 0,
                          flatDiscount: invoice.pricing.discountType === 'flat' ? val : 0,
                        },
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                    placeholder="0"
                    className="w-full bg-[#101827] border border-[#19253A] focus:border-[#586FFF] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right outline-none"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-[#A5B1C7]">
                    {invoice.pricing.discountType === 'flat' ? invoice.currency : '%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculations Total Card */}
            <div className="p-4 bg-[#080D19] rounded-xl border border-[#19253A] space-y-2 text-xs">
              <div className="flex justify-between text-[#A5B1C7]">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">{formatCurrency(calc.subtotal, invoice.currency)}</span>
              </div>
              {calc.globalDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Savings / Discount</span>
                  <span className="font-mono">-{formatCurrency(calc.globalDiscountAmount, invoice.currency)}</span>
                </div>
              )}
              {calc.taxAmount > 0 && (
                <div className="flex justify-between text-[#A5B1C7]">
                  <span>{invoice.pricing.taxName || 'Tax'} ({invoice.pricing.taxRate}%)</span>
                  <span className="font-mono text-white">+{formatCurrency(calc.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#141E30] flex justify-between text-sm font-bold text-white">
                <span>Grand Total Due</span>
                <span className="font-mono text-emerald-400 text-base">
                  {formatCurrency(calc.total, invoice.currency)}
                </span>
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#A5B1C7] hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
                >
                  <span>Continue to Payment & Signature</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STEP 5: ADDITIONAL INFORMATION & PAYMENT
        ===================================================================== */}
        {(isSinglePageView || currentStep === 5) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Payment & Signature</h3>
                  <p className="text-xs text-[#A5B1C7]">Bank wiring details, payment QR code, notes and digital signature</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Primary Payment Method</label>
                <select
                  value={invoice.payment.method}
                  onChange={(e) => updateNested('payment', 'method', e.target.value)}
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="bank">Bank Wire / ACH / Direct Deposit</option>
                  <option value="card">Credit Card / Stripe Portal</option>
                  <option value="crypto">Cryptocurrency (USDC / BTC / ETH)</option>
                  <option value="upi">Instant Pay / UPI</option>
                  <option value="custom">Custom Instructions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                  Online Payment / Checkout Link (Generates Live QR Code)
                </label>
                <input
                  type="text"
                  value={invoice.payment.paymentLink || ''}
                  onChange={(e) => updateNested('payment', 'paymentLink', e.target.value)}
                  placeholder="https://pay.stripe.com/... or your payment link"
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={invoice.payment.bankName}
                    onChange={(e) => updateNested('payment', 'bankName', e.target.value)}
                    placeholder="e.g. JPMorgan Chase Bank, N.A."
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    value={invoice.payment.accountName}
                    onChange={(e) => updateNested('payment', 'accountName', e.target.value)}
                    placeholder="e.g. Acme Creative Studios Inc."
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Account Number / IBAN</label>
                  <input
                    type="text"
                    value={invoice.payment.accountNumber}
                    onChange={(e) => updateNested('payment', 'accountNumber', e.target.value)}
                    placeholder="**** **** 4819"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Routing / SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={invoice.payment.routingOrSwift}
                    onChange={(e) => updateNested('payment', 'routingOrSwift', e.target.value)}
                    placeholder="CHASUS33"
                    className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#A5B1C7]/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Public Client Note</label>
                <textarea
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => updateInvoice('notes', e.target.value)}
                  placeholder="Thank you for your business! Please remit payment by the due date."
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={invoice.terms}
                  onChange={(e) => updateInvoice('terms', e.target.value)}
                  placeholder="Late payments may incur a 1.5% monthly financing surcharge."
                  className="w-full bg-[#141E30] border border-[#19253A] focus:border-[#586FFF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#A5B1C7]/40 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#141E30]">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                  Authorized Digital Signature
                </label>
                <SignaturePad
                  signature={invoice.signature}
                  onChange={(sig) => updateInvoice('signature', sig)}
                />
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#A5B1C7] hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
                >
                  <span>Continue to Design & Finalize</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STEP 6: DESIGN AND FINALIZE
        ===================================================================== */}
        {(isSinglePageView || currentStep === 6) && (
          <div className="bg-[#101827] rounded-2xl p-5 border border-[#19253A] space-y-5">
            <div className="flex items-center justify-between border-b border-[#141E30] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#586FFF]/15 text-[#8294FF] flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Design & Finalize</h3>
                  <p className="text-xs text-[#A5B1C7]">Choose from 50+ templates, select typography, and export</p>
                </div>
              </div>
            </div>

            {/* Template Selector Card */}
            <div className="p-4 bg-[#141E30] rounded-xl border border-[#19253A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                  style={{ backgroundColor: currentTemplate.accentHex }}
                >
                  {currentTemplate.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{currentTemplate.name}</span>
                    <span className="text-[10px] bg-[#19253A] text-[#8294FF] px-2 py-0.2 rounded-full font-mono">
                      {currentTemplate.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#A5B1C7] mt-0.5">{currentTemplate.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
                    updateInvoice('templateId', TEMPLATES[randomIndex].id);
                  }}
                  className="px-3 py-2 bg-[#19253A] hover:bg-[#1f2f49] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex-1 sm:flex-none text-center"
                  title="Randomize style"
                >
                  🎲 Shuffle
                </button>
                <button
                  type="button"
                  onClick={onOpenTemplates}
                  className="px-4 py-2 bg-[#586FFF] hover:bg-[#475ce6] text-white rounded-xl text-xs font-bold shadow-md shadow-[#586FFF]/25 transition-all cursor-pointer flex-1 sm:flex-none text-center"
                >
                  Browse 50+ Templates
                </button>
              </div>
            </div>

            {/* Font Family Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#A5B1C7] mb-2.5">
                Typography & Font Family
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'jakarta', name: 'Plus Jakarta Sans', fontClass: 'font-jakarta' },
                  { id: 'outfit', name: 'Outfit Modern', fontClass: 'font-outfit' },
                  { id: 'playfair', name: 'Playfair Display', fontClass: 'font-playfair' },
                  { id: 'cinzel', name: 'Cinzel Roman', fontClass: 'font-cinzel' },
                  { id: 'garamond', name: 'Cormorant Serif', fontClass: 'font-garamond' },
                  { id: 'jetbrains', name: 'JetBrains Mono', fontClass: 'font-jetbrains' },
                  { id: 'syne', name: 'Syne Display', fontClass: 'font-syne' },
                  { id: 'space', name: 'Space Grotesk', fontClass: 'font-space' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updateNested('theme', 'fontFamily', f.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      invoice.theme.fontFamily === f.id
                        ? 'border-[#586FFF] bg-[#19253A] text-white shadow-sm ring-1 ring-[#586FFF]/40'
                        : 'border-[#19253A] bg-[#141E30] text-[#A5B1C7] hover:text-white hover:bg-[#19253A]/50'
                    }`}
                  >
                    <div className={`text-sm ${f.fontClass} text-white`}>Sample 2026</div>
                    <div className="text-[10px] text-[#A5B1C7] mt-1 truncate">{f.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Elements Toggles */}
            <div>
              <label className="block text-xs font-semibold text-[#A5B1C7] mb-2.5">
                Display Elements on Document
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'showQrCode', label: 'Payment QR Code' },
                  { key: 'showSignature', label: 'Authorized Signature' },
                  { key: 'showPaymentDetails', label: 'Bank & Wire Instructions' },
                  { key: 'showSkuCol', label: 'SKU / Item Code Column' },
                  { key: 'showDiscountCol', label: 'Per-Item Discount Column' },
                  { key: 'showNotes', label: 'Public Client Notes' },
                  { key: 'showTerms', label: 'Terms & Conditions' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-[#141E30] rounded-xl cursor-pointer hover:bg-[#19253A] transition-colors border border-[#19253A]"
                  >
                    <span className="text-xs text-white">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(invoice.theme as any)[item.key]}
                      onChange={(e) => updateNested('theme', item.key, e.target.checked)}
                      className="rounded accent-[#586FFF] w-4 h-4 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Final Action Hub */}
            <div className="p-4 bg-[#080D19] rounded-xl border border-[#19253A] space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Finalize &amp; Export
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {onQuickPdf && (
                  <button
                    type="button"
                    onClick={onQuickPdf}
                    className="py-2.5 px-3 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#586FFF]/30 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}

                {onPrint && (
                  <button
                    type="button"
                    onClick={onPrint}
                    className="py-2.5 px-3 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-[#19253A] transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-2.5 px-3 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-[#19253A] transition-colors cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>

            {!isSinglePageView && (
              <div className="pt-3 border-t border-[#141E30] flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-[#A5B1C7] hover:text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Step 5</span>
                </button>
                <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Invoice Ready for Download!</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
