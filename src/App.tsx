import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EditorPanel } from './components/EditorPanel';
import { CanvasPreview } from './components/CanvasPreview';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { FeaturesModal } from './components/FeaturesModal';
import { AuthModal } from './components/AuthModal';
import { UserHistoryModal } from './components/UserHistoryModal';
import { ClientBookModal } from './components/ClientBookModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ProLimitModal } from './components/ProLimitModal';
import { ProComparisonModal } from './components/ProComparisonModal';
import { ProProfileModal } from './components/ProProfileModal';
import { LandingPage } from './components/LandingPage';
import { CustomCursor } from './components/CustomCursor';
import { Invoice, ClientInfo, CompanyInfo, PaymentDetails, SignatureData, CurrencyCode } from './types/invoice';
import { DEFAULT_INVOICE, INVOICE_PRESETS } from './data/presets';
import { TEMPLATES } from './data/templateList';
import { ShieldCheck, Crown, SlidersHorizontal, Eye, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { exportToPdf, printInvoice } from './utils/export';

const STORAGE_KEY_CURRENT = 'invoicecraft_current_invoice';
const ADMIN_EMAIL = 'pdushangana@gmail.com';

export default function App() {
  const { user, loading, isPro: isAuthPro, isAdmin: isAuthAdmin } = useAuth();
  
  // Current active invoice
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse current invoice:', e);
    }
    return DEFAULT_INVOICE;
  });

  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([DEFAULT_INVOICE]);

  // Modals state
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isClientBookOpen, setIsClientBookOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProLimitModalOpen, setIsProLimitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProComparisonOpen, setIsProComparisonOpen] = useState(false);
  const [isProProfileOpen, setIsProProfileOpen] = useState(false);
  const [proLimitReason, setProLimitReason] = useState<'daily_limit' | 'pro_template' | 'pro_feature'>('daily_limit');
  const [proFeatureName, setProFeatureName] = useState<string>('Exclusive Feature');

  const [activeView, setActiveView] = useState<'split' | 'editor' | 'preview'>('split');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [currentRoute, setCurrentRoute] = useState<'home' | 'app'>('home');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentInvoice));
    } catch (e) {
      console.warn('Failed to persist current invoice:', e);
    }
  }, [currentInvoice]);

  const handleUpdateInvoice = (updated: Invoice) => {
    setCurrentInvoice(updated);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = INVOICE_PRESETS.find((p) => p.id === presetId);
    if (!preset || !preset.data) return;

    const merged: Invoice = {
      ...currentInvoice,
      ...preset.data,
      id: `inv_preset_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    } as Invoice;

    handleUpdateInvoice(merged);
  };

  const handleSelectTemplate = (templateId: string) => {
    handleUpdateInvoice({
      ...currentInvoice,
      templateId,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleNewInvoice = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newInvoice: Invoice = {
      ...DEFAULT_INVOICE,
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-${randomNum}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleUpdateInvoice(newInvoice);
  };

  const handleDuplicateInvoice = (invoiceToDuplicate: Invoice) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const duplicated: Invoice = {
      ...invoiceToDuplicate,
      id: `inv_dup_${Date.now()}`,
      invoiceNumber: `INV-COPY-${randomNum}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleUpdateInvoice(duplicated);
  };

  const handleApplyClient = (client: ClientInfo) => {
    handleUpdateInvoice({
      ...currentInvoice,
      client: {
        ...currentInvoice.client,
        ...client,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleApplyProProfileToInvoice = (updates: {
    company?: Partial<CompanyInfo>;
    payment?: Partial<PaymentDetails>;
    signature?: Partial<SignatureData>;
    currency?: CurrencyCode;
    notes?: string;
    terms?: string;
  }) => {
    setCurrentInvoice((prev) => ({
      ...prev,
      company: updates.company ? { ...prev.company, ...updates.company } : prev.company,
      payment: updates.payment ? { ...prev.payment, ...updates.payment } : prev.payment,
      signature: updates.signature ? { ...prev.signature, ...updates.signature } : prev.signature,
      currency: updates.currency || prev.currency,
      notes: updates.notes !== undefined ? updates.notes : prev.notes,
      paymentTerms: updates.terms !== undefined ? updates.terms : prev.paymentTerms,
      updatedAt: new Date().toISOString(),
    }));
  };

  const isAdmin = Boolean(isAuthAdmin || user?.email === ADMIN_EMAIL || user?.role === 'admin');
  const isPro = Boolean(isAuthPro || user?.isPro || isAdmin || user?.role === 'pro');

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (currentRoute === 'home') {
    return (
      <>
        <CustomCursor />
        <LandingPage
          currentUser={user}
          onGoToApp={() => setCurrentRoute('app')}
          onGetStarted={() => {
            if (user) setCurrentRoute('app');
            else setIsAuthModalOpen(true);
          }}
          onSignIn={() => {
            if (user) setCurrentRoute('app');
            else setIsAuthModalOpen(true);
          }}
          onExploreTemplates={() => {
            if (user) setCurrentRoute('app');
            else setIsAuthModalOpen(true);
          }}
        />
        <AuthModal user={user as any} isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <CustomCursor />
        <AuthModal user={null} isOpen={true} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D19] text-[#F8FAFF] flex flex-col font-jakarta">
      <CustomCursor />
      {/* Top Navbar */}
      <Navbar
        currentInvoice={currentInvoice}
        savedInvoices={savedInvoices}
        currentUser={user as any} // Keeping as any for now to avoid large refactor
        quota={{ used: 0, limit: 100 } as any}
        onSelectPreset={handleSelectPreset}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onNewInvoice={handleNewInvoice}
        onLoadSavedInvoice={() => {}}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenClients={() => setIsClientBookOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
        onOpenProLimit={(feature) => {
          setProLimitReason('pro_feature');
          setProFeatureName(feature || 'Pro Membership');
          setIsProLimitModalOpen(true);
        }}
        activeView={activeView}
        onToggleView={setActiveView}
        onUpdateCurrency={(code) =>
          handleUpdateInvoice({
            ...currentInvoice,
            currency: code,
            updatedAt: new Date().toISOString(),
          })
        }
        onDuplicateInvoice={() => handleDuplicateInvoice(currentInvoice)}
        onOpenProComparison={() => setIsProComparisonOpen(true)}
        onGoHome={() => setCurrentRoute('home')}
        onOpenProProfile={() => setIsProProfileOpen(true)}
      />

      {isAdmin && (
        <div className="no-print bg-gradient-to-r from-amber-950/80 via-neutral-900 to-indigo-950/80 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200 font-medium">
              Super Admin Mode: Logged in as <strong className="font-mono text-white">{user.email}</strong>
            </span>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] transition-colors shrink-0"
          >
            Open Admin Dashboard
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div
          className={`no-print editor-side-panel flex-col h-[calc(100vh-4rem)] border-r border-neutral-800 transition-all ${
            activeView === 'preview'
              ? 'hidden'
              : activeView === 'editor'
              ? 'w-full flex'
              : mobileTab === 'preview'
              ? 'hidden md:flex md:w-[50%] lg:w-[46%] xl:w-[43%] 2xl:w-[520px] shrink-0'
              : 'w-full md:w-[50%] lg:w-[46%] xl:w-[43%] 2xl:w-[520px] flex shrink-0'
          }`}
        >
          <div className="flex-1 overflow-hidden flex flex-col pb-14 md:pb-0">
            <EditorPanel
              invoice={currentInvoice}
              onChange={handleUpdateInvoice}
              onOpenTemplates={() => setIsTemplatesModalOpen(true)}
              onOpenClients={() => setIsClientBookOpen(true)}
              onQuickPdf={() => exportToPdf('invoice-render-sheet', currentInvoice.invoiceNumber)}
              onDuplicate={() => handleDuplicateInvoice(currentInvoice)}
              onPrint={() => printInvoice()}
              onOpenProProfile={() => setIsProProfileOpen(true)}
              currentUser={user}
            />
          </div>
        </div>

        <div
          className={`flex-1 flex-col h-[calc(100vh-4rem)] overflow-hidden transition-all ${
            activeView === 'editor'
              ? 'hidden'
              : activeView === 'split' && mobileTab === 'editor'
              ? 'hidden md:flex'
              : 'flex'
          }`}
        >
          <div className="flex-1 overflow-hidden flex flex-col pb-14 md:pb-0">
            <CanvasPreview
              invoice={currentInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              onOpenTemplates={() => setIsTemplatesModalOpen(true)}
              isPro={isPro}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Quick Switcher Dock */}
      <div className="md:hidden no-print fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-1.5 flex items-center gap-1.5">
        <button
          onClick={() => setMobileTab('editor')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'editor'
              ? 'bg-[#526DFF] text-white shadow-md shadow-[#526DFF]/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Edit Form</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-[#526DFF] text-white shadow-md shadow-[#526DFF]/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Canvas</span>
        </button>
        <button
          onClick={() => setIsTemplatesModalOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-neutral-800 flex items-center gap-1 transition-all cursor-pointer border border-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Templates</span>
        </button>
      </div>

      <TemplateSelectorModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        selectedTemplateId={currentInvoice.templateId}
        onSelectTemplate={handleSelectTemplate}
        currentUser={user as any}
        currentInvoice={currentInvoice}
        onOpenProModal={(name) => {
          setProLimitReason('pro_template');
          setProFeatureName(name);
          setIsProLimitModalOpen(true);
        }}
      />

      <FeaturesModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentUser={user as any}
        savedInvoices={savedInvoices}
        currentInvoiceId={currentInvoice.id}
        onSelectInvoice={setCurrentInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={() => {}}
        onNewInvoice={handleNewInvoice}
      />
      <ClientBookModal isOpen={isClientBookOpen} onClose={() => setIsClientBookOpen(false)} onApplyClient={handleApplyClient} />
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        savedInvoices={savedInvoices}
        onNewInvoice={handleNewInvoice}
        onSelectInvoice={setCurrentInvoice}
      />
      <AdminDashboardModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} currentUser={user as any} onSwitchUser={() => {}} />
      <ProLimitModal
        isOpen={isProLimitModalOpen}
        onClose={() => setIsProLimitModalOpen(false)}
        currentUser={user as any}
        quota={{ used: 0, limit: 100 } as any}
        reason={proLimitReason}
        featureName={proFeatureName}
        onSwitchToAdmin={() => {}}
        onOpenAdminDashboard={() => {
          setIsProLimitModalOpen(false);
          setIsAdminModalOpen(true);
        }}
      />
      <AuthModal user={user as any} isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProComparisonModal isOpen={isProComparisonOpen} onClose={() => setIsProComparisonOpen(false)} currentUser={user as any} />
      <ProProfileModal
        isOpen={isProProfileOpen}
        onClose={() => setIsProProfileOpen(false)}
        currentUser={user}
        currentInvoice={currentInvoice}
        onApplyToInvoice={handleApplyProProfileToInvoice}
        onOpenProComparison={() => {
          setIsProProfileOpen(false);
          setIsProComparisonOpen(true);
        }}
      />
    </div>
  );
}
