import React, { useEffect, useRef } from 'react';

export const MilkRedHeroHeader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // HTML5 Physics Canvas Simulation in Milk-Blue & Cobalt
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes in milk-blue (blue-600 / sky-500) and slate/charcoal
    const nodeCount = Math.min(Math.floor((width * height) / 9500), 55);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      radius: Math.random() * 2.5 + 2,
      baseAlpha: Math.random() * 0.4 + 0.4,
      isBlue: Math.random() > 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw vector lines between nearby nodes using Distance Formula
      const maxDistance = 110;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.3;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // Milk-blue transparent connecting vectors
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Mouse interactive repulsion and connection
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          const force = (1 - mdist / mouse.radius) * 1.5;
          node.x -= (mdx / (mdist || 1)) * force;
          node.y -= (mdy / (mdist || 1)) * force;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - mdist / mouse.radius) * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Position update with wall bounce
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        if (node.isBlue) {
          ctx.fillStyle = `rgba(37, 99, 235, ${node.baseAlpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
        } else {
          ctx.fillStyle = `rgba(15, 23, 42, ${node.baseAlpha * 0.8})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section
      id="milk-blue-hero-header"
      className="relative overflow-hidden pt-6 pb-6 px-4 sm:px-6 lg:px-8 border-b border-blue-100 bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-white"
    >
      {/* Interactive Physics Canvas */}
      <div className="absolute inset-0 pointer-events-auto">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair opacity-80" />
      </div>

      {/* Milk-Blue Radial Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[240px] bg-gradient-to-tr from-blue-400/20 via-sky-200/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Foreground Content */}
      <div className="relative max-w-3xl mx-auto text-center pointer-events-none space-y-3">
        {/* Category Pill - Clean and fits safely inside white background */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl sm:rounded-full border border-blue-200/90 bg-white/95 text-neutral-900 text-xs font-semibold shadow-2xs backdrop-blur-md pointer-events-auto max-w-full">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
          <span className="font-extrabold text-neutral-950 font-['Outfit'] whitespace-nowrap">
            National Mathematics Festival 2026 • Class-10
          </span>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <span className="text-blue-700 font-mono font-semibold whitespace-nowrap">
            AI Pattern Recognition Exhibit
          </span>
        </div>

        {/* Hero Title: Omni Curve AI */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-950 leading-[1.1] font-['Outfit']">
          <span className="bg-gradient-to-r from-neutral-950 via-blue-950 to-neutral-900 bg-clip-text text-transparent">
            Omni Curve{' '}
          </span>
          <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        <p className="text-sm sm:text-base font-medium text-neutral-700 max-w-xl mx-auto leading-normal font-['Plus_Jakarta_Sans']">
          Real-Time Freehand Curve Recognition to Equation Engine
        </p>

        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed font-normal">
          Draw any continuous curve on the Cartesian grid below or pick a 1-click graph. The engine solves normal equations and non-linear least squares in real time.
        </p>
      </div>
    </section>
  );
};
