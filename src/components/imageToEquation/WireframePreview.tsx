import React, { useRef, useEffect, useState } from 'react';
import { Contour } from '../../types';
import { Layers, Eye, Activity, Check } from 'lucide-react';

interface WireframePreviewProps {
  originalImage: HTMLImageElement | null;
  processedImageData: ImageData | null;
  contours: Contour[];
  selectedContourIds: Set<number>;
  onToggleContour: (id: number) => void;
}

export const WireframePreview: React.FC<WireframePreviewProps> = ({
  originalImage,
  processedImageData,
  contours,
  selectedContourIds,
  onToggleContour,
}) => {
  const [activeView, setActiveView] = useState<'wireframe' | 'edge' | 'original'>('wireframe');
  const wireframeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render Wireframe Vector Canvas on White Background
  useEffect(() => {
    const canvas = wireframeCanvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle coordinate cross at center
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw contours
    for (const contour of contours) {
      const isSelected = selectedContourIds.has(contour.id);
      if (!isSelected) continue;

      const pts = contour.simplified;
      if (pts.length < 2) continue;

      ctx.save();
      ctx.strokeStyle = contour.color;
      ctx.lineWidth = 3.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      if (contour.closed) {
        ctx.closePath();
      }
      ctx.stroke();

      // Draw vertices as small dark/yellow dots
      ctx.fillStyle = '#0F172A';
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
    }
  }, [originalImage, contours, selectedContourIds]);

  // Render Processed Edge Map Canvas
  useEffect(() => {
    const canvas = edgeCanvasRef.current;
    if (!canvas || !processedImageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = processedImageData.width;
    canvas.height = processedImageData.height;
    ctx.putImageData(processedImageData, 0, 0);
  }, [processedImageData]);

  const totalPoints = contours.reduce((acc, c) => acc + c.simplified.length, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
      {/* Header bar */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView('wireframe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'wireframe'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Mathematical Wireframe
          </button>
          <button
            onClick={() => setActiveView('edge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'edge'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Edge Detection
          </button>
          <button
            onClick={() => setActiveView('original')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'original'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Original Image
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono font-bold text-slate-500">
          <span>{contours.length} curves</span>
          <span>{totalPoints} vector points</span>
        </div>
      </div>

      {/* Canvas Viewport (White Graph Paper) */}
      <div className="relative min-h-[340px] max-h-[460px] flex items-center justify-center bg-slate-50 p-4 overflow-hidden math-notebook-bg">
        {/* Wireframe Canvas */}
        <canvas
          ref={wireframeCanvasRef}
          className={`max-w-full max-h-[420px] object-contain rounded-2xl border border-slate-200 shadow-md transition-opacity ${
            activeView === 'wireframe' ? 'block' : 'hidden'
          }`}
        />

        {/* Edge Canvas */}
        <canvas
          ref={edgeCanvasRef}
          className={`max-w-full max-h-[420px] object-contain rounded-2xl border border-slate-200 shadow-md transition-opacity ${
            activeView === 'edge' ? 'block' : 'hidden'
          }`}
        />

        {/* Original Image */}
        {originalImage && (
          <img
            src={originalImage.src}
            alt="Original upload"
            className={`max-w-full max-h-[420px] object-contain rounded-2xl border border-slate-200 shadow-md transition-opacity bg-white ${
              activeView === 'original' ? 'block' : 'hidden'
            }`}
          />
        )}
      </div>

      {/* Contours Selector Pill Bar */}
      {contours.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs custom-scrollbar">
          <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
            Active Shapes:
          </span>
          {contours.map((c, i) => {
            const isSelected = selectedContourIds.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => onToggleContour(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'border-slate-900 bg-[#FFE500] text-slate-950 shadow-[1px_1px_0px_#0f172a]'
                    : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-slate-900/40"
                  style={{ backgroundColor: c.color }}
                />
                <span>Shape #{i + 1}</span>
                <span className="text-[10px] opacity-75">({c.simplified.length} pts)</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
