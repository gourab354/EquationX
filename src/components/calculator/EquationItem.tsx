import React, { useState } from 'react';
import { Equation } from '../../types';
import { classifyEquation, expressionToLatex, compileExpression } from '../../math/parser';
import { MathFormula } from '../common/MathFormula';
import {
  Eye,
  EyeOff,
  Trash2,
  Settings,
  Copy,
  Table as TableIcon,
  Plus
} from 'lucide-react';

interface EquationItemProps {
  equation: Equation;
  index: number;
  onChange: (updated: Equation) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onFocus?: () => void;
}

const PRESET_COLORS = [
  '#0c87eb', // Blue
  '#eab308', // Yellow/Gold
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#0f172a', // Deep Slate
];

export const EquationItem: React.FC<EquationItemProps> = ({
  equation,
  index,
  onChange,
  onDelete,
  onDuplicate,
  onFocus,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [customXList, setCustomXList] = useState<number[]>([-3, -2, -1, 0, 1, 2, 3]);
  const [newXInput, setNewXInput] = useState('');

  const handleExpressionChange = (expr: string) => {
    const classification = classifyEquation(expr, equation.parametricY);
    onChange({
      ...equation,
      expression: expr,
      type: classification.type,
      isInequality: classification.isInequality,
      inequalityOp: classification.inequalityOp,
    });
  };

  const handleParametricYChange = (exprY: string) => {
    onChange({
      ...equation,
      parametricY: exprY,
      type: 'parametric',
    });
  };

  const toggleVisibility = () => {
    onChange({
      ...equation,
      visible: !equation.visible,
    });
  };

  const latexFormula = expressionToLatex(equation.expression);

  // Compute table values
  const computeTableY = (xVal: number) => {
    try {
      const { evaluate, error } = compileExpression(equation.expression);
      if (error) return '—';
      const res = evaluate({ x: xVal });
      if (isNaN(res) || !isFinite(res)) return 'undefined';
      return parseFloat(res.toFixed(4)).toString();
    } catch {
      return '—';
    }
  };

  const handleAddX = () => {
    const num = parseFloat(newXInput);
    if (!isNaN(num) && !customXList.includes(num)) {
      setCustomXList([...customXList, num].sort((a, b) => a - b));
      setNewXInput('');
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all">
      {/* Top row: Color dot / Toggle, Input, Actions */}
      <div className="flex items-start gap-2.5">
        {/* Color Indicator & Visibility */}
        <div className="relative mt-1">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-5 h-5 rounded-full border-2 border-white ring-2 ring-slate-200 flex items-center justify-center shadow-sm transition-transform hover:scale-110"
            style={{ backgroundColor: equation.color }}
            title="Change graph color"
          />

          {showColorPicker && (
            <div className="absolute left-0 top-7 z-30 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl grid grid-cols-4 gap-2 w-36">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChange({ ...equation, color: c });
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded-full hover:scale-110 transition-transform shadow-inner"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Index badge */}
        <span className="text-[11px] font-mono font-bold text-slate-400 mt-1 select-none">
          {index + 1}
        </span>

        {/* Input fields */}
        <div className="flex-1 space-y-2">
          {equation.type === 'parametric' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-slate-600">x(t) =</span>
                <input
                  type="text"
                  value={equation.expression}
                  onChange={(e) => handleExpressionChange(e.target.value)}
                  onFocus={onFocus}
                  placeholder="e.g. 5 * cos(t)"
                  className="flex-1 px-3 py-1.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-slate-600">y(t) =</span>
                <input
                  type="text"
                  value={equation.parametricY || ''}
                  onChange={(e) => handleParametricYChange(e.target.value)}
                  onFocus={onFocus}
                  placeholder="e.g. 5 * sin(t)"
                  className="flex-1 px-3 py-1.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={equation.expression}
                onChange={(e) => handleExpressionChange(e.target.value)}
                onFocus={onFocus}
                placeholder="Enter equation, e.g. y = sin(x) or r = 2*cos(3*theta)"
                className="w-full px-3 py-1.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          )}

          {/* Pretty LaTeX formula display */}
          {equation.expression.trim().length > 0 && (
            <div className="text-xs font-mono overflow-x-auto py-1 max-w-full text-slate-800 bg-yellow-50/60 px-2.5 rounded-lg border border-yellow-200/50">
              <MathFormula math={latexFormula} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVisibility}
            className={`p-1.5 rounded-lg transition-colors ${
              equation.visible
                ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                : 'text-slate-300 hover:text-slate-500'
            }`}
            title={equation.visible ? 'Hide equation' : 'Show equation'}
          >
            {equation.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {equation.type === 'cartesian' && (
            <button
              onClick={() => setShowTable(!showTable)}
              className={`p-1.5 rounded-lg transition-colors ${
                showTable
                  ? 'bg-[#FFE500] text-slate-950 font-bold border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Table of Values (x, y)"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            title="Stroke & domain settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onDuplicate}
            className="p-1.5 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors"
            title="Duplicate equation"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Delete equation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Table of Values (Desmos-like x, y table) */}
      {showTable && equation.type === 'cartesian' && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Table of Values (x, y):</span>
            <span className="font-mono text-[11px] text-slate-400">y = f(x)</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs font-mono">
            <div className="grid grid-cols-2 bg-[#FFF9C4] font-black text-slate-900 p-2 border-b border-slate-200 text-center">
              <span>x</span>
              <span>y</span>
            </div>

            <div className="max-h-36 overflow-y-auto custom-scrollbar divide-y divide-slate-100 bg-white">
              {customXList.map((xVal) => (
                <div key={xVal} className="grid grid-cols-2 p-1.5 text-center hover:bg-yellow-50/50">
                  <span className="text-slate-600 font-bold">{xVal}</span>
                  <span className="text-slate-900 font-extrabold">{computeTableY(xVal)}</span>
                </div>
              ))}
            </div>

            {/* Quick Add X input */}
            <div className="p-1.5 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Custom x..."
                value={newXInput}
                onChange={(e) => setNewXInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddX()}
                className="flex-1 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={handleAddX}
                className="px-2.5 py-1 rounded-lg bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-bold text-xs flex items-center gap-1 border border-slate-900 shadow-[1px_1px_0px_#0f172a]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Settings Panel (Stroke width, Opacity, Domain bounds) */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">Line Thickness:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={equation.strokeWidth}
                onChange={(e) =>
                  onChange({ ...equation, strokeWidth: parseFloat(e.target.value) })
                }
                className="w-24 accent-yellow-500 h-1.5 bg-slate-200 rounded"
              />
              <span className="font-mono text-[11px] font-bold w-6">{equation.strokeWidth}px</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Opacity:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={equation.opacity}
                onChange={(e) =>
                  onChange({ ...equation, opacity: parseFloat(e.target.value) })
                }
                className="w-24 accent-yellow-500 h-1.5 bg-slate-200 rounded"
              />
              <span className="font-mono text-[11px] font-bold w-6">
                {Math.round(equation.opacity * 100)}%
              </span>
            </div>
          </div>

          {equation.type === 'parametric' && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Parameter t domain:</span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <input
                  type="number"
                  value={equation.domain?.min ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...equation,
                      domain: {
                        ...(equation.domain || { min: 0, max: 2 * Math.PI }),
                        min: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-12 px-1 py-0.5 rounded bg-slate-50 border border-slate-200 text-center"
                />
                <span>≤ t ≤</span>
                <input
                  type="number"
                  value={parseFloat((equation.domain?.max ?? 6.28).toFixed(2))}
                  onChange={(e) =>
                    onChange({
                      ...equation,
                      domain: {
                        ...(equation.domain || { min: 0, max: 2 * Math.PI }),
                        max: parseFloat(e.target.value) || 6.28,
                      },
                    })
                  }
                  className="w-12 px-1 py-0.5 rounded bg-slate-50 border border-slate-200 text-center"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
