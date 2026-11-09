import React, { useState } from 'react';
import { Delete, CornerDownLeft, Sparkles } from 'lucide-react';

interface MathKeyboardProps {
  onInsert: (token: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onEnter,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'functions' | 'symbols'>('basic');

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-yellow-50 text-slate-800 border border-slate-300 shadow-sm transition-all"
        title="Open visual math keyboard"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
        <span>Keypad</span>
      </button>
    );
  }

  const basicKeys = [
    ['x', 'y', 't', 'theta', 'r'],
    ['7', '8', '9', '/', '('],
    ['4', '5', '6', '*', ')'],
    ['1', '2', '3', '-', '^2'],
    ['0', '.', '=', '+', '^'],
  ];

  const funcKeys = [
    ['sin', 'cos', 'tan', 'asin', 'acos'],
    ['atan', 'sinh', 'cosh', 'tanh', 'exp'],
    ['sqrt', 'abs', 'log', 'log10', 'ln'],
    ['pi', 'e', 'sec', 'csc', 'cot'],
  ];

  const symbolKeys = [
    ['<', '<=', '>', '>=', '!='],
    ['dx', 'dy', 'dt', 'a', 'b'],
    ['c', 'k', 'n', 'A', 'B'],
    ['[', ']', '{', '}', ','],
  ];

  const currentGrid = activeTab === 'basic' ? basicKeys : activeTab === 'functions' ? funcKeys : symbolKeys;

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-3 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeTab === 'basic'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            123 / Vars
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeTab === 'functions'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Functions
          </button>
          <button
            onClick={() => setActiveTab('symbols')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-colors ${
              activeTab === 'symbols'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Symbols
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            className="px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 font-mono font-semibold transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="px-2 py-0.5 text-xs font-bold text-slate-400 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 font-mono text-sm">
        {currentGrid.flat().map((key) => (
          <button
            key={key}
            onClick={() => onInsert(key === '^2' ? '^2' : key === 'sqrt' ? 'sqrt(' : key === 'sin' ? 'sin(' : key === 'cos' ? 'cos(' : key === 'tan' ? 'tan(' : key)}
            className="h-8 rounded-xl bg-slate-50 hover:bg-[#FFF9C4] text-slate-900 border border-slate-200 hover:border-yellow-400 font-bold active:scale-95 transition-all flex items-center justify-center text-xs shadow-sm"
          >
            {key === 'theta' ? 'θ' : key === 'pi' ? 'π' : key === '^2' ? 'x²' : key === 'sqrt' ? '√' : key}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-200">
        <button
          onClick={onBackspace}
          className="flex-1 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 text-xs font-sans font-bold transition-colors"
        >
          <Delete className="w-3.5 h-3.5" /> Backspace
        </button>
        {onEnter && (
          <button
            onClick={onEnter}
            className="flex-1 h-8 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 flex items-center justify-center gap-1 text-xs font-sans font-bold border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all"
          >
            <CornerDownLeft className="w-3.5 h-3.5" /> New Line
          </button>
        )}
      </div>
    </div>
  );
};
