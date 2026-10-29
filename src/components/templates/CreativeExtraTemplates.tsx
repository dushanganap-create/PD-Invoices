import React from 'react';
import { Invoice } from '../../types/invoice';
import { InvoiceCalculations } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import {
  InvoiceQrCode,
  PaymentMethodInfo,
  RenderSignature,
  StatusStamp,
  TemplateLogoBadge,
  InvoiceSummaryRows,
  BarcodeSvg,
} from './InvoiceCommonParts';

export interface TemplateProps {
  invoice: Invoice;
  calc: InvoiceCalculations;
}

/* =========================================================================
   26. Neo-Brutalist Pop (neo-brutalist-pop)
   Electric yellow/cyan blocks, 2.5px solid black borders, hard block shadow
========================================================================= */
export const NeoBrutalistPop: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 text-black font-space text-xs sm:text-sm bg-[#fafafa]">
      {/* Top Banner */}
      <div className="border-[3px] border-black bg-[#fef08a] p-6 shadow-[5px_5px_0px_#000] flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-4">
          {invoice.theme.showLogo && (
            <div className="border-2 border-black bg-white p-1 shadow-[3px_3px_0px_#000]">
              <TemplateLogoBadge
                name={invoice.company.name}
                templateId={invoice.templateId}
                logoUrl={invoice.company.logoUrl}
              />
            </div>
          )}
          <div>
            <span className="inline-block bg-black text-[#fef08a] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-1">
              ORIGIN BINDING
            </span>
            <div className="text-2xl font-black uppercase tracking-tight text-black">
              {invoice.company.name}
            </div>
            <div className="text-xs font-mono font-medium mt-1 text-neutral-800 space-y-0.5">
              <div>{invoice.company.address}</div>
              <div>{invoice.company.city}, {invoice.company.state} {invoice.company.postalCode}</div>
              <div>{invoice.company.email} · {invoice.company.phone}</div>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <div className="inline-block bg-[#a5f3fc] border-2 border-black px-3 py-1 text-sm font-black uppercase shadow-[3px_3px_0px_#000]">
            INV: {invoice.invoiceNumber}
          </div>
          <div className="mt-3 font-mono text-xs font-bold space-y-1">
            <div>DATE: {invoice.issueDate}</div>
            <div className="text-rose-600">DUE: {invoice.dueDate}</div>
          </div>
          <div className="mt-2">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Bill To & Meta Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="border-[2.5px] border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
          <div className="text-[10px] font-black uppercase tracking-wider bg-black text-white inline-block px-1.5 py-0.5 mb-2">
            CLIENT RECIPIENT
          </div>
          <div className="text-base font-black text-black">{invoice.client.name}</div>
          {invoice.client.company && <div className="font-bold text-xs">{invoice.client.company}</div>}
          <div className="text-xs font-mono mt-1 text-neutral-700">
            <div>{invoice.client.address}</div>
            <div>{invoice.client.city}, {invoice.client.state} {invoice.client.postalCode}</div>
            <div>{invoice.client.email}</div>
          </div>
        </div>

        <div className="border-[2.5px] border-black bg-[#fbcfe8] p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider bg-black text-white inline-block px-1.5 py-0.5 mb-2">
              TERMS & CONDITIONS
            </div>
            <div className="text-xs font-bold font-mono">
              NET TERMS: {invoice.paymentTerms}
            </div>
          </div>
          <div className="mt-3 text-[11px] font-mono text-neutral-800">
            Payment accepted via {invoice.payment.method.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border-[3px] border-black shadow-[5px_5px_0px_#000] bg-white overflow-hidden my-6">
        <div className="grid grid-cols-12 bg-black text-white px-4 py-2.5 font-black text-xs uppercase tracking-wider">
          <div className="col-span-6">DESCRIPTION</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-right">PRICE</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>

        <div className="divide-y-2 divide-black font-mono">
          {invoice.items.map((item, idx) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div
                key={item.id}
                className={`grid grid-cols-12 px-4 py-3 text-xs items-center ${
                  idx % 2 === 1 ? 'bg-[#fef9c3]/30' : 'bg-white'
                }`}
              >
                <div className="col-span-6 font-sans font-bold text-neutral-900">
                  {item.description}
                  {item.sku && <span className="block text-[10px] font-mono text-neutral-500">SKU: {item.sku}</span>}
                </div>
                <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                <div className="col-span-2 text-right font-medium">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-black">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-6">
        <div className="sm:col-span-7 space-y-4">
          <PaymentMethodInfo invoice={invoice} className="border-2 border-black p-3 bg-white shadow-[3px_3px_0px_#000]" />
          {invoice.notes && (
            <div className="border-2 border-black p-3 bg-[#e0e7ff] shadow-[3px_3px_0px_#000] text-xs font-mono">
              <span className="font-black block uppercase text-[10px]">MEMO:</span>
              {invoice.notes}
            </div>
          )}
          <RenderSignature invoice={invoice} />
        </div>

        <div className="sm:col-span-5 border-[3px] border-black bg-white p-4 shadow-[5px_5px_0px_#000] space-y-2 text-xs font-mono">
          <div className="flex justify-between font-bold">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-700 font-bold"
            taxClass="flex justify-between font-bold"
          />

          <div className="border-t-2 border-black pt-2 flex justify-between text-base font-black bg-[#fef08a] p-2 border border-black">
            <span>BALANCE DUE:</span>
            <span>{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   27. Matrix Cyberdeck (matrix-cyber)
   Phosphor emerald glowing HUD, dark matrix background, CLI telemetry
========================================================================= */
export const MatrixCyber: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 bg-neutral-950 text-emerald-400 font-jetbrains text-xs sm:text-sm selection:bg-emerald-500 selection:text-black min-h-full">
      {/* Command prompt banner */}
      <div className="border border-emerald-500/40 bg-neutral-900/80 p-5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="text-[10px] text-emerald-600 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SYS_NET://TRANSACTION_PROTOCOL
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-300 mt-1">
            {invoice.company.name}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1 font-mono">
            {invoice.company.email} · {invoice.company.phone} · TAX_ID: {invoice.company.taxId || 'N/A'}
          </div>
        </div>

        <div className="sm:text-right font-mono">
          <div className="text-xs text-emerald-500 uppercase">IDENTIFIER</div>
          <div className="text-lg font-bold text-emerald-300 font-mono">
            {invoice.invoiceNumber}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            TIMESTAMP: {invoice.issueDate} | EXP: {invoice.dueDate}
          </div>
          <div className="mt-2">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Target Recipient Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="border border-emerald-500/30 bg-neutral-900/50 p-4 rounded-lg">
          <div className="text-[10px] uppercase text-emerald-600 font-bold tracking-wider mb-1">
            &gt; TARGET_RECIPIENT
          </div>
          <div className="text-sm font-bold text-emerald-200">{invoice.client.name}</div>
          {invoice.client.company && <div className="text-xs text-emerald-400">{invoice.client.company}</div>}
          <div className="text-[11px] text-emerald-500/80 mt-1 font-mono">
            <div>{invoice.client.address}</div>
            <div>{invoice.client.city}, {invoice.client.country}</div>
            <div>{invoice.client.email}</div>
          </div>
        </div>

        <div className="border border-emerald-500/30 bg-neutral-900/50 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase text-emerald-600 font-bold tracking-wider mb-1">
              &gt; CRYPTO_LEDGER_CONFIG
            </div>
            <div className="text-xs text-emerald-300">
              PAYMENT_CHANNEL: {invoice.payment.method.toUpperCase()}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">
              HASH: 0x{Math.abs(calc.total * 38291).toString(16).padStart(12, '0')}
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-mono">SECURE MATRIX PROTOCOL V4.2</div>
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="border border-emerald-500/40 rounded-lg overflow-hidden bg-neutral-900/40 my-6">
        <div className="grid grid-cols-12 bg-emerald-950/70 border-b border-emerald-500/30 px-4 py-2.5 text-[11px] font-bold text-emerald-400 tracking-wider">
          <div className="col-span-6">SERVICE_DESCRIPTOR</div>
          <div className="col-span-2 text-center">QUANTITY</div>
          <div className="col-span-2 text-right">UNIT_RATE</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </div>

        <div className="divide-y divide-emerald-500/20">
          {invoice.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-emerald-950/30 transition-colors">
                <div className="col-span-6 text-emerald-200">
                  {item.description}
                  {item.sku && <span className="block text-[10px] text-emerald-600">ID: {item.sku}</span>}
                </div>
                <div className="col-span-2 text-center text-emerald-300">{item.quantity}</div>
                <div className="col-span-2 text-right text-emerald-400">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-bold text-emerald-300">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-6">
        <div className="sm:col-span-7 space-y-3">
          <div className="border border-emerald-500/30 p-3 rounded bg-neutral-900/40 text-xs">
            <span className="text-[10px] text-emerald-600 uppercase block font-bold mb-1">NOTES_PAYLOAD</span>
            <span className="text-emerald-400">{invoice.notes || 'Execution terms valid upon verification.'}</span>
          </div>
          <RenderSignature invoice={invoice} />
        </div>

        <div className="sm:col-span-5 border border-emerald-500/50 bg-neutral-900/90 p-4 rounded-lg space-y-2 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          <div className="flex justify-between text-emerald-400">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-300 font-bold"
            taxClass="flex justify-between text-emerald-500"
          />

          <div className="border-t border-emerald-500/40 pt-2 flex justify-between text-sm sm:text-base font-bold text-emerald-300">
            <span>TOTAL_DUE:</span>
            <span>{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   28. Onyx & Royal Gold (luxury-onyx)
   Midnight obsidian card, polished champagne gold double hairline borders
========================================================================= */
export const LuxuryOnyx: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 bg-neutral-950 text-neutral-200 font-cinzel text-xs sm:text-sm border-8 border-neutral-900">
      {/* Outer Gold Hairline Border Frame */}
      <div className="border border-amber-600/40 p-6 sm:p-8 relative">
        <div className="absolute top-2 left-2 text-[9px] text-amber-500/60 font-serif">✦</div>
        <div className="absolute top-2 right-2 text-[9px] text-amber-500/60 font-serif">✦</div>
        <div className="absolute bottom-2 left-2 text-[9px] text-amber-500/60 font-serif">✦</div>
        <div className="absolute bottom-2 right-2 text-[9px] text-amber-500/60 font-serif">✦</div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-amber-600/30 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-amber-500">Maison De Prestige</div>
            <div className="text-2xl sm:text-3xl font-bold tracking-wider text-amber-200 mt-1">
              {invoice.company.name}
            </div>
            <div className="text-xs font-garamond italic text-neutral-400 mt-1">
              {invoice.company.address} · {invoice.company.city}, {invoice.company.country}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs tracking-[0.25em] uppercase text-amber-500">Statement Of Account</div>
            <div className="text-lg font-bold text-white tracking-widest mt-0.5">
              № {invoice.invoiceNumber}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1 font-garamond italic">
              Issued: {invoice.issueDate} · Due: {invoice.dueDate}
            </div>
            <div className="mt-2">
              <StatusStamp status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Client Address */}
        <div className="py-6 border-b border-amber-600/20 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-widest uppercase text-amber-500">Presented To</div>
            <div className="text-base font-bold text-amber-100 mt-1">{invoice.client.name}</div>
            {invoice.client.company && <div className="text-xs text-neutral-300">{invoice.client.company}</div>}
            <div className="text-xs font-garamond text-neutral-400 mt-1">
              {invoice.client.address}, {invoice.client.city} · {invoice.client.email}
            </div>
          </div>
          <div className="sm:text-right font-garamond italic text-xs text-neutral-400">
            Terms: {invoice.paymentTerms}
          </div>
        </div>

        {/* Items Table */}
        <div className="my-8">
          <div className="grid grid-cols-12 pb-3 border-b border-amber-600/40 text-[10px] tracking-widest uppercase text-amber-400 font-bold">
            <div className="col-span-6">Particulars</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Sum</div>
          </div>

          <div className="divide-y divide-neutral-800 font-garamond">
            {invoice.items.map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <div key={item.id} className="grid grid-cols-12 py-3.5 text-xs sm:text-sm items-center">
                  <div className="col-span-6 font-semibold text-neutral-200">
                    {item.description}
                  </div>
                  <div className="col-span-2 text-center text-neutral-400">{item.quantity}</div>
                  <div className="col-span-2 text-right text-neutral-400">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                  <div className="col-span-2 text-right font-bold text-amber-200">{formatCurrency(lineTotal, invoice.currency)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-amber-600/30">
          <div className="space-y-3 max-w-sm">
            <PaymentMethodInfo invoice={invoice} className="text-neutral-400 font-garamond" />
            <RenderSignature invoice={invoice} />
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400 font-garamond">
              <span>Subtotal</span>
              <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
            </div>

            <InvoiceSummaryRows
              invoice={invoice}
              calc={calc}
              discountClass="flex justify-between text-emerald-400 font-garamond"
              taxClass="flex justify-between text-neutral-400 font-garamond"
            />

            <div className="border-t border-amber-600/40 pt-2 flex justify-between text-base font-bold text-amber-300">
              <span className="tracking-wider">Total Due</span>
              <span>{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   29. Bauhaus Constructivism (bauhaus-geometric)
   Primary color geometric blocks: cobalt blue, vermilion red, bright yellow
========================================================================= */
export const BauhausGeometric: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 bg-white text-neutral-900 font-space text-xs sm:text-sm">
      {/* Top Asymmetric Mondrian Grid */}
      <div className="grid grid-cols-12 border-4 border-black">
        {/* Cobalt Block */}
        <div className="col-span-12 sm:col-span-7 bg-[#2563eb] text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
              BAUHAUS WEIMAR · INVOICE
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase mt-1 tracking-tight">
              {invoice.company.name}
            </h1>
          </div>
          <div className="text-xs font-mono mt-4 text-blue-100">
            {invoice.company.email} · {invoice.company.address} · {invoice.company.city}
          </div>
        </div>

        {/* Cadmium Yellow Block */}
        <div className="col-span-12 sm:col-span-5 bg-[#facc15] text-black p-6 border-t-4 sm:border-t-0 sm:border-l-4 border-black flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase">REFERENCE NO.</div>
            <div className="text-xl font-black font-mono mt-0.5">{invoice.invoiceNumber}</div>
            <div className="mt-2 text-xs font-bold">
              <div>ISSUED: {invoice.issueDate}</div>
              <div>DUE: {invoice.dueDate}</div>
            </div>
          </div>
          <div className="mt-4">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Recipient Strip */}
      <div className="border-4 border-t-0 border-black p-6 bg-neutral-50 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
            CLIENT ADDRESS
          </span>
          <div className="text-base font-black mt-1.5">{invoice.client.name}</div>
          {invoice.client.company && <div className="font-bold text-xs">{invoice.client.company}</div>}
          <div className="text-xs text-neutral-600 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
        </div>
        <div className="sm:text-right font-mono text-xs">
          <span className="font-bold">TERMS: {invoice.paymentTerms}</span>
        </div>
      </div>

      {/* Items Section with vermilion accent header */}
      <div className="border-4 border-t-0 border-black overflow-hidden">
        <div className="grid grid-cols-12 bg-[#dc2626] text-white px-4 py-2.5 font-black text-xs uppercase tracking-wider">
          <div className="col-span-6">ITEM SPECIFICATION</div>
          <div className="col-span-2 text-center">QUANTITY</div>
          <div className="col-span-2 text-right">PRICE</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>

        <div className="divide-y-2 divide-black font-mono">
          {invoice.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center bg-white">
                <div className="col-span-6 font-bold text-black font-sans">{item.description}</div>
                <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-black">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Total Block with Vermilion Bar */}
      <div className="grid grid-cols-12 border-4 border-t-0 border-black">
        <div className="col-span-12 sm:col-span-7 p-6 bg-neutral-100 flex flex-col justify-between">
          <PaymentMethodInfo invoice={invoice} />
          <div className="mt-4">
            <RenderSignature invoice={invoice} />
          </div>
        </div>

        <div className="col-span-12 sm:col-span-5 bg-black text-white p-6 border-t-4 sm:border-t-0 sm:border-l-4 border-black space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-400 font-bold"
            taxClass="flex justify-between text-neutral-300"
          />

          <div className="border-t-2 border-neutral-700 pt-2 flex justify-between text-lg font-black text-[#facc15]">
            <span>TOTAL:</span>
            <span>{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   30. Synthwave Horizon (retro-synthwave)
   80s neon magenta & electric cyan chrome sunset gradient, retro grid
========================================================================= */
export const RetroSynthwave: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 bg-[#12072b] text-neutral-100 font-syne text-xs sm:text-sm selection:bg-pink-500 selection:text-white">
      {/* Synthwave Sunset Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-800 shadow-[0_0_30px_rgba(236,72,153,0.3)] border border-pink-500/40 flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-pink-200">
            Outrun 1984 · Studio Bill
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-white mt-1 drop-shadow-md">
            {invoice.company.name}
          </h1>
          <div className="text-xs text-pink-100/80 font-mono mt-1">
            {invoice.company.email} · {invoice.company.phone} · {invoice.company.city}
          </div>
        </div>

        <div className="sm:text-right font-mono">
          <div className="text-xs uppercase text-pink-300 font-bold">INVOICE NO.</div>
          <div className="text-xl font-extrabold text-cyan-300 drop-shadow-sm font-mono">
            {invoice.invoiceNumber}
          </div>
          <div className="text-xs text-pink-200 mt-1">
            DATE: {invoice.issueDate} | DUE: {invoice.dueDate}
          </div>
          <div className="mt-2">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Client & Meta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-xl bg-purple-950/40 border border-pink-500/30">
          <div className="text-[10px] uppercase text-pink-400 font-bold tracking-widest mb-1">
            BILL TO CLIENT
          </div>
          <div className="text-base font-bold text-white">{invoice.client.name}</div>
          {invoice.client.company && <div className="text-xs text-pink-200">{invoice.client.company}</div>}
          <div className="text-xs text-neutral-400 mt-1 font-mono">
            {invoice.client.address}, {invoice.client.city}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-950/40 border border-cyan-500/30 flex flex-col justify-between">
          <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-widest mb-1">
            PAYMENT TERMS
          </div>
          <div className="text-xs font-mono text-cyan-200">
            TERMS: {invoice.paymentTerms} via {invoice.payment.method.toUpperCase()}
          </div>
          <div className="text-[10px] text-pink-400/80 font-mono mt-2">DIGITAL SYNTH PROTOCOL</div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-pink-500/30 rounded-xl overflow-hidden bg-purple-950/20 my-6">
        <div className="grid grid-cols-12 bg-purple-950/80 px-4 py-2.5 font-bold text-xs uppercase text-pink-300 border-b border-pink-500/30">
          <div className="col-span-6">DESCRIPTION</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-right">UNIT</div>
          <div className="col-span-2 text-right">AMOUNT</div>
        </div>

        <div className="divide-y divide-purple-900/40 font-mono">
          {invoice.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div key={item.id} className="grid grid-cols-12 px-4 py-3 text-xs items-center">
                <div className="col-span-6 font-syne font-bold text-white">{item.description}</div>
                <div className="col-span-2 text-center text-cyan-300">{item.quantity}</div>
                <div className="col-span-2 text-right text-neutral-300">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-bold text-pink-300">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-6">
        <div className="sm:col-span-7 space-y-3">
          <PaymentMethodInfo invoice={invoice} className="text-neutral-300" />
          <RenderSignature invoice={invoice} />
        </div>

        <div className="sm:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-purple-950/70 to-indigo-950/70 border border-pink-500/40 space-y-2 text-xs font-mono shadow-lg">
          <div className="flex justify-between text-neutral-300">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-400 font-bold"
            taxClass="flex justify-between text-pink-300"
          />

          <div className="border-t border-pink-500/40 pt-2 flex justify-between text-base font-extrabold text-cyan-300">
            <span>TOTAL DUE:</span>
            <span>{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   31. Parisian Haute Editorial (monochrome-editorial)
   High-fashion magazine layout with oversized roman numerals, hairline rules
========================================================================= */
export const MonochromeEditorial: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-14 bg-white text-neutral-900 font-playfair text-xs sm:text-sm">
      {/* Top Title and Double Hairline Border */}
      <div className="text-center pb-8 border-b-2 border-neutral-900">
        <span className="text-[10px] tracking-[0.4em] uppercase font-sans text-neutral-500 block mb-1">
          BULLETIN D'HONORAIRES · ÉDITION SPÉCIALE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black italic tracking-tight uppercase">
          {invoice.company.name}
        </h1>
        <div className="text-xs font-sans text-neutral-500 mt-2 tracking-wider">
          {invoice.company.address} · {invoice.company.city}, {invoice.company.country} · {invoice.company.email}
        </div>
      </div>

      {/* Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 py-4 border-b border-neutral-300 font-sans text-[11px] gap-4">
        <div>
          <span className="text-neutral-400 uppercase text-[9px] block">RÉFÉRENCE</span>
          <span className="font-mono font-bold text-neutral-900">{invoice.invoiceNumber}</span>
        </div>
        <div>
          <span className="text-neutral-400 uppercase text-[9px] block">ÉMISSION</span>
          <span className="font-semibold text-neutral-900">{invoice.issueDate}</span>
        </div>
        <div>
          <span className="text-neutral-400 uppercase text-[9px] block">ÉCHÉANCE</span>
          <span className="font-semibold text-neutral-900">{invoice.dueDate}</span>
        </div>
        <div className="text-right">
          <StatusStamp status={invoice.status} />
        </div>
      </div>

      {/* Client Section */}
      <div className="py-6 border-b border-neutral-200">
        <span className="text-[10px] font-sans tracking-widest uppercase text-neutral-400 block mb-1">
          DESTINATAIRE (CLIENT)
        </span>
        <div className="text-xl font-bold italic">{invoice.client.name}</div>
        {invoice.client.company && <div className="text-xs font-sans font-medium text-neutral-600">{invoice.client.company}</div>}
        <div className="text-xs font-sans text-neutral-500 mt-0.5">
          {invoice.client.address}, {invoice.client.city} · {invoice.client.email}
        </div>
      </div>

      {/* Table */}
      <div className="my-8">
        <div className="grid grid-cols-12 pb-2 border-b-2 border-neutral-900 font-sans text-[10px] tracking-widest uppercase font-bold text-neutral-800">
          <div className="col-span-6">DESIGNATION DES PRESTATIONS</div>
          <div className="col-span-2 text-center">QUANTITÉ</div>
          <div className="col-span-2 text-right">PRIX UNITAIRE</div>
          <div className="col-span-2 text-right">MONTANT</div>
        </div>

        <div className="divide-y divide-neutral-200">
          {invoice.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div key={item.id} className="grid grid-cols-12 py-3.5 text-xs sm:text-sm items-center">
                <div className="col-span-6 font-semibold italic text-neutral-900">{item.description}</div>
                <div className="col-span-2 text-center font-sans text-neutral-600">{item.quantity}</div>
                <div className="col-span-2 text-right font-sans text-neutral-600">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-sans font-bold text-neutral-900">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t-2 border-neutral-900">
        <div className="space-y-3 font-sans text-xs">
          <PaymentMethodInfo invoice={invoice} />
          <RenderSignature invoice={invoice} />
        </div>

        <div className="w-full sm:w-64 space-y-2 font-sans text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Sous-Total</span>
            <span className="font-mono">{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-700 font-semibold"
            taxClass="flex justify-between text-neutral-600"
          />

          <div className="border-t border-neutral-900 pt-2 flex justify-between text-lg font-bold text-neutral-900 font-playfair italic">
            <span>Net à Payer</span>
            <span className="font-mono not-italic font-black">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   32. Art Nouveau Atelier (art-nouveau-botanical)
   Warm parchment, organic vine flourishes, botanical dark olive accents
========================================================================= */
export const ArtNouveauBotanical: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 bg-[#faf7ee] text-[#1c2d11] font-garamond text-xs sm:text-sm border-[6px] border-[#3f6212]/30">
      <div className="border border-[#3f6212]/40 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#3f6212]/30">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#4d7c0f] font-bold">
              ATELIER D'ART &amp; BOTANIQUE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold italic tracking-wide text-[#1a2e05] mt-0.5">
              {invoice.company.name}
            </h1>
            <div className="text-xs text-[#4d7c0f] mt-1 italic">
              {invoice.company.address} · {invoice.company.city}, {invoice.company.country}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-[#3f6212]">
              FACTURE #{invoice.invoiceNumber}
            </div>
            <div className="text-xs text-[#65a30d] mt-0.5">
              Date: {invoice.issueDate} · Due: {invoice.dueDate}
            </div>
            <div className="mt-2">
              <StatusStamp status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="py-6 border-b border-[#3f6212]/20 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#4d7c0f]">Facturé À:</span>
            <div className="text-base font-bold italic text-[#1a2e05] mt-1">{invoice.client.name}</div>
            {invoice.client.company && <div className="text-xs text-[#3f6212]">{invoice.client.company}</div>}
            <div className="text-xs text-neutral-600 mt-0.5">{invoice.client.address}, {invoice.client.city}</div>
          </div>
          <div className="sm:text-right text-xs italic text-neutral-600">
            Conditions: {invoice.paymentTerms}
          </div>
        </div>

        {/* Items */}
        <div className="my-6">
          <div className="grid grid-cols-12 pb-2 border-b-2 border-[#3f6212]/50 text-xs font-bold uppercase tracking-wider text-[#1a2e05]">
            <div className="col-span-6">Description des Ouvrages</div>
            <div className="col-span-2 text-center">Qté</div>
            <div className="col-span-2 text-right">Prix Unit.</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-[#3f6212]/15">
            {invoice.items.map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <div key={item.id} className="grid grid-cols-12 py-3 text-xs sm:text-sm items-center">
                  <div className="col-span-6 font-semibold italic text-[#1a2e05]">{item.description}</div>
                  <div className="col-span-2 text-center text-neutral-700">{item.quantity}</div>
                  <div className="col-span-2 text-right text-neutral-700">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                  <div className="col-span-2 text-right font-bold text-[#1a2e05]">{formatCurrency(lineTotal, invoice.currency)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-[#3f6212]/40">
          <div className="space-y-3 max-w-sm">
            <PaymentMethodInfo invoice={invoice} className="text-[#3f6212]" />
            <RenderSignature invoice={invoice} />
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-700">
              <span>Sous-Total</span>
              <span className="font-mono">{formatCurrency(calc.subtotal, invoice.currency)}</span>
            </div>

            <InvoiceSummaryRows
              invoice={invoice}
              calc={calc}
              discountClass="flex justify-between text-emerald-800 font-bold"
              taxClass="flex justify-between text-neutral-700"
            />

            <div className="border-t-2 border-[#3f6212] pt-2 flex justify-between text-base font-bold text-[#1a2e05]">
              <span>Total Réglé:</span>
              <span className="font-mono">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   33. Zenith Glassmorphism (zenith-glassmorphism)
   Translucent frosted cards, luminous soft gradient glow, modern SaaS feel
========================================================================= */
export const ZenithGlassmorphism: React.FC<TemplateProps> = ({ invoice, calc }) => {
  return (
    <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 font-outfit text-xs sm:text-sm min-h-full">
      {/* Frosted Hero Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-4">
          {invoice.theme.showLogo && (
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs border border-white/30">
              <TemplateLogoBadge
                name={invoice.company.name}
                templateId={invoice.templateId}
                logoUrl={invoice.company.logoUrl}
              />
            </div>
          )}
          <div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
              ENTERPRISE CLOUD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
              {invoice.company.name}
            </h1>
            <div className="text-xs text-slate-300 mt-1 font-mono">
              {invoice.company.email} · {invoice.company.address}
            </div>
          </div>
        </div>

        <div className="sm:text-right font-mono">
          <div className="text-[10px] uppercase text-indigo-300 font-bold tracking-widest">
            INVOICE NUMBER
          </div>
          <div className="text-xl font-bold text-white mt-0.5">
            {invoice.invoiceNumber}
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Issued: {invoice.issueDate} · Due: {invoice.dueDate}
          </div>
          <div className="mt-2">
            <StatusStamp status={invoice.status} />
          </div>
        </div>
      </div>

      {/* Recipient Glass Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <div className="text-[10px] uppercase text-indigo-300 font-bold tracking-wider mb-1">
            INVOICE RECIPIENT
          </div>
          <div className="text-base font-bold text-white">{invoice.client.name}</div>
          {invoice.client.company && <div className="text-xs text-slate-300">{invoice.client.company}</div>}
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {invoice.client.address}, {invoice.client.city} · {invoice.client.email}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="text-[10px] uppercase text-indigo-300 font-bold tracking-wider mb-1">
            SETTLEMENT SCHEDULE
          </div>
          <div className="text-xs text-slate-200">
            Terms: {invoice.paymentTerms} via {invoice.payment.method.toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-2">
            Automated invoice clearing enabled
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 my-6">
        <div className="grid grid-cols-12 bg-white/10 px-5 py-3 font-bold text-xs uppercase text-indigo-200 border-b border-white/10 tracking-wider">
          <div className="col-span-6">SERVICE DELIVERABLE</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-right">UNIT RATE</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>

        <div className="divide-y divide-white/5 font-mono">
          {invoice.items.map((item) => {
            const lineTotal = item.quantity * item.unitPrice;
            return (
              <div key={item.id} className="grid grid-cols-12 px-5 py-3.5 text-xs items-center hover:bg-white/5 transition-colors">
                <div className="col-span-6 font-outfit font-semibold text-white">{item.description}</div>
                <div className="col-span-2 text-center text-slate-300">{item.quantity}</div>
                <div className="col-span-2 text-right text-slate-300">{formatCurrency(item.unitPrice, invoice.currency)}</div>
                <div className="col-span-2 text-right font-bold text-indigo-300">{formatCurrency(lineTotal, invoice.currency)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-6">
        <div className="sm:col-span-7 space-y-3">
          <PaymentMethodInfo invoice={invoice} className="text-slate-300" />
          <RenderSignature invoice={invoice} />
        </div>

        <div className="sm:col-span-5 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 text-xs font-mono shadow-xl">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span>{formatCurrency(calc.subtotal, invoice.currency)}</span>
          </div>

          <InvoiceSummaryRows
            invoice={invoice}
            calc={calc}
            discountClass="flex justify-between text-emerald-400 font-bold"
            taxClass="flex justify-between text-slate-300"
          />

          <div className="border-t border-white/20 pt-2 flex justify-between text-base font-bold text-white">
            <span>Total Payable:</span>
            <span className="text-indigo-300">{formatCurrency(calc.balanceDue, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
