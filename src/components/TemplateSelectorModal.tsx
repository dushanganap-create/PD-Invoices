import React, { useState } from 'react';
import {
  X,
  Check,
  Search,
  Sparkles,
  Crown,
  Lock,
  Eye,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';
import { TEMPLATES } from '../data/templateList';
import { UserProfile } from '../types/auth';
import { Invoice } from '../types/invoice';
import { TemplateVisualMockup } from './TemplateVisualMockup';
import { TemplateRenderer } from './templates/TemplateRenderer';
import { calculateInvoice } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { isSuperAdminEmail } from '../utils/authStorage';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  currentUser?: UserProfile | null;
  onOpenProModal?: (featureName: string) => void;
  currentInvoice?: Invoice;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  currentUser,
  onOpenProModal,
  currentInvoice,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'live_inspect'>('grid');
  const [inspectingTemplateId, setInspectingTemplateId] = useState<string>(selectedTemplateId);

  if (!isOpen) return null;

  const isUserPro = Boolean(
    currentUser?.isPro ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'pro' ||
    isSuperAdminEmail(currentUser?.email) ||
    (currentUser?.email && currentUser.email.toLowerCase() === 'admin@pdinvoice.studio')
  );

  const categories = ['All', 'Pro Exclusive', 'Modern', 'Corporate', 'Creative', 'Technical', 'Luxury', 'Specialty'];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    let matchesCategory = true;
    if (activeCategory === 'Pro Exclusive') {
      matchesCategory = Boolean(tpl.isPro);
    } else if (activeCategory !== 'All') {
      matchesCategory = tpl.category === activeCategory;
    }

    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const proCount = TEMPLATES.filter((t) => t.isPro).length;
  const currentInspectingTpl = TEMPLATES.find((t) => t.id === inspectingTemplateId) || TEMPLATES[0];

  // Sample or active invoice for rendering in live inspect mode
  const previewInvoiceData: Invoice | null = currentInvoice
    ? {
        ...currentInvoice,
        templateId: inspectingTemplateId,
      }
    : null;

  const previewCalc = previewInvoiceData ? calculateInvoice(previewInvoiceData) : null;

  const handleSelectAndClose = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (tpl?.isPro && !isUserPro && onOpenProModal) {
      onOpenProModal(`Template "${tpl.name}"`);
    } else {
      onSelectTemplate(templateId);
      onClose();
    }
  };

  const creativeWhatsAppMessage = encodeURIComponent(
    `Hello PD Invoice Support! 👋\n\nI want to get PD Invoice PRO for just LKR 250 to unlock all 50+ designer templates! 🎨\n\n👤 Account Email: ${currentUser?.email || 'my-account'}\n💰 Package: LKR 250\n\nPlease send details! ⭐`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* =========================================================================
            HEADER: Branding, Mode Switcher & Close
        ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-3 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-md border border-white/80 shrink-0">
              <img
                src="/assets/aistudio/image_e019301c.png"
                alt="PD Invoice"
                className="h-6 sm:h-7 w-auto object-contain block"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>50+ Designer Invoice Templates</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                  PRO: JUST LKR 250
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Choose a visual design with authentic layout previews or inspect with your live data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Grid Preview vs Live Data Inspector */}
            <div className="flex items-center bg-neutral-800/90 p-0.5 rounded-xl border border-neutral-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="View all templates in visual grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visual Catalog</span>
                <span className="sm:hidden">Catalog</span>
              </button>

              <button
                onClick={() => setViewMode('live_inspect')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'live_inspect'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Inspect template rendered live with your actual invoice data"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live Data Inspector</span>
                <span className="sm:hidden">Live Inspect</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            FILTER & SEARCH BAR
        ========================================================================= */}
        <div className="p-3 sm:px-5 border-b border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row gap-2.5 justify-between items-center shrink-0">
          {/* Category Pills with < and > marks */}
          <div className="w-full sm:w-auto flex-1 max-w-full overflow-hidden">
            <HorizontalScrollContainer
              arrowSize="xs"
              scrollAmount={160}
              contentClassName="gap-1 pb-1 sm:pb-0"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeCategory === cat
                      ? cat === 'Pro Exclusive'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : cat === 'Pro Exclusive'
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                  }`}
                >
                  {cat === 'Pro Exclusive' && <Crown className="w-3 h-3" />}
                  <span>{cat}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      activeCategory === cat ? 'bg-black/20 text-inherit font-bold' : 'bg-neutral-700 text-neutral-400'
                    }`}
                  >
                    {cat === 'All'
                      ? TEMPLATES.length
                      : cat === 'Pro Exclusive'
                      ? proCount
                      : TEMPLATES.filter((t) => t.category === cat).length}
                  </span>
                </button>
              ))}
            </HorizontalScrollContainer>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ designs..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* =========================================================================
            CONTENT AREA: GRID VIEW OR LIVE DATA INSPECTOR
        ========================================================================= */}
        {viewMode === 'grid' ? (
          /* ---------------------------------------------------------
             MODE 1: VISUAL CATALOG GRID
             Displays authentic miniature layout previews for each design
          --------------------------------------------------------- */
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              const isProTpl = Boolean(template.isPro);
              const isLocked = isProTpl && !isUserPro;

              return (
                <div
                  key={template.id}
                  className={`relative group rounded-2xl p-3.5 transition-all border text-left flex flex-col justify-between hover:shadow-xl ${
                    isSelected
                      ? 'border-indigo-500 bg-neutral-850 shadow-lg ring-2 ring-indigo-500/40'
                      : isProTpl
                      ? 'border-amber-500/30 bg-neutral-850/90 hover:border-amber-500/60 hover:bg-neutral-800'
                      : 'border-neutral-800 bg-neutral-850/90 hover:border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  {/* Miniature Visual Layout Preview */}
                  <div
                    onClick={() => {
                      setInspectingTemplateId(template.id);
                      setViewMode('live_inspect');
                    }}
                    className="cursor-pointer mb-3"
                    title="Click to inspect this design with live data"
                  >
                    <TemplateVisualMockup
                      template={template}
                      isSelected={isSelected}
                      isProLocked={isLocked}
                    />
                  </div>

                  {/* Card Content & Action Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: template.accentHex }}
                        />
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {template.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isProTpl && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            PRO
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700">
                          {template.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-medium text-indigo-400 truncate">
                      {template.tagline}
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Dual Action Buttons: Apply vs Live Inspect */}
                    <div className="pt-2 flex items-center gap-2 border-t border-neutral-800">
                      <button
                        onClick={() => handleSelectAndClose(template.id)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            : isLocked
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Active Design</span>
                          </>
                        ) : isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlock Pro</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Select Design</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setInspectingTemplateId(template.id);
                          setViewMode('live_inspect');
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 hover:text-white border border-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Inspect with live user data"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ---------------------------------------------------------
             MODE 2: LIVE DATA INSPECTOR
             Side-by-side: Template switcher list on left, real rendered invoice on right
          --------------------------------------------------------- */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-neutral-950">
            {/* Left Column: Template List with Mini Previews */}
            <div className="w-full md:w-80 border-r border-neutral-800 flex flex-col bg-neutral-900/90 overflow-hidden shrink-0">
              <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                  Select Design to Inspect
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {filteredTemplates.length} Available
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredTemplates.map((t) => {
                  const isCurrentInspecting = inspectingTemplateId === t.id;
                  const isAlreadySelected = selectedTemplateId === t.id;
                  const isLocked = t.isPro && !isUserPro;

                  return (
                    <button
                      key={t.id}
                      onClick={() => setInspectingTemplateId(t.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isCurrentInspecting
                          ? 'bg-neutral-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-neutral-850/60 border-neutral-800 hover:bg-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div
                        className="w-8 h-10 rounded-md border flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: t.darkHex || '#0f172a',
                          borderColor: t.accentHex,
                        }}
                      >
                        <span
                          className="w-3 h-1 rounded-full"
                          style={{ backgroundColor: t.accentHex }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {t.name}
                          </span>
                          {t.isPro && (
                            <span className="text-[8px] font-black px-1 rounded bg-amber-500 text-neutral-950">
                              PRO
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {t.category} · {t.tagline}
                        </div>
                      </div>

                      {isAlreadySelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active invoice template" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Rendered Invoice Sheet */}
            <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
              {/* Top Banner with Template Info & Quick Apply */}
              <div className="p-3 sm:px-6 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: currentInspectingTpl.accentHex }}
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>{currentInspectingTpl.name}</span>
                      {currentInspectingTpl.isPro && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          PRO
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {currentInspectingTpl.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSelectAndClose(inspectingTemplateId)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Apply This Design</span>
                  </button>
                </div>
              </div>

              {/* Rendered Invoice Document Preview Canvas */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-neutral-950/80">
                {previewInvoiceData ? (
                  <div className="w-full max-w-[800px] bg-white rounded-xl shadow-2xl border border-neutral-300 text-neutral-900 overflow-hidden transform origin-top transition-transform">
                    <TemplateRenderer invoice={previewInvoiceData} />
                  </div>
                ) : (
                  <div className="text-center p-8 text-neutral-500">
                    No active invoice data to preview.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PRO UPGRADE FOOTER BANNER
        ========================================================================= */}
        {!isUserPro && (
          <div className="p-3 sm:px-6 border-t border-neutral-800 bg-gradient-to-r from-neutral-950 via-amber-950/20 to-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Unlock All 50+ Templates + Remove Watermark</span>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-1.5 py-0.2 rounded font-bold">
                    JUST LKR 250
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Lifetime access · Unlimited daily invoices · Custom typography &amp; layouts
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/94719891483?text=${creativeWhatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
