import React, { useState } from 'react';
import { Equation } from '../../types';
import { expressionToLatex } from '../../math/parser';
import { X, Copy, Check, Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  equations: Equation[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  equations,
}) => {
  const [activeTab, setActiveTab] = useState<'latex' | 'desmos' | 'json' | 'csv'>('latex');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateLatex = () => {
    const lines = equations.map((eq, i) => {
      if (eq.type === 'parametric') {
        return `% Equation ${i + 1} (Parametric)\n\\begin{aligned}\nx(t) &= ${expressionToLatex(eq.expression)} \\\\\ny(t) &= ${expressionToLatex(eq.parametricY || '0')}\n\\end{aligned}\n`;
      }
      return `% Equation ${i + 1}\n${expressionToLatex(eq.expression)}\n`;
    });
    return lines.join('\n');
  };

  const generateDesmos = () => {
    return equations
      .map((eq) => {
        if (eq.type === 'parametric') {
          return `(${eq.expression}, ${eq.parametricY || '0'})`;
        }
        return eq.expression;
      })
      .join('\n');
  };

  const generateJSON = () => {
    return JSON.stringify(
      {
        exportedFrom: 'EQUATIONX',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        equations: equations.map((e) => ({
          type: e.type,
          expression: e.expression,
          parametricY: e.parametricY,
          color: e.color,
          domain: e.domain,
        })),
      },
      null,
      2
    );
  };

  const generateCSV = () => {
    const rows = ['equation_id,type,expression_x,expression_y,color'];
    equations.forEach((eq, i) => {
      rows.push(
        `"${eq.id}","${eq.type}","${eq.expression.replace(/"/g, '""')}","${(eq.parametricY || '').replace(/"/g, '""')}","${eq.color}"`
      );
    });
    return rows.join('\n');
  };

  const getContent = () => {
    switch (activeTab) {
      case 'latex':
        return generateLatex();
      case 'desmos':
        return generateDesmos();
      case 'json':
        return generateJSON();
      case 'csv':
        return generateCSV();
    }
  };

  const currentContent = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'latex' ? 'tex' : activeTab === 'desmos' ? 'txt' : activeTab;
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equationx-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE500] border border-slate-900 flex items-center justify-center shadow-[1px_2px_0px_#0f172a]">
              <Download className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900">Export Mathematical Equations</h2>
              <p className="text-xs text-slate-500 font-medium">Export in LaTeX, Desmos, JSON, or CSV format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-2 text-xs bg-slate-50/50">
          <button
            onClick={() => setActiveTab('latex')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'latex'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            LaTeX Formatted
          </button>
          <button
            onClick={() => setActiveTab('desmos')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'desmos'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            Desmos Compatible
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'json'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            JSON Spec
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'csv'
                ? 'bg-[#FFE500] text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#0f172a]'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white'
            }`}
          >
            CSV Coordinates
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-5 flex-1">
          <div className="relative">
            <textarea
              readOnly
              value={currentContent}
              rows={12}
              className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none custom-scrollbar select-text resize-none font-medium"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500 font-mono font-bold">
            {equations.length} equations ready for export
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-yellow-50 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 text-xs font-black flex items-center gap-1.5 border border-slate-900 shadow-[1px_2px_0px_#0f172a] transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
