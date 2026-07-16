import type { Complex } from '../rf';
import { complex } from '../rf';
import { CHART_SIZE, chartPointToReflection, clampReflectionToUnitDisk } from './chartGeometry';
import type { ChartPoint } from './chartTypes';

export interface ClientPoint {
  readonly x: number;
  readonly y: number;
}

export interface ClientBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type ReflectionMoveDirection = 'left' | 'right' | 'up' | 'down';

export function clientPointToChartPoint(
  client: ClientPoint,
  bounds: ClientBounds,
): ChartPoint | null {
  if (
    ![client.x, client.y, bounds.left, bounds.top, bounds.width, bounds.height].every(
      Number.isFinite,
    ) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  )
    return null;

  const scale = Math.min(bounds.width / CHART_SIZE, bounds.height / CHART_SIZE);
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const renderedWidth = CHART_SIZE * scale;
  const renderedHeight = CHART_SIZE * scale;
  const offsetX = bounds.left + (bounds.width - renderedWidth) / 2;
  const offsetY = bounds.top + (bounds.height - renderedHeight) / 2;
  return {
    x: (client.x - offsetX) / scale,
    y: (client.y - offsetY) / scale,
  };
}

export function clientPointToReflection(client: ClientPoint, bounds: ClientBounds): Complex | null {
  const point = clientPointToChartPoint(client, bounds);
  return point ? chartPointToReflection(point) : null;
}

export function constrainReflection(reflection: Complex, snapPointer: boolean): Complex {
  if (!snapPointer) return clampReflectionToUnitDisk(reflection);
  const step = 0.02;
  return clampReflectionToUnitDisk(
    complex(Math.round(reflection.re / step) * step, Math.round(reflection.im / step) * step),
  );
}

export function moveReflection(
  reflection: Complex,
  direction: ReflectionMoveDirection,
  step: number,
): Complex {
  const deltas: Record<ReflectionMoveDirection, Complex> = {
    left: complex(-step, 0),
    right: complex(step, 0),
    up: complex(0, step),
    down: complex(0, -step),
  };
  const delta = deltas[direction];
  return clampReflectionToUnitDisk(complex(reflection.re + delta.re, reflection.im + delta.im));
}
