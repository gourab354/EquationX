import React, { useState } from 'react';
import { Equation, SliderVar } from '../../types';
import { MathFormula } from '../common/MathFormula';
import { extractSliderVariables, cleanExpression } from '../../math/parser';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Zap,
  HelpCircle
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
  expression3D?: string;
}

const AI_KNOWLEDGE_BASE: Record<string, AIResponse> = {
  gabriel: {
    title: "Gabriel's Horn (Torricelli's Trumpet)",
    mode: '3d',
    tag: "Gabriel's Horn",
    expression3D: '4 / (sqrt(x^2 + y^2) + 0.2)',
    equations: [
      {
        id: 'ai-eq-gabriel',
        type: 'surface3d',
        expression: 'a / (sqrt(x^2 + y^2) + 0.2)',
        color: '#eab308',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: "Gabriel's Horn",
      },
    ],
    sliders: [
      { variable: 'a', min: 1, max: 10, step: 0.2, value: 4, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      "Gabriel's Horn (also known as Torricelli's Trumpet) is a famous mathematical figure discovered by Evangelista Torricelli in 1644. It is formed by rotating the curve y = 1/x (for x ≥ 1) around the axis. It exhibits the renowned 'Painter's Paradox': it possesses a strictly finite volume (V = π), yet an infinitely large surface area (A = ∞)! This means the horn could hold a finite volume of paint (π cubic units), but its inner surface could never be completely coated by any finite amount of paint!",
    mathNotes: 'z(x, y) = \\frac{a}{\\sqrt{x^2 + y^2} + 0.2}, \\quad V = \\pi \\int_1^\\infty \\frac{1}{x^2}\\,dx = \\pi, \\quad A = 2\\pi \\int_1^\\infty \\frac{1}{x}\\sqrt{1 + \\frac{1}{x^4}}\\,dx = \\infty',
  },
  saddle: {
    title: 'Hyperbolic Paraboloid (Saddle Surface)',
    mode: '3d',
    tag: 'Saddle Surface',
    expression3D: '(x^2 - y^2) / a',
    equations: [
      {
        id: 'ai-eq-saddle',
        type: 'surface3d',
        expression: '(x^2 - y^2) / a',
        color: '#0c87eb',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Saddle Surface',
      },
    ],
    sliders: [
      { variable: 'a', min: 1, max: 8, step: 0.5, value: 3.5, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'The hyperbolic paraboloid is a doubly-ruled quadric surface with opposite principal curvatures at the origin. In geometry and calculus, the origin (0, 0, 0) represents a classic critical saddle point where the gradient is zero (∇z = 0), yet the point is neither a local maximum nor a local minimum.',
    mathNotes: 'z = \\frac{x^2 - y^2}{a}, \\quad \\frac{\\partial^2 z}{\\partial x^2} > 0, \\quad \\frac{\\partial^2 z}{\\partial y^2} < 0',
  },
  monkey: {
    title: 'Monkey Saddle Surface',
    mode: '3d',
    tag: 'Monkey Saddle',
    expression3D: '(x^3 - 3*x*y^2) / 10',
    equations: [
      {
        id: 'ai-eq-monkey',
        type: 'surface3d',
        expression: '(x^3 - 3*x*y^2) / 10',
        color: '#8b5cf6',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Monkey Saddle',
      },
    ],
    explanation:
      'The monkey saddle is defined by the cubic equation z = x³ - 3xy² = Re((x + iy)³). Unlike an ordinary saddle designed for two human legs, a monkey saddle possesses three distinct depressions descending from the stationary point at the origin: two for the monkey legs and one for its tail!',
    mathNotes: 'z(x, y) = \\frac{x^3 - 3xy^2}{10} = \\frac{\\text{Re}\\left((x + iy)^3\\right)}{10}',
  },
  sphere: {
    title: 'Spherical Hemisphere Surface',
    mode: '3d',
    tag: '3D Sphere',
    expression3D: 'sqrt(max(0, 25 - x^2 - y^2))',
    equations: [
      {
        id: 'ai-eq-sphere',
        type: 'surface3d',
        expression: 'sqrt(max(0, 25 - x^2 - y^2))',
        color: '#06b6d4',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Spherical Dome',
      },
    ],
    explanation:
      'The upper hemisphere of a sphere of radius R = 5 centered at the origin, derived from the Euclidean 3D sphere equation x² + y² + z² = R². The max(0, ...) guard restricts real evaluation strictly within the equatorial disc x² + y² ≤ 25.',
    mathNotes: 'z(x, y) = \\sqrt{R^2 - x^2 - y^2}, \\quad x^2 + y^2 \\le R^2',
  },
  paraboloid: {
    title: 'Elliptic Paraboloid (Parabolic Bowl)',
    mode: '3d',
    tag: 'Paraboloid',
    expression3D: '(x^2 + y^2) / a',
    equations: [
      {
        id: 'ai-eq-paraboloid',
        type: 'surface3d',
        expression: '(x^2 + y^2) / a',
        color: '#10b981',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Parabolic Bowl',
      },
    ],
    sliders: [
      { variable: 'a', min: 1, max: 10, step: 0.2, value: 4, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'An elliptic paraboloid shaped like an open cup or bowl. Cross sections parallel to the xy-plane form concentric ellipses or circles, while vertical cross sections parallel to the z-axis form parabolas. Used ubiquitously in satellite dish receivers and automobile headlamps due to its reflective focal convergence properties.',
    mathNotes: 'z(x, y) = \\frac{x^2 + y^2}{a}',
  },
  cone: {
    title: 'Right Circular 3D Cone',
    mode: '3d',
    tag: '3D Cone',
    expression3D: 'sqrt(x^2 + y^2)',
    equations: [
      {
        id: 'ai-eq-cone',
        type: 'surface3d',
        expression: 'sqrt(x^2 + y^2)',
        color: '#f59e0b',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Circular Cone',
      },
    ],
    explanation:
      'The upper nappe of a right circular cone with apex at origin (0, 0, 0). The height z equals the Euclidean radius r = √(x² + y²), creating an exact 45° slope relative to the horizontal base plane.',
    mathNotes: 'z(x, y) = \\sqrt{x^2 + y^2}',
  },
  gaussian: {
    title: '2D Bivariate Gaussian Bell Surface',
    mode: '3d',
    tag: 'Gaussian Bell',
    expression3D: '5 * exp(-0.2 * (x^2 + y^2))',
    equations: [
      {
        id: 'ai-eq-gaussian',
        type: 'surface3d',
        expression: 'A * exp(-k * (x^2 + y^2))',
        color: '#ec4899',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Gaussian Bell',
      },
    ],
    sliders: [
      { variable: 'A', min: 1, max: 10, step: 0.5, value: 5, isPlaying: false, speed: 1, direction: 1 },
      { variable: 'k', min: 0.05, max: 0.8, step: 0.05, value: 0.2, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'The 2D Gaussian probability density function (bell surface) describing isotropic normal distributions in statistics, quantum mechanical harmonic ground states, and diffusion heat equations.',
    mathNotes: 'z(x, y) = A \\cdot \\exp\\left(-k(x^2 + y^2)\\right)',
  },
  sombrero: {
    title: 'Sombrero (Bivariate 2D Sinc Wave)',
    mode: '3d',
    tag: 'Sombrero Sinc',
    expression3D: '5 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
    equations: [
      {
        id: 'ai-eq-sombrero',
        type: 'surface3d',
        expression: '5 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
        color: '#0c87eb',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Sombrero Hat',
      },
    ],
    explanation:
      'A radially symmetric 2D sinc function sinc(r) = sin(r)/r resembling a Mexican sombrero hat. Fundamental in optics and signal processing for Airy disc diffraction patterns and Fourier optical transfers.',
    mathNotes: 'z(x, y) = A \\cdot \\frac{\\sin\\left(\\sqrt{x^2 + y^2}\\right)}{\\sqrt{x^2 + y^2}}',
  },
  ripple: {
    title: '3D Bessel Circular Wave Ripple',
    mode: '3d',
    tag: '3D Ripple',
    expression3D: '2.5 * sin(sqrt(x^2 + y^2) - t)',
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
  torus: {
    title: '3D Torus Surface (Donut)',
    mode: '3d',
    tag: '3D Torus',
    expression3D: 'sqrt(max(0, 4 - (4 - sqrt(x^2 + y^2))^2))',
    equations: [
      {
        id: 'ai-eq-torus',
        type: 'surface3d',
        expression: 'sqrt(max(0, 4 - (4 - sqrt(x^2 + y^2))^2))',
        color: '#f59e0b',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Torus Ring',
      },
    ],
    explanation:
      'A torus of major radius R = 4 and minor tube radius r = 2, generated by revolving a circle in three-dimensional space about a coplanar axis.',
    mathNotes: '\\left(R - \\sqrt{x^2 + y^2}\\right)^2 + z^2 = r^2 \\implies z = \\pm\\sqrt{r^2 - \\left(R - \\sqrt{x^2 + y^2}\\right)^2}',
  },
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

/**
 * Intelligent NLP & mathematical query generator
 */
function interpretMathQuery(queryText: string): AIResponse {
  const text = queryText.trim();
  const lower = text.toLowerCase();

  // 1. Check for Gabriel's Horn / Trumpet / function (including spelling variations like "gabriell", "gabriel's")
  if (
    lower.includes('gabriel') ||
    lower.includes('gabriell') ||
    lower.includes('trumpet') ||
    lower.includes('torricelli') ||
    (lower.includes('horn') && (lower.includes('3d') || lower.includes('surface') || lower.includes('function')))
  ) {
    return AI_KNOWLEDGE_BASE['gabriel'];
  }

  // 2. Direct 3D Surface Expression detection: e.g. "z = sin(x)*y", "plot z = x^2 + y^2", "draw z = ..."
  const match3D = text.match(/z\s*=\s*([^;,\n]+)/i);
  if (match3D && match3D[1]) {
    const rawExpr = match3D[1].trim();
    const clean = cleanExpression(rawExpr);
    const vars = extractSliderVariables(clean).filter((v) => v !== 'x' && v !== 'y' && v !== 'z');

    const sliders: SliderVar[] = vars.map((v) => ({
      variable: v,
      min: 1,
      max: 10,
      step: 0.1,
      value: 3,
      isPlaying: v === 't',
      speed: 1,
      direction: 1,
    }));

    return {
      title: `Custom 3D Surface: z = ${rawExpr}`,
      mode: '3d',
      tag: 'Custom 3D',
      expression3D: clean,
      equations: [
        {
          id: `ai-custom-3d-${Date.now()}`,
          type: 'surface3d',
          expression: clean,
          color: '#eab308',
          strokeWidth: 2,
          visible: true,
          opacity: 0.95,
          label: `z = ${rawExpr}`,
        },
      ],
      sliders: sliders.length > 0 ? sliders : undefined,
      explanation: `Synthesized 3D bivariate surface z = f(x, y) based directly on your expression '${rawExpr}'. Evaluated across the Euclidean domain and visualized in real-time WebGL with height colormapping.`,
      mathNotes: `z(x, y) = ${clean.replace(/\*/g, ' ')}`,
    };
  }

  // 3. Direct 2D Cartesian Function detection: e.g. "y = x^3 - 2x", "f(x) = sin(x)"
  const match2D = text.match(/(y|f\(x\))\s*=\s*([^;,\n]+)/i);
  if (match2D && match2D[2]) {
    const rawExpr = match2D[2].trim();
    const clean = cleanExpression(rawExpr);
    const vars = extractSliderVariables(clean).filter((v) => v !== 'x');

    const sliders: SliderVar[] = vars.map((v) => ({
      variable: v,
      min: -10,
      max: 10,
      step: 0.1,
      value: 1,
      isPlaying: false,
      speed: 1,
      direction: 1,
    }));

    return {
      title: `Custom Cartesian Function: y = ${rawExpr}`,
      mode: '2d',
      tag: 'Custom 2D',
      equations: [
        {
          id: `ai-custom-2d-${Date.now()}`,
          type: 'cartesian',
          expression: `y = ${clean}`,
          color: '#0c87eb',
          strokeWidth: 3,
          visible: true,
          opacity: 1,
          label: `y = ${rawExpr}`,
        },
      ],
      sliders: sliders.length > 0 ? sliders : undefined,
      explanation: `Synthesized single-valued mathematical function y = f(x) for your input '${rawExpr}'. Ready to plot and simulate dynamically.`,
      mathNotes: `y = ${clean.replace(/\*/g, ' ')}`,
    };
  }

  // 4. Polar Function detection: e.g. "r = 2*cos(3*theta)"
  const matchPolar = text.match(/r\s*=\s*([^;,\n]+)/i);
  if (matchPolar && matchPolar[1]) {
    const rawExpr = matchPolar[1].trim();
    const clean = cleanExpression(rawExpr);
    return {
      title: `Custom Polar Curve: r = ${rawExpr}`,
      mode: '2d',
      tag: 'Custom Polar',
      equations: [
        {
          id: `ai-custom-polar-${Date.now()}`,
          type: 'polar',
          expression: clean,
          domain: { min: 0, max: 2 * Math.PI, step: 0.02 },
          color: '#ec4899',
          strokeWidth: 3,
          visible: true,
          opacity: 1,
          label: `r = ${rawExpr}`,
        },
      ],
      explanation: `Radial curve r = f(θ) parameterized over angle θ ∈ [0, 2π].`,
      mathNotes: `r(\\theta) = ${clean.replace(/\*/g, ' ')}`,
    };
  }

  // 5. Semantic keyword classification across mathematical dictionary
  if (lower.includes('saddle') && !lower.includes('monkey')) return AI_KNOWLEDGE_BASE['saddle'];
  if (lower.includes('monkey')) return AI_KNOWLEDGE_BASE['monkey'];
  if (lower.includes('sphere') || lower.includes('dome') || lower.includes('hemisphere')) return AI_KNOWLEDGE_BASE['sphere'];
  if (lower.includes('paraboloid') || lower.includes('bowl') || lower.includes('dish')) return AI_KNOWLEDGE_BASE['paraboloid'];
  if (lower.includes('cone') || lower.includes('funnel')) return AI_KNOWLEDGE_BASE['cone'];
  if (lower.includes('gaussian') || lower.includes('bell') || lower.includes('normal dist')) return AI_KNOWLEDGE_BASE['gaussian'];
  if (lower.includes('sombrero') || lower.includes('sinc') || lower.includes('hat')) return AI_KNOWLEDGE_BASE['sombrero'];
  if (lower.includes('torus') || lower.includes('donut')) return AI_KNOWLEDGE_BASE['torus'];
  if (lower.includes('butter')) return AI_KNOWLEDGE_BASE['butterfly'];
  if (lower.includes('spiral')) return AI_KNOWLEDGE_BASE['spiral'];
  if (lower.includes('ripple') || lower.includes('wave')) return AI_KNOWLEDGE_BASE['ripple'];
  if (lower.includes('fourier') || lower.includes('harm')) return AI_KNOWLEDGE_BASE['fourier'];
  if (lower.includes('batman') || lower.includes('bat logo')) return AI_KNOWLEDGE_BASE['batman'];
  if (lower.includes('heart') || lower.includes('cardioid') || lower.includes('love')) return AI_KNOWLEDGE_BASE['heart'];

  // 6. Generic 3D request fallback: if user explicitly asked for "3d", provide an interactive 3D surface
  if (lower.includes('3d') || lower.includes('surface')) {
    return AI_KNOWLEDGE_BASE['gabriel'];
  }

  // 7. General default: Heart curve
  return AI_KNOWLEDGE_BASE['heart'];
}

export const AIAssistantWorkspace: React.FC<AIAssistantWorkspaceProps> = ({
  onAddEquationsToGraph,
  onSwitchTo3D,
}) => {
  const [prompt, setPrompt] = useState('');
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(
    AI_KNOWLEDGE_BASE['gabriel']
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const sampleQueries = [
    { label: "Draw Gabriel's Horn in 3D", query: "draw gabriel's horn in 3d" },
    { label: 'Hyperbolic Saddle surface', query: 'draw a saddle surface in 3d' },
    { label: 'Draw a heart shape', query: 'draw a heart shape' },
    { label: 'Temple Fay butterfly curve', query: 'draw a butterfly curve' },
    { label: '3D circular wave ripple', query: 'show me a 3d wave ripple' },
    { label: 'Fourier square wave synthesis', query: 'fourier series square wave' },
  ];

  const handleQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    const response = interpretMathQuery(queryText);
    setCurrentResponse(response);
    setAddedSuccess(false);
  };

  const handleApplyToWorkspace = () => {
    if (!currentResponse) return;

    if (currentResponse.mode === '3d' && onSwitchTo3D) {
      const expr = currentResponse.expression3D || currentResponse.equations[0]?.expression || '4 / (sqrt(x^2 + y^2) + 0.2)';
      onSwitchTo3D(expr);
    } else {
      onAddEquationsToGraph(currentResponse.equations, currentResponse.sliders);
    }

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-7 max-w-5xl mx-auto custom-scrollbar math-notebook-bg">
      {/* MathRobo Welcome Hero Card */}
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
            and I will help you with math! Ask me to generate any 3D surface (e.g. Gabriel's horn, saddle, sphere) or 2D curve.
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
            placeholder="Ask MathRobo: e.g. draw Gabriel's function in 3D, or plot a hyperbolic saddle..."
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
          <span className="text-slate-400 font-bold text-[11px] mr-1">Try asking:</span>
          {sampleQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => {
                setPrompt(q.query);
                handleQuery(q.query);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#FFF9C4] text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-yellow-400 text-[11px] font-bold transition-all shadow-sm"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Synthesis Result Card */}
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

          {/* Mathematical Formula Preview */}
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
