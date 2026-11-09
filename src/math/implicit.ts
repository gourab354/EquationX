import { Point2D } from '../types';

/**
 * Evaluates an implicit function F(x, y) = 0 across a 2D bounding grid using Marching Squares
 * Returns an array of line segments [ [p0, p1], [p2, p3], ... ]
 */
export function marchImplicitCurve(
  evaluator: (x: number, y: number) => number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  gridCols: number = 80,
  gridRows: number = 80
): Array<[Point2D, Point2D]> {
  const dx = (maxX - minX) / gridCols;
  const dy = (maxY - minY) / gridRows;

  // Pre-calculate values on grid vertices
  const grid: number[][] = [];
  for (let r = 0; r <= gridRows; r++) {
    const row: number[] = [];
    const y = minY + r * dy;
    for (let c = 0; c <= gridCols; c++) {
      const x = minX + c * dx;
      const val = evaluator(x, y);
      row.push(isNaN(val) ? 0 : val);
    }
    grid.push(row);
  }

  const segments: Array<[Point2D, Point2D]> = [];

  // Helper for linear interpolation along edge
  const lerp = (p1: Point2D, p2: Point2D, v1: number, v2: number): Point2D => {
    if (Math.abs(v2 - v1) < 1e-9) return p1;
    const t = -v1 / (v2 - v1);
    const clampedT = Math.max(0, Math.min(1, t));
    return {
      x: p1.x + clampedT * (p2.x - p1.x),
      y: p1.y + clampedT * (p2.y - p1.y),
    };
  };

  for (let r = 0; r < gridRows; r++) {
    const y0 = minY + r * dy;
    const y1 = y0 + dy;

    for (let c = 0; c < gridCols; c++) {
      const x0 = minX + c * dx;
      const x1 = x0 + dx;

      // Four corners:
      // BL: (x0, y0), BR: (x1, y0), TR: (x1, y1), TL: (x0, y1)
      const vBL = grid[r][c];
      const vBR = grid[r][c + 1];
      const vTR = grid[r + 1][c + 1];
      const vTL = grid[r + 1][c];

      const pBL: Point2D = { x: x0, y: y0 };
      const pBR: Point2D = { x: x1, y: y0 };
      const pTR: Point2D = { x: x1, y: y1 };
      const pTL: Point2D = { x: x0, y: y1 };

      // Bitmask for corners where val > 0
      let mask = 0;
      if (vBL > 0) mask |= 1;
      if (vBR > 0) mask |= 2;
      if (vTR > 0) mask |= 4;
      if (vTL > 0) mask |= 8;

      if (mask === 0 || mask === 15) continue; // All inside or all outside

      // Midpoints on edges:
      // Edge 0: Bottom (BL -> BR)
      // Edge 1: Right (BR -> TR)
      // Edge 2: Top (TR -> TL)
      // Edge 3: Left (TL -> BL)
      const edgeBottom = lerp(pBL, pBR, vBL, vBR);
      const edgeRight = lerp(pBR, pTR, vBR, vTR);
      const edgeTop = lerp(pTR, pTL, vTR, vTL);
      const edgeLeft = lerp(pTL, pBL, vTL, vBL);

      switch (mask) {
        case 1:
        case 14:
          segments.push([edgeLeft, edgeBottom]);
          break;
        case 2:
        case 13:
          segments.push([edgeBottom, edgeRight]);
          break;
        case 3:
        case 12:
          segments.push([edgeLeft, edgeRight]);
          break;
        case 4:
        case 11:
          segments.push([edgeRight, edgeTop]);
          break;
        case 5:
          // Saddle point: disambiguate using center average
          segments.push([edgeLeft, edgeTop]);
          segments.push([edgeBottom, edgeRight]);
          break;
        case 10:
          segments.push([edgeLeft, edgeBottom]);
          segments.push([edgeRight, edgeTop]);
          break;
        case 6:
        case 9:
          segments.push([edgeBottom, edgeTop]);
          break;
        case 7:
        case 8:
          segments.push([edgeLeft, edgeTop]);
          break;
      }
    }
  }

  return segments;
}

