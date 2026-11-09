export type EquationType = 'cartesian' | 'parametric' | 'polar' | 'implicit' | 'piecewise' | 'surface3d';

export interface Equation {
  id: string;
  expression: string;         // e.g. "y = sin(a * x) + b" or "x^2 + y^2 = 25"
  type: EquationType;
  color: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  parametricY?: string;       // for parametric: x(t) in expression, y(t) here
  parametricZ?: string;       // for 3D parametric: z(t)
  domain?: {
    min: number;
    max: number;
    step?: number;
  };
  domainY?: {
    min: number;
    max: number;
  };
  error?: string;
  label?: string;
  isInequality?: boolean;
  inequalityOp?: '<' | '<=' | '>' | '>=';
  fillColor?: string;
}

export interface SliderVar {
  variable: string;
  min: number;
  max: number;
  step: number;
  value: number;
  isPlaying: boolean;
  speed: number;             // multiplier: 0.5x, 1x, 2x
  direction: 1 | -1;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Contour {
  id: number;
  points: Point2D[];
  simplified: Point2D[];
  closed: boolean;
  length: number;
  color: string;
}

export interface ImageProcessingConfig {
  grayscale: boolean;
  blurRadius: number;        // 0 to 5
  edgeThresholdLow: number;  // 0 to 255
  edgeThresholdHigh: number; // 0 to 255
  binaryThreshold: number;   // 0 to 255
  invert: boolean;
  simplifyTolerance: number; // 0.5 to 10 pixels
  minContourLength: number;  // min points to keep
  maxContours: number;       // limit contours
  fitMethod: 'parametric_fourier' | 'polynomial' | 'spline' | 'cartesian_multi';
  fourierHarmonics: number;  // 1 to 50
  polynomialDegree: number;  // 1 to 9
  scale: number;             // math coordinate scale (e.g. -10 to 10)
  centerOrigin: boolean;
}

export interface Viewport2D {
  centerX: number;
  centerY: number;
  zoom: number;              // pixels per mathematical unit
  showGrid: boolean;
  showAxes: boolean;
  gridType: 'cartesian' | 'polar';
  showLabels: boolean;
  snapToGrid: boolean;
}

export interface SavedProject {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  equations: Equation[];
  sliders: SliderVar[];
  viewport: Viewport2D;
}

