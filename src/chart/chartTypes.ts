import type { Complex, StubMatchSolution } from '../rf';
import type { ChartEducationTarget } from '../features/tutorial/topics';

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
}

export type ChartDisplayMode = 'impedance' | 'admittance' | 'both';
export type SolutionView = 'selected' | 'overlay';
export type ChartLengthUnit = 'm' | 'cm' | 'ft' | 'in';
export type GridDensity = 'compact' | 'regular' | 'dense';
export type ChartDisplayDensity = GridDensity;
export type GridDensityMode = 'auto' | GridDensity;

export interface ChartCircle {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export interface ChartArc {
  readonly center: ChartPoint;
  readonly radius: number;
  readonly start: ChartPoint;
  readonly end: ChartPoint;
  readonly largeArc: 0;
  readonly sweep: 0 | 1;
  readonly path: string;
}

export interface PositionedLabel {
  readonly key: string;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly kind: 'special' | 'primary' | 'secondary';
}

export interface LoadMarkerReadout {
  readonly impedanceText: string;
  readonly reflectionText: string;
  readonly accessibleText: string;
}

export interface SmithChartProps {
  readonly displayMode: ChartDisplayMode;
  readonly density?: GridDensityMode;
  readonly accessibleTitle?: string;
  readonly accessibleDescription?: string;
  readonly loadReflection?: Complex;
  readonly solutions?: readonly [StubMatchSolution, StubMatchSolution];
  readonly selectedSolution?: 'A' | 'B';
  readonly solutionView?: SolutionView;
  readonly termination?: 'open' | 'short';
  readonly lengthUnit?: ChartLengthUnit;
  readonly matchStatus?:
    'solved' | 'matched' | 'no-passive-solution' | 'invalid-input' | 'numerical-failure';
  readonly snapLoadPointer?: boolean;
  readonly loadReadout?: LoadMarkerReadout;
  readonly onLoadPreview?: (reflection: Complex) => void;
  readonly onLoadCommit?: (reflection: Complex) => void;
  readonly onLoadCancel?: () => void;
  readonly educationTarget?: ChartEducationTarget | null;
  readonly onEducationDismiss?: () => void;
}
