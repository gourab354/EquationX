import React, { useState } from 'react';
import { PRESETS, PresetItem } from '../../math/presets';
import { Equation, SliderVar } from '../../types';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetItem) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Famous Curves', 'Simulations', 'Polar', 'Implicit', '3D Surfaces', 'Physics'];

  const filtered = selectedCategory === 'All'
    ? PRESETS
    : PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE500] border border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a]">
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900">Mathematical Preset Library</h2>
              <p className="text-xs text-slate-500 font-medium">Curated collection of famous curves and physics models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs bg-slate-50/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all font-bold ${
                selectedCategory === cat
                  ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar math-notebook-bg">
          {filtered.map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-yellow-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                    {preset.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFF9C4] text-slate-900 border border-yellow-300">
                    {preset.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {preset.description}
                </p>

                <div className="mt-2.5 text-[11px] font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200 truncate font-semibold">
                  {preset.equations[0]?.type === 'parametric'
                    ? `x(t) = ${preset.equations[0].expression}`
                    : preset.equations[0]?.expression}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-medium">
                  {preset.sliders?.length ? `${preset.sliders.length} animated sliders` : 'Static formula'}
                </span>

                <button
                  onClick={() => {
                    onSelectPreset(preset);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 text-xs font-black flex items-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95"
                >
                  <span>Load Preset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
