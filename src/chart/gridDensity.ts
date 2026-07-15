import type { GridDensity, GridDensityMode } from './chartTypes';

export const gridDensityForWidth = (width: number | null | undefined): GridDensity => {
  if (width == null || !Number.isFinite(width) || width <= 0) return 'regular';
  if (width < 360) return 'compact';
  if (width < 560) return 'regular';
  return 'dense';
};

export const resolveGridDensity = (
  mode: GridDensityMode,
  width: number | null | undefined,
): GridDensity => (mode === 'auto' ? gridDensityForWidth(width) : mode);

export const lowerGridDensity = (density: GridDensity): GridDensity =>
  density === 'dense' ? 'regular' : 'compact';
