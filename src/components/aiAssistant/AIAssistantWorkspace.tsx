import React, { useState } from 'react';
import { Equation, SliderVar } from '../../types';
import { MathFormula } from '../common/MathFormula';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Layers,
  Smile,
  Zap
} from 'lucide-react';

interface AIAssistantWorkspaceProps {
  onAddEquationsToGraph: (equations: Equation[], sliders?: SliderVar[]) => void;
  onSwitchTo3D?: (expr: string) => void;
}

interface AIResponse {
  title: string;
  equations: Equation[];
  sliders?: SliderVar[];
  explanation: string;
  mathNotes: string;
  mode: '2d' | '3d';
  tag?: string;
}

const AI_KNOWLEDGE_BASE: Record<string, AIResponse> = {
  heart: {
    title: 'Cardioid-Derived Parametric Heart Curve',
    mode: '2d',
    tag: 'Heart Curve',
    equations: [
      {
        id: 'ai-eq-heart',
        type: 'parametric',
        expression: '16 * (sin(t))^3',
        parametricY: '13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)',
        domain: { min: 0, max: 2 * Math.PI, step: 0.02 },
        color: '#f43f5e',
        strokeWidth: 3.5,
        visible: true,
        opacity: 1,
        label: 'Heart Curve',
      },
    ],
    explanation:
      'The horizontal coordinate x(t) = 16 sin³(t) uses cubed sine to create the broad horizontal lobes and tapered lower point. The vertical coordinate y(t) uses a linear combination of 4 cosine harmonics: fundamental 13 cos(t) gives the vertical height, while higher harmonics 5 cos(2t), 2 cos(3t), and cos(4t) indent the top cleft and sharpen the bottom cusp.',
    mathNotes: 'x(t) = 16\\sin^3(t), \\quad y(t) = 13\\cos(t) - 5\\cos(2t) - 2\\cos(3t) - \\cos(4t)',
  },
  butterfly: {
    title: 'Temple Fay Transcendental Butterfly Curve',
    mode: '2d',
    tag: 'Polar Butterfly',
    equations: [
      {
        id: 'ai-eq-butterfly',
        type: 'polar',
        expression: 'exp(cos(theta)) - 2*cos(4*theta) + (sin(theta/12))^5',
        domain: { min: 0, max: 12 * Math.PI, step: 0.02 },
        color: '#eab308',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Butterfly Curve',
      },
    ],
    explanation:
      'Discovered by Temple H. Fay in 1989. The term e^{cos(θ)} provides the baseline egg-shaped radial profile, -2 cos(4θ) modulates four distinct wing lobes (quadrant symmetry), and the slow sub-harmonic sin⁵(θ/12) perturbs the wings across multiple turns (period of 12π).',
    mathNotes: 'r(\\theta) = e^{\\cos\\theta} - 2\\cos(4\\theta) + \\sin^5\\left(\\frac{\\theta}{12}\\right)',
  },
  spiral: {
    title: 'Logarithmic Equiangular Golden Spiral',
    mode: '2d',
    tag: 'Golden Spiral',
    equations: [
      {
        id: 'ai-eq-spiral',
        type: 'polar',
        expression: 'a * exp(b * theta)',
        domain: { min: 0, max: 8 * Math.PI, step: 0.02 },
        color: '#06b6d4',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Logarithmic Spiral',
      },
    ],
    sliders: [
      { variable: 'a', min: 0.1, max: 3, step: 0.1, value: 0.5, isPlaying: false, speed: 1, direction: 1 },
      { variable: 'b', min: 0.05, max: 0.4, step: 0.01, value: 0.15, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'A self-similar logarithmic spiral where the angle between the tangent and radial line is constant (equiangular). Appears abundantly in nature: nautilus shells, tropical cyclones, and spiral galaxies.',
    mathNotes: 'r(\\theta) = a \\cdot e^{b \\theta}',
  },
  ripple: {
    title: '3D Bessel Circular Wave Ripple',
    mode: '3d',
    tag: '3D Ripple',
    equations: [
      {
        id: 'ai-eq-3d-ripple',
        type: 'surface3d',
        expression: '2.5 * sin(sqrt(x^2 + y^2) - t)',
        color: '#0c87eb',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
      },
    ],
    sliders: [
      { variable: 't', min: 0, max: 20, step: 0.1, value: 0, isPlaying: true, speed: 1, direction: 1 },
    ],
    explanation:
      'Represents a 2D radial wave propagating outward from the origin with time parameter t. The argument √(x² + y²) represents the Euclidean distance from origin, producing concentric circular wavefronts.',
    mathNotes: 'z(x, y, t) = A \\cdot \\sin\\left(\\sqrt{x^2 + y^2} - t\\right)',
  },
  fourier: {
    title: 'Fourier Series Square Wave Synthesis',
    mode: '2d',
    tag: 'Fourier Series',
    equations: [
      {
        id: 'ai-eq-fourier',
        type: 'cartesian',
        expression: 'y = (4/pi) * (sin(x) + (1/3)*sin(3*x) + (1/5)*sin(5*x) + (1/7)*sin(7*x))',
        color: '#10b981',
        strokeWidth: 3.5,
        visible: true,
        opacity: 1,
        label: 'Fourier N=4',
      },
    ],
    explanation:
      'Fourier theorem states that any periodic function can be reconstructed as a sum of sinusoidal harmonics. A square wave requires only odd harmonics (1, 3, 5, 7, ...), with each amplitude scaled by 1/n.',
    mathNotes: 'f(x) = \\frac{4}{\\pi} \\sum_{k=1}^N \\frac{\\sin((2k-1)x)}{2k-1}',
  },
  batman: {
    title: 'Famous Batman Silhouette Algebraic Curve',
    mode: '2d',
    tag: 'Batman Logo',
    equations: [
      {
        id: 'ai-bat-wings',
        type: 'cartesian',
        expression: 'y = 2 * sqrt(-abs(abs(x) - 1) * abs(3 - abs(x)) / ((abs(x) - 1) * (3 - abs(x)))) * (1 + abs(abs(x) - 3) / (abs(x) - 3)) * sqrt(1 - (x / 7)^2) + (5 + 0.97 * (abs(x - 0.5) + abs(x + 0.5)) - 3 * (abs(x - 0.75) + abs(x + 0.75))) * (1 + abs(1 - abs(x)) / (1 - abs(x)))',
        color: '#eab308',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Batman Wings & Ears',
      },
    ],
    explanation:
      'The iconic piecewise algebraic equation popularized on the internet. Uses absolute value expressions and square root domain cutoffs to generate the bat logo outline.',
    mathNotes: '\\text{Piecewise combination of 6 elliptic, linear and root domains}',
  },
};

export const AIAssistantWorkspace: React.FC<AIAssistantWorkspaceProps> = ({
  onAddEquationsToGraph,
  onSwitchTo3D,
}) => {
  const [prompt, setPrompt] = useState('');
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(
    AI_KNOWLEDGE_BASE['heart']
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const sampleQueries = [
    { label: 'Draw a heart shape', key: 'heart' },
    { label: 'Butterfly polar curve', key: 'butterfly' },
    { label: 'Equiangular golden spiral', key: 'spiral' },
    { label: '3D propagating ripple surface', key: 'ripple' },
    { label: 'Fourier square wave synthesis', key: 'fourier' },
    { label: 'Batman curve equation', key: 'batman' },
  ];

  const handleQuery = (queryText: string) => {
    const lower = queryText.toLowerCase();

    let matchedKey = 'heart';
    if (lower.includes('butter')) matchedKey = 'butterfly';
    else if (lower.includes('spiral')) matchedKey = 'spiral';
    else if (lower.includes('ripple') || lower.includes('3d') || lower.includes('wave')) matchedKey = 'ripple';
    else if (lower.includes('fourier') || lower.includes('harm')) matchedKey = 'fourier';
    else if (lower.includes('batman')) matchedKey = 'batman';

    setCurrentResponse(AI_KNOWLEDGE_BASE[matchedKey]);
    setAddedSuccess(false);
  };

  const handleApplyToWorkspace = () => {
    if (!currentResponse) return;

    if (currentResponse.mode === '3d' && onSwitchTo3D) {
      onSwitchTo3D(currentResponse.equations[0].expression);
    } else {
      onAddEquationsToGraph(currentResponse.equations, currentResponse.sliders);
    }

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-7 max-w-5xl mx-auto custom-scrollbar math-notebook-bg">
      {/* MathRobo Welcome Hero Card (Directly inspired by user uploaded picture) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[3px_4px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE500] text-slate-950 font-black text-xs border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
            <Zap className="w-3.5 h-3.5" />
            <span>AI MATHROBO ASSISTANT</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            I'm MathRobo
          </h1>
          <p className="text-base font-semibold text-slate-600 max-w-lg">
            and I will help you with math, generate equations from natural language, and model complex curves!
          </p>
        </div>

        {/* Cute MathRobo Visual Mascot with Pitch Yellow Blob */}
        <div className="relative flex items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-[#FFE500] border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-900 flex flex-col items-center justify-center shadow-md">
              <div className="w-12 h-6 bg-slate-900 rounded-lg flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
                <span className="w-2 h-2 rounded-full bg-[#FFE500]" />
              </div>
              <span className="text-[10px] font-mono font-black text-slate-900">∑X</span>
            </div>
          </div>
        </div>
      </div>

      {/* Natural Language Prompt Input */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && prompt.trim()) {
                handleQuery(prompt);
              }
            }}
            placeholder="Ask MathRobo: e.g. Draw a heart shape, or generate a butterfly curve..."
            className="w-full pl-5 pr-28 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 shadow-inner font-medium"
          />

          <button
            onClick={() => {
              if (prompt.trim()) handleQuery(prompt);
            }}
            className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-black text-xs flex items-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Suggestions:</span>
          {sampleQueries.map((q) => (
            <button
              key={q.key}
              onClick={() => {
                setPrompt(q.label);
                handleQuery(q.key);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#FFF9C4] text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-yellow-400 text-[11px] font-bold transition-all shadow-sm"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Synthesis Result Card (Matches reference formula cards) */}
      {currentResponse && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="font-black text-slate-900 text-lg">{currentResponse.title}</h3>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                  {currentResponse.mode.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Generated equations and analytical derivation ready for simulation.
              </p>
            </div>

            <button
              onClick={handleApplyToWorkspace}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all border border-slate-900 shadow-[1px_2px_0px_#0f172a] active:scale-95 ${
                addedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#FFE500] hover:bg-[#FFD600] text-slate-950'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to Workspace!</span>
                </>
              ) : (
                <>
                  <span>Plot in {currentResponse.mode === '3d' ? '3D Simulator' : '2D Calculator'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Mathematical Formula Preview in Crisp Pitch Yellow Tag */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Mathematical Formulation:
            </span>
            <div className="text-base text-slate-900 font-mono overflow-x-auto py-1">
              <MathFormula math={currentResponse.mathNotes} block />
            </div>
          </div>

          {/* Mathematical Derivation & Explanation */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Mathematical Derivation & Analytical Insights
            </span>
            <div className="text-xs text-slate-600 leading-relaxed bg-[#FFFDF0] p-4 rounded-2xl border border-yellow-200 font-medium">
              {currentResponse.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Image-to-Equation Scientific Explainer Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-amber-500" />
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
            How EQUATIONX Converts Images into Equations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900">1. Spatial Gradients & Contours</div>
            <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
              Applies Sobel gradient kernels to detect boundary edge pixels, followed by Moore-neighbor boundary tracing to form continuous loops.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900">2. Douglas-Peucker Simplification</div>
            <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
              Recursive divide-and-conquer algorithm that eliminates noise vertices within perpendicular distance tolerance ε, yielding clean wireframes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900">3. Discrete Fourier Epicycles</div>
            <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
              Computes exact Fourier coefficients a_k, b_k for coordinate functions x(t), y(t) to recreate the entire silhouette using rotating harmonic circles!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
