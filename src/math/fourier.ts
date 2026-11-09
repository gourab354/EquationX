import { Point2D } from '../types';

export interface FourierCoefficients {
  a0: number;
  c0: number;
  // For each harmonic k = 1..N
  harmonics: Array<{
    k: number;
    ax: number;
    bx: number;
    ay: number;
    by: number;
    ampX: number;
    ampY: number;
  }>;
}

/**
 * Resamples a sequence of 2D points to have uniform arc-length spacing
 */
export function resampleContour(points: Point2D[], targetCount: number = 256): Point2D[] {
  if (points.length < 2) return points;

  // Calculate cumulative arc lengths
  const cumLengths: number[] = [0];
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalLength += Math.hypot(dx, dy);
    cumLengths.push(totalLength);
  }

  if (totalLength === 0) return points;

  const resampled: Point2D[] = [];
  const step = totalLength / (targetCount - 1);

  for (let i = 0; i < targetCount; i++) {
    const targetDist = i * step;
    // Find segment
    let segIdx = 0;
    while (segIdx < cumLengths.length - 2 && cumLengths[segIdx + 1] < targetDist) {
      segIdx++;
    }

    const d0 = cumLengths[segIdx];
    const d1 = cumLengths[segIdx + 1];
    const segLen = d1 - d0;
    const t = segLen > 0 ? (targetDist - d0) / segLen : 0;

    const p0 = points[segIdx];
    const p1 = points[segIdx + 1];
    resampled.push({
      x: p0.x + t * (p1.x - p0.x),
      y: p0.y + t * (p1.y - p0.y),
    });
  }

  return resampled;
}

/**
 * Computes Discrete Fourier Transform coefficients for 2D curve
 */
export function computeFourierCoefficients(points: Point2D[], numHarmonics: number = 10): FourierCoefficients {
  const N = points.length;
  if (N === 0) {
    return { a0: 0, c0: 0, harmonics: [] };
  }

  // DC offsets (average)
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < N; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
  }
  const a0 = sumX / N;
  const c0 = sumY / N;

  const harmonics = [];
  const maxK = Math.min(numHarmonics, Math.floor((N - 1) / 2));

  for (let k = 1; k <= maxK; k++) {
    let reX = 0, imX = 0;
    let reY = 0, imY = 0;

    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      reX += points[n].x * cosA;
      imX -= points[n].x * sinA;

      reY += points[n].y * cosA;
      imY -= points[n].y * sinA;
    }

    const ax = (2 * reX) / N;
    const bx = (-2 * imX) / N;
    const ay = (2 * reY) / N;
    const by = (-2 * imY) / N;

    harmonics.push({
      k,
      ax,
      bx,
      ay,
      by,
      ampX: Math.hypot(ax, bx),
      ampY: Math.hypot(ay, by),
    });
  }

  return { a0, c0, harmonics };
}

/**
 * Converts Fourier coefficients into formatted mathematical parametric equations
 */
export function fourierToParametricEquations(
  coeffs: FourierCoefficients,
  precision: number = 3
): { exprX: string; exprY: string; latexX: string; latexY: string } {
  const round = (val: number) => {
    const fixed = val.toFixed(precision);
    return parseFloat(fixed).toString();
  };

  // Build x(t)
  const partsX: string[] = [];
  if (Math.abs(coeffs.a0) > 1e-4) {
    partsX.push(round(coeffs.a0));
  }

  // Build y(t)
  const partsY: string[] = [];
  if (Math.abs(coeffs.c0) > 1e-4) {
    partsY.push(round(coeffs.c0));
  }

  for (const h of coeffs.harmonics) {
    const kStr = h.k === 1 ? 't' : `${h.k}*t`;
    const kLatex = h.k === 1 ? 't' : `${h.k}t`;

    // ax * cos(k*t)
    if (Math.abs(h.ax) > 1e-4) {
      const sign = h.ax >= 0 ? (partsX.length > 0 ? '+ ' : '') : '- ';
      partsX.push(`${sign}${round(Math.abs(h.ax))}*cos(${kStr})`);
    }
    // bx * sin(k*t)
    if (Math.abs(h.bx) > 1e-4) {
      const sign = h.bx >= 0 ? (partsX.length > 0 ? '+ ' : '') : '- ';
      partsX.push(`${sign}${round(Math.abs(h.bx))}*sin(${kStr})`);
    }

    // ay * cos(k*t)
    if (Math.abs(h.ay) > 1e-4) {
      const sign = h.ay >= 0 ? (partsY.length > 0 ? '+ ' : '') : '- ';
      partsY.push(`${sign}${round(Math.abs(h.ay))}*cos(${kStr})`);
    }
    // by * sin(k*t)
    if (Math.abs(h.by) > 1e-4) {
      const sign = h.by >= 0 ? (partsY.length > 0 ? '+ ' : '') : '- ';
      partsY.push(`${sign}${round(Math.abs(h.by))}*sin(${kStr})`);
    }
  }

  const exprX = partsX.length > 0 ? partsX.join(' ') : '0';
  const exprY = partsY.length > 0 ? partsY.join(' ') : '0';

  const latexX = `x(t) = ${exprX.replace(/\*/g, ' ')}`;
  const latexY = `y(t) = ${exprY.replace(/\*/g, ' ')}`;

  return { exprX, exprY, latexX, latexY };
}

/**
 * Evaluates points from Fourier coefficients for given t parameter [0, 2*PI]
 */
export function evaluateFourier(coeffs: FourierCoefficients, t: number): Point2D {
  let x = coeffs.a0;
  let y = coeffs.c0;

  for (const h of coeffs.harmonics) {
    const angle = h.k * t;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    x += h.ax * cosA + h.bx * sinA;
    y += h.ay * cosA + h.by * sinA;
  }

  return { x, y };
}

/**
 * Calculates Reconstruction Accuracy / Similarity Score (%)
 */
export function calculateReconstructionAccuracy(original: Point2D[], fitted: Point2D[]): number {
  if (original.length === 0 || fitted.length === 0) return 0;

  let totalSqError = 0;
  let maxDim = 0;

  // Find bounding box diagonal of original
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of original) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  maxDim = Math.hypot(maxX - minX, maxY - minY) || 1;

  const N = Math.min(original.length, fitted.length);
  for (let i = 0; i < N; i++) {
    const dx = original[i].x - fitted[i].x;
    const dy = original[i].y - fitted[i].y;
    totalSqError += dx * dx + dy * dy;
  }

  const rmse = Math.sqrt(totalSqError / N);
  const normalizedError = rmse / maxDim;

  // Similarity score between 0% and 100%
  const score = Math.max(0, Math.min(100, (1 - normalizedError * 1.5) * 100));
  return Math.round(score * 10) / 10;
}

