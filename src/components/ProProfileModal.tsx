import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Crown,
  Building2,
  MapPin,
  CreditCard,
  PenTool,
  Sliders,
  Check,
  Upload,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  FileCheck,
  Stamp,
  Globe,
  Mail,
  Phone,
  Save,
  Trash2,
} from 'lucide-react';
import { UserProfile, ProBusinessProfile } from '../types/auth';
import { Invoice, CompanyInfo, PaymentDetails, SignatureData, CurrencyCode } from '../types/invoice';
import { CURRENCIES } from '../utils/currency';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { isSuperAdminEmail } from '../utils/authStorage';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface ProProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentInvoice: Invoice;
  onApplyToInvoice: (updates: {
    company?: Partial<CompanyInfo>;
    payment?: Partial<PaymentDetails>;
    signature?: Partial<SignatureData>;
    currency?: CurrencyCode;
    notes?: string;
    terms?: string;
  }) => void;
  onOpenProComparison?: () => void;
}

export const ProProfileModal: React.FC<ProProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentInvoice,
  onApplyToInvoice,
  onOpenProComparison,
}) => {
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'banking' | 'signature' | 'defaults'>('brand');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const isAdmin = isSuperAdminEmail(currentUser?.email);
  const isPro = Boolean(currentUser?.isPro || isAdmin);

  const emailNorm = (currentUser?.email || '').trim().toLowerCase();
  const storageKey = `invoicecraft_pro_profile_${emailNorm || 'default'}`;

  // Form State
  const [profile, setProfile] = useState<ProBusinessProfile>(() => {
    try {
      if (currentUser?.proProfile) {
        return currentUser.proProfile;
      }
      const local = localStorage.getItem(storageKey);
      if (local) return JSON.parse(local);
    } catch (e) {}

    return {
      legalName: currentUser?.companyName || currentInvoice.company.name || 'Dushangana Creative Studios Ltd',
      tradingName: currentInvoice.company.name || 'PD Creative Studios',
      logoUrl: currentInvoice.company.logoUrl || '',
      taxId: currentInvoice.company.taxId || 'VAT-94719891483',
      industry: 'Software & Creative Media',
      tagline: 'High-Impact Digital Systems & Visual Architecture',
      email: currentUser?.email || currentInvoice.company.email || 'business@pdnetwork.io',
      phone: currentInvoice.company.phone || '+94 71 989 1483',
      website: currentInvoice.company.website || 'https://pdnetwork.io',
      address: currentInvoice.company.address || '452 Innovation Blvd, Level 4',
      city: currentInvoice.company.city || 'Colombo',
      state: currentInvoice.company.state || 'Western Province',
      postalCode: currentInvoice.company.postalCode || '00700',
      country: currentInvoice.company.country || 'Sri Lanka',
      bankName: currentInvoice.payment.bankName || 'Commercial Bank of Ceylon',
      accountName: currentInvoice.payment.accountName || 'Pasindu Dushangana',
      accountNumber: currentInvoice.payment.accountNumber || '8004529103',
      swiftBic: currentInvoice.payment.routingOrSwift || 'CCEYLKKLXXX',
      routingNumber: '0842-19',
      paymentLink: currentInvoice.payment.paymentLink || 'https://pay.stripe.com/pd-invoice',
      paymentInstructions: 'Please state Invoice # as wire transfer reference.',
      signatoryName: currentInvoice.signature.typedName || 'Pasindu Dushangana',
      signatoryTitle: currentInvoice.signature.signatoryTitle || 'Founder & Creative Director',
      signatureDataUrl: currentInvoice.signature.dataUrl || '',
      signatureType: currentInvoice.signature.type || 'type',
      sealText: 'OFFICIAL SEAL · VERIFIED AUDITED · PD NETWORK',
      showSeal: true,
      showSignature: true,
      defaultCurrency: currentInvoice.currency || 'LKR',
      defaultTaxPercent: 15,
      defaultTaxLabel: 'VAT',
      defaultPaymentTerms: 'Payment due within 14 calendar days of receipt.',
      defaultNotes: 'Thank you for your trusted partnership. High standard service guaranteed.',
      invoicePrefix: 'INV-2026-',
      customWatermark: 'ORIGINAL COPY',
      brandColor: '#586FFF',
    };
  });

  // Keep synced if user's cloud profile updates
  useEffect(() => {
    if (currentUser?.proProfile) {
      setProfile((prev) => ({ ...prev, ...currentUser.proProfile }));
    }
  }, [currentUser?.proProfile]);

  // Interactive Signature canvas
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  useEffect(() => {
    if (activeTab === 'signature' && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#586FFF';

        if (profile.signatureDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = profile.signatureDataUrl;
        }
      }
    }
  }, [activeTab]);

  const startDrawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawingSig(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawSig = () => {
    if (!isDrawingSig) return;
    setIsDrawingSig(false);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setProfile((prev) => ({
      ...prev,
      signatureDataUrl: dataUrl,
      signatureType: 'draw',
    }));
  };

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setProfile((prev) => ({
      ...prev,
      signatureDataUrl: '',
      signatureType: 'type',
    }));
  };

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof ProBusinessProfile>(key: K, value: ProBusinessProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));

      if (emailNorm) {
        await setDoc(
          doc(db, 'users', emailNorm),
          {
            proProfile: profile,
            companyName: profile.legalName || profile.tradingName || currentUser?.companyName,
            customWatermark: profile.customWatermark,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Error saving pro profile to cloud:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToActiveInvoice = () => {
    onApplyToInvoice({
      company: {
        name: profile.tradingName || profile.legalName,
        logoUrl: profile.logoUrl,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode,
        country: profile.country,
        taxId: profile.taxId,
      },
      payment: {
        bankName: profile.bankName || '',
        accountName: profile.accountName || '',
        accountNumber: profile.accountNumber || '',
        routingOrSwift: profile.swiftBic || profile.routingNumber || '',
        paymentLink: profile.paymentLink,
        additionalNotes: profile.paymentInstructions,
      },
      signature: {
        typedName: profile.signatoryName,
        signatoryTitle: profile.signatoryTitle,
        dataUrl: profile.signatureDataUrl,
        type: profile.signatureType || 'type',
      },
      currency: (profile.defaultCurrency as CurrencyCode) || currentInvoice.currency,
      terms: profile.defaultPaymentTerms,
      notes: profile.defaultNotes,
    });

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const whatsappUrl = `https://wa.me/94719891483?text=${encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to get the PD Invoice PRO upgrade for just LKR 250 to unlock the Pro Business Profile Studio! 🚀\n\n👤 Account Email: ${
      currentUser?.email || 'my-account'
    }\n💰 Package: PD Invoice PRO (LKR 250)\n\nPlease activate my account. Thank you! ⭐`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0D1526] border border-[#19253A] rounded-3xl w-full max-w-5xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Executive Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#101827] via-[#141E30] to-[#101827] border-b border-[#19253A] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-[#586FFF] to-purple-500 p-0.5 shadow-lg shadow-[#586FFF]/20 shrink-0">
              <div className="w-full h-full bg-[#0D1526] rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400 fill-current" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Pro Business Profile Studio
                </h2>
                {isPro ? (
                  <span className="text-[10px] font-mono bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> PRO ACTIVE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 font-bold px-2 py-0.5 rounded-full border border-neutral-700">
                    PREVIEW MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A5B1C7] mt-0.5 hidden sm:block">
                Configure your verified enterprise credentials, digital seal, signature & wire instructions. Auto-fills on every invoice.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A5B1C7] hover:text-white rounded-xl hover:bg-[#19253A] transition-colors cursor-pointer shrink-0"
            title="Close Profile Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free user notice banner */}
        {!isPro && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-neutral-900 to-indigo-500/20 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-200">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>PRO Feature:</strong> Upgrade to PD Invoice PRO for just <strong>LKR 250</strong> to sync your brand identity and signature to the cloud across all devices!
              </span>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Upgrade PRO (LKR 250)</span>
            </a>
          </div>
        )}

        {/* Navigation Tabs with < and > marks */}
        <div className="bg-[#101827] border-b border-[#19253A] px-2 sm:px-4 shrink-0">
          <HorizontalScrollContainer
            arrowSize="xs"
            scrollAmount={160}
            contentClassName="gap-2 px-1"
          >
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'brand'
                  ? 'border-[#586FFF] text-white'
                  : 'border-transparent text-[#A5B1C7] hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#8294FF]" />
              <span>Brand & Legal</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'contact'
                  ? 'border-[#586FFF] text-white'
                  : 'border-transparent text-[#A5B1C7] hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Contact & Address</span>
            </button>

            <button
              onClick={() => setActiveTab('banking')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'banking'
                  ? 'border-[#586FFF] text-white'
                  : 'border-transparent text-[#A5B1C7] hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Banking & Wire</span>
            </button>

            <button
              onClick={() => setActiveTab('signature')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'signature'
                  ? 'border-[#586FFF] text-white'
                  : 'border-transparent text-[#A5B1C7] hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-400" />
              <span>Executive Signature</span>
            </button>

            <button
              onClick={() => setActiveTab('defaults')}
              className={`flex items-center gap-2 py-3.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === 'defaults'
                  ? 'border-[#586FFF] text-white'
                  : 'border-transparent text-[#A5B1C7] hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Invoice Defaults</span>
            </button>
          </HorizontalScrollContainer>
        </div>

        {/* Studio Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: BRAND & LEGAL */}
          {activeTab === 'brand' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Official Legal Business Name
                  </label>
                  <input
                    type="text"
                    value={profile.legalName || ''}
                    onChange={(e) => handleUpdate('legalName', e.target.value)}
                    placeholder="e.g. Dushangana Creative Studios Ltd"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#586FFF] focus:ring-1 focus:ring-[#586FFF]"
                  />
                  <p className="text-[11px] text-[#A5B1C7] mt-1">
                    Official registered company name used on tax invoices & legal contracts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Brand / Trading Name (Display)
                  </label>
                  <input
                    type="text"
                    value={profile.tradingName || ''}
                    onChange={(e) => handleUpdate('tradingName', e.target.value)}
                    placeholder="e.g. PD Creative Studios"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#586FFF] focus:ring-1 focus:ring-[#586FFF]"
                  />
                  <p className="text-[11px] text-[#A5B1C7] mt-1">
                    Customer-facing brand name displayed at top of invoices.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Tax / VAT / GST / Business Reg ID
                  </label>
                  <input
                    type="text"
                    value={profile.taxId || ''}
                    onChange={(e) => handleUpdate('taxId', e.target.value)}
                    placeholder="e.g. VAT-94719891483 / EIN-820194"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#586FFF] focus:ring-1 focus:ring-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Industry & Tagline
                  </label>
                  <input
                    type="text"
                    value={profile.tagline || ''}
                    onChange={(e) => handleUpdate('tagline', e.target.value)}
                    placeholder="e.g. Enterprise Software & Digital Architecture"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#586FFF] focus:ring-1 focus:ring-[#586FFF]"
                  />
                </div>
              </div>

              {/* Company Logo Section */}
              <div className="bg-[#141E30]/70 p-4 sm:p-5 rounded-2xl border border-[#19253A] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#8294FF]" />
                      High-Resolution Brand Logo
                    </h4>
                    <p className="text-[11px] text-[#A5B1C7]">
                      Provide an image URL or upload your PNG/SVG logo to appear automatically on all invoices.
                    </p>
                  </div>
                  {profile.logoUrl && (
                    <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-md border border-neutral-300 flex items-center justify-center shrink-0">
                      <img src={profile.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profile.logoUrl || ''}
                    onChange={(e) => handleUpdate('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 bg-[#101827] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#586FFF]"
                  />
                  <label className="px-3 py-2 bg-[#19253A] hover:bg-[#20314d] text-white rounded-xl text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              handleUpdate('logoUrl', evt.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Digital Seal Generator */}
              <div className="bg-[#141E30]/70 p-4 sm:p-5 rounded-2xl border border-[#19253A] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Stamp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Digital Certified Stamp & Official Seal</h4>
                      <p className="text-[11px] text-[#A5B1C7]">
                        Generate an executive verification seal to validate your corporate invoices.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(profile.showSeal)}
                      onChange={(e) => handleUpdate('showSeal', e.target.checked)}
                      className="rounded accent-[#586FFF]"
                    />
                    <span className="text-xs text-white font-semibold">Enable Seal</span>
                  </label>
                </div>

                {profile.showSeal && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#A5B1C7] mb-1">
                          Seal Inscription Text
                        </label>
                        <input
                          type="text"
                          value={profile.sealText || ''}
                          onChange={(e) => handleUpdate('sealText', e.target.value)}
                          placeholder="e.g. OFFICIAL CERTIFIED STAMP · PD INVOICE"
                          className="w-full bg-[#101827] border border-[#19253A] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Seal Live Visual Mockup */}
                    <div className="flex justify-center p-2 bg-[#0D1526] rounded-xl border border-[#19253A]">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#586FFF] p-1 flex items-center justify-center text-center relative select-none">
                        <div className="w-full h-full rounded-full border border-[#586FFF]/60 flex flex-col items-center justify-center p-1 bg-[#586FFF]/5">
                          <ShieldCheck className="w-4 h-4 text-[#8294FF]" />
                          <span className="text-[8px] font-black text-white tracking-widest uppercase mt-0.5 font-mono">
                            VERIFIED
                          </span>
                          <span className="text-[6.5px] font-bold text-[#8294FF] truncate max-w-[70px]">
                            {profile.tradingName || 'PD INVOICE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Official Business Email</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => handleUpdate('email', e.target.value)}
                    placeholder="billing@company.com"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Business Phone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => handleUpdate('phone', e.target.value)}
                    placeholder="+94 71 989 1483"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Website / Portfolio URL</span>
                  </label>
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => handleUpdate('website', e.target.value)}
                    placeholder="https://company.com"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Headquarters Street Address
                  </label>
                  <input
                    type="text"
                    value={profile.address || ''}
                    onChange={(e) => handleUpdate('address', e.target.value)}
                    placeholder="Level 4, 452 Innovation Tower, Galle Road"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">City</label>
                    <input
                      type="text"
                      value={profile.city || ''}
                      onChange={(e) => handleUpdate('city', e.target.value)}
                      placeholder="Colombo"
                      className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3 py-2 text-xs text-white focus:border-[#586FFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">State / Province</label>
                    <input
                      type="text"
                      value={profile.state || ''}
                      onChange={(e) => handleUpdate('state', e.target.value)}
                      placeholder="Western"
                      className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3 py-2 text-xs text-white focus:border-[#586FFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Postal / ZIP Code</label>
                    <input
                      type="text"
                      value={profile.postalCode || ''}
                      onChange={(e) => handleUpdate('postalCode', e.target.value)}
                      placeholder="00700"
                      className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3 py-2 text-xs text-white focus:border-[#586FFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">Country</label>
                    <input
                      type="text"
                      value={profile.country || ''}
                      onChange={(e) => handleUpdate('country', e.target.value)}
                      placeholder="Sri Lanka"
                      className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3 py-2 text-xs text-white focus:border-[#586FFF]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANKING & SETTLEMENT */}
          {activeTab === 'banking' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#8294FF] shrink-0 mt-0.5" />
                <span>
                  These bank wire and online checkout details will auto-fill in your invoice payment instructions, giving your clients direct account and checkout methods.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={profile.accountName || ''}
                    onChange={(e) => handleUpdate('accountName', e.target.value)}
                    placeholder="e.g. Pasindu Dushangana / Dushangana Studios"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Bank Name & Branch
                  </label>
                  <input
                    type="text"
                    value={profile.bankName || ''}
                    onChange={(e) => handleUpdate('bankName', e.target.value)}
                    placeholder="e.g. Commercial Bank of Ceylon · Corporate Branch"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Account Number / IBAN
                  </label>
                  <input
                    type="text"
                    value={profile.accountNumber || ''}
                    onChange={(e) => handleUpdate('accountNumber', e.target.value)}
                    placeholder="e.g. 8004529103 / LK28CCEY0000008004529103"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={profile.swiftBic || ''}
                    onChange={(e) => handleUpdate('swiftBic', e.target.value)}
                    placeholder="e.g. CCEYLKKLXXX"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF] font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Online Instant Checkout URL (Stripe, PayPal, Wise, or Direct Link)
                  </label>
                  <input
                    type="url"
                    value={profile.paymentLink || ''}
                    onChange={(e) => handleUpdate('paymentLink', e.target.value)}
                    placeholder="e.g. https://buy.stripe.com/live_... or https://paypal.me/yourbusiness"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Default Payment Terms & Instructions Note
                  </label>
                  <textarea
                    rows={2}
                    value={profile.paymentInstructions || ''}
                    onChange={(e) => handleUpdate('paymentInstructions', e.target.value)}
                    placeholder="e.g. Please quote Invoice ID in bank transfer description. Cheques payable to Dushangana Studios."
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURE */}
          {activeTab === 'signature' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Signatory Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.signatoryName || ''}
                    onChange={(e) => handleUpdate('signatoryName', e.target.value)}
                    placeholder="e.g. Pasindu Dushangana"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Signatory Professional Title
                  </label>
                  <input
                    type="text"
                    value={profile.signatoryTitle || ''}
                    onChange={(e) => handleUpdate('signatoryTitle', e.target.value)}
                    placeholder="e.g. Managing Director & CEO"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>
              </div>

              {/* Draw Signature Pad */}
              <div className="bg-[#141E30]/70 p-4 sm:p-5 rounded-2xl border border-[#19253A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#8294FF]" />
                    <span className="text-xs font-bold text-white">Interactive Digital Signature Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearSig}
                      className="px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="border border-[#19253A] bg-[#0A101D] rounded-xl overflow-hidden p-2 flex justify-center">
                  <canvas
                    ref={sigCanvasRef}
                    width={460}
                    height={150}
                    onMouseDown={startDrawSig}
                    onMouseMove={drawSig}
                    onMouseUp={stopDrawSig}
                    onMouseLeave={stopDrawSig}
                    onTouchStart={startDrawSig}
                    onTouchMove={drawSig}
                    onTouchEnd={stopDrawSig}
                    className="w-full max-w-[460px] h-[150px] bg-[#080D18] rounded-lg cursor-crosshair border border-dashed border-[#19253A]"
                  />
                </div>
                <p className="text-[11px] text-[#A5B1C7] text-center">
                  Draw your official signature using mouse or finger. Saved to cloud and embedded on your invoice drafts.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: INVOICE DEFAULTS */}
          {activeTab === 'defaults' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={profile.defaultCurrency || 'LKR'}
                    onChange={(e) => handleUpdate('defaultCurrency', e.target.value)}
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={profile.defaultTaxPercent ?? 15}
                    onChange={(e) => handleUpdate('defaultTaxPercent', parseFloat(e.target.value) || 0)}
                    placeholder="15"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={profile.invoicePrefix || 'INV-2026-'}
                    onChange={(e) => handleUpdate('invoicePrefix', e.target.value)}
                    placeholder="INV-2026-"
                    className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                  Default Payment Terms (Net Days / Agreement)
                </label>
                <input
                  type="text"
                  value={profile.defaultPaymentTerms || ''}
                  onChange={(e) => handleUpdate('defaultPaymentTerms', e.target.value)}
                  placeholder="e.g. Payment due within 14 calendar days of receipt."
                  className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A5B1C7] mb-1.5">
                  Default Footer Notes & Thank You Text
                </label>
                <textarea
                  rows={3}
                  value={profile.defaultNotes || ''}
                  onChange={(e) => handleUpdate('defaultNotes', e.target.value)}
                  placeholder="e.g. Thank you for your business! All software implementations include 30-day post-launch warranty."
                  className="w-full bg-[#141E30] border border-[#19253A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#586FFF]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-[#101827] border-t border-[#19253A] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyToActiveInvoice}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#141E30] hover:bg-[#19253A] text-white border-[#19253A]'
              }`}
              title="Inject these business and banking details into currently open invoice"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Applied to Active Invoice!</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-[#8294FF]" />
                  <span>Apply to Current Invoice</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A5B1C7] hover:text-white hover:bg-[#19253A] transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-[#586FFF] hover:bg-[#475ce6] text-white shadow-[#586FFF]/30'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved & Cloud Synced!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile to Cloud</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
