import React, { useState } from 'react';
import {
  FileText,
  Building2,
  User,
  ListPlus,
  Receipt,
  CreditCard,
  PenTool,
  Sliders,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Plus,
  Sparkles,
  QrCode,
  DollarSign,
  Palette,
  Hash,
  Percent,
  Tag,
  Calculator,
} from 'lucide-react';
import { Invoice, LineItem, CurrencyCode } from '../types/invoice';
import { CURRENCIES, formatCurrency } from '../utils/currency';
import { calculateInvoice } from '../utils/calculations';
import { TEMPLATES } from '../data/templateList';
import { SignaturePad } from './SignaturePad';

interface EditorPanelProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  onOpenTemplates: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  invoice,
  onChange,
  onOpenTemplates,
}) => {
  const [activeSection, setActiveSection] = useState<string>('items');

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

  const updateNested = (parent: 'company' | 'client' | 'pricing' | 'payment' | 'theme', field: string, value: any) => {
    onChange({
      ...invoice,
      [parent]: {
        ...(invoice[parent] as any),
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Line item helpers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: 'New service or product item',
      sku: '',
      quantity: 1,
      unitPrice: 100,
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

  const sections = [
    { id: 'general', label: 'Meta & Dates', icon: FileText },
    { id: 'items', label: 'Line Items', icon: ListPlus },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'client', label: 'Client', icon: User },
    { id: 'pricing', label: 'Totals & Taxes', icon: Receipt },
    { id: 'payment', label: 'Payment & QR', icon: CreditCard },
    { id: 'notes', label: 'Notes & Signature', icon: PenTool },
    { id: 'styling', label: 'Theme & Style', icon: Palette },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 text-neutral-200">
      {/* Top Design Quick Carousel & Switcher */}
      <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border border-neutral-600 shrink-0 shadow-xs"
              style={{ backgroundColor: currentTemplate.accentHex }}
            />
            <span className="text-xs font-bold text-white tracking-tight">
              {currentTemplate.name}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700/60">
              {currentTemplate.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
                updateInvoice('templateId', TEMPLATES[randomIndex].id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-[11px] font-medium border border-neutral-750 transition-colors"
              title="Shuffle to a random design template"
            >
              <span>🎲 Shuffle</span>
            </button>
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>All {TEMPLATES.length} Designs</span>
            </button>
          </div>
        </div>

        {/* Quick Carousel Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TEMPLATES.slice(0, 10).map((tpl) => {
            const isSelected = invoice.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => updateInvoice('templateId', tpl.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-neutral-800 text-white border-indigo-500 shadow-xs'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tpl.accentHex }}
                />
                <span>{tpl.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800 overflow-x-auto scrollbar-none bg-neutral-900/90">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* =========================================================================
            SECTION: GENERAL / META
        ========================================================================= */}
        {activeSection === 'general' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Invoice Identifiers
              </h3>
              <button
                onClick={randomizeInvoiceNumber}
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Hash className="w-3 h-3" />
                <span>Randomize #</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Currency</label>
                <select
                  value={invoice.currency}
                  onChange={(e) => updateInvoice('currency', e.target.value as CurrencyCode)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => updateInvoice('issueDate', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateInvoice('dueDate', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Terms</label>
              <select
                value={invoice.paymentTerms}
                onChange={(e) => updateInvoice('paymentTerms', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-medium text-neutral-400 mb-1">Invoice Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['draft', 'pending', 'paid', 'overdue'] as Invoice['status'][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateInvoice('status', status)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                      invoice.status === status
                        ? status === 'paid'
                          ? 'bg-emerald-600 text-white'
                          : status === 'overdue'
                          ? 'bg-rose-600 text-white'
                          : status === 'pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: LINE ITEMS
        ========================================================================= */}
        {activeSection === 'items' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Items ({invoice.items.length})
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <div
                    key={item.id || index}
                    className="p-3.5 bg-neutral-850 rounded-xl border border-neutral-750 hover:border-neutral-600 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] font-bold text-neutral-400 flex items-center justify-center shrink-0 mt-1">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Item or service description"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      {/* Item Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === invoice.items.length - 1}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 rounded hover:bg-neutral-800"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateItem(index)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          disabled={invoice.items.length <= 1}
                          className="p-1 text-neutral-400 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-neutral-800"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Disc %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || ''}
                          onChange={(e) => handleUpdateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Line Total</label>
                        <div className="px-2 py-1 bg-neutral-900 border border-neutral-750 rounded text-xs font-mono font-bold text-emerald-400 text-right">
                          {formatCurrency(itemTotal, invoice.currency)}
                        </div>
                      </div>
                    </div>

                    {invoice.theme.showSkuCol && (
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">SKU / Item Code</label>
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => handleUpdateItem(index, 'sku', e.target.value)}
                          placeholder="e.g. SRV-DES-01"
                          className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAddItem}
              className="w-full py-2.5 border border-dashed border-neutral-700 hover:border-indigo-500 rounded-xl text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Line Item</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            SECTION: COMPANY DETAILS
        ========================================================================= */}
        {activeSection === 'company' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Your Business Information
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Company / Studio Name</label>
              <input
                type="text"
                value={invoice.company.name}
                onChange={(e) => updateNested('company', 'name', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={invoice.company.email}
                  onChange={(e) => updateNested('company', 'email', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={invoice.company.phone}
                  onChange={(e) => updateNested('company', 'phone', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Street Address</label>
              <input
                type="text"
                value={invoice.company.address}
                onChange={(e) => updateNested('company', 'address', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">City</label>
                <input
                  type="text"
                  value={invoice.company.city}
                  onChange={(e) => updateNested('company', 'city', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">State / Prov</label>
                <input
                  type="text"
                  value={invoice.company.state}
                  onChange={(e) => updateNested('company', 'state', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Postal Code</label>
                <input
                  type="text"
                  value={invoice.company.postalCode}
                  onChange={(e) => updateNested('company', 'postalCode', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Country</label>
                <input
                  type="text"
                  value={invoice.company.country}
                  onChange={(e) => updateNested('company', 'country', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Tax / VAT ID</label>
                <input
                  type="text"
                  value={invoice.company.taxId}
                  onChange={(e) => updateNested('company', 'taxId', e.target.value)}
                  placeholder="e.g. VAT-89302"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Website URL</label>
              <input
                type="text"
                value={invoice.company.website}
                onChange={(e) => updateNested('company', 'website', e.target.value)}
                placeholder="https://..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: CLIENT DETAILS
        ========================================================================= */}
        {activeSection === 'client' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Client & Recipient Information
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Client Full Name / Attention</label>
              <input
                type="text"
                value={invoice.client.name}
                onChange={(e) => updateNested('client', 'name', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Client Company / Organization</label>
              <input
                type="text"
                value={invoice.client.company}
                onChange={(e) => updateNested('client', 'company', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Client Email</label>
                <input
                  type="email"
                  value={invoice.client.email}
                  onChange={(e) => updateNested('client', 'email', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Client Phone</label>
                <input
                  type="text"
                  value={invoice.client.phone}
                  onChange={(e) => updateNested('client', 'phone', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Billing Street Address</label>
              <input
                type="text"
                value={invoice.client.address}
                onChange={(e) => updateNested('client', 'address', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">City</label>
                <input
                  type="text"
                  value={invoice.client.city}
                  onChange={(e) => updateNested('client', 'city', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">State</label>
                <input
                  type="text"
                  value={invoice.client.state}
                  onChange={(e) => updateNested('client', 'state', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-400 mb-0.5">Postal Code</label>
                <input
                  type="text"
                  value={invoice.client.postalCode}
                  onChange={(e) => updateNested('client', 'postalCode', e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Purchase Order (PO) Number</label>
              <input
                type="text"
                value={invoice.client.poNumber || ''}
                onChange={(e) => updateNested('client', 'poNumber', e.target.value)}
                placeholder="e.g. PO-2026-99"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: TOTALS & TAXES
        ========================================================================= */}
        {activeSection === 'pricing' && (
          <div className="space-y-5">
            {/* 1. DEDICATED GLOBAL TAX SECTION */}
            <div className="p-4 bg-neutral-850 rounded-xl border border-neutral-750 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Global Tax Percentage
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Configures global tax rate applied across the invoice subtotal
                    </p>
                  </div>
                </div>
                {calc.taxAmount > 0 && (
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                    +{formatCurrency(calc.taxAmount, invoice.currency)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Tax Name / Label
                  </label>
                  <input
                    type="text"
                    value={invoice.pricing.taxName}
                    onChange={(e) => updateNested('pricing', 'taxName', e.target.value)}
                    placeholder="e.g. Sales Tax, VAT, GST"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Tax Rate Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={invoice.pricing.taxRate ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateNested('pricing', 'taxRate', val);
                      }}
                      placeholder="0"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                    />
                    <span className="absolute right-3 top-2 text-xs text-neutral-400 font-mono">%</span>
                  </div>
                </div>
              </div>

              {/* Quick Tax Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Quick Tax Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '0% (Exempt)', rate: 0 },
                    { label: '5% (GST)', rate: 5 },
                    { label: '8.25% (US)', rate: 8.25 },
                    { label: '10%', rate: 10 },
                    { label: '15%', rate: 15 },
                    { label: '20% (VAT)', rate: 20 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateNested('pricing', 'taxRate', preset.rate)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                        Number(invoice.pricing.taxRate) === preset.rate
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-750'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. DEDICATED GLOBAL DISCOUNT SECTION */}
            <div className="p-4 bg-neutral-850 rounded-xl border border-neutral-750 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Global Invoice Discount
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Apply percentage-based or flat-rate savings to the entire order
                    </p>
                  </div>
                </div>
                {calc.globalDiscountAmount > 0 && (
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                    -{formatCurrency(calc.globalDiscountAmount, invoice.currency)}
                  </span>
                )}
              </div>

              {/* Segmented Mode Selector: Percentage vs Flat */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-neutral-400">
                  Discount Method
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-700">
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
                    className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      (invoice.pricing.discountType || 'percentage') === 'percentage'
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Percentage (%)</span>
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
                    className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      invoice.pricing.discountType === 'flat'
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Flat Amount ({invoice.currency})</span>
                  </button>
                </div>
              </div>

              {/* Input for the selected discount method */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-neutral-400">
                    {invoice.pricing.discountType === 'flat'
                      ? `Flat Discount Value (${invoice.currency})`
                      : 'Discount Rate Percentage (%)'}
                  </label>
                  {calc.globalDiscountAmount > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {invoice.pricing.discountType === 'flat'
                        ? `Equivalent to ${(
                            (calc.globalDiscountAmount / (calc.subtotal || 1)) *
                            100
                          ).toFixed(1)}% of subtotal`
                        : `Saves ${formatCurrency(calc.globalDiscountAmount, invoice.currency)}`}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={invoice.pricing.discountType === 'flat' ? calc.subtotal : 100}
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
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-mono">
                    {invoice.pricing.discountType === 'flat' ? invoice.currency : '%'}
                  </span>
                </div>
              </div>

              {/* Quick Discount Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  Quick Discount Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(invoice.pricing.discountType === 'flat'
                    ? [
                        { label: 'None', val: 0 },
                        { label: '50', val: 50 },
                        { label: '100', val: 100 },
                        { label: '250', val: 250 },
                        { label: '500', val: 500 },
                        { label: '1,000', val: 1000 },
                      ]
                    : [
                        { label: 'None (0%)', val: 0 },
                        { label: '5%', val: 5 },
                        { label: '10%', val: 10 },
                        { label: '15%', val: 15 },
                        { label: '20%', val: 20 },
                        { label: '25%', val: 25 },
                      ]
                  ).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...invoice,
                          pricing: {
                            ...invoice.pricing,
                            discountValue: preset.val,
                            globalDiscountPercent:
                              (invoice.pricing.discountType || 'percentage') === 'percentage'
                                ? preset.val
                                : 0,
                            flatDiscount: invoice.pricing.discountType === 'flat' ? preset.val : 0,
                          },
                          updatedAt: new Date().toISOString(),
                        });
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                        Number(invoice.pricing.discountValue) === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-750'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. SHIPPING, AMOUNT PAID & EXTRA FEES */}
            <div className="p-4 bg-neutral-850 rounded-xl border border-neutral-750 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Shipping, Deposits & Extra Fees
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Shipping / Freight
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={invoice.pricing.shipping || ''}
                    onChange={(e) =>
                      updateNested('pricing', 'shipping', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Deposit / Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={invoice.pricing.amountPaid || ''}
                    onChange={(e) =>
                      updateNested('pricing', 'amountPaid', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Extra Fee / Credit
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={invoice.pricing.extraFee || ''}
                    onChange={(e) =>
                      updateNested('pricing', 'extraFee', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. REAL-TIME COMPREHENSIVE BREAKDOWN CARD */}
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Live Order Summary
                </span>
                <span className="text-[10px] font-medium text-emerald-400">
                  Real-time propagation active
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-white">
                  {formatCurrency(calc.subtotal, invoice.currency)}
                </span>
              </div>

              {calc.totalItemDiscount > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Line Item Discounts</span>
                  <span className="font-mono text-emerald-400">
                    -{formatCurrency(calc.totalItemDiscount, invoice.currency)}
                  </span>
                </div>
              )}

              {calc.globalDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    Global Discount (
                    {calc.discountType === 'flat' ? 'Flat Rate' : `${calc.discountValue}%`}
                    )
                  </span>
                  <span className="font-mono font-semibold">
                    -{formatCurrency(calc.globalDiscountAmount, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500 text-[11px] pt-0.5">
                <span>Taxable Subtotal</span>
                <span className="font-mono text-neutral-300">
                  {formatCurrency(calc.subtotalAfterDiscount, invoice.currency)}
                </span>
              </div>

              {calc.taxAmount > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>
                    {invoice.pricing.taxName || 'Tax'} ({calc.globalTaxRate}%)
                  </span>
                  <span className="font-mono text-white font-medium">
                    +{formatCurrency(calc.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}

              {calc.shipping > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping & Delivery</span>
                  <span className="font-mono text-white">
                    +{formatCurrency(calc.shipping, invoice.currency)}
                  </span>
                </div>
              )}

              {calc.extraFee !== 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Extra Adjustments</span>
                  <span className="font-mono text-white">
                    {calc.extraFee > 0 ? '+' : ''}
                    {formatCurrency(calc.extraFee, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-neutral-800">
                <span>Total Invoice Valuation</span>
                <span className="font-mono text-base text-white">
                  {formatCurrency(calc.total, invoice.currency)}
                </span>
              </div>

              {calc.amountPaid > 0 && (
                <div className="flex justify-between text-neutral-400 pt-1">
                  <span>Deposit / Amount Settled</span>
                  <span className="font-mono text-emerald-400">
                    -{formatCurrency(calc.amountPaid, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-neutral-800/80 bg-neutral-900/60 p-2.5 rounded-lg mt-1">
                <span className="text-indigo-300">Remaining Balance Due</span>
                <span className="font-mono text-sm text-indigo-400">
                  {formatCurrency(calc.balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: PAYMENT & QR
        ========================================================================= */}
        {activeSection === 'payment' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Payment Settlement & QR Code
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Primary Payment Method</label>
              <select
                value={invoice.payment.method}
                onChange={(e) => updateNested('payment', 'method', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="bank">Bank Wire / ACH / Transfer</option>
                <option value="card">Credit Card / Stripe Portal</option>
                <option value="crypto">Cryptocurrency (USDC / BTC / ETH)</option>
                <option value="upi">UPI / Instant Pay</option>
                <option value="custom">Custom Instructions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Online Payment / Checkout Link</label>
              <input
                type="text"
                value={invoice.payment.paymentLink || ''}
                onChange={(e) => updateNested('payment', 'paymentLink', e.target.value)}
                placeholder="https://pay.stripe.com/..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                This link will automatically generate a scannable QR code on the invoice!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={invoice.payment.bankName}
                  onChange={(e) => updateNested('payment', 'bankName', e.target.value)}
                  placeholder="JPMorgan Chase"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={invoice.payment.accountName}
                  onChange={(e) => updateNested('payment', 'accountName', e.target.value)}
                  placeholder="Studio Corp LLC"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Account Number / IBAN</label>
                <input
                  type="text"
                  value={invoice.payment.accountNumber}
                  onChange={(e) => updateNested('payment', 'accountNumber', e.target.value)}
                  placeholder="**** **** 4819"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Routing / SWIFT / BIC</label>
                <input
                  type="text"
                  value={invoice.payment.routingOrSwift}
                  onChange={(e) => updateNested('payment', 'routingOrSwift', e.target.value)}
                  placeholder="CHASUS33"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Additional Wire Memo / Note</label>
              <textarea
                rows={2}
                value={invoice.payment.additionalNotes || ''}
                onChange={(e) => updateNested('payment', 'additionalNotes', e.target.value)}
                placeholder="Include invoice number in bank transfer reference..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: NOTES, TERMS & SIGNATURE
        ========================================================================= */}
        {activeSection === 'notes' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Public Client Note
              </label>
              <textarea
                rows={2}
                value={invoice.notes}
                onChange={(e) => updateInvoice('notes', e.target.value)}
                placeholder="Thank you for your business!..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Terms & Conditions / Late Fees
              </label>
              <textarea
                rows={3}
                value={invoice.terms}
                onChange={(e) => updateInvoice('terms', e.target.value)}
                placeholder="Payment is due within 14 days..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Digital Signature
              </label>
              <SignaturePad
                signature={invoice.signature}
                onChange={(sig) => updateInvoice('signature', sig)}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION: THEME & STYLING
        ========================================================================= */}
        {activeSection === 'styling' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Active Template
              </h3>
              <div className="p-3 bg-neutral-800 rounded-xl border border-neutral-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">{currentTemplate.name}</div>
                  <div className="text-xs text-neutral-400">{currentTemplate.description}</div>
                </div>
                <button
                  onClick={onOpenTemplates}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">Font Family</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'jakarta', name: 'Plus Jakarta Sans', fontClass: 'font-jakarta' },
                  { id: 'outfit', name: 'Outfit Modern', fontClass: 'font-outfit' },
                  { id: 'playfair', name: 'Playfair Display', fontClass: 'font-playfair' },
                  { id: 'cinzel', name: 'Cinzel Roman', fontClass: 'font-cinzel' },
                  { id: 'garamond', name: 'Cormorant Serif', fontClass: 'font-garamond' },
                  { id: 'jetbrains', name: 'JetBrains Monospace', fontClass: 'font-jetbrains' },
                  { id: 'syne', name: 'Syne Display', fontClass: 'font-syne' },
                  { id: 'space', name: 'Space Grotesk', fontClass: 'font-space' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateNested('theme', 'fontFamily', f.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      invoice.theme.fontFamily === f.id
                        ? 'border-indigo-500 bg-neutral-800 text-white shadow-xs'
                        : 'border-neutral-750 bg-neutral-850 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className={`text-sm ${f.fontClass} text-white`}>Sample Text</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{f.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">Display Elements</label>
              <div className="space-y-2">
                {[
                  { key: 'showQrCode', label: 'Payment QR Code' },
                  { key: 'showSignature', label: 'Authorized Signature' },
                  { key: 'showPaymentDetails', label: 'Payment Method Info' },
                  { key: 'showSkuCol', label: 'SKU / Item Code Column' },
                  { key: 'showDiscountCol', label: 'Per-Item Discount Column' },
                  { key: 'showNotes', label: 'Public Notes' },
                  { key: 'showTerms', label: 'Terms & Conditions' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-2.5 bg-neutral-800/60 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors"
                  >
                    <span className="text-xs text-neutral-300">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(invoice.theme as any)[item.key]}
                      onChange={(e) => updateNested('theme', item.key, e.target.checked)}
                      className="rounded accent-indigo-600 w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
