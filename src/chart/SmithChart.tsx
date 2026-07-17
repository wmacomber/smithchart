import { useId, type CSSProperties } from 'react';
import { magnitude } from '../rf';
import { CHART_CENTER, CHART_RADIUS, CHART_SIZE, reflectionToChartPoint } from './chartGeometry';
import type { SmithChartProps } from './chartTypes';
import { LoadMarker } from './LoadMarker';
import { SmithGrid } from './SmithGrid';
import { SmithLabels } from './SmithLabels';
import { MatchingLegend } from './MatchingLegend';
import { MatchingOverlay } from './MatchingOverlay';
import { matchingAnnotations } from './matchingGeometry';
import { useChartSize } from './useChartSize';
import { ChartEducationOverlay } from './ChartEducationOverlay';
import { useChartInteraction } from './useChartInteraction';

const safeSvgId = (value: string): string => value.replace(/[^A-Za-z0-9_-]/g, '');
const noop = () => undefined;

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
  const instructionsId = `load-marker-instructions-${instanceId}`;
  const statusId = `load-marker-status-${instanceId}`;
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
  const markerReflection = loadReflection ?? { re: 0, im: 0 };
  const markerPoint = reflectionToChartPoint(markerReflection);
  const interaction = useChartInteraction({
    reflection: markerReflection,
    snapPointer: snapLoadPointer,
    onPreview: onLoadPreview ?? noop,
    onCommit: onLoadCommit ?? noop,
    onCancel: onLoadCancel ?? noop,
  });
  const markerMagnitude = Math.min(1, Math.hypot(markerReflection.re, markerReflection.im));
  const markerStyle = {
    '--marker-x': `${(markerPoint.x / CHART_SIZE) * 100}%`,
    '--marker-y': `${(markerPoint.y / CHART_SIZE) * 100}%`,
  } as CSSProperties;

  const annotations = solutions ? matchingAnnotations(solutions, termination, lengthUnit) : [];

  return (
    <div
      className={`smith-chart-frame${educationTarget ? ` education-active education-${educationTarget}` : ''}`}
      data-education-chart
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? `Interactive ${accessibleTitle}` : undefined}
      aria-describedby={interactive ? 'chart-description' : undefined}
      tabIndex={educationTarget ? -1 : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && educationTarget) onEducationDismiss?.();
      }}
    >
      <div
        className="smith-chart-stage"
        data-marker-active={interaction.activeSource !== null ? 'true' : undefined}
      >
        <svg
          ref={chartRef}
          className="smith-chart"
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
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
            {interactive && loadReflection && loadReadout && (
              <LoadMarker
                reflection={loadReflection}
                readout={loadReadout}
                tooltipVisible={interaction.tooltipVisible}
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
        {interactive && loadReadout && (
          <div className="marker-interaction-plane">
            <div
              className="marker-hit-target"
              style={markerStyle}
              role="slider"
              tabIndex={0}
              aria-label="Load marker"
              aria-describedby={`${instructionsId} ${statusId}`}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={Number(markerMagnitude.toFixed(4))}
              aria-valuetext={loadReadout.accessibleText}
              data-active={interaction.activeSource !== null ? 'true' : undefined}
              onKeyDown={interaction.onKeyDown}
              onPointerDown={interaction.onPointerDown}
              onPointerMove={interaction.onPointerMove}
              onPointerUp={interaction.onPointerUp}
              onPointerCancel={interaction.onPointerCancel}
              onLostPointerCapture={interaction.onLostPointerCapture}
              onPointerEnter={interaction.onPointerEnter}
              onPointerLeave={interaction.onPointerLeave}
              onFocus={interaction.onFocus}
              onBlur={interaction.onBlur}
            />
          </div>
        )}
      </div>
      {interactive && (
        <>
          <span id={instructionsId} className="sr-only">
            Use arrow keys for fine movement, Shift plus arrow keys for coarse movement, Enter to
            commit, and Escape to cancel.
          </span>
          <span id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
            {interaction.announcement}
          </span>
        </>
      )}
      {solutions && <MatchingLegend compact={density === 'compact'} annotations={annotations} />}
      {educationTarget && (
        <button type="button" className="education-dismiss" onClick={onEducationDismiss}>
          Clear chart explanation
        </button>
      )}
    </div>
  );
}
