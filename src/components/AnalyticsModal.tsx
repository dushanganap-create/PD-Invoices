import React from 'react';
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
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { formatCurrency } from '../utils/currency';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedInvoices: Invoice[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  savedInvoices,
}) => {
  if (!isOpen) return null;

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

  savedInvoices.forEach((inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (inv.pricing.taxRate / 100);
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

    const clientKey = inv.client.name || inv.client.company || 'Unknown Client';
    if (!clientMap[clientKey]) {
      clientMap[clientKey] = { company: inv.client.company || inv.client.name, count: 0, total: 0 };
    }
    clientMap[clientKey].count++;
    clientMap[clientKey].total += total;
  });

  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 4);

  const primaryCurrency = savedInvoices[0]?.currency || 'USD';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Financial Revenue & Invoice Analytics
              </h2>
              <p className="text-[11px] text-neutral-400">
                Performance metrics computed from your saved invoices history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
              <div className="text-[11px] text-neutral-400 uppercase font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                Total Billed
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(totalInvoiced, primaryCurrency)}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{savedInvoices.length} invoices generated</div>
            </div>

            <div className="p-4 bg-neutral-950 border border-emerald-900/40 rounded-xl">
              <div className="text-[11px] text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Collected (Paid)
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300 mt-1">
                {formatCurrency(totalPaid, primaryCurrency)}
              </div>
              <div className="text-[10px] text-emerald-500 mt-0.5">{paidCount} paid in full</div>
            </div>

            <div className="p-4 bg-neutral-950 border border-amber-900/40 rounded-xl">
              <div className="text-[11px] text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Receivables
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
                {formatCurrency(totalPending, primaryCurrency)}
              </div>
              <div className="text-[10px] text-amber-500 mt-0.5">{pendingCount} pending payment</div>
            </div>

            <div className="p-4 bg-neutral-950 border border-rose-900/40 rounded-xl">
              <div className="text-[11px] text-rose-400 uppercase font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Past Due
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-rose-300 mt-1">
                {formatCurrency(totalOverdue, primaryCurrency)}
              </div>
              <div className="text-[10px] text-rose-500 mt-0.5">{overdueCount} overdue entries</div>
            </div>
          </div>

          {/* Status Breakdown Bar */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Invoice Status Distribution
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">
                {savedInvoices.length} Total Records
              </span>
            </div>

            {/* Proportion Bar */}
            <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden flex">
              {paidCount > 0 && (
                <div
                  style={{ width: `${(paidCount / savedInvoices.length) * 100}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Paid: ${paidCount}`}
                />
              )}
              {pendingCount > 0 && (
                <div
                  style={{ width: `${(pendingCount / savedInvoices.length) * 100}%` }}
                  className="bg-amber-500 transition-all"
                  title={`Pending: ${pendingCount}`}
                />
              )}
              {overdueCount > 0 && (
                <div
                  style={{ width: `${(overdueCount / savedInvoices.length) * 100}%` }}
                  className="bg-rose-500 transition-all"
                  title={`Overdue: ${overdueCount}`}
                />
              )}
              {draftCount > 0 && (
                <div
                  style={{ width: `${(draftCount / savedInvoices.length) * 100}%` }}
                  className="bg-neutral-600 transition-all"
                  title={`Draft: ${draftCount}`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Paid ({paidCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending ({pendingCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Overdue ({overdueCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                Draft ({draftCount})
              </span>
            </div>
          </div>

          {/* Top Clients by Revenue */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-400" />
              Top Clients by Billed Volume
            </h3>

            <div className="space-y-2">
              {topClients.length === 0 ? (
                <div className="text-xs text-neutral-500 py-2">No client data accumulated yet.</div>
              ) : (
                topClients.map(([name, data], idx) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2.5 bg-neutral-900 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-white">{name}</span>
                        <div className="text-[10px] text-neutral-500">{data.count} invoice(s)</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-200">
                      {formatCurrency(data.total, primaryCurrency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Credit & Watermark */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Invoice Analytics Engine
          </span>
          <span className="font-semibold text-neutral-300">
            Made By Pasindu Dushangana
          </span>
        </div>
      </div>
    </div>
  );
};
