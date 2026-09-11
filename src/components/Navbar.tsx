import React from 'react';
import { RegressionResult } from '../types';
import { FunctionSquare, Sparkles, Layout, BookOpen, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  bestFit: RegressionResult | null;
}

export const Navbar: React.FC<NavbarProps> = ({ bestFit }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-blue-100 shadow-[0_2px_16px_rgba(37,99,235,0.05)]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs ring-2 ring-white shrink-0 shadow-blue-500/20"
          >
            <FunctionSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </motion.div>

          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-tight font-['Outfit'] text-neutral-950 whitespace-nowrap">
              Omni Curve <span className="text-blue-600 font-extrabold">AI</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
              Class-10 Festival
            </span>
          </div>
        </div>

        {/* Center: 1-Page Navigation Anchors (Up to Down) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => scrollToSection('canvas-workspace-container')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Outfit'] text-neutral-700 hover:text-blue-700 hover:bg-white whitespace-nowrap"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Canvas Studio</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('textbook-graphs-section')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Outfit'] text-neutral-700 hover:text-blue-700 hover:bg-white whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Textbook</span>
            <span>Physics Lab</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('exhibit-info-section')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-['Outfit'] text-neutral-700 hover:text-blue-700 hover:bg-white whitespace-nowrap"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Exhibit Info</span>
          </button>
        </div>

        {/* Right: Live Best Fit Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {bestFit ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
              <span className="text-[11px] font-bold text-neutral-800 whitespace-nowrap font-['Outfit']">
                {bestFit.name}
              </span>
              <span className="text-[11px] font-mono font-black text-blue-600 pl-1 border-l border-blue-200">
                {bestFit.r2.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-neutral-500 text-[11px] font-medium font-['Outfit']">
              <Sparkles className="w-3 h-3 text-neutral-400" />
              <span>Ready for curve</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
