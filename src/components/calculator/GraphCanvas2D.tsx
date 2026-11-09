import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Equation, SliderVar, Viewport2D, Point2D } from '../../types';
import { compileExpression } from '../../math/parser';
import { marchImplicitCurve } from '../../math/implicit';
import { ZoomIn, ZoomOut, Maximize2, Compass, Eye, Grid } from 'lucide-react';

interface GraphCanvas2DProps {
  equations: Equation[];
  sliders: SliderVar[];
  viewport: Viewport2D;
  onViewportChange: (newVp: Viewport2D) => void;
  overlayImage?: HTMLImageElement | null;
  overlayOpacity?: number;
  overlayScale?: number;
}

export const GraphCanvas2D: React.FC<GraphCanvas2DProps> = ({
  equations,
  sliders,
  viewport,
  onViewportChange,
  overlayImage,
  overlayOpacity = 0.35,
  overlayScale = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<Point2D | null>(null);

  // Build variable scope from sliders
  const scope: Record<string, number> = {};
  for (const s of sliders) {
    scope[s.variable] = s.value;
  }

  // Convert math (x, y) to screen pixels (px, py)
  const mathToScreen = useCallback(
    (x: number, y: number, width: number, height: number): Point2D => {
      const px = width / 2 + (x - viewport.centerX) * viewport.zoom;
      const py = height / 2 - (y - viewport.centerY) * viewport.zoom;
      return { x: px, y: py };
    },
    [viewport]
  );

  // Convert screen pixels (px, py) to math (x, y)
  const screenToMath = useCallback(
    (px: number, py: number, width: number, height: number): Point2D => {
      const x = (px - width / 2) / viewport.zoom + viewport.centerX;
      const y = -(py - height / 2) / viewport.zoom + viewport.centerY;
      return { x, y };
    },
    [viewport]
  );

  // Determine nice grid step based on current zoom
  const calculateGridStep = (zoom: number) => {
    const rawStep = 80 / zoom;
    const exponent = Math.floor(Math.log10(rawStep));
    const fraction = rawStep / Math.pow(10, exponent);

    let step: number;
    if (fraction <= 1.5) step = 1 * Math.pow(10, exponent);
    else if (fraction <= 3.5) step = 2 * Math.pow(10, exponent);
    else if (fraction <= 7.5) step = 5 * Math.pow(10, exponent);
    else step = 10 * Math.pow(10, exponent);

    return step;
  };

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI retina display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background to Crisp White (Math Notebook aesthetic from uploaded photo)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw Overlay Image if active (for Image-to-Equation comparison)
    if (overlayImage && overlayOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = overlayOpacity;
      const originScreen = mathToScreen(0, 0, width, height);
      const imgSpanPixels = overlayScale * 2 * viewport.zoom;
      const imgAspect = overlayImage.width / overlayImage.height;
      let w = imgSpanPixels;
      let h = imgSpanPixels / imgAspect;

      ctx.drawImage(
        overlayImage,
        originScreen.x - w / 2,
        originScreen.y - h / 2,
        w,
        h
      );
      ctx.restore();
    }

    // Step 1: Draw Grid Lines
    if (viewport.showGrid) {
      if (viewport.gridType === 'cartesian') {
        const step = calculateGridStep(viewport.zoom);
        const subStep = step / 5;

        const minMath = screenToMath(0, height, width, height);
        const maxMath = screenToMath(width, 0, width, height);

        // Minor grid lines (very faint slate)
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const startSubX = Math.floor(minMath.x / subStep) * subStep;
        for (let x = startSubX; x <= maxMath.x; x += subStep) {
          const sx = mathToScreen(x, 0, width, height).x;
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
        }
        const startSubY = Math.floor(minMath.y / subStep) * subStep;
        for (let y = startSubY; y <= maxMath.y; y += subStep) {
          const sy = mathToScreen(0, y, width, height).y;
          ctx.moveTo(0, sy);
          ctx.lineTo(width, sy);
        }
        ctx.stroke();

        // Major grid lines
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const startX = Math.floor(minMath.x / step) * step;
        for (let x = startX; x <= maxMath.x; x += step) {
          const sx = mathToScreen(x, 0, width, height).x;
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, height);
        }
        const startY = Math.floor(minMath.y / step) * step;
        for (let y = startY; y <= maxMath.y; y += step) {
          const sy = mathToScreen(0, y, width, height).y;
          ctx.moveTo(0, sy);
          ctx.lineTo(width, sy);
        }
        ctx.stroke();

        // Major Tick Labels
        if (viewport.showLabels) {
          ctx.fillStyle = '#475569';
          ctx.font = '600 10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const originScreen = mathToScreen(0, 0, width, height);
          const labelY = Math.min(Math.max(originScreen.y + 5, 14), height - 16);

          for (let x = startX; x <= maxMath.x; x += step) {
            if (Math.abs(x) < 1e-9) continue;
            const sx = mathToScreen(x, 0, width, height).x;
            const label = parseFloat(x.toFixed(4)).toString();
            ctx.fillText(label, sx, labelY);
          }

          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          const labelX = Math.min(Math.max(originScreen.x - 6, 25), width - 6);

          for (let y = startY; y <= maxMath.y; y += step) {
            if (Math.abs(y) < 1e-9) continue;
            const sy = mathToScreen(0, y, width, height).y;
            const label = parseFloat(y.toFixed(4)).toString();
            ctx.fillText(label, labelX, sy);
          }
        }
      } else {
        // Polar Grid
        const originScreen = mathToScreen(0, 0, width, height);
        const maxRadiusPx = Math.hypot(width, height);
        const step = calculateGridStep(viewport.zoom);
        const stepPx = step * viewport.zoom;

        // Concentric circles
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        for (let rPx = stepPx; rPx < maxRadiusPx; rPx += stepPx) {
          ctx.beginPath();
          ctx.arc(originScreen.x, originScreen.y, rPx, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Radial rays
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
        for (let a = 0; a < 2 * Math.PI; a += Math.PI / 6) {
          ctx.beginPath();
          ctx.moveTo(originScreen.x, originScreen.y);
          ctx.lineTo(
            originScreen.x + Math.cos(a) * maxRadiusPx,
            originScreen.y + Math.sin(a) * maxRadiusPx
          );
          ctx.stroke();
        }
      }
    }

    // Step 2: Draw Main Coordinate Axes (Solid Dark Slate / Black)
    if (viewport.showAxes) {
      const originScreen = mathToScreen(0, 0, width, height);

      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      // X-Axis
      ctx.moveTo(0, originScreen.y);
      ctx.lineTo(width, originScreen.y);
      // Y-Axis
      ctx.moveTo(originScreen.x, 0);
      ctx.lineTo(originScreen.x, height);
      ctx.stroke();

      // Axis label markers
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('x', width - 14, originScreen.y - 10);
      ctx.fillText('y', originScreen.x + 10, 14);
      ctx.fillText('0', originScreen.x - 10, originScreen.y + 14);
    }

    // Step 3: Draw Mathematical Equations
    const minMath = screenToMath(0, height, width, height);
    const maxMath = screenToMath(width, 0, width, height);

    for (const eq of equations) {
      if (!eq.visible || !eq.expression.trim()) continue;

      ctx.save();
      ctx.strokeStyle = eq.color;
      ctx.fillStyle = eq.color;
      ctx.lineWidth = eq.strokeWidth || 3.0;
      ctx.globalAlpha = eq.opacity ?? 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      try {
        if (eq.type === 'cartesian') {
          const { evaluate, error } = compileExpression(eq.expression);
          if (error) {
            ctx.restore();
            continue;
          }

          ctx.beginPath();
          let isDrawing = false;
          let lastY = 0;
          const pxStep = 1.0;

          for (let px = 0; px <= width; px += pxStep) {
            const xVal = (px - width / 2) / viewport.zoom + viewport.centerX;
            const evalScope = { ...scope, x: xVal };
            const yVal = evaluate(evalScope);

            if (isNaN(yVal) || !isFinite(yVal)) {
              isDrawing = false;
              continue;
            }

            const py = height / 2 - (yVal - viewport.centerY) * viewport.zoom;

            if (isDrawing && Math.abs(py - lastY) > height * 1.5) {
              isDrawing = false;
            }

            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
            lastY = py;
          }
          ctx.stroke();

          // If inequality, shade region
          if (eq.isInequality && eq.inequalityOp) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = eq.color;
            ctx.beginPath();
            const isLess = eq.inequalityOp === '<' || eq.inequalityOp === '<=';
            const basePy = isLess ? height : 0;

            for (let px = 0; px <= width; px += 2) {
              const xVal = (px - width / 2) / viewport.zoom + viewport.centerX;
              const yVal = evaluate({ ...scope, x: xVal });
              if (isFinite(yVal)) {
                const py = height / 2 - (yVal - viewport.centerY) * viewport.zoom;
                ctx.rect(px, Math.min(py, basePy), 2, Math.abs(py - basePy));
              }
            }
            ctx.fill();
            ctx.restore();
          }
        } else if (eq.type === 'parametric') {
          const evalX = compileExpression(eq.expression);
          const evalY = compileExpression(eq.parametricY || '0');

          if (evalX.error || evalY.error) {
            ctx.restore();
            continue;
          }

          const tMin = eq.domain?.min ?? 0;
          const tMax = eq.domain?.max ?? 2 * Math.PI;
          const steps = Math.min(Math.max(Math.floor((tMax - tMin) * 200), 400), 2500);
          const dt = (tMax - tMin) / steps;

          ctx.beginPath();
          let isDrawing = false;

          for (let i = 0; i <= steps; i++) {
            const t = tMin + i * dt;
            const evalScope = { ...scope, t };
            const x = evalX.evaluate(evalScope);
            const y = evalY.evaluate(evalScope);

            if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
              isDrawing = false;
              continue;
            }

            const pt = mathToScreen(x, y, width, height);
            if (!isDrawing) {
              ctx.moveTo(pt.x, pt.y);
              isDrawing = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
          ctx.stroke();
        } else if (eq.type === 'polar') {
          const evalR = compileExpression(eq.expression);
          if (evalR.error) {
            ctx.restore();
            continue;
          }

          const thMin = eq.domain?.min ?? 0;
          const thMax = eq.domain?.max ?? 2 * Math.PI;
          const steps = Math.min(Math.max(Math.floor((thMax - thMin) * 150), 400), 3000);
          const dTh = (thMax - thMin) / steps;

          ctx.beginPath();
          let isDrawing = false;

          for (let i = 0; i <= steps; i++) {
            const theta = thMin + i * dTh;
            const evalScope = { ...scope, theta, th: theta };
            const r = evalR.evaluate(evalScope);

            if (isNaN(r) || !isFinite(r)) {
              isDrawing = false;
              continue;
            }

            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            const pt = mathToScreen(x, y, width, height);

            if (!isDrawing) {
              ctx.moveTo(pt.x, pt.y);
              isDrawing = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
          ctx.stroke();
        } else if (eq.type === 'implicit') {
          const evalF = compileExpression(eq.expression);
          if (!evalF.error) {
            const evaluator = (x: number, y: number) => {
              return evalF.evaluate({ ...scope, x, y });
            };

            const segments = marchImplicitCurve(
              evaluator,
              minMath.x,
              maxMath.x,
              minMath.y,
              maxMath.y,
              90,
              90
            );

            ctx.beginPath();
            for (const [p1, p2] of segments) {
              const s1 = mathToScreen(p1.x, p1.y, width, height);
              const s2 = mathToScreen(p2.x, p2.y, width, height);
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
            }
            ctx.stroke();
          }
        }
      } catch (err) {
        // Safe catch
      }
      ctx.restore();
    }

    // Step 4: Draw Hover Coordinates & Crosshairs (Pitch Yellow styling)
    if (hoverCoord) {
      const sPt = mathToScreen(hoverCoord.x, hoverCoord.y, width, height);

      ctx.save();
      ctx.strokeStyle = '#EAB308';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(sPt.x, 0);
      ctx.lineTo(sPt.x, height);
      ctx.moveTo(0, sPt.y);
      ctx.lineTo(width, sPt.y);
      ctx.stroke();

      // Point circle (Pitch Yellow)
      ctx.fillStyle = '#FFE500';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sPt.x, sPt.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Coordinate badge (Crisp White + Pitch Yellow border)
      const text = `(${hoverCoord.x.toFixed(3)}, ${hoverCoord.y.toFixed(3)})`;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      const textWidth = ctx.measureText(text).width;
      const badgeX = Math.min(sPt.x + 10, width - textWidth - 20);
      const badgeY = Math.max(sPt.y - 14, 24);

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(badgeX - 6, badgeY - 14, textWidth + 14, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.fillText(text, badgeX, badgeY);
      ctx.restore();
    }

    ctx.restore();
  }, [
    equations,
    sliders,
    viewport,
    hoverCoord,
    overlayImage,
    overlayOpacity,
    overlayScale,
    mathToScreen,
    screenToMath,
  ]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      onViewportChange({
        ...viewport,
        centerX: viewport.centerX - dx / viewport.zoom,
        centerY: viewport.centerY + dy / viewport.zoom,
      });
    } else {
      const mathPt = screenToMath(px, py, rect.width, rect.height);
      setHoverCoord(mathPt);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoverCoord(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(viewport.zoom * factor, 4), 5000);

    onViewportChange({
      ...viewport,
      zoom: newZoom,
    });
  };

  const handleZoomIn = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.min(viewport.zoom * 1.25, 5000),
    });
  };

  const handleZoomOut = () => {
    onViewportChange({
      ...viewport,
      zoom: Math.max(viewport.zoom / 1.25, 4),
    });
  };

  const handleResetView = () => {
    onViewportChange({
      ...viewport,
      centerX: 0,
      centerY: 0,
      zoom: 40,
    });
  };

  const toggleGridType = () => {
    onViewportChange({
      ...viewport,
      gridType: viewport.gridType === 'cartesian' ? 'polar' : 'cartesian',
    });
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-white">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating View Controls (Crisp White + Pitch Yellow Hover) */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#FFE500] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#FFE500] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-[#FFE500] transition-colors"
          title="Reset View to Center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5" />
        <button
          onClick={toggleGridType}
          className={`p-2 rounded-xl transition-colors ${
            viewport.gridType === 'polar'
              ? 'bg-[#FFE500] text-slate-950 font-bold'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
          title={`Switch Grid: currently ${viewport.gridType}`}
        >
          {viewport.gridType === 'polar' ? (
            <Compass className="w-4 h-4" />
          ) : (
            <Grid className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Coordinates readout bar in top right */}
      <div className="absolute top-4 right-5 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-300 shadow-sm text-[11px] font-mono font-semibold text-slate-700 flex items-center gap-3">
        <span>Zoom: {Math.round(viewport.zoom)}px/u</span>
        <span className="w-px h-3 bg-slate-200" />
        <span>Center: ({viewport.centerX.toFixed(2)}, {viewport.centerY.toFixed(2)})</span>
      </div>
    </div>
  );
};
