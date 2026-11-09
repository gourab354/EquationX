import React from 'react';
import { ImageProcessingConfig } from '../../types';
import { Sliders, Activity, Cpu, Wand2, Eye } from 'lucide-react';

interface ImageFiltersPanelProps {
  config: ImageProcessingConfig;
  onChange: (updated: ImageProcessingConfig) => void;
  contourCount: number;
}

export const ImageFiltersPanel: React.FC<ImageFiltersPanelProps> = ({
  config,
  onChange,
  contourCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Vision & Edge Controls
          </h4>
        </div>
        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FFF9C4] text-slate-900 border border-yellow-300">
          {contourCount} Shapes Extracted
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Edge Detection Threshold */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Edge Sensitivity (Sobel):</span>
            <span className="font-mono font-bold text-slate-900">{config.edgeThresholdLow}</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={config.edgeThresholdLow}
            onChange={(e) =>
              onChange({ ...config, edgeThresholdLow: parseInt(e.target.value) })
            }
            className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
          />
        </div>

        {/* Noise Blur Radius */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Noise Blur (Gaussian):</span>
            <span className="font-mono font-bold text-slate-900">{config.blurRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={config.blurRadius}
            onChange={(e) =>
              onChange({ ...config, blurRadius: parseFloat(e.target.value) })
            }
            className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
          />
        </div>

        {/* Douglas-Peucker Simplification Tolerance */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Curve Smoothness (ε):</span>
            <span className="font-mono font-bold text-slate-900">{config.simplifyTolerance}px</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={8}
            step={0.5}
            value={config.simplifyTolerance}
            onChange={(e) =>
              onChange({ ...config, simplifyTolerance: parseFloat(e.target.value) })
            }
            className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
          />
        </div>

        {/* Minimum contour length */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium text-slate-700">
            <span>Filter Small Speckles:</span>
            <span className="font-mono font-bold text-slate-900">{config.minContourLength} pts</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={config.minContourLength}
            onChange={(e) =>
              onChange({ ...config, minContourLength: parseInt(e.target.value) })
            }
            className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-100 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
          <input
            type="checkbox"
            checked={config.invert}
            onChange={(e) => onChange({ ...config, invert: e.target.checked })}
            className="rounded accent-yellow-500 w-4 h-4"
          />
          <span>Invert Black/White</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-slate-700">
          <input
            type="checkbox"
            checked={config.centerOrigin}
            onChange={(e) => onChange({ ...config, centerOrigin: e.target.checked })}
            className="rounded accent-yellow-500 w-4 h-4"
          />
          <span>Center Math Origin at (0, 0)</span>
        </label>
      </div>

      {/* Fitting Engine Configuration */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Equation Fitting Engine
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => onChange({ ...config, fitMethod: 'parametric_fourier' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              config.fitMethod === 'parametric_fourier'
                ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="font-extrabold text-xs mb-0.5">Fourier Epicycles</div>
            <div className="text-[11px] opacity-80 font-medium">Exact DFT Harmonics (x(t), y(t))</div>
          </button>

          <button
            onClick={() => onChange({ ...config, fitMethod: 'polynomial' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              config.fitMethod === 'polynomial'
                ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="font-extrabold text-xs mb-0.5">Polynomial Fit</div>
            <div className="text-[11px] opacity-80 font-medium">Cartesian y = ∑ c_n xⁿ</div>
          </button>

          <button
            onClick={() => onChange({ ...config, fitMethod: 'cartesian_multi' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              config.fitMethod === 'cartesian_multi'
                ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_2px_0px_#0f172a]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="font-extrabold text-xs mb-0.5">Piecewise Splines</div>
            <div className="text-[11px] opacity-80 font-medium">Multiple segmented functions</div>
          </button>
        </div>

        {/* Precision controls depending on method */}
        {config.fitMethod === 'parametric_fourier' ? (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Fourier Harmonic Modes (Terms):</span>
              <span className="font-mono text-slate-900 font-extrabold">{config.fourierHarmonics} terms</span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              step={1}
              value={config.fourierHarmonics}
              onChange={(e) =>
                onChange({ ...config, fourierHarmonics: parseInt(e.target.value) })
              }
              className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
            />
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-slate-700">
              <span>Polynomial Degree:</span>
              <span className="font-mono text-slate-900 font-extrabold">Degree {config.polynomialDegree}</span>
            </div>
            <input
              type="range"
              min={1}
              max={9}
              step={1}
              value={config.polynomialDegree}
              onChange={(e) =>
                onChange({ ...config, polynomialDegree: parseInt(e.target.value) })
              }
              className="w-full accent-yellow-500 h-2 bg-slate-100 rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};
