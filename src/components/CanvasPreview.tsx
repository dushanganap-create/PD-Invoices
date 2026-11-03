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
  Loader2,
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
  isPro?: boolean;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  invoice,
  onUpdateInvoice,
  onOpenTemplates,
  isPro = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

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
    // Base sheet width is 850px, add responsive padding margin
    const padding = containerWidth < 480 ? 16 : 48;
    const targetScale = Math.min(1.0, Math.max(0.28, (containerWidth - padding) / 850));
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
    setPdfSuccess(false);
    try {
      const ok = await exportToPdf('invoice-render-sheet', invoice.invoiceNumber);
      if (ok) {
        setPdfSuccess(true);
        triggerConfetti();
        setTimeout(() => setPdfSuccess(false), 3000);
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
      className={`flex flex-col h-full bg-[#080D19] ${
        isFullScreen ? 'fixed inset-0 z-50 bg-[#080D19]' : 'relative'
      }`}
    >
      {/* Top Preview Toolbar */}
      <div className="no-print h-14 border-b border-[#141E30] px-3 sm:px-5 flex items-center justify-between gap-3 bg-[#101827]/95 backdrop-blur-md shrink-0">
        {/* Left: Active Template badge + Status Quick Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141E30] hover:bg-[#19253A] text-white rounded-xl text-xs font-semibold border border-[#19253A] whitespace-nowrap transition-colors cursor-pointer"
            title="Change Invoice Design Template"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8294FF]" />
            <span className="hidden xl:inline">{currentTemplate.name}</span>
            <span className="xl:hidden">Design</span>
          </button>

          <div className="h-4 w-px bg-[#141E30] mx-0.5 hidden sm:block" />

          {/* Status Quick Toggle */}
          <div className="flex items-center gap-1">
            {(['draft', 'pending', 'paid', 'overdue'] as Invoice['status'][]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  invoice.status === st
                    ? st === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'overdue'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : st === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-neutral-600 text-white shadow-xs'
                    : 'bg-[#141E30] text-[#A5B1C7] hover:text-white'
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
          <div className="flex items-center gap-0.5 bg-[#141E30] p-1 rounded-xl border border-[#19253A] text-xs">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 text-[#A5B1C7] hover:text-white rounded-lg hover:bg-[#19253A] cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleAutoFit}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                isAutoFit ? 'bg-[#586FFF] text-white shadow-xs' : 'text-[#A5B1C7] hover:text-white'
              }`}
              title="Fit entire invoice width to preview window"
            >
              Fit
            </button>
            <button
              onClick={() => handleSetExactZoom(100)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-md transition-all cursor-pointer ${
                !isAutoFit && zoomLevel === 100
                  ? 'bg-[#586FFF] text-white shadow-xs'
                  : 'text-[#A5B1C7] hover:text-white'
              }`}
              title="100% Original Size"
            >
              100%
            </button>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 text-[#A5B1C7] hover:text-white rounded-lg hover:bg-[#19253A] cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#A5B1C7] px-1.5 hidden md:inline">
              {zoomLevel}%
            </span>
          </div>

          {/* Primary Action Buttons */}
          <button
            onClick={() => printInvoice()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141E30] hover:bg-[#19253A] text-white rounded-xl text-xs font-semibold border border-[#19253A] transition-colors cursor-pointer"
            title="Print Invoice directly (Isolated A4)"
          >
            <Printer className="w-3.5 h-3.5 text-[#A5B1C7]" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handlePdfDownload}
            disabled={isExportingPdf}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-[#586FFF]/25 transition-all whitespace-nowrap cursor-pointer ${
              pdfSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#586FFF] hover:bg-[#475ce6] disabled:opacity-50 text-white'
            }`}
            title="Convert and download invoice as PDF using jsPDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
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
        className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 lg:p-8 flex justify-center items-start print-container drafting-mat relative"
      >
        <div
          style={{
            width: `${Math.round(850 * (zoomLevel / 100))}px`,
            minHeight: `${Math.round(1100 * (zoomLevel / 100))}px`,
          }}
          className="shrink-0 flex justify-center overflow-visible"
        >
          <div
            id="invoice-render-sheet"
            style={{
              width: '850px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              transition: 'transform 0.12s ease-out',
            }}
            className="invoice-sheet min-h-[1100px] bg-white rounded-xl paper-shadow border border-neutral-300/60 text-slate-900 overflow-hidden relative shrink-0"
          >
            {/* Active Template Renderer */}
            <TemplateRenderer invoice={invoice} />
            {!isPro && (
              <div className="px-8 pb-6 bg-transparent">
                <InvoiceWatermark subtle isPro={isPro} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
