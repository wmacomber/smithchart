import { memo } from 'react';
import { getLabelLayout } from './labelLayout';
import type { ChartDisplayMode, GridDensity } from './chartTypes';

export const SmithLabels = memo(function SmithLabels({
  density,
  displayMode,
}: {
  readonly density: GridDensity;
  readonly displayMode: ChartDisplayMode;
}) {
  const labels = getLabelLayout(density, displayMode);
  return (
    <g className="smith-labels" data-layer="labels" aria-hidden="true">
      {labels.map((label) => (
        <text key={label.key} className={`smith-label label-${label.kind}`} x={label.x} y={label.y}>
          {label.text}
        </text>
      ))}
    </g>
  );
});
