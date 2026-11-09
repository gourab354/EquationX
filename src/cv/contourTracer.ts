import { Point2D, Contour } from '../types';

/**
 * Perpendicular distance from a point to a line segment
 */
function perpendicularDistance(p: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(p.x - lineStart.x, p.y - lineStart.y);
  }

  const num = Math.abs(dy * p.x - dx * p.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
  return num / Math.sqrt(lenSq);
}

/**
 * Douglas-Peucker Algorithm for curve simplification
 */
export function douglasPeucker(points: Point2D[], epsilon: number): Point2D[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, index + 1), epsilon);
    const right = douglasPeucker(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [start, end];
  }
}

const CONTOUR_PALETTE = [
  '#0c87eb', // Blue
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#84cc16', // Lime
];

/**
 * Traces contours from a binary image buffer (width x height) where 255 = edge, 0 = background
 */
export function traceContours(
  binaryData: Uint8Array,
  width: number,
  height: number,
  minPoints: number = 10,
  simplifyEpsilon: number = 1.5
): Contour[] {
  const visited = new Uint8Array(width * height);
  const contours: Contour[] = [];
  let contourId = 0;

  // Moore neighborhood 8-directional offsets (clockwise)
  const dx = [0, 1, 1, 1, 0, -1, -1, -1];
  const dy = [-1, -1, 0, 1, 1, 1, 0, -1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Start of a new boundary if edge pixel is unvisited and has background neighbor
      if (binaryData[idx] > 128 && visited[idx] === 0) {
        const points: Point2D[] = [];
        let cx = x;
        let cy = y;
        let dir = 7; // Initial direction
        let isClosed = false;

        points.push({ x: cx, y: cy });
        visited[cy * width + cx] = 1;

        // Trace boundary
        let steps = 0;
        const maxSteps = width * height;

        while (steps < maxSteps) {
          steps++;
          let foundNext = false;
          // Search around in 8 directions starting from (dir + 5) % 8
          const searchStart = (dir + 5) % 8;

          for (let i = 0; i < 8; i++) {
            const checkDir = (searchStart + i) % 8;
            const nx = cx + dx[checkDir];
            const ny = cy + dy[checkDir];

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (binaryData[nIdx] > 128) {
                cx = nx;
                cy = ny;
                dir = checkDir;
                visited[nIdx] = 1;
                points.push({ x: cx, y: cy });
                foundNext = true;
                break;
              }
            }
          }

          if (!foundNext) {
            break;
          }

          // Check if closed back to start point
          if (cx === x && cy === y && points.length > 3) {
            isClosed = true;
            break;
          }
        }

        if (points.length >= minPoints) {
          // Calculate curve length
          let length = 0;
          for (let i = 1; i < points.length; i++) {
            length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
          }

          // Simplify curve using Douglas-Peucker
          const simplified = douglasPeucker(points, simplifyEpsilon);

          contours.push({
            id: ++contourId,
            points,
            simplified,
            closed: isClosed,
            length,
            color: CONTOUR_PALETTE[(contourId - 1) % CONTOUR_PALETTE.length],
          });
        }
      }
    }
  }

  // Sort contours by length descending (most prominent shapes first)
  contours.sort((a, b) => b.length - a.length);

  return contours;
}

