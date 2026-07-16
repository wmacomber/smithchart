import {
  admittanceToReflection,
  complex,
  impedanceToReflection,
  type Complex,
  type StubMatchSolution,
  type StubTermination,
} from '../rf';
import { arcPath, CHART_CENTER, reflectionToChartPoint } from './chartGeometry';
import type { ChartLengthUnit, ChartPoint } from './chartTypes';

export interface MatchingSolutionGeometry {
  readonly junctionReflection: Complex;
  readonly junctionPoint: ChartPoint;
  readonly feedPath: string;
  readonly feedSweepRadians: number;
  readonly feedLabelPoint: ChartPoint;
  readonly stubPoints: readonly ChartPoint[];
  readonly stubLabelPoint: ChartPoint;
}

const formatLength = (meters: number, unit: ChartLengthUnit): string => {
  if (unit === 'm') return `${meters.toFixed(3)} m`;
  if (unit === 'cm') return `${(meters * 100).toFixed(1)} cm`;
  if (unit === 'ft') return `${(meters / 0.3048).toFixed(2)} ft`;
  return `${((meters / 0.3048) * 12).toFixed(1)} in`;
};

export function matchingAnnotations(
  solutions: readonly [StubMatchSolution, StubMatchSolution],
  termination: StubTermination,
  lengthUnit: ChartLengthUnit,
) {
  return solutions.map((solution) => ({
    id: solution.id,
    feed: `${solution.id} · ${solution.feedlineDistanceDegrees.toFixed(2)}° · ${solution.feedlineDistanceWavelengths.toFixed(5)} λ · ${formatLength(solution.feedlineDistanceMeters, lengthUnit)}`,
    stub: `${termination} · ${solution.stubElectricalDegrees.toFixed(2)}° · ${solution.stubLengthWavelengths.toFixed(5)} λ · ${formatLength(solution.stubLengthMeters, lengthUnit)}`,
  }));
}

const rotateClockwise = (value: Complex, radians: number): Complex => {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return complex(value.re * cosine + value.im * sine, value.im * cosine - value.re * sine);
};

const offsetFromCenter = (point: ChartPoint, distance: number): ChartPoint => {
  const dx = point.x - CHART_CENTER;
  const dy = point.y - CHART_CENTER;
  const length = Math.hypot(dx, dy) || 1;
  return { x: point.x + (dx / length) * distance, y: point.y + (dy / length) * distance };
};

export function matchingSolutionGeometry(
  loadReflection: Complex,
  solution: StubMatchSolution,
): MatchingSolutionGeometry {
  const junctionReflection = impedanceToReflection(solution.junctionNormalizedImpedance);
  const junctionPoint = reflectionToChartPoint(junctionReflection);
  const feedSweepRadians = 4 * Math.PI * solution.feedlineDistanceWavelengths;
  const feedMidpoint = reflectionToChartPoint(
    rotateClockwise(loadReflection, feedSweepRadians / 2),
  );
  const startB = solution.junctionNormalizedAdmittance.im;
  const stubPoints = Array.from({ length: 33 }, (_, index) => {
    const b = startB * (1 - index / 32);
    return reflectionToChartPoint(admittanceToReflection(complex(1, b)));
  });
  const stubMidpoint = stubPoints[Math.floor(stubPoints.length / 2)]!;

  return {
    junctionReflection,
    junctionPoint,
    feedPath: arcPath(
      loadReflection,
      junctionReflection,
      Math.hypot(loadReflection.re, loadReflection.im),
      true,
    ),
    feedSweepRadians,
    feedLabelPoint: offsetFromCenter(feedMidpoint, 16),
    stubPoints,
    stubLabelPoint: offsetFromCenter(stubMidpoint, -18),
  };
}

export function separateNearbyLabels(
  first: ChartPoint,
  second: ChartPoint,
  minimumDistance = 34,
): readonly [ChartPoint, ChartPoint] {
  if (Math.hypot(first.x - second.x, first.y - second.y) >= minimumDistance) {
    return [first, second];
  }
  return [
    { x: first.x, y: first.y - 12 },
    { x: second.x, y: second.y + 12 },
  ];
}
