import React from 'react';
import { TemplateDefinition } from '../types/invoice';
import { Crown, Sparkles } from 'lucide-react';

interface TemplateVisualMockupProps {
  template: TemplateDefinition;
  isSelected?: boolean;
  isProLocked?: boolean;
}

/**
 * High-fidelity visual miniature representation of each invoice template style.
 * Renders authentic structural layouts (header banners, table styling, borders,
 * accents, and typography simulation) so users can preview the real design look.
 */
export const TemplateVisualMockup: React.FC<TemplateVisualMockupProps> = ({
  template,
  isSelected = false,
  isProLocked = false,
}) => {
  const { id, accentHex, darkHex, category } = template;

  // Determine layout archetype based on ID & category
  const isTerminal = id.includes('terminal') || id.includes('cyber') || id.includes('code');
  const isBrutalist = id.includes('brutalist') || id.includes('pop');
  const isLuxury = id.includes('luxury') || id.includes('luxe') || id.includes('gold') || id.includes('vintage') || id.includes('editorial');
  const isBauhaus = id.includes('bauhaus') || id.includes('swiss');
  const isBlueprint = id.includes('blueprint') || id.includes('draft');
  const isBotanical = id.includes('botanical') || id.includes('sage') || id.includes('organic');
  const isCorporate = category === 'Corporate' || id.includes('classic') || id.includes('executive');
  const isCreative = category === 'Creative' || id.includes('studio') || id.includes('gradient');
  const isHeritage = id.includes('heritage') || id.includes('sri-lanka');
  const isReceipt = id.includes('receipt') || id.includes('thermal');

  return (
    <div
      className={`relative w-full h-36 rounded-xl overflow-hidden select-none transition-all duration-300 flex flex-col justify-between shadow-xs border ${
        isSelected
          ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 shadow-md'
          : 'border-neutral-200/90 hover:shadow-md'
      } ${
        isTerminal
          ? 'bg-neutral-950 text-neutral-100 font-mono'
          : isBlueprint
          ? 'bg-sky-950 text-sky-200 font-mono'
          : isLuxury
          ? 'bg-stone-900 text-amber-100 font-serif'
          : isBotanical
          ? 'bg-[#f4f7f4] text-emerald-950'
          : isBauhaus
          ? 'bg-[#fafafa] text-neutral-900'
          : isBrutalist
          ? 'bg-[#fffdf7] text-neutral-950'
          : 'bg-white text-neutral-800'
      }`}
    >
      {/* =========================================================================
          1. HEADER ZONE (Specific to archetype)
      ========================================================================= */}
      {isTerminal ? (
        // Terminal Window Bar
        <div className="bg-neutral-900 px-2.5 py-1.5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] text-emerald-400 font-mono ml-1.5 tracking-wider font-bold">
              ~/inv-001
            </span>
          </div>
          <span className="text-[7px] text-neutral-500 font-mono">zsh · 80x24</span>
        </div>
      ) : isBlueprint ? (
        // Blueprint Technical Bar
        <div className="bg-sky-900/80 px-2.5 py-1.5 border-b border-sky-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sky-300 font-mono text-[8px] font-bold">+ CAD.DRAFT //</span>
            <span className="w-12 h-1 bg-sky-400/60 rounded-xs" />
          </div>
          <span className="text-[7px] text-sky-400 font-mono">SCALE 1:1</span>
        </div>
      ) : isBauhaus ? (
        // Swiss Bauhaus Bold Vermilion Bar
        <div className="bg-rose-600 px-2.5 py-2 flex items-center justify-between text-white shrink-0">
          <div className="font-black text-[9px] uppercase tracking-tighter">BAUHAUS · 01</div>
          <div className="w-8 h-1.5 bg-neutral-950" />
        </div>
      ) : isBrutalist ? (
        // Neo Brutalist Chunky Offset Header
        <div className="bg-amber-300 px-2.5 py-1.5 border-b-2 border-neutral-950 flex items-center justify-between shrink-0 font-bold">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-tight text-neutral-950">
            <span className="px-1 py-0.2 bg-neutral-950 text-white text-[7px] font-mono">INV</span>
            <span>STUDIO 2026</span>
          </div>
          <span className="text-[8px] font-mono bg-white px-1 border border-neutral-950 shadow-[1px_1px_0px_#000]">
            #001
          </span>
        </div>
      ) : isLuxury ? (
        // Haute Luxe Editorial Header
        <div className="px-3 pt-2 pb-1 border-b border-amber-600/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-[10px] font-serif tracking-widest uppercase font-bold">
              ✦ ATELIER
            </span>
          </div>
          <div className="text-[7px] font-serif text-amber-300/80 italic tracking-wider">
            MMXXVI · N° 048
          </div>
        </div>
      ) : isCorporate ? (
        // Corporate Executive Full Accent Band
        <div
          className="px-2.5 py-1.5 text-white flex items-center justify-between shrink-0"
          style={{ backgroundColor: darkHex || '#1e3a8a' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-white/20 border border-white/40 flex items-center justify-center text-[7px] font-bold">
              C
            </div>
            <div className="w-14 h-1.5 bg-white/80 rounded-xs" />
          </div>
          <div className="text-[8px] font-mono font-bold text-white/90">#INV-2026</div>
        </div>
      ) : isCreative ? (
        // Creative Studio Vivid Gradient
        <div
          className="px-2.5 py-1.5 text-white flex items-center justify-between shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentHex} 0%, ${darkHex} 100%)`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/25 flex items-center justify-center">
              <Sparkles className="w-1.5 h-1.5 text-white" />
            </div>
            <div className="w-16 h-1.5 bg-white/90 rounded-full" />
          </div>
          <div className="text-[8px] font-bold tracking-tight text-white/90">INVOICE</div>
        </div>
      ) : (
        // Clean Minimal Header
        <div className="px-3 pt-2 pb-1 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-xs"
              style={{ backgroundColor: accentHex }}
            />
            <div
              className="w-14 h-1.5 rounded-xs"
              style={{ backgroundColor: accentHex, opacity: 0.8 }}
            />
          </div>
          <span className="text-[8px] font-mono text-neutral-400 font-semibold">#INV-001</span>
        </div>
      )}

      {/* =========================================================================
          2. BODY: METADATA & SIMULATED INVOICE TABLE
      ========================================================================= */}
      <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-between overflow-hidden">
        {/* Bill To & Date Simulation */}
        <div className="flex items-center justify-between gap-2 text-[7px]">
          <div className="space-y-0.5">
            <div
              className={`w-16 h-1 rounded-xs ${
                isTerminal ? 'bg-emerald-500/40' : isBlueprint ? 'bg-sky-400/50' : isLuxury ? 'bg-amber-400/40' : 'bg-neutral-300'
              }`}
            />
            <div
              className={`w-10 h-0.5 rounded-xs ${
                isTerminal ? 'bg-neutral-700' : isBlueprint ? 'bg-sky-800' : 'bg-neutral-200'
              }`}
            />
          </div>
          <div className="space-y-0.5 text-right">
            <div
              className={`w-12 h-1 rounded-xs ml-auto ${
                isTerminal ? 'bg-neutral-700' : isBlueprint ? 'bg-sky-800' : 'bg-neutral-300'
              }`}
            />
            <div
              className={`w-8 h-0.5 rounded-xs ml-auto ${
                isTerminal ? 'bg-neutral-800' : 'bg-neutral-200'
              }`}
            />
          </div>
        </div>

        {/* Miniature Table with Headers & 2 rows */}
        <div className="mt-1 space-y-1">
          {/* Table Header Bar */}
          <div
            className={`flex items-center justify-between px-1.5 py-0.5 rounded-xs text-[6.5px] font-bold ${
              isTerminal
                ? 'bg-neutral-850 text-emerald-400 font-mono'
                : isBlueprint
                ? 'bg-sky-900/60 text-sky-200 font-mono border-b border-sky-800'
                : isLuxury
                ? 'border-b border-amber-600/40 text-amber-200 font-serif'
                : isBrutalist
                ? 'bg-neutral-950 text-white font-mono'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <div className="w-20">DESCRIPTION</div>
            <div className="w-6 text-center">QTY</div>
            <div className="w-10 text-right">AMOUNT</div>
          </div>

          {/* Row 1 */}
          <div className="flex items-center justify-between px-1.5 py-0.5 text-[6.5px]">
            <div className="flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ backgroundColor: accentHex }}
              />
              <div
                className={`w-16 h-1 rounded-xs ${
                  isTerminal ? 'bg-neutral-700' : isBlueprint ? 'bg-sky-700/60' : 'bg-neutral-200'
                }`}
              />
            </div>
            <div className="text-[7px] text-neutral-400 font-mono">1</div>
            <div
              className={`w-8 h-1 rounded-xs ${
                isTerminal ? 'bg-emerald-500/60' : isBlueprint ? 'bg-sky-400/70' : isLuxury ? 'bg-amber-400/60' : 'bg-neutral-400'
              }`}
            />
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between px-1.5 py-0.5 text-[6.5px]">
            <div className="flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ backgroundColor: accentHex, opacity: 0.5 }}
              />
              <div
                className={`w-12 h-1 rounded-xs ${
                  isTerminal ? 'bg-neutral-800' : isBlueprint ? 'bg-sky-800/60' : 'bg-neutral-100'
                }`}
              />
            </div>
            <div className="text-[7px] text-neutral-400 font-mono">3</div>
            <div
              className={`w-6 h-1 rounded-xs ${
                isTerminal ? 'bg-emerald-500/40' : isBlueprint ? 'bg-sky-400/50' : isLuxury ? 'bg-amber-400/40' : 'bg-neutral-300'
              }`}
            />
          </div>
        </div>

        {/* =========================================================================
            3. TOTAL SUMMARY ACCENT BOX
        ========================================================================= */}
        <div
          className={`flex items-center justify-between px-2 py-1 rounded-md mt-1 border ${
            isTerminal
              ? 'bg-neutral-900 border-emerald-500/40 text-emerald-400'
              : isBlueprint
              ? 'bg-sky-900/90 border-sky-400/40 text-sky-200'
              : isLuxury
              ? 'bg-stone-950 border-amber-500/40 text-amber-300'
              : isBrutalist
              ? 'bg-neutral-950 border-neutral-950 text-white shadow-[1px_1px_0px_#000]'
              : 'bg-neutral-900 border-neutral-800 text-white'
          }`}
          style={
            !isTerminal && !isBlueprint && !isLuxury && !isBrutalist
              ? { backgroundColor: darkHex || '#0f172a' }
              : undefined
          }
        >
          <span className="text-[7px] uppercase font-bold tracking-wider opacity-80">
            TOTAL DUE
          </span>
          <span className="text-[8.5px] font-mono font-bold tracking-tight">
            Rs. 145,000.00
          </span>
        </div>
      </div>

      {/* Pro Badge Overlay */}
      {template.isPro && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-black text-[8px] shadow-sm tracking-wider">
          <Crown className="w-2.5 h-2.5 fill-current" />
          <span>PRO</span>
        </div>
      )}

      {/* Selected Indicator Checkmark */}
      {isSelected && (
        <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg ring-2 ring-white">
            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
