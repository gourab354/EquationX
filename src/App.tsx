import React, { useState } from 'react';
import { Equation, SliderVar, Viewport2D } from './types';
import { Header, ActiveTab } from './components/common/Header';
import { GraphCanvas2D } from './components/calculator/GraphCanvas2D';
import { EquationEditor } from './components/calculator/EquationEditor';
import { ImageToEquationWorkspace } from './components/imageToEquation/ImageToEquationWorkspace';
import { Simulator3DWorkspace } from './components/simulator3d/Simulator3DWorkspace';
import { AIAssistantWorkspace } from './components/aiAssistant/AIAssistantWorkspace';
import { DocumentationWorkspace } from './components/docs/DocumentationWorkspace';
import { PresetsModal } from './components/presets/PresetsModal';
import { ExportModal } from './components/common/ExportModal';
import { PresetItem } from './math/presets';

const INITIAL_EQUATIONS: Equation[] = [
  {
    id: 'eq-init-1',
    type: 'cartesian',
    expression: 'y = sin(x)',
    color: '#0c87eb',
    strokeWidth: 2.5,
    opacity: 1,
    visible: true,
  },
  {
    id: 'eq-init-2',
    type: 'cartesian',
    expression: 'y = cos(x)',
    color: '#f43f5e',
    strokeWidth: 2,
    opacity: 0.85,
    visible: true,
  },
];

const INITIAL_VIEWPORT: Viewport2D = {
  centerX: 0,
  centerY: 0,
  zoom: 50,
  showGrid: true,
  showAxes: true,
  gridType: 'cartesian',
  showLabels: true,
  snapToGrid: false,
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [equations, setEquations] = useState<Equation[]>(INITIAL_EQUATIONS);
  const [sliders, setSliders] = useState<SliderVar[]>([]);
  const [viewport, setViewport] = useState<Viewport2D>(INITIAL_VIEWPORT);
  const [expression3D, setExpression3D] = useState<string>('2.5 * sin(sqrt(x^2 + y^2) - t)');

  // Overlay image for Image-to-Equation comparison on graph
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Callback when ImageToEquation generates equations and user clicks "Plot in Calculator"
  const handleEquationsFromImage = (newEqs: Equation[], image?: HTMLImageElement) => {
    setEquations(newEqs);
    if (image) {
      setOverlayImage(image);
    }
    setActiveTab('calculator');
  };

  // Callback when AI Assistant synthesizes equations
  const handleEquationsFromAI = (newEqs: Equation[], newSliders?: SliderVar[]) => {
    setEquations((prev) => [...prev, ...newEqs]);
    if (newSliders) {
      setSliders((prev) => {
        const existing = new Set(prev.map((s) => s.variable));
        const added = newSliders.filter((s) => !existing.has(s.variable));
        return [...prev, ...added];
      });
    }
    setActiveTab('calculator');
  };

  const handleSelectPreset = (preset: PresetItem) => {
    if (preset.mode === '3d') {
      if (preset.equations[0]?.expression) {
        setExpression3D(preset.equations[0].expression);
      }
      setActiveTab('simulator-3d');
      return;
    }

    const fullEquations: Equation[] = preset.equations.map((e, i) => ({
      id: e.id || `preset-eq-${Date.now()}-${i}`,
      expression: e.expression || '',
      type: e.type || 'cartesian',
      color: e.color || '#0c87eb',
      strokeWidth: e.strokeWidth || 2.5,
      opacity: e.opacity || 1,
      visible: e.visible !== undefined ? e.visible : true,
      parametricY: e.parametricY,
      domain: e.domain,
      label: e.label,
    }));

    setEquations(fullEquations);

    if (preset.sliders) {
      const fullSliders: SliderVar[] = preset.sliders.map((s) => ({
        variable: s.variable || 'a',
        min: s.min ?? -10,
        max: s.max ?? 10,
        step: s.step ?? 0.1,
        value: s.value ?? 1,
        isPlaying: s.isPlaying ?? false,
        speed: s.speed ?? 1,
        direction: 1,
      }));
      setSliders(fullSliders);
    } else {
      setSliders([]);
    }

    setActiveTab('calculator');
  };

  const handleResetWorkspace = () => {
    setEquations(INITIAL_EQUATIONS);
    setSliders([]);
    setViewport(INITIAL_VIEWPORT);
    setOverlayImage(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8F9FA] font-sans text-slate-900 select-none">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onReset={handleResetWorkspace}
        equationCount={equations.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* TAB 1: 2D Graphing Calculator */}
        {activeTab === 'calculator' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            <EquationEditor
              equations={equations}
              sliders={sliders}
              onEquationsChange={setEquations}
              onSlidersChange={setSliders}
              onOpenPresets={() => setIsPresetsOpen(true)}
            />
            <div className="flex-1 relative flex flex-col h-full overflow-hidden">
              <GraphCanvas2D
                equations={equations}
                sliders={sliders}
                viewport={viewport}
                onViewportChange={setViewport}
                overlayImage={overlayImage}
                overlayOpacity={overlayOpacity}
              />

              {/* Overlay Image Controls when Image-to-Equation is being compared */}
              {overlayImage && (
                <div className="absolute bottom-5 left-5 p-3 rounded-2xl bg-white border border-slate-300 shadow-md flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-800">Original Image Overlay:</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-yellow-500 h-1.5 bg-slate-200 rounded"
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-700">
                    {Math.round(overlayOpacity * 100)}%
                  </span>
                  <button
                    onClick={() => setOverlayImage(null)}
                    className="ml-2 text-rose-600 hover:text-rose-700 font-mono text-[11px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Image to Equation (Module 1) */}
        {activeTab === 'image-to-equation' && (
          <ImageToEquationWorkspace
            onEquationsGenerated={handleEquationsFromImage}
            onOpenExportModal={() => setIsExportOpen(true)}
          />
        )}

        {/* TAB 3: 3D Simulator (Module 4) */}
        {activeTab === 'simulator-3d' && (
          <Simulator3DWorkspace initialExpression={expression3D} />
        )}

        {/* TAB 4: AI Math Assistant (Module 5) */}
        {activeTab === 'ai-assistant' && (
          <AIAssistantWorkspace
            onAddEquationsToGraph={handleEquationsFromAI}
            onSwitchTo3D={(expr) => {
              if (expr) setExpression3D(expr);
              setActiveTab('simulator-3d');
            }}
          />
        )}

        {/* TAB 5: Documentation */}
        {activeTab === 'docs' && <DocumentationWorkspace />}
      </main>

      {/* Presets Modal */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        equations={equations}
      />
    </div>
  );
}
export default App;

