import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge, Compass, Zap } from 'lucide-react';
import { TextbookGraphItem } from './TextbookGraphsLab';

interface PhysicsMultimediaSimProps {
  graph: TextbookGraphItem;
  currentParam: number;
  simTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onResetTime: () => void;
  onSpeedChange: (speed: number) => void;
}

export const PhysicsMultimediaSim: React.FC<PhysicsMultimediaSimProps> = ({
  graph,
  currentParam,
  simTime,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onTogglePlay,
  onResetTime,
  onSpeedChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Stop sound when unmounted or audio disabled
  const stopAudio = useCallback(() => {
    if (oscNodeRef.current) {
      try {
        oscNodeRef.current.stop();
        oscNodeRef.current.disconnect();
      } catch {
        // already stopped
      }
      oscNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      gainNodeRef.current = null;
    }
  }, []);

  // Web Audio Tone Synthesizer for wave/frequency graphs
  useEffect(() => {
    if (!audioEnabled) {
      stopAudio();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let freq = 260;
      if (graph.id === 'frequency-wavelength') {
        freq = Math.max(120, Math.min(880, currentParam));
      } else if (graph.id === 'wave-displacement-position') {
        freq = 220 + currentParam * 40;
      }

      if (!oscNodeRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime); // gentle volume
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscNodeRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        oscNodeRef.current.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      }
    } catch {
      // audio error safely suppressed
    }

    return () => {
      stopAudio();
    };
  }, [audioEnabled, currentParam, graph.id, stopAudio]);

  // Turn off audio on graph change
  useEffect(() => {
    setAudioEnabled(false);
    stopAudio();
  }, [graph.id, stopAudio]);

  // Animated gas particles state for Boyle's law
  const gasParticlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number }>>([]);
  if (gasParticlesRef.current.length === 0) {
    gasParticlesRef.current = Array.from({ length: 36 }, () => ({
      x: 30 + Math.random() * 200,
      y: 40 + Math.random() * 140,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }));
  }

  // Circuit electrons for Ohm's law
  const electronsRef = useRef<number[]>([]);
  if (electronsRef.current.length === 0) {
    electronsRef.current = Array.from({ length: 24 }, (_, i) => i / 24);
  }

  // HTML5 Canvas Rendering for Physics Simulations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 320);

    ctx.clearRect(0, 0, width, height);

    // Common Background - subtle high tech physics lab style
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0F172A'); // Deep slate
    bgGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid background
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // -------------------------------------------------------------
    // 1. KINEMATICS (Car Motion: distance-time, velocity-time, acceleration-time)
    // -------------------------------------------------------------
    if (graph.simType === 'car') {
      const a = currentParam;
      const u = 2.0;
      const t = simTime;
      const currentS = u * t + 0.5 * a * t * t;
      const currentV = Math.max(0, u + a * t);

      // Track Road (ground from y=190 to 290)
      const roadY = 220;
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, roadY, width, 80);

      // Grass/shoulder
      ctx.fillStyle = '#0F766E';
      ctx.fillRect(0, roadY - 8, width, 8);
      ctx.fillStyle = '#115E59';
      ctx.fillRect(0, roadY + 80, width, height - (roadY + 80));

      // Road markings (animated based on current distance)
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 20]);
      ctx.lineDashOffset = -(currentS * 15) % 45;
      ctx.beginPath();
      ctx.moveTo(0, roadY + 40);
      ctx.lineTo(width, roadY + 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance markers on roadside
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px monospace';
      for (let mark = 0; mark <= 10; mark++) {
        const markX = ((mark * 80 - (currentS * 15)) % (width + 100) + width + 100) % (width + 100) - 50;
        ctx.fillRect(markX, roadY - 18, 4, 10);
        ctx.fillText(`${(mark * 10).toFixed(0)}m`, markX - 10, roadY - 22);
      }

      // Draw Vehicle (Sports Car)
      const carX = Math.min(width - 140, Math.max(60, 80 + (currentS / 60) * (width - 240)));
      const carY = roadY - 26;

      // Exhaust particles when accelerating
      if (a > 0.3) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        for (let p = 0; p < 4; p++) {
          const px = carX - 10 - p * 12 - (t * 20) % 15;
          const py = carY + 16 + (Math.sin(t * 10 + p) * 4);
          ctx.beginPath();
          ctx.arc(px, py, 3 + p * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(carX + 45, carY + 30, 55, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Car Body
      const carGrad = ctx.createLinearGradient(carX, carY, carX + 90, carY + 25);
      carGrad.addColorStop(0, '#2563EB');
      carGrad.addColorStop(0.5, '#3B82F6');
      carGrad.addColorStop(1, '#1D4ED8');
      ctx.fillStyle = carGrad;

      ctx.beginPath();
      ctx.roundRect(carX, carY + 8, 90, 20, 6);
      ctx.fill();

      // Cabin / windshield
      ctx.fillStyle = '#93C5FD';
      ctx.beginPath();
      ctx.moveTo(carX + 22, carY + 8);
      ctx.lineTo(carX + 38, carY - 6);
      ctx.lineTo(carX + 68, carY - 6);
      ctx.lineTo(carX + 78, carY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Headlight & glow
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.roundRect(carX + 86, carY + 12, 6, 8, 2);
      ctx.fill();

      const beamGrad = ctx.createLinearGradient(carX + 92, carY + 16, carX + 180, carY + 16);
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(carX + 92, carY + 14);
      ctx.lineTo(carX + 190, carY - 5);
      ctx.lineTo(carX + 190, carY + 35);
      ctx.lineTo(carX + 92, carY + 22);
      ctx.closePath();
      ctx.fill();

      // Wheels with rotation
      const wheelAngle = (currentS * 4) % (Math.PI * 2);
      [carX + 20, carX + 72].forEach((wx) => {
        const wy = carY + 28;
        // Rubber Tire
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(wx, wy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Rim
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(wx, wy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Spokes
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(wheelAngle) * 8, wy + Math.sin(wheelAngle) * 8);
        ctx.lineTo(wx - Math.cos(wheelAngle) * 8, wy - Math.sin(wheelAngle) * 8);
        ctx.moveTo(wx + Math.cos(wheelAngle + Math.PI / 2) * 8, wy + Math.sin(wheelAngle + Math.PI / 2) * 8);
        ctx.lineTo(wx - Math.cos(wheelAngle + Math.PI / 2) * 8, wy - Math.sin(wheelAngle + Math.PI / 2) * 8);
        ctx.stroke();
      });

      // HUD Gauges (Speedometer & Accelerometer)
      // Speedometer
      const speedDialX = 85;
      const speedDialY = 75;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(speedDialX, speedDialY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Speed ticks
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) {
        const ang = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
        const x1 = speedDialX + Math.cos(ang) * 36;
        const y1 = speedDialY + Math.sin(ang) * 36;
        const x2 = speedDialX + Math.cos(ang) * 42;
        const y2 = speedDialY + Math.sin(ang) * 42;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Needle
      const maxV = 25;
      const needleRatio = Math.min(1, currentV / maxV);
      const needleAngle = Math.PI * 0.75 + needleRatio * Math.PI * 1.5;
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(speedDialX, speedDialY);
      ctx.lineTo(speedDialX + Math.cos(needleAngle) * 34, speedDialY + Math.sin(needleAngle) * 34);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(speedDialX, speedDialY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Digital speed readout
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentV.toFixed(1)} m/s`, speedDialX, speedDialY + 22);
      ctx.fillStyle = '#93C5FD';
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillText('VELOCITY (v)', speedDialX, speedDialY + 34);

      // Distance & Acceleration Stats Panel
      const panelX = width - 180;
      const panelY = 30;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, 155, 95, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillStyle = '#93C5FD';
      ctx.fillText('TELEMETRY HUD', panelX + 12, panelY + 20);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(`Time (t):   ${t.toFixed(2)} s`, panelX + 12, panelY + 40);
      ctx.fillText(`Distance:   ${currentS.toFixed(1)} m`, panelX + 12, panelY + 58);
      ctx.fillText(`Accel (a):  ${a.toFixed(2)} m/s²`, panelX + 12, panelY + 76);
      ctx.fillText(`Velocity:   ${currentV.toFixed(1)} m/s`, panelX + 12, panelY + 94);
    }

    // -------------------------------------------------------------
    // 2. HOOKE'S LAW / SPRING (force-distance)
    // -------------------------------------------------------------
    else if (graph.simType === 'spring') {
      const k = currentParam;
      const maxExt = 0.5; // meters
      // Let extension oscillate or vary with simTime
      const xExt = (Math.sin(simTime * 2) * 0.5 + 0.5) * maxExt;
      const restoringForce = k * xExt;

      const standX = width / 2 - 40;
      const topY = 40;

      // Stand support
      ctx.fillStyle = '#64748B';
      ctx.fillRect(standX - 80, topY - 10, 160, 10);
      ctx.fillRect(standX, topY, 10, 240);
      ctx.fillRect(standX - 60, topY + 240, 120, 15);

      // Cantilever arm
      ctx.fillRect(standX, topY + 15, 90, 8);

      // Spring attachment point
      const attachX = standX + 75;
      const attachY = topY + 23;

      // Unstretched length is 70px, stretched length adds xExt * 200px
      const springLength = 70 + (xExt / maxExt) * 110;
      const coils = 12;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(attachX, attachY);

      for (let i = 0; i <= coils; i++) {
        const segY = attachY + (i / coils) * springLength;
        const offsetX = i === 0 || i === coils ? 0 : (i % 2 === 0 ? -14 : 14);
        ctx.lineTo(attachX + offsetX, segY);
      }
      ctx.stroke();

      // Hanging Mass Block
      const massY = attachY + springLength;
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(attachX - 20, massY, 40, 35, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${(k * 0.2).toFixed(1)}kg`, attachX, massY + 22);

      // Force Vector Arrows
      // Restoring Force Arrow (Pointing Up)
      const arrowLen = (restoringForce / 40) * 50;
      if (arrowLen > 5) {
        ctx.strokeStyle = '#10B981';
        ctx.fillStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(attachX + 35, massY + 18);
        ctx.lineTo(attachX + 35, massY + 18 - arrowLen);
        ctx.stroke();
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(attachX + 35, massY + 18 - arrowLen - 6);
        ctx.lineTo(attachX + 30, massY + 18 - arrowLen);
        ctx.lineTo(attachX + 40, massY + 18 - arrowLen);
        ctx.fill();

        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillText(`Fs = ${restoringForce.toFixed(1)}N`, attachX + 78, massY + 18 - arrowLen / 2);
      }

      // Measurement Ruler
      const rulerX = standX + 135;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.fillRect(rulerX, attachY, 20, 180);
      ctx.strokeStyle = '#854D0E';
      ctx.lineWidth = 1;
      for (let r = 0; r <= 18; r++) {
        const ry = attachY + r * 10;
        ctx.beginPath();
        ctx.moveTo(rulerX, ry);
        ctx.lineTo(rulerX + (r % 5 === 0 ? 14 : 7), ry);
        ctx.stroke();
      }
      ctx.fillStyle = '#000000';
      ctx.font = '9px monospace';
      ctx.fillText('0', rulerX + 14, attachY + 10);
      ctx.fillText('50cm', rulerX + 2, attachY + 180);

      // Info Tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(25, 30, 170, 85, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText("HOOKE'S LAW STATE", 35, 50);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '11px monospace';
      ctx.fillText(`Spring k:   ${k} N/m`, 35, 70);
      ctx.fillText(`Ext (x):    ${(xExt * 100).toFixed(1)} cm`, 35, 88);
      ctx.fillText(`Force (F):  ${restoringForce.toFixed(1)} N`, 35, 104);
    }

    // -------------------------------------------------------------
    // 3. SHM (displacement-time)
    // -------------------------------------------------------------
    else if (graph.simType === 'shm') {
      const omega = currentParam;
      const A = 3.0; // amplitude
      const t = simTime;
      const xVal = A * Math.cos(omega * t);

      // Pendulum pivot
      const pivotX = width / 2;
      const pivotY = 50;
      const armLength = 160;

      // Max angular deflection theta0 ~ 35 deg = 0.6 rad
      const theta = (xVal / A) * 0.6;
      const bobX = pivotX + Math.sin(theta) * armLength;
      const bobY = pivotY + Math.cos(theta) * armLength;

      // Pivot base
      ctx.fillStyle = '#64748B';
      ctx.fillRect(pivotX - 50, pivotY - 12, 100, 12);
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // String line
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Oscillating Bob (Sphere with shiny gradient)
      const bobGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
      bobGrad.addColorStop(0, '#60A5FA');
      bobGrad.addColorStop(0.7, '#2563EB');
      bobGrad.addColorStop(1, '#1E3A8A');
      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#93C5FD';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Equilibrium dashed line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + armLength + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Real-time displacement arc / vector
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, armLength, Math.PI / 2, Math.PI / 2 + theta, theta < 0);
      ctx.stroke();

      // HUD overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(30, 30, 180, 85, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText('HARMONIC OSCILLATOR', 40, 50);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '11px monospace';
      ctx.fillText(`Freq (ω):    ${omega.toFixed(2)} rad/s`, 40, 70);
      ctx.fillText(`Time (t):    ${t.toFixed(2)} s`, 40, 88);
      ctx.fillText(`Displ x(t):  ${xVal.toFixed(2)} m`, 40, 104);
    }

    // -------------------------------------------------------------
    // 4. BOYLE'S LAW P-V (pressure-volume)
    // -------------------------------------------------------------
    else if (graph.simType === 'piston') {
      const kVal = currentParam;
      // Let volume be scrubbed or oscillate between 1.5L and 6.5L
      const V = 1.5 + (Math.sin(simTime * 1.5) * 0.5 + 0.5) * 4.5;
      const P = kVal / V;

      const cylX = width / 2 - 130;
      const cylY = 45;
      const cylW = 260;
      const cylH = 210;

      // Cylinder Walls (Glass)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(cylX, cylY, cylW, cylH);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 6;
      ctx.strokeRect(cylX, cylY, cylW, cylH);

      // Piston Position: V from 1.5 to 6.5 maps to pistonY from 70 to 190
      const pistonY = cylY + 20 + ((V - 1.5) / 5.0) * (cylH - 60);

      // Piston Head
      const pGrad = ctx.createLinearGradient(cylX, pistonY, cylX + cylW, pistonY);
      pGrad.addColorStop(0, '#475569');
      pGrad.addColorStop(0.5, '#94A3B8');
      pGrad.addColorStop(1, '#475569');
      ctx.fillStyle = pGrad;
      ctx.fillRect(cylX + 4, pistonY, cylW - 8, 22);

      // Piston Rod
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(cylX + cylW / 2 - 12, 10, 24, pistonY);

      // Bouncing Gas Molecules inside chamber (from cylY to pistonY)
      const chamberHeight = pistonY - cylY;
      ctx.fillStyle = '#38BDF8';
      gasParticlesRef.current.forEach((mol) => {
        // Molecule speed scales with pressure/temperature
        const speedMult = Math.min(3, 1 + P / 20);
        mol.x += mol.vx * speedMult;
        mol.y += mol.vy * speedMult;

        // Bounce horizontally
        if (mol.x < cylX + 12 || mol.x > cylX + cylW - 12) mol.vx *= -1;
        // Bounce vertically between top wall and movable piston!
        if (mol.y < cylY + 8) {
          mol.y = cylY + 8;
          mol.vy *= -1;
        }
        if (mol.y > pistonY - 8) {
          mol.y = pistonY - 8;
          mol.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(mol.x, mol.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pressure Gauge
      const gaugeX = cylX + cylW + 55;
      const gaugeY = 110;
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Needle according to Pressure P
      const pRatio = Math.min(1, P / 40);
      const needleAng = Math.PI * 0.75 + pRatio * Math.PI * 1.5;
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeY);
      ctx.lineTo(gaugeX + Math.cos(needleAng) * 28, gaugeY + Math.sin(needleAng) * 28);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${P.toFixed(1)} kPa`, gaugeX, gaugeY + 16);
      ctx.fillStyle = '#93C5FD';
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillText('PRESSURE', gaugeX, gaugeY + 28);

      // HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(25, 30, 160, 85, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText("BOYLE'S LAW CHAMBER", 35, 50);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '11px monospace';
      ctx.fillText(`Volume (V): ${V.toFixed(2)} L`, 35, 70);
      ctx.fillText(`Press (P):  ${P.toFixed(1)} kPa`, 35, 88);
      ctx.fillText(`P·V Const:  ${kVal} J`, 35, 104);
    }

    // -------------------------------------------------------------
    // 5. OHM'S LAW CIRCUIT (current-voltage)
    // -------------------------------------------------------------
    else if (graph.simType === 'circuit') {
      const R = currentParam;
      // Voltage variable
      const V = 2.0 + (Math.sin(simTime * 1.5) * 0.5 + 0.5) * 10.0;
      const I = V / R; // Amperes

      const cLeft = 100;
      const cRight = width - 120;
      const cTop = 70;
      const cBottom = 230;

      // Circuit Wire Loop
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 5;
      ctx.strokeRect(cLeft, cTop, cRight - cLeft, cBottom - cTop);

      // Battery on Left Wire
      const batY = (cTop + cBottom) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(cLeft - 10, batY - 25, 20, 50);
      // Long line (+), short line (-)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cLeft - 18, batY - 15);
      ctx.lineTo(cLeft + 18, batY - 15);
      ctx.stroke();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cLeft - 10, batY + 15);
      ctx.lineTo(cLeft + 10, batY + 15);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('+', cLeft - 30, batY - 12);
      ctx.fillStyle = '#3B82F6';
      ctx.fillText('-', cLeft - 30, batY + 20);

      // Resistor on Bottom Wire
      const resX = (cLeft + cRight) / 2;
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.roundRect(resX - 40, cBottom - 14, 80, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Color bands
      ['#DC2626', '#F59E0B', '#10B981'].forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(resX - 25 + idx * 18, cBottom - 14, 6, 28);
      });
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${R.toFixed(1)}Ω`, resX, cBottom + 30);

      // Light Bulb on Top Wire
      const bulbX = (cLeft + cRight) / 2;
      const bulbY = cTop;

      // Dynamic Bulb Glow based on electrical power P = I * V
      const power = I * V;
      const glowRadius = Math.min(80, 20 + power * 1.5);
      const glow = ctx.createRadialGradient(bulbX, bulbY, 4, bulbX, bulbY, glowRadius);
      glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      glow.addColorStop(0.5, 'rgba(251, 191, 36, 0.45)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glass bulb shell
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bulbX, bulbY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Animated electron charges drifting around the wire loop
      const perimeter = 2 * (cRight - cLeft + cBottom - cTop);
      const driftSpeed = I * 120; // px/sec
      ctx.fillStyle = '#38BDF8';

      electronsRef.current.forEach((ratio, idx) => {
        const totalDist = (ratio * perimeter + simTime * driftSpeed) % perimeter;
        let ex = 0;
        let ey = 0;
        const wSeg = cRight - cLeft;
        const hSeg = cBottom - cTop;

        if (totalDist < wSeg) {
          // Top wire (left to right)
          ex = cLeft + totalDist;
          ey = cTop;
        } else if (totalDist < wSeg + hSeg) {
          // Right wire (top to bottom)
          ex = cRight;
          ey = cTop + (totalDist - wSeg);
        } else if (totalDist < 2 * wSeg + hSeg) {
          // Bottom wire (right to left)
          ex = cRight - (totalDist - (wSeg + hSeg));
          ey = cBottom;
        } else {
          // Left wire (bottom to top)
          ex = cLeft;
          ey = cBottom - (totalDist - (2 * wSeg + hSeg));
        }

        ctx.beginPath();
        ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Multimeter Display
      const meterX = cRight + 20;
      const meterY = 80;
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(meterX, meterY, 110, 120, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22C55E';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${I.toFixed(2)} A`, meterX + 55, meterY + 40);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillText('CURRENT (I)', meterX + 55, meterY + 55);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`${V.toFixed(1)} V`, meterX + 55, meterY + 85);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px Outfit, sans-serif';
      ctx.fillText('VOLTAGE (V)', meterX + 55, meterY + 100);
    }

    // -------------------------------------------------------------
    // 6. TRANSVERSE WAVE (wave-displacement-position)
    // -------------------------------------------------------------
    else if (graph.simType === 'wave') {
      const A = currentParam; // Amplitude in cm
      const lambda = 4.0; // Wavelength in meters
      const t = simTime;
      const waveSpeed = 2.0;

      const waterY = 170;
      const ampScale = 14; // pixels per cm

      // Wave Surface
      ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, waterY);

      for (let px = 0; px <= width; px += 4) {
        // Physical x in meters
        const physX = (px / width) * 8.0;
        const py = waterY - A * Math.sin(((2 * Math.PI) / lambda) * physX - t * waveSpeed * 2.5) * ampScale;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Wave Crest line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let px = 0; px <= width; px += 4) {
        const physX = (px / width) * 8.0;
        const py = waterY - A * Math.sin(((2 * Math.PI) / lambda) * physX - t * waveSpeed * 2.5) * ampScale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Floating Buoys on wave crests
      [width * 0.25, width * 0.55, width * 0.85].forEach((bx) => {
        const physX = (bx / width) * 8.0;
        const by = waterY - A * Math.sin(((2 * Math.PI) / lambda) * physX - t * waveSpeed * 2.5) * ampScale;

        // Bobber
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by - 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Flag mast
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by - 8);
        ctx.lineTo(bx, by - 24);
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(bx, by - 24);
        ctx.lineTo(bx + 12, by - 18);
        ctx.lineTo(bx, by - 12);
        ctx.fill();
      });

      // Wavelength dimension bar
      const waveBarY = 60;
      const lambdaPx = (lambda / 8.0) * width;
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, waveBarY);
      ctx.lineTo(width * 0.2 + lambdaPx, waveBarY);
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Wavelength (λ) = ${lambda.toFixed(1)} m`, width * 0.2 + lambdaPx / 2, waveBarY - 8);

      // Amplitude dimension
      ctx.strokeStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(width * 0.08, waterY - A * ampScale);
      ctx.lineTo(width * 0.08, waterY + A * ampScale);
      ctx.stroke();
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'left';
      ctx.fillText(`Peak-to-Peak 2A = ${(A * 2).toFixed(1)} cm`, width * 0.08 + 8, waterY + 4);
    }

    // -------------------------------------------------------------
    // 7. FREQUENCY & SOUND (frequency-wavelength)
    // -------------------------------------------------------------
    else if (graph.simType === 'speaker') {
      const v = currentParam; // speed of sound
      const lambda = 2.0;
      const f = v / lambda;

      // Subwoofer Cone on left
      const spkX = 90;
      const spkY = height / 2;
      const coneVib = Math.sin(simTime * (f / 30)) * 10;

      ctx.fillStyle = '#1E293B';
      ctx.fillRect(20, spkY - 90, 70, 180);

      // Moving Cone
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(spkX + coneVib, spkY - 60);
      ctx.lineTo(spkX + 45 + coneVib, spkY - 80);
      ctx.lineTo(spkX + 45 + coneVib, spkY + 80);
      ctx.lineTo(spkX + coneVib, spkY + 60);
      ctx.closePath();
      ctx.fill();

      // Speaker Center Cap
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(spkX + 20 + coneVib, spkY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Pressure wave fronts radiating rightwards
      const waveSpacing = Math.max(30, (lambda / 5) * 120);
      for (let i = 0; i < 8; i++) {
        const frontX = spkX + 70 + ((i * waveSpacing + simTime * 140) % (width - spkX));
        const alpha = Math.max(0, 1 - (frontX - spkX) / (width - spkX));

        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(spkX + 40, spkY, frontX - spkX, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
      }

      // HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 200, 30, 175, 95, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillText('ACOUSTIC METRICS', width - 190, 50);
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '11px monospace';
      ctx.fillText(`Wave Speed:  ${v} m/s`, width - 190, 70);
      ctx.fillText(`Wavelength:  ${lambda.toFixed(2)} m`, width - 190, 88);
      ctx.fillText(`Frequency:   ${f.toFixed(1)} Hz`, width - 190, 106);
    }

    // -------------------------------------------------------------
    // 8. PROJECTILE MOTION (cannonball trajectory)
    // -------------------------------------------------------------
    else if (graph.simType === 'cannon') {
      const v0 = currentParam;
      const g = 9.8;
      const theta = Math.PI / 4; // 45 deg
      const totalFlightTime = (2 * v0 * Math.sin(theta)) / g;
      const currentT = (simTime * 0.8) % (totalFlightTime + 0.5);

      const groundY = 240;
      const originX = 60;

      // Ground
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Cannon
      ctx.save();
      ctx.translate(originX, groundY - 10);
      ctx.rotate(-theta);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, -10, 45, 20);
      ctx.restore();

      // Cannon Wheel
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(originX, groundY - 10, 14, 0, Math.PI * 2);
      ctx.fill();

      // Parabolic Arc Path
      const range = (v0 * v0 * Math.sin(2 * theta)) / g;
      const scaleX = (width - 140) / Math.max(10, range);
      const scaleY = scaleX;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let tStep = 0; tStep <= totalFlightTime; tStep += 0.05) {
        const px = originX + v0 * Math.cos(theta) * tStep * scaleX;
        const py = groundY - 10 - (v0 * Math.sin(theta) * tStep - 0.5 * g * tStep * tStep) * scaleY;
        if (tStep === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Cannonball position
      if (currentT <= totalFlightTime) {
        const ballX = originX + v0 * Math.cos(theta) * currentT * scaleX;
        const ballY = groundY - 10 - (v0 * Math.sin(theta) * currentT - 0.5 * g * currentT * currentT) * scaleY;

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Distance marker
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Max Range: ${range.toFixed(1)} m`, originX + (range * scaleX) / 2, groundY + 25);
    }

    // -------------------------------------------------------------
    // Default fallback simulation
    // -------------------------------------------------------------
    else {
      ctx.fillStyle = '#93C5FD';
      ctx.font = '14px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live Dynamic Parameter Visualizer Active', width / 2, height / 2);
    }
  }, [graph, currentParam, simTime]);

  return (
    <div className="flex flex-col rounded-2xl bg-slate-900 border border-blue-500/30 overflow-hidden shadow-xl">
      {/* Simulation Header Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-['Outfit']">
            Multimedia Physical Simulation Lab
          </span>
          <span className="text-[11px] font-mono font-bold text-blue-400 px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800">
            {graph.categoryLabel}
          </span>
        </div>

        {/* Audio Synthesizer toggle for sound/wave curves */}
        {(graph.simType === 'speaker' || graph.simType === 'wave') && (
          <button
            onClick={() => setAudioEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer font-['Outfit'] ${
              audioEnabled
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Tone Generator Playing' : 'Listen to Wave Tone'}</span>
          </button>
        )}
      </div>

      {/* Interactive Simulation Stage Canvas */}
      <div className="relative w-full h-[320px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block select-none" />
      </div>

      {/* Multimedia Playback Controls Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play / Pause / Reset buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={onTogglePlay}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onResetTime}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 cursor-pointer"
            title="Reset Time to Zero"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-mono font-bold text-slate-300">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  playbackSpeed === spd ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Scrub Time Slider */}
        <div className="flex items-center gap-3 w-full sm:flex-1 max-w-md">
          <span className="text-xs font-mono text-slate-400 shrink-0">t = 0s</span>
          <input
            type="range"
            min={0}
            max={6}
            step={0.05}
            value={simTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <span className="text-xs font-mono font-bold text-blue-400 shrink-0 px-2 py-1 rounded-md bg-blue-950 border border-blue-900">
            {simTime.toFixed(2)}s
          </span>
        </div>
      </div>
    </div>
  );
};
