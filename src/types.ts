export interface Point {
  x: number;
  y: number;
}

export interface ScreenPoint {
  px: number;
  py: number;
}

export type ModelType =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'exponential'
  | 'logarithmic'
  | 'sine'
  | 'inverse'
  | 'gaussian';

export interface RegressionResult {
  modelType: ModelType;
  name: string;
  formulaLatex: string;
  formulaPlain: string;
  desmosString: string;
  parameters: Record<string, number>;
  evaluate: (x: number) => number;
  r2: number; // 0 to 100
  mse: number;
  rmse: number;
  rank?: number;
  description: string;
  color: string;
  matrixFormulaLatex: string;
}

export interface PresetCurve {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedModel: ModelType;
  formulaLatex: string;
  generatePoints: (bounds: { minX: number; maxX: number; step: number }) => Point[];
}

export interface CanvasTransform {
  width: number;
  height: number;
  originX: number;
  originY: number;
  scaleX: number; // pixels per Cartesian unit
  scaleY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
