import type { GridDensity } from './chartTypes';

export interface GridDefinition {
  readonly resistances: readonly number[];
  readonly reactances: readonly number[];
}

export const GRID_DEFINITIONS: Readonly<Record<GridDensity, GridDefinition>> = Object.freeze({
  compact: Object.freeze({
    resistances: Object.freeze([0.5, 1, 2, 5]),
    reactances: Object.freeze([0.5, 1, 2, 5]),
  }),
  regular: Object.freeze({
    resistances: Object.freeze([0.2, 0.5, 1, 2, 5]),
    reactances: Object.freeze([0.2, 0.5, 1, 2, 5]),
  }),
  dense: Object.freeze({
    resistances: Object.freeze([0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10]),
    reactances: Object.freeze([0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10]),
  }),
});

export const isMajorGridValue = (value: number): boolean => value === 1;
