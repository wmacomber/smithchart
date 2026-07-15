import type { Complex } from '../rf';
import { complex } from '../rf';
import type { ChartArc, ChartCircle, ChartPoint } from './chartTypes';

export const CHART_SIZE = 400;
export const CHART_CENTER = 200;
export const CHART_RADIUS = 184;

export const reflectionToChartPoint = (reflection: Complex): ChartPoint => ({
  x: CHART_CENTER + reflection.re * CHART_RADIUS,
  y: CHART_CENTER - reflection.im * CHART_RADIUS,
});

export const chartPointToReflection = (point: ChartPoint): Complex => {
  const imaginary = -(point.y - CHART_CENTER) / CHART_RADIUS;
  return complex((point.x - CHART_CENTER) / CHART_RADIUS, imaginary === 0 ? 0 : imaginary);
};

export const clampReflectionToUnitDisk = (reflection: Complex): Complex => {
  const length = Math.hypot(reflection.re, reflection.im);
  return length > 1 ? complex(reflection.re / length, reflection.im / length) : reflection;
};

export const circleGeometry = (
  centerRe: number,
  centerIm: number,
  radius: number,
): ChartCircle => ({
  cx: CHART_CENTER + centerRe * CHART_RADIUS,
  cy: CHART_CENTER - centerIm * CHART_RADIUS,
  r: radius * CHART_RADIUS,
});

export const resistanceCircle = (resistance: number): ChartCircle => {
  if (resistance < 0 || Number.isNaN(resistance)) {
    throw new RangeError('Resistance must be non-negative.');
  }
  if (!Number.isFinite(resistance)) {
    return { cx: CHART_CENTER + CHART_RADIUS, cy: CHART_CENTER, r: 0 };
  }
  return circleGeometry(resistance / (resistance + 1), 0, 1 / (resistance + 1));
};

export const reactanceBoundaryReflection = (reactance: number): Complex => {
  if (!Number.isFinite(reactance) || reactance === 0) {
    throw new RangeError('Reactance must be finite and non-zero.');
  }
  const square = reactance * reactance;
  return complex((square - 1) / (square + 1), (2 * reactance) / (square + 1));
};

const pathNumber = (value: number): string => Number(value.toFixed(12)).toString();

export const reactanceArc = (reactance: number): ChartArc => {
  const boundary = reactanceBoundaryReflection(reactance);
  const center = reflectionToChartPoint(complex(1, 1 / reactance));
  const start = reflectionToChartPoint(boundary);
  const end = reflectionToChartPoint(complex(1, 0));
  const radius = CHART_RADIUS / Math.abs(reactance);
  const sweep = reactance > 0 ? 0 : 1;
  return {
    center,
    radius,
    start,
    end,
    largeArc: 0,
    sweep,
    path: `M ${pathNumber(start.x)} ${pathNumber(start.y)} A ${pathNumber(radius)} ${pathNumber(radius)} 0 0 ${sweep} ${pathNumber(end.x)} ${pathNumber(end.y)}`,
  };
};

export const rotateReflection180 = (reflection: Complex): Complex =>
  complex(-reflection.re, -reflection.im);

export const rotateChartPoint180 = (point: ChartPoint): ChartPoint => ({
  x: 2 * CHART_CENTER - point.x,
  y: 2 * CHART_CENTER - point.y,
});

export const arcPath = (start: Complex, end: Complex, radius: number, clockwise = true): string => {
  const a = reflectionToChartPoint(start);
  const b = reflectionToChartPoint(end);
  const startAngle = Math.atan2(start.im, start.re);
  const endAngle = Math.atan2(end.im, end.re);
  const delta = clockwise
    ? (((startAngle - endAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    : (((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const large = delta > Math.PI ? 1 : 0;
  return `M ${a.x} ${a.y} A ${radius * CHART_RADIUS} ${radius * CHART_RADIUS} 0 ${large} 1 ${b.x} ${b.y}`;
};
