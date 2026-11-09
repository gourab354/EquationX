import React, { useState } from 'react';
import { MathFormula } from '../common/MathFormula';
import {
  BookOpen,
  Code,
  Sparkles,
  Activity,
  Layers,
  Cpu,
  Compass,
  FileCheck,
  Shapes,
  Sigma
} from 'lucide-react';

export const DocumentationWorkspace: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'formulas' | 'image-to-eq' | 'syntax' | 'simulations' | '3d'>('formulas');

  const FORMULA_CARDS = [
    {
      title: 'Trapeze area, formula',
      category: 'Geometry',
      description: 'Trapeze is a quadrilateral with two parallel sides. The area is equal to the product of half its base sum by height.',
      formula: 'S = \\frac{a + b}{2} \\cdot h',
      diagramSvg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 stroke-slate-800 fill-none stroke-[1.5]">
          <polygon points="20,50 80,50 65,15 35,15" fill="#FFFDF0" stroke="#0F172A" />
          <line x1="35" y1="15" x2="35" y2="50" strokeDasharray="2,2" stroke="#EAB308" />
          <text x="37" y="35" fontSize="8" fill="#EAB308" fontFamily="monospace">h</text>
          <text x="47" y="12" fontSize="8" fill="#0F172A" fontFamily="monospace">b</text>
          <text x="47" y="58" fontSize="8" fill="#0F172A" fontFamily="monospace">a</text>
        </svg>
      )
    },
    {
      title: 'Parabola Formula & Roots',
      category: 'Algebra',
      description: 'Quadratic function whose graph is a symmetric U-shaped curve with vertex at (-b/2a, -D/4a).',
      formula: 'y = a x^2 + b x + c',
      diagramSvg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 stroke-slate-800 fill-none stroke-[1.5]">
          <line x1="10" y1="45" x2="90" y2="45" stroke="#CBD5E1" />
          <line x1="50" y1="5" x2="50" y2="55" stroke="#CBD5E1" />
          <path d="M 25,10 Q 50,55 75,10" stroke="#EAB308" strokeWidth="2" fill="none" />
          <circle cx="50" cy="40" r="2.5" fill="#0F172A" />
        </svg>
      )
    },
    {
      title: 'Cardioid Heart Parametric Curve',
      category: 'Curves',
      description: 'Cardioid kinematics where cubed sine generates broad lobes and alternating cosines indent the cusp.',
      formula: 'x(t) = 16 \\sin^3(t)',
      diagramSvg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 stroke-slate-800 fill-none stroke-[1.5]">
          <path d="M 50,48 C 30,35 15,22 25,12 C 35,5 45,15 50,22 C 55,15 65,5 75,12 C 85,22 70,35 50,48 Z" fill="#FFE500" stroke="#0F172A" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      title: 'Temple Fay Butterfly Polar Curve',
      category: 'Transcendental',
      description: 'Periodic polar function modulated across 12π turns yielding symmetric biological wing petals.',
      formula: 'r(\\theta) = e^{\\cos\\theta} - 2\\cos(4\\theta) + \\sin^5\\left(\\frac{\\theta}{12}\\right)',
      diagramSvg: (
        <svg viewBox="0 0 100 60" className="w-24 h-14 stroke-slate-800 fill-none stroke-[1.5]">
          <path d="M 50,30 C 35,10 15,15 20,30 C 25,45 45,35 50,38 C 55,35 75,45 80,30 C 85,15 65,10 50,30 Z" fill="#FFE500" stroke="#0F172A" strokeWidth="1.5" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-5xl mx-auto custom-scrollbar math-notebook-bg">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[3px_4px_0px_#0f172a]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE500] border border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a]">
            <BookOpen className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Formulas & Mathematical Reference
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Formulas, geometric theorems, and computer vision scientific foundations
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 text-xs overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSection('formulas')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeSection === 'formulas'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Formula Cards
          </button>
          <button
            onClick={() => setActiveSection('image-to-eq')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeSection === 'image-to-eq'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Image-to-Equation Pipeline
          </button>
          <button
            onClick={() => setActiveSection('syntax')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeSection === 'syntax'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Graphing Syntax
          </button>
          <button
            onClick={() => setActiveSection('simulations')}
            className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeSection === 'simulations'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Sliders & Simulations
          </button>
        </div>
      </div>

      {/* Section 0: Formula Cards (Directly replicating the uploaded screenshot cards) */}
      {activeSection === 'formulas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORMULA_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-[2px_3px_0px_#0f172a] hover:shadow-[3px_4px_0px_#0f172a] transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-slate-900">{card.title}</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {card.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-2">
                    <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                      {card.diagramSvg}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium flex-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Pitch Yellow Formula Pill Badge (matches uploaded screenshot) */}
                <div className="self-end px-3.5 py-1.5 rounded-xl bg-[#FFE500] text-slate-950 font-bold text-xs border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                  <MathFormula math={card.formula} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Image-to-Equation Pipeline */}
      {activeSection === 'image-to-eq' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-500" />
              The Image-to-Equation Pipeline
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              EQUATIONX transforms arbitrary 2D visual raster silhouettes into authentic, continuous mathematical functions using a 4-stage pipeline combining computer vision, discrete differential geometry, and harmonic Fourier analysis.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Stage 1: Sobel Gradient Convolution & Thresholding
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  The image luminance function I(x, y) is convolved with horizontal and vertical Sobel kernel operators G_x and G_y:
                </p>
                <div className="text-xs text-center py-2 text-slate-900">
                  <MathFormula math="G_x = \begin{bmatrix}-1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1\end{bmatrix} * I, \quad G_y = \begin{bmatrix}-1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1\end{bmatrix} * I" block />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  The gradient magnitude |G| = √(G_x² + G_y²) identifies boundary edge pixels where color or luminosity experiences sharp spatial change.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Stage 2: Moore-Neighbor Tracing & Douglas-Peucker Simplification
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Continuous boundaries are extracted into ordered 2D vertex loops. We then apply the Douglas-Peucker polygonal simplification algorithm with tolerance ε:
                </p>
                <div className="text-xs text-center py-2 text-slate-900">
                  <MathFormula math="d(P_i, \overline{P_0 P_N}) = \frac{|\Delta y \cdot x_i - \Delta x \cdot y_i + x_N y_0 - y_N x_0|}{\sqrt{(\Delta x)^2 + (\Delta y)^2}}" block />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Stage 3: Discrete Fourier Transform (DFT) Epicycle Decomposition
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  For parameter t ∈ [0, 2π], we compute discrete Fourier coefficients for coordinate functions x_n and y_n:
                </p>
                <div className="text-xs text-center py-2 text-slate-900">
                  <MathFormula math="X_k = \frac{1}{N}\sum_{n=0}^{N-1} x_n e^{-i \frac{2\pi k n}{N}} = a_k - i b_k" block />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  This generates smooth parametric harmonic equations:
                </p>
                <div className="text-xs text-center py-2 text-slate-900">
                  <MathFormula math="x(t) = a_0 + \sum_{k=1}^H \left(2 a_k \cos(kt) - 2 b_k \sin(kt)\right), \quad y(t) = c_0 + \sum_{k=1}^H \left(2 c_k \cos(kt) - 2 d_k \sin(kt)\right)" block />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Syntax */}
      {activeSection === 'syntax' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-500" />
              Supported Mathematical Equation Types
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-900">Cartesian Functions</div>
                <div className="font-mono font-bold text-amber-600">y = sin(x) * exp(-0.1*x)</div>
                <p className="text-slate-600 text-[11px] font-medium">
                  Standard single-valued functions y = f(x). Supports polynomials, rational functions, trigonometric, hyperbolic, logs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-900">Parametric Curves</div>
                <div className="font-mono font-bold text-amber-600">x(t) = 5*cos(t), y(t) = 5*sin(t)</div>
                <p className="text-slate-600 text-[11px] font-medium">
                  Dual coordinate parameterization x(t), y(t) with configurable parameter bounds t_min ≤ t ≤ t_max.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-900">Polar Equations</div>
                <div className="font-mono font-bold text-amber-600">r = 3 * (1 - cos(theta))</div>
                <p className="text-slate-600 text-[11px] font-medium">
                  Radial functions r = f(θ). Automatically rendered using polar coordinate transformations (r cosθ, r sinθ).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-900">Implicit Curves & Conics</div>
                <div className="font-mono font-bold text-amber-600">x^2 + y^2 = 25  or  x^3 + y^3 - 3*x*y = 0</div>
                <p className="text-slate-600 text-[11px] font-medium">
                  Curves defined by F(x, y) = 0. Evaluated using real-time Marching Squares contour sign-change detection.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Simulations */}
      {activeSection === 'simulations' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            Automatic Variable Detection & Dynamic Sliders
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            When you type an equation containing constants or parameters such as:
          </p>
          <div className="p-4 bg-[#FFFDF0] rounded-2xl font-mono font-bold text-sm text-slate-900 border border-yellow-200 text-center">
            y = A * sin(k * x - w * t)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            EQUATIONX automatically parses the symbolic expression tree using `mathjs`, detects the undeclared parameters <code className="text-amber-600 font-bold">A, k, w, t</code>, and spawns interactive sliders in the left panel.
          </p>
        </div>
      )}
    </div>
  );
};
