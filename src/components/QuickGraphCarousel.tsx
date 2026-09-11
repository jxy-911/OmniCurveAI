import React, { useRef } from 'react';
import { MathView } from './MathView';
import { Point } from '../types';
import { PRESET_CURVES } from '../utils/mathEngine';
import { TEXTBOOK_GRAPHS } from './TextbookGraphsLab';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export interface QuickGraphOption {
  id: string;
  name: string;
  category: 'Math Functions' | 'Physics Curves';
  equationLatex: string;
  getPoints: () => Point[];
}

// Combine math functions and key physics textbook curves for 1-click preview
export const ALL_QUICK_GRAPHS: QuickGraphOption[] = [
  // 1. Math Functions from PRESET_CURVES
  ...PRESET_CURVES.map((p) => ({
    id: `math-${p.id}`,
    name: p.name,
    category: 'Math Functions' as const,
    equationLatex: p.formulaLatex,
    getPoints: () => p.generate(),
  })),
  // 2. Physics Textbook Curves
  ...TEXTBOOK_GRAPHS.map((tg) => ({
    id: `physics-${tg.id}`,
    name: tg.name,
    category: 'Physics Curves' as const,
    equationLatex: tg.equationLatex,
    getPoints: () => {
      const res = tg.compute(tg.defaultParam);
      return res.canvasPoints || res.points;
    },
  })),
];

interface QuickGraphCarouselProps {
  activeGraphId: string | null;
  onSelectGraph: (graph: QuickGraphOption) => void;
}

export const QuickGraphCarousel: React.FC<QuickGraphCarouselProps> = ({
  activeGraphId,
  onSelectGraph,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 260;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div
      id="quick-graph-carousel-bar"
      className="shrink-0 w-full rounded-xl bg-white/95 backdrop-blur-xl border border-blue-200/80 px-2 py-1.5 shadow-[0_2px_12px_rgba(37,99,235,0.04)] flex items-center gap-2"
    >
      {/* Label Badge */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 font-['Outfit'] whitespace-nowrap">
          1-Click Graphs
        </span>
      </div>

      {/* Left Scroll Arrow */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
        className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-neutral-200 text-neutral-700 hover:text-blue-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Horizontal Scrollable Strip - Compact Chips */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-2 overflow-x-auto py-0.5 scroll-smooth no-scrollbar scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {ALL_QUICK_GRAPHS.map((item) => {
          const isActive =
            activeGraphId === item.id ||
            activeGraphId === item.id.replace('math-', '') ||
            activeGraphId === item.id.replace('physics-', '');

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectGraph(item)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-left border transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 ring-1 ring-blue-500 shadow-xs shadow-blue-600/20'
                  : 'bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 text-neutral-800'
              }`}
            >
              <span
                className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.category === 'Physics Curves'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {item.category === 'Physics Curves' ? 'Physics' : 'Math'}
              </span>

              <span className="text-xs font-bold font-['Outfit']">
                {item.name}
              </span>

              <span className={isActive ? 'text-white/60' : 'text-neutral-300'}>
                |
              </span>

              <div className="overflow-hidden max-w-[140px] truncate text-xs">
                <MathView
                  math={item.equationLatex}
                  className={`text-xs ${isActive ? 'text-white' : 'text-neutral-900'}`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Right Scroll Arrow */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
        className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 border border-neutral-200 text-neutral-700 hover:text-blue-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
