/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { Invoice, ClientInfo } from './types/invoice';
import { UserProfile } from './types/auth';
import { DEFAULT_INVOICE, INVOICE_PRESETS } from './data/presets';
import {
  getCurrentUser,
  setCurrentUser,
  getUserInvoices,
  saveUserInvoice,
  deleteUserInvoice,
  recordLoginEvent,
} from './utils/authStorage';
import { Sparkles, ShieldCheck } from 'lucide-react';

const STORAGE_KEY_CURRENT = 'invoicecraft_current_invoice';

export default function App() {
  // Current user state
  const [currentUser, setLocalUser] = useState<UserProfile | null>(() => getCurrentUser());

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

  // Saved user invoices history
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>(() => {
    const user = getCurrentUser();
    if (user) {
      return getUserInvoices(user.id);
    }
    return [DEFAULT_INVOICE];
  });

  // Modals state
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isClientBookOpen, setIsClientBookOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Layout view
  const [activeView, setActiveView] = useState<'split' | 'editor' | 'preview'>('split');

  // Persist current active invoice in browser
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentInvoice));
    } catch (e) {
      console.warn('Failed to persist current invoice:', e);
    }
  }, [currentInvoice]);

  // When user switches or logs in/out, load their specific history
  const handleUserChange = (newUser: UserProfile | null) => {
    setLocalUser(newUser);
    if (newUser) {
      const userInvs = getUserInvoices(newUser.id);
      setSavedInvoices(userInvs);
      if (userInvs.length > 0) {
        setCurrentInvoice(userInvs[0]);
      }
    }
  };

  // Handlers
  const handleUpdateInvoice = (updated: Invoice) => {
    setCurrentInvoice(updated);
    if (currentUser) {
      const updatedList = saveUserInvoice(currentUser.id, updated);
      setSavedInvoices(updatedList);
    } else {
      setSavedInvoices((prev) => {
        const exists = prev.some((inv) => inv.id === updated.id);
        if (exists) {
          return prev.map((inv) => (inv.id === updated.id ? updated : inv));
        }
        return [updated, ...prev];
      });
    }
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

  const handleDeleteInvoice = (id: string) => {
    if (currentUser) {
      const remaining = deleteUserInvoice(currentUser.id, id);
      setSavedInvoices(remaining);
      if (currentInvoice.id === id && remaining.length > 0) {
        setCurrentInvoice(remaining[0]);
      }
    } else {
      setSavedInvoices((prev) => {
        const remaining = prev.filter((inv) => inv.id !== id);
        if (currentInvoice.id === id && remaining.length > 0) {
          setCurrentInvoice(remaining[0]);
        }
        return remaining;
      });
    }
  };

  const handleLoadSavedInvoice = (id: string) => {
    const target = savedInvoices.find((inv) => inv.id === id);
    if (target) {
      setCurrentInvoice(target);
    }
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-jakarta">
      {/* Top Navbar */}
      <Navbar
        currentInvoice={currentInvoice}
        savedInvoices={savedInvoices}
        currentUser={currentUser}
        onSelectPreset={handleSelectPreset}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onNewInvoice={handleNewInvoice}
        onLoadSavedInvoice={handleLoadSavedInvoice}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenClients={() => setIsClientBookOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Main Workspace: Side 1 (Add Details) and Side 2 (Live Preview) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* SIDE 1: Add Details */}
        <div
          className={`flex-col h-[calc(100vh-6rem)] border-r border-neutral-800 transition-all ${
            activeView === 'preview'
              ? 'hidden'
              : activeView === 'editor'
              ? 'w-full flex'
              : 'w-full md:w-[50%] lg:w-[46%] xl:w-[43%] 2xl:w-[520px] flex shrink-0'
          }`}
        >
          {/* Side 1 Header Banner */}
          <div className="no-print h-9 bg-neutral-950 px-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Side 1 · Add Details
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsClientBookOpen(true)}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                + Client Book
              </button>
              <span className="text-[10px] text-neutral-400">
                Form &amp; Line Items
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <EditorPanel
              invoice={currentInvoice}
              onChange={handleUpdateInvoice}
              onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            />
          </div>
        </div>

        {/* SIDE 2: Live Preview */}
        <div
          className={`flex-1 flex-col h-[calc(100vh-6rem)] overflow-hidden transition-all ${
            activeView === 'editor' ? 'hidden' : 'flex'
          }`}
        >
          {/* Side 2 Header Banner */}
          <div className="no-print h-9 bg-neutral-950 px-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Side 2 · Live Preview
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Auto-updating · Invoice #{currentInvoice.invoiceNumber}
            </span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <CanvasPreview
              invoice={currentInvoice}
              onUpdateInvoice={handleUpdateInvoice}
              onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Global Application Bottom Footer Bar with Watermark */}
      <footer className="no-print h-8 bg-neutral-950 border-t border-neutral-850 px-4 flex items-center justify-between text-[11px] text-neutral-400 z-30 select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-neutral-300">
            InvoiceCraft Studio
          </span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline text-neutral-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline" />
            Security notice &amp; login logs dispatched to <strong className="text-indigo-300 font-mono">pdushangana@gmail.com</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-200 tracking-wide">
            Made By Pasindu Dushangana
          </span>
        </div>
      </footer>

      {/* Modals */}
      <TemplateSelectorModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        selectedTemplateId={currentInvoice.templateId}
        onSelectTemplate={handleSelectTemplate}
      />

      <FeaturesModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={handleUserChange}
        invoicesCount={savedInvoices.length}
      />

      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentUser={currentUser}
        savedInvoices={savedInvoices}
        currentInvoiceId={currentInvoice.id}
        onSelectInvoice={setCurrentInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onNewInvoice={handleNewInvoice}
      />

      <ClientBookModal
        isOpen={isClientBookOpen}
        onClose={() => setIsClientBookOpen(false)}
        onApplyClient={handleApplyClient}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        savedInvoices={savedInvoices}
      />
    </div>
  );
}
