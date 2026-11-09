import * as math from 'mathjs';
import { Equation, EquationType } from '../types';

// Standard mathematical variables and constants that are not sliders
const RESERVED_VARIABLES = new Set(['x', 'y', 'z', 't', 'theta', 'r', 'e', 'pi', 'i', 'E', 'PI', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT1_2', 'SQRT2']);

/**
 * Detects variables in an expression that should become sliders
 */
export function extractSliderVariables(expression: string, parametricY?: string): string[] {
  const vars = new Set<string>();
  const combined = `${expression} ${parametricY || ''}`;
  
  try {
    const node = math.parse(cleanExpression(combined));
    node.traverse((n: any) => {
      if (n.isSymbolNode && !RESERVED_VARIABLES.has(n.name)) {
        // Also ensure it is not a math function name like sin, cos, abs, etc.
        if (typeof (math as any)[n.name] !== 'function') {
          vars.add(n.name);
        }
      }
    });
  } catch (err) {
    // Fallback regex detection for single letters or valid identifiers
    const tokens = combined.match(/[a-zA-Z][a-zA-Z0-9_]*/g) || [];
    for (const token of tokens) {
      if (!RESERVED_VARIABLES.has(token) && typeof (math as any)[token] !== 'function') {
        vars.add(token);
      }
    }
  }

  return Array.from(vars).sort();
}

/**
 * Cleans user expression and standardizes operators
 */
export function cleanExpression(expr: string): string {
  if (!expr) return '';
  return expr
    .trim()
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\sec/g, 'sec')
    .replace(/\\csc/g, 'csc')
    .replace(/\\cot/g, 'cot')
    .replace(/\\sinh/g, 'sinh')
    .replace(/\\cosh/g, 'cosh')
    .replace(/\\tanh/g, 'tanh')
    .replace(/\\exp/g, 'exp')
    .replace(/\\ln/g, 'log')
    .replace(/\\log/g, 'log10')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\theta/g, 'theta')
    .replace(/\\pi/g, 'pi')
    .replace(/\\le/g, '<=')
    .replace(/\\ge/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=');
}

/**
 * Automatically detects the equation type and standardizes it
 */
export function classifyEquation(rawExpr: string, parametricY?: string): {
  type: EquationType;
  parsedExpr: string;
  isInequality?: boolean;
  inequalityOp?: '<' | '<=' | '>' | '>=';
} {
  const clean = cleanExpression(rawExpr);

  if (parametricY && parametricY.trim().length > 0) {
    return {
      type: 'parametric',
      parsedExpr: clean,
    };
  }

  // Check for inequalities
  const ineqMatch = clean.match(/(<=|>=|<|>)/);
  if (ineqMatch) {
    const op = ineqMatch[0] as '<' | '<=' | '>' | '>=';
    return {
      type: 'cartesian',
      parsedExpr: clean,
      isInequality: true,
      inequalityOp: op,
    };
  }

  // Polar equation: starts with r = or contains theta
  if (/^r\s*=/.test(clean) || (clean.includes('theta') && !clean.includes('y'))) {
    const rhs = clean.replace(/^r\s*=\s*/, '');
    return {
      type: 'polar',
      parsedExpr: rhs,
    };
  }

  // Cartesian: starts with y = or f(x) =
  if (/^y\s*=/.test(clean) || /^f\(x\)\s*=/.test(clean)) {
    const rhs = clean.replace(/^(y|f\(x\))\s*=\s*/, '');
    return {
      type: 'cartesian',
      parsedExpr: rhs,
    };
  }

  // Cartesian: x = g(y)
  if (/^x\s*=/.test(clean) && clean.includes('y')) {
    return {
      type: 'implicit',
      parsedExpr: `${clean.replace(/^x\s*=\s*/, '')} - x`,
    };
  }

  // Implicit equation: contains '=' with both x and y
  if (clean.includes('=')) {
    const parts = clean.split('=');
    if (parts.length === 2) {
      return {
        type: 'implicit',
        parsedExpr: `(${parts[0].trim()}) - (${parts[1].trim()})`,
      };
    }
  }

  // Parametric notation like (f(t), g(t))
  if (clean.startsWith('(') && clean.endsWith(')') && clean.includes(',')) {
    const inner = clean.slice(1, -1);
    const [xPart, yPart] = inner.split(',').map(s => s.trim());
    return {
      type: 'parametric',
      parsedExpr: xPart,
    };
  }

  // Default to Cartesian y = expr
  return {
    type: 'cartesian',
    parsedExpr: clean,
  };
}

/**
 * Compiles a mathematical expression into an efficient evaluator function
 */
export function compileExpression(expr: string) {
  try {
    const cleaned = cleanExpression(expr);
    const parsed = math.parse(cleaned);
    const compiled = parsed.compile();
    return {
      evaluate: (scope: Record<string, number>) => {
        try {
          const res = compiled.evaluate(scope);
          if (typeof res === 'number') {
            return isFinite(res) ? res : NaN;
          }
          if (res && typeof res.re === 'number') {
            // Complex number: return real part if imaginary is zero, else NaN
            return Math.abs(res.im) < 1e-9 ? res.re : NaN;
          }
          return NaN;
        } catch {
          return NaN;
        }
      },
      error: null,
    };
  } catch (err: any) {
    return {
      evaluate: () => NaN,
      error: err.message || 'Syntax error in mathematical expression',
    };
  }
}

/**
 * Converts standard math expression string to LaTeX string for pretty rendering
 */
export function expressionToLatex(expr: string): string {
  try {
    const cleaned = cleanExpression(expr);
    const parsed = math.parse(cleaned);
    return parsed.toTex({ parenthesis: 'auto' });
  } catch {
    return expr;
  }
}

