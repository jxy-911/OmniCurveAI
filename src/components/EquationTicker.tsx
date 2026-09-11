import React, { useState, useEffect } from 'react';
import { MathView } from './MathView';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';

interface EquationTickerProps {
  onSelectFormula?: (presetId: string) => void;
}

interface TickerItem {
  id: string;
  name: string;
  latex: string;
  category: string;
}

const TICKER_FORMULAS: TickerItem[] = [
  {
    id: 'parabola',
    name: 'Quadratic Parabola',
    latex: 'f(x) = ax^2 + bx + c',
    category: 'Class-10 Polynomials',
  },
  {
    id: 'sine',
    name: 'Harmonic Wave',
    latex: 'f(x) = a\\sin(bx + c)',
    category: 'Trigonometry',
  },
  {
    id: 'linear',
    name: 'Linear Model',
    latex: 'f(x) = mx + c',
    category: 'Coordinate Geometry',
  },
  {
    id: 'cubic',
    name: 'Cubic Spline',
    latex: 'f(x) = ax^3 + bx^2 + cx + d',
    category: 'Higher Polynomials',
  },
  {
    id: 'exponential',
    name: 'Natural Growth',
    latex: 'f(x) = a \\cdot e^{bx}',
    category: 'Exponential Dynamics',
  },
  {
    id: 'logarithmic',
    name: 'Logarithmic Curve',
    latex: 'f(x) = a \\ln(x + x_0) + b',
    category: 'Logarithmic Growth',
  },
  {
    id: 'inverse',
    name: 'Inverse Hyperbola',
    latex: 'f(x) = \\frac{a}{x + x_0} + c',
    category: 'Boyle’s Law & Rational',
  },
  {
    id: 'gaussian',
    name: 'Gaussian Distribution',
    latex: 'f(x) = a e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
    category: 'Normal Distribution',
  },
];

export const EquationTicker: React.FC<EquationTickerProps> = ({ onSelectFormula }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Cycle formulas every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TICKER_FORMULAS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="animated-equation-ticker"
      className="relative z-10 w-full py-2.5 px-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-blue-100/80 shadow-[0_4px_20px_rgba(37,99,235,0.03)] flex flex-col md:flex-row items-center justify-between gap-3 overflow-hidden"
    >
      {/* Left indicator with gradient text */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Real-Time Engine
          </span>
          <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
            Dynamic Curve Models
          </span>
        </div>
      </div>

      {/* Center Ticker Formulas */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
        {TICKER_FORMULAS.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveIndex(idx);
                onSelectFormula?.(item.id);
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative px-3 py-1.5 rounded-xl text-xs transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'scale-105 bg-white text-blue-600 border-2 border-blue-500/40 shadow-md ring-2 ring-blue-500/10 font-bold z-10'
                  : 'bg-white/50 text-neutral-600 hover:text-neutral-950 border border-blue-100/60 hover:bg-white/90'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              )}
              <span className="font-semibold text-[11px] hidden sm:inline">
                {item.name}:
              </span>
              <MathView math={item.latex} className="text-xs" />
            </motion.button>
          );
        })}
      </div>

      {/* Right Category Hint */}
      <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 shrink-0">
        <Sparkles className="w-3 h-3 text-blue-500" />
        <span>Cycles every 4.5s</span>
      </div>
    </div>
  );
};
