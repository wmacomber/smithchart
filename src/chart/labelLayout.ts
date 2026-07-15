import { complex } from '../rf';
import {
  CHART_CENTER,
  CHART_SIZE,
  reactanceBoundaryReflection,
  reflectionToChartPoint,
  rotateChartPoint180,
} from './chartGeometry';
import { GRID_DEFINITIONS } from './gridDefinitions';
import type { ChartDisplayMode, ChartPoint, GridDensity, PositionedLabel } from './chartTypes';

const FONT_SIZE = 11;
const BOX_PADDING = 3;
const SAFE_INSET = 4;

interface LabelCandidate {
  readonly key: string;
  readonly text: string;
  readonly priority: number;
  readonly positions: readonly ChartPoint[];
  readonly kind: PositionedLabel['kind'];
}

export interface LabelBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

const textDimensions = (text: string) => ({
  width: 0.62 * FONT_SIZE * text.length,
  height: 1.2 * FONT_SIZE,
});

export const labelBounds = (label: PositionedLabel): LabelBounds => ({
  left: label.x - label.width / 2 - BOX_PADDING,
  right: label.x + label.width / 2 + BOX_PADDING,
  top: label.y - label.height * 0.78 - BOX_PADDING,
  bottom: label.y + label.height * 0.22 + BOX_PADDING,
});

const boundsOverlap = (a: LabelBounds, b: LabelBounds): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const labelsOverlap = (a: PositionedLabel, b: PositionedLabel): boolean =>
  boundsOverlap(labelBounds(a), labelBounds(b));

const isWithinSafeArea = (bounds: LabelBounds): boolean =>
  bounds.left >= SAFE_INSET &&
  bounds.right <= CHART_SIZE - SAFE_INSET &&
  bounds.top >= SAFE_INSET &&
  bounds.bottom <= CHART_SIZE - SAFE_INSET;

const formatValue = (value: number): string => value.toString();

const resistancePosition = (value: number, rotated: boolean): ChartPoint => {
  const reflection = complex((value - 1) / (value + 1), 0);
  const point = reflectionToChartPoint(reflection);
  return rotated ? rotateChartPoint180(point) : point;
};

const reactancePosition = (value: number, rotated: boolean): ChartPoint => {
  const point = reflectionToChartPoint(reactanceBoundaryReflection(value));
  return rotated ? rotateChartPoint180(point) : point;
};

const inwardPositions = (point: ChartPoint, distance = 14): readonly ChartPoint[] => {
  const dx = CHART_CENTER - point.x;
  const dy = CHART_CENTER - point.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = dx / length;
  const ny = dy / length;
  const tx = -ny;
  const ty = nx;
  return [
    { x: point.x + nx * distance, y: point.y + ny * distance + FONT_SIZE * 0.35 },
    {
      x: point.x + nx * (distance + 7) + tx * 8,
      y: point.y + ny * (distance + 7) + ty * 8 + FONT_SIZE * 0.35,
    },
    {
      x: point.x + nx * (distance + 7) - tx * 8,
      y: point.y + ny * (distance + 7) - ty * 8 + FONT_SIZE * 0.35,
    },
  ];
};

const specialCandidates = (displayMode: ChartDisplayMode): readonly LabelCandidate[] => {
  const symbols =
    displayMode === 'admittance'
      ? [
          { key: 'imag-top', text: '−jB', x: 244, y: 27 },
          { key: 'imag-bottom', text: '+jB', x: 244, y: 384 },
        ]
      : [
          { key: 'imag-top', text: '+jX', x: 244, y: 27 },
          { key: 'imag-bottom', text: '−jX', x: 244, y: 384 },
        ];
  return [
    { key: 'match', text: 'match', x: 200, y: 195 },
    { key: 'open', text: 'open', x: 361, y: 195 },
    { key: 'short', text: 'short', x: 39, y: 195 },
    ...symbols,
  ].map(({ key, text, x, y }) => ({
    key,
    text,
    priority: 100,
    positions: [{ x, y }],
    kind: 'special' as const,
  }));
};

const numericCandidates = (
  density: GridDensity,
  kind: 'impedance' | 'admittance',
  secondary: boolean,
  unityOnly: boolean,
): readonly LabelCandidate[] => {
  const definition = GRID_DEFINITIONS[density];
  const rotated = kind === 'admittance';
  const prefixR = rotated ? 'g=' : 'r=';
  const prefixX = rotated ? 'jb' : 'jx';
  const candidateKind: PositionedLabel['kind'] = secondary ? 'secondary' : 'primary';
  const resistanceValues = unityOnly ? [1] : definition.resistances;
  const reactanceValues = unityOnly ? [1] : definition.reactances;
  const resistance = resistanceValues.map((value) => {
    const point = resistancePosition(value, rotated);
    return {
      key: `${kind}-r-${value}`,
      text: `${prefixR}${formatValue(value)}`,
      priority: secondary ? 30 : value === 1 ? 90 : 60,
      positions: secondary
        ? [
            { x: point.x, y: point.y + 31 },
            { x: point.x + 27, y: point.y + 25 },
            { x: point.x - 27, y: point.y - 19 },
          ]
        : [
            { x: point.x, y: point.y + 16 },
            { x: point.x, y: point.y - 9 },
          ],
      kind: candidateKind,
    } satisfies LabelCandidate;
  });
  const reactance = reactanceValues.flatMap((magnitude) =>
    [magnitude, -magnitude].map((value) => ({
      key: `${kind}-x-${value}`,
      text: `${value > 0 ? '+' : '−'}${prefixX}${formatValue(magnitude)}`,
      priority: secondary ? 30 : magnitude === 1 ? 90 : Number.isInteger(magnitude) ? 80 : 60,
      positions: inwardPositions(reactancePosition(value, rotated), secondary ? 30 : 14),
      kind: candidateKind,
    })),
  );
  return [...resistance, ...reactance];
};

const cache = new Map<string, readonly PositionedLabel[]>();

export const getLabelLayout = (
  density: GridDensity,
  displayMode: ChartDisplayMode,
): readonly PositionedLabel[] => {
  const cacheKey = `${density}:${displayMode}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const candidates: LabelCandidate[] = [...specialCandidates(displayMode)];
  if (displayMode !== 'admittance') {
    candidates.push(...numericCandidates(density, 'impedance', false, false));
  }
  if (displayMode === 'admittance') {
    candidates.push(...numericCandidates(density, 'admittance', false, false));
  } else if (displayMode === 'both' && density !== 'compact') {
    candidates.push(...numericCandidates(density, 'admittance', true, true));
  }
  candidates.sort((a, b) => b.priority - a.priority || a.key.localeCompare(b.key));

  const accepted: PositionedLabel[] = [];
  for (const candidate of candidates) {
    const dimensions = textDimensions(candidate.text);
    const position = candidate.positions.find((option) => {
      const label: PositionedLabel = { ...candidate, ...dimensions, ...option };
      const bounds = labelBounds(label);
      return isWithinSafeArea(bounds) && accepted.every((other) => !labelsOverlap(label, other));
    });
    if (position) {
      accepted.push(
        Object.freeze({
          key: candidate.key,
          text: candidate.text,
          x: position.x,
          y: position.y,
          ...dimensions,
          kind: candidate.kind,
        }),
      );
    }
  }
  const result = Object.freeze(accepted);
  cache.set(cacheKey, result);
  return result;
};

export const CHART_LABEL_FONT_SIZE = FONT_SIZE;
export const CHART_LABEL_SAFE_INSET = SAFE_INSET;
