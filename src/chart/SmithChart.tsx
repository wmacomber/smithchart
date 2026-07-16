import { useId } from 'react';
import { magnitude } from '../rf';
import { CHART_CENTER, CHART_RADIUS, CHART_SIZE } from './chartGeometry';
import type { SmithChartProps } from './chartTypes';
import { LoadMarker } from './LoadMarker';
import { SmithGrid } from './SmithGrid';
import { SmithLabels } from './SmithLabels';
import { StubPath } from './StubPath';
import { TransformationPath } from './TransformationPath';
import { useChartSize } from './useChartSize';

const safeSvgId = (value: string): string => value.replace(/[^A-Za-z0-9_-]/g, '');

export function SmithChart({
  displayMode,
  density: densityMode = 'auto',
  accessibleTitle = 'Smith chart',
  accessibleDescription = 'Normalized reflection-coefficient chart. Positive imaginary values appear above the horizontal axis.',
  loadReflection,
  solutions,
  selectedSolution,
  snapLoadPointer = false,
  loadReadout,
  onLoadPreview,
  onLoadCommit,
  onLoadCancel,
}: SmithChartProps) {
  const instanceId = safeSvgId(useId());
  const titleId = `smith-title-${instanceId}`;
  const descriptionId = `smith-description-${instanceId}`;
  const clipPathId = `smith-boundary-${instanceId}`;
  const markerId = `direction-arrow-${instanceId}`;
  const [chartRef, density] = useChartSize(densityMode);
  const selected = solutions?.find((solution) => solution.id === selectedSolution);
  const draggableLoad = Boolean(loadReflection && magnitude(loadReflection) <= 1 + 1e-12);
  const interactive = Boolean(
    draggableLoad && loadReadout && onLoadPreview && onLoadCommit && onLoadCancel,
  );

  return (
    <svg
      ref={chartRef}
      className="smith-chart"
      viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
      role={interactive ? 'group' : 'img'}
      aria-labelledby={titleId}
      aria-describedby={interactive ? `${descriptionId} chart-description` : descriptionId}
      data-export-chart
      data-density={density}
      data-display-mode={displayMode}
      data-chart-theme="current"
    >
      <title id={titleId}>{interactive ? `Interactive ${accessibleTitle}` : accessibleTitle}</title>
      <desc id={descriptionId}>{accessibleDescription}</desc>
      <defs>
        <clipPath id={clipPathId}>
          <circle cx={CHART_CENTER} cy={CHART_CENTER} r={CHART_RADIUS} />
        </clipPath>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path className="direction-arrow" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g data-layer="background" aria-hidden="true">
        <circle className="smith-background" cx={CHART_CENTER} cy={CHART_CENTER} r={CHART_RADIUS} />
      </g>
      <SmithGrid displayMode={displayMode} density={density} clipPathId={clipPathId} />
      <SmithLabels displayMode={displayMode} density={density} />
      <g data-layer="swr-circle" aria-hidden="true">
        {selected && loadReflection && (
          <circle
            cx={CHART_CENTER}
            cy={CHART_CENTER}
            r={magnitude(loadReflection) * CHART_RADIUS}
            className="swr-circle"
          />
        )}
      </g>
      <g data-layer="solution-paths" aria-hidden="true">
        {selected && loadReflection && (
          <g key={selected.id}>
            <TransformationPath load={loadReflection} solution={selected} markerId={markerId} />
            <StubPath solution={selected} />
          </g>
        )}
      </g>
      <g data-layer="markers">
        {interactive &&
          loadReflection &&
          loadReadout &&
          onLoadPreview &&
          onLoadCommit &&
          onLoadCancel && (
            <LoadMarker
              reflection={loadReflection}
              readout={loadReadout}
              snapPointer={snapLoadPointer}
              onPreview={onLoadPreview}
              onCommit={onLoadCommit}
              onCancel={onLoadCancel}
            />
          )}
      </g>
      <g data-layer="interaction-overlay" />
      <circle
        data-layer="boundary"
        className="smith-boundary"
        cx={CHART_CENTER}
        cy={CHART_CENTER}
        r={CHART_RADIUS}
        aria-hidden="true"
      />
    </svg>
  );
}
