import React, { useState, useRef, useEffect } from 'react';
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
  User,
  RotateCcw,
  Box,
  Activity
} from 'lucide-react';

interface AIAssistantWorkspaceProps {
  onAddEquationsToGraph: (equations: Equation[], sliders?: SliderVar[]) => void;
  onSwitchTo3D?: (expr: string) => void;
}

export interface AIResponse {
  title: string;
  equations: Equation[];
  sliders?: SliderVar[];
  explanation: string;
  mathNotes: string;
  mode: '2d' | '3d';
  tag?: string;
  expression3D?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  response?: AIResponse;
}

export const AI_KNOWLEDGE_BASE: Record<string, AIResponse> = {
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
      "Gabriel's Horn (also known as Torricelli's Trumpet) is one of the most famous mathematical figures in history, discovered by Evangelista Torricelli in 1644. It is formed by rotating the curve y = 1/x (for x ≥ 1) around the axis. It exhibits the renowned 'Painter's Paradox': it possesses a strictly finite volume (V = π), yet an infinitely large surface area (A = ∞)! This means the trumpet could hold a finite bucket of paint (π cubic units), but its inner surface could never be completely coated by any finite amount of paint!",
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
      'The hyperbolic paraboloid is a doubly-ruled quadric surface with opposite principal curvatures at the origin. In geometry and multivariable calculus, the origin (0, 0, 0) represents a classic critical saddle point where the gradient is zero (∇z = 0), yet the point is neither a local maximum nor a local minimum.',
    mathNotes: 'z = \\frac{x^2 - y^2}{a}, \\quad \\frac{\\partial^2 z}{\\partial x^2} > 0, \\quad \\frac{\\partial^2 z}{\\partial y^2} < 0',
  },
  catenoid: {
    title: 'Catenoid Minimal Surface',
    mode: '3d',
    tag: 'Catenoid',
    expression3D: 'cosh(sqrt(x^2 + y^2)/2.5) - 1',
    equations: [
      {
        id: 'ai-eq-catenoid',
        type: 'surface3d',
        expression: 'cosh(sqrt(x^2 + y^2)/2.5) - 1',
        color: '#f59e0b',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Catenoid',
      },
    ],
    explanation:
      'The catenoid was discovered by Leonhard Euler in 1744. It is the only minimal surface of revolution in 3D Euclidean space other than the plane. It is naturally formed by dipping two parallel circular wire rings into soap solution, as surface tension minimizes the total surface area.',
    mathNotes: 'z(x, y) = c \\cdot \\cosh\\left(\\frac{\\sqrt{x^2 + y^2}}{c}\\right) - c, \\quad H = 0 \\text{ (Mean Curvature)}',
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
      'An elliptic paraboloid shaped like an open cup or bowl. Cross sections parallel to the xy-plane form concentric circles, while vertical cross sections form parabolas. Used in satellite dish receivers and telescope mirrors due to its reflective focal convergence.',
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

  // 1. Gabriel's Horn / Trumpet / function (including spelling variations like "gabriell", "gabriel's", "trumpet", "horn")
  if (
    lower.includes('gabriel') ||
    lower.includes('gabriell') ||
    lower.includes('trumpet') ||
    lower.includes('torricelli') ||
    (lower.includes('horn') && (lower.includes('3d') || lower.includes('surface') || lower.includes('function') || lower.includes('draw')))
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
  if (lower.includes('catenoid')) return AI_KNOWLEDGE_BASE['catenoid'];
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

  // 6. Generic 3D request fallback: if user explicitly asked for "3d", provide an interactive 3D surface (Gabriel's horn)
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
  const [isThinking, setIsThinking] = useState(false);
  const [activeLaunchedId, setActiveLaunchedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Conversation history: starts with friendly MathRobo greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "👋 Hello! I'm MathRobo, your AI mathematical copilot. Ask me to generate any 3D surface (e.g. Gabriel's horn, hyperbolic saddle, sphere, catenoid) or 2D curve, or type an equation like `z = 4/(sqrt(x^2+y^2)+0.2)`!",
    },
    {
      id: 'msg-initial-gabriel',
      sender: 'assistant',
      timestamp: 'Just now',
      response: AI_KNOWLEDGE_BASE['gabriel'],
    },
  ]);

  const sampleQueries = [
    { label: "Draw Gabriel's Horn in 3D", query: "draw gabriell's funtion in the 3d" },
    { label: 'Hyperbolic Saddle surface', query: 'draw a saddle surface in 3d' },
    { label: 'Draw a heart shape', query: 'draw a heart shape' },
    { label: 'Temple Fay butterfly curve', query: 'draw a butterfly curve' },
    { label: '3D circular wave ripple', query: 'show me a 3d wave ripple' },
    { label: 'Catenoid minimal surface', query: 'draw a catenoid in 3d' },
  ];

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = (queryText: string) => {
    const text = queryText.trim();
    if (!text) return;

    // 1. Append User message immediately
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsThinking(true);

    // 2. Synthesize response with short organic thinking delay
    setTimeout(() => {
      const response = interpretMathQuery(text);
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I have analyzed your request "${text}" and synthesized the mathematical model for **${response.title}**!`,
        response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 350);
  };

  const handleLaunch = (msgId: string, response: AIResponse) => {
    if (response.mode === '3d' && onSwitchTo3D) {
      const expr = response.expression3D || response.equations[0]?.expression || '4 / (sqrt(x^2 + y^2) + 0.2)';
      onSwitchTo3D(expr);
    } else {
      onAddEquationsToGraph(response.equations, response.sliders);
    }

    setActiveLaunchedId(msgId);
    setTimeout(() => setActiveLaunchedId(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto custom-scrollbar math-notebook-bg flex flex-col h-full">
      {/* MathRobo Welcome Hero Card */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[3px_4px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden flex-shrink-0">
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE500] text-slate-950 font-black text-xs border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
            <Zap className="w-3.5 h-3.5" />
            <span>AI MATHROBO ASSISTANT</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            I'm MathRobo
          </h1>
          <p className="text-base font-semibold text-slate-600 max-w-lg">
            and I will help you with math! Type any mathematical equation or name in the chat below.
          </p>
        </div>

        {/* MathRobo Mascot */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-[#FFE500] border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] flex items-center justify-center relative">
            <div className="w-18 h-18 p-3 rounded-2xl bg-white border-2 border-slate-900 flex flex-col items-center justify-center shadow-md">
              <div className="w-12 h-6 bg-slate-900 rounded-lg flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-black text-slate-900">∑X</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chat Stream */}
      <div className="space-y-4 flex-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Assistant Avatar */}
            {msg.sender === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-[#FFE500] border-2 border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a] flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
            )}

            {/* Message Bubble Container */}
            <div
              className={`max-w-2xl rounded-3xl p-5 border-2 transition-all ${
                msg.sender === 'user'
                  ? 'bg-[#FFE500] border-slate-900 text-slate-950 shadow-[2px_3px_0px_#0f172a]'
                  : 'bg-white border-slate-900 text-slate-900 shadow-[2px_3px_0px_#0f172a]'
              }`}
            >
              {/* Header/Timestamp */}
              <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-black/10 text-xs">
                <span className="font-black text-xs flex items-center gap-1.5">
                  {msg.sender === 'user' ? (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>You</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>MathRobo</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-mono opacity-70">{msg.timestamp}</span>
              </div>

              {/* Text content if present */}
              {msg.text && (
                <p className="text-sm font-semibold leading-relaxed mb-3">
                  {msg.text}
                </p>
              )}

              {/* Synthesized Mathematical Response Card */}
              {msg.response && (
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <div className="font-black text-sm text-slate-900">{msg.response.title}</div>
                      <div className="text-[11px] text-slate-500 font-medium">Ready for real-time visualization</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                      {msg.response.mode.toUpperCase()}
                    </span>
                  </div>

                  {/* Mathematical Formulation Preview */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-inner">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Mathematical Formulation:
                    </span>
                    <div className="text-sm text-slate-900 font-mono overflow-x-auto py-1">
                      <MathFormula math={msg.response.mathNotes} block />
                    </div>
                  </div>

                  {/* Derivation / Analytical Explanation */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-[#FFFDF0] p-4 rounded-2xl border border-yellow-200 font-medium">
                    {msg.response.explanation}
                  </div>

                  {/* Action Launch Button */}
                  <button
                    onClick={() => handleLaunch(msg.id, msg.response!)}
                    className={`w-full py-3 px-5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] active:scale-95 ${
                      activeLaunchedId === msg.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#FFE500] hover:bg-[#FFD600] text-slate-950'
                    }`}
                  >
                    {activeLaunchedId === msg.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Launched to {msg.response.mode === '3d' ? '3D Simulator' : '2D Calculator'}!</span>
                      </>
                    ) : (
                      <>
                        {msg.response.mode === '3d' ? <Box className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        <span>Plot in {msg.response.mode === '3d' ? '3D Simulator' : '2D Calculator'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <User className="w-5 h-5 text-yellow-300" />
              </div>
            )}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 items-center text-xs font-bold text-slate-600 animate-pulse">
            <div className="w-9 h-9 rounded-2xl bg-[#FFE500] border-2 border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a]">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-200" />
              <span>MathRobo is computing mathematical formulation & derivations...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Sticky Bottom Prompt Input Bar */}
      <div className="sticky bottom-0 bg-white border-2 border-slate-900 rounded-3xl p-4 shadow-[3px_4px_0px_#0f172a] space-y-3 z-30 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend(prompt);
              }
            }}
            placeholder="Ask MathRobo: e.g. draw Gabriel's function in 3D, or plot a hyperbolic saddle..."
            className="w-full pl-5 pr-28 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 shadow-inner font-medium"
          />

          <button
            onClick={() => handleSend(prompt)}
            className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-black text-xs flex items-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Try asking:</span>
          {sampleQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => handleSend(q.query)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#FFF9C4] text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-yellow-400 text-[11px] font-bold transition-all shadow-sm"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
