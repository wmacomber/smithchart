import { useId } from 'react';
import { magnitude } from '../rf';
import { CHART_CENTER, CHART_RADIUS, CHART_SIZE } from './chartGeometry';
import type { SmithChartProps } from './chartTypes';
import { LoadMarker } from './LoadMarker';
import { SmithGrid } from './SmithGrid';
import { SmithLabels } from './SmithLabels';
import { MatchingLegend } from './MatchingLegend';
import { MatchingOverlay } from './MatchingOverlay';
import { matchingAnnotations } from './matchingGeometry';
import { useChartSize } from './useChartSize';
import { ChartEducationOverlay } from './ChartEducationOverlay';

const safeSvgId = (value: string): string => value.replace(/[^A-Za-z0-9_-]/g, '');

export function SmithChart({
  displayMode,
  density: densityMode = 'auto',
  accessibleTitle = 'Smith chart',
  accessibleDescription = 'Normalized reflection-coefficient chart. Positive imaginary values appear above the horizontal axis.',
  loadReflection,
  solutions,
  selectedSolution,
  solutionView = 'selected',
  termination = 'short',
  lengthUnit = 'm',
  matchStatus,
  snapLoadPointer = false,
  loadReadout,
  onLoadPreview,
  onLoadCommit,
  onLoadCancel,
  educationTarget,
  onEducationDismiss,
}: SmithChartProps) {
  const instanceId = safeSvgId(useId());
  const titleId = `smith-title-${instanceId}`;
  const descriptionId = `smith-description-${instanceId}`;
  const clipPathId = `smith-boundary-${instanceId}`;
  const markerIds = {
    A: `direction-arrow-a-${instanceId}`,
    B: `direction-arrow-b-${instanceId}`,
  } as const;
  const [chartRef, density] = useChartSize(densityMode);
  const selectedId = selectedSolution ?? 'A';
  const draggableLoad = Boolean(loadReflection && magnitude(loadReflection) <= 1 + 1e-12);
  const interactive = Boolean(
    draggableLoad && loadReadout && onLoadPreview && onLoadCommit && onLoadCancel,
  );

  const annotations = solutions ? matchingAnnotations(solutions, termination, lengthUnit) : [];

  return (
    <div
      className={`smith-chart-frame${educationTarget ? ` education-active education-${educationTarget}` : ''}`}
      data-education-chart
      tabIndex={educationTarget ? -1 : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && educationTarget) onEducationDismiss?.();
      }}
    >
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
        <title id={titleId}>
          {interactive ? `Interactive ${accessibleTitle}` : accessibleTitle}
        </title>
        <desc id={descriptionId}>{accessibleDescription}</desc>
        <defs>
          <clipPath id={clipPathId}>
            <circle cx={CHART_CENTER} cy={CHART_CENTER} r={CHART_RADIUS} />
          </clipPath>
          {(['A', 'B'] as const).map((id) => (
            <marker
              key={id}
              id={markerIds[id]}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                className={`direction-arrow solution-${id.toLowerCase()}`}
                d="M 0 0 L 10 5 L 0 10 z"
              />
            </marker>
          ))}
        </defs>
        <g data-layer="background" aria-hidden="true">
          <circle
            className="smith-background"
            cx={CHART_CENTER}
            cy={CHART_CENTER}
            r={CHART_RADIUS}
          />
        </g>
        <SmithGrid displayMode={displayMode} density={density} clipPathId={clipPathId} />
        <SmithLabels displayMode={displayMode} density={density} />
        {solutions && loadReflection ? (
          <MatchingOverlay
            loadReflection={loadReflection}
            solutions={solutions}
            selectedSolution={selectedId}
            solutionView={solutionView}
            density={density}
            markerIds={markerIds}
          />
        ) : (
          <>
            <g data-layer="swr-circle" aria-hidden="true">
              {matchStatus === 'matched' && (
                <circle cx={CHART_CENTER} cy={CHART_CENTER} r="0" className="swr-circle" />
              )}
            </g>
            <g data-layer="solution-paths" aria-hidden="true">
              {matchStatus === 'matched' && (
                <g className="center-match-marker">
                  <circle cx={CHART_CENTER} cy={CHART_CENTER} r="7" />
                  <path
                    d={`M ${CHART_CENTER - 10} ${CHART_CENTER} H ${CHART_CENTER + 10} M ${CHART_CENTER} ${CHART_CENTER - 10} V ${CHART_CENTER + 10}`}
                  />
                </g>
              )}
            </g>
          </>
        )}
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
        <g data-layer="interaction-overlay">
          {educationTarget && (
            <ChartEducationOverlay
              target={educationTarget}
              loadReflection={loadReflection}
              solutions={solutions}
              selectedSolution={selectedId}
            />
          )}
        </g>
        <circle
          data-layer="boundary"
          className="smith-boundary"
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={CHART_RADIUS}
          aria-hidden="true"
        />
      </svg>
      {solutions && <MatchingLegend compact={density === 'compact'} annotations={annotations} />}
      {educationTarget && (
        <button type="button" className="education-dismiss" onClick={onEducationDismiss}>
          Clear chart explanation
        </button>
      )}
    </div>
  );
}
