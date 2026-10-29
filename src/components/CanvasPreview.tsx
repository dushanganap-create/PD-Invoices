import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ZoomIn,
  ZoomOut,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Invoice } from '../types/invoice';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { InvoiceWatermark } from './templates/InvoiceCommonParts';
import { exportToPdf, exportToPng, exportToCsv, exportToJson, printInvoice } from '../utils/export';
import { TEMPLATES } from '../data/templateList';

interface CanvasPreviewProps {
  invoice: Invoice;
  onUpdateInvoice: (updated: Invoice) => void;
  onOpenTemplates: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  invoice,
  onUpdateInvoice,
  onOpenTemplates,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentTemplate = TEMPLATES.find((t) => t.id === invoice.templateId) || TEMPLATES[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Auto-fit calculation based on container width
  const calculateAutoFit = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    // Base sheet width is 850px, add 48px padding safety margin
    const targetScale = Math.min(1.0, Math.max(0.4, (containerWidth - 52) / 850));
    setZoomLevel(Math.round(targetScale * 100));
  };

  useEffect(() => {
    if (isAutoFit) {
      calculateAutoFit();
    }
  }, [isAutoFit]);

  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) {
        calculateAutoFit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoFit]);

  const handleZoom = (delta: number) => {
    setIsAutoFit(false);
    setZoomLevel((prev) => Math.min(150, Math.max(40, prev + delta)));
  };

  const handleSetExactZoom = (zoom: number) => {
    setIsAutoFit(false);
    setZoomLevel(zoom);
  };

  const handleToggleAutoFit = () => {
    setIsAutoFit(true);
    calculateAutoFit();
  };

  const handlePdfDownload = async () => {
    setIsExportingPdf(true);
    try {
      const ok = await exportToPdf('invoice-render-sheet', invoice.invoiceNumber);
      if (ok) {
        triggerConfetti();
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePngDownload = async () => {
    setIsExportingPng(true);
    try {
      await exportToPng('invoice-render-sheet', invoice.invoiceNumber);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleStatusChange = (status: Invoice['status']) => {
    onUpdateInvoice({
      ...invoice,
      status,
      updatedAt: new Date().toISOString(),
    });
    if (status === 'paid') {
      triggerConfetti();
    }
  };

  const handleCopySummary = () => {
    const summary = `Invoice #${invoice.invoiceNumber}\nDue: ${invoice.dueDate}\nTotal: ${invoice.currency} ${invoice.pricing.amountPaid}\nCompany: ${invoice.company.name}\nClient: ${invoice.client.name}`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className={`flex flex-col h-full bg-neutral-950 ${
        isFullScreen ? 'fixed inset-0 z-50 bg-neutral-950' : 'relative'
      }`}
    >
      {/* Top Preview Toolbar */}
      <div className="no-print h-14 border-b border-neutral-800 px-3 sm:px-5 flex items-center justify-between gap-3 bg-neutral-900/90 backdrop-blur-md shrink-0">
        {/* Left: Active Template badge + Status Quick Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-white rounded-lg text-xs font-medium border border-neutral-700 whitespace-nowrap transition-colors"
            title="Change Invoice Design Template"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline">{currentTemplate.name}</span>
            <span className="xl:hidden">Design</span>
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-0.5 hidden sm:block" />

          {/* Status Quick Toggle */}
          <div className="flex items-center gap-1">
            {(['draft', 'pending', 'paid', 'overdue'] as Invoice['status'][]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                  invoice.status === st
                    ? st === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'overdue'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : st === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-neutral-600 text-white shadow-xs'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Zoom Controls & Export Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700 text-xs">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleAutoFit}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                isAutoFit ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Fit entire invoice width to preview window"
            >
              Fit
            </button>
            <button
              onClick={() => handleSetExactZoom(100)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                !isAutoFit && zoomLevel === 100
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="100% Original Size"
            >
              100%
            </button>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-700"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-400 px-1 hidden md:inline">
              {zoomLevel}%
            </span>
          </div>

          {/* Primary Action Buttons */}
          <button
            onClick={printInvoice}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium border border-neutral-700 transition-colors"
            title="Print Invoice directly"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handlePdfDownload}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
            title="Download PDF file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
          </button>

          {/* Secondary Export Menu / Actions */}
          <div className="flex items-center">
            <button
              onClick={handlePngDownload}
              disabled={isExportingPng}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title="Download Image (PNG)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => exportToCsv(invoice)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors hidden sm:block"
              title="Export CSV (Spreadsheet)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => exportToJson(invoice)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors hidden sm:block"
              title="Backup JSON Data"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start print-container drafting-mat relative"
      >
        <div
          id="invoice-render-sheet"
          style={{
            width: '850px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.12s ease-out',
            marginBottom: `${Math.max(0, (zoomLevel / 100 - 1) * 1100)}px`,
          }}
          className="invoice-sheet min-h-[1100px] bg-white rounded-xl paper-shadow border border-neutral-300/60 text-slate-900 overflow-hidden relative shrink-0"
        >
          {/* Active Template Renderer */}
          <TemplateRenderer invoice={invoice} />
          <div className="px-8 pb-6 bg-transparent">
            <InvoiceWatermark subtle />
          </div>
        </div>

        {/* Floating Quick Action Dock */}
        <div className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-8 sm:translate-x-0 glass-dock px-3.5 py-2 rounded-full flex items-center gap-2 shadow-2xl z-30 transition-all hover:scale-[1.02]">
          <button
            onClick={handlePdfDownload}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-full text-xs font-semibold shadow-md whitespace-nowrap transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
          </button>
          <button
            onClick={printInvoice}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-full text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-2.5 py-1 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-full text-xs transition-colors"
            title="Copy invoice summary to clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
