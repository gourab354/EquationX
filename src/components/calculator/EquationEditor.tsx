import React, { useState } from 'react';
import { Equation, SliderVar } from '../../types';
import { EquationItem } from './EquationItem';
import { SliderControl } from './SliderControl';
import { MathKeyboard } from '../common/MathKeyboard';
import { extractSliderVariables } from '../../math/parser';
import { Plus, Sliders, Sparkles, HelpCircle, FileText } from 'lucide-react';

interface EquationEditorProps {
  equations: Equation[];
  sliders: SliderVar[];
  onEquationsChange: (equations: Equation[]) => void;
  onSlidersChange: (sliders: SliderVar[]) => void;
  onOpenPresets: () => void;
}

const DEFAULT_COLORS = [
  '#0c87eb', // Blue
  '#eab308', // Yellow
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

export const EquationEditor: React.FC<EquationEditorProps> = ({
  equations,
  sliders,
  onEquationsChange,
  onSlidersChange,
  onOpenPresets,
}) => {
  const [activeEqIndex, setActiveEqIndex] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleAddEquation = (type: Equation['type'] = 'cartesian') => {
    const nextColor = DEFAULT_COLORS[equations.length % DEFAULT_COLORS.length];
    const newEq: Equation = {
      id: `eq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      expression: type === 'cartesian' ? 'y = ' : type === 'polar' ? 'r = ' : '',
      parametricY: type === 'parametric' ? '' : undefined,
      type,
      color: nextColor,
      strokeWidth: 3.0,
      opacity: 1,
      visible: true,
      domain: type === 'parametric' ? { min: 0, max: 2 * Math.PI, step: 0.02 } : undefined,
    };

    onEquationsChange([...equations, newEq]);
    setActiveEqIndex(equations.length);
  };

  const handleUpdateEquation = (index: number, updated: Equation) => {
    const next = [...equations];
    next[index] = updated;
    onEquationsChange(next);
    syncSliders(next);
  };

  const handleDeleteEquation = (index: number) => {
    const next = equations.filter((_, i) => i !== index);
    onEquationsChange(next);
    syncSliders(next);
    if (activeEqIndex >= next.length) {
      setActiveEqIndex(Math.max(0, next.length - 1));
    }
  };

  const handleDuplicateEquation = (index: number) => {
    const orig = equations[index];
    const duplicated: Equation = {
      ...orig,
      id: `eq-${Date.now()}`,
      color: DEFAULT_COLORS[(equations.length + 1) % DEFAULT_COLORS.length],
    };
    const next = [...equations.slice(0, index + 1), duplicated, ...equations.slice(index + 1)];
    onEquationsChange(next);
    syncSliders(next);
  };

  const syncSliders = (currentEqs: Equation[]) => {
    const detected = new Set<string>();
    for (const eq of currentEqs) {
      const vars = extractSliderVariables(eq.expression, eq.parametricY);
      vars.forEach((v) => detected.add(v));
    }

    const existingVars = new Set(sliders.map((s) => s.variable));
    const nextSliders = [...sliders];

    detected.forEach((v) => {
      if (!existingVars.has(v)) {
        nextSliders.push({
          variable: v,
          min: -10,
          max: 10,
          step: 0.1,
          value: 1,
          isPlaying: false,
          speed: 1,
          direction: 1,
        });
      }
    });

    onSlidersChange(nextSliders);
  };

  const handleKeypadInsert = (token: string) => {
    if (equations.length === 0) {
      handleAddEquation('cartesian');
      return;
    }

    const currentEq = equations[activeEqIndex] || equations[0];
    const updated = {
      ...currentEq,
      expression: currentEq.expression + token,
    };
    handleUpdateEquation(activeEqIndex, updated);
  };

  const handleKeypadBackspace = () => {
    if (equations.length === 0) return;
    const currentEq = equations[activeEqIndex] || equations[0];
    const updated = {
      ...currentEq,
      expression: currentEq.expression.slice(0, -1),
    };
    handleUpdateEquation(activeEqIndex, updated);
  };

  const handleKeypadClear = () => {
    if (equations.length === 0) return;
    const currentEq = equations[activeEqIndex] || equations[0];
    const updated = {
      ...currentEq,
      expression: '',
      parametricY: '',
    };
    handleUpdateEquation(activeEqIndex, updated);
  };

  return (
    <div className="w-80 md:w-96 h-full flex flex-col bg-[#FAFBFD] border-r border-slate-200 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800">
            Formulas & Graphs ({equations.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <MathKeyboard
            onInsert={handleKeypadInsert}
            onBackspace={handleKeypadBackspace}
            onClear={handleKeypadClear}
            onEnter={() => handleAddEquation('cartesian')}
            isOpen={isKeyboardOpen}
            onToggle={() => setIsKeyboardOpen(!isKeyboardOpen)}
          />
        </div>
      </div>

      {/* Equations Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
        {equations.map((eq, index) => (
          <EquationItem
            key={eq.id}
            equation={eq}
            index={index}
            onChange={(updated) => handleUpdateEquation(index, updated)}
            onDelete={() => handleDeleteEquation(index)}
            onDuplicate={() => handleDuplicateEquation(index)}
            onFocus={() => setActiveEqIndex(index)}
          />
        ))}

        {/* Add Equation Quick Actions (Pitch Yellow Buttons) */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => handleAddEquation('cartesian')}
            className="flex-1 py-2.5 px-3.5 rounded-2xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add y = f(x)</span>
          </button>

          <button
            onClick={() => handleAddEquation('parametric')}
            className="py-2.5 px-3.5 rounded-2xl bg-white hover:bg-yellow-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 shadow-sm active:scale-95 transition-all"
            title="Add Parametric curve (x(t), y(t))"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Parametric</span>
          </button>
        </div>

        {/* Sliders & Variables Section */}
        {sliders.length > 0 && (
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Live Variable Sliders ({sliders.length})
              </span>
            </div>

            <div className="space-y-2.5">
              {sliders.map((s, idx) => (
                <SliderControl
                  key={s.variable}
                  slider={s}
                  onChange={(updated) => {
                    const next = [...sliders];
                    next[idx] = updated;
                    onSlidersChange(next);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Math Keyboard at bottom when expanded */}
      {isKeyboardOpen && (
        <div className="p-3 border-t border-slate-200 bg-white shadow-xl">
          <MathKeyboard
            onInsert={handleKeypadInsert}
            onBackspace={handleKeypadBackspace}
            onClear={handleKeypadClear}
            onEnter={() => handleAddEquation('cartesian')}
            isOpen={isKeyboardOpen}
            onToggle={() => setIsKeyboardOpen(!isKeyboardOpen)}
          />
        </div>
      )}
    </div>
  );
};
