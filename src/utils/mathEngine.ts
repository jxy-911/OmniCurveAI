import { Point, RegressionResult, ModelType } from '../types';

/**
 * Solves system of linear equations A * x = b using Gauss-Jordan elimination with partial pivoting.
 */
export function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  // Augmented matrix
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Search for maximum pivot in column i
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxVal) {
        maxVal = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      return null; // Singular matrix
    }

    // Swap maximum row with current row
    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
    }

    // Normalize pivot row
    const pivot = M[i][i];
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Calculates R², MSE, and RMSE for a given model evaluation function against actual points.
 */
export function calculateFitMetrics(
  points: Point[],
  evaluate: (x: number) => number
): { r2: number; mse: number; rmse: number } {
  if (points.length < 2) {
    return { r2: 0, mse: 0, rmse: 0 };
  }

  const n = points.length;
  const yMean = points.reduce((acc, p) => acc + p.y, 0) / n;

  let ssTot = 0;
  let ssRes = 0;

  for (const p of points) {
    const yPred = evaluate(p.x);
    const err = p.y - yPred;
    ssRes += err * err;
    const diffMean = p.y - yMean;
    ssTot += diffMean * diffMean;
  }

  const mse = ssRes / n;
  const rmse = Math.sqrt(mse);

  let r2 = 0;
  if (ssTot > 1e-9) {
    const rawR2 = 1 - ssRes / ssTot;
    r2 = Math.max(0, Math.min(1, rawR2)) * 100;
  } else {
    // If y is almost constant
    r2 = mse < 0.1 ? 95 : 0;
  }

  return {
    r2: Number(r2.toFixed(2)),
    mse: Number(mse.toFixed(4)),
    rmse: Number(rmse.toFixed(4)),
  };
}

/**
 * Helper to clean and format floating point coefficients.
 */
function fmt(val: number, decimals: number = 2): string {
  if (Math.abs(val) < 1e-6) return '0';
  return val.toFixed(decimals);
}

/**
 * 1. Linear Regression: f(x) = mx + c
 */
export function fitLinear(points: Point[]): RegressionResult {
  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  let m = 0;
  let c = sumY / Math.max(1, n);

  if (Math.abs(denom) > 1e-9) {
    m = (n * sumXY - sumX * sumY) / denom;
    c = (sumY - m * sumX) / n;
  }

  const evaluate = (x: number) => m * x + c;
  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signC = c >= 0 ? '+' : '-';
  const absC = Math.abs(c);
  const formulaLatex = `f(x) = ${fmt(m)}x ${signC} ${fmt(absC)}`;
  const formulaPlain = `f(x) = ${fmt(m)}*x ${signC} ${fmt(absC)}`;
  const desmosString = `y = ${fmt(m)}x ${signC} ${fmt(absC)}`;

  return {
    modelType: 'linear',
    name: 'Linear Model',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { m, c },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'First-order polynomial describing constant rate of change and direct proportionality.',
    color: '#D90429',
    matrixFormulaLatex: '\\begin{bmatrix} m \\\\ c \\end{bmatrix} = (X^T X)^{-1} X^T Y',
  };
}

/**
 * 2. Quadratic Regression (Parabola): f(x) = ax² + bx + c
 */
export function fitQuadratic(points: Point[]): RegressionResult {
  const n = points.length;
  // Matrix for degree 2: powers sum from 0 to 4
  const powers = [0, 0, 0, 0, 0];
  const bVec = [0, 0, 0];

  for (const p of points) {
    let xp = 1;
    for (let i = 0; i <= 4; i++) {
      powers[i] += xp;
      xp *= p.x;
    }
    bVec[0] += p.y * p.x * p.x; // sum(y * x^2)
    bVec[1] += p.y * p.x;       // sum(y * x)
    bVec[2] += p.y;             // sum(y)
  }

  const A = [
    [powers[4], powers[3], powers[2]],
    [powers[3], powers[2], powers[1]],
    [powers[2], powers[1], powers[0]],
  ];

  const solution = solveLinearSystem(A, bVec);
  const a = solution ? solution[0] : 0;
  const b = solution ? solution[1] : 0;
  const c = solution ? solution[2] : 0;

  const evaluate = (x: number) => a * x * x + b * x + c;
  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signB = b >= 0 ? '+' : '-';
  const signC = c >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = ${fmt(a)}x^2 ${signB} ${fmt(Math.abs(b))}x ${signC} ${fmt(Math.abs(c))}`;
  const formulaPlain = `f(x) = ${fmt(a)}*x^2 ${signB} ${fmt(Math.abs(b))}*x ${signC} ${fmt(Math.abs(c))}`;
  const desmosString = `y = ${fmt(a)}x^2 ${signB} ${fmt(Math.abs(b))}x ${signC} ${fmt(Math.abs(c))}`;

  return {
    modelType: 'quadratic',
    name: 'Quadratic Parabola',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, b, c },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Second-order curve describing accelerated motion, projectile paths, and parabolic focal mirrors.',
    color: '#FF4D6D',
    matrixFormulaLatex: '\\begin{bmatrix} a \\\\ b \\\\ c \\end{bmatrix} = \\left( X^T X \\right)^{-1} X^T Y',
  };
}

/**
 * 3. Cubic Regression: f(x) = ax³ + bx² + cx + d
 */
export function fitCubic(points: Point[]): RegressionResult {
  // Powers sum from 0 to 6
  const powers = [0, 0, 0, 0, 0, 0, 0];
  const bVec = [0, 0, 0, 0];

  for (const p of points) {
    let xp = 1;
    for (let i = 0; i <= 6; i++) {
      powers[i] += xp;
      xp *= p.x;
    }
    bVec[0] += p.y * p.x * p.x * p.x;
    bVec[1] += p.y * p.x * p.x;
    bVec[2] += p.y * p.x;
    bVec[3] += p.y;
  }

  const A = [
    [powers[6], powers[5], powers[4], powers[3]],
    [powers[5], powers[4], powers[3], powers[2]],
    [powers[4], powers[3], powers[2], powers[1]],
    [powers[3], powers[2], powers[1], powers[0]],
  ];

  const solution = solveLinearSystem(A, bVec);
  const a = solution ? solution[0] : 0;
  const b = solution ? solution[1] : 0;
  const c = solution ? solution[2] : 0;
  const d = solution ? solution[3] : 0;

  const evaluate = (x: number) => a * x * x * x + b * x * x + c * x + d;
  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signB = b >= 0 ? '+' : '-';
  const signC = c >= 0 ? '+' : '-';
  const signD = d >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = ${fmt(a)}x^3 ${signB} ${fmt(Math.abs(b))}x^2 ${signC} ${fmt(Math.abs(c))}x ${signD} ${fmt(Math.abs(d))}`;
  const formulaPlain = `f(x) = ${fmt(a)}*x^3 ${signB} ${fmt(Math.abs(b))}*x^2 ${signC} ${fmt(Math.abs(c))}*x ${signD} ${fmt(Math.abs(d))}`;
  const desmosString = `y = ${fmt(a)}x^3 ${signB} ${fmt(Math.abs(b))}x^2 ${signC} ${fmt(Math.abs(c))}x ${signD} ${fmt(Math.abs(d))}`;

  return {
    modelType: 'cubic',
    name: 'Cubic Curve',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, b, c, d },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Third-order polynomial featuring inflection points, S-curves, and transitional curvature.',
    color: '#800020',
    matrixFormulaLatex: '\\theta = \\left( X^T X \\right)^{-1} X^T Y \\quad [4\\times 4\\text{ Vandermonde}]',
  };
}

/**
 * 4. Exponential Regression: f(x) = a * e^(bx)
 */
export function fitExponential(points: Point[]): RegressionResult {
  // Check if points can be transformed via logarithm
  const minY = Math.min(...points.map((p) => p.y));
  let yOffset = 0;
  if (minY <= 0) {
    yOffset = Math.abs(minY) + 0.5;
  }

  // Linearize: ln(y + yOffset) = ln(a) + b * x
  const transformedPoints: Point[] = points.map((p) => ({
    x: p.x,
    y: Math.log(Math.max(1e-5, p.y + yOffset)),
  }));

  const linear = fitLinear(transformedPoints);
  const b = Math.max(-3, Math.min(3, linear.parameters.m));
  const aRaw = Math.exp(linear.parameters.c);
  const a = Math.max(1e-4, Math.min(50, aRaw));

  // Evaluate with offset subtracted back
  const evaluate = (x: number) => {
    const val = a * Math.exp(b * x) - yOffset;
    if (isNaN(val) || !isFinite(val)) return 0;
    return val;
  };

  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signOffset = yOffset > 0 ? ` - ${fmt(yOffset)}` : '';
  const formulaLatex = `f(x) = ${fmt(a)} \\cdot e^{${fmt(b)}x}${signOffset}`;
  const formulaPlain = `f(x) = ${fmt(a)} * exp(${fmt(b)}*x)${signOffset}`;
  const desmosString = `y = ${fmt(a)}e^{${fmt(b)}x}${signOffset}`;

  return {
    modelType: 'exponential',
    name: 'Exponential Model',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, b, offset: yOffset },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Models compound expansion, radioactive decay, population growth, and neural activation gradients.',
    color: '#C9184A',
    matrixFormulaLatex: '\\ln(y) = \\ln(a) + b x \\implies \\text{Linearized Normal Equations}',
  };
}

/**
 * 5. Sine Wave Regression: f(x) = a * sin(bx + c) + d
 */
export function fitSine(points: Point[]): RegressionResult {
  if (points.length < 3) {
    const evaluate = (_x: number) => 0;
    return {
      modelType: 'sine',
      name: 'Harmonic Sine Wave',
      formulaLatex: 'f(x) = 0',
      formulaPlain: 'f(x) = 0',
      desmosString: 'y = 0',
      parameters: { a: 0, b: 0, c: 0, d: 0 },
      evaluate,
      r2: 0,
      mse: 0,
      rmse: 0,
      description: 'Periodic trigonometric oscillation capturing cyclic waveforms and audio frequencies.',
      color: '#5C061C',
      matrixFormulaLatex: 'f(x) = a \\sin(bx + c) + d',
    };
  }

  // 1. Initial estimates
  const yVals = points.map((p) => p.y);
  const minY = Math.min(...yVals);
  const maxY = Math.max(...yVals);
  const initialA = Math.max(0.2, (maxY - minY) / 2);
  const initialD = (maxY + minY) / 2;

  // Approximate frequency b from zero-crossings or peak intervals
  const sorted = [...points].sort((p1, p2) => p1.x - p2.x);
  const xSpan = sorted[sorted.length - 1].x - sorted[0].x;

  let bestA = initialA;
  let bestB = 1.0;
  let bestC = 0.0;
  let bestD = initialD;
  let bestMSE = Infinity;

  // Grid search over reasonable frequency and phase candidates
  const bCandidates = [0.3, 0.5, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.14 / Math.max(1, xSpan / 2)];
  const cCandidates = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2];

  for (const bCand of bCandidates) {
    for (const cCand of cCandidates) {
      let curMSE = 0;
      for (const p of points) {
        const yPred = initialA * Math.sin(bCand * p.x + cCand) + initialD;
        const err = p.y - yPred;
        curMSE += err * err;
      }
      if (curMSE < bestMSE) {
        bestMSE = curMSE;
        bestB = bCand;
        bestC = cCand;
      }
    }
  }

  // Refine a, b, c, d with localized coordinate descent
  let a = bestA;
  let b = bestB;
  let c = bestC;
  let d = bestD;

  const iterations = 15;
  let lr = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    let gradA = 0;
    let gradB = 0;
    let gradC = 0;
    let gradD = 0;

    for (const p of points) {
      const angle = b * p.x + c;
      const sinVal = Math.sin(angle);
      const cosVal = Math.cos(angle);
      const pred = a * sinVal + d;
      const err = pred - p.y;

      gradA += err * sinVal;
      gradB += err * a * p.x * cosVal;
      gradC += err * a * cosVal;
      gradD += err;
    }

    const n = points.length;
    a -= (lr * gradA) / n;
    b -= (lr * gradB) / (n * 2);
    c -= (lr * gradC) / n;
    d -= (lr * gradD) / n;
  }

  const evaluate = (x: number) => a * Math.sin(b * x + c) + d;
  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signC = c >= 0 ? '+' : '-';
  const signD = d >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = ${fmt(a)} \\sin(${fmt(b)}x ${signC} ${fmt(Math.abs(c))}) ${signD} ${fmt(Math.abs(d))}`;
  const formulaPlain = `f(x) = ${fmt(a)}*sin(${fmt(b)}*x ${signC} ${fmt(Math.abs(c))}) ${signD} ${fmt(Math.abs(d))}`;
  const desmosString = `y = ${fmt(a)}\\sin(${fmt(b)}x ${signC} ${fmt(Math.abs(c))}) ${signD} ${fmt(Math.abs(d))}`;

  return {
    modelType: 'sine',
    name: 'Sine Harmonic',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, b, c, d },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Harmonic trigonometric wave describing cyclical oscillations, AC signals, and audio harmonics.',
    color: '#5C061C',
    matrixFormulaLatex: 'f(x) = a \\sin(bx + c) + d \\implies \\text{Non-Linear Least Squares Optimization}',
  };
}

/**
 * 6. Logarithmic Regression: f(x) = a * ln(x + xShift) + b
 */
export function fitLogarithmic(points: Point[]): RegressionResult {
  if (points.length < 2) {
    return fitLinear(points);
  }

  const minX = Math.min(...points.map((p) => p.x));
  let xShift = 0;
  if (minX <= 0) {
    xShift = Math.abs(minX) + 0.8;
  }

  // Linearize: y = a * ln(x + xShift) + b
  const transformedPoints: Point[] = points.map((p) => ({
    x: Math.log(Math.max(1e-4, p.x + xShift)),
    y: p.y,
  }));

  const linear = fitLinear(transformedPoints);
  const a = linear.parameters.m;
  const b = linear.parameters.c;

  const evaluate = (x: number) => {
    const arg = x + xShift;
    if (arg <= 0) return b;
    return a * Math.log(arg) + b;
  };

  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signShift = xShift > 0 ? ` + ${fmt(xShift)}` : '';
  const signB = b >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = ${fmt(a)} \\ln(x${signShift}) ${signB} ${fmt(Math.abs(b))}`;
  const formulaPlain = `f(x) = ${fmt(a)}*ln(x${signShift}) ${signB} ${fmt(Math.abs(b))}`;
  const desmosString = `y = ${fmt(a)}\\ln(x${signShift}) ${signB} ${fmt(Math.abs(b))}`;

  return {
    modelType: 'logarithmic',
    name: 'Logarithmic Curve',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, b, xShift },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Decelerating growth curve modeling sensory perception (Weber-Fechner), sound decibels, and pH scales.',
    color: '#9333EA',
    matrixFormulaLatex: 'y = a \\ln(x + x_0) + b \\implies \\text{Logarithmic Basis Transform}',
  };
}

/**
 * 7. Inverse / Rational Regression: f(x) = a / (x + xShift) + c
 */
export function fitInverse(points: Point[]): RegressionResult {
  if (points.length < 2) {
    return fitLinear(points);
  }

  const minX = Math.min(...points.map((p) => p.x));
  let xShift = 0;
  if (minX <= 0) {
    xShift = Math.abs(minX) + 1.0;
  }

  // Linearize: y = a * (1 / (x + xShift)) + c
  const transformedPoints: Point[] = points.map((p) => ({
    x: 1 / Math.max(1e-3, p.x + xShift),
    y: p.y,
  }));

  const linear = fitLinear(transformedPoints);
  const a = linear.parameters.m;
  const c = linear.parameters.c;

  const evaluate = (x: number) => {
    const denom = x + xShift;
    if (Math.abs(denom) < 1e-3) return c;
    return a / denom + c;
  };

  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signShift = xShift > 0 ? ` + ${fmt(xShift)}` : '';
  const signC = c >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = \\frac{${fmt(a)}}{x${signShift}} ${signC} ${fmt(Math.abs(c))}`;
  const formulaPlain = `f(x) = ${fmt(a)}/(x${signShift}) ${signC} ${fmt(Math.abs(c))}`;
  const desmosString = `y = \\frac{${fmt(a)}}{x${signShift}} ${signC} ${fmt(Math.abs(c))}`;

  return {
    modelType: 'inverse',
    name: 'Inverse Hyperbola',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, c, xShift },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Inversely proportional relationship modeling Boyle’s law (P ∝ 1/V), frequency-wavelength, and gravitational fields.',
    color: '#0284C7',
    matrixFormulaLatex: 'y = \\frac{a}{x + x_0} + c \\implies \\text{Hyperbolic Transform}',
  };
}

/**
 * 8. Gaussian Bell Curve: f(x) = a * exp(-(x - mu)^2 / (2 * sigma^2)) + d
 */
export function fitGaussian(points: Point[]): RegressionResult {
  if (points.length < 3) {
    return fitLinear(points);
  }

  const yVals = points.map((p) => p.y);
  const maxY = Math.max(...yVals);
  const minY = Math.min(...yVals);
  const d = minY;
  const a = Math.max(0.2, maxY - minY);

  // Peak location estimate
  const maxPt = points.reduce((prev, curr) => (curr.y > prev.y ? curr : prev), points[0]);
  const mu = maxPt.x;

  // Approximate variance sigma from points where y > d + a/2
  const halfPeakPts = points.filter((p) => p.y >= d + a * 0.4);
  let sigma = 1.5;
  if (halfPeakPts.length >= 2) {
    const xDist = Math.max(...halfPeakPts.map((p) => p.x)) - Math.min(...halfPeakPts.map((p) => p.x));
    sigma = Math.max(0.5, xDist / 2.355);
  }

  const evaluate = (x: number) => {
    const diff = x - mu;
    return a * Math.exp(-(diff * diff) / (2 * sigma * sigma)) + d;
  };

  const { r2, mse, rmse } = calculateFitMetrics(points, evaluate);

  const signMu = mu >= 0 ? `- ${fmt(mu)}` : `+ ${fmt(Math.abs(mu))}`;
  const signD = d >= 0 ? '+' : '-';
  const formulaLatex = `f(x) = ${fmt(a)} e^{-\\frac{(x ${signMu})^2}{${fmt(2 * sigma * sigma)}}} ${signD} ${fmt(Math.abs(d))}`;
  const formulaPlain = `f(x) = ${fmt(a)} * exp(-(x ${signMu})^2 / ${fmt(2 * sigma * sigma)}) ${signD} ${fmt(Math.abs(d))}`;
  const desmosString = `y = ${fmt(a)}e^{-\\frac{(x ${signMu})^2}{${fmt(2 * sigma * sigma)}}} ${signD} ${fmt(Math.abs(d))}`;

  return {
    modelType: 'gaussian',
    name: 'Gaussian Distribution',
    formulaLatex,
    formulaPlain,
    desmosString,
    parameters: { a, mu, sigma, d },
    evaluate,
    r2,
    mse,
    rmse,
    description: 'Normal probability distribution governing measurement noise, natural variance, and statistical bell curves.',
    color: '#059669',
    matrixFormulaLatex: 'f(x) = a e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}} + d',
  };
}

/**
 * Runs all mathematical models in parallel, scores them, and assigns ranking.
 */
export function runMultiModelRegression(points: Point[]): {
  allModels: RegressionResult[];
  bestFit: RegressionResult;
} {
  if (points.length < 2) {
    const dummy = fitLinear([
      { x: -2, y: -2 },
      { x: 2, y: 2 },
    ]);
    return { allModels: [dummy], bestFit: dummy };
  }

  const linear = fitLinear(points);
  const quadratic = fitQuadratic(points);
  const cubic = fitCubic(points);
  const exponential = fitExponential(points);
  const sine = fitSine(points);
  const logarithmic = fitLogarithmic(points);
  const inverse = fitInverse(points);
  const gaussian = fitGaussian(points);

  const models: RegressionResult[] = [
    linear,
    quadratic,
    cubic,
    exponential,
    sine,
    logarithmic,
    inverse,
    gaussian,
  ];

  // Sort by R² descending, break ties with lower MSE
  models.sort((m1, m2) => {
    if (Math.abs(m2.r2 - m1.r2) > 0.01) {
      return m2.r2 - m1.r2;
    }
    return m1.mse - m2.mse;
  });

  // Assign ranks
  models.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  return {
    allModels: models,
    bestFit: models[0],
  };
}

/**
 * Quick Presets
 */
export const PRESET_CURVES: {
  id: string;
  name: string;
  category: string;
  description: string;
  model: ModelType;
  formulaLatex: string;
  generate: () => Point[];
}[] = [
  {
    id: 'parabola',
    name: 'Quadratic Parabola',
    category: 'Class-10 Polynomials',
    description: 'Standard parabola opening upward: y = 0.5x² - 2',
    model: 'quadratic',
    formulaLatex: 'y = 0.5x^2 - 2',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -4.5; x <= 4.5; x += 0.15) {
        const noise = (Math.random() - 0.5) * 0.12;
        pts.push({ x: Number(x.toFixed(2)), y: Number((0.5 * x * x - 2 + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'sine',
    name: 'Harmonic Wave',
    category: 'Class-10 Trigonometry',
    description: 'Oscillatory sine wave: y = 2.8 sin(0.9x)',
    model: 'sine',
    formulaLatex: 'y = 2.8\\sin(0.9x)',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -6.0; x <= 6.0; x += 0.15) {
        const noise = (Math.random() - 0.5) * 0.15;
        pts.push({ x: Number(x.toFixed(2)), y: Number((2.8 * Math.sin(0.9 * x) + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'linear',
    name: 'Linear Gradient',
    category: 'Coordinate Geometry',
    description: 'Constant slope line: y = 1.35x - 0.8',
    model: 'linear',
    formulaLatex: 'y = 1.35x - 0.8',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -5.0; x <= 5.0; x += 0.2) {
        const noise = (Math.random() - 0.5) * 0.18;
        pts.push({ x: Number(x.toFixed(2)), y: Number((1.35 * x - 0.8 + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'cubic',
    name: 'Cubic S-Curve',
    category: 'Higher Polynomials',
    description: 'S-inflection curve: y = 0.12x³ - 0.9x',
    model: 'cubic',
    formulaLatex: 'y = 0.12x^3 - 0.9x',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -4.0; x <= 4.0; x += 0.15) {
        const noise = (Math.random() - 0.5) * 0.12;
        pts.push({ x: Number(x.toFixed(2)), y: Number((0.12 * x * x * x - 0.9 * x + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'exponential',
    name: 'Exponential Growth',
    category: 'Exponential Dynamics',
    description: 'Compound ascent: y = 0.6 e^(0.38x) - 1.5',
    model: 'exponential',
    formulaLatex: 'y = 0.6e^{0.38x} - 1.5',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -5.0; x <= 4.2; x += 0.18) {
        const noise = (Math.random() - 0.5) * 0.15;
        pts.push({ x: Number(x.toFixed(2)), y: Number((0.6 * Math.exp(0.38 * x) - 1.5 + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'logarithmic',
    name: 'Logarithmic Curve',
    category: 'Logarithmic Functions',
    description: 'Rapid initial growth tapering off: y = 1.8 ln(x + 5.5) - 2.2',
    model: 'logarithmic',
    formulaLatex: 'y = 1.8\\ln(x + 5.5) - 2.2',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -5.0; x <= 5.0; x += 0.2) {
        const noise = (Math.random() - 0.5) * 0.12;
        pts.push({ x: Number(x.toFixed(2)), y: Number((1.8 * Math.log(x + 5.5) - 2.2 + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'inverse',
    name: 'Inverse Hyperbola',
    category: 'Boyle’s Law & Rational',
    description: 'Asymptotic inverse proportionality: y = 4/(x + 4.5) - 1.2',
    model: 'inverse',
    formulaLatex: 'y = \\frac{4}{x + 4.5} - 1.2',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -3.8; x <= 5.0; x += 0.18) {
        const noise = (Math.random() - 0.5) * 0.1;
        pts.push({ x: Number(x.toFixed(2)), y: Number((4 / (x + 4.5) - 1.2 + noise).toFixed(2)) });
      }
      return pts;
    },
  },
  {
    id: 'gaussian',
    name: 'Gaussian Bell Curve',
    category: 'Normal Distribution & Stats',
    description: 'Symmetric probability bell: y = 3.6 e^(-x² / 3.2)',
    model: 'gaussian',
    formulaLatex: 'y = 3.6e^{-\\frac{x^2}{3.2}}',
    generate: () => {
      const pts: Point[] = [];
      for (let x = -4.5; x <= 4.5; x += 0.15) {
        const noise = (Math.random() - 0.5) * 0.12;
        pts.push({ x: Number(x.toFixed(2)), y: Number((3.6 * Math.exp(-(x * x) / 3.2) + noise).toFixed(2)) });
      }
      return pts;
    },
  },
];
