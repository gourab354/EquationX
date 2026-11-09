import React, { useEffect, useRef } from 'react';
import { SliderVar } from '../../types';
import { Play, Pause } from 'lucide-react';

interface SliderControlProps {
  slider: SliderVar;
  onChange: (updated: SliderVar) => void;
  onDelete?: () => void;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  slider,
  onChange,
  onDelete,
}) => {
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!slider.isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const range = slider.max - slider.min;
      const change = range * 0.15 * slider.speed * slider.direction * dt;
      let nextVal = slider.value + change;
      let nextDir = slider.direction;

      if (nextVal > slider.max) {
        nextVal = slider.max;
        nextDir = -1; // Bounce
      } else if (nextVal < slider.min) {
        nextVal = slider.min;
        nextDir = 1; // Bounce
      }

      onChange({
        ...slider,
        value: nextVal,
        direction: nextDir,
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [slider.isPlaying, slider.value, slider.min, slider.max, slider.speed, slider.direction]);

  const togglePlay = () => {
    onChange({
      ...slider,
      isPlaying: !slider.isPlaying,
    });
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 2, 4];
    const nextIdx = (speeds.indexOf(slider.speed) + 1) % speeds.length;
    onChange({
      ...slider,
      speed: speeds[nextIdx],
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              slider.isPlaying
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_2px_0px_#0f172a]'
                : 'bg-yellow-50 hover:bg-[#FFE500] text-slate-900 border border-yellow-300'
            }`}
            title={slider.isPlaying ? 'Pause animation' : 'Play continuous oscillation'}
          >
            {slider.isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <span className="font-mono font-bold text-slate-900 text-sm">
            {slider.variable} = <span className="text-yellow-600 font-extrabold">{parseFloat(slider.value.toFixed(2))}</span>
          </span>
        </div>

        <button
          onClick={cycleSpeed}
          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-yellow-100 text-slate-700 font-mono text-[11px] font-bold transition-colors"
          title="Animation speed multiplier"
        >
          {slider.speed}x
        </button>
      </div>

      {/* Slider range input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="number"
          value={slider.min}
          onChange={(e) =>
            onChange({ ...slider, min: parseFloat(e.target.value) || 0 })
          }
          className="w-12 px-1.5 py-1 text-[11px] font-mono rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-center focus:outline-none focus:border-yellow-500"
        />

        <input
          type="range"
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={slider.value}
          onChange={(e) =>
            onChange({ ...slider, value: parseFloat(e.target.value) })
          }
          className="flex-1 accent-yellow-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
        />

        <input
          type="number"
          value={slider.max}
          onChange={(e) =>
            onChange({ ...slider, max: parseFloat(e.target.value) || 10 })
          }
          className="w-12 px-1.5 py-1 text-[11px] font-mono rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-center focus:outline-none focus:border-yellow-500"
        />
      </div>
    </div>
  );
};
