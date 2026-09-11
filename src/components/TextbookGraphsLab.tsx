import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MathView } from './MathView';
import { Point } from '../types';
import { PhysicsMultimediaSim } from './PhysicsMultimediaSim';
import {
  BookOpen,
  ArrowUpRight,
  Sliders,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  Info,
  Tv,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export interface TextbookGraphItem {
  id: string;
  name: string;
  category: 'kinematics' | 'energy' | 'fluids' | 'electricity' | 'waves' | 'thermal';
  categoryLabel: string;
  equationLatex: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xUnit: string;
  yUnit: string;
  slopeMeaning: string;
  slopeFormulaLatex: string;
  areaMeaning: string | null;
  areaFormulaLatex: string | null;
  description: string;
  curriculumTip: string;
  paramName: string;
  paramLabel: string;
  paramMin: number;
  paramMax: number;
  paramStep: number;
  defaultParam: number;
  paramUnit: string;
  presets: { label: string; value: number }[];
  simType: 'car' | 'spring' | 'shm' | 'piston' | 'circuit' | 'wave' | 'speaker' | 'cannon' | 'cooling' | 'water_tank';
  compute: (param: number) => {
    points: Point[];
    canvasPoints: Point[];
    domainX: [number, number];
    domainY: [number, number];
    evalY: (x: number) => number;
    evalSlope: (x: number) => number;
    evalArea?: (x: number) => number;
  };
}

export const TEXTBOOK_GRAPHS: TextbookGraphItem[] = [
  // 1. Distance–Time Graph (Parabolic s = ut + 1/2at^2)
  {
    id: 'distance-time',
    name: 'Distance–Time Graph',
    category: 'kinematics',
    categoryLabel: 'Kinematics & Motion',
    equationLatex: 's(t) = ut + \\frac{1}{2}at^2',
    xAxisLabel: 'Time (t)',
    yAxisLabel: 'Distance (s)',
    xUnit: 's',
    yUnit: 'm',
    slopeMeaning: 'Instantaneous Velocity (v = ds/dt)',
    slopeFormulaLatex: 'v = \\frac{ds}{dt} = u + at',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Shows how an object’s distance increases over time. Under constant acceleration, the graph is a smooth parabolic curve bending upward; its tangent slope at any instant equals the instantaneous velocity.',
    curriculumTip: 'Class-10 Key Concept: The steeper the slope of a distance–time graph, the greater the speed. A horizontal line means the body is at rest.',
    paramName: 'acceleration',
    paramLabel: 'Acceleration (a)',
    paramMin: 0,
    paramMax: 4.0,
    paramStep: 0.2,
    defaultParam: 1.5,
    paramUnit: 'm/s²',
    presets: [
      { label: 'Zero Accel (a=0)', value: 0 },
      { label: 'Gentle Cruise (a=1.0)', value: 1.0 },
      { label: 'High Sprint (a=3.0)', value: 3.0 },
    ],
    simType: 'car',
    compute: (a) => {
      const u = 2.0; // initial velocity 2 m/s
      const domainX: [number, number] = [0, 6.0];
      const maxS = u * 6.0 + 0.5 * a * 36.0;
      const domainY: [number, number] = [0, Math.max(15, Math.ceil(maxS * 1.1))];

      const evalY = (t: number) => u * t + 0.5 * a * t * t;
      const evalSlope = (t: number) => u + a * t;
      const evalArea = (t: number) => 0.5 * u * t * t + (1 / 6) * a * t * t * t;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let t = 0; t <= 6.0; t += 0.1) {
        const s = evalY(t);
        points.push({ x: Number(t.toFixed(2)), y: Number(s.toFixed(2)) });

        // Map cleanly to canvas [-6, 6] x [-4, 4]
        const cx = (t / 6.0) * 12 - 6;
        const cy = (s / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 2. Velocity–Time Graph (v = u + at)
  {
    id: 'velocity-time',
    name: 'Velocity–Time Graph',
    category: 'kinematics',
    categoryLabel: 'Kinematics & Motion',
    equationLatex: 'v(t) = u + at',
    xAxisLabel: 'Time (t)',
    yAxisLabel: 'Velocity (v)',
    xUnit: 's',
    yUnit: 'm/s',
    slopeMeaning: 'Acceleration (a = dv/dt)',
    slopeFormulaLatex: 'a = \\frac{dv}{dt} = \\text{Slope}',
    areaMeaning: 'Displacement / Distance Traveled (s)',
    areaFormulaLatex: 's = \\int_0^t v(t)\\,dt = ut + \\frac{1}{2}at^2',
    description: 'The gradient of a velocity–time graph gives acceleration, while the area enclosed between the curve and the time axis gives total displacement.',
    curriculumTip: 'Exam Favorite: Area under a v–t graph always equals distance. A downward sloping straight line represents uniform retardation / deceleration.',
    paramName: 'acceleration',
    paramLabel: 'Acceleration (a)',
    paramMin: -2.0,
    paramMax: 4.0,
    paramStep: 0.25,
    defaultParam: 1.5,
    paramUnit: 'm/s²',
    presets: [
      { label: 'Deceleration (a=-1.5)', value: -1.5 },
      { label: 'Constant Speed (a=0)', value: 0 },
      { label: 'Rapid Accel (a=3.0)', value: 3.0 },
    ],
    simType: 'car',
    compute: (a) => {
      const u = 3.0; // initial velocity 3 m/s
      const domainX: [number, number] = [0, 6.0];
      const v0 = u;
      const vEnd = u + a * 6.0;
      const minY = Math.min(0, Math.floor(Math.min(v0, vEnd)));
      const maxY = Math.max(12, Math.ceil(Math.max(v0, vEnd) * 1.15));
      const domainY: [number, number] = [minY, maxY];

      const evalY = (t: number) => u + a * t;
      const evalSlope = () => a;
      const evalArea = (t: number) => u * t + 0.5 * a * t * t;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let t = 0; t <= 6.0; t += 0.1) {
        const v = evalY(t);
        points.push({ x: Number(t.toFixed(2)), y: Number(v.toFixed(2)) });

        const cx = (t / 6.0) * 12 - 6;
        const cy = ((v - minY) / (maxY - minY || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 3. Acceleration–Time Graph
  {
    id: 'acceleration-time',
    name: 'Acceleration–Time Graph',
    category: 'kinematics',
    categoryLabel: 'Kinematics & Motion',
    equationLatex: 'a(t) = a_0 \\text{ (Constant Uniform)}',
    xAxisLabel: 'Time (t)',
    yAxisLabel: 'Acceleration (a)',
    xUnit: 's',
    yUnit: 'm/s²',
    slopeMeaning: 'Rate of Change of Acceleration (Jerk = 0)',
    slopeFormulaLatex: 'j = \\frac{da}{dt} = 0',
    areaMeaning: 'Change in Velocity (Δv)',
    areaFormulaLatex: '\\Delta v = \\int_0^t a(t)\\,dt = a_0 \\cdot t',
    description: 'For uniformly accelerated motion, the acceleration graph is a horizontal line. The rectangular area beneath it equals the change in velocity Δv.',
    curriculumTip: 'CBSE / ICSE Tip: The area under the acceleration–time graph gives the velocity change (v - u).',
    paramName: 'accMagnitude',
    paramLabel: 'Acceleration Value (a₀)',
    paramMin: 0.5,
    paramMax: 6.0,
    paramStep: 0.5,
    defaultParam: 2.5,
    paramUnit: 'm/s²',
    presets: [
      { label: 'Low (1.0 m/s²)', value: 1.0 },
      { label: 'Medium (2.5 m/s²)', value: 2.5 },
      { label: 'High (5.0 m/s²)', value: 5.0 },
    ],
    simType: 'car',
    compute: (a0) => {
      const domainX: [number, number] = [0, 6.0];
      const domainY: [number, number] = [0, 8.0];

      const evalY = () => a0;
      const evalSlope = () => 0;
      const evalArea = (t: number) => a0 * t;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let t = 0; t <= 6.0; t += 0.15) {
        points.push({ x: Number(t.toFixed(2)), y: a0 });
        const cx = (t / 6.0) * 12 - 6;
        const cy = (a0 / 8.0) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 4. Simple Harmonic Motion Displacement–Time (x = A cos ωt)
  {
    id: 'displacement-time',
    name: 'Displacement–Time (SHM)',
    category: 'kinematics',
    categoryLabel: 'Kinematics & Periodic Motion',
    equationLatex: 'x(t) = A \\cos(\\omega t)',
    xAxisLabel: 'Time (t)',
    yAxisLabel: 'Displacement (x)',
    xUnit: 's',
    yUnit: 'm',
    slopeMeaning: 'Instantaneous Velocity (v = dx/dt)',
    slopeFormulaLatex: 'v(t) = -A\\omega \\sin(\\omega t)',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Demonstrates Simple Harmonic Motion (oscillating pendulum or spring). Slope is zero at the extreme amplitudes (rest) and maximum as the body crosses equilibrium.',
    curriculumTip: 'At maximum displacement (crest/trough), velocity is zero. At x = 0 (equilibrium), velocity is at its absolute maximum.',
    paramName: 'frequency',
    paramLabel: 'Angular Frequency (ω)',
    paramMin: 0.5,
    paramMax: 3.0,
    paramStep: 0.25,
    defaultParam: 1.2,
    paramUnit: 'rad/s',
    presets: [
      { label: 'Slow Swing (ω=0.75)', value: 0.75 },
      { label: 'Standard (ω=1.2)', value: 1.2 },
      { label: 'Fast Oscillation (ω=2.5)', value: 2.5 },
    ],
    simType: 'shm',
    compute: (omega) => {
      const A = 3.0; // 3 meters amplitude
      const domainX: [number, number] = [0, 6.0];
      const domainY: [number, number] = [-3.8, 3.8];

      const evalY = (t: number) => A * Math.cos(omega * t);
      const evalSlope = (t: number) => -A * omega * Math.sin(omega * t);
      const evalArea = (t: number) => (A / omega) * Math.sin(omega * t);

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let t = 0; t <= 6.0; t += 0.08) {
        const x = evalY(t);
        points.push({ x: Number(t.toFixed(2)), y: Number(x.toFixed(2)) });
        const cx = (t / 6.0) * 12 - 6;
        const cy = (x / 3.8) * 3.8;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 5. Hooke’s Law: Force–Distance (F = kx)
  {
    id: 'force-distance',
    name: 'Force–Distance Graph (Hooke’s Law)',
    category: 'energy',
    categoryLabel: 'Energy & Elastic Mechanics',
    equationLatex: 'F(x) = k \\cdot x',
    xAxisLabel: 'Extension / Distance (x)',
    yAxisLabel: 'Restoring Force (F)',
    xUnit: 'm',
    yUnit: 'N',
    slopeMeaning: 'Spring Constant / Stiffness (k)',
    slopeFormulaLatex: 'k = \\frac{\\Delta F}{\\Delta x} = \\text{Slope}',
    areaMeaning: 'Elastic Potential Energy / Work Done (W)',
    areaFormulaLatex: 'W = \\int_0^x F\\,dx = \\frac{1}{2}kx^2',
    description: 'Hooke’s law shows direct proportionality between restoring force and spring elongation. The triangular area beneath represents stored elastic potential energy.',
    curriculumTip: 'Work done stretching a spring equals the area of the triangle: W = 1/2 * base * height = 1/2 * x * F = 1/2 k x².',
    paramName: 'springK',
    paramLabel: 'Spring Constant (k)',
    paramMin: 10,
    paramMax: 80,
    paramStep: 5,
    defaultParam: 35,
    paramUnit: 'N/m',
    presets: [
      { label: 'Soft Spring (k=15)', value: 15 },
      { label: 'Medium Coil (k=35)', value: 35 },
      { label: 'Stiff Spring (k=70)', value: 70 },
    ],
    simType: 'spring',
    compute: (k) => {
      const domainX: [number, number] = [0, 0.5]; // 0 to 50 cm
      const maxF = k * 0.5;
      const domainY: [number, number] = [0, Math.max(10, Math.ceil(maxF * 1.15))];

      const evalY = (x: number) => k * x;
      const evalSlope = () => k;
      const evalArea = (x: number) => 0.5 * k * x * x;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let x = 0; x <= 0.5; x += 0.01) {
        const F = evalY(x);
        points.push({ x: Number(x.toFixed(3)), y: Number(F.toFixed(2)) });
        const cx = (x / 0.5) * 12 - 6;
        const cy = (F / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 6. Work–Time Graph (W = P * t)
  {
    id: 'work-time',
    name: 'Work–Time Graph',
    category: 'energy',
    categoryLabel: 'Energy & Mechanics',
    equationLatex: 'W(t) = P \\cdot t',
    xAxisLabel: 'Time (t)',
    yAxisLabel: 'Work Done (W)',
    xUnit: 's',
    yUnit: 'J',
    slopeMeaning: 'Power Output (P = dW/dt in Watts)',
    slopeFormulaLatex: 'P = \\frac{dW}{dt} = \\text{Slope (Watts)}',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Work done increases linearly over time under steady power output. The slope directly yields the rate of energy transfer (Power in Joules/second or Watts).',
    curriculumTip: 'Power is the rate of doing work. 1 Watt = 1 Joule per second. A steeper line indicates an engine with higher horsepower/wattage.',
    paramName: 'power',
    paramLabel: 'Power Output (P)',
    paramMin: 10,
    paramMax: 100,
    paramStep: 5,
    defaultParam: 50,
    paramUnit: 'W',
    presets: [
      { label: 'Low Wattage (20 W)', value: 20 },
      { label: 'Standard Motor (50 W)', value: 50 },
      { label: 'High Power (90 W)', value: 90 },
    ],
    simType: 'circuit',
    compute: (P) => {
      const domainX: [number, number] = [0, 6.0];
      const maxW = P * 6.0;
      const domainY: [number, number] = [0, Math.ceil(maxW * 1.1)];

      const evalY = (t: number) => P * t;
      const evalSlope = () => P;
      const evalArea = (t: number) => 0.5 * P * t * t;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let t = 0; t <= 6.0; t += 0.1) {
        const W = evalY(t);
        points.push({ x: Number(t.toFixed(2)), y: Number(W.toFixed(1)) });
        const cx = (t / 6.0) * 12 - 6;
        const cy = (W / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 7. Boyle’s Law: Pressure–Volume (P = k/V)
  {
    id: 'pressure-volume',
    name: 'Boyle’s Law: Pressure–Volume (P–V)',
    category: 'fluids',
    categoryLabel: 'Fluids & Thermodynamics',
    equationLatex: 'P(V) = \\frac{k}{V} \\implies P \\propto \\frac{1}{V}',
    xAxisLabel: 'Volume (V)',
    yAxisLabel: 'Pressure (P)',
    xUnit: 'L',
    yUnit: 'kPa',
    slopeMeaning: 'Isothermal Compressibility Gradient',
    slopeFormulaLatex: '\\frac{dP}{dV} = -\\frac{k}{V^2}',
    areaMeaning: 'Thermodynamic Work Done (W)',
    areaFormulaLatex: 'W = \\int_{V_1}^{V_2} P\\,dV = k \\ln\\left(\\frac{V_2}{V_1}\\right)',
    description: 'Boyle’s Law: At constant temperature, pressure is inversely proportional to volume. Displays an exact rectangular hyperbola.',
    curriculumTip: 'As gas is compressed into half its volume, pressure doubles. The area under the P–V indicator diagram represents work done on/by the gas.',
    paramName: 'tempParam',
    paramLabel: 'Gas Product Constant (nRT)',
    paramMin: 12,
    paramMax: 60,
    paramStep: 4,
    defaultParam: 24,
    paramUnit: 'kPa·L',
    presets: [
      { label: 'Cold Gas (k=16)', value: 16 },
      { label: 'Room Gas (k=24)', value: 24 },
      { label: 'Hot Gas (k=48)', value: 48 },
    ],
    simType: 'piston',
    compute: (k) => {
      const domainX: [number, number] = [1.0, 6.5];
      const maxP = k / 1.0;
      const domainY: [number, number] = [0, Math.ceil(maxP * 1.15)];

      const evalY = (V: number) => k / Math.max(0.2, V);
      const evalSlope = (V: number) => -k / Math.max(0.04, V * V);
      const evalArea = (V: number) => k * Math.log(Math.max(1.0, V));

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let V = 1.0; V <= 6.5; V += 0.1) {
        const P = evalY(V);
        points.push({ x: Number(V.toFixed(2)), y: Number(P.toFixed(2)) });
        const cx = ((V - 1.0) / 5.5) * 12 - 6;
        const cy = (P / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea };
    },
  },

  // 8. Hydrostatic Pressure–Depth (P = P0 + ρgh)
  {
    id: 'pressure-depth',
    name: 'Hydrostatic Pressure–Depth Graph',
    category: 'fluids',
    categoryLabel: 'Fluids & Pressure',
    equationLatex: 'P(h) = P_0 + \\rho g h',
    xAxisLabel: 'Depth in Liquid (h)',
    yAxisLabel: 'Total Absolute Pressure (P)',
    xUnit: 'm',
    yUnit: 'kPa',
    slopeMeaning: 'Hydrostatic Pressure Gradient (ρg)',
    slopeFormulaLatex: '\\frac{dP}{dh} = \\rho g = \\text{Slope}',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Pressure increases linearly with liquid depth due to fluid weight. The vertical y-intercept represents atmospheric pressure P₀ at the surface.',
    curriculumTip: 'Water pressure increases by roughly 1 atmosphere (101.3 kPa) every 10 meters of depth.',
    paramName: 'density',
    paramLabel: 'Fluid Density (ρ)',
    paramMin: 800,
    paramMax: 1400,
    paramStep: 50,
    defaultParam: 1000,
    paramUnit: 'kg/m³',
    presets: [
      { label: 'Oil (800 kg/m³)', value: 800 },
      { label: 'Fresh Water (1000 kg/m³)', value: 1000 },
      { label: 'Dense Brine (1200 kg/m³)', value: 1200 },
    ],
    simType: 'water_tank',
    compute: (rho) => {
      const g = 9.8;
      const P0 = 101.3;
      const domainX: [number, number] = [0, 10.0];
      const maxP = P0 + (rho * g * 10.0) / 1000;
      const domainY: [number, number] = [80, Math.ceil(maxP * 1.1)];

      const evalY = (h: number) => P0 + (rho * g * h) / 1000;
      const evalSlope = () => (rho * g) / 1000;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let h = 0; h <= 10.0; h += 0.2) {
        const P = evalY(h);
        points.push({ x: Number(h.toFixed(2)), y: Number(P.toFixed(2)) });
        const cx = (h / 10.0) * 12 - 6;
        const cy = ((P - 80) / (domainY[1] - 80 || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },

  // 9. Ohm’s Law: Current–Voltage (I = V/R)
  {
    id: 'current-voltage',
    name: 'Ohm’s Law: Current–Voltage (I–V)',
    category: 'electricity',
    categoryLabel: 'Electricity & Circuits',
    equationLatex: 'I(V) = \\frac{1}{R}V \\text{ (Ohmic Conductor)}',
    xAxisLabel: 'Potential Difference (V)',
    yAxisLabel: 'Current (I)',
    xUnit: 'V',
    yUnit: 'A',
    slopeMeaning: 'Electrical Conductance (G = 1/R in Siemens)',
    slopeFormulaLatex: 'G = \\frac{dI}{dV} = \\frac{1}{R} = \\text{Slope}',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Shows the direct linear relationship between potential difference and current through an ohmic resistor at constant temperature.',
    curriculumTip: 'In an I–V graph, a steeper slope corresponds to LOWER resistance (higher conductance). In a V–I graph, slope equals resistance R.',
    paramName: 'resistance',
    paramLabel: 'Resistance (R)',
    paramMin: 1.0,
    paramMax: 10.0,
    paramStep: 0.5,
    defaultParam: 2.5,
    paramUnit: 'Ω',
    presets: [
      { label: 'Low R (1.5 Ω)', value: 1.5 },
      { label: 'Standard R (2.5 Ω)', value: 2.5 },
      { label: 'High R (6.0 Ω)', value: 6.0 },
    ],
    simType: 'circuit',
    compute: (R) => {
      const domainX: [number, number] = [0, 12.0];
      const maxI = 12.0 / R;
      const domainY: [number, number] = [0, Math.max(2.0, Math.ceil(maxI * 1.15))];

      const evalY = (V: number) => V / R;
      const evalSlope = () => 1 / R;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let V = 0; V <= 12.0; V += 0.2) {
        const I = evalY(V);
        points.push({ x: Number(V.toFixed(2)), y: Number(I.toFixed(2)) });
        const cx = (V / 12.0) * 12 - 6;
        const cy = (I / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },

  // 10. Mass–Volume Density (m = ρV)
  {
    id: 'mass-volume',
    name: 'Mass–Volume Graph (Density)',
    category: 'fluids',
    categoryLabel: 'Fluids & Material Properties',
    equationLatex: 'm(V) = \\rho \\cdot V',
    xAxisLabel: 'Volume (V)',
    yAxisLabel: 'Mass (m)',
    xUnit: 'cm³',
    yUnit: 'g',
    slopeMeaning: 'Physical Density (ρ)',
    slopeFormulaLatex: '\\rho = \\frac{\\Delta m}{\\Delta V} = \\text{Slope}',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Straight line passing through the origin. The gradient of the line provides the intrinsic density of the material substance.',
    curriculumTip: 'Pure water has a slope of 1.0 g/cm³. Any substance whose line is steeper than water sinks; flatter lines float!',
    paramName: 'densityG',
    paramLabel: 'Density (ρ)',
    paramMin: 0.8,
    paramMax: 10.5,
    paramStep: 0.3,
    defaultParam: 2.7,
    paramUnit: 'g/cm³',
    presets: [
      { label: 'Water (1.0 g/cm³)', value: 1.0 },
      { label: 'Aluminium (2.7 g/cm³)', value: 2.7 },
      { label: 'Copper (8.9 g/cm³)', value: 8.9 },
    ],
    simType: 'water_tank',
    compute: (rho) => {
      const domainX: [number, number] = [0, 50.0];
      const maxM = rho * 50.0;
      const domainY: [number, number] = [0, Math.ceil(maxM * 1.15)];

      const evalY = (V: number) => rho * V;
      const evalSlope = () => rho;

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let V = 0; V <= 50.0; V += 1.0) {
        const m = evalY(V);
        points.push({ x: Number(V.toFixed(1)), y: Number(m.toFixed(1)) });
        const cx = (V / 50.0) * 12 - 6;
        const cy = (m / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },

  // 11. Transverse Wave Displacement–Position (y = A sin(2πx/λ))
  {
    id: 'wave-displacement-position',
    name: 'Wave Displacement–Position Graph',
    category: 'waves',
    categoryLabel: 'Waves & Sound',
    equationLatex: 'y(x) = A \\sin\\left(\\frac{2\\pi}{\\lambda} x\\right)',
    xAxisLabel: 'Position along wave (x)',
    yAxisLabel: 'Particle Displacement (y)',
    xUnit: 'm',
    yUnit: 'cm',
    slopeMeaning: 'Wave Surface Gradient (dy/dx)',
    slopeFormulaLatex: '\\frac{dy}{dx} = \\frac{2\\pi A}{\\lambda}\\cos\\left(\\frac{2\\pi}{\\lambda} x\\right)',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Spatial snapshot of a transverse wave. Distance between adjacent crests represents wavelength (λ = 4.0m), and peak height gives amplitude A.',
    curriculumTip: 'Wavelength λ is the distance over which the wave’s shape repeats. Amplitude determines loudness (sound) or brightness (light).',
    paramName: 'amplitude',
    paramLabel: 'Amplitude (A)',
    paramMin: 0.5,
    paramMax: 4.0,
    paramStep: 0.5,
    defaultParam: 2.5,
    paramUnit: 'cm',
    presets: [
      { label: 'Gentle Ripple (1.0 cm)', value: 1.0 },
      { label: 'Standard (2.5 cm)', value: 2.5 },
      { label: 'High Surge (4.0 cm)', value: 4.0 },
    ],
    simType: 'wave',
    compute: (A) => {
      const lambda = 4.0;
      const domainX: [number, number] = [0, 8.0]; // exactly two full wave cycles
      const domainY: [number, number] = [-4.5, 4.5];

      const evalY = (x: number) => A * Math.sin(((2 * Math.PI) / lambda) * x);
      const evalSlope = (x: number) => ((2 * Math.PI * A) / lambda) * Math.cos(((2 * Math.PI) / lambda) * x);

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let x = 0; x <= 8.0; x += 0.08) {
        const y = evalY(x);
        points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
        const cx = (x / 8.0) * 12 - 6;
        const cy = (y / 4.5) * 4.0;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },

  // 12. Wave Frequency–Wavelength (f = v/λ)
  {
    id: 'frequency-wavelength',
    name: 'Frequency–Wavelength Graph',
    category: 'waves',
    categoryLabel: 'Waves & Sound',
    equationLatex: 'f(\\lambda) = \\frac{v}{\\lambda} \\implies f \\propto \\frac{1}{\\lambda}',
    xAxisLabel: 'Wavelength (λ)',
    yAxisLabel: 'Frequency (f)',
    xUnit: 'm',
    yUnit: 'Hz',
    slopeMeaning: 'Rate of Frequency Decay per Meter',
    slopeFormulaLatex: '\\frac{df}{d\\lambda} = -\\frac{v}{\\lambda^2}',
    areaMeaning: 'Wave Speed Constant (v = f · λ)',
    areaFormulaLatex: 'v = f \\cdot \\lambda = \\text{Medium Speed}',
    description: 'Demonstrates the universal wave speed formula v = fλ. When wave speed in a medium is constant, frequency and wavelength are inversely proportional.',
    curriculumTip: 'When sound passes from air into water, frequency stays constant, but wave speed and wavelength change!',
    paramName: 'waveSpeed',
    paramLabel: 'Wave Speed (v)',
    paramMin: 150,
    paramMax: 600,
    paramStep: 25,
    defaultParam: 340,
    paramUnit: 'm/s',
    presets: [
      { label: 'Slow Waves (200 m/s)', value: 200 },
      { label: 'Sound in Air (340 m/s)', value: 340 },
      { label: 'Fast Waves (500 m/s)', value: 500 },
    ],
    simType: 'speaker',
    compute: (v) => {
      const domainX: [number, number] = [0.5, 5.0];
      const maxF = v / 0.5;
      const domainY: [number, number] = [0, Math.ceil(maxF * 1.15)];

      const evalY = (lambda: number) => v / Math.max(0.1, lambda);
      const evalSlope = (lambda: number) => -v / Math.max(0.01, lambda * lambda);

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let lambda = 0.5; lambda <= 5.0; lambda += 0.08) {
        const f = evalY(lambda);
        points.push({ x: Number(lambda.toFixed(2)), y: Number(f.toFixed(1)) });
        const cx = ((lambda - 0.5) / 4.5) * 12 - 6;
        const cy = (f / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },

  // 13. Projectile Motion Trajectory (y = x tan θ - gx²/(2v₀² cos² θ))
  {
    id: 'projectile-motion',
    name: 'Projectile Motion Trajectory',
    category: 'kinematics',
    categoryLabel: 'Kinematics & Ballistics',
    equationLatex: 'y(x) = x\\tan\\theta - \\frac{g x^2}{2v_0^2\\cos^2\\theta}',
    xAxisLabel: 'Horizontal Distance (x)',
    yAxisLabel: 'Vertical Elevation (y)',
    xUnit: 'm',
    yUnit: 'm',
    slopeMeaning: 'Instantaneous Flight Angle (dy/dx)',
    slopeFormulaLatex: '\\tan\\phi = \\frac{dy}{dx} = \\tan\\theta - \\frac{gx}{v_0^2\\cos^2\\theta}',
    areaMeaning: null,
    areaFormulaLatex: null,
    description: 'Under uniform gravity, the trajectory of any launched projectile is a true inverted parabola. Peak height occurs when vertical velocity reaches zero.',
    curriculumTip: 'Maximum range on horizontal ground is achieved at a launch angle of 45°: R_max = v₀² / g.',
    paramName: 'initialSpeed',
    paramLabel: 'Launch Velocity (v₀ at 45°)',
    paramMin: 15,
    paramMax: 35,
    paramStep: 2,
    defaultParam: 22,
    paramUnit: 'm/s',
    presets: [
      { label: 'Short Range (16 m/s)', value: 16 },
      { label: 'Medium (22 m/s)', value: 22 },
      { label: 'Long Range (32 m/s)', value: 32 },
    ],
    simType: 'cannon',
    compute: (v0) => {
      const g = 9.8;
      const theta = Math.PI / 4; // 45 deg
      const range = (v0 * v0 * Math.sin(2 * theta)) / g;
      const maxHeight = (v0 * v0 * Math.sin(theta) * Math.sin(theta)) / (2 * g);

      const domainX: [number, number] = [0, Math.ceil(range * 1.05)];
      const domainY: [number, number] = [0, Math.ceil(maxHeight * 1.3)];

      const evalY = (x: number) => {
        const tanT = Math.tan(theta);
        const cosT = Math.cos(theta);
        const y = x * tanT - (g * x * x) / (2 * v0 * v0 * cosT * cosT);
        return Math.max(0, y);
      };

      const evalSlope = (x: number) => {
        const tanT = Math.tan(theta);
        const cosT = Math.cos(theta);
        return tanT - (g * x) / (v0 * v0 * cosT * cosT);
      };

      const points: Point[] = [];
      const canvasPoints: Point[] = [];

      for (let x = 0; x <= range; x += Math.max(0.2, range / 80)) {
        const y = evalY(x);
        points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
        const cx = (x / (domainX[1] || 1)) * 12 - 6;
        const cy = (y / (domainY[1] || 1)) * 8 - 4;
        canvasPoints.push({ x: Number(cx.toFixed(2)), y: Number(cy.toFixed(2)) });
      }

      return { points, canvasPoints, domainX, domainY, evalY, evalSlope };
    },
  },
];

interface TextbookGraphsLabProps {
  onLoadCurveToCanvas: (points: Point[], name: string) => void;
}

export const TextbookGraphsLab: React.FC<TextbookGraphsLabProps> = ({
  onLoadCurveToCanvas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGraphId, setSelectedGraphId] = useState<string>('distance-time');
  const [viewMode, setViewMode] = useState<'graph' | 'sim' | 'split'>('split');

  // Simulation play loop
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(1.5);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Interactive parameter state for each graph
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    TEXTBOOK_GRAPHS.forEach((g) => {
      initial[g.id] = g.defaultParam;
    });
    return initial;
  });

  const activeGraph = useMemo(() => {
    return TEXTBOOK_GRAPHS.find((g) => g.id === selectedGraphId) || TEXTBOOK_GRAPHS[0];
  }, [selectedGraphId]);

  const currentParamVal = paramValues[activeGraph.id] ?? activeGraph.defaultParam;

  // Filter graphs by category
  const filteredGraphs = useMemo(() => {
    if (selectedCategory === 'all') return TEXTBOOK_GRAPHS;
    return TEXTBOOK_GRAPHS.filter((g) => g.category === selectedCategory);
  }, [selectedCategory]);

  const { points: computedPoints, canvasPoints, domainX, domainY, evalY, evalSlope, evalArea } = useMemo(() => {
    return activeGraph.compute(currentParamVal);
  }, [activeGraph, currentParamVal]);

  // Animation frame ticker for physical simulation
  const lastTickRef = useRef<number>(performance.now());
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setSimTime((prev) => {
        const next = prev + dt * playbackSpeed;
        return next > 6.0 ? 0 : next;
      });

      animId = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  const handleParamChange = (val: number) => {
    setParamValues((prev) => ({
      ...prev,
      [activeGraph.id]: val,
    }));
  };

  const handleSendToRecognition = () => {
    onLoadCurveToCanvas(canvasPoints, activeGraph.name);
    const el = document.getElementById('canvas-workspace-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Synchronized cursor at current simTime
  const cursorX = Math.min(domainX[1], Math.max(domainX[0], domainX[0] + (simTime / 6.0) * (domainX[1] - domainX[0])));
  const cursorY = evalY ? evalY(cursorX) : computedPoints[0]?.y ?? 0;
  const cursorSlope = evalSlope ? evalSlope(cursorX) : 0;
  const cursorArea = evalArea ? evalArea(cursorX) : null;

  return (
    <section
      id="textbook-graphs-section"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-5 border-b border-blue-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2 font-['Outfit']">
            <BookOpen className="w-4 h-4" />
            <span>Class-10 Science & Physics Curriculum</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight font-['Outfit']">
            Textbook Mathematical & Physics Graph Suite
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mt-1.5 font-['Plus_Jakarta_Sans']">
            Accurate physical models with real-time gradient slope calculations, area integrals, interactive multimedia simulations, and 1-click loading into the AI curve recognition engine.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-blue-100 shadow-2xs">
          {[
            { id: 'all', label: `All (${TEXTBOOK_GRAPHS.length})` },
            { id: 'kinematics', label: 'Kinematics' },
            { id: 'energy', label: 'Energy' },
            { id: 'fluids', label: 'Fluids & Heat' },
            { id: 'electricity', label: 'Electricity' },
            { id: 'waves', label: 'Waves' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-['Outfit'] ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-950 hover:bg-blue-50/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scrollable Graph Selector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[640px] rounded-3xl bg-white/95 backdrop-blur-xl border border-blue-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-blue-100 bg-white flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-900 font-['Outfit']">
              Physics Library
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">
              {filteredGraphs.length} of {TEXTBOOK_GRAPHS.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {filteredGraphs.map((item) => {
              const isSelected = item.id === activeGraph.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedGraphId(item.id)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-50/90 to-white border-blue-500 ring-2 ring-blue-500/15 shadow-xs'
                      : 'bg-white border-blue-100/70 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-base font-bold text-neutral-950 font-['Outfit']">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold text-blue-600 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 shrink-0 font-['Outfit']">
                      {item.category}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-mono text-neutral-800 bg-blue-50/40 py-1.5 px-2.5 rounded-xl border border-blue-100 overflow-x-auto">
                    <MathView math={item.equationLatex} className="text-xs sm:text-sm text-neutral-900 font-bold" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stage & Analysis (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl bg-white/95 backdrop-blur-xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Header of Active Graph */}
          <div className="p-5 sm:p-6 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-['Outfit']">
                  {activeGraph.categoryLabel}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-950 font-['Outfit']">
                {activeGraph.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-blue-50/80 border border-blue-200 text-xs font-bold text-neutral-700 font-['Outfit']">
                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'graph' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'hover:text-neutral-950'
                  }`}
                  title="Precision Analytical Cartesian Graph"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Graph</span>
                </button>
                <button
                  onClick={() => setViewMode('sim')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'sim' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'hover:text-neutral-950'
                  }`}
                  title="Animated Multimedia Physical Simulation"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Simulation</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'split' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'hover:text-neutral-950'
                  }`}
                  title="Synchronized Graph + Physics View"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
              </div>

              {/* Load to Recognition Canvas Button */}
              <button
                onClick={handleSendToRecognition}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition cursor-pointer font-['Outfit'] shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Test in AI Canvas</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Stage */}
          <div className="p-4 sm:p-6 border-b border-blue-100 bg-white space-y-4">
            {/* View Mode Rendering */}
            <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Analytical Graph Plot */}
              {(viewMode === 'graph' || viewMode === 'split') && (
                <div className="relative p-3 rounded-2xl bg-gradient-to-b from-blue-50/20 to-white border border-blue-100 flex flex-col items-center justify-center min-h-[310px] overflow-hidden">
                  {/* Top & Bottom Badges */}
                  <div className="w-full flex items-center justify-between text-xs font-bold px-2 py-1">
                    <span className="text-blue-700 font-mono">
                      Y-Axis: <strong className="text-neutral-950">{activeGraph.yAxisLabel}</strong> [{activeGraph.yUnit}]
                    </span>
                    <span className="text-blue-700 font-mono">
                      X-Axis: <strong className="text-neutral-950">{activeGraph.xAxisLabel}</strong> [{activeGraph.xUnit}]
                    </span>
                  </div>

                  {/* SVG Plot */}
                  <svg
                    viewBox="0 0 580 270"
                    className="w-full h-full max-h-[290px] select-none"
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                      </linearGradient>
                      <marker
                        id="axArrow"
                        markerWidth="7"
                        markerHeight="7"
                        refX="5"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 7 3.5, 0 7" fill="#2563EB" />
                      </marker>
                    </defs>

                    {/* Background Grid Lines */}
                    {[50, 95, 140, 185, 230].map((y) => (
                      <line
                        key={`gy-${y}`}
                        x1="65"
                        y1={y}
                        x2="540"
                        y2={y}
                        stroke="rgba(37, 99, 235, 0.08)"
                        strokeDasharray="3 3"
                      />
                    ))}
                    {[65, 144, 223, 302, 381, 460, 540].map((x) => (
                      <line
                        key={`gx-${x}`}
                        x1={x}
                        y1="40"
                        x2={x}
                        y2="230"
                        stroke="rgba(37, 99, 235, 0.08)"
                        strokeDasharray="3 3"
                      />
                    ))}

                    {/* Y-Axis Line */}
                    <line
                      x1="65"
                      y1="230"
                      x2="65"
                      y2="30"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      markerEnd="url(#axArrow)"
                    />
                    {/* X-Axis Line */}
                    <line
                      x1="60"
                      y1="230"
                      x2="550"
                      y2="230"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      markerEnd="url(#axArrow)"
                    />

                    {/* X-Axis Numeric Ticks */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const frac = i / 4;
                      const val = domainX[0] + frac * (domainX[1] - domainX[0]);
                      const px = 65 + frac * 475;
                      return (
                        <g key={`xt-${i}`}>
                          <line x1={px} y1="230" x2={px} y2="236" stroke="#2563EB" strokeWidth="1.5" />
                          <text
                            x={px}
                            y="250"
                            textAnchor="middle"
                            className="text-[10px] font-bold font-mono fill-neutral-600"
                          >
                            {Number(val.toFixed(1))}
                          </text>
                        </g>
                      );
                    })}

                    {/* Y-Axis Numeric Ticks */}
                    {[0, 1, 2, 3].map((i) => {
                      const frac = i / 3;
                      const val = domainY[0] + frac * (domainY[1] - domainY[0]);
                      const py = 230 - frac * 180;
                      return (
                        <g key={`yt-${i}`}>
                          <line x1="59" y1={py} x2="65" y2={py} stroke="#2563EB" strokeWidth="1.5" />
                          <text
                            x={54}
                            y={py + 3.5}
                            textAnchor="end"
                            className="text-[10px] font-bold font-mono fill-neutral-600"
                          >
                            {Number(val.toFixed(1))}
                          </text>
                        </g>
                      );
                    })}

                    {/* Accurate Mathematical Curve */}
                    {(() => {
                      if (computedPoints.length === 0) return null;
                      const minX = domainX[0];
                      const maxX = domainX[1];
                      const minY = domainY[0];
                      const maxY = domainY[1];
                      const rangeX = maxX - minX || 1;
                      const rangeY = maxY - minY || 1;

                      // Exact SVG coordinate mapping (x: 65 to 540, y: 230 to 50)
                      const svgCoords = computedPoints.map((pt) => {
                        const sx = 65 + ((pt.x - minX) / rangeX) * 475;
                        const sy = 230 - ((pt.y - minY) / rangeY) * 180;
                        return { sx, sy };
                      });

                      const pathData = svgCoords.reduce((acc, curr, i) => {
                        return i === 0 ? `M ${curr.sx},${curr.sy}` : `${acc} L ${curr.sx},${curr.sy}`;
                      }, '');

                      // Synchronized cursor coordinates
                      const curSx = 65 + ((cursorX - minX) / rangeX) * 475;
                      const curSy = 230 - ((cursorY - minY) / rangeY) * 180;

                      // Integral Shading up to cursor
                      const areaSubCoords = svgCoords.filter((c) => c.sx <= curSx);
                      const areaData =
                        areaSubCoords.length > 1
                          ? `${areaSubCoords.reduce((acc, curr, i) => (i === 0 ? `M ${curr.sx},${curr.sy}` : `${acc} L ${curr.sx},${curr.sy}`), '')} L ${curSx},230 L ${areaSubCoords[0].sx},230 Z`
                          : '';

                      return (
                        <>
                          {/* Shaded Area */}
                          {activeGraph.areaMeaning && areaData && (
                            <path d={areaData} fill="url(#areaGrad)" />
                          )}

                          {/* Main Stroke */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="drop-shadow(0 2px 5px rgba(37, 99, 235, 0.25))"
                          />

                          {/* Tangent Line at Cursor */}
                          {evalSlope && (
                            <line
                              x1={Math.max(65, curSx - 40)}
                              y1={curSy + 40 * (cursorSlope / (rangeY / rangeX))}
                              x2={Math.min(540, curSx + 40)}
                              y2={curSy - 40 * (cursorSlope / (rangeY / rangeX))}
                              stroke="#DC2626"
                              strokeWidth="2"
                              strokeDasharray="4 3"
                            />
                          )}

                          {/* Cursor Marker Node */}
                          <circle
                            cx={curSx}
                            cy={curSy}
                            r="6"
                            fill="#2563EB"
                            stroke="#FFFFFF"
                            strokeWidth="3"
                            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Real-time Telemetry Tag underneath graph */}
                  <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white border border-blue-100 text-xs font-mono shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-bold">POINT:</span>
                      <span className="text-blue-700 font-bold">
                        ({cursorX.toFixed(2)}{activeGraph.xUnit}, {cursorY.toFixed(2)}{activeGraph.yUnit})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-bold">SLOPE dy/dx:</span>
                      <span className="text-emerald-700 font-bold">
                        {cursorSlope.toFixed(2)} {activeGraph.yUnit}/{activeGraph.xUnit}
                      </span>
                    </div>
                    {cursorArea !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500 font-bold">AREA ∫y dx:</span>
                        <span className="text-purple-700 font-bold">
                          {cursorArea.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Multimedia Physical Simulation */}
              {(viewMode === 'sim' || viewMode === 'split') && (
                <PhysicsMultimediaSim
                  graph={activeGraph}
                  currentParam={currentParamVal}
                  simTime={simTime}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  onTimeChange={(t) => setSimTime(t)}
                  onTogglePlay={() => setIsPlaying((p) => !p)}
                  onResetTime={() => setSimTime(0)}
                  onSpeedChange={(s) => setPlaybackSpeed(s)}
                />
              )}
            </div>

            {/* Presets & Parameter Controls Bar */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
              {/* Presets */}
              {activeGraph.presets && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-['Outfit']">
                    Curriculum Presets:
                  </span>
                  {activeGraph.presets.map((pst) => (
                    <button
                      key={pst.label}
                      onClick={() => handleParamChange(pst.value)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer font-['Outfit'] ${
                        currentParamVal === pst.value
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-neutral-700 hover:bg-blue-100/70 border border-blue-200/80'
                      }`}
                    >
                      {pst.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-neutral-950 font-['Outfit']">
                    {activeGraph.paramLabel}:
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-700 px-2.5 py-0.5 bg-white rounded-lg border border-blue-200 shadow-2xs">
                    {currentParamVal} {activeGraph.paramUnit}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <span className="text-xs text-neutral-500 font-mono font-bold">
                    {activeGraph.paramMin}
                  </span>
                  <input
                    type="range"
                    min={activeGraph.paramMin}
                    max={activeGraph.paramMax}
                    step={activeGraph.paramStep}
                    value={currentParamVal}
                    onChange={(e) => handleParamChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                  />
                  <span className="text-xs text-neutral-500 font-mono font-bold">
                    {activeGraph.paramMax}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Insights & Formula Cards */}
          <div className="p-5 sm:p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slope & Gradient Meaning */}
            <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider font-['Outfit']">
                <Activity className="w-4 h-4" />
                <span>Slope Meaning & Derivation</span>
              </div>
              <p className="text-sm font-bold text-neutral-950">
                {activeGraph.slopeMeaning}
              </p>
              <div className="p-2 rounded-xl bg-white border border-blue-100 font-mono text-xs">
                <MathView math={activeGraph.slopeFormulaLatex} className="text-neutral-900 font-bold" />
              </div>
            </div>

            {/* Area Under Curve Meaning */}
            <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider font-['Outfit']">
                <Layers className="w-4 h-4" />
                <span>Area Under Curve Meaning</span>
              </div>
              <p className="text-sm font-bold text-neutral-950">
                {activeGraph.areaMeaning || 'No direct physical dimension for area'}
              </p>
              {activeGraph.areaFormulaLatex && (
                <div className="p-2 rounded-xl bg-white border border-blue-100 font-mono text-xs">
                  <MathView math={activeGraph.areaFormulaLatex} className="text-neutral-900 font-bold" />
                </div>
              )}
            </div>

            {/* Class-10 Curriculum Exam Tip */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 font-['Outfit']">
                  Curriculum Exam Insight
                </span>
                <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                  {activeGraph.curriculumTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
