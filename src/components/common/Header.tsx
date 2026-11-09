import React from 'react';
import {
  Activity,
  Image as ImageIcon,
  Box,
  Bot,
  BookOpen,
  Sparkles,
  Download,
  RotateCcw,
  Shapes,
  Smile
} from 'lucide-react';

export type ActiveTab = 'calculator' | 'image-to-equation' | 'simulator-3d' | 'ai-assistant' | 'docs';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPresets: () => void;
  onOpenExport: () => void;
  onReset: () => void;
  equationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenPresets,
  onOpenExport,
  onReset,
  equationCount,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      {/* Brand & MathRobo Inspiration */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onTabChange('calculator')}
        >
          {/* Pitch Yellow Icon Box */}
          <div className="w-10 h-10 rounded-2xl bg-[#FFE500] border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_#0f172a] group-hover:rotate-3 transition-transform">
            <span className="font-mono font-black text-slate-950 text-lg">∑X</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                EQUATION<span className="text-yellow-600">X</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF9C4] text-slate-900 border border-yellow-300">
                MATHROBO AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Intelligent Equation Generator & Simulator
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Yellow & White Pill Aesthetic) */}
        <nav className="hidden lg:flex items-center gap-1.5 ml-6 pl-6 border-l border-slate-200">
          <button
            onClick={() => onTabChange('calculator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2D Grapher</span>
          </button>

          <button
            onClick={() => onTabChange('image-to-equation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'image-to-equation'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-700 hover:text-slate-950 hover:bg-yellow-50'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-slate-900" />
            <span>Image to Equation</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
          </button>

          <button
            onClick={() => onTabChange('simulator-3d')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulator-3d'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-50'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D Simulator</span>
          </button>

          <button
            onClick={() => onTabChange('ai-assistant')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai-assistant'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'docs'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-950 hover:bg-yellow-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Formulas & Docs</span>
          </button>
        </nav>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white hover:bg-yellow-50 text-slate-900 border border-slate-300 shadow-sm transition-all active:scale-95"
          title="Explore famous mathematical curve & simulation presets"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="hidden sm:inline">Presets</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95"
          title="Export equations to LaTeX, Desmos, SVG, PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onReset}
          className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
          title="Reset to default workspace"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
