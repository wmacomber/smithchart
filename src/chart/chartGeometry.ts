import type { Complex } from '../rf';
import { complex } from '../rf';
import type { ChartPoint } from './chartTypes';

export const CHART_SIZE = 400;
export const CHART_CENTER = 200;
export const CHART_RADIUS = 184;

export const reflectionToChartPoint = (reflection: Complex): ChartPoint => ({
  x: CHART_CENTER + reflection.re * CHART_RADIUS,
  y: CHART_CENTER - reflection.im * CHART_RADIUS,
});

export const chartPointToReflection = (point: ChartPoint): Complex => {
  const re = (point.x - CHART_CENTER) / CHART_RADIUS;
  const im = -(point.y - CHART_CENTER) / CHART_RADIUS;
  const length = Math.hypot(re, im);
  return length > 1 ? complex(re / length, im / length) : complex(re, im);
};

export const circleGeometry = (centerRe: number, centerIm: number, radius: number) => ({
  cx: CHART_CENTER + centerRe * CHART_RADIUS,
  cy: CHART_CENTER - centerIm * CHART_RADIUS,
  r: radius * CHART_RADIUS,
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
