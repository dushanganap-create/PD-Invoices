import React, { useState } from 'react';
import {
  X,
  Search,
  FolderOpen,
  Calendar,
  User,
  Copy,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { UserProfile } from '../types/auth';
import { formatCurrency } from '../utils/currency';
import { exportToPdf } from '../utils/export';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  savedInvoices: Invoice[];
  currentInvoiceId: string;
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onNewInvoice: () => void;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  savedInvoices,
  currentInvoiceId,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onNewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'draft' | 'overdue'>('all');

  if (!isOpen) return null;

  const filteredInvoices = savedInvoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-700/60 text-emerald-300">PAID</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 border border-amber-700/60 text-amber-300">PENDING</span>;
      case 'overdue':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 border border-rose-700/60 text-rose-300">OVERDUE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 border border-neutral-700 text-neutral-400">DRAFT</span>;
    }
  };

  const calculateInvoiceTotal = (inv: Invoice): number => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (inv.pricing.taxRate / 100);
    const shipping = inv.pricing.shipping || 0;
    const discount = inv.pricing.discountType === 'percentage'
      ? (subtotal * (inv.pricing.discountValue || 0)) / 100
      : (inv.pricing.discountValue || 0);
    return Math.max(0, subtotal - discount + tax + shipping);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                User Invoice History
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-800 text-neutral-300 font-mono">
                  {savedInvoices.length} Saved
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                {currentUser ? `Saved records for ${currentUser.name} (${currentUser.email})` : 'Saved in local browser memory'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewInvoice();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-neutral-950/60 border-b border-neutral-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice # or client..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['all', 'paid', 'pending', 'draft', 'overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <FolderOpen className="w-12 h-12 mx-auto opacity-30 text-neutral-400" />
              <p className="text-xs">No saved invoices found matching your criteria.</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isCurrent = inv.id === currentInvoiceId;
              const total = calculateInvoiceTotal(inv);

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-indigo-950/30 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Left Column: Number, Client, Date */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {inv.invoiceNumber}
                      </span>
                      {getStatusBadge(inv.status)}
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-neutral-300 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{inv.client.name || 'Unnamed Client'}</span>
                      {inv.client.company && (
                        <span className="text-neutral-500">· {inv.client.company}</span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Issued: {inv.issueDate}
                      </span>
                      <span>·</span>
                      <span>Due: {inv.dueDate}</span>
                      <span>·</span>
                      <span className="font-mono capitalize text-neutral-400">
                        {inv.templateId}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                    <div className="text-right sm:mr-3">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        Total Amount
                      </div>
                      <div className="font-mono font-bold text-sm sm:text-base text-white">
                        {formatCurrency(total, inv.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectInvoice(inv);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isCurrent
                            ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        }`}
                        title="Load into Editor"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Viewing' : 'Load'}</span>
                      </button>

                      <button
                        onClick={() => onDuplicateInvoice(inv)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Duplicate this invoice"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {savedInvoices.length > 1 && (
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Watermark */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Automatic history auto-saving enabled
          </span>
          <span className="font-semibold text-neutral-300">
            Made By Pasindu Dushangana
          </span>
        </div>
      </div>
    </div>
  );
};
