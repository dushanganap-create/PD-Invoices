import React from 'react';
import { Invoice } from '../../types/invoice';
import { calculateInvoice, InvoiceCalculations } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import {
  InvoiceQrCode,
  PaymentMethodInfo,
  RenderSignature,
  StatusStamp,
  TemplateLogoBadge,
  BarcodeSvg,
  InvoiceSummaryRows,
  getDiscountLabel,
} from './InvoiceCommonParts';
import {
  NeoBrutalistPop,
  MatrixCyber,
  LuxuryOnyx,
  BauhausGeometric,
  RetroSynthwave,
  MonochromeEditorial,
  ArtNouveauBotanical,
  ZenithGlassmorphism,
} from './CreativeExtraTemplates';

interface TemplateProps {
  invoice: Invoice;
  calc: InvoiceCalculations;
}

/* =========================================================================
   1. Modern Minimalist (modern-minimal)
   Clean, razor-sharp typography, generous margins, subtle hairlines
========================================================================= */
const ModernMinimal: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-slate-800 font-jakarta text-xs sm:text-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-start gap-3.5">
          {invoice.theme.showLogo && (
            <TemplateLogoBadge
              name={invoice.company.name}
              templateId={invoice.templateId}
              logoUrl={invoice.company.logoUrl}
            />
          )}
          <div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {invoice.company.name}
            </div>
            <div className="mt-1.5 text-xs text-slate-500 space-y-0.5">
              <div>{invoice.company.address}</div>
              <div>
                {invoice.company.city}, {invoice.company.state} {invoice.company.postalCode} {invoice.company.country}
              </div>
              {invoice.company.taxId && <div>Tax ID: {invoice.company.taxId}</div>}
              <div>{invoice.company.email} · {invoice.company.phone}</div>
            </div>
          </div>
        </div>

        <div className="sm:text-right flex flex-col sm:items-end">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Invoice</span>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-0.5">
            {invoice.invoiceNumber}
          </h1>
          <div className="mt-2 text-xs text-slate-500 space-y-0.5">
            <div>Issued: <span className="font-medium text-slate-700">{invoice.issueDate}</span></div>
            <div>Due: <span className="font-medium text-slate-700">{invoice.dueDate}</span></div>
            {invoice.paymentTerms && <div>Terms: {invoice.paymentTerms}</div>}
          </div>
          <div className="mt-3">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Billed To</span>
          <div className="text-sm font-semibold text-slate-900 mt-1">{invoice.client.name}</div>
          {invoice.client.company && <div className="text-xs text-slate-600">{invoice.client.company}</div>}
          <div className="text-xs text-slate-500 mt-1 space-y-0.5">
            <div>{invoice.client.address}</div>
            <div>{invoice.client.city}, {invoice.client.state} {invoice.client.postalCode}</div>
            <div>{invoice.client.email}</div>
          </div>
        </div>
        {invoice.client.poNumber && (
          <div className="text-xs text-slate-500 sm:text-right">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[11px]">Purchase Order</span>
            <span className="font-mono text-slate-800">{invoice.client.poNumber}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2.5 pr-4">Description</th>
              {invoice.theme.showSkuCol && <th className="py-2.5 px-3">SKU</th>}
              <th className="py-2.5 px-3 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              {invoice.theme.showDiscountCol && <th className="py-2.5 px-3 text-right">Disc %</th>}
              <th className="py-2.5 pl-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-medium text-slate-800">{item.description}</td>
                  {invoice.theme.showSkuCol && <td className="py-3 px-3 font-mono text-slate-500">{item.sku || '—'}</td>}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </td>
                  {invoice.theme.showDiscountCol && (
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                      {item.discountPercent ? `${item.discountPercent}%` : '—'}
                    </td>
                  )}
                  <td className="py-3 pl-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {formatCurrency(lineTotal, invoice.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary calculation */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between gap-8">
        <div className="flex-1 space-y-4">
          <PaymentMethodInfo invoice={invoice} />
          {invoice.theme.showNotes && invoice.notes && (
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.theme.showTerms && invoice.terms && (
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-600 block mb-0.5">Terms:</span>
              <p>{invoice.terms}</p>
            </div>
          )}
        </div>

        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>
          {calc.globalDiscountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>{getDiscountLabel(calc)}</span>
              <span className="font-mono tabular-nums">-{formatCurrency(calc.globalDiscountAmount, invoice.currency)}</span>
            </div>
          )}
          {calc.taxAmount > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>{invoice.pricing.taxName || 'Tax'} ({invoice.pricing.taxRate}%)</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.taxAmount, invoice.currency)}</span>
            </div>
          )}
          {calc.shipping > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.shipping, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="font-mono tabular-nums">{formatCurrency(calc.total, invoice.currency)}</span>
          </div>
          {calc.amountPaid > 0 && (
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Amount Paid</span>
              <span className="font-mono tabular-nums">-{formatCurrency(calc.amountPaid, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>Balance Due</span>
            <span className="font-mono tabular-nums text-indigo-600">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Footer & Signature & QR */}
      <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-6">
        <InvoiceQrCode invoice={invoice} size={80} />
        <div className="w-full sm:w-56">
          <RenderSignature invoice={invoice} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. Corporate Executive (corporate-classic)
   Solid navy header block, authoritative enterprise styling
========================================================================= */
const CorporateClassic: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="text-slate-800 font-jakarta text-xs sm:text-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-8 sm:px-12 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {invoice.theme.showLogo && (
            <TemplateLogoBadge
              name={invoice.company.name}
              templateId={invoice.templateId}
              logoUrl={invoice.company.logoUrl}
              className="bg-white/10 text-white border border-white/20"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{invoice.company.name}</h1>
            <p className="text-xs text-slate-300 mt-1">{invoice.company.email} · {invoice.company.phone}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">INVOICE</div>
          <div className="text-xl font-mono font-bold text-white">{invoice.invoiceNumber}</div>
        </div>
      </div>

      <div className="p-8 sm:p-12">
        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">From</span>
            <div className="font-semibold text-slate-900 mt-1">{invoice.company.name}</div>
            <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
              <div>{invoice.company.address}</div>
              <div>{invoice.company.city}, {invoice.company.state} {invoice.company.postalCode}</div>
              {invoice.company.taxId && <div>VAT/Tax: {invoice.company.taxId}</div>}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bill To</span>
            <div className="font-semibold text-slate-900 mt-1">{invoice.client.name}</div>
            <div className="text-xs text-slate-600">{invoice.client.company}</div>
            <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
              <div>{invoice.client.address}</div>
              <div>{invoice.client.city}, {invoice.client.state} {invoice.client.postalCode}</div>
              <div>{invoice.client.email}</div>
            </div>
          </div>
          <div className="sm:text-right space-y-1">
            <div className="text-xs"><span className="text-slate-400">Issue Date:</span> <span className="font-medium text-slate-800">{invoice.issueDate}</span></div>
            <div className="text-xs"><span className="text-slate-400">Due Date:</span> <span className="font-medium text-slate-800">{invoice.dueDate}</span></div>
            <div className="text-xs"><span className="text-slate-400">Terms:</span> <span className="font-medium text-slate-800">{invoice.paymentTerms}</span></div>
            <div className="pt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        {/* Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Item & Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{item.description}</div>
                      {item.sku && <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        <div className="flex flex-col sm:flex-row justify-between gap-8 pt-4">
          <div className="flex-1 space-y-4">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && (
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Remarks:</span>
                {invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} />
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total Amount:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 pt-1">
              <span>Balance Due:</span>
              <span className="font-mono tabular-nums text-blue-900">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-4">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-full sm:w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. Creative Studio (creative-studio)
   Vibrant indigo accents, oversized stylized title, asymmetric flair
========================================================================= */
const CreativeStudio: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-neutral-800 font-syne text-xs sm:text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            {invoice.theme.showLogo && (
              <TemplateLogoBadge
                name={invoice.company.name}
                templateId={invoice.templateId}
                logoUrl={invoice.company.logoUrl}
                className="bg-indigo-600 text-white shadow-xs"
              />
            )}
            <span className="inline-block bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-widest">
              Studio Invoice
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            {invoice.company.name}
          </h1>
          <div className="text-xs text-neutral-500 font-jakarta mt-1">
            {invoice.company.website} · {invoice.company.email}
          </div>
        </div>

        <div className="sm:text-right font-jakarta">
          <div className="text-3xl font-mono font-bold text-indigo-600">#{invoice.invoiceNumber}</div>
          <div className="text-xs text-neutral-500 mt-1">Date: <span className="font-medium text-neutral-800">{invoice.issueDate}</span></div>
          <div className="text-xs text-neutral-500">Due: <span className="font-medium text-neutral-800">{invoice.dueDate}</span></div>
          <div className="mt-2"><StatusStamp status={invoice.status} /></div>
        </div>
      </div>

      <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-xl mb-8 flex flex-col sm:flex-row justify-between gap-4 font-jakarta">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">Client / Project</div>
          <div className="text-base font-bold text-neutral-900 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-neutral-600">{invoice.client.company}</div>
          <div className="text-xs text-neutral-500 mt-1">{invoice.client.address}, {invoice.client.city}</div>
        </div>
        {invoice.client.poNumber && (
          <div className="sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">PO Ref</span>
            <div className="font-mono text-sm font-semibold text-neutral-800">{invoice.client.poNumber}</div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="py-2 overflow-x-auto">
        <table className="w-full text-left font-jakarta">
          <thead>
            <tr className="border-b-2 border-indigo-600 text-indigo-900 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 pr-4">Deliverable</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 pl-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx} className="hover:bg-indigo-50/20">
                  <td className="py-4 pr-4">
                    <span className="font-semibold text-neutral-900 block">{item.description}</span>
                    {item.sku && <span className="text-[10px] text-neutral-400 font-mono">Ref: {item.sku}</span>}
                  </td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-neutral-700">{item.quantity}</td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-neutral-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-4 pl-4 text-right font-mono tabular-nums font-bold text-neutral-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 pt-6 border-t-2 border-neutral-900 flex flex-col sm:flex-row justify-between gap-8 font-jakarta">
        <div className="flex-1 space-y-3">
          <PaymentMethodInfo invoice={invoice} />
          {invoice.notes && <p className="text-xs text-neutral-500 italic">{invoice.notes}</p>}
        </div>

        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600"><span>Subtotal</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} />
          <div className="p-3 bg-neutral-900 text-white rounded-lg flex justify-between items-center text-sm font-bold mt-2">
            <span>Total Due</span>
            <span className="font-mono text-base tabular-nums text-indigo-300">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-end gap-4 font-jakarta">
        <InvoiceQrCode invoice={invoice} size={75} />
        <div className="w-full sm:w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. Dev Terminal (tech-terminal)
   Monospace programmer aesthetic, terminal glyphs, clean ASCII borders
========================================================================= */
const TechTerminal: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-slate-800 font-jetbrains text-xs">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 text-emerald-400 p-4 rounded-t border-b-2 border-emerald-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="ml-2 font-bold tracking-tight text-white">$ invoice --render {invoice.invoiceNumber}</span>
        </div>
        <span className="text-[10px] text-emerald-300">ENV: PRODUCTION</span>
      </div>

      <div className="border border-slate-300 p-6 rounded-b bg-white space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-4 border-b border-dashed border-slate-300">
          <div>
            <div className="text-sm font-bold text-slate-900">&gt; ISSUER: {invoice.company.name}</div>
            <div className="text-slate-500 text-[11px] mt-1">
              <div>HOST: {invoice.company.website}</div>
              <div>AUTH_TAX: {invoice.company.taxId || 'N/A'}</div>
              <div>LOC: {invoice.company.city}, {invoice.company.country}</div>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-sm font-bold text-slate-900">&gt; CLIENT: {invoice.client.name}</div>
            <div className="text-slate-500 text-[11px] mt-1">
              <div>ORG: {invoice.client.company || 'DIRECT'}</div>
              <div>EMAIL: {invoice.client.email}</div>
              <div>PO_REF: {invoice.client.poNumber || 'NONE'}</div>
            </div>
          </div>
        </div>

        {/* Data readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
          <div><span className="text-slate-400">TIMESTAMP:</span> {invoice.issueDate}</div>
          <div><span className="text-slate-400">DEADLINE:</span> {invoice.dueDate}</div>
          <div><span className="text-slate-400">TERMS:</span> {invoice.paymentTerms}</div>
          <div><span className="text-slate-400">STATUS:</span> <span className="font-bold uppercase text-emerald-700">{invoice.status}</span></div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-400 text-slate-600 text-[11px] font-bold">
                <th className="py-2 pr-3">[IDX] MODULE_DESCRIPTION</th>
                <th className="py-2 px-2 text-right">QTY</th>
                <th className="py-2 px-2 text-right">RATE</th>
                <th className="py-2 pl-3 text-right">SUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-2.5 pr-3 text-slate-800">
                      <span className="text-emerald-700">#0{idx + 1}</span> {item.description}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-2.5 pl-3 text-right font-bold tabular-nums text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary calculation */}
        <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <div className="text-[11px] text-slate-500">// {invoice.notes}</div>}
          </div>
          <div className="w-full sm:w-64 space-y-1 text-right">
            <div><span className="text-slate-500">SUBTOTAL:</span> <span className="tabular-nums font-bold">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-emerald-600 font-bold" taxClass="flex justify-between text-slate-600" />
            <div className="text-sm font-bold text-emerald-800 pt-2 border-t border-slate-400">
              NET_BALANCE: {formatCurrency(calc.balanceDue, invoice.currency)}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-end border-t border-dashed border-slate-300">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-52"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   5. Haute Luxe (luxury-gold)
   Editorial serif, champagne gold hairlines, bespoke prestige
========================================================================= */
const LuxuryGold: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 text-stone-800 font-cinzel text-xs sm:text-sm bg-stone-50/50">
      <div className="border-2 border-amber-600/40 p-6 sm:p-10 bg-white">
        {/* Crown Header */}
        <div className="text-center pb-8 border-b border-amber-600/30">
          <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-bold block mb-1">
            Official Statement
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-stone-900">
            {invoice.company.name}
          </h1>
          <div className="text-[11px] font-garamond italic text-stone-500 mt-1">
            {invoice.company.address} · {invoice.company.city} · {invoice.company.country}
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-stone-200 font-garamond text-sm">
          <div>
            <span className="font-cinzel text-xs font-bold text-stone-700 uppercase tracking-widest block mb-1">Prepared For</span>
            <div className="text-base font-bold text-stone-900">{invoice.client.name}</div>
            <div className="italic text-stone-600">{invoice.client.company}</div>
            <div className="text-stone-500 text-xs mt-1">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          <div className="sm:text-right space-y-1">
            <div><span className="font-cinzel text-xs text-stone-500">Invoice:</span> <span className="font-bold text-stone-900">{invoice.invoiceNumber}</span></div>
            <div><span className="font-cinzel text-xs text-stone-500">Date:</span> {invoice.issueDate}</div>
            <div><span className="font-cinzel text-xs text-stone-500">Settlement:</span> {invoice.dueDate}</div>
            <div className="pt-1"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        {/* Table */}
        <div className="py-6 overflow-x-auto font-garamond text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-amber-600/30 font-cinzel text-xs text-stone-700 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Itemized Engagement</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-semibold text-stone-900">{item.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-stone-700">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-stone-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-bold text-amber-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom */}
        <div className="border-t border-amber-600/30 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-garamond">
          <div className="flex-1 space-y-3">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <p className="italic text-stone-500 text-xs">{invoice.notes}</p>}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-stone-700">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-amber-700 font-semibold" taxClass="flex justify-between text-stone-600" />
            <div className="flex justify-between text-base font-cinzel font-bold text-stone-900 pt-2 border-t border-amber-600/40">
              <span>Amount Due:</span>
              <span className="font-mono text-amber-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-end gap-4">
          <InvoiceQrCode invoice={invoice} size={80} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. Swiss Bauhaus (swiss-bauhaus)
   Vermilion red stripe, stark black type, iconic modernist grid
========================================================================= */
const SwissBauhaus: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-zinc-900 font-space text-xs sm:text-sm">
      <div className="w-full h-3 bg-red-600 mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-4 border-zinc-900 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-red-600">FAKTURA / RECHNUNG</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter mt-1">{invoice.company.name}</h1>
          <div className="text-xs text-zinc-600 mt-2 font-mono space-y-0.5">
            <div>{invoice.company.address}</div>
            <div>{invoice.company.email} · {invoice.company.phone}</div>
          </div>
        </div>
        <div className="sm:text-right font-mono">
          <div className="text-2xl font-black text-zinc-900">{invoice.invoiceNumber}</div>
          <div className="text-xs text-zinc-500 mt-1">DATE: {invoice.issueDate}</div>
          <div className="text-xs text-zinc-500">DUE: {invoice.dueDate}</div>
          <div className="mt-2"><StatusStamp status={invoice.status} /></div>
        </div>
      </div>

      <div className="py-6 border-b-2 border-zinc-900 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">EMPFÄNGER / CLIENT</div>
          <div className="text-base font-bold text-zinc-900 mt-1">{invoice.client.name}</div>
          <div className="text-xs text-zinc-600">{invoice.client.company}</div>
          <div className="text-xs text-zinc-500 mt-1">{invoice.client.address}, {invoice.client.city}</div>
        </div>
        {invoice.client.poNumber && (
          <div className="sm:text-right font-mono">
            <span className="text-[11px] font-bold uppercase text-zinc-400">BESTELL-NR:</span>
            <div className="font-bold text-zinc-900">{invoice.client.poNumber}</div>
          </div>
        )}
      </div>

      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-zinc-900 text-xs font-black uppercase">
              <th className="py-2.5 pr-4">POSITION</th>
              <th className="py-2.5 px-3 text-right">MENGE</th>
              <th className="py-2.5 px-3 text-right">PREIS</th>
              <th className="py-2.5 pl-4 text-right">BETRAG</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b-2 border-zinc-900 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx}>
                  <td className="py-3.5 pr-4 font-bold">{item.description}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-black">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="py-6 flex flex-col sm:flex-row justify-between gap-8">
        <div className="flex-1 space-y-3 font-mono">
          <PaymentMethodInfo invoice={invoice} />
        </div>
        <div className="w-full sm:w-64 space-y-2 font-mono">
          <div className="flex justify-between"><span>ZWISCHENSUMME:</span><span className="tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-red-600 font-bold" taxClass="flex justify-between text-zinc-600" />
          <div className="flex justify-between text-base font-black bg-zinc-900 text-white p-2.5">
            <span>GESAMT:</span>
            <span className="tabular-nums text-red-400">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t-2 border-zinc-900 flex flex-col sm:flex-row justify-between items-end gap-4">
        <InvoiceQrCode invoice={invoice} size={80} />
        <div className="w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   7. Botanical Sage (organic-botanical)
   Warm sage greens, organic textures, calm artisanal balance
========================================================================= */
const OrganicBotanical: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-emerald-950 font-garamond text-xs sm:text-sm bg-emerald-50/20">
      <div className="border border-emerald-800/20 p-6 sm:p-10 rounded-2xl bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-emerald-900/10">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-widest text-emerald-700 font-semibold">Artisanal Botanical</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-900 mt-1">{invoice.company.name}</h1>
            <div className="text-xs text-emerald-800/70 mt-1 font-sans">{invoice.company.email} · {invoice.company.phone}</div>
          </div>
          <div className="sm:text-right font-sans">
            <div className="text-xl font-bold text-emerald-800">{invoice.invoiceNumber}</div>
            <div className="text-xs text-emerald-700 mt-1">Date: {invoice.issueDate}</div>
            <div className="text-xs text-emerald-700">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 border-b border-emerald-900/10 font-sans">
          <div>
            <span className="text-[11px] font-semibold uppercase text-emerald-700">Prepared For:</span>
            <div className="text-base font-bold text-emerald-950 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-emerald-800">{invoice.client.company}</div>
            <div className="text-xs text-emerald-700 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          {invoice.client.poNumber && (
            <div className="sm:text-right">
              <span className="text-[11px] text-emerald-700">PO Number:</span>
              <div className="font-mono text-xs font-bold text-emerald-900">{invoice.client.poNumber}</div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-emerald-800/20 text-xs font-bold text-emerald-900 uppercase">
                <th className="py-2.5 pr-4">Items / Offerings</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 pl-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/10 text-sm">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-semibold text-emerald-950">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-emerald-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-emerald-900/10 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-sans">
          <div className="flex-1 space-y-3">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <p className="text-xs text-emerald-800 italic">{invoice.notes}</p>}
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-emerald-900">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-emerald-700 font-bold" taxClass="flex justify-between text-emerald-900" />
            <div className="flex justify-between text-base font-bold text-emerald-950 pt-2 border-t border-emerald-800/20">
              <span>Total:</span>
              <span className="font-mono text-emerald-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-end gap-4 font-sans">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   8. Blueprint Drafting (blueprint-architect)
   Technical cyan lines, precision coordinates, architectural grid
========================================================================= */
const BlueprintArchitect: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-sky-950 font-jetbrains text-xs bg-sky-50/40">
      <div className="border-2 border-sky-800 p-6 sm:p-8 rounded bg-white relative">
        <div className="flex justify-between items-center text-[10px] text-sky-600 border-b border-sky-200 pb-2 mb-6">
          <span>PROJECT_CODE: // ARC-DWG-{invoice.invoiceNumber}</span>
          <span>SCALE: 1:1 // REV. 04</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-sky-800">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase">ARCHITECTURAL SPECIFICATION</span>
            <h1 className="text-2xl font-bold text-sky-900 mt-1">{invoice.company.name}</h1>
            <div className="text-xs text-sky-700 mt-1">{invoice.company.address} · {invoice.company.email}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-lg font-bold text-sky-900">DOC: {invoice.invoiceNumber}</div>
            <div className="text-xs text-sky-700">ISSUED: {invoice.issueDate}</div>
            <div className="text-xs text-sky-700">SETTLE: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-4 border-b border-sky-200 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase">CLIENT / CONTRACTOR:</span>
            <div className="font-bold text-sky-900 text-sm mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-sky-700">{invoice.client.company}</div>
            <div className="text-xs text-sky-600">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          {invoice.client.poNumber && (
            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-sky-600 uppercase">CONTRACT_PO:</span>
              <div className="font-bold text-sky-900">{invoice.client.poNumber}</div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="py-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-sky-800 text-[11px] font-bold text-sky-900 uppercase">
                <th className="py-2.5 pr-4">SPECIFICATION / SCOPE</th>
                <th className="py-2.5 px-3 text-right">UNITS</th>
                <th className="py-2.5 px-3 text-right">UNIT_COST</th>
                <th className="py-2.5 pl-4 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-medium text-sky-900">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-sky-950">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-sky-800 pt-4 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <div className="text-[11px] text-sky-700 italic">NOTES: {invoice.notes}</div>}
          </div>
          <div className="w-full sm:w-64 space-y-1 text-right text-xs">
            <div><span className="text-sky-600">SUBTOTAL:</span> <span className="font-bold tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-sky-800 font-bold" taxClass="flex justify-between text-sky-600" />
            <div className="text-sm font-bold text-sky-950 pt-2 border-t border-sky-300">
              NET_PAYABLE: {formatCurrency(calc.balanceDue, invoice.currency)}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sky-200 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-52"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   9. Heritage Press (vintage-typographic)
   Classic letterpress borders, Playfair serif, authentic stamp
========================================================================= */
const VintageTypographic: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-stone-900 font-playfair text-xs sm:text-sm bg-stone-100/60">
      <div className="border-4 border-double border-stone-800 p-6 sm:p-10 bg-white">
        <div className="text-center pb-6 border-b-2 border-stone-800">
          <div className="text-xs uppercase tracking-widest text-stone-600 font-sans font-bold">ESTABLISHED INVOICE RECORD</div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 mt-1">{invoice.company.name}</h1>
          <div className="text-xs text-stone-600 italic mt-1">{invoice.company.address} · {invoice.company.email}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-stone-300">
          <div>
            <div className="text-xs uppercase font-sans font-bold text-stone-500">BILLED UNTO:</div>
            <div className="text-base font-bold text-stone-900 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-stone-700 italic">{invoice.client.company}</div>
            <div className="text-xs text-stone-600 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          <div className="sm:text-right space-y-1">
            <div className="text-base font-bold text-stone-900 font-sans">No. {invoice.invoiceNumber}</div>
            <div className="text-xs text-stone-600">Dated: {invoice.issueDate}</div>
            <div className="text-xs text-stone-600">Due: {invoice.dueDate}</div>
            <div className="pt-1"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-stone-800 text-xs uppercase font-sans font-bold text-stone-800">
                <th className="py-2.5 pr-4">Particulars</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-medium text-stone-900">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-stone-950">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-stone-800 pt-6 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2 font-sans">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <p className="text-xs text-stone-600 italic font-playfair">{invoice.notes}</p>}
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-800 font-sans">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-stone-700 font-bold italic" taxClass="flex justify-between text-stone-700" />
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-800 font-playfair">
              <span>Grand Total:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-300 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   10. Pastel Atelier (pastel-playful)
   Soft lilac/violet tones, friendly rounded capsules
========================================================================= */
const PastelPlayful: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-slate-800 font-outfit text-xs sm:text-sm">
      <div className="bg-purple-50/60 p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg mb-2">
              ✦
            </div>
            <h1 className="text-2xl font-bold text-purple-950">{invoice.company.name}</h1>
            <p className="text-xs text-purple-700/80 mt-0.5">{invoice.company.email}</p>
          </div>
          <div className="sm:text-right">
            <span className="bg-purple-200/70 text-purple-800 font-bold text-xs px-3 py-1 rounded-full">
              Invoice #{invoice.invoiceNumber}
            </span>
            <div className="text-xs text-purple-600 mt-2">Issued: {invoice.issueDate}</div>
            <div className="text-xs text-purple-600">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Client</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-slate-600">{invoice.client.company}</div>
            <div className="text-xs text-slate-500 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          {invoice.client.poNumber && (
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">PO #</span>
              <div className="font-mono text-xs font-semibold text-slate-800">{invoice.client.poNumber}</div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-2xl border border-purple-100 p-4 mb-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-purple-100 text-xs font-bold text-purple-800">
                <th className="py-2.5 pr-4">Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-purple-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-3">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <p className="text-xs text-purple-900/70 italic">{invoice.notes}</p>}
          </div>
          <div className="w-full sm:w-64 bg-purple-600 text-white p-5 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs text-purple-200"><span>Subtotal</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-xs text-amber-200 font-bold" taxClass="flex justify-between text-xs text-purple-200" />
            <div className="flex justify-between text-base font-bold pt-2 border-t border-purple-400">
              <span>Total Due</span>
              <span className="font-mono tabular-nums text-purple-100">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   11. Editorial Vogue (editorial-magazine)
   High-contrast magazine layout, oversized numerals, chic fashion vibe
========================================================================= */
const EditorialMagazine: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 text-neutral-900 font-playfair text-xs sm:text-sm bg-white">
      <div className="border-b-4 border-black pb-6 flex flex-col sm:flex-row justify-between items-baseline gap-4">
        <div>
          <span className="text-[10px] tracking-[0.4em] uppercase font-sans font-bold block mb-1">Commercial Billing Document</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{invoice.company.name}</h1>
        </div>
        <div className="font-sans text-right">
          <span className="text-3xl sm:text-4xl font-bold font-mono text-neutral-950">№ {invoice.invoiceNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-b border-neutral-200 font-sans text-xs">
        <div>
          <span className="font-bold uppercase tracking-widest text-neutral-400 text-[10px]">Client Reference</span>
          <div className="text-base font-bold text-neutral-900 mt-1">{invoice.client.name}</div>
          <div className="text-neutral-600">{invoice.client.company}</div>
          <div className="text-neutral-500 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
        </div>
        <div>
          <span className="font-bold uppercase tracking-widest text-neutral-400 text-[10px]">Agency Origin</span>
          <div className="text-neutral-700 mt-1">{invoice.company.address}</div>
          <div className="text-neutral-700">{invoice.company.city}, {invoice.company.country}</div>
          <div className="text-neutral-500 mt-0.5">{invoice.company.email}</div>
        </div>
        <div className="sm:text-right space-y-1">
          <div><span className="text-neutral-400">Issue:</span> <span className="font-bold">{invoice.issueDate}</span></div>
          <div><span className="text-neutral-400">Due:</span> <span className="font-bold">{invoice.dueDate}</span></div>
          <div className="pt-2"><StatusStamp status={invoice.status} /></div>
        </div>
      </div>

      <div className="py-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-black font-sans text-xs font-black uppercase">
              <th className="py-3 pr-4">Editorial Production</th>
              <th className="py-3 px-3 text-right">Qty</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 pl-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-sm">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx}>
                  <td className="py-4 pr-4 font-semibold text-neutral-900">{item.description}</td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-neutral-700">{item.quantity}</td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-neutral-700">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-4 pl-4 text-right font-mono tabular-nums font-bold text-neutral-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black pt-6 flex flex-col sm:flex-row justify-between gap-8 font-sans">
        <div className="flex-1 space-y-3">
          <PaymentMethodInfo invoice={invoice} />
          {invoice.notes && <p className="text-xs text-neutral-500 font-playfair italic">{invoice.notes}</p>}
        </div>
        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-black font-bold uppercase" taxClass="flex justify-between text-neutral-600" />
          <div className="flex justify-between text-base font-bold pt-2 border-t border-black font-mono">
            <span>Total:</span>
            <span className="tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-neutral-200 flex justify-between items-end font-sans">
        <InvoiceQrCode invoice={invoice} size={80} />
        <div className="w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   12. Aurora Tech (vibrant-gradient)
   Gradient ribbon, frosted highlights, SaaS tech feel
========================================================================= */
const VibrantGradient: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="text-slate-900 font-jakarta text-xs sm:text-sm">
      <div className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {invoice.company.name}
            </div>
            <div className="text-xs text-slate-500 mt-1">{invoice.company.email} · {invoice.company.website}</div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">INVOICE</span>
            <div className="text-2xl font-mono font-extrabold text-slate-900">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500 mt-1">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recipient</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-slate-600">{invoice.client.company}</div>
            <div className="text-xs text-slate-500 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
          </div>
        </div>

        {/* Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-indigo-200 text-xs font-semibold text-indigo-900 uppercase">
                <th className="py-2.5 pr-4">Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx} className="hover:bg-indigo-50/20">
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex-1 space-y-3">
            <PaymentMethodInfo invoice={invoice} />
            {invoice.notes && <p className="text-xs text-slate-500">{invoice.notes}</p>}
          </div>
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-emerald-600 font-bold" taxClass="flex justify-between text-slate-600" />
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Amount Due:</span>
              <span className="font-mono text-indigo-600 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   13. Thermal Point-of-Sale (compact-receipt)
   Serrated edge aesthetic, monospace register layout, POS barcode
========================================================================= */
const CompactReceipt: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-6 sm:p-10 text-neutral-800 font-jetbrains text-xs max-w-xl mx-auto bg-neutral-50/50">
      <div className="bg-white p-6 sm:p-8 border border-neutral-300 shadow-sm relative space-y-4">
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-neutral-400 space-y-1">
          <div className="text-base font-bold text-neutral-900 uppercase tracking-widest">{invoice.company.name}</div>
          <div className="text-[11px] text-neutral-500">{invoice.company.address} · {invoice.company.phone}</div>
          <div className="text-[10px] text-neutral-400">TAX REG: {invoice.company.taxId || 'UNREGISTERED'}</div>
        </div>

        <div className="flex justify-between text-[11px] py-2 border-b border-dashed border-neutral-300">
          <div>REC#: <span className="font-bold">{invoice.invoiceNumber}</span></div>
          <div>DATE: {invoice.issueDate}</div>
        </div>

        <div className="text-[11px] text-neutral-600">
          <div>CUSTOMER: <span className="font-bold text-neutral-800">{invoice.client.name}</span></div>
          {invoice.client.company && <div>ACCT: {invoice.client.company}</div>}
        </div>

        {/* Line Items */}
        <div className="py-2 border-y border-dashed border-neutral-400">
          <div className="flex justify-between text-[10px] font-bold text-neutral-500 mb-1">
            <span>ITEM</span>
            <span>QTY x PRICE = TOTAL</span>
          </div>
          <div className="space-y-2 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <div key={idx} className="flex justify-between items-baseline">
                  <div className="pr-2 font-medium">{item.description}</div>
                  <div className="text-right whitespace-nowrap font-mono tabular-nums">
                    {item.quantity} x {formatCurrency(item.unitPrice, invoice.currency)} = {formatCurrency(lineTotal, invoice.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculations */}
        <div className="space-y-1 text-xs text-right">
          <div>SUBTOTAL: <span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-neutral-700 font-bold" taxClass="flex justify-between text-neutral-600" />
          <div className="text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-400">
            TOTAL DUE: <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <StatusStamp status={invoice.status} />
        </div>

        <div className="pt-4 border-t border-dashed border-neutral-300 flex justify-between items-center">
          <InvoiceQrCode invoice={invoice} size={65} />
          <BarcodeSvg code={invoice.invoiceNumber} />
        </div>
        <div className="text-[10px] text-neutral-400 text-center tracking-wider font-mono">
          *** THANK YOU FOR YOUR PATRONAGE ***
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   14. Nordic Frost (nordic-frost)
   Muted icy blue, Scandinavian simplicity, airy functionalism
========================================================================= */
const NordicFrost: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 text-slate-800 font-outfit text-xs sm:text-sm bg-sky-50/20">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-sky-100">
        <div>
          <span className="text-[11px] font-medium tracking-widest text-sky-600 uppercase">Nordic Studio</span>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 mt-0.5">{invoice.company.name}</h1>
          <div className="text-xs text-slate-500 mt-1">{invoice.company.email} · {invoice.company.city}</div>
        </div>
        <div className="sm:text-right">
          <div className="text-xl font-mono font-semibold text-sky-800">{invoice.invoiceNumber}</div>
          <div className="text-xs text-slate-400 mt-0.5">Due {invoice.dueDate}</div>
          <div className="mt-2"><StatusStamp status={invoice.status} /></div>
        </div>
      </div>

      <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 border-b border-sky-100">
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Client</span>
          <div className="text-base font-medium text-slate-900 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-slate-600">{invoice.client.company}</div>
          <div className="text-xs text-slate-500 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
        </div>
      </div>

      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-sky-200 text-xs font-medium text-sky-800 uppercase">
              <th className="py-2.5 pr-4">Scope</th>
              <th className="py-2.5 px-3 text-right">Units</th>
              <th className="py-2.5 px-3 text-right">Rate</th>
              <th className="py-2.5 pl-4 text-right">Sum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx}>
                  <td className="py-3.5 pr-4 font-normal text-slate-800">{item.description}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-medium text-slate-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-6 border-t border-sky-100 flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex-1 space-y-3">
          <PaymentMethodInfo invoice={invoice} />
        </div>
        <div className="w-full sm:w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-sky-800 font-bold" taxClass="flex justify-between text-slate-600" />
          <div className="flex justify-between text-base font-semibold text-slate-900 pt-2 border-t border-sky-200">
            <span>Payable:</span>
            <span className="font-mono text-sky-700 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 flex justify-between items-end">
        <InvoiceQrCode invoice={invoice} size={70} />
        <div className="w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   15. Kyoto Zen (kyoto-zen)
   Japanese red Hanko seal, ink wash aesthetic, balanced quiet simplicity
========================================================================= */
const KyotoZen: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 text-stone-800 font-garamond text-xs sm:text-sm bg-stone-50/30">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stone-300">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-rose-800 font-bold block mb-1">RECHNUNG · 請求書</span>
          <h1 className="text-3xl font-normal tracking-wide text-stone-900">{invoice.company.name}</h1>
          <div className="text-xs text-stone-500 mt-1 italic">{invoice.company.city}, {invoice.company.country}</div>
        </div>
        <div className="sm:text-right flex flex-col sm:items-end">
          <div className="text-xl font-mono text-stone-800">{invoice.invoiceNumber}</div>
          <div className="text-xs text-stone-500 mt-1">{invoice.issueDate}</div>
          {/* Hanko Seal */}
          <div className="mt-2 w-10 h-10 border-2 border-rose-700 rounded-full flex items-center justify-center text-rose-700 font-bold text-[10px] tracking-tight transform rotate-6 select-none">
            済証
          </div>
        </div>
      </div>

      <div className="py-6 border-b border-stone-200">
        <span className="text-[11px] font-sans text-stone-400 uppercase tracking-wider">Client</span>
        <div className="text-base font-medium text-stone-900 mt-0.5">{invoice.client.name}</div>
        <div className="text-xs text-stone-600 italic">{invoice.client.company}</div>
        <div className="text-xs text-stone-500 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
      </div>

      <div className="py-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-800 font-sans text-xs uppercase text-stone-600">
              <th className="py-2.5 pr-4">Description</th>
              <th className="py-2.5 px-3 text-right">Quantity</th>
              <th className="py-2.5 px-3 text-right">Unit</th>
              <th className="py-2.5 pl-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx}>
                  <td className="py-3.5 pr-4 text-stone-900">{item.description}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-semibold">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex-1 space-y-2">
          <PaymentMethodInfo invoice={invoice} />
        </div>
        <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-800">
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-rose-800 font-bold" taxClass="flex justify-between text-stone-700" />
          <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-400">
            <span>Total Due:</span>
            <span className="font-mono text-rose-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-stone-200 flex justify-between items-end">
        <InvoiceQrCode invoice={invoice} size={70} />
        <div className="w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   16. Crimson Power (crimson-bold)
   High-impact red banner, heavy dividers, assertive presence
========================================================================= */
const CrimsonBold: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="text-neutral-900 font-syne text-xs sm:text-sm">
      <div className="bg-rose-900 text-white p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-bold text-rose-300">COMMERCIAL INVOICE</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">{invoice.company.name}</h1>
          <p className="text-xs text-rose-200 mt-1 font-jakarta">{invoice.company.email}</p>
        </div>
        <div className="sm:text-right font-jakarta">
          <div className="text-2xl font-mono font-bold">{invoice.invoiceNumber}</div>
          <div className="text-xs text-rose-200 mt-1">Due Date: {invoice.dueDate}</div>
        </div>
      </div>

      <div className="p-8 sm:p-12 font-jakarta">
        <div className="pb-6 border-b-2 border-rose-900 flex justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-rose-800">Billed To</span>
            <div className="text-base font-bold text-neutral-900 mt-1">{invoice.client.name}</div>
            <div className="text-xs text-neutral-600">{invoice.client.company}</div>
          </div>
          <StatusStamp status={invoice.status} />
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-rose-900 text-xs font-bold text-rose-900 uppercase">
                <th className="py-2.5 pr-4">Item</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-bold text-neutral-900">{item.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-bold text-rose-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t-2 border-rose-900 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-rose-900 font-bold" taxClass="flex justify-between text-neutral-600" />
            <div className="flex justify-between text-base font-bold bg-rose-900 text-white p-3 rounded">
              <span>Total:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   17. Sunset Radiant (sunset-radiant)
   Warm amber, apricot & terracotta highlights
========================================================================= */
const SunsetRadiant: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-stone-800 font-outfit text-xs sm:text-sm bg-amber-50/30">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 rounded-2xl text-white flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-widest font-bold uppercase text-amber-100">CREATIVE BILLING</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-0.5">{invoice.company.name}</h1>
          <p className="text-xs text-amber-100 mt-1">{invoice.company.email}</p>
        </div>
        <div className="sm:text-right">
          <div className="text-2xl font-mono font-bold">#{invoice.invoiceNumber}</div>
          <div className="text-xs text-amber-100 mt-1">Due: {invoice.dueDate}</div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-xs mt-6 border border-amber-100 space-y-6">
        <div className="flex justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase">Client</span>
            <div className="text-base font-bold text-stone-900 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-stone-600">{invoice.client.company}</div>
          </div>
          <StatusStamp status={invoice.status} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-amber-200 text-xs font-bold text-amber-800 uppercase">
                <th className="py-2.5 pr-4">Item</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-semibold text-stone-900">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-amber-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-amber-100 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-800">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-amber-700 font-bold" taxClass="flex justify-between text-stone-700" />
            <div className="flex justify-between text-base font-bold text-amber-900 pt-2 border-t border-amber-300">
              <span>Total Due:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-amber-100 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   18. Cyberpunk HUD (cyberpunk-hud)
   Chamfered corners, electric cyan accents, tactical readouts
========================================================================= */
const CyberpunkHud: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-cyan-900 font-space text-xs bg-slate-50">
      <div className="border-2 border-cyan-500 p-6 sm:p-8 bg-white relative">
        <div className="flex justify-between items-center text-[10px] text-cyan-600 font-mono mb-4 border-b border-cyan-200 pb-2">
          <span>// PROTOCOL_SYS_INVOICE</span>
          <span>NET_AUTH: OK // ENCR: 256</span>
        </div>

        <div className="flex justify-between items-start pb-6 border-b-2 border-cyan-500">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{invoice.company.name}</h1>
            <div className="text-xs text-cyan-700 font-mono mt-1">{invoice.company.email}</div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xl font-bold text-cyan-600">ID: {invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500">DUE: {invoice.dueDate}</div>
            <div className="mt-1"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-4 border-b border-cyan-200">
          <span className="text-[10px] font-bold text-cyan-600 font-mono">TARGET_CLIENT:</span>
          <div className="text-sm font-bold text-slate-900">{invoice.client.name}</div>
          <div className="text-xs text-slate-600 font-mono">{invoice.client.company}</div>
        </div>

        <div className="py-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-cyan-500 text-cyan-800 font-bold uppercase">
                <th className="py-2 pr-3">MODULE</th>
                <th className="py-2 px-2 text-right">QTY</th>
                <th className="py-2 px-2 text-right">RATE</th>
                <th className="py-2 pl-3 text-right">VAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-100">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900">&gt; {item.description}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-2.5 pl-3 text-right font-bold text-cyan-900 tabular-nums">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-cyan-500 pt-4 flex flex-col sm:flex-row justify-between gap-6 font-mono">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1 text-right">
            <div><span className="text-slate-500">SUBTOTAL:</span> <span className="tabular-nums font-bold">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-cyan-400 font-mono font-bold" taxClass="flex justify-between text-slate-400" />
            <div className="text-sm font-bold text-cyan-600 pt-2 border-t border-cyan-300">
              NET_DUE: {formatCurrency(calc.balanceDue, invoice.currency)}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-cyan-200 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-52"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   19. Neumorphic Studio (neumorphic-soft)
   Tactile soft shadows, embossed cards, smooth surfaces
========================================================================= */
const NeumorphicSoft: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-slate-700 font-jakarta text-xs sm:text-sm bg-slate-100">
      <div className="bg-slate-100 p-8 rounded-3xl shadow-[8px_8px_16px_#cbd5e1,-8px_-8px_16px_#ffffff] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{invoice.company.name}</h1>
            <p className="text-xs text-slate-500 mt-1">{invoice.company.email}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-xl font-mono font-bold text-slate-800">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl shadow-[inset_3px_3px_6px_#cbd5e1,inset_-3px_-3px_6px_#ffffff]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Client</span>
          <div className="font-bold text-slate-800 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-slate-500">{invoice.client.company}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-300 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2.5 pr-4">Item</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-slate-800">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-indigo-600 font-medium" taxClass="flex justify-between text-slate-600" />
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>Total:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   20. Metro Grid (metro-grid)
   Modular colored tiles, clear visual segmentation
========================================================================= */
const MetroGrid: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-slate-900 font-space text-xs sm:text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="sm:col-span-2 bg-blue-600 text-white p-6 rounded">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">INVOICE DOCUMENT</span>
          <h1 className="text-2xl font-bold mt-1">{invoice.company.name}</h1>
          <div className="text-xs text-blue-100 mt-2">{invoice.company.email} · {invoice.company.city}</div>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-mono">#{invoice.invoiceNumber}</div>
          <div className="mt-2"><StatusStamp status={invoice.status} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-100 p-4 rounded">
          <span className="text-[10px] font-bold uppercase text-slate-500">BILLED TO</span>
          <div className="font-bold text-slate-900 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-slate-600">{invoice.client.company}</div>
        </div>
        <div className="bg-slate-100 p-4 rounded text-xs space-y-1">
          <div><span className="text-slate-500">ISSUED:</span> <span className="font-bold">{invoice.issueDate}</span></div>
          <div><span className="text-slate-500">DUE:</span> <span className="font-bold">{invoice.dueDate}</span></div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded p-4 mb-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-300 text-xs font-bold uppercase text-slate-700">
              <th className="py-2 pr-4">DELIVERABLE</th>
              <th className="py-2 px-3 text-right">QTY</th>
              <th className="py-2 px-3 text-right">RATE</th>
              <th className="py-2 pl-4 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoice.items.map((item, idx) => {
              const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
              return (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{item.description}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums font-bold text-slate-950">{formatCurrency(lineTotal, invoice.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-slate-100 p-4 rounded">
          <PaymentMethodInfo invoice={invoice} />
        </div>
        <div className="bg-blue-600 text-white p-5 rounded space-y-2">
          <div className="text-xs text-blue-200 flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
          <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="text-xs text-emerald-300 font-bold flex justify-between" taxClass="text-xs text-blue-200 flex justify-between" />
          <div className="text-base font-bold pt-2 border-t border-blue-400 flex justify-between">
            <span>Total:</span>
            <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
        <InvoiceQrCode invoice={invoice} size={70} />
        <div className="w-56"><RenderSignature invoice={invoice} /></div>
      </div>
    </div>
  );
};

/* =========================================================================
   21. Brutalist Monolith (high-contrast-monolith)
   Stark 3px black borders, no gradients, pure raw graphic impact
========================================================================= */
const HighContrastMonolith: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-black font-space text-xs sm:text-sm bg-white">
      <div className="border-4 border-black p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-4 border-black pb-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 inline-block">INVOICE</div>
            <h1 className="text-3xl font-black uppercase mt-2">{invoice.company.name}</h1>
            <div className="text-xs font-mono mt-1">{invoice.company.email} · {invoice.company.city}</div>
          </div>
          <div className="sm:text-right font-mono">
            <div className="text-3xl font-black">#{invoice.invoiceNumber}</div>
            <div className="text-xs mt-1">DUE: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="border-b-4 border-black pb-6">
          <div className="text-xs font-black uppercase">CLIENT:</div>
          <div className="text-lg font-black mt-0.5">{invoice.client.name}</div>
          <div className="text-xs font-mono">{invoice.client.company} · {invoice.client.address}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b-4 border-black text-xs font-black uppercase">
                <th className="py-2 pr-4">ITEM</th>
                <th className="py-2 px-3 text-right">QTY</th>
                <th className="py-2 px-3 text-right">PRICE</th>
                <th className="py-2 pl-4 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4 font-bold">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 pl-4 text-right font-black tabular-nums">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t-4 border-black pt-6 flex flex-col sm:flex-row justify-between gap-6 font-mono">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-right">
            <div>SUBTOTAL: <span className="font-bold tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between font-mono font-bold" taxClass="flex justify-between font-mono" />
            <div className="text-base font-black bg-black text-white p-2.5 mt-2 flex justify-between">
              <span>TOTAL:</span>
              <span className="tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   22. Cobalt Advisory (cobalt-executive)
   Deep cobalt blue, bank-grade presentation
========================================================================= */
const CobaltExecutive: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="text-slate-900 font-jakarta text-xs sm:text-sm">
      <div className="border-t-8 border-blue-800 p-8 sm:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-8 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">ADVISORY INVOICE</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{invoice.company.name}</h1>
            <div className="text-xs text-slate-500 mt-1">{invoice.company.address} · {invoice.company.email}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-2xl font-mono font-bold text-blue-900">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-500 mt-1">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 border-b border-slate-200 flex justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Account</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{invoice.client.name}</div>
            <div className="text-xs text-slate-600">{invoice.client.company}</div>
          </div>
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50 text-blue-900 text-xs font-bold uppercase">
                <th className="py-2.5 px-4">Professional Service</th>
                <th className="py-2.5 px-3 text-right">Hours/Units</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-blue-950">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-blue-800 font-bold" taxClass="flex justify-between text-slate-600" />
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Amount Due:</span>
              <span className="font-mono text-blue-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   23. Emerald Wealth (emerald-enterprise)
   Forest green & brass gold, legal & private equity prestige
========================================================================= */
const EmeraldEnterprise: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-emerald-950 font-garamond text-xs sm:text-sm bg-white">
      <div className="border-t-4 border-b-4 border-emerald-900 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-emerald-900/20">
          <div>
            <span className="text-[10px] font-cinzel font-bold text-emerald-700 tracking-widest uppercase">WEALTH & LEGAL ADVISORY</span>
            <h1 className="text-3xl font-bold text-emerald-950 mt-1">{invoice.company.name}</h1>
            <div className="text-xs text-emerald-800 font-sans mt-1">{invoice.company.email} · {invoice.company.phone}</div>
          </div>
          <div className="sm:text-right font-sans">
            <div className="text-xl font-bold text-emerald-900 font-mono">{invoice.invoiceNumber}</div>
            <div className="text-xs text-emerald-700 mt-1">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 border-b border-emerald-900/10 font-sans">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Principal Party:</span>
          <div className="text-base font-bold text-emerald-950 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-emerald-800">{invoice.client.company}</div>
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-emerald-900 font-sans text-xs font-bold text-emerald-900 uppercase">
                <th className="py-2.5 pr-4">Services Rendered</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Sum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10 text-sm">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-semibold text-emerald-950">{item.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-bold text-emerald-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-emerald-900/20 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-sans">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-emerald-900">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-emerald-800 font-bold" taxClass="flex justify-between text-emerald-900" />
            <div className="flex justify-between text-base font-bold text-emerald-950 pt-2 border-t border-emerald-900">
              <span>Settlement Due:</span>
              <span className="font-mono text-emerald-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end font-sans">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   24. Artisan Terracotta (warm-terracotta)
   Warm clay, earth and linen tones for craft & studio makers
========================================================================= */
const WarmTerracotta: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-stone-800 font-garamond text-xs sm:text-sm bg-orange-50/20">
      <div className="border border-orange-900/20 p-6 sm:p-10 rounded-xl bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-orange-900/10">
          <div>
            <span className="text-[10px] font-sans font-bold text-orange-800 uppercase tracking-widest">HANDMADE & BESPOKE</span>
            <h1 className="text-3xl font-bold text-stone-900 mt-0.5">{invoice.company.name}</h1>
            <div className="text-xs text-stone-600 mt-1">{invoice.company.address} · {invoice.company.email}</div>
          </div>
          <div className="sm:text-right font-sans">
            <div className="text-xl font-bold text-orange-950 font-mono">№ {invoice.invoiceNumber}</div>
            <div className="text-xs text-stone-500 mt-1">Due: {invoice.dueDate}</div>
            <div className="mt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 border-b border-orange-900/10 font-sans">
          <span className="text-[11px] font-bold text-orange-700 uppercase">Patron / Client</span>
          <div className="text-base font-bold text-stone-900 mt-0.5">{invoice.client.name}</div>
          <div className="text-xs text-stone-600">{invoice.client.company}</div>
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-orange-900/20 font-sans text-xs font-bold text-orange-950 uppercase">
                <th className="py-2.5 pr-4">Craft Work</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-900/10 text-sm">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-semibold text-stone-900">{item.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-bold text-orange-900">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-orange-900/10 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-sans">
          <div className="flex-1 space-y-2">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-orange-900 font-bold" taxClass="flex justify-between text-stone-700" />
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-orange-900/30">
              <span>Total:</span>
              <span className="font-mono text-orange-800 tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 flex justify-between items-end font-sans">
          <InvoiceQrCode invoice={invoice} size={70} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   25. Art Deco Gatsby (art-deco-luxe)
   1920s geometric corner ornaments, obsidian & champagne gold
========================================================================= */
const ArtDecoLuxe: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 text-stone-900 font-cinzel text-xs sm:text-sm bg-stone-900">
      <div className="border-4 border-amber-500/80 p-6 sm:p-10 bg-stone-950 text-stone-100 relative">
        {/* Deco Corner Marks */}
        <div className="text-center pb-8 border-b-2 border-amber-500/60">
          <div className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold">ESTABLISHED MCMXXVI</div>
          <h1 className="text-3xl font-extrabold tracking-widest text-amber-200 mt-1">{invoice.company.name}</h1>
          <div className="text-xs text-amber-400/70 font-sans mt-1">{invoice.company.address} · {invoice.company.city}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-amber-500/30 font-sans text-xs">
          <div>
            <span className="text-[10px] font-cinzel font-bold text-amber-400 uppercase tracking-widest">Client Engagement</span>
            <div className="text-base font-bold text-stone-100 font-cinzel mt-0.5">{invoice.client.name}</div>
            <div className="text-stone-400">{invoice.client.company}</div>
          </div>
          <div className="sm:text-right space-y-1">
            <div className="text-lg font-bold text-amber-300 font-cinzel">№ {invoice.invoiceNumber}</div>
            <div className="text-stone-400">Date: {invoice.issueDate}</div>
            <div className="text-stone-400">Due: {invoice.dueDate}</div>
            <div className="pt-2"><StatusStamp status={invoice.status} /></div>
          </div>
        </div>

        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b-2 border-amber-500/60 font-cinzel text-amber-300 font-bold uppercase">
                <th className="py-3 pr-4">Luxury Portfolio Schedule</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Rate</th>
                <th className="py-3 pl-4 text-right">Sum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {invoice.items.map((item, idx) => {
                const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
                return (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 font-medium text-stone-200">{item.description}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-stone-400">{item.quantity}</td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-stone-400">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td className="py-3.5 pl-4 text-right font-mono tabular-nums font-bold text-amber-300">{formatCurrency(lineTotal, invoice.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-amber-500/60 pt-6 flex flex-col sm:flex-row justify-between gap-6 font-sans">
          <div className="flex-1 space-y-2 text-stone-300">
            <PaymentMethodInfo invoice={invoice} />
          </div>
          <div className="w-full sm:w-64 space-y-1.5 text-xs text-stone-300">
            <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono tabular-nums">{formatCurrency(calc.subtotal, invoice.currency)}</span></div>
            <InvoiceSummaryRows invoice={invoice} calc={calc} discountClass="flex justify-between text-amber-400 font-bold" taxClass="flex justify-between text-stone-300" />
            <div className="flex justify-between text-base font-cinzel font-bold text-amber-300 pt-2 border-t border-amber-500/40">
              <span>Total Due:</span>
              <span className="font-mono tabular-nums">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-800 flex justify-between items-end font-sans">
          <InvoiceQrCode invoice={invoice} size={75} />
          <div className="w-56"><RenderSignature invoice={invoice} /></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   Template Renderer Dispatcher
   Maps all 25 template IDs to their dedicated component
========================================================================= */
export const TemplateRenderer: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const calc = calculateInvoice(invoice);

  switch (invoice.templateId) {
    case 'modern-minimal':
      return <ModernMinimal invoice={invoice} calc={calc} />;
    case 'corporate-classic':
      return <CorporateClassic invoice={invoice} calc={calc} />;
    case 'creative-studio':
      return <CreativeStudio invoice={invoice} calc={calc} />;
    case 'tech-terminal':
      return <TechTerminal invoice={invoice} calc={calc} />;
    case 'luxury-gold':
      return <LuxuryGold invoice={invoice} calc={calc} />;
    case 'swiss-bauhaus':
      return <SwissBauhaus invoice={invoice} calc={calc} />;
    case 'organic-botanical':
      return <OrganicBotanical invoice={invoice} calc={calc} />;
    case 'blueprint-architect':
      return <BlueprintArchitect invoice={invoice} calc={calc} />;
    case 'vintage-typographic':
      return <VintageTypographic invoice={invoice} calc={calc} />;
    case 'pastel-playful':
      return <PastelPlayful invoice={invoice} calc={calc} />;
    case 'editorial-magazine':
      return <EditorialMagazine invoice={invoice} calc={calc} />;
    case 'vibrant-gradient':
      return <VibrantGradient invoice={invoice} calc={calc} />;
    case 'compact-receipt':
      return <CompactReceipt invoice={invoice} calc={calc} />;
    case 'nordic-frost':
      return <NordicFrost invoice={invoice} calc={calc} />;
    case 'kyoto-zen':
      return <KyotoZen invoice={invoice} calc={calc} />;
    case 'crimson-bold':
      return <CrimsonBold invoice={invoice} calc={calc} />;
    case 'sunset-radiant':
      return <SunsetRadiant invoice={invoice} calc={calc} />;
    case 'cyberpunk-hud':
      return <CyberpunkHud invoice={invoice} calc={calc} />;
    case 'neumorphic-soft':
      return <NeumorphicSoft invoice={invoice} calc={calc} />;
    case 'metro-grid':
      return <MetroGrid invoice={invoice} calc={calc} />;
    case 'high-contrast-monolith':
      return <HighContrastMonolith invoice={invoice} calc={calc} />;
    case 'cobalt-executive':
      return <CobaltExecutive invoice={invoice} calc={calc} />;
    case 'emerald-enterprise':
      return <EmeraldEnterprise invoice={invoice} calc={calc} />;
    case 'warm-terracotta':
      return <WarmTerracotta invoice={invoice} calc={calc} />;
    case 'art-deco-luxe':
      return <ArtDecoLuxe invoice={invoice} calc={calc} />;
    case 'neo-brutalist-pop':
      return <NeoBrutalistPop invoice={invoice} calc={calc} />;
    case 'matrix-cyber':
      return <MatrixCyber invoice={invoice} calc={calc} />;
    case 'luxury-onyx':
      return <LuxuryOnyx invoice={invoice} calc={calc} />;
    case 'bauhaus-geometric':
      return <BauhausGeometric invoice={invoice} calc={calc} />;
    case 'retro-synthwave':
      return <RetroSynthwave invoice={invoice} calc={calc} />;
    case 'monochrome-editorial':
      return <MonochromeEditorial invoice={invoice} calc={calc} />;
    case 'art-nouveau-botanical':
      return <ArtNouveauBotanical invoice={invoice} calc={calc} />;
    case 'zenith-glassmorphism':
      return <ZenithGlassmorphism invoice={invoice} calc={calc} />;
    default:
      return <ModernMinimal invoice={invoice} calc={calc} />;
  }
};

