import React, { useState } from 'react';
import { X, Check, Search, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../data/templateList';
import { TemplateDefinition } from '../types/invoice';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', 'Modern', 'Corporate', 'Creative', 'Technical', 'Luxury', 'Specialty'];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCategory = activeCategory === 'All' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

    const categoryCounts: Record<string, number> = {
      All: TEMPLATES.length,
      Modern: TEMPLATES.filter((t) => t.category === 'Modern').length,
      Corporate: TEMPLATES.filter((t) => t.category === 'Corporate').length,
      Creative: TEMPLATES.filter((t) => t.category === 'Creative').length,
      Technical: TEMPLATES.filter((t) => t.category === 'Technical').length,
      Luxury: TEMPLATES.filter((t) => t.category === 'Luxury').length,
      Specialty: TEMPLATES.filter((t) => t.category === 'Specialty').length,
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-neutral-900 border border-neutral-750 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {TEMPLATES.length} Designer Invoice Templates
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Engineered for distinctive branding, print perfection, and professional client delivery.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-3.5 sm:px-6 border-b border-neutral-800 bg-neutral-900/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat ? 'bg-indigo-700 text-indigo-100' : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 25 designs..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.id);
                    onClose();
                  }}
                  className={`relative group rounded-xl p-4 cursor-pointer transition-all border text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xl ${
                    isSelected
                      ? 'border-indigo-500 bg-neutral-800/95 shadow-lg ring-2 ring-indigo-500/30'
                      : 'border-neutral-800 bg-neutral-850 hover:border-neutral-600 hover:bg-neutral-800'
                  }`}
                >
                  {/* Visual miniature representation header */}
                  <div className="h-32 rounded-lg overflow-hidden bg-white p-3 mb-3 relative flex flex-col justify-between shadow-xs border border-neutral-200/80">
                    {/* Miniature template styling hint */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{ backgroundColor: template.accentHex }}
                        />
                        <div
                          className="w-16 h-2.5 rounded-xs"
                          style={{ backgroundColor: template.accentHex, opacity: 0.8 }}
                        />
                      </div>
                      <div className="text-[9px] font-mono font-bold text-neutral-800">#INV-001</div>
                    </div>

                    {/* Middle preview simulation */}
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between items-center">
                        <div className="w-24 h-1.5 bg-neutral-200 rounded-xs" />
                        <div className="w-10 h-1.5 bg-neutral-300 rounded-xs" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-32 h-1.5 bg-neutral-100 rounded-xs" />
                        <div className="w-8 h-1.5 bg-neutral-200 rounded-xs" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-20 h-1.5 bg-neutral-200 rounded-xs" />
                        <div className="w-12 h-1.5 bg-neutral-300 rounded-xs" />
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-neutral-200 pt-1.5">
                      <div className="text-[8px] font-medium text-neutral-400">Total Due</div>
                      <div
                        className="px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white shadow-2xs"
                        style={{ backgroundColor: template.darkHex }}
                      >
                        $4,850.00
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/25 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                          <Check className="w-5 h-5 stroke-[3]" />
                        </span>
                      </div>
                    )}
                  </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {template.name}
                    </h3>
                    <span className="text-[10px] font-medium text-neutral-400 px-2 py-0.5 bg-neutral-800 rounded-md border border-neutral-700">
                      {template.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-indigo-400 mt-0.5">
                    {template.tagline}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-700"
                      style={{ backgroundColor: template.accentHex }}
                    />
                    <span>{template.id}</span>
                  </div>
                  <span className="text-indigo-400 font-medium group-hover:underline">
                    {isSelected ? 'Active' : 'Apply'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Watermark */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {TEMPLATES.length} Bespoke Designs Available
          </span>
          <span className="font-semibold text-neutral-300">
            Made By Pasindu Dushangana
          </span>
        </div>
      </div>
    </div>
  );
};
