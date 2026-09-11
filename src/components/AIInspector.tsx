import React, { useState } from 'react';
import { RegressionResult } from '../types';
import { MathView } from './MathView';
import {
  Copy,
  Check,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';

interface AIInspectorProps {
  bestFit: RegressionResult | null;
  allModels: RegressionResult[];
  selectedModel: RegressionResult | null;
  onSelectModel: (model: RegressionResult) => void;
  pointsCount: number;
}

export const AIInspector: React.FC<AIInspectorProps> = ({
  bestFit,
  allModels,
  selectedModel,
  onSelectModel,
  pointsCount,
}) => {
  const [copiedLatex, setCopiedLatex] = useState<boolean>(false);
  const [copiedDesmos, setCopiedDesmos] = useState<boolean>(false);

  const active = selectedModel || bestFit;

  const handleCopyLatex = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.formulaLatex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 1800);
  };

  const handleCopyDesmos = () => {
    if (!active) return;
    navigator.clipboard.writeText(active.desmosString);
    setCopiedDesmos(true);
    setTimeout(() => setCopiedDesmos(false), 1800);
  };

  return (
    <div
      id="ai-inspector-container"
      className="flex flex-col h-full rounded-2xl bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-[0_2px_16px_rgba(37,99,235,0.04)] overflow-hidden min-h-0"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100/80 bg-white/95 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 font-['Outfit']">
              Discovered Equation
            </h2>
            <p className="text-[10px] text-neutral-500 font-medium">Real-Time Analytical Regression</p>
          </div>
        </div>

        {active && (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 font-['Outfit']">
            {active.name}
          </span>
        )}
      </div>

      {/* Main Content Area - Scrollable to fit screen */}
      <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50/50">
        {pointsCount === 0 || !active ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-base font-extrabold text-neutral-950 font-['Outfit']">
              Waiting for Freehand Stroke
            </p>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Sketch any continuous path or select a preset on the Cartesian canvas to calculate its mathematical equation.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Primary Discovered Equation Hero Card */}
            <motion.div
              key={active.modelType}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[#F0F7FF] via-white to-white border border-blue-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-neutral-500 tracking-wider uppercase font-['Outfit']">
                  Identified Mathematical Equation
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-900 font-['Outfit']">
                    {active.name}
                  </span>
                </div>
              </div>

              {/* Equation Display */}
              <div className="py-3 px-3 rounded-xl bg-white border border-blue-100/90 shadow-2xs flex items-center justify-center overflow-x-auto min-h-[64px]">
                <MathView
                  math={active.formulaLatex}
                  displayMode={true}
                  className="text-lg sm:text-2xl font-bold text-neutral-950"
                />
              </div>

              {/* Calculated Parameters Breakdown */}
              {Object.keys(active.parameters).length > 0 && (
                <div className="pt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5 font-['Outfit']">
                    Solved Coefficient Values
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(active.parameters).map(([key, val]) => (
                      <div
                        key={key}
                        className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 shadow-2xs flex items-center gap-1.5 text-xs font-mono"
                      >
                        <MathView math={`${key} =`} className="text-neutral-600 font-bold" />
                        <span className="font-extrabold text-blue-700">
                          {typeof val === 'number' ? Number(val.toFixed(3)) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                <button
                  type="button"
                  id="btn-copy-latex"
                  onClick={handleCopyLatex}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-neutral-800 bg-white hover:bg-blue-50/80 active:bg-blue-100 border border-neutral-300 hover:border-blue-400 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-2xs"
                >
                  {copiedLatex ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-extrabold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-neutral-600" />
                      <span>Copy LaTeX</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-copy-desmos"
                  onClick={handleCopyDesmos}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 border border-blue-600 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-xs shadow-blue-600/20"
                >
                  {copiedDesmos ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span className="text-white font-extrabold">Copied</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 text-white" />
                      <span>Copy Desmos</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* 2. Accuracy & Fit Score Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-xl bg-white border border-blue-100/90 space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-neutral-900 font-['Outfit']">
                    Determination (R²)
                  </span>
                </div>
                <span className="text-sm sm:text-base font-black font-mono text-blue-600">
                  {active.r2.toFixed(1)}%
                </span>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full h-2 rounded-full bg-blue-50/80 overflow-hidden border border-blue-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, Math.min(100, active.r2))}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-0.5">
                <span className="truncate pr-2">{active.description}</span>
                <span className="font-extrabold text-neutral-900 font-['Outfit'] shrink-0">
                  {active.r2 >= 90
                    ? 'Optimal Fit'
                    : active.r2 >= 70
                    ? 'Close Match'
                    : 'Approximate Fit'}
                </span>
              </div>
            </motion.div>

            {/* 3. Multi-Model Comparison & Selector with KaTeX - Compact Scrollable */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-950 font-['Outfit']">
                    Model Hierarchy Ranking
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {allModels.length}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  Click to overlay
                </span>
              </div>

              {/* Scrollable Model Container */}
              <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50/50 rounded-lg">
                {allModels.map((model, idx) => {
                  const isSelected = active.modelType === model.modelType;
                  const isBest = bestFit?.modelType === model.modelType;

                  return (
                    <motion.button
                      key={model.modelType}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelectModel(model)}
                      className={`w-full p-2 sm:p-2.5 rounded-lg text-left flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-50/90 to-white border-blue-500 ring-1 ring-blue-500/15 shadow-2xs'
                          : 'bg-white border-neutral-200/80 hover:bg-blue-50/40 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isBest
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          #{idx + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-950 font-['Outfit']">
                              {model.name}
                            </span>
                            {isBest && (
                              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-blue-600 text-white">
                                Best
                              </span>
                            )}
                          </div>
                          <div className="overflow-x-auto text-[11px]">
                            <MathView
                              math={model.formulaLatex}
                              className="text-[11px] text-neutral-800"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        <span
                          className={`text-xs font-mono font-black ${
                            model.r2 >= 80 ? 'text-blue-600' : 'text-neutral-500'
                          }`}
                        >
                          {model.r2.toFixed(1)}%
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-blue-600' : 'text-neutral-300'
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
