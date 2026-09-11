import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  coordLabel: string;
}

export const PhysicsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates tracking
    let mouse = {
      x: -1000,
      y: -1000,
      radius: 140, // Repulsion influence radius
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Generate floating coordinate particles
    const particleCount = Math.min(45, Math.floor((width * height) / 28000));
    const particles: Particle[] = [];

    const sampleCoordLabels = [
      '(x, y)',
      'f(x)',
      '(0, 0)',
      '(x₁, y₁)',
      '∇J(θ)',
      'R²',
      'dy/dx',
      'e^x',
      'sin(x)',
      'x²',
      '(x₂, y₂)',
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 2,
        coordLabel: sampleCoordLabels[i % sampleCoordLabels.length],
      });
    }

    const CONNECTION_DIST = 110;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse physics: repulsion and cursor connection
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouse.radius && distMouse > 0) {
          // Repulsive force
          const force = (mouse.radius - distMouse) / mouse.radius;
          const angle = Math.atan2(dyMouse, dxMouse);
          p.x -= Math.cos(angle) * force * 3;
          p.y -= Math.sin(angle) * force * 3;

          // Connect particle directly to cursor
          const alphaMouse = (1 - distMouse / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alphaMouse})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235, 0.45)';
        ctx.fill();

        // Optional tiny coordinate label
        if (i % 3 === 0) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
          ctx.fillText(p.coordLabel, p.x + 5, p.y - 5);
        }

        // Connect nearby nodes using Pythagoras Distance Formula
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DIST) {
            const alpha = (1 - distance / CONNECTION_DIST) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft radial blurred blob in center background for subtle milk-blue glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[350px] bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Physics Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75"
      />
    </div>
  );
};
