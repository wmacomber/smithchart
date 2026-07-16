import type { LengthUnit } from '../../app/workspaceTypes';

const METERS_PER_FOOT = 0.3048;

export function formatLength(meters: number, unit: LengthUnit): string {
  switch (unit) {
    case 'm':
      return `${meters.toFixed(3)} m`;
    case 'cm':
      return `${(meters * 100).toFixed(1)} cm`;
    case 'ft':
      return `${(meters / METERS_PER_FOOT).toFixed(2)} ft`;
    case 'in':
      return `${((meters / METERS_PER_FOOT) * 12).toFixed(1)} in`;
  }
}
