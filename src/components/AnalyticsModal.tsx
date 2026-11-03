import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  BarChart3,
  Sparkles,
  Calendar,
  Filter,
  Plus,
  Users,
  FileText,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/currency';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedInvoices: Invoice[];
  onNewInvoice?: () => void;
  onSelectInvoice?: (invoice: Invoice) => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  savedInvoices,
  onNewInvoice,
  onSelectInvoice,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | '30d' | 'quarter' | 'year'>('all');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter invoices based on date filter
  const filteredInvoices = useMemo(() => {
    if (dateFilter === 'all') return savedInvoices;
    const now = new Date();
    const cutoff = new Date();

    if (dateFilter === '30d') {
      cutoff.setDate(now.getDate() - 30);
    } else if (dateFilter === 'quarter') {
      cutoff.setDate(now.getDate() - 90);
    } else if (dateFilter === 'year') {
      cutoff.setDate(now.getDate() - 365);
    }

    return savedInvoices.filter((inv) => {
      const invDate = new Date(inv.issueDate || inv.createdAt || '');
      return !isNaN(invDate.getTime()) ? invDate >= cutoff : true;
    });
  }, [savedInvoices, dateFilter]);

  // Compute metrics
  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  const clientMap: Record<string, { company: string; count: number; total: number }> = {};
  const monthlyRevenue: number[] = new Array(12).fill(0);

  filteredInvoices.forEach((inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * ((inv.pricing.taxRate || 0) / 100);
    const shipping = inv.pricing.shipping || 0;
    const discount =
      inv.pricing.discountType === 'percentage'
        ? (subtotal * (inv.pricing.discountValue || 0)) / 100
        : inv.pricing.discountValue || 0;
    const total = Math.max(0, subtotal - discount + tax + shipping);

    totalInvoiced += total;

    if (inv.status === 'paid') {
      totalPaid += total;
      paidCount++;
    } else if (inv.status === 'overdue') {
      totalOverdue += total;
      overdueCount++;
    } else if (inv.status === 'pending') {
      totalPending += total;
      pendingCount++;
    } else {
      draftCount++;
    }

    const clientKey = inv.client.name || inv.client.company || 'Direct Client';
    if (!clientMap[clientKey]) {
      clientMap[clientKey] = { company: inv.client.company || inv.client.name, count: 0, total: 0 };
    }
    clientMap[clientKey].count++;
    clientMap[clientKey].total += total;

    // Monthly distribution
    const d = new Date(inv.issueDate || inv.createdAt);
    if (!isNaN(d.getTime())) {
      const m = d.getMonth();
      monthlyRevenue[m] += total;
    } else {
      monthlyRevenue[new Date().getMonth()] += total;
    }
  });

  const maxMonthVal = Math.max(...monthlyRevenue, 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4);

  const primaryCurrency = savedInvoices[0]?.currency || 'LKR';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#101827] border border-[#19253A] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#141E30] flex items-center justify-between bg-[#080D19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#586FFF]/20 text-[#8294FF] border border-[#586FFF]/30 flex items-center justify-center font-bold shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Business Management &amp; Revenue Suite
              </h2>
              <p className="text-xs text-[#A5B1C7]">
                Live performance dashboard, cashflow analytics, and receivables tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Date-Range Filter */}
            <div className="hidden sm:flex items-center bg-[#141E30] p-1 rounded-xl border border-[#19253A] text-xs">
              {[
                { id: 'all', label: 'All Time' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'quarter', label: 'Quarter' },
                { id: 'year', label: 'This Year' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDateFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    dateFilter === tab.id
                      ? 'bg-[#586FFF] text-white shadow-xs font-semibold'
                      : 'text-[#A5B1C7] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#A5B1C7] hover:text-white rounded-xl hover:bg-[#141E30] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#F8FAFF]">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-[#141E30] border border-[#19253A] rounded-2xl space-y-1">
              <div className="text-[11px] font-semibold text-[#A5B1C7] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#8294FF]" />
                Total Billed Volume
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-white pt-1">
                {formatCurrency(totalInvoiced, primaryCurrency)}
              </div>
              <div className="text-[11px] text-[#A5B1C7] flex items-center gap-1">
                <span>{filteredInvoices.length} invoices generated</span>
              </div>
            </div>

            <div className="p-4 bg-[#141E30] border border-emerald-500/20 rounded-2xl space-y-1">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Collected (Paid)
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400 pt-1">
                {formatCurrency(totalPaid, primaryCurrency)}
              </div>
              <div className="text-[11px] text-emerald-400/80">
                {paidCount} invoices settled
              </div>
            </div>

            <div className="p-4 bg-[#141E30] border border-amber-500/20 rounded-2xl space-y-1">
              <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Pending Receivables
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-amber-300 pt-1">
                {formatCurrency(totalPending, primaryCurrency)}
              </div>
              <div className="text-[11px] text-amber-400/80">
                {pendingCount} pending payment
              </div>
            </div>

            <div className="p-4 bg-[#141E30] border border-rose-500/20 rounded-2xl space-y-1">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Overdue Balances
              </div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-rose-400 pt-1">
                {formatCurrency(totalOverdue, primaryCurrency)}
              </div>
              <div className="text-[11px] text-rose-400/80">
                {overdueCount} invoices past due
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="p-5 bg-[#141E30] border border-[#19253A] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8294FF]" />
                  Monthly Invoicing Performance
                </h3>
                <p className="text-xs text-[#A5B1C7]">Aggregated revenue flow across 12 months</p>
              </div>

              {hoveredMonth !== null && (
                <div className="text-xs font-mono font-bold text-white bg-[#19253A] px-2.5 py-1 rounded-lg border border-white/5">
                  {months[hoveredMonth]}: {formatCurrency(monthlyRevenue[hoveredMonth], primaryCurrency)}
                </div>
              )}
            </div>

            {/* Visual Bars */}
            <div className="h-32 flex items-end gap-2 pt-4 border-b border-[#19253A]">
              {monthlyRevenue.map((val, idx) => {
                const heightPercent = val > 0 ? Math.max(12, Math.round((val / maxMonthVal) * 100)) : 6;
                const isHovered = hoveredMonth === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-200 ${
                        isHovered
                          ? 'bg-[#8294FF] shadow-[0_0_12px_#586FFF]'
                          : val > 0
                          ? 'bg-[#586FFF] opacity-85 group-hover:opacity-100'
                          : 'bg-[#19253A]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] text-[#A5B1C7] font-mono">
              {months.map((m, idx) => (
                <span key={idx} className={hoveredMonth === idx ? 'text-white font-bold' : ''}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Status Breakdown & Top Clients Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Breakdown Bar */}
            <div className="p-5 bg-[#141E30] border border-[#19253A] rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-[#8294FF]" />
                  Status Distribution
                </span>
                <span className="text-[#A5B1C7] font-mono text-[11px]">
                  {filteredInvoices.length} Total Records
                </span>
              </div>

              {/* Proportion Bar */}
              <div className="h-3 w-full bg-[#080D19] rounded-full overflow-hidden flex">
                {paidCount > 0 && (
                  <div
                    style={{ width: `${(paidCount / filteredInvoices.length) * 100}%` }}
                    className="bg-emerald-500 transition-all"
                  />
                )}
                {pendingCount > 0 && (
                  <div
                    style={{ width: `${(pendingCount / filteredInvoices.length) * 100}%` }}
                    className="bg-amber-500 transition-all"
                  />
                )}
                {overdueCount > 0 && (
                  <div
                    style={{ width: `${(overdueCount / filteredInvoices.length) * 100}%` }}
                    className="bg-rose-500 transition-all"
                  />
                )}
                {draftCount > 0 && (
                  <div
                    style={{ width: `${(draftCount / filteredInvoices.length) * 100}%` }}
                    className="bg-neutral-600 transition-all"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#A5B1C7] pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Paid: {paidCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Pending: {pendingCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Overdue: {overdueCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  <span>Draft: {draftCount}</span>
                </div>
              </div>
            </div>

            {/* Top Billed Clients */}
            <div className="p-5 bg-[#141E30] border border-[#19253A] rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8294FF]" />
                Top Client Accounts
              </h3>

              <div className="space-y-2">
                {topClients.length === 0 ? (
                  <div className="text-xs text-[#A5B1C7] py-4 text-center">No client records yet.</div>
                ) : (
                  topClients.map(([name, data], idx) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2.5 bg-[#101827] rounded-xl text-xs border border-[#19253A]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#19253A] text-[#8294FF] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-white truncate block">{name}</span>
                          <span className="text-[10px] text-[#A5B1C7]">{data.count} invoice(s)</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0">
                        {formatCurrency(data.total, primaryCurrency)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="p-5 bg-[#141E30] border border-[#19253A] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8294FF]" />
                Recent Invoices Log
              </h3>
              <span className="text-xs text-[#A5B1C7]">Showing latest {Math.min(5, filteredInvoices.length)} invoices</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#19253A] text-[#A5B1C7] font-semibold text-[11px]">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Client</th>
                    <th className="pb-2">Issue Date</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#19253A]/60">
                  {filteredInvoices.slice(0, 5).map((inv) => {
                    const subtotal = inv.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => {
                          if (onSelectInvoice) {
                            onSelectInvoice(inv);
                            onClose();
                          }
                        }}
                        className="hover:bg-[#19253A]/50 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 font-mono font-bold text-white group-hover:text-[#8294FF]">
                          #{inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 text-white truncate max-w-[150px]">
                          {inv.client.name || 'Direct Client'}
                        </td>
                        <td className="py-2.5 text-[#A5B1C7] font-mono text-[11px]">
                          {inv.issueDate}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : inv.status === 'overdue'
                                ? 'bg-rose-500/20 text-rose-300'
                                : inv.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">
                          {formatCurrency(subtotal, inv.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Credit & Quick Action */}
        <div className="px-6 py-3.5 border-t border-[#141E30] bg-[#080D19] flex items-center justify-between text-xs text-[#A5B1C7]">
          <span className="flex items-center gap-1.5 text-[#8294FF] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#586FFF]" />
            Enterprise Analytics Engine · PD NETWORK
          </span>

          <div className="flex items-center gap-2">
            {onNewInvoice && (
              <button
                onClick={() => {
                  onNewInvoice();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#586FFF] hover:bg-[#475ce6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#586FFF]/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Invoice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141E30] hover:bg-[#19253A] text-white font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
