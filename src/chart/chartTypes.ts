import type { Complex, StubMatchSolution } from '../rf';

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
}

export interface SmithChartProps {
  readonly loadReflection: Complex;
  readonly solutions?: readonly [StubMatchSolution, StubMatchSolution];
  readonly selectedSolution?: 'A' | 'B';
  readonly displayMode: 'impedance' | 'admittance' | 'both';
  readonly onLoadPreview: (reflection: Complex) => void;
  readonly onLoadCommit: (reflection: Complex) => void;
  readonly onLoadCancel: () => void;
}
