import React, { useState, useEffect } from 'react';
import { GraphCanvas3D } from './GraphCanvas3D';
import { SliderControl } from '../calculator/SliderControl';
import { SliderVar } from '../../types';
import { extractSliderVariables } from '../../math/parser';
import { Box, Sliders, Layers, Sparkles, RotateCcw, Palette, Compass, Activity, Orbit } from 'lucide-react';

interface Simulator3DWorkspaceProps {
  initialExpression?: string;
  initialMode?: 'surface' | 'curve';
  initialParametricCurve?: { x: string; y: string; z: string };
}

export const Simulator3DWorkspace: React.FC<Simulator3DWorkspaceProps> = ({
  initialExpression,
  initialMode = 'surface',
  initialParametricCurve,
}) => {
  const [expression, setExpression] = useState<string>(
    initialExpression || '2.5 * sin(sqrt(x^2 + y^2) - t)'
  );
  const [mode, setMode] = useState<'surface' | 'curve'>(initialMode);
  const [parametricCurve, setParametricCurve] = useState<{ x: string; y: string; z: string }>(
    initialParametricCurve || {
      x: 'sin(t) + 2 * sin(2 * t)',
      y: 'cos(t) - 2 * cos(2 * t)',
      z: '-sin(3 * t)',
    }
  );

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

  // Sync external changes
  useEffect(() => {
    if (initialExpression && initialExpression.trim()) {
      setExpression(initialExpression.trim());
      syncSlidersForExpr(initialExpression.trim());
    }
  }, [initialExpression]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialParametricCurve) {
      setParametricCurve(initialParametricCurve);
    }
  }, [initialParametricCurve]);

  // Sync sliders with detected variables in 3D expression
  const syncSlidersForExpr = (expr: string) => {
    const detected = extractSliderVariables(expr).filter((v) => v !== 'x' && v !== 'y' && v !== 'z' && v !== 't');
    const existing = new Set(sliders.map((s) => s.variable));
    const nextSliders = [...sliders];

    detected.forEach((v) => {
      if (!existing.has(v)) {
        nextSliders.push({
          variable: v,
          min: 1,
          max: 10,
          step: 0.1,
          value: 4,
          isPlaying: false,
          speed: 1,
          direction: 1,
        });
      }
    });

    setSliders(nextSliders);
  };

  const sliderScope: Record<string, number> = {};
  for (const s of sliders) {
    sliderScope[s.variable] = s.value;
  }

  const PRESET_SURFACES = [
    {
      name: "Gabriel's Horn (Trumpet)",
      expr: '4 / (sqrt(x^2 + y^2) + 0.2)',
      desc: 'Torricelli trumpet with finite volume & infinite area',
    },
    {
      name: 'Black Hole Spacetime Funnel',
      expr: '-6 / (sqrt(x^2 + y^2) + 0.3)',
      desc: 'Gravitational potential curvature well',
    },
    {
      name: 'Circular Wave Ripple',
      expr: '2.5 * sin(sqrt(x^2 + y^2) - t)',
      desc: 'Dynamic propagating circular ripples',
    },
    {
      name: 'Helicoid Spiral Ramp',
      expr: '2 * atan2(y, x)',
      desc: 'Ruled minimal surface ramp',
    },
    {
      name: 'Ring Torus (Donut)',
      expr: 'sqrt(max(0, 4 - (4 - sqrt(x^2 + y^2))^2))',
      desc: 'Closed toroidal surface manifold',
    },
    {
      name: 'Hyperbolic Paraboloid (Saddle)',
      expr: '(x^2 - y^2) / a',
      desc: 'Classic saddle surface with opposing principal curvatures',
    },
    {
      name: 'Monkey Saddle',
      expr: '(x^3 - 3*x*y^2) / 10',
      desc: 'Surface with three downward directions (legs & tail)',
    },
    {
      name: 'Sombrero (Mexican Hat)',
      expr: '5 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
      desc: 'Classic 2D sinc wave diffraction pattern',
    },
    {
      name: 'Egg Carton Grid',
      expr: '2 * sin(x) * cos(y)',
      desc: 'Bi-periodic optical lattice surface',
    },
    {
      name: 'Volcano Caldera Crater',
      expr: '6 * (x^2 + y^2) * exp(-0.3 * (x^2 + y^2))',
      desc: 'Volcanic cone with central crater depression',
    },
  ];

  const PRESET_KNOTS = [
    {
      name: 'Trefoil Knot (3_1 Knot)',
      desc: 'The simplest non-trivial mathematical knot',
      curve: {
        x: 'sin(t) + 2 * sin(2 * t)',
        y: 'cos(t) - 2 * cos(2 * t)',
        z: '-sin(3 * t)',
      },
    },
    {
      name: 'Torus Knot (2, 3)',
      desc: 'Winds 2 times longitudinally and 3 times meridionally',
      curve: {
        x: '(2 + cos(3 * t)) * cos(2 * t)',
        y: '(2 + cos(3 * t)) * sin(2 * t)',
        z: 'sin(3 * t)',
      },
    },
    {
      name: 'Figure-Eight Knot (4_1 Knot)',
      desc: 'Unique knot with 4 crossings',
      curve: {
        x: '(2 + cos(2 * t)) * cos(3 * t)',
        y: '(2 + cos(2 * t)) * sin(3 * t)',
        z: 'sin(4 * t)',
      },
    },
    {
      name: 'Cinquefoil Knot (5_1 Knot)',
      desc: 'Symmetric 5-crossing star knot',
      curve: {
        x: '(3 + cos(5 * t)) * cos(2 * t)',
        y: '(3 + cos(5 * t)) * sin(2 * t)',
        z: 'sin(5 * t)',
      },
    },
    {
      name: 'Lissajous 3D Knot',
      desc: 'Tri-harmonic spatial trajectory knot',
      curve: {
        x: '3 * cos(3 * t)',
        y: '3 * cos(4 * t)',
        z: '3 * sin(7 * t)',
      },
    },
    {
      name: 'DNA Double Helix',
      desc: 'Watson-Crick molecular spiral',
      curve: {
        x: '2.5 * cos(t)',
        y: '2.5 * sin(t)',
        z: '0.4 * t - 4',
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white">
      {/* 3D Canvas Center */}
      <div className="flex-1 relative h-[50vh] md:h-full bg-white">
        <GraphCanvas3D
          expression={expression}
          mode={mode}
          parametricCurve={parametricCurve}
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
            • Drag to rotate camera • Scroll to zoom • {mode === 'curve' ? '3D Space Knot / Curve' : '3D Explicit Surface'}
          </div>
        </div>
      </div>

      {/* Right Settings & Controls Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 bg-[#FAFBFD] flex flex-col p-5 overflow-y-auto space-y-5 custom-scrollbar">
        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setMode('surface')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'surface'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Surface</span>
          </button>
          <button
            onClick={() => setMode('curve')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'curve'
                ? 'bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a] border border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>3D Knot / Curve</span>
          </button>
        </div>

        {/* Input fields based on mode */}
        {mode === 'surface' ? (
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
                onChange={(e) => {
                  setExpression(e.target.value);
                  syncSlidersForExpr(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 shadow-sm font-medium"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Orbit className="w-4 h-4 text-amber-500" />
              Parametric 3D Knot / Space Curve
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-500">x(t) =</span>
                <input
                  type="text"
                  value={parametricCurve.x}
                  onChange={(e) => setParametricCurve(prev => ({ ...prev, x: e.target.value }))}
                  className="w-full pl-12 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-500">y(t) =</span>
                <input
                  type="text"
                  value={parametricCurve.y}
                  onChange={(e) => setParametricCurve(prev => ({ ...prev, y: e.target.value }))}
                  className="w-full pl-12 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-500">z(t) =</span>
                <input
                  type="text"
                  value={parametricCurve.z}
                  onChange={(e) => setParametricCurve(prev => ({ ...prev, z: e.target.value }))}
                  className="w-full pl-12 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Visual Settings: Colormap, Wireframe, Resolution */}
        <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-amber-500" />
            Shading & Geometry
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setColormap('viridis')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                colormap === 'viridis'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Viridis
            </button>
            <button
              onClick={() => setColormap('cyan-purple')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                colormap === 'cyan-purple'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cyber Cyan
            </button>
            <button
              onClick={() => setColormap('sunset')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                colormap === 'sunset'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sunset Amber
            </button>
            <button
              onClick={() => setColormap('emerald')}
              className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                colormap === 'emerald'
                  ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Emerald Green
            </button>
          </div>

          {mode === 'surface' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isWireframe}
                  onChange={(e) => setIsWireframe(e.target.checked)}
                  className="rounded accent-yellow-400"
                />
                <span>Render Wireframe Mesh</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Grid: {resolution}×{resolution}</span>
            </div>
          )}
        </div>

        {/* Dynamic Sliders */}
        {sliders.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-500" />
              Dynamic Sliders ({sliders.length})
            </span>

            <div className="space-y-3">
              {sliders.map((s) => (
                <SliderControl
                  key={s.variable}
                  slider={s}
                  onChange={(updated) => {
                    setSliders(sliders.map((item) => (item.variable === updated.variable ? updated : item)));
                  }}
                  onDelete={() => {
                    setSliders(sliders.filter((item) => item.variable !== s.variable));
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Famous Presets List */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {mode === 'curve' ? 'Famous 3D Knots & Curves' : 'Famous 3D Surfaces'}
          </span>

          <div className="space-y-2">
            {mode === 'curve'
              ? PRESET_KNOTS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setParametricCurve(p.curve);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      parametricCurve.x === p.curve.x
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{p.desc}</div>
                  </button>
                ))
              : PRESET_SURFACES.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setExpression(p.expr);
                      syncSlidersForExpr(p.expr);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      expression === p.expr
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.expr}</div>
                  </button>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};
