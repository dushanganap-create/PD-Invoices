import React from 'react';
import { Invoice } from '../../types/invoice';
import { InvoiceCalculations } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';
import { generateQrSvg } from '../../utils/qrCode';

interface CommonProps {
  invoice: Invoice;
  calc: InvoiceCalculations;
}

export function getDiscountLabel(calc: InvoiceCalculations): string {
  if (calc.discountType === 'flat') {
    return 'Discount (Flat)';
  }
  return `Discount (${calc.discountValue || 0}%)`;
}

export const InvoiceSummaryRows: React.FC<{
  invoice: Invoice;
  calc: InvoiceCalculations;
  discountClass?: string;
  taxClass?: string;
  shippingClass?: string;
}> = ({
  invoice,
  calc,
  discountClass = 'flex justify-between text-emerald-600 font-medium',
  taxClass = 'flex justify-between text-slate-600',
  shippingClass = 'flex justify-between text-slate-500',
}) => {
  return (
    <>
      {calc.globalDiscountAmount > 0 && (
        <div className={discountClass}>
          <span>{getDiscountLabel(calc)}</span>
          <span className="font-mono tabular-nums">-{formatCurrency(calc.globalDiscountAmount, invoice.currency)}</span>
        </div>
      )}
      {calc.taxAmount > 0 && (
        <div className={taxClass}>
          <span>{invoice.pricing.taxName || 'Tax'} ({invoice.pricing.taxRate}%)</span>
          <span className="font-mono tabular-nums">{formatCurrency(calc.taxAmount, invoice.currency)}</span>
        </div>
      )}
      {calc.shipping > 0 && (
        <div className={shippingClass}>
          <span>Shipping / Delivery</span>
          <span className="font-mono tabular-nums">{formatCurrency(calc.shipping, invoice.currency)}</span>
        </div>
      )}
      {calc.extraFee > 0 && (
        <div className={shippingClass}>
          <span>Additional Surcharge</span>
          <span className="font-mono tabular-nums">{formatCurrency(calc.extraFee, invoice.currency)}</span>
        </div>
      )}
    </>
  );
};


export const StatusStamp: React.FC<{ status: Invoice['status']; className?: string }> = ({
  status,
  className = '',
}) => {
  const statusStyles: Record<Invoice['status'], { label: string; border: string; text: string }> = {
    paid: { label: 'PAID IN FULL', border: 'border-emerald-600', text: 'text-emerald-700' },
    pending: { label: 'PAYMENT PENDING', border: 'border-amber-600', text: 'text-amber-700' },
    overdue: { label: 'PAST DUE', border: 'border-rose-600', text: 'text-rose-700' },
    draft: { label: 'DRAFT ESTIMATE', border: 'border-neutral-500', text: 'text-neutral-600' },
    cancelled: { label: 'VOID / CANCELLED', border: 'border-neutral-400', text: 'text-neutral-400' },
  };

  const current = statusStyles[status] || statusStyles.pending;

  return (
    <div
      className={`inline-block border-2 ${current.border} ${current.text} font-bold text-xs uppercase px-2.5 py-1 rounded tracking-widest transform -rotate-3 select-none ${className}`}
    >
      {current.label}
    </div>
  );
};

export const InvoiceQrCode: React.FC<{ invoice: Invoice; size?: number; className?: string }> = ({
  invoice,
  size = 90,
  className = '',
}) => {
  if (!invoice.theme.showQrCode) return null;

  const qrPayload =
    invoice.payment.paymentLink ||
    `INV:${invoice.invoiceNumber}|DUE:${invoice.dueDate}|TOTAL:${invoice.currency} ${invoice.pricing.amountPaid}`;
  const qrSvgUrl = generateQrSvg(qrPayload, size);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="p-1.5 bg-white border border-neutral-200 rounded shadow-xs inline-block">
        <img src={qrSvgUrl} alt="Payment QR Code" width={size} height={size} className="block" />
      </div>
      <span className="text-[10px] text-neutral-500 font-medium tracking-tight">Scan to Pay</span>
    </div>
  );
};

export const RenderSignature: React.FC<{ invoice: Invoice; className?: string }> = ({
  invoice,
  className = '',
}) => {
  if (!invoice.theme.showSignature) return null;
  const sig = invoice.signature;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="h-14 flex items-end pb-1 border-b border-neutral-300">
        {sig.type === 'draw' && sig.dataUrl ? (
          <img src={sig.dataUrl} alt="Signature" className="max-h-12 object-contain" />
        ) : sig.type === 'upload' && sig.dataUrl ? (
          <img src={sig.dataUrl} alt="Uploaded Signature" className="max-h-12 object-contain" />
        ) : sig.typedName ? (
          <span className="font-playfair italic text-xl text-neutral-800 tracking-wide">
            {sig.typedName}
          </span>
        ) : (
          <span className="text-xs text-neutral-400 italic">Authorized Signature</span>
        )}
      </div>
      <div className="pt-1 flex justify-between items-center text-[11px] text-neutral-600">
        <span className="font-semibold text-neutral-800">{sig.typedName || invoice.company.name}</span>
        {sig.date && <span>{sig.date}</span>}
      </div>
      {sig.signatoryTitle && <span className="text-[10px] text-neutral-500">{sig.signatoryTitle}</span>}
    </div>
  );
};

export const PaymentMethodInfo: React.FC<{ invoice: Invoice; className?: string }> = ({
  invoice,
  className = '',
}) => {
  if (!invoice.theme.showPaymentDetails) return null;
  const p = invoice.payment;

  return (
    <div className={`text-xs space-y-1 ${className}`}>
      <div className="font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
        <span>Payment Details</span>
        <span className="text-[10px] uppercase font-normal text-neutral-500 px-1.5 py-0.2 bg-neutral-100 rounded">
          {p.method}
        </span>
      </div>
      {p.bankName && (
        <div className="text-neutral-600">
          <span className="text-neutral-400">Bank:</span> {p.bankName}
        </div>
      )}
      {p.accountName && (
        <div className="text-neutral-600">
          <span className="text-neutral-400">Account:</span> {p.accountName}
        </div>
      )}
      {p.accountNumber && (
        <div className="text-neutral-600 font-mono">
          <span className="text-neutral-400 font-sans">Number / IBAN:</span> {p.accountNumber}
        </div>
      )}
      {p.routingOrSwift && (
        <div className="text-neutral-600 font-mono">
          <span className="text-neutral-400 font-sans">Routing / BIC:</span> {p.routingOrSwift}
        </div>
      )}
      {p.paymentLink && (
        <div className="text-neutral-600 truncate max-w-xs">
          <span className="text-neutral-400">Direct Link:</span>{' '}
          <a
            href={p.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline font-mono text-[11px]"
          >
            {p.paymentLink}
          </a>
        </div>
      )}
      {p.additionalNotes && <div className="text-neutral-500 italic text-[11px] pt-1">{p.additionalNotes}</div>}
    </div>
  );
};

export const BarcodeSvg: React.FC<{ code: string; className?: string }> = ({ code, className = '' }) => {
  // Deterministic clean barcode pattern
  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 3, 1, 4, 2, 1, 2, 3, 1, 2];
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-stretch h-8 gap-[1.5px] px-2 py-1 bg-white">
        {bars.map((w, idx) => (
          <div
            key={idx}
            className="bg-neutral-900"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>
      <span className="font-mono text-[9px] tracking-widest text-neutral-500">*{code}*</span>
    </div>
  );
};

export const TemplateLogoBadge: React.FC<{
  name: string;
  templateId: string;
  logoUrl?: string;
  className?: string;
}> = ({ name, templateId, logoUrl, className = '' }) => {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={`h-10 object-contain ${className}`} />;
  }

  const initial = (name || 'IC').substring(0, 2).toUpperCase();

  // Distinctive aesthetic marks tailored to each style
  switch (templateId) {
    case 'tech-terminal':
      return (
        <div className={`w-9 h-9 rounded bg-slate-900 border border-emerald-500/60 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs ${className}`}>
          &gt;_
        </div>
      );
    case 'luxury-gold':
    case 'art-deco-luxe':
      return (
        <div className={`w-10 h-10 border border-amber-600/70 flex items-center justify-center font-cinzel text-amber-700 font-bold text-xs rotate-45 ${className}`}>
          <span className="-rotate-45">{initial}</span>
        </div>
      );
    case 'swiss-bauhaus':
      return (
        <div className={`w-10 h-10 bg-red-600 flex items-center justify-center text-white font-space font-black text-sm ${className}`}>
          {initial}
        </div>
      );
    case 'organic-botanical':
      return (
        <div className={`w-10 h-10 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-garamond font-bold text-sm ${className}`}>
          {initial}
        </div>
      );
    case 'blueprint-architect':
      return (
        <div className={`w-9 h-9 border border-sky-500 flex items-center justify-center text-sky-600 font-mono text-xs ${className}`}>
          ⌖ {initial}
        </div>
      );
    case 'vintage-typographic':
      return (
        <div className={`w-10 h-10 rounded-full border-2 border-stone-800 flex items-center justify-center font-playfair font-bold text-stone-900 text-xs ${className}`}>
          {initial}
        </div>
      );
    case 'cyberpunk-hud':
      return (
        <div className={`w-9 h-9 bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs ${className}`}>
          [ {initial} ]
        </div>
      );
    case 'pastel-playful':
      return (
        <div className={`w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-outfit font-bold text-sm shadow-sm ${className}`}>
          {initial}
        </div>
      );
    case 'high-contrast-monolith':
      return (
        <div className={`w-10 h-10 bg-black text-white flex items-center justify-center font-space font-black text-sm ${className}`}>
          {initial}
        </div>
      );
    default:
      return (
        <div className={`w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-jakarta font-bold text-xs shadow-xs ${className}`}>
          {initial}
        </div>
      );
  }
};

export const InvoiceWatermark: React.FC<{
  className?: string;
  subtle?: boolean;
}> = ({ className = '', subtle = false }) => {
  return (
    <div
      className={`w-full flex items-center justify-center gap-2 pt-4 pb-2 border-t border-dashed border-neutral-300/60 select-none ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60" />
      <span
        className={`tracking-widest uppercase font-semibold text-[10px] sm:text-[11px] ${
          subtle ? 'text-neutral-400' : 'text-neutral-500'
        }`}
      >
        Made By Pasindu Dushangana
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-60" />
    </div>
  );
};
