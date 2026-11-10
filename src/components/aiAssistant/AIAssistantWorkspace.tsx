import React, { useState } from 'react';
import { Equation, SliderVar } from '../../types';
import { GoogleUser } from '../../types/auth';
import { MathFormula } from '../common/MathFormula';
import { extractSliderVariables, cleanExpression } from '../../math/parser';
import { generateEquationWithGemini } from '../../services/gemini';
import { GoogleIcon } from '../auth/GoogleAuthModal';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  Zap,
  Box,
  Activity,
  Compass,
  Lightbulb,
  Key,
  ShieldCheck,
  ExternalLink,
  Settings,
  X,
  AlertCircle,
  Lock
} from 'lucide-react';

interface AIAssistantWorkspaceProps {
  onAddEquationsToGraph: (equations: Equation[], sliders?: SliderVar[]) => void;
  onSwitchTo3D?: (expr: string) => void;
  currentUser: GoogleUser | null;
  onOpenAuth: () => void;
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
      "Gabriel's Horn (Torricelli's Trumpet) was discovered in 1644 by Evangelista Torricelli. Formed by revolving y = 1/x for x ≥ 1 around the axis, it exhibits the famous 'Painter's Paradox': it has a finite volume (V = π), yet an infinite surface area (A = ∞)! A finite bucket of paint (π cubic units) could fill the horn, but could never coat its inner surface!",
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
      'The hyperbolic paraboloid is a doubly-ruled quadric surface. In multivariable calculus, the origin (0, 0, 0) represents a classic critical saddle point where the gradient is zero (∇z = 0), yet the point is neither a local maximum nor a local minimum.',
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
      'Discovered by Leonhard Euler in 1744, the catenoid is the only minimal surface of revolution in 3D Euclidean space other than the plane. Naturally formed by soap films between two parallel rings, it maintains zero mean curvature (H = 0).',
    mathNotes: 'z(x, y) = c \\cdot \\cosh\\left(\\frac{\\sqrt{x^2 + y^2}}{c}\\right) - c, \\quad H = 0 \\text{ (Mean Curvature)}',
  },
  helicoid: {
    title: 'Helicoid Minimal Surface',
    mode: '3d',
    tag: 'Helicoid',
    expression3D: '2 * atan2(y, x)',
    equations: [
      {
        id: 'ai-eq-helicoid',
        type: 'surface3d',
        expression: 'c * atan2(y, x)',
        color: '#8b5cf6',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Helicoid Ramp',
      },
    ],
    sliders: [
      { variable: 'c', min: 0.5, max: 4, step: 0.2, value: 2, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'The helicoid is a ruled minimal surface forming a continuous spiral ramp winding around the z-axis. It is isometric to the catenoid through a continuous Bonnet deformation family.',
    mathNotes: 'z(x, y) = c \\cdot \\text{atan2}(y, x), \\quad H = 0',
  },
  torus: {
    title: 'Ring Torus 3D Surface',
    mode: '3d',
    tag: 'Torus',
    expression3D: 'sqrt(max(0, 4 - (4 - sqrt(x^2 + y^2))^2))',
    equations: [
      {
        id: 'ai-eq-torus-top',
        type: 'surface3d',
        expression: 'sqrt(max(0, r^2 - (R - sqrt(x^2 + y^2))^2))',
        color: '#ec4899',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Upper Torus Dome',
      },
    ],
    sliders: [
      { variable: 'R', min: 2, max: 8, step: 0.2, value: 4, isPlaying: false, speed: 1, direction: 1 },
      { variable: 'r', min: 0.5, max: 3, step: 0.1, value: 2, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'A torus generated by revolving a circle of minor radius r about a coplanar axis at major distance R. It is a compact manifold of genus 1 with Euler characteristic χ = 0.',
    mathNotes: 'z(x, y) = \\pm \\sqrt{r^2 - \\left(R - \\sqrt{x^2 + y^2}\\right)^2}',
  },
  blackhole: {
    title: 'Black Hole Gravitational Potential Well',
    mode: '3d',
    tag: 'Astrophysics',
    expression3D: '-6 / (sqrt(x^2 + y^2) + 0.3)',
    equations: [
      {
        id: 'ai-eq-blackhole',
        type: 'surface3d',
        expression: '-M / (sqrt(x^2 + y^2) + 0.3)',
        color: '#0f172a',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Curved Spacetime Funnel',
      },
    ],
    sliders: [
      { variable: 'M', min: 1, max: 15, step: 0.5, value: 6, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      "A geometric visualization of Schwarzschild spacetime curvature and Newtonian gravitational potential Φ(r) = -GM/r. Near the singularity r → 0, spacetime geometry stretches infinitely into a gravitational funnel.",
    mathNotes: '\\Phi(x, y) = -\\frac{GM}{\\sqrt{x^2 + y^2} + \\epsilon}, \\quad g = -\\nabla \\Phi',
  },
  eggcarton: {
    title: 'Egg Carton 2D Grid Periodic Surface',
    mode: '3d',
    tag: 'Periodic Grid',
    expression3D: '2 * sin(x) * cos(y)',
    equations: [
      {
        id: 'ai-eq-eggcarton',
        type: 'surface3d',
        expression: 'A * sin(x) * cos(y)',
        color: '#10b981',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Periodic Hills & Valleys',
      },
    ],
    sliders: [
      { variable: 'A', min: 0.5, max: 5, step: 0.2, value: 2, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'A 2D doubly-periodic wave surface resembling an egg carton tray or crystalline optical lattice in condensed matter physics, formed by the product of orthogonal sinusoids.',
    mathNotes: 'z(x, y) = A \\cdot \\sin(x) \\cos(y)',
  },
  volcano: {
    title: 'Caldera Crater & Volcanic Peak',
    mode: '3d',
    tag: 'Terrain',
    expression3D: '6 * (x^2 + y^2) * exp(-0.3 * (x^2 + y^2))',
    equations: [
      {
        id: 'ai-eq-volcano',
        type: 'surface3d',
        expression: 'A * (x^2 + y^2) * exp(-k * (x^2 + y^2))',
        color: '#f97316',
        strokeWidth: 2,
        visible: true,
        opacity: 0.95,
        label: 'Volcano Caldera',
      },
    ],
    sliders: [
      { variable: 'A', min: 1, max: 10, step: 0.5, value: 6, isPlaying: false, speed: 1, direction: 1 },
      { variable: 'k', min: 0.1, max: 0.8, step: 0.05, value: 0.3, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'A radial ring-ridge model with central caldera depression, formed by scaling quadratic radial growth (r²) by exponential Gaussian damping e^(-kr²).',
    mathNotes: 'z(x, y) = A(x^2 + y^2) e^{-k(x^2 + y^2)}',
  },
  sombrero: {
    title: 'Sombrero Sinc Function (Airy Diffraction Disc)',
    mode: '3d',
    tag: 'Wave Optics',
    expression3D: '5 * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
    equations: [
      {
        id: 'ai-eq-sombrero',
        type: 'surface3d',
        expression: 'A * sin(sqrt(x^2 + y^2) + 0.001) / (sqrt(x^2 + y^2) + 0.001)',
        color: '#0c87eb',
        strokeWidth: 2,
        visible: true,
        opacity: 0.9,
        label: 'Sombrero Sinc Wave',
      },
    ],
    sliders: [
      { variable: 'A', min: 1, max: 10, step: 0.5, value: 5, isPlaying: false, speed: 1, direction: 1 },
    ],
    explanation:
      'Radially symmetric 2D sinc function sinc(r) = sin(r)/r resembling a Mexican sombrero hat. Crucial in optics for circular aperture diffraction patterns.',
    mathNotes: 'z(x, y) = A \\cdot \\frac{\\sin(\\sqrt{x^2 + y^2})}{\\sqrt{x^2 + y^2}}',
  },
  heart: {
    title: 'Cardioid Mathematical Heart Curve',
    mode: '2d',
    tag: 'Heart Curve',
    equations: [
      {
        id: 'ai-heart-top',
        type: 'cartesian',
        expression: 'y = sqrt(1 - (abs(x) - 1)^2)',
        color: '#f43f5e',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Heart Upper Lobes',
      },
      {
        id: 'ai-heart-bottom',
        type: 'cartesian',
        expression: 'y = -3 * sqrt(1 - sqrt(abs(x) / 2))',
        color: '#e11d48',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'Heart Lower Apex',
      },
    ],
    explanation:
      'A beautiful closed algebraic cardioid heart curve constructed piecewise using reflection symmetry abs(x).',
    mathNotes: 'y = \\sqrt{1 - (|x| - 1)^2}, \\quad y = -3\\sqrt{1 - \\sqrt{|x|/2}}',
  },
  butterfly: {
    title: 'Temple Fay Butterfly Transcendental Curve',
    mode: '2d',
    tag: 'Butterfly Curve',
    equations: [
      {
        id: 'ai-butterfly',
        type: 'polar',
        expression: 'exp(cos(theta)) - 2*cos(4*theta) + sin(theta/12)^5',
        domain: { min: 0, max: 24 * Math.PI, step: 0.05 },
        color: '#8b5cf6',
        strokeWidth: 2.5,
        visible: true,
        opacity: 1,
        label: 'Temple Fay Butterfly',
      },
    ],
    explanation:
      'Discovered by Temple H. Fay in 1989, this intricate polar curve produces realistic butterfly wings through a harmonic superposition of exponential growth and oscillation.',
    mathNotes: 'r(\\theta) = e^{\\cos\\theta} - 2\\cos(4\\theta) + \\sin^5\\left(\\frac{\\theta}{12}\\right)',
  },
  rose: {
    title: 'Mathematical Rose Curve (Rhodonea)',
    mode: '2d',
    tag: 'Polar Rose',
    equations: [
      {
        id: 'ai-rose',
        type: 'polar',
        expression: '3 * cos(5 * theta)',
        domain: { min: 0, max: Math.PI, step: 0.02 },
        color: '#e11d48',
        strokeWidth: 2.5,
        visible: true,
        opacity: 1,
        label: '5-Petal Rose',
      },
    ],
    explanation:
      'Named rhodonea by Italian mathematician Guido Grandi in 1728. For integer k, r = a cos(kθ) generates a flower with k petals (if k is odd) or 2k petals (if k is even).',
    mathNotes: 'r(\\theta) = a \\cos(k\\theta)',
  },
  dna: {
    title: 'DNA Double Helix Parametric Curve',
    mode: '2d',
    tag: 'Parametric Helix',
    equations: [
      {
        id: 'ai-dna-strand1',
        type: 'parametric',
        expression: '3 * cos(t)',
        parametricY: '0.4 * t',
        domain: { min: -15, max: 15, step: 0.05 },
        color: '#0c87eb',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'DNA Strand A',
      },
      {
        id: 'ai-dna-strand2',
        type: 'parametric',
        expression: '3 * cos(t + 3.14159)',
        parametricY: '0.4 * t',
        domain: { min: -15, max: 15, step: 0.05 },
        color: '#f43f5e',
        strokeWidth: 3,
        visible: true,
        opacity: 1,
        label: 'DNA Strand B',
      },
    ],
    explanation:
      'Parametric projection of the Watson-Crick DNA double helix with two antiparallel strands coiled around a common axis.',
    mathNotes: 'x_1(t) = R\\cos(t), \\, y_1(t) = c t \\quad \\text{vs.} \\quad x_2(t) = R\\cos(t + \\pi), \\, y_2(t) = c t',
  },
};

export function interpretMathQueryLocal(queryText: string): AIResponse {
  const text = queryText.trim();
  const lower = text.toLowerCase();

  // 1. Gabriel's Horn
  if (
    lower.includes('gabriel') ||
    lower.includes('gabriell') ||
    lower.includes('trumpet') ||
    lower.includes('torricelli')
  ) {
    return AI_KNOWLEDGE_BASE['gabriel'];
  }

  // 2. Direct Explicit 3D Function: e.g. "z = sin(x)*cos(y)", "plot z = x^2 - y^2"
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
      value: 2,
      isPlaying: false,
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
          color: '#f59e0b',
          strokeWidth: 2,
          visible: true,
          opacity: 0.95,
          label: `z = ${rawExpr}`,
        },
      ],
      sliders: sliders.length > 0 ? sliders : undefined,
      explanation: `Synthesized 3D bivariate surface z = f(x, y) based directly on '${rawExpr}'. Evaluated dynamically with height colormapping.`,
      mathNotes: `z(x, y) = ${clean.replace(/\*/g, ' ')}`,
    };
  }

  // 3. Direct 2D Cartesian Function: e.g. "y = x^3 - 2x", "f(x) = sin(x)"
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
      title: `Custom Function: y = ${rawExpr}`,
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
      explanation: `Synthesized Cartesian function y = f(x) for '${rawExpr}'. Ready to plot and simulate dynamically.`,
      mathNotes: `y = ${clean.replace(/\*/g, ' ')}`,
    };
  }

  // 4. Polar Function: e.g. "r = 3*cos(4*theta)"
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

  // 5. Keyword Matches across mathematical universe
  if (lower.includes('catenoid')) return AI_KNOWLEDGE_BASE['catenoid'];
  if (lower.includes('helicoid') || lower.includes('spiral ramp')) return AI_KNOWLEDGE_BASE['helicoid'];
  if (lower.includes('torus') || lower.includes('donut')) return AI_KNOWLEDGE_BASE['torus'];
  if (lower.includes('blackhole') || lower.includes('black hole') || lower.includes('gravity') || lower.includes('spacetime')) return AI_KNOWLEDGE_BASE['blackhole'];
  if (lower.includes('egg') || lower.includes('carton') || lower.includes('lattice')) return AI_KNOWLEDGE_BASE['eggcarton'];
  if (lower.includes('saddle') && !lower.includes('monkey')) return AI_KNOWLEDGE_BASE['saddle'];
  if (lower.includes('volcano') || lower.includes('caldera') || lower.includes('crater')) return AI_KNOWLEDGE_BASE['volcano'];
  if (lower.includes('sombrero') || lower.includes('sinc') || lower.includes('airy')) return AI_KNOWLEDGE_BASE['sombrero'];
  if (lower.includes('rose') || lower.includes('flower') || lower.includes('petal')) return AI_KNOWLEDGE_BASE['rose'];
  if (lower.includes('dna') || lower.includes('double helix')) return AI_KNOWLEDGE_BASE['dna'];
  if (lower.includes('butter')) return AI_KNOWLEDGE_BASE['butterfly'];
  if (lower.includes('heart') || lower.includes('cardioid') || lower.includes('love')) return AI_KNOWLEDGE_BASE['heart'];

  // 6. Dynamic Generative Synthesis for arbitrary requests
  const is3D = lower.includes('3d') || lower.includes('surface') || lower.includes('mesh');
  if (is3D) {
    const expr = '2 * sin(sqrt(x^2 + y^2)) * exp(-0.08 * (x^2 + y^2))';
    return {
      title: `Generated 3D Model: ${queryText}`,
      mode: '3d',
      tag: 'Dynamic 3D',
      expression3D: expr,
      equations: [
        {
          id: `ai-gen-3d-${Date.now()}`,
          type: 'surface3d',
          expression: expr,
          color: '#f59e0b',
          strokeWidth: 2,
          visible: true,
          opacity: 0.95,
          label: queryText,
        },
      ],
      explanation: `Dynamically synthesized mathematical 3D surface model approximating '${queryText}' using harmonic radial damping.`,
      mathNotes: 'z(x, y) = 2 \\cdot \\sin\\left(\\sqrt{x^2 + y^2}\\right) e^{-0.08(x^2 + y^2)}',
    };
  }

  // 2D dynamic harmonic curve
  return {
    title: `Mathematical Curve: ${queryText}`,
    mode: '2d',
    tag: 'Dynamic 2D',
    equations: [
      {
        id: `ai-gen-2d-${Date.now()}`,
        type: 'polar',
        expression: '2 + 1.5 * cos(4 * theta)',
        domain: { min: 0, max: 2 * Math.PI, step: 0.02 },
        color: '#0c87eb',
        strokeWidth: 2.5,
        visible: true,
        opacity: 1,
        label: queryText,
      },
    ],
    explanation: `Dynamically synthesized harmonic polar model approximating '${queryText}'.`,
    mathNotes: 'r(\\theta) = 2 + 1.5 \\cos(4\\theta)',
  };
}

export const AIAssistantWorkspace: React.FC<AIAssistantWorkspaceProps> = ({
  onAddEquationsToGraph,
  onSwitchTo3D,
  currentUser,
  onOpenAuth,
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeResponse, setActiveResponse] = useState<AIResponse>(AI_KNOWLEDGE_BASE['gabriel']);
  const [lastQuery, setLastQuery] = useState<string>("Gabriel's Horn (Torricelli's Trumpet)");
  const [isThinking, setIsThinking] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleQueries = [
    { label: "Gabriel's Horn 3D", query: "draw gabriell's funtion in the 3d" },
    { label: 'Black Hole Curvature', query: 'draw a black hole gravitational well in 3d' },
    { label: 'DNA Double Helix', query: 'draw a dna double helix curve' },
    { label: 'Helicoid Spiral Ramp', query: 'draw a helicoid in 3d' },
    { label: 'Ring Torus (Donut)', query: 'draw a 3d torus surface' },
    { label: 'Egg Carton Surface', query: 'draw an egg carton surface in 3d' },
    { label: '5-Petal Rose Flower', query: 'generate a 5 petal rose polar curve' },
    { label: 'Volcano Crater', query: 'draw a volcano caldera in 3d' },
  ];

  const handleExecuteQuery = async (textToRun: string) => {
    const query = textToRun.trim();
    if (!query) return;

    // Requirement: User must be logged in with Google Account
    if (!currentUser || !currentUser.isLoggedIn) {
      onOpenAuth();
      return;
    }

    setIsThinking(true);
    setErrorMessage(null);
    setLastQuery(query);

    // If user has a linked Google Gemini API Key from their Google account, call Google Gemini AI!
    const activeApiKey = currentUser.apiKey || localStorage.getItem('equationx_gemini_key');
    if (activeApiKey && activeApiKey.trim()) {
      try {
        const geminiResponse = await generateEquationWithGemini(query, activeApiKey.trim());
        setActiveResponse(geminiResponse);
        setIsThinking(false);
        return;
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local math engine:', err);
        setErrorMessage(`Gemini API from Google Account: ${err.message || 'Call failed'}. Switched to built-in mathematical engine.`);
      }
    }

    // Otherwise use extensive built-in mathematical engine
    setTimeout(() => {
      const response = interpretMathQueryLocal(query);
      setActiveResponse(response);
      setIsThinking(false);
    }, 200);
  };

  const handlePlotAction = () => {
    if (activeResponse.mode === '3d' && onSwitchTo3D) {
      const expr = activeResponse.expression3D || activeResponse.equations[0]?.expression || '4 / (sqrt(x^2 + y^2) + 0.2)';
      onSwitchTo3D(expr);
    } else {
      onAddEquationsToGraph(activeResponse.equations, activeResponse.sliders);
    }

    setActionFeedback(true);
    setTimeout(() => setActionFeedback(false), 2000);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto custom-scrollbar math-notebook-bg">
      {/* Google Login Gate Banner if user is not logged in */}
      {(!currentUser || !currentUser.isLoggedIn) ? (
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-7 shadow-[3px_4px_0px_#0f172a] flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-yellow-50/70 via-white to-amber-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a] flex-shrink-0">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Google Account Required for AI Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFE500] text-slate-950 border border-slate-900">
                  LOGIN REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Please sign in with your Google account to authorize MathRobo and use your Google account's Gemini API for generating mathematical equations.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] font-black text-xs text-slate-900 flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer flex-shrink-0"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </div>
      ) : (
        /* Authenticated Status Banner */
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-emerald-500 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900">{currentUser.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Google Account Active
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currentUser.apiKey ? 'Gemini API Connected' : 'Google Authenticated'}</span>
            </span>
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 transition-all cursor-pointer"
            >
              Account & Key
            </button>
          </div>
        </div>
      )}

      {/* 1. MathRobo Mascot Hero Banner */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[3px_4px_0px_#0f172a] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 text-center md:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE500] text-slate-950 font-black text-xs border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
              <Zap className="w-3.5 h-3.5" />
              <span>AI MATHROBO ASSISTANT</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            I'm MathRobo
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-600 max-w-lg leading-relaxed">
            and I will generate any mathematical equation for you! Ask for 3D surfaces (Gabriel's horn, black hole, helicoid, torus) or 2D curves, powered directly by Google Gemini AI!
          </p>
        </div>

        {/* Mascot Avatar Widget */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#FFE500] border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] flex items-center justify-center relative">
            <div className="w-16 h-16 md:w-20 md:h-20 p-2.5 rounded-2xl bg-white border-2 border-slate-900 flex flex-col items-center justify-center shadow-sm">
              <div className="w-10 md:w-12 h-5 md:h-6 bg-slate-900 rounded-lg flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-black text-slate-900">∑X</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Notice / Error Banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Interactive Search & Prompt Bar */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 md:p-6 shadow-[3px_4px_0px_#0f172a] space-y-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleExecuteQuery(prompt);
              }
            }}
            placeholder="Ask MathRobo: e.g. draw a black hole in 3D, plot a helicoid, or generate a 5-petal rose..."
            className="w-full pl-5 pr-28 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 shadow-inner font-medium"
          />

          <button
            onClick={() => handleExecuteQuery(prompt)}
            disabled={isThinking}
            className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-black text-xs flex items-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <span>{isThinking ? 'Thinking...' : 'Ask AI'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-500 font-bold text-[11px] mr-1 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Try asking:
          </span>
          {sampleQueries.map((q) => (
            <button
              key={q.label}
              onClick={() => {
                setPrompt(q.query);
                handleExecuteQuery(q.query);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#FFF9C4] text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-yellow-400 text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. AI Generated Synthesis Card (ALWAYS VISIBLE & ACCURATE) */}
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 shadow-[3px_4px_0px_#0f172a] space-y-6 relative">
        {/* Top Header Row with Title, Badge, and Launch Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              <h2 className="font-black text-slate-900 text-xl tracking-tight">
                {activeResponse.title}
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]">
                {activeResponse.mode.toUpperCase()}
              </span>
              {activeResponse.tag && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  {activeResponse.tag}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Model synthesized for: <span className="font-bold text-slate-800">"{lastQuery}"</span>
            </p>
          </div>

          {/* Big Action Launch Button */}
          <button
            onClick={handlePlotAction}
            className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] active:scale-95 cursor-pointer ${
              actionFeedback
                ? 'bg-emerald-500 text-white'
                : 'bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 hover:shadow-[3px_4px_0px_#0f172a]'
            }`}
          >
            {actionFeedback ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Loaded into {activeResponse.mode === '3d' ? '3D Simulator' : '2D Calculator'}!</span>
              </>
            ) : (
              <>
                {activeResponse.mode === '3d' ? <Box className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                <span>Plot in {activeResponse.mode === '3d' ? '3D Simulator' : '2D Calculator'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mathematical Formulation Display with KaTeX */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500">
              Mathematical Formulation:
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">Exact Symbolic Math</span>
          </div>
          <div className="text-base md:text-lg text-slate-900 font-mono overflow-x-auto py-2">
            <MathFormula math={activeResponse.mathNotes} block />
          </div>
        </div>

        {/* Analytical Derivation & Explanation */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Mathematical Derivation & Analytical Insights
          </span>
          <div className="text-xs md:text-sm text-slate-700 leading-relaxed bg-[#FFFDF0] p-5 rounded-2xl border-2 border-yellow-200 font-medium shadow-sm">
            {activeResponse.explanation}
          </div>
        </div>

        {/* Sliders Preview if any */}
        {activeResponse.sliders && activeResponse.sliders.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 text-xs text-slate-600 font-medium">
            <Compass className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Dynamic simulation sliders included: ({activeResponse.sliders.map(s => `${s.variable} ∈ [${s.min}, ${s.max}]`).join(', ')})
            </span>
          </div>
        )}
      </div>

      {/* 4. Formulas Library Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-500" />
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
            Explore Mathematical Models & Surfaces
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(AI_KNOWLEDGE_BASE).map(([key, item]) => (
            <div
              key={key}
              onClick={() => {
                setActiveResponse(item);
                setLastQuery(item.title);
              }}
              className={`p-4 rounded-2xl bg-white border-2 cursor-pointer transition-all hover:shadow-[2px_3px_0px_#0f172a] ${
                activeResponse.title === item.title
                  ? 'border-yellow-500 ring-2 ring-yellow-400/30'
                  : 'border-slate-200 hover:border-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-black text-slate-900 text-xs truncate">{item.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-[#FFE500] text-slate-950 border border-slate-900 flex-shrink-0">
                  {item.mode.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 font-medium mb-2.5 leading-snug">
                {item.explanation}
              </p>
              <div className="text-[10px] font-mono text-amber-600 font-bold flex items-center gap-1">
                <span>View Model</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
