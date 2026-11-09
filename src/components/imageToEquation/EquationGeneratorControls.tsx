import React, { useState } from 'react';
import { Equation } from '../../types';
import { MathFormula } from '../common/MathFormula';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Download,
  ArrowRight
} from 'lucide-react';

interface EquationGeneratorControlsProps {
  equations: Equation[];
  similarityScore: number;
  onPlotInCalculator: () => void;
  onExport: () => void;
  fitMethodName: string;
}

export const EquationGeneratorControls: React.FC<EquationGeneratorControlsProps> = ({
  equations,
  similarityScore,
  onPlotInCalculator,
  onExport,
  fitMethodName,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
      {/* Top Banner (Vibrant Pitch Yellow Hero from uploaded image aesthetic) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFE500] border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-[1px_2px_0px_#0f172a]">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-950 text-base">Mathematical Equations Synthesized</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-slate-900 border border-slate-900">
                {fitMethodName}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-medium mt-0.5">
              {equations.length} mathematical function{equations.length > 1 ? 's' : ''} approximating wireframe contours
            </p>
          </div>
        </div>

        {/* Reconstruction Score Gauge */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Reconstruction Match
            </div>
            <div className="text-2xl font-black font-mono text-slate-950 flex items-center justify-end gap-1">
              <span>{similarityScore}%</span>
            </div>
          </div>

          <button
            onClick={onPlotInCalculator}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-950 font-black text-xs flex items-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <span>Plot in 2D Grapher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Generated Equations List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
        {equations.map((eq, i) => (
          <div
            key={eq.id || i}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-yellow-400 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-900/40 shadow-sm"
                  style={{ backgroundColor: eq.color }}
                />
                <span className="font-bold text-xs text-slate-800 font-mono">
                  {eq.label || `Equation #${i + 1}`}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  {eq.type}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    copyToClipboard(
                      eq.type === 'parametric'
                        ? `x(t) = ${eq.expression}\ny(t) = ${eq.parametricY}`
                        : eq.expression,
                      i
                    )
                  }
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-yellow-50 text-slate-700 hover:text-slate-950 border border-slate-200 text-xs font-mono font-bold flex items-center gap-1 shadow-sm transition-colors"
                  title="Copy mathematical equation"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Rendered Math Formula */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 overflow-x-auto text-xs font-mono text-slate-900 shadow-sm">
              {eq.type === 'parametric' ? (
                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 font-bold font-mono">x(t) = </span>
                    <span className="select-text font-semibold">{eq.expression}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold font-mono">y(t) = </span>
                    <span className="select-text font-semibold">{eq.parametricY}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono pt-1">
                    for 0 ≤ t ≤ 2π (Fourier Epicycles)
                  </div>
                </div>
              ) : (
                <div className="select-text font-semibold">{eq.expression}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          onClick={onExport}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-yellow-50 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors self-start"
        >
          <Download className="w-4 h-4 text-amber-500" />
          <span>Export Options (LaTeX, Desmos, SVG, JSON)</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          💡 You can fine-tune or animate these equations directly in the Graphing Calculator.
        </span>
      </div>
    </div>
  );
};
