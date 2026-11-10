import { Equation, SliderVar } from '../types';
import { AIResponse } from '../components/aiAssistant/AIAssistantWorkspace';
import { extractSliderVariables, cleanExpression } from '../math/parser';

export async function generateEquationWithGemini(
  prompt: string,
  apiKey: string
): Promise<AIResponse> {
  const systemInstruction = `
You are MathRobo, an expert mathematical AI engine for EquationX (a Desmos & 3D Math Visualization platform).
Given a user query (which could be in English or Bengali/Banglish), synthesize the mathematical equation(s) to represent or plot the requested concept.

CRITICAL INSTRUCTIONS:
1. Supported Modes: "2d" or "3d".
   - If 3D, provide either:
     * Surface: "mode3DType": "surface", explicit expression for z = f(x, y). e.g. "sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.1)" or "(x^2 - y^2)/4".
     * Knot / 3D Curve: "mode3DType": "curve", and "parametricCurve3D": { "x": "sin(t) + 2*sin(2*t)", "y": "cos(t) - 2*cos(2*t)", "z": "-sin(3*t)" }.
     Allowed math functions for 3D: sin, cos, tan, sqrt, abs, exp, log, min, max, pow, cosh, sinh, tanh. Variables must be x, y, or t.
   - If 2D, provide either:
     * Parametric Fourier / silhouette: "type": "parametric", expression: x(t), parametricY: y(t).
     * Cartesian: "y = f(x)" (e.g. "y = sin(x)*exp(-0.1*x^2)")
     * Polar: expression for r(theta) (e.g. "2 * cos(4 * theta)")
2. You MUST return STRICT valid JSON without markdown fences, conforming to this schema:
{
  "title": "Short descriptive title of the mathematical model",
  "mode": "2d" or "3d",
  "mode3DType": "surface" or "curve" (if 3D),
  "parametricCurve3D": { "x": "...", "y": "...", "z": "..." } (if 3D knot/curve),
  "tag": "Short tag (e.g. 3D Surface, 3D Knot Theory, Cartographic Silhouette, Minimal Surface)",
  "expression3D": "explicit f(x,y) if 3d surface, otherwise empty string",
  "equations": [
    {
      "id": "eq-1",
      "type": "cartesian" or "polar" or "parametric" or "surface3d",
      "expression": "equation string",
      "parametricY": "y(t) string if parametric",
      "domain": { "min": 0, "max": 6.28, "step": 0.05 },
      "color": "#0c87eb",
      "strokeWidth": 2.5,
      "visible": true,
      "opacity": 1,
      "label": "descriptive label"
    }
  ],
  "sliders": [
    {
      "variable": "a",
      "min": 1,
      "max": 10,
      "step": 0.1,
      "value": 3,
      "isPlaying": false,
      "speed": 1,
      "direction": 1
    }
  ],
  "mathNotes": "Exact LaTeX formula representing the equation(s)",
  "explanation": "Clear, intuitive mathematical explanation of the derivation, geometry, and physical/mathematical significance."
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nUser Request: "${prompt}"` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  // Parse JSON
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);

  // Validate and sanitize equations
  const equations: Equation[] = (parsed.equations || []).map((eq: any, idx: number) => ({
    id: eq.id || `gemini-eq-${Date.now()}-${idx}`,
    type: eq.type || (parsed.mode === '3d' ? 'surface3d' : 'cartesian'),
    expression: eq.expression || 'sin(x)',
    parametricY: eq.parametricY,
    domain: eq.domain,
    color: eq.color || '#0c87eb',
    strokeWidth: eq.strokeWidth || 2.5,
    visible: true,
    opacity: eq.opacity ?? 1,
    label: eq.label || parsed.title,
  }));

  const sliders: SliderVar[] = (parsed.sliders || []).map((s: any) => ({
    variable: s.variable || 'a',
    min: s.min ?? 1,
    max: s.max ?? 10,
    step: s.step ?? 0.1,
    value: s.value ?? 2,
    isPlaying: false,
    speed: 1,
    direction: 1,
  }));

  const mode = parsed.mode === '3d' ? '3d' : '2d';
  let expr3D = parsed.expression3D;
  if (mode === '3d' && !expr3D && equations[0]?.expression) {
    expr3D = cleanExpression(equations[0].expression);
  }

  const mode3DType = parsed.mode3DType || (parsed.parametricCurve3D ? 'curve' : 'surface');

  return {
    title: parsed.title || `Mathematical Model: ${prompt}`,
    mode,
    mode3DType: mode === '3d' ? mode3DType : undefined,
    parametricCurve3D: parsed.parametricCurve3D,
    tag: parsed.tag || (mode === '3d' ? (mode3DType === 'curve' ? '3D Knot Theory' : '3D Surface') : '2D Curve'),
    expression3D: expr3D,
    equations,
    sliders: sliders.length > 0 ? sliders : undefined,
    mathNotes: parsed.mathNotes || (mode === '3d' ? (expr3D ? `z = ${expr3D}` : '') : equations[0]?.expression || ''),
    explanation: parsed.explanation || 'Mathematical equation generated by Gemini AI for EquationX.',
  };
}

