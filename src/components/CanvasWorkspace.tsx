import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, RegressionResult } from '../types';
import {
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  GitCommit,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface CanvasWorkspaceProps {
  points: Point[];
  onPointsChange: (newPoints: Point[]) => void;
  activeModel: RegressionResult | null;
  selectedPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  points,
  onPointsChange,
  activeModel,
  onSelectPreset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport / Coordinate limits
  const [domainX, setDomainX] = useState<number>(8); // Range [-8, 8]
  const [domainY, setDomainY] = useState<number>(6); // Range [-6, 6]

  // Visualization toggles
  const [showFittedCurve, setShowFittedCurve] = useState<boolean>(true);
  const [showResiduals, setShowResiduals] = useState<boolean>(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<Point[][]>([]);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // History stack for Undo
  const pushHistory = useCallback((currentPoints: Point[]) => {
    setHistory((prev) => [...prev.slice(-15), currentPoints]);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    onPointsChange(previous);
  }, [history, onPointsChange]);

  const handleClear = useCallback(() => {
    if (points.length > 0) {
      pushHistory(points);
    }
    onPointsChange([]);
  }, [points, pushHistory, onPointsChange]);

  // Coordinate transforms
  const toScreen = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const originX = width / 2;
      const originY = height / 2;
      const scaleX = width / (domainX * 2);
      const scaleY = height / (domainY * 2);

      const px = originX + x * scaleX;
      const py = originY - y * scaleY;
      return { px, py };
    },
    [domainX, domainY]
  );

  const toCartesian = useCallback(
    (px: number, py: number, width: number, height: number) => {
      const originX = width / 2;
      const originY = height / 2;
      const scaleX = width / (domainX * 2);
      const scaleY = height / (domainY * 2);

      const x = (px - originX) / scaleX;
      const y = (originY - py) / scaleY;
      return { x, y };
    },
    [domainX, domainY]
  );

  // Main Canvas Rendering in Milk-Blue & Ink Black
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Milk White Canvas Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;
    const scaleX = width / (domainX * 2);
    const scaleY = height / (domainY * 2);

    // 2. Delicate Subgrid in Milk-Blue
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.04)';
    const subStep = 0.5;
    for (let x = -domainX; x <= domainX; x += subStep) {
      const px = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
    for (let y = -domainY; y <= domainY; y += subStep) {
      const py = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // 3. Major Cartesian Grid Lines with high contrast numbers
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.12)';
    ctx.fillStyle = '#475569';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const step = 2;
    for (let x = -Math.floor(domainX); x <= Math.floor(domainX); x += step) {
      if (x === 0) continue;
      const px = originX + x * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();

      // Axis tick mark
      ctx.beginPath();
      ctx.moveTo(px, originY - 4);
      ctx.lineTo(px, originY + 4);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
      ctx.stroke();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.12)';

      ctx.fillText(x > 0 ? `+${x}` : `${x}`, px, originY + 6);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = -Math.floor(domainY); y <= Math.floor(domainY); y += step) {
      if (y === 0) continue;
      const py = originY - y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();

      // Axis tick mark
      ctx.beginPath();
      ctx.moveTo(originX - 4, py);
      ctx.lineTo(originX + 4, py);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
      ctx.stroke();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.12)';

      ctx.fillText(y > 0 ? `+${y}` : `${y}`, originX - 8, py);
    }

    // 4. Main Axes in Milk-Blue Accent with Arrowheads
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.75)';
    ctx.beginPath();
    ctx.moveTo(10, originY);
    ctx.lineTo(width - 10, originY);
    ctx.moveTo(originX, 10);
    ctx.lineTo(originX, height - 10);
    ctx.stroke();

    // Directional Arrowheads on Axes
    const arrowSize = 6;
    // Right arrow (+X)
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.moveTo(width - 6, originY);
    ctx.lineTo(width - 6 - arrowSize * 1.5, originY - arrowSize);
    ctx.lineTo(width - 6 - arrowSize * 1.5, originY + arrowSize);
    ctx.closePath();
    ctx.fill();

    // Left arrow (-X)
    ctx.beginPath();
    ctx.moveTo(6, originY);
    ctx.lineTo(6 + arrowSize * 1.5, originY - arrowSize);
    ctx.lineTo(6 + arrowSize * 1.5, originY + arrowSize);
    ctx.closePath();
    ctx.fill();

    // Top arrow (+Y)
    ctx.beginPath();
    ctx.moveTo(originX, 6);
    ctx.lineTo(originX - arrowSize, 6 + arrowSize * 1.5);
    ctx.lineTo(originX + arrowSize, 6 + arrowSize * 1.5);
    ctx.closePath();
    ctx.fill();

    // Bottom arrow (-Y)
    ctx.beginPath();
    ctx.moveTo(originX, height - 6);
    ctx.lineTo(originX - arrowSize, height - 6 - arrowSize * 1.5);
    ctx.lineTo(originX + arrowSize, height - 6 - arrowSize * 1.5);
    ctx.closePath();
    ctx.fill();

    // Axis Labels
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('+X', width - 18, originY - 12);
    ctx.textAlign = 'left';
    ctx.fillText('-X', 18, originY - 12);
    ctx.fillText('+Y', originX + 10, 20);
    ctx.fillText('-Y', originX + 10, height - 16);

    // Origin Mark (0,0)
    ctx.beginPath();
    ctx.arc(originX, originY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#2563EB';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(originX, originY, 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#2563EB';
    ctx.textAlign = 'right';
    ctx.fillText('(0,0)', originX - 8, originY + 12);

    // 5. Residual Lines (Vertical Errors) if enabled
    if (showResiduals && activeModel && points.length > 0 && showFittedCurve) {
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.setLineDash([2, 2]);

      for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 30))) {
        const p = points[i];
        const yHat = activeModel.evaluate(p.x);
        const { px, py } = toScreen(p.x, p.y, width, height);
        const { py: pyHat } = toScreen(p.x, yHat, width, height);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, pyHat);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 6. User's Freehand Stroke (Pitch-Black ink, ultra-smooth quadratic spline, 1.6px weight)
    if (points.length > 0) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#0A0A0A';

      ctx.beginPath();
      if (points.length === 1) {
        const pt = toScreen(points[0].x, points[0].y, width, height);
        ctx.arc(pt.px, pt.py, 1.0, 0, Math.PI * 2);
        ctx.fill();
      } else if (points.length === 2) {
        const p0 = toScreen(points[0].x, points[0].y, width, height);
        const p1 = toScreen(points[1].x, points[1].y, width, height);
        ctx.moveTo(p0.px, p0.py);
        ctx.lineTo(p1.px, p1.py);
        ctx.stroke();
      } else {
        const screenPts = points.map((p) => toScreen(p.x, p.y, width, height));
        ctx.moveTo(screenPts[0].px, screenPts[0].py);

        for (let i = 1; i < screenPts.length - 1; i++) {
          const xc = (screenPts[i].px + screenPts[i + 1].px) / 2;
          const yc = (screenPts[i].py + screenPts[i + 1].py) / 2;
          ctx.quadraticCurveTo(screenPts[i].px, screenPts[i].py, xc, yc);
        }

        const last = screenPts[screenPts.length - 1];
        const secondLast = screenPts[screenPts.length - 2];
        ctx.quadraticCurveTo(secondLast.px, secondLast.py, last.px, last.py);
        ctx.stroke();
      }
    }

    // 7. Fitted Mathematical Overlay (Vibrant Royal Blue line with subtle glow)
    if (showFittedCurve && activeModel && points.length > 1) {
      ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = '#2563EB'; // Royal Blue

      ctx.beginPath();
      let started = false;
      const stepPixels = 2;

      for (let px = 0; px <= width; px += stepPixels) {
        const { x } = toCartesian(px, 0, width, height);
        const y = activeModel.evaluate(x);

        if (!isNaN(y) && isFinite(y)) {
          const { py } = toScreen(x, y, width, height);
          if (py >= -height && py <= height * 2) {
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 8. Hover Coordinate Point Inspection
    if (hoverCoord && activeModel && points.length > 1) {
      const { x: hx } = hoverCoord;
      const hy = activeModel.evaluate(hx);

      if (!isNaN(hy) && isFinite(hy)) {
        const { px, py } = toScreen(hx, hy, width, height);

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#2563EB';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Coordinate tooltip badge
        const badgeText = `(${hx.toFixed(2)}, ${hy.toFixed(2)})`;
        ctx.font = '600 10px "JetBrains Mono", monospace';
        const tw = ctx.measureText(badgeText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(px + 8, py - 20, tw + 10, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, px + 13, py - 11);
      }
    }
  }, [
    domainX,
    domainY,
    showFittedCurve,
    showResiduals,
    points,
    activeModel,
    hoverCoord,
    toScreen,
    toCartesian,
  ]);

  // Handle Resize and High DPI
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { x, y } = toCartesian(px, py, rect.width, rect.height);

    pushHistory(points);
    setIsDrawing(true);
    onPointsChange([{ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { x, y } = toCartesian(px, py, rect.width, rect.height);

    setHoverCoord({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });

    if (!isDrawing) return;

    // Smooth filtering threshold to avoid redundant jitter points
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      const distSq = (lastPoint.x - x) ** 2 + (lastPoint.y - y) ** 2;
      if (distSq < 0.005) return;
    }

    onPointsChange([
      ...points,
      { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) },
    ]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const handlePointerLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div
      id="canvas-drawing-panel"
      className="relative flex flex-col h-full rounded-2xl bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-xs overflow-hidden min-h-0 shadow-[0_2px_16px_rgba(37,99,235,0.04)]"
    >
      {/* Top Floating Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-blue-100/80 bg-white/95 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 border border-blue-200 text-xs font-extrabold text-blue-700 font-['Outfit'] shadow-2xs">
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            <span>Grid [±{domainX}, ±{domainY}]</span>
          </div>

          <span className="text-xs text-neutral-600 font-mono font-bold bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200">
            {points.length} pts
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            id="btn-toggle-overlay"
            onClick={() => setShowFittedCurve(!showFittedCurve)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-['Outfit'] shadow-2xs ${
              showFittedCurve
                ? 'bg-blue-600 text-white shadow-blue-600/20 shadow-xs'
                : 'bg-white text-neutral-800 border border-neutral-300 hover:border-blue-300 hover:bg-blue-50/60'
            }`}
          >
            {showFittedCurve ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Overlay</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            id="btn-toggle-residuals"
            onClick={() => setShowResiduals(!showResiduals)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-['Outfit'] shadow-2xs ${
              showResiduals
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-white text-neutral-800 border border-neutral-300 hover:border-blue-300 hover:bg-blue-50/60'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Residuals</span>
          </motion.button>

          <div className="h-5 w-px bg-blue-200/80 mx-0.5 hidden sm:block" />

          {/* Zoom controls */}
          <button
            onClick={() => {
              setDomainX((d) => Math.max(4, d - 2));
              setDomainY((d) => Math.max(3, d - 1.5));
            }}
            title="Zoom In"
            className="p-1.5 sm:p-2 rounded-xl text-neutral-800 bg-white border border-neutral-300 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer shadow-2xs"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDomainX((d) => Math.min(16, d + 2));
              setDomainY((d) => Math.min(12, d + 1.5));
            }}
            title="Zoom Out"
            className="p-1.5 sm:p-2 rounded-xl text-neutral-800 bg-white border border-neutral-300 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer shadow-2xs"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-blue-200/80 mx-0.5 hidden sm:block" />

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Undo"
            className="p-1.5 sm:p-2 rounded-xl text-neutral-800 bg-white border border-neutral-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-30 transition cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            disabled={points.length === 0}
            title="Clear"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100 disabled:opacity-30 transition cursor-pointer shadow-2xs font-['Outfit']"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full min-h-[300px] cursor-crosshair select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="absolute inset-0 w-full h-full"
        />

        {/* Empty Canvas Guidance */}
        {points.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-3 shadow-2xs text-blue-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-neutral-950 font-['Outfit']">
              Draw Any Curve Freehand
            </h3>
            <p className="max-w-md mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              Sketch parabolic, harmonic, or linear strokes to recognize the exact mathematical equation.
            </p>
            <div className="flex items-center gap-3 mt-5 pointer-events-auto">
              <button
                onClick={() => onSelectPreset('parabola')}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-white border border-blue-200 text-neutral-800 hover:border-blue-600 hover:text-blue-600 shadow-2xs transition cursor-pointer"
              >
                Try Parabola
              </button>
              <button
                onClick={() => onSelectPreset('sine')}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-white border border-blue-200 text-neutral-800 hover:border-blue-600 hover:text-blue-600 shadow-2xs transition cursor-pointer"
              >
                Try Sine Wave
              </button>
            </div>
          </motion.div>
        )}

        {/* Coordinate HUD */}
        {hoverCoord && (
          <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-blue-200 shadow-xs text-xs font-mono text-neutral-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              x: <strong>{hoverCoord.x}</strong>, y: <strong>{hoverCoord.y}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
