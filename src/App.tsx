import React, { useState, useMemo, useCallback } from 'react';
import { Point, RegressionResult } from './types';
import { runMultiModelRegression, PRESET_CURVES } from './utils/mathEngine';
import { PhysicsBackground } from './components/PhysicsBackground';
import { Navbar } from './components/Navbar';
import { MilkRedHeroHeader } from './components/MilkRedHeroHeader';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { AIInspector } from './components/AIInspector';
import { QuickGraphCarousel, QuickGraphOption } from './components/QuickGraphCarousel';
import { TextbookGraphsLab } from './components/TextbookGraphsLab';
import { Footer } from './components/Footer';

export default function App() {
  // Start with Parabola preset for instant live mathematical visualization
  const [points, setPoints] = useState<Point[]>(() => {
    const defaultPreset = PRESET_CURVES.find((p) => p.id === 'parabola');
    return defaultPreset ? defaultPreset.generate() : [];
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('parabola');

  // Compute multi-model regression over current points
  const { allModels, bestFit } = useMemo(() => {
    return runMultiModelRegression(points);
  }, [points]);

  // Selected model for inspector and canvas overlay
  const [selectedModelType, setSelectedModelType] = useState<string | null>(null);

  const activeModel: RegressionResult | null = useMemo(() => {
    if (points.length < 2) return null;
    if (selectedModelType) {
      const found = allModels.find((m) => m.modelType === selectedModelType);
      if (found) return found;
    }
    return bestFit;
  }, [selectedModelType, allModels, bestFit, points.length]);

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_CURVES.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setSelectedModelType(null);
      setPoints(preset.generate());
    }
  };

  // Handle 1-click selection from the horizontal scrollable graph carousel
  const handleSelectQuickGraph = (graph: QuickGraphOption) => {
    setSelectedPresetId(graph.id);
    setSelectedModelType(null);
    setPoints(graph.getPoints());
  };

  // Freehand drawing clears preset indicator
  const handlePointsChange = (newPoints: Point[]) => {
    setSelectedPresetId(null);
    setPoints(newPoints);
  };

  const handleSelectModel = (model: RegressionResult) => {
    setSelectedModelType(model.modelType);
  };

  // Load a textbook curve directly into the main recognition canvas and smoothly scroll to canvas
  const handleLoadCurveToCanvas = useCallback((curvePoints: Point[], _name: string) => {
    setSelectedPresetId(null);
    setSelectedModelType(null);
    setPoints(curvePoints);
    const canvasEl = document.getElementById('canvas-workspace-container');
    if (canvasEl) {
      canvasEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white text-neutral-950 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-700 overflow-x-hidden">
      {/* 1. Interactive Physics Background Canvas */}
      <PhysicsBackground />

      {/* 2. Sticky Top Header Navbar */}
      <Navbar bestFit={bestFit} />

      {/* 3. Hero Header with Physics Simulation (Top of Page) */}
      <MilkRedHeroHeader />

      {/* 4. Main Interactive Canvas Workspace (One Page, Up to Down) */}
      <main
        id="canvas-workspace-container"
        className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5"
      >
        {/* Horizontal 1-Click Graph Carousel directly above canvas */}
        <QuickGraphCarousel
          activeGraphId={selectedPresetId}
          onSelectGraph={handleSelectQuickGraph}
        />

        {/* Core Workspace Grid: Canvas on Left (7 cols), AI Inspector on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Panel: Drawing Canvas (7 cols on lg) */}
          <div className="lg:col-span-7 h-full">
            <CanvasWorkspace
              points={points}
              onPointsChange={handlePointsChange}
              activeModel={activeModel}
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
            />
          </div>

          {/* Right Panel: Discovered Equation & AI Inspector (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <AIInspector
              bestFit={bestFit}
              allModels={allModels}
              selectedModel={activeModel}
              onSelectModel={handleSelectModel}
              pointsCount={points.length}
            />
          </div>
        </div>
      </main>

      {/* 5. Class-10 Textbook Physics & Mathematics Graph Suite (Immediately Below Canvas) */}
      <section id="textbook-graphs-section" className="relative z-10">
        <TextbookGraphsLab onLoadCurveToCanvas={handleLoadCurveToCanvas} />
      </section>

      {/* 6. Exhibit Info & Institutional Credits (Bottom of Page) */}
      <section id="exhibit-info-section" className="relative z-10">
        <Footer />
      </section>
    </div>
  );
}
