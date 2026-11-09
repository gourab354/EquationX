import React, { useState } from 'react';
import { GraphCanvas3D } from './GraphCanvas3D';
import { SliderControl } from '../calculator/SliderControl';
import { SliderVar } from '../../types';
import { Box, Sliders, Layers, Sparkles, RotateCcw, Palette, Compass } from 'lucide-react';

export const Simulator3DWorkspace: React.FC = () => {
  const [expression, setExpression] = useState<string>('2.5 * sin(sqrt(x^2 + y^2) - t)');
  const [mode, setMode] = useState<'surface' | 'curve'>('surface');
  const [colormap, setColormap] = useState<'viridis' | 'cyan-purple' | 'sunset' | 'emerald'>('viridis');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [resolution, setResolution] = useState<number>(60);

  const [sliders, setSliders] = useState<SliderVar[]>([
    {
      variable: 't',
      min: 0,
      max: 20,
      step: 0.1,
      value: 0,
      isPlaying: true,
      speed: 1,
      direction: 1,
    },
    {
      variable: 'a',
      min: 1,
      max: 8,
      step: 0.2,
      value: 3,
      isPlaying: false,
      speed: 1,
      direction: 1,
    },
  ]);

  const sliderScope: Record<string, number> = {};
  for (const s of sliders) {
    sliderScope[s.variable] = s.value;
  }

  const PRESET_SURFACES = [
    {
      name: 'Circular Wave Ripple',
      expr: '2.5 * sin(sqrt(x^2 + y^2) - t)',
      desc: 'Dynamic propagating circular ripples',
    },
    {
      name: 'Hyperbolic Paraboloid (Saddle)',
      expr: '(x^2 - y^2) / a',
      desc: 'Mountain pass saddle with opposing curvatures',
    },
    {
      name: 'Monkey Saddle',
      expr: '(x^3 - 3*x*y^2) / 10',
      desc: 'Surface with three downward directions (legs & tail)',
    },
    {
      name: 'Sombrero (Mexican Hat)',
      expr: '5 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
      desc: 'Classic 2D sinc wave function',
    },
    {
      name: 'Egg Carton Wave',
      expr: 'sin(x) * cos(y)',
      desc: 'Bi-periodic wave surface',
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white">
      {/* 3D Canvas Center */}
      <div className="flex-1 relative h-[50vh] md:h-full bg-white">
        <GraphCanvas3D
          expression={expression}
          mode={mode}
          sliders={sliderScope}
          gridResolution={resolution}
          colormap={colormap}
          isWireframe={isWireframe}
          scale={0.8}
        />

        {/* Floating Canvas Controls Overlay */}
        <div className="absolute top-5 left-5 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Interactive 3D Navigation</span>
          </div>
          <div className="text-[11px] text-slate-500">
            • Drag to rotate camera • Scroll to zoom
          </div>
        </div>
      </div>

      {/* Right Settings & Controls Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-[#FAFBFD] flex flex-col p-5 overflow-y-auto space-y-5 custom-scrollbar">
        {/* Expression Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-amber-500" />
              Surface Equation z = f(x, y)
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 font-mono font-bold text-xs text-slate-500">z =</span>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Visual Settings: Colormap, Wireframe, Resolution */}
        <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-amber-500" />
            Shading & Geometry
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setColormap('viridis')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                colormap === 'viridis'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Viridis
            </button>
            <button
              onClick={() => setColormap('cyan-purple')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                colormap === 'cyan-purple'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cyber Cyan
            </button>
            <button
              onClick={() => setColormap('sunset')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                colormap === 'sunset'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sunset Amber
            </button>
            <button
              onClick={() => setColormap('emerald')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                colormap === 'emerald'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Emerald Green
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isWireframe}
                onChange={(e) => setIsWireframe(e.target.checked)}
                className="rounded accent-yellow-500 w-4 h-4"
              />
              <span>Render Wireframe Mesh</span>
            </label>

            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-500">
              <span>Grid: {resolution}×{resolution}</span>
            </div>
          </div>
        </div>

        {/* Sliders Section */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-500" />
            Dynamic Sliders ({sliders.length})
          </span>

          <div className="space-y-2.5">
            {sliders.map((s, idx) => (
              <SliderControl
                key={s.variable}
                slider={s}
                onChange={(updated) => {
                  const next = [...sliders];
                  next[idx] = updated;
                  setSliders(next);
                }}
              />
            ))}
          </div>
        </div>

        {/* 3D Presets Gallery */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Famous 3D Surfaces
          </span>

          <div className="space-y-2">
            {PRESET_SURFACES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setExpression(preset.expr)}
                className="w-full p-3 rounded-2xl bg-white hover:bg-yellow-50 border border-slate-200 hover:border-yellow-400 text-left transition-all shadow-sm group"
              >
                <div className="font-bold text-xs text-slate-800 group-hover:text-slate-950">
                  {preset.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  z = {preset.expr}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
