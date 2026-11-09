import { Point2D } from '../types';

/**
 * Fits a polynomial of degree `degree` to a set of 2D points (x, y)
 * Returns coefficients [c0, c1, c2, ... cn] where y = c0 + c1*x + c2*x^2 + ...
 */
export function fitPolynomial(points: Point2D[], degree: number = 3): number[] | null {
  const n = points.length;
  if (n <= degree) return null;

  const d = Math.min(degree, n - 1);
  const matrix: number[][] = Array(d + 1).fill(0).map(() => Array(d + 1).fill(0));
  const vector: number[] = Array(d + 1).fill(0);

  // Compute power sums for normal equations (X^T * X) * c = X^T * Y
  const xPowers: number[] = Array(2 * d + 1).fill(0);
  for (let i = 0; i < n; i++) {
    const x = points[i].x;
    let xp = 1;
    for (let p = 0; p <= 2 * d; p++) {
      xPowers[p] += xp;
      xp *= x;
    }
  }

  // Build matrix
  for (let r = 0; r <= d; r++) {
    for (let c = 0; c <= d; c++) {
      matrix[r][c] = xPowers[r + c];
    }
  }

  // Build vector X^T * Y
  for (let i = 0; i < n; i++) {
    const x = points[i].x;
    const y = points[i].y;
    let xp = 1;
    for (let r = 0; r <= d; r++) {
      vector[r] += y * xp;
      xp *= x;
    }
  }

  // Gaussian elimination with partial pivoting
  return solveLinearSystem(matrix, vector);
}

function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Search for maximum in column
    let maxEl = Math.abs(M[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxEl) {
        maxEl = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    if (maxEl < 1e-12) return null; // Singular matrix

    // Swap maximum row with current row
    const tmp = M[maxRow];
    M[maxRow] = M[i];
    M[i] = tmp;

    // Eliminate below
    for (let k = i + 1; k < n; k++) {
      const c = -M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        if (i === j) {
          M[k][j] = 0;
        } else {
          M[k][j] += c * M[i][j];
        }
      }
    }
  }

  // Back-substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let k = i + 1; k < n; k++) {
      sum -= M[i][k] * x[k];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}

/**
 * Formats polynomial coefficients into a standard equation string
 * e.g. "y = 0.5*x^3 - 1.2*x^2 + 3.4*x + 1.0"
 */
export function formatPolynomialEquation(coeffs: number[], precision: number = 3): {
  expr: string;
  latex: string;
} {
  const round = (val: number) => parseFloat(val.toFixed(precision)).toString();
  const terms: string[] = [];
  const latexTerms: string[] = [];

  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (Math.abs(c) < 1e-5 && terms.length > 0) continue;

    const absC = round(Math.abs(c));
    const sign = c >= 0 ? (terms.length > 0 ? '+ ' : '') : '- ';

    let varPart = '';
    let varLatex = '';
    if (i === 1) {
      varPart = '*x';
      varLatex = 'x';
    } else if (i > 1) {
      varPart = `*x^${i}`;
      varLatex = `x^{${i}}`;
    }

    const coeffStr = (absC === '1' && i > 0) ? '' : (i > 0 ? `${absC}` : absC);

    terms.push(`${sign}${coeffStr}${varPart}`);
    latexTerms.push(`${sign}${coeffStr}${varLatex}`);
  }

  const expr = `y = ${terms.join(' ') || '0'}`;
  const latex = `y = ${latexTerms.join(' ') || '0'}`;

  return { expr, latex };
}

/**
 * Segment a 2D curve into piecewise monotonic sections so that each section can be represented as y = f(x)
 */
export function segmentContourForCartesian(points: Point2D[], minSegmentLength: number = 8): Point2D[][] {
  if (points.length < minSegmentLength) return [points];

  const segments: Point2D[][] = [];
  let currentSegment: Point2D[] = [points[0]];
  let lastDirection = 0; // 1 for increasing x, -1 for decreasing x

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const direction = dx >= 0 ? 1 : -1;

    if (lastDirection !== 0 && direction !== lastDirection && currentSegment.length >= minSegmentLength) {
      // Reversal in x direction: finish current segment and start new one
      segments.push(currentSegment);
      currentSegment = [points[i - 1], points[i]];
    } else {
      currentSegment.push(points[i]);
    }
    if (Math.abs(dx) > 1e-5) {
      lastDirection = direction;
    }
  }

  if (currentSegment.length > 1) {
    segments.push(currentSegment);
  }

  return segments;
}

